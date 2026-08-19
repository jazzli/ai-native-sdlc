---
title: Where must human review sit in an agentic SDLC for the ROI to materialize?
status: working-answer
updated: 2026-08-20
---
## Question

If agents write most of the code, where does scarce human attention have to
go — supervising generation inline, or gating artifacts at checkpoints?

## Current position

At the gates, not in the loop. Two checkpoints: spec approval before agent
execution, and review at merge. Between them, verification is delegated to
tests, CI, and agent cross-checks.

DORA's ROI report names the mechanism a "verification tax": AI raises
velocity and code volume, the pressure lands on review, and unmanaged it
shows up as fewer deployments and longer lead times — generation speed
without review capacity just moves the queue. Its named compensations are
gate-shaped: non-optional checkpoints, automated testing, AI-assisted
review. From there, that inline
supervision does not scale — that watching an agent type is the most
expensive possible use of human attention — is this note's inference, not a
sourced finding. Bhati names the economics of attention as one of five open
problems, so it supplies the frame for the question rather than an answer to
it: that attention is the binding constraint is precisely what he leaves
open. Practitioner patterns converge the same way: TDD and
verification harnesses exist precisely to move human judgment to
checkpoints.

Open sub-question, unresolved: whether review capacity itself becomes the
bottleneck that erases throughput gains — and if so, whether the answer is
tiered/sampled review rather than more gates.

## Evidence

- [dora-roi-2026](../../sources.md#dora-roi-2026) — J-curve; the
  "verification tax" and its compensations (non-optional checkpoints,
  automated testing, AI-assisted review). Its ROI arithmetic is
  self-described as a high-uncertainty estimate — cite the mechanism, not
  the numbers. In the J-curve figure the dip's three named components are
  the learning curve, the verification tax, and pipeline adaptation.
- [bhati-2026-asdlc](../../sources.md#bhati-2026-asdlc) — "delegated
  execution under human supervision" framing; economics of attention named
  as an open problem.
- [willison-patterns](../../sources.md#willison-patterns) — red/green TDD as
  the agent-control mechanism, and "inflicting unreviewed code on
  collaborators" as a named anti-pattern — direct practitioner support for a
  review gate before sharing. That attention sits at test boundaries rather
  than in the generation loop remains this note's inference.
- [anthropic-trends-2026](../../sources.md#anthropic-trends-2026) —
  role shift from writing code to orchestrating agents (directional; survey
  methodology undisclosed).

## What would change my mind

- Defect-class data showing gate-only review systematically misses failures
  that inline supervision catches (e.g. silent security regressions).
- Evidence that merge-gate review becomes the throughput bottleneck at
  agent-scale PR volume, with no tiered-review remedy — which would push the
  answer toward sampling, not gates.
