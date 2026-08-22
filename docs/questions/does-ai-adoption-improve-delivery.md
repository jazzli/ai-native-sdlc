---
title: Does AI adoption actually improve software delivery performance?
status: working-answer
updated: 2026-08-21
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

**Strengthened and complicated 2026-08-21.** Faros telemetry (22,000
developers) independently replicates BOTH halves — throughput up (epics
+66.2%, tasks +33.7%), instability up (bugs/developer +54%, incidents/PR
+242.7%, review time 5×) — the strongest outside-DORA confirmation this
note has. But it also cuts against the "net is decided by systems spend"
clause: Faros finds high-maturity organizations showing similar instability
patterns, so whether spending on foundations actually buys the translation
is now contested rather than assumed.

## How to enforce this

- Not a rule to enforce. This is a forecast that sets expectations, and
  treating it as a target would invert it — the predicted shape is a cost
  to notice, not an outcome to pursue.
- What it demands mechanically is that both halves are measured.
  Throughput improving while stability degrades is only visible if
  delivery rate and failure rate are tracked together; tracking one makes
  the prediction unfalsifiable in your own repository.
- The checkpoint is any decision to expand agent use. If only throughput
  is measured, this position predicts you will not see what it costs.

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
- [faros-2026](../../sources.md#faros-2026) — independent two-sided
  replication (throughput up, instability up) plus the
  maturity-not-a-shield finding that contests the systems-spend clause.

## What would change my mind

- 2026 DORA data showing instability also flipping neutral-or-positive
  broadly, without corresponding capability investment — the gap would be
  closing on its own and the "spend to translate" position would weaken.
- Replication failure: the throughput flip not appearing in datasets
  outside DORA's survey population.
- Longitudinal evidence that negation dominates at scale — organizations
  whose measured product performance falls despite sustained throughput
  gains.
