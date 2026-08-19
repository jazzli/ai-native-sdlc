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

DORA's AI Capabilities Model is the best current checklist, and its seven
capabilities are worth reading before assuming you know what they are: a
clear and communicated AI stance, healthy data ecosystems, AI-accessible
internal data, strong version control practices, working in small batches,
user-centric focus, and quality internal platforms.

That list is more AI-specific than the generic delivery hygiene one expects
— three of the seven are about data and platform readiness rather than CI
or review discipline. Worth noticing, because the instinct to substitute
familiar DevOps foundations here is strong and wrong. A team without these
that scales agent usage gets more code through broken gates, faster:
amplified dysfunction, and the deep end of the ROI J-curve with no climb
out.

Teams below the bar should cap agents at individual-assist level while
fixing foundations. That agents themselves are the highest-leverage tool
for fixing those foundations — test debt, CI speed — is this note's
inference; no cited source makes the claim.

## Evidence

- [dora-2025](../../sources.md#dora-2025) — amplifier thesis; ~5,000
  respondents, 100+ hours of interviews.
- [dora-capabilities-2025](../../sources.md#dora-capabilities-2025) — the
  seven capabilities as DORA names them.
- [dora-roi-2026](../../sources.md#dora-roi-2026) — J-curve of value
  realization; process redesign as the gating factor.
- [atlassian-2026](../../sources.md#atlassian-2026) — 19% more PRs, 2–3
  hrs/dev/week. Weak support: the post reports outcomes without
  characterising the org's prior engineering maturity, so it cannot
  establish that foundations caused the gains.
- [forrester-2026](../../sources.md#forrester-2026) — orchestrated-SDLC
  framing; adoption staging toward end-to-end automation.

## What would change my mind

- Evidence of weak-foundation teams leapfrogging successfully — agents
  building the foundations bottom-up at scale, making preconditions
  endogenous rather than prior.
- Amplifier-effect data failing to replicate outside DORA's survey
  population.
