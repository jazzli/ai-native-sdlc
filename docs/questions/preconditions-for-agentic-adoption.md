---
title: What must be true of a team before agentic adoption amplifies rather than degrades?
status: working-answer
updated: 2026-08-19
---
## Question

DORA's central 2025 finding is that AI is an amplifier — it magnifies strong
engineering systems and dysfunction alike. What are the concrete
preconditions, and what should a team below the bar do first?

## Current position

The preconditions are unglamorous delivery foundations: fast reliable CI,
small batches, a working review process, clear ownership, and observable
systems. DORA's AI Capabilities Model (seven practices) is the best current
checklist. A team without them that scales agent usage gets more code
through broken gates, faster — amplified dysfunction, and the deep end of
the ROI J-curve with no climb out.

Teams below the bar should cap agents at individual-assist level while
fixing foundations — with the interesting caveat that agents themselves can
help fix them (test debt, CI speed), which is the highest-leverage early
use of agents on a weak-foundation team.

## Evidence

- [dora-2025](../../sources.md#dora-2025) — amplifier thesis; ~5,000
  respondents, 100+ hours of interviews; the seven-practice capabilities
  model.
- [dora-roi-2026](../../sources.md#dora-roi-2026) — J-curve of value
  realization; process redesign as the gating factor.
- [atlassian-2026](../../sources.md#atlassian-2026) — gains reported by an
  org with strong existing foundations (19% more PRs, 2–3 hrs/dev/week);
  consistent with, not proof of, the thesis.
- [forrester-2026](../../sources.md#forrester-2026) — orchestrated-SDLC
  framing; adoption staging toward end-to-end automation.

## What would change my mind

- Evidence of weak-foundation teams leapfrogging successfully — agents
  building the foundations bottom-up at scale, making preconditions
  endogenous rather than prior.
- Amplifier-effect data failing to replicate outside DORA's survey
  population.
