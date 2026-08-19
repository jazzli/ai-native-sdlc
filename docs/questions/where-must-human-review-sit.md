---
title: Where must human review sit in an agentic SDLC for the ROI to materialize?
status: working-answer
updated: 2026-08-19
---
## Question

If agents write most of the code, where does scarce human attention have to
go — supervising generation inline, or gating artifacts at checkpoints?

## Current position

At the gates, not in the loop. Two checkpoints: spec approval before agent
execution, and review at merge. Between them, verification is delegated to
tests, CI, and agent cross-checks.

DORA's ROI analysis locates realized returns at code review — generation
speed without review capacity just moves the queue. Inline supervision does
not scale: watching an agent type is the most expensive possible use of the
attention that becomes the binding constraint (Bhati's "economics of
attention"). Practitioner patterns converge the same way: TDD and
verification harnesses exist precisely to move human judgment to
checkpoints.

Open sub-question, unresolved: whether review capacity itself becomes the
bottleneck that erases throughput gains — and if so, whether the answer is
tiered/sampled review rather than more gates.

## Evidence

- [dora-roi-2026](../../sources.md#dora-roi-2026) — J-curve; ROI runs
  through code review and process redesign, not generation speed.
- [bhati-2026-asdlc](../../sources.md#bhati-2026-asdlc) — "delegated
  execution under human supervision" framing; economics of attention named
  as an open problem.
- [willison-patterns](../../sources.md#willison-patterns) — red/green TDD as
  the agent-control mechanism; human attention at test boundaries.
- [anthropic-trends-2026](../../sources.md#anthropic-trends-2026) —
  role shift from writing code to orchestrating agents (directional; survey
  methodology undisclosed).

## What would change my mind

- Defect-class data showing gate-only review systematically misses failures
  that inline supervision catches (e.g. silent security regressions).
- Evidence that merge-gate review becomes the throughput bottleneck at
  agent-scale PR volume, with no tiered-review remedy — which would push the
  answer toward sampling, not gates.
