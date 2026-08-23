# Capability map

The dimensions of a software-development lifecycle run with coding agents,
and what this project can say about each.

This map is an organising scheme, not a finding. It states which questions a
project has to answer, not what the answers are — those live in the
[playbook](playbook.md), and only where evidence supports them. The map
exists so that a domain this project has nothing to say about is visible
rather than quietly absent.

Each domain records a **Support** level, which describes what this project
can do for a repository adopting it:

- **First class** — a mechanism ships here, validated against a real
  repository, that an adopting project can use.
- **Compatible** — a position applies and does not depend on a particular
  stack, but no mechanism ships. The adopter implements it.
- **Assessment only** — the domain is named so it is not silently omitted.
  This project has no position and offers nothing beyond the question.

Evidence coverage is not recorded here. It is derived from the notes each
domain links, so it cannot drift from what the playbook actually holds: a
domain covered by a working answer reports `position`, one covered only by
an open question reports `open`, and one linking no note reports
`uncovered`.

Support is a claim about this project's mechanisms, not about the domain.
A domain can be first class and still rest on a single narrow position.

## Repository and change boundaries

Discovering what a repository contains, which commands are canonical, which
files are generated, and where an agent may safely change things.

**Support:** assessment only

## Context engineering

What an agent is told about the repository before it starts: instruction
files, retrieval, and what they are actually worth.

→ [do-context-files-pay-off](questions/do-context-files-pay-off.md)

**Support:** compatible

## Mechanical enforcement

Whether a rule is written down or made to fail. Formatting, linting, types,
schemas, and the boundary checks that refuse a change rather than advising
against it.

→ [does-mechanical-enforcement-beat-instructions](questions/does-mechanical-enforcement-beat-instructions.md)

**Support:** first class

## Specification and planning

What is agreed before an agent executes, and whether agreeing it reduces
rework.

→ [does-sdd-reduce-rework](questions/does-sdd-reduce-rework.md)

**Support:** compatible

## Persistence

Data architecture, schema change, transactions, and testing against a real
database.

**Support:** assessment only

## Testing

Unit through end-to-end coverage, regression protection, deterministic
fixtures, and the question of what coverage actually demonstrates.

**Support:** assessment only

## AI evaluation

Evaluating the models, prompts, retrieval, and tools a project depends on:
graders, regressions, cost and latency, and what published benchmarks can
support.

→ [which-benchmarks-inform-tool-selection](questions/which-benchmarks-inform-tool-selection.md)

**Support:** compatible

## Observability and debugging

Reproducing a failure, and what logs, traces, and metrics have to show when
part of the work was done by an agent.

→ [agent-era-observability](questions/agent-era-observability.md)

**Support:** assessment only

## Security

The attack surface a coding agent introduces, and the boundaries that
contain it.

→ [securing-agentic-development](questions/securing-agentic-development.md)

**Support:** first class

## Delivery and release

Build, release, deployment safety, rollback, and whether agent adoption
moves delivery performance.

→ [does-ai-adoption-improve-delivery](questions/does-ai-adoption-improve-delivery.md)

**Support:** compatible

## Review and falsification

Where human attention sits, what independent review is for, and how a claim
gets overturned.

→ [where-must-human-review-sit](questions/where-must-human-review-sit.md)

**Support:** first class

## Documentation

Durable documentation, decision records, runbooks, and keeping them from
contradicting the code.

**Support:** assessment only

## Runtime performance

Measured performance, resource cost, and feedback latency as a budget rather
than an impression.

**Support:** assessment only

## Agent harness and orchestration

What surrounds an agent where it ships production code, and which
multi-agent arrangements survive contact with production.

→ [what-makes-a-production-agent-harness](questions/what-makes-a-production-agent-harness.md)
→ [multi-agent-orchestration-in-production](questions/multi-agent-orchestration-in-production.md)

**Support:** compatible

## Adoption readiness

What has to be true of a team and a codebase before agents amplify rather
than accelerate the existing problems.

→ [preconditions-for-agentic-adoption](questions/preconditions-for-agentic-adoption.md)

**Support:** compatible
