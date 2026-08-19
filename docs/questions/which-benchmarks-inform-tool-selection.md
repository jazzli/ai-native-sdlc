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

Benchmarks screen the frontier set; they do not rank within it. Headline
SWE-bench Verified deltas between frontier tools no longer predict anything
useful — saturation plus test-insufficiency inflation dominate the last few
points; UTBoost's re-scoring alone moved 11 Verified leaderboard positions. Weight instead: Terminal-Bench and SWE-bench Pro for breadth,
domain-matched suites (SetupBench, SEC-bench) where relevant, and above all
a small self-built eval on your own repo's tasks — ten representative issues
beat any leaderboard for a selection decision.

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
