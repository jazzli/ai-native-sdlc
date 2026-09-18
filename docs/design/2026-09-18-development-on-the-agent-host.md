# Development moves to the agent host

**Date:** 2026-09-18. **Status:** done, with two findings handed to the host's
own record.

## Decision

Development of this repository, and its weekly research routine, move to
`ordomata-agent-01` — the Ordomata agent host. The public surface stays on
GitHub: Pages hosting, the deploy, links and conventions workflows, and the
daily discovery sweep all keep running there, unchanged. What moves is where
humans and agents _work_: branches are cut, pushed and reviewed from the host,
and the falsifier watch runs there as a `systemd --user` timer instead of a
claude.ai routine.

## What "using Ordomata" turned out to mean

The host is not a bare VPS with `claude` installed. Its launcher, `agent-run`,
refuses to start a Claude worker without an accepted Ordomata Run Card that
reproduces the exact launch, and refuses a dirty checkout, a live unit, or a
reused worktree. That gate landed on 2026-09-01, after this repository's
routine was designed, and it changed the shape of the move: the watch could
not be "a cron line that runs claude". It had to become a governed launch.

So the runner does what any other Claude launch on that host must:

1. `git pull --ff-only` — the checkout must be clean and current.
2. `host/gate.py` adapts the operator's `claude-subscription-preflight` into
   capacity evidence, writes the watch's classification (bound to the base
   commit and the digests of the prompt and context), asks Ordomata to
   recommend one model and effort, and records a deterministic review. All of
   it lands outside the checkout.
3. `agent-run claude … --fg` re-validates the card against the live launch
   and only then creates the branch, worktree and process.
4. On exit the worktree and the disposable branch are removed. The run's
   record is the issue it filed and the unit's journal.

Two things about that gate are worth stating plainly. It is a _reproduction_
boundary, not an authority boundary: the same OS user writes and reads every
artifact, and the worker could write its own card. What it buys is that the
model, effort, base commit and task text cannot drift between decision and
launch without the launch being refused. And it makes the classification the
one human decision in the loop — rated standard-risk in `gate.py`, under
review here, rather than re-asserted weekly by a script naming a manager.

## What was verified

- The full chain on the host: preflight → capacity → classification →
  recommend (Sonnet, medium) → review → `validate-launch` permitted.
- `ordomata-agent` can push to this repository; `main` still requires a pull
  request and green checks, and the account is not an administrator.
- The timer is enabled with its first fire on 2026-09-19 01:00 UTC; the
  first manual run through the service is recorded in `watch/routine.md`.

## What was handed to the host's record

`ordomata-agent-host` doc 21 records the collaborator grant, the units, and
two findings this move surfaced there: the host's active GitHub CLI profile
is `ordomata-agent`, where its own doc 18 records `jazzli`; and adding a
third, unrelated repository is a reassessment trigger its doc 11 §9 names.
Neither is fixed here — the profile decision is the operator's, by that
repository's own rule.

## Consequences

- The watch now runs with the host's credentials rather than a scoped
  integration's. The host's record says to treat every secret there as
  visible to every delegated job; this is one.
- The claude.ai routine is disabled, not deleted. If the host is gone,
  enabling it restores the watch on the same schedule.
- `watch/routine.md` is still a record kept by hand, and it was wrong once
  for two weeks. The gate helps: a stale prompt or context digest now refuses
  to launch instead of running silently.
