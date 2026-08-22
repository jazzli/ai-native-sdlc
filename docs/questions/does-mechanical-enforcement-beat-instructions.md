---
title: Does mechanical enforcement beat prose instructions for steering agents?
status: working-answer
updated: 2026-08-20
---
## Question

When you want an agent to follow a rule, you can write the rule in prose —
context files, prompts, style guides — or encode it as a machine-executable
check: a linter rule, a type, a test, a hook, a build failure. Which
actually changes outcomes?

## Current position

Encode what you can check; spend prose only on what you cannot. Three
sources triangulate this from different directions. Instructions are
followed but do not buy correctness: agents respect context-file
instructions, yet those files produce no task-success improvement while
adding cost. The mechanism that does pay is named by DORA's ROI analysis:
every compensation it lists for the verification tax is mechanical —
non-optional checkpoints, pre-commit hooks with static analysis, automated
testing. And from the adoption side, what blocks companies from
productionizing agents is absent output *verification*, not absent
instruction.

Two caveats, both this note's inference from practitioner experience rather
than measured findings: checks must fail closed — a check that silently
no-ops when its target is missing enforces nothing — and agents can game
checks (bypass flags, deleting failing tests, rewriting assertions), so the
checks themselves need human review.

## How to enforce this

- Enforced here, and this note is the reason the rest are honest about
  not being. Every rule this repository states in prose either has a check
  behind it or is knowingly marked unenforced: the pre-commit hook refuses
  a note missing `## What would change my mind`, the build throws on a link
  to an unknown note or an unknown `sources.md` anchor, and the manifest
  refuses to publish a position whose playbook section no longer states a
  claim.
- The test of whether a rule is really enforced is to break it and watch
  something fail. Assertions here are mutation-tested that way: violate the
  invariant deliberately, and exactly one test must fail.
- Where a rule cannot be checked, say so where the rule is written. Prose
  that reads like a guarantee and is not one is the failure this position
  describes.

## Evidence

- [gloaguen-2026](../../sources.md#gloaguen-2026) — instructions respected,
  no success improvement, +20% cost: the direct evidence that prose is a
  weak enforcement layer.
- [dora-roi-2026](../../sources.md#dora-roi-2026) — the verification tax's
  named compensations are all machine-executable.
- [apostolou-2026](../../sources.md#apostolou-2026) — the
  capability–deployment verification gap: missing mechanical verification,
  not missing instruction, is what blocks production use.
- [willison-patterns](../../sources.md#willison-patterns) — red/green TDD
  and run-the-tests-first as the practitioner pattern for making feedback
  executable.

## What would change my mind

- A controlled study showing prose instructions matching mechanical checks
  on defect or rework rates — the economics would flip toward cheap prose.
- Evidence that agent check-gaming is widespread enough in practice to
  erase the advantage of mechanical gates.
- Instruction-following advances making context files reliably improve
  correctness — which would also overturn
  [do context files pay off](do-context-files-pay-off.md).
