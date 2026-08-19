---
title: Which multi-agent orchestration patterns survive production?
status: open
updated: 2026-08-20
---
## Question

Multi-agent coding is the loudest topic in the discourse. What actually
runs in production, in which topology, and what stops the rest?

## Current position

Open — but the early field data says the discourse is far ahead of
deployment. The only methodology-stated field study found so far puts one
company of twelve at the multi-agent-orchestration maturity level, and
names the binding constraint: not coordination technique but **output
verification** — four of twelve hold higher-level capabilities they cannot
productionize because verification mechanisms are absent.

That converges with [where must human review sit](where-must-human-review-sit.md)
from the other direction: the gate, not the loop, is the scarce resource.

Topology claims circulating in vendor and consultant content — e.g. that
the field has converged on orchestrator-plus-isolated-subagents — fail this
registry's filter and are not adopted here. The framework taxonomy
corroborates convergence on persistent artifacts and human review, but says
nothing about runtime topology in production.

## Evidence

- [apostolou-2026](../../sources.md#apostolou-2026) — the maturity
  distribution (7/4/1 across twelve companies) and the capability–deployment
  verification gap. Small n; existence proof, not rates.
- [sdd-2026](../../sources.md#sdd-2026) — the taxonomy's convergence
  findings (artifacts, traceability, human review), which stop short of
  topology.
- [anthropic-trends-2026](../../sources.md#anthropic-trends-2026) —
  vendor-directional: orchestration as the claimed role shift; methodology
  undisclosed.

## What would change my mind

- Larger-n field data showing multi-agent orchestration common in
  production — the thin-deployment picture is an artifact of small samples.
- Verification tooling demonstrably closing the gap (the constraint
  dissolves, adoption follows).
- A methodology-stated study of topology outcomes in production — which
  would let this note take an actual position on patterns.
