---
title: What surrounds agents where they actually ship production code?
status: working-answer
updated: 2026-08-21
---
## Question

The claim that "the advantage is the harness, not the model" circulates
widely. Where agents genuinely ship production code at scale, what does the
surrounding system actually consist of?

## Current position

Four first-party accounts now exist — OpenAI (~1M lines, zero
manually-written code), Stripe (1,000+ fully agent-produced PRs weekly
under $1T of payment volume), Ramp (~30% of merged PRs within months), and
Uber (84% of developers on agentic tools, 11% of PRs agent-opened, a named
internal tool per harness element — and costs up 6× since 2024, the first
account to volunteer a cost figure) — converging on five elements:

1. **Isolated, pre-warmed, full-environment sandboxes** — Stripe's
   ten-second devboxes, Ramp's Modal sandboxes rebuilt every 30 minutes,
   OpenAI's bootable-per-worktree app instances.
2. **Verification the agent can run itself** — the same lint/test
   pipelines humans use (Stripe); tests, telemetry, and visual
   verification with screenshots (Ramp); agent-queryable logs and metrics
   plus browser-protocol access (OpenAI).
3. **Curated tool access** — Toolshed's 400+ tools behind one server;
   Ramp's named integrations; repo-embedded skills.
4. **The repository as the system of record** — most explicit at OpenAI:
   knowledge outside the repo "effectively doesn't exist" for the agent.
5. **A review loop** — retained everywhere, but placed differently, and
   that placement is the live disagreement: Stripe keeps mandatory human
   review before merge; OpenAI has pushed review almost entirely
   agent-to-agent, humans optional.

Model choice appears in none of the three accounts as the differentiator.

Two things to hold constant: all three are self-reports without
methodology, failure rates, or external verification — existence proofs,
not measurements — and there is a selection effect: harnesses that failed
did not write blog posts. That the five convergent elements are
*necessary* rather than merely present is this note's inference.

The review-placement divergence bears directly on
[where must human review sit](where-must-human-review-sit.md): Stripe's
model is that note's position; OpenAI's is its falsifier in progress.

## How to enforce this

- Not mechanically enforceable. This is a claim about where effort is best
  spent, and no build step can check a budgeting decision.
- The measurable proxy is what the harness catches that a human did not,
  and it is worth recording rather than asserting. This repository keeps a
  self-correction record in its colophon and a dated review log, both of
  which exist to make that number checkable rather than remembered.
- The decision point arrives when a result disappoints. Reaching for a
  different model before improving the harness is the pattern this
  position warns against, and it is a choice someone makes explicitly.

## Evidence

- [openai-harness-2026](../../sources.md#openai-harness-2026) — the
  zero-manual-code experiment; legibility mechanisms; agent-to-agent
  review; QA capacity as the surviving bottleneck.
- [stripe-minions-2026](../../sources.md#stripe-minions-2026) — devboxes,
  Toolshed, human-review-mandatory, imperfect runs acknowledged.
- [ramp-inspect-2026](../../sources.md#ramp-inspect-2026) — full
  environment parity, self-closing verification loop, build-over-buy.
- [uber-2026](../../sources.md#uber-2026) — the fourth account, at the
  largest org scale; figures via access-journalism rather than a
  first-party post, stated as such. The 6× cost growth is the evidence
  class the other three omit.
- [apostolou-2026](../../sources.md#apostolou-2026) — the field's blocker
  is absent output verification; these harnesses are, structurally, that
  gap being closed by the companies past it.
- [bhati-2026-asdlc](../../sources.md#bhati-2026-asdlc) — the six-layer
  reference architecture as the academic frame these accounts instantiate.

## What would change my mind

- Independent measurement contradicting the self-reported scale or
  quality claims of any of the three accounts.
- A production deployment at comparable scale that *lacks* one of the five
  elements — which would demote it from convergent to incidental.
- Incident data from the agent-to-agent review model: real defect-escape
  rates would resolve the review-placement divergence in one direction or
  the other, and settle a falsifier of the review-gates note with it.
