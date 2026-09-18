# The weekly falsifier watch

The daily sweep in this directory finds things. This routine decides what
they mean. It runs in Anthropic's cloud, **not** from this repository — so
its configuration is recorded here, because a policy artifact that exists in
exactly one place outside version control is one accident from being lost.

## Configuration (as of 2026-09-18)

The watch runs on the Ordomata agent host, `ordomata-agent-01`, as a
`systemd --user` timer. What it does is versioned here; when it runs and as
whom is recorded in the host's own repository, `ordomata-agent-host`.

| Field           | Value                                                                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Runs on         | `ordomata-agent-01` (DigitalOcean, Ubuntu 24.04), Linux user `agent`, no sudo                                                                    |
| Trigger         | `falsifier-watch.timer` — `Sat *-*-* 01:00:00 UTC` (09:00 Asia/Singapore), persistent                                                            |
| Entry point     | [`run-on-host.sh`](run-on-host.sh) → [`host/gate.py`](host/gate.py) → `agent-run claude falsifier-watch-<date> --fg`                             |
| Prompt          | [`falsifier-watch.prompt.md`](falsifier-watch.prompt.md), verbatim, read at run time                                                             |
| Model           | chosen per run by Ordomata's Run Card (first run: `sonnet`, effort `medium`); Claude Code CLI on the host, subscription login                    |
| Autonomy        | `full`, from the Run Card (`--dangerously-skip-permissions`; Claude has no OS sandbox on the host)                                               |
| GitHub identity | `ordomata-agent` — the host's active `gh` profile; write on this repository since 2026-09-18                                                     |
| Network         | unrestricted egress (host firewall allows all outbound)                                                                                          |
| Worktree        | `~/work/falsifier-watch-<date>` on branch `task/falsifier-watch-<date>`, removed after the run                                                   |
| Inspect         | `systemctl --user status falsifier-watch`, `journalctl --user -u falsifier-watch`                                                                |
| Gate artifacts  | `~/.local/state/ai-native-sdlc-watch/<date>/` — capacity, classification, Run Card, review; outside the checkout, which agent-run requires clean |
| Unit files      | `scripts/systemd/` in `ordomata-agent-host`                                                                                                      |

Least privilege is what the host provides, not what the prompt asks for.
`agent` is unprivileged; the job runs in its own worktree on a disposable
branch; `main` is protected. The prompt forbids committing, editing content
and closing issues, and the worktree is deleted after each run so nothing it
did to files survives. What it _can_ do is everything `agent` can, including
read every credential on the host — the host's own record says to treat every
secret there as visible to every delegated job, and this watch is one.

### The host's gate

The host does not start a Claude worker on request. `agent-run` demands a
one-invocation `ORDOMATA_ALLOW_SUBSCRIPTION_RUNS=1`, a passing
`claude-subscription-preflight` (included subscription only, no paid
continuation, headroom under 80%), and an accepted Ordomata Run Card that
reproduces the exact launch — repository, base commit, prompt and context
digests, model, effort, autonomy — before it creates a branch, worktree or
unit. [`host/gate.py`](host/gate.py) builds those artifacts each run with
Ordomata's own library and CLI: it adapts the preflight into capacity
evidence, writes the watch's classification, asks `coding-worker recommend`
for the model and effort, records a `deterministic_manager_policy` review,
and hands the selection to `agent-run`, which re-validates everything
itself. The classification is the one place a human decision sits: it rates
the watch standard-risk (security sensitivity 1, irreversibility 1) so
policy may accept it unattended. Raise either ordinal to 2 and every launch
needs a named manager, which a weekly timer cannot honestly supply.

### Why it moved off claude.ai

From 2026-08-20 to 2026-09-12 the watch was a claude.ai Code routine
(`trig_01EJUVVKmvjX4rrQJYW92e23`, `0 1 * * 6`, Sonnet 5). It was disabled on
2026-09-18, not deleted, after the host timer's first run filed its report.
Two of its five runs lost their findings — the default environment blocked
egress to every research host, and its GitHub App was authorized but installed
nowhere, so every write returned 403 — and nothing on the routine side could
tell a run that wrote from one that did not. The host gives one control plane,
a journal for every run, Hermes to fire it ad hoc, and a runner whose identity
is the same `ordomata-agent` that pushes development branches. The cost is the
one above: it now runs with the host's credentials rather than a scoped
integration's.

## What it does, in order

1. **Reader challenges first** — open issues labeled `challenge`, because a
   human took the trouble. It replies in-thread; it never closes.
2. **Falsifiers** — re-researches every `## What would change my mind`
   section against the live web.
3. **Discovery queue** — triages the rolling `discovery` issue the daily
   sweep appends to.

   **Weekly since 2026-08-26, and the reason is worth keeping.** The routine
   ran monthly on the 19th while the sweep began appending on the 21st, so
   the first pass would have faced a month of backlog — five days produced 76
   findings, and the first scheduled triage on 2026-09-19 would have met
   roughly 400. Cross-run deduplication cut the fill rate; it did not change
   the arithmetic that monthly triage of a daily queue arrives too late to be
   done well.

   The prompt changed with the schedule. It described itself as monthly and
   filed issues titled `Falsifier watch YYYY-MM`, which four runs a month
   would collide on; the title is now the run date. It also now says that
   suppressed items are not a finding, and that a roundup fails the third
   filter question — record the primary it points at, not the summary.

   Triaging by hand in the meantime is what surfaced
   [nvidia-agents-md-2026](../sources.md#nvidia-agents-md-2026) and
   [backslash-agents-md-2026](../sources.md#backslash-agents-md-2026), which
   amended a published position.

4. **Watchlist self-maintenance** — proposes additions and removals for
   `watch/watchlist.json`; proposes only, never edits.

Output is one `Falsifier watch YYYY-MM` issue when something moved, or a
no-change report when nothing did.

## Why the sweep does not guess at primary sources

Triage load would fall if the digest sorted findings into "probably primary
research" and "probably not". It does not, deliberately.

The two most valuable sources the queue has produced were published on
vendor blogs — NVIDIA's developer blog and Backslash's. A host-based
classifier would have sorted both into the low-priority pile, and the
roundup that summarised them, on a site indistinguishable by host, into the
same one. What made them primary was their relationship to the work, not
their domain name, and no cheap signal captures that.

Deduplication is different: "this exact link was reported on 2026-08-22" is
a fact, not a judgment. The sweep does the deterministic part and leaves the
filter's third question to whoever triages.

## Restoring or editing it

- **Change what it does:** edit `falsifier-watch.prompt.md` or `run-on-host.sh`
  here, through a pull request. The host reads both from its checkout at run
  time after `git pull --ff-only`, so a merged change is live at the next fire.
- **Change when or as whom:** edit the unit files in `ordomata-agent-host`,
  deploy them to `~/.config/systemd/user/` on the host, `systemctl --user
daemon-reload && systemctl --user restart falsifier-watch.timer`.
- **Fire it now:** `ssh ordomata-vps systemctl --user start falsifier-watch`, or
  ask Hermes to. Each run files at most one issue, titled by date.
- **If the host is gone:** the claude.ai routine still exists, disabled; enable
  it at https://claude.ai/code/routines and the watch resumes on the same
  schedule with the last prompt it had, which is the 2026-09-07 one.
