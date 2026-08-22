---
title: What does security look like when the developer is partly an agent?
status: working-answer
updated: 2026-08-20
---
## Question

Coding agents read untrusted web content, hold credentials, install
packages, and run shells. Each is routine; together they change the threat
model of everyday development. What actually goes wrong, and what holds?

## Current position

Treat it as three concrete, separately evidenced failure classes — not as
undifferentiated "AI risk."

**Injection.** LLMs follow instructions in content — that is what makes
them useful, and what makes every fetched page a potential command channel.
The lethal trifecta names the kill condition: private-data access plus
untrusted-content exposure plus external communication makes exfiltration
trivially inducible. The mitigation that holds is structural — never
assemble all three legs at once — not detection: guardrail products
claiming near-perfect protection are explicitly not to be relied on.

**Supply chain.** Package hallucination is measured, systemic, and large:
across 576,000 samples and 16 models, at least 5.2% (commercial) to 21.7%
(open-source) of recommended packages do not exist — 205,474 unique names
an attacker could register. Verify a package exists and has history before
installing anything an agent suggests.

**Authority.** The confused-deputy shape: a trusted agent tricked into
spending its legitimate permissions for an attacker. The proposed controls
converge on five categories — scoped authentication, provenance tracking,
sandboxing, inline policy enforcement, centralized governance — but that is
a controls *proposal*, not measured efficacy.

That the security boundary and the review gate are the same gate — sensitive
actions behind explicit human approval, which
[where must human review sit](where-must-human-review-sit.md) argues from
the throughput side — is this note's inference, not a sourced finding.

## How to enforce this

- Enforced here by workflow permissions rather than by intention.
  `links.yml` declares `permissions: {}`, `deploy.yml` declares
  `contents: read`, and the discovery sweep runs with `contents: read` plus
  `issues: write` — it can file a report and cannot touch code.
- The trifecta needs all three legs, and the exfiltration channel is
  usually the cheapest to remove. A permissions block removes it by
  construction; a review only removes it when someone notices.
- Fetched web content is data. Instruction-shaped text inside a fetched
  page is recorded as a finding and never followed, which keeps untrusted
  content from becoming the second leg.

## Evidence

- [willison-trifecta-2025](../../sources.md#willison-trifecta-2025) — the
  three-leg frame, the follow-instructions-in-content mechanism, and the
  structural-over-detection mitigation stance.
- [spracklen-2025](../../sources.md#spracklen-2025) — the package
  hallucination rates and unique-name count, abstract-verified.
- [mcp-security-2025](../../sources.md#mcp-security-2025) — the
  five-category control framework; a proposal, not measurement.

## What would change my mind

- Guardrail or detection systems demonstrating robust injection resistance
  under adversarial evaluation — which would weaken the
  structural-mitigation-only stance.
- Measured package-hallucination rates collapsing in newer models — the
  supply-chain leg would shrink to a historical footnote.
- Incident evidence that sandboxing and permission scoping fail in
  practice — which would demand stronger controls than the current five.
