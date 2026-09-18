#!/usr/bin/env python3
"""Produce the Ordomata coding-worker artifacts for one falsifier-watch launch.

The agent host refuses to start a Claude worker without an accepted Run Card
that reproduces the exact launch. This script builds the four inputs that
gate needs -- capacity evidence, classification, Run Card, review -- using
Ordomata's own library and CLI so the shapes cannot drift from what the gate
re-derives, and prints the model and effort the card selected so the runner
passes the same values to agent-run.

It writes only under the artifact directory it is given, never into the
repository: agent-run refuses a dirty checkout, by design.

Usage: gate.py <ordomata-src> <artifact-dir> <repo> <task-id> <prompt-file> <context-file>
"""

import json
import subprocess
import sys
import time
from pathlib import Path

ORDOMATA_SRC, ART, REPO, TASK_ID, PROMPT_FILE, CONTEXT_FILE = sys.argv[1:7]
sys.path.insert(0, str(Path(ORDOMATA_SRC) / "src"))

from ordomata.coding_worker_capacity import (  # noqa: E402
    capacity_evidence_from_preflight_projection,
)
from ordomata.coding_worker_policy import digest_task_text  # noqa: E402
from ordomata.coding_worker_recommendation import (  # noqa: E402
    classification_from_mapping,
)

art = Path(ART)
art.mkdir(parents=True, exist_ok=True)
repo = Path(REPO)
prompt = Path(PROMPT_FILE).read_text(encoding="utf-8")
context = Path(CONTEXT_FILE).read_text(encoding="utf-8")
base_commit = subprocess.check_output(
    ["git", "-C", str(repo), "rev-parse", "HEAD"], text=True
).strip()


def cli(*args: str) -> subprocess.CompletedProcess:
    return subprocess.run(
        [sys.executable, "-m", "ordomata", "--project-root", ORDOMATA_SRC, *args],
        env={"PYTHONPATH": str(Path(ORDOMATA_SRC) / "src"), "PATH": "/usr/bin:/bin"},
        text=True,
        capture_output=True,
    )


# 1. Capacity: the operator's preflight, adapted. Fifteen minutes is the
#    policy ceiling; five leaves room for recommend, review and launch.
projection = json.loads(
    subprocess.check_output(
        [
            str(Path.home() / ".local/bin/claude-subscription-preflight"),
            "--max-session-percent",
            "80",
            "--max-weekly-percent",
            "80",
        ],
        text=True,
    )
)
(art / "capacity.json").write_text(
    json.dumps(
        capacity_evidence_from_preflight_projection(
            projection,
            harness_id="claude",
            configured_models=("claude-fable-5", "opus", "sonnet"),
            captured_at=time.time(),
            valid_for_seconds=300.0,
        ),
        indent=2,
        sort_keys=True,
    ),
    encoding="utf-8",
)

# 2. Classification. The ordinals are the operator's decision, made once here
#    under review rather than weekly by a script pretending to be a manager:
#    research and prose, no code change, untrusted input read but nothing
#    written except issues, which are editable. Security sensitivity 1 and
#    irreversibility 1 keep it standard-risk, so deterministic manager policy
#    may accept it. Raise either to 2 and every launch needs a named human.
classification = {
    "binding": {
        "task_id": TASK_ID,
        "repository_id": repo.name,
        "base_commit": base_commit,
        "prompt_digest": digest_task_text("prompt", prompt),
        "context_digest": digest_task_text("context", context),
    },
    "task_kind": "documentation",
    "role": "technical_writer",
    "security_sensitivity": 1,
    "architectural_complexity": 0,
    "implementation_scope": 1,
    "ambiguity": 2,
    "context_depth": 2,
    "verification_burden": 2,
    "irreversibility": 1,
    # The catalog's vocabulary, not the task's: what the watch needs from a
    # worker is the repository in context, an isolated worktree and reasoning
    # over evidence. Web and gh access are the host's to grant, not a
    # candidate's capability.
    "required_capabilities": [
        "isolated_worktree",
        "repository_context",
        "structured_reasoning",
    ],
    "permission_ceiling": 1,
    "max_autonomy": "full",
    "required_billing_lane": "subscription_included",
}
classification_from_mapping(classification)  # fail here, not at the gate
(art / "classification.json").write_text(
    json.dumps(classification, indent=2, sort_keys=True), encoding="utf-8"
)

# 3. Recommend, then record the deterministic review.
for step, args in (
    (
        "recommend",
        (
            "coding-worker",
            "recommend",
            "--classification",
            str(art / "classification.json"),
            "--capacity-evidence",
            str(art / "capacity.json"),
            "--out",
            str(art / "run-card.json"),
        ),
    ),
    (
        "review",
        (
            "coding-worker",
            "review",
            "--run-card",
            str(art / "run-card.json"),
            "--decision",
            "accepted",
            "--mode",
            "deterministic_manager_policy",
            "--out",
            str(art / "review.json"),
        ),
    ),
):
    result = cli(*args)
    if result.returncode != 0:
        sys.stderr.write(f"gate: {step} refused\n{result.stdout}{result.stderr}")
        sys.exit(2)

card = json.loads((art / "run-card.json").read_text(encoding="utf-8"))
sel = card["selection"]
print(f"MODEL={sel['model_id']}\nEFFORT={sel['effort']}\nAUTONOMY={sel['autonomy']}")
