---
title: What documentation do coding agents actually read?
status: working-answer
updated: 2026-08-26
---
## Question

Teams write architecture documents, API references, and onboarding guides.
Agents now do a large share of the reading. Is any of that what they open,
and does opening it change what they do?

## Current position

**Agents read instruction files, not the documentation written for humans.**

Measured across 557 agentic sessions, instruction files and working notes
account for 60.5% of documentation interactions. Classical technical
documentation takes 10.6%; API references take 1.3%. The artefact a team
spends the most effort on is the one least opened.

Two further findings matter more than the ratio, because they undercut the
usual reason for writing documentation for agents at all. Consultation does
not lead to updating — code is touched first 4.7 times more often in pull
requests that change both — and consultation is associated with *less*
immediate testing, not more. The study observed no explicit
documentation-based validation sequence, and its authors say directly that
the assumed properties of agent-friendly documentation, actionability and
verifiability, lack consistent behavioural support.

So the instruction file is where documentation effort reaches an agent. It
should be treated as the artefact it behaves like: one that evolves in
small, frequent additions the way configuration does, not prose that is
written once. Across 1,925 repositories those files are already
"difficult-to-read", and they concentrate on the functional — test
procedures, implementation details, architecture — while security and
performance appear in about one file in seven.

This is a claim about what agents read and what follows from reading. It is
not a claim that human-facing documentation is worthless: humans are still
the other audience, and nothing here measures their side.

## How to enforce this

- Partly enforceable. Nothing can check that documentation is *read*, and
  the finding is behavioural rather than a rule a build can apply.
- What can be checked is that the instruction file stays true, because it is
  the artefact that reaches agents. In this repository every rule in
  `AGENTS.md` that matters has a check behind it or is marked as unenforced,
  and the commit-msg hook and pre-commit hook enforce the conventions it
  states rather than leaving them to be read.
- The human checkpoint is at review: documentation consultation associating
  with less immediate testing means a change that cites the documentation is
  not thereby better tested, and should not be read as such.

## Evidence

- [gao-chen-2026](../../sources.md#gao-chen-2026) — the 60.5% / 10.6% / 1.3%
  split, the weak consultation-to-editing linkage, code preceding docs 4.7×,
  the negative association with immediate testing, and the authors' own
  statement that actionability and verifiability lack behavioural support.
- [agent-readmes-2026](../../sources.md#agent-readmes-2026) — instruction
  files as artefacts that evolve like configuration, their unreadability at
  scale, and the functional/non-functional split.

## What would change my mind

- A study finding that agents consult classical documentation at rates
  comparable to instruction files, which would make the central ratio a
  property of the sampled tooling rather than of agents.
- Evidence that documentation consultation associates with more testing or
  higher task success, reversing the negative association this rests on.
- A measured documentation-based validation sequence — agents checking work
  against documentation — which the study looked for and did not observe.
- Evidence that the 60.5% figure is an artefact of instruction files being
  in the repository root and cheap to open, rather than of their content
  being what agents want. That would keep the ratio and remove the lesson.
