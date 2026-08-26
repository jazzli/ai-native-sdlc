---
title: What does coverage prove about tests an agent wrote?
status: working-answer
updated: 2026-08-23
---
## Question

Agents write tests readily, and coverage is the number most teams already
collect. If an agent raises coverage, has it made the suite better at
catching bugs, or only better at executing lines?

## Current position

**Coverage does not tell you that agent-written tests catch bugs.**

The distinction that matters is the setting. Comparing models against
bug-free code — a regression-style question, "which of these generators
produces the more thorough suite" — coverage and mutation score carry
moderate-to-strong signal, and that holds when suite size is controlled for.
Against code that actually contains a defect, which is the situation a team
is in when it matters, coverage becomes unreliable for predicting whether
the bug is caught, and mutation testing does not apply at all.

So coverage remains usable for ranking generators and unusable as evidence
that a particular suite defends a particular change. That is a narrower
claim than "coverage is meaningless", and it is the one the evidence
supports.

What agent-written tests look like is separately measured and does not
resolve this. They are longer and assert more per test than human-written
ones at equal or lower complexity — characteristics, not effectiveness. The
study that measured them declines to claim fault detection and calls for
mutation testing as future work.

This is scoped to what has been measured: Java, one benchmark, one
prompting workflow. It is a position about a null result, which is the
direction the evidence licenses; it is not evidence that coverage is
actively misleading elsewhere.

## How to enforce this

- Not mechanically enforceable, and a threshold would be the wrong response.
  A coverage gate answers a question this position says coverage cannot
  answer, and adding one because the number is available is the failure
  being described.
- The checkable version is the practice used in this repository: when an
  assertion matters, break the invariant deliberately and confirm exactly
  one test fails. That is mutation testing done by hand, on the assertions
  that carry weight, and it answers the question coverage does not.
- The human checkpoint is review of tests an agent wrote, asking what
  behaviour each assertion would catch if it changed. High assertion density
  is not the same as high fault sensitivity.

## Evidence

- [coverage-effectiveness-2026](../../sources.md#coverage-effectiveness-2026)
  — the regression-versus-practical split, the unreliability of coverage for
  predicting bug detection on buggy code, and the finding that suite size is
  not the confounder prior work on human-written tests reported.
- [ai-test-generation-2026](../../sources.md#ai-test-generation-2026) — what
  agent-written tests are structurally (longer, denser assertions, equal or
  lower complexity), the mixed per-project coverage effect, and the authors'
  own statement that fault detection is unmeasured.

## What would change my mind

- A study on the practical setting — tests generated against code containing
  a real defect — that finds coverage does predict whether the defect is
  caught. That is the exact claim being made here, and it would be reversed.
- Replication outside Java and Defects4J that finds coverage and bug
  detection correlate in the practical setting. The current result is
  explicitly limited to one language and one benchmark.
- Evidence that the higher assertion density of agent-written tests
  translates into measured fault sensitivity rather than only into more
  assertions, which would make the structural findings load-bearing after
  all.
- A generator whose output makes mutation score applicable and predictive in
  the practical setting, which would restore a cheap proxy this position
  says is unavailable.
