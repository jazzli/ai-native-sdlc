---
title: Does spec-driven development actually reduce rework and drift?
status: working-answer
updated: 2026-08-19
---
## Question

Vibe coding's failure mode is plausible code that drifts from intent. Every
major tool shipped a spec-driven-development flavor in 2025–26 in response.
Does making a version-controlled spec the source of truth measurably reduce
rework, or is it ceremony?

## Current position

Directionally yes, for agent-executed feature work — adopt it as the default
there. The mechanism is credible: agents lose intent across context windows,
and an executable spec re-anchors them. GitHub reports roughly an
order-of-magnitude fewer regenerate-from-scratch cycles with Spec Kit on
internal projects.

But hold the claim loosely: that figure is vendor-reported and observational.
No controlled comparison of SDD vs. disciplined ad-hoc prompting exists as of
2026-08. And for small tasks, spec overhead plausibly exceeds rework savings —
the position covers feature-sized work, not one-line fixes.

## Evidence

- [sdd-2026](../../sources.md#sdd-2026) — consolidation across GitHub Spec
  Kit, AWS Kiro, OpenSpec, BMAD, Tessl; the GitHub internal rework claim; the
  From Prompt to Process taxonomy.
- [bhati-2026-asdlc](../../sources.md#bhati-2026-asdlc) — 13.6–55.8% time
  savings across controlled studies of agentic coding generally (not SDD
  specifically; upper bound context only).
- [willison-patterns](../../sources.md#willison-patterns) — converging
  practitioner pattern: explicit artifacts (specs, tests) as agent control
  surfaces.

## What would change my mind

- A controlled study showing no rework difference vs. ad-hoc prompting on
  comparable feature-sized tasks.
- Measurements showing spec-maintenance cost exceeding rework savings at
  team scale.
- Evidence that specs rot like documentation once teams scale — which would
  collapse the "source of truth" premise.
