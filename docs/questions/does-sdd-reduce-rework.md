---
title: Does spec-driven development actually reduce rework and drift?
status: working-answer
updated: 2026-08-21
---
## Question

Vibe coding's failure mode is plausible code that drifts from intent. Every
major tool shipped a spec-driven-development flavor in 2025–26 in response.
Does making a version-controlled spec the source of truth measurably reduce
rework, or is it ceremony?

## Current position

Directionally yes, for agent-executed feature work — adopt it as the default
there. The mechanism is credible: agents lose intent across context windows,
and an executable spec re-anchors them.

The most-repeated evidence for SDD's payoff doesn't survive checking. The
number — roughly an order-of-magnitude fewer regenerate-from-scratch cycles
with Spec Kit, attributed to GitHub's internal projects — appears only in
secondary blogs. Spec-kit's own repo publishes no quantitative claims of any
kind: no percentages, no iteration counts, no comparative data.

SDD's efficacy is mechanistically plausible but empirically unestablished: no
controlled comparison of SDD vs. disciplined ad-hoc prompting exists as of
2026-08. Adopt it for agent-executed feature work on the strength of the
mechanism, not the numbers — and for small tasks, spec overhead plausibly
exceeds rework savings, so the position covers feature-sized work, not
one-line fixes.

## Evidence

- [sdd-2026](../../sources.md#sdd-2026) — consolidation across GitHub Spec
  Kit, AWS Kiro, OpenSpec, BMAD, Tessl; the From Prompt to Process taxonomy.
  Carries no efficacy statistics (re-verified at Spec Kit's 1.0.0
  milestone, 2026-08-21) — its own guidance is to read the primary
  repos, not the roundup blogs where the rework figure circulates. The
  taxonomy paper (read 2026-08-20) supports the mechanism: frameworks
  converge on persistent artifacts, traceability, and human review as
  ambiguity-reducers — while naming spec–code drift and insufficient
  benchmarks as open risks, consistent with "empirically unestablished".
- [bhati-2026-asdlc](../../sources.md#bhati-2026-asdlc) — 13.6–55.8% time
  savings across controlled studies of agentic coding generally (not SDD
  specifically; upper bound context only).
- [willison-patterns](../../sources.md#willison-patterns) — red/green TDD as
  an agent-control mechanism. Adjacent, not direct support: it evidences
  test artifacts steering agents, not specs.

## What would change my mind

- A controlled study showing no rework difference vs. ad-hoc prompting on
  comparable feature-sized tasks.
- Measurements showing spec-maintenance cost exceeding rework savings at
  team scale.
- Evidence that specs rot like documentation once teams scale — which would
  collapse the "source of truth" premise.
