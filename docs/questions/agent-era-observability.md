---
title: What do observability and incident response look like when agents do the work?
status: open
updated: 2026-08-20
---
## Question

When agents write, review, and ship changes, what telemetry, tracing, and
incident practice does a team need — and is any of it standardizing?

## Current position

Open — with one solid early fact: the telemetry substrate is standardizing
ahead of the practice. The OpenTelemetry GenAI semantic conventions
(CNCF-backed) define spans, metrics, and events for GenAI clients, MCP, and
provider-specific integrations — the schema for tracing an agent's
reasoning chain, tool calls, and model invocations exists and major
platforms are adopting it.

Two large gaps keep this note open. First, per secondary reporting the
conventions are mostly still experimental, and output evaluation, safety
scoring, and quality assessment are explicitly outside their scope — you
can trace what the agent did, but there is no standard for judging it.
Second, incident-response practice for agent-caused changes (who is paged,
what gets rolled back, how blame-free postmortems work when the author is
an agent) has produced no methodology-stated source found so far — that
half of the question is genuinely unstudied.

## Evidence

- [otel-genai](../../sources.md#otel-genai) — scope verified at the repo;
  stability and out-of-scope claims are from secondary reporting, flagged
  as such.
- [mcp-spec-2026-07](../../sources.md#mcp-spec-2026-07) — the protocol
  surface being traced (Tasks, stateless operations) — context for what
  agent telemetry must cover.

## What would change my mind

- The GenAI conventions reaching stable with evaluation/quality conventions
  included — the "trace but can't judge" gap closes at the standards layer.
- A competing telemetry schema winning adoption instead.
- Published agent-incident postmortems or an incident-practice study —
  which would let the second half of this note take a position.
