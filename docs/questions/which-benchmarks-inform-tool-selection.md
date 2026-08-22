---
title: Which benchmark results can actually inform tool selection?
status: working-answer
updated: 2026-08-19
---
## Question

Vendors lead with SWE-bench Verified scores. Saturation is visible (1.96% →
78.4% in thirty months; top scores now include semantically-wrong passes).
What role, if any, should public benchmarks play in choosing agentic tools?

## Current position

Benchmarks do not rank within the frontier set. Headline SWE-bench Verified
deltas between frontier tools no longer predict anything useful — saturation
plus test-insufficiency inflation dominate the last few points; UTBoost's
re-scoring alone moved 11 Verified leaderboard positions. That benchmarks
still screen the frontier set — that they separate frontier from
non-frontier at all — is this note's judgment; no cited entry establishes
it.

What to weight instead is this note's judgment, not a sourced finding — no
cited entry recommends any benchmark. Terminal-Bench and SWE-bench Pro for
breadth, domain-matched suites (SetupBench, SEC-bench) where relevant, and
above all a small self-built eval on your own repo's tasks. Ten
representative in-repo issues should beat any leaderboard for a selection
decision, but that is an untested prior.

## How to enforce this

- Not mechanically enforceable. No check can determine why a tool was
  chosen, and any proxy for it would be gameable by the person writing the
  justification.
- The human checkpoint is a recorded reason at the point of choice. A tool
  change should name what it was evaluated against in your own repository
  — a task it failed before, a workload it now handles. A leaderboard
  position is not such a reason.
- The observable failure is a tool switch whose recorded justification is
  a benchmark score, which is the measurement this position holds does not
  discriminate within the frontier set.

## Evidence

- [benchmarks-position-2026](../../sources.md#benchmarks-position-2026) —
  position paper: coding benchmarks are misaligned with agentic software
  engineering as actually practiced.
- [utboost-2025](../../sources.md#utboost-2025) — 345 patches scored as
  passing were erroneous; 24.4% of SWE-bench Verified leaderboard entries
  affected, 11 ranking changes, under LLM-generated test augmentation.
- [bhati-2026-asdlc](../../sources.md#bhati-2026-asdlc) — the saturation
  trajectory; evaluation named as an open problem.

## What would change my mind

- A public benchmark demonstrating external validity: scores correlating
  with in-repo task success across multiple organizations.
- Contamination-controlled, semantically-verified leaderboards becoming the
  norm — which would restore within-frontier ranking value.
