---
title: Do AGENTS.md-style context files actually pay off?
status: working-answer
updated: 2026-08-20
---
## Question

Every agent vendor recommends a repository context file, and 60k+ public
repos carry one. Do they help — and help at what, exactly?

## Current position

Split verdict, and the split is the finding: the evidence for *efficiency*
and the evidence for *correctness* point in different directions.

For task success, the best available evidence is a null. Across multiple
agents and LLMs, context files produced no improvement in success rates
while adding over 20% inference cost — and LLM-generated files mildly
*reduced* success. Agents do follow the file, which cuts both ways: bad
instructions are obeyed too.

For efficiency, paired same-task runs (10 repos, 124 PRs) show large
savings with a file present — median runtime −28.64%, output tokens
−16.58% — but that study is explicit that it does not evaluate
correctness. The two studies use different agents, benchmarks, and outcome
measures; they measure different things more than they contradict.

The synthesis both support: if you keep a context file, hand-write it,
keep it minimal and requirement-focused, and never auto-generate it.
Expect cheaper runs, not better ones.

## Evidence

- [gloaguen-2026](../../sources.md#gloaguen-2026) — the null on success,
  the +20% cost, the LLM-generated penalty, and the minimal-human-written
  recommendation.
- [lulla-2026](../../sources.md#lulla-2026) — the efficiency deltas under
  a paired design, with correctness explicitly unevaluated.
- [agents-md](../../sources.md#agents-md) — adoption scale and format
  context (60k+ repos; the spec itself).

## What would change my mind

- A controlled study varying injection strategy across agent families that
  shows robust task-success gains from context files — correctness benefit
  after all.
- A failed replication of the success-rate null, or the efficiency deltas
  vanishing under correctness-controlled replication — the savings were
  quality-shaving in disguise.
- Evidence on staleness: measured decay of context-file accuracy over repo
  evolution (the "rot" half of this question has no data yet at all).
