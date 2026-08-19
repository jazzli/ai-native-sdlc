---
title: Does AI adoption actually improve software delivery performance?
status: working-answer
updated: 2026-08-20
---
## Question

Individual productivity gains are widely reported. Do they survive to the
team's delivery metrics — throughput and stability — or evaporate somewhere
between the IDE and production?

## Current position

On 2025 data: yes on throughput, no on stability, and the net is decided by
whether the organization spends on the systems that absorb the extra volume.

DORA's 2025 report records a sign flip from 2024: AI's relationship with
delivery throughput and with valuable time turned negative→positive, and
product performance neutral→positive — evidence that people, teams, and
tools adapted after a year. Delivery instability did not flip: it stays
elevated, and DORA warns its downstream effects "can ultimately negate any
perceived gains in throughput."

The translation from local speed to delivered value has two named
multipliers in the same report: value stream management, and platform
quality ("a high-quality platform amplifies the effects of AI adoption on
organizational performance"). Atlassian's propensity-matched customer data
(19% more merged PRs) corroborates the throughput half from an independent
dataset; it says nothing about stability.

## Evidence

- [dora-2025](../../sources.md#dora-2025) — the 2024→2025 sign flips;
  instability elevated with the negation warning; VSM as force multiplier;
  platform findings (adoption 90%, dedicated teams 76%). Read at the report
  PDF 2026-08-20.
- [dora-roi-2026](../../sources.md#dora-roi-2026) — the J-curve: a
  temporary dip (learning curve, verification tax, pipeline adaptation)
  framed as "the tuition cost of transformation," before returns.
- [atlassian-2026](../../sources.md#atlassian-2026) — 19% more merged PRs
  under a matched design; throughput only, no stability measure.

## What would change my mind

- 2026 DORA data showing instability also flipping neutral-or-positive
  broadly, without corresponding capability investment — the gap would be
  closing on its own and the "spend to translate" position would weaken.
- Replication failure: the throughput flip not appearing in datasets
  outside DORA's survey population.
- Longitudinal evidence that negation dominates at scale — organizations
  whose measured product performance falls despite sustained throughput
  gains.
