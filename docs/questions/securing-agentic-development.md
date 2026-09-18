---
title: What does security look like when the developer is partly an agent?
status: working-answer
updated: 2026-09-18
---

## Question

Coding agents read untrusted web content, hold credentials, install
packages, and run shells. Each is routine; together they change the threat
model of everyday development. What actually goes wrong, and what holds?

## Current position

Treat it as three concrete, separately evidenced failure classes — not as
undifferentiated "AI risk."

**Injection.** LLMs follow instructions in content — that is what makes
them useful, and what makes every fetched page a potential command channel.
The lethal trifecta names the kill condition: private-data access plus
untrusted-content exposure plus external communication makes exfiltration
trivially inducible. The mitigation that holds is structural — never
assemble all three legs at once — not detection: guardrail products
claiming near-perfect protection are explicitly not to be relied on.

**Supply chain.** Package hallucination is measured, systemic, and large:
across 576,000 samples and 16 models, at least 5.2% (commercial) to 21.7%
(open-source) of recommended packages do not exist — 205,474 unique names
an attacker could register. Verify a package exists and has history before
installing anything an agent suggests.

**Authority.** The confused-deputy shape: a trusted agent tricked into
spending its legitimate permissions for an attacker. The proposed controls
converge on five categories — scoped authentication, provenance tracking,
sandboxing, inline policy enforcement, centralized governance — but that is
a controls _proposal_, not measured efficacy. One of the five is now shown
insufficient rather than merely unmeasured. _Instruction privilege
escalation_ — a harness promoting content that entered through a file read
to user-level authority when it delegates to a subagent — achieved all 13
of 13 attack objectives on six production harnesses, and still all 13 under
the inline permission review that three of them offer. No injection and no
jailbreak: the attacker controls only files in the workspace, and every
component behaves as configured. Provenance is the control that failed, and
it failed at the harness, not the model. Review of each action cannot hold
when the reviewer is shown a request that looks user-authored. Three
further failures, each by a different mechanism and none needing the model
to be fooled, arrived within a fortnight: a repository's own `.git/config`
running a command during the agent's start-up `git status`, outside the
sandbox and before any prompt, on seven harnesses; a plugin pin that a
branch named after the commit hash silently defeats, on four; and, observed
in the field rather than demonstrated, malware that publishes packages with
valid SLSA attestations from stolen CI tokens so that "AI coding agent
automated trust checks" pass, and hides its persistence in the `.claude/`,
`.vscode/` and `.cursor/` directories an agent reads without asking. The
pattern across all four is the same: the control checked a proxy — a review
prompt, a sandbox boundary, a commit hash, a signature — and the proxy was
made to say yes.

That the security boundary and the review gate are the same gate — sensitive
actions behind explicit human approval, which
[where must human review sit](where-must-human-review-sit.md) argues from
the throughput side — is this note's inference, not a sourced finding.

## How to enforce this

- Enforced here by workflow permissions rather than by intention.
  `links.yml` declares `permissions: {}`, `deploy.yml` declares
  `contents: read`, and the discovery sweep runs with `contents: read` plus
  `issues: write` — it can file a report and cannot touch code.
- The trifecta needs all three legs, and the exfiltration channel is
  usually the cheapest to remove. A permissions block removes it by
  construction; a review only removes it when someone notices.
- Fetched web content is data. Instruction-shaped text inside a fetched
  page is recorded as a finding and never followed, which keeps untrusted
  content from becoming the second leg.

## Evidence

- [willison-trifecta-2025](../../sources.md#willison-trifecta-2025) — the
  three-leg frame, the follow-instructions-in-content mechanism, and the
  structural-over-detection mitigation stance.
- [spracklen-2025](../../sources.md#spracklen-2025) — the package
  hallucination rates and unique-name count, abstract-verified.
- [mcp-security-2025](../../sources.md#mcp-security-2025) — the
  five-category control framework; a proposal, not measurement.
- [backslash-agents-md-2026](../../sources.md#backslash-agents-md-2026)
  — the trifecta assembled from a `git clone`: untrusted content in a
  repository's `AGENTS.md`, private data in `~/.aws/credentials`, and a
  shell to move it. Staged rather than exfiltrated, and the vendor patch
  is stated by its finders to be incomplete.
- [nvidia-agents-md-2026](../../sources.md#nvidia-agents-md-2026) — the
  same channel used for integrity rather than exfiltration: a concealed
  code change the agent kept out of its own pull request.
- [he-2026-privilege](../../sources.md#he-2026-privilege) — the
  demonstration that permission review fails by construction against a
  confused deputy the harness itself creates: 13/13 objectives on six
  harnesses, 13/13 under automatic permission review on the three that
  provide it. Verified at the paper 2026-09-07.
- [gitspawn-2026](../../sources.md#gitspawn-2026) — code execution as the
  developer from `.git/config` during start-up, outside the sandbox and
  before any prompt, on seven harnesses; no model involved. Delivery needs a
  populated `.git` directory, not a clone. Verified at the post 2026-09-18.
- [plugin4shell-2026](../../sources.md#plugin4shell-2026) — a plugin pin
  defeated by a branch named after the commit, with plugins inheriting the
  agent's permissions; four harnesses, two fixed at publication. Verified at
  the post 2026-09-18.
- [gtig-2026-q2](../../sources.md#gtig-2026-q2) — observed, not
  demonstrated: DUSTMAKER's OIDC-token theft and SLSA-attested republishing,
  and its persistence through hidden per-tool config directories. The
  report's own ceiling — no fully autonomous pipelines seen in the wild —
  is cited with it. Verified at the post 2026-09-18.

## What would change my mind

- Guardrail or detection systems demonstrating robust injection resistance
  under adversarial evaluation — which would weaken the
  structural-mitigation-only stance.
- Measured package-hallucination rates collapsing in newer models — the
  supply-chain leg would shrink to a historical footnote.
- Incident evidence that sandboxing and permission scoping fail in
  practice — **triggered 2026-09-07** by
  [he-2026-privilege](../../sources.md#he-2026-privilege), by controlled
  reproduction rather than incident, which is stronger. What would move it
  again: a harness whose delegation preserves the provenance of tool-level
  content, measured under the same 13 objectives — that would make the
  "inline policy enforcement" category a control rather than a hope.
  Corroborated since by incident-class evidence on three further mechanisms
  (`gitspawn-2026`, `plugin4shell-2026`, `gtig-2026-q2`); the bar for
  moving it back is unchanged.
