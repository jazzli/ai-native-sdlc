---
title: What must be true of a team before agentic adoption amplifies rather than degrades?
status: working-answer
updated: 2026-08-20
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

The list is mostly continuity, not novelty, and DORA says so directly: the
AI Capabilities Model is presented as complementary to the DORA Core Model,
explicitly not a replacement, and DORA notes that many of these are the same
core capabilities long proven to enable high-performing teams. Two of the
seven — strong version control practices, working in small batches — are
Core capabilities verbatim. What the model adds on top is data-ecosystem and
platform readiness (healthy data ecosystems, AI-accessible internal data,
quality internal platforms) and an explicit, communicated AI stance. So the
familiar DevOps foundations are the substrate here, not a substitute for
something else: the data and platform items sit on top of them and do not
displace them. A team without these that scales agent usage gets more code
through broken gates, faster: amplified dysfunction, and the deep end of the
ROI J-curve with no climb out.

The 2025 report sharpens this two ways. Adaptation is visible in the data:
between 2024 and 2025, AI's relationship with throughput and with valuable
time flipped negative→positive — while delivery instability stayed elevated,
and DORA warns its downstream effects "can ultimately negate any perceived
gains in throughput." The residual constraint is exactly the systems half.
And the base rates are sobering: cluster analysis puts 20% of teams in the
harmonious high-achiever archetype against 38% across the three struggling
ones (foundational challenges 10%, legacy bottleneck 11%, constrained by
process 17%) — most teams are at or below the bar this note describes.

Teams below the bar should cap agents at individual-assist level while
fixing foundations. That agents themselves are the highest-leverage tool
for fixing those foundations — test debt, CI speed — is this note's
inference; no cited source makes the claim.

## Evidence

- [dora-2025](../../sources.md#dora-2025) — amplifier thesis; nearly 5,000
  respondents, 100+ hours of qualitative data. Deep-read 2026-08-20: the
  2024→2025 sign flips with instability still elevated; the seven archetype
  base rates; platform quality amplifying AI's effect (adoption 90%,
  dedicated teams 76%); VSM named a force multiplier.
- [dora-capabilities-2025](../../sources.md#dora-capabilities-2025) — the
  seven capabilities as DORA names them.
- [dora-roi-2026](../../sources.md#dora-roi-2026) — J-curve of value
  realization; process redesign as the gating factor. The dip decomposes
  into the learning curve, the verification tax, and pipeline adaptation.
- [atlassian-2026](../../sources.md#atlassian-2026) — 19% more merged PRs
  per repo, propensity-matched across 3,400 repos at 2,500 customers; 2–3
  hrs/dev/week extrapolated from a survey of Atlassian's own developers. The
  matched design is real evidence that adoption moves throughput. It is
  still weak support *for this question*: nothing in it characterises the
  adopting repos' prior engineering maturity, so it cannot establish that
  foundations are what made adoption pay.
- [forrester-2026](../../sources.md#forrester-2026) — orchestrated-SDLC
  framing; adoption staging toward end-to-end automation.

## What would change my mind

- Evidence of weak-foundation teams leapfrogging successfully — agents
  building the foundations bottom-up at scale, making preconditions
  endogenous rather than prior.
- Amplifier-effect data failing to replicate outside DORA's survey
  population.
