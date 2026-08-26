# AI-Native SDLC Playbook

How to build software with AI agents, and what the evidence actually
supports. The positions below — on specs, review, context files, security,
and what surrounds agents where they genuinely ship — each state what would
overturn them.

That last part is the point. Every claim here traces to a primary source,
and positions get downgraded in public when evidence arrives; the
[changelog](https://jazzli.github.io/ai-native-sdlc/changelog/) is the
record. Some questions remain open with no position at all; sections exist
only where a question has reached a working answer.

To apply these to your own repository, see [adopt](adopt.md) — two commands
and no agent, or one line pasted at a coding agent. The method behind all of it is the
[research protocol](protocol.md).

## Use spec-driven development for agent-executed feature work

When an agent executes feature-sized work, a version-controlled spec —
approved before execution, kept as the source of truth — is the default.
The mechanism is credible: agents lose intent across context windows, and
an executable spec re-anchors them. The headline case for SDD's payoff
doesn't hold up, though: the number usually cited — roughly an
order-of-magnitude fewer regenerate-from-scratch cycles, attributed to
GitHub's internal use of Spec Kit — appears only in secondary blogs, and
Spec Kit's own repo publishes no quantitative claims at all. No
controlled comparison of SDD against disciplined ad-hoc prompting exists
as of 2026-08, so adopt it on the strength of the mechanism, not the
numbers. Below feature size, skip the ceremony — spec overhead plausibly
exceeds rework savings on small tasks.
→ [why, and what would change this](questions/does-sdd-reduce-rework.md)

## Put human attention at the gates, not in the loop

Two human checkpoints: spec approval before agent execution, and review
at merge. Between them, verification belongs to tests, CI, and agent
cross-checks. DORA's ROI report calls the mechanism a "verification
tax": AI raises velocity and code volume, the pressure lands on review,
and unmanaged it means fewer deployments and longer lead times — shipping
code faster without review capacity just moves the queue. The
compensations DORA names are gate-shaped: non-optional checkpoints,
automated testing, AI-assisted review. That inline supervision therefore does not
scale — that watching an agent type is the most expensive possible use of
human attention — is this position's own reasoning, not a sourced
finding; Bhati names the economics of attention as one of five open
problems, which makes it a live question, not a result. Whether review
capacity itself becomes the new bottleneck is open — and so is whether
the answer would be tiered or sampled review rather than more gates.
→ [why, and what would change this](questions/where-must-human-review-sit.md)

## Don't pick tools by leaderboard

Public benchmarks don't rank within the frontier set. Saturation and
test-insufficiency inflation dominate the last few points of SWE-bench
Verified — UTBoost's re-scoring alone moved 11 Verified leaderboard
positions. That they still screen it — that a leaderboard at least
separates frontier from non-frontier — is judgment; no cited entry
establishes it. What to run instead is judgment too, not a sourced
recommendation: no cited source endorses a specific benchmark.
Terminal-Bench and SWE-bench Pro for breadth, domain-matched suites —
SetupBench, SEC-bench — where relevant, and, above all, a small eval
built on your own repo: run ten representative issues from your backlog
against the candidates. That this beats any leaderboard for a selection
decision is a working assumption, not a tested result.
→ [why, and what would change this](questions/which-benchmarks-inform-tool-selection.md)

## Fix foundations before scaling agents

AI amplifies the engineering system it lands in — DORA's central
finding. The checklist is DORA's AI Capabilities Model, and its seven
capabilities are worth reading directly rather than assumed: a clear and
communicated AI stance, healthy data ecosystems, AI-accessible internal
data, strong version control practices, working in small batches,
user-centric focus, and quality internal platforms. DORA presents this
as complementary to its Core Model rather than a replacement, and says
many of the seven are the same capabilities long proven to enable
high-performing teams — version control and small batches are Core items
verbatim. The familiar foundations still carry the weight; what the
model adds on top is data-ecosystem and platform readiness and an
explicit AI stance. A team without these that scales agent usage gets
more code through broken gates, faster: amplified dysfunction, and the
deep end of the ROI J-curve with no climb out. Adaptation is real — AI's
throughput relationship flipped positive between DORA's 2024 and 2025 data
— but instability stayed elevated, and only a fifth of surveyed teams sit
in the top archetype. And the claim now carries live counter-evidence:
independent telemetry across 22,000 developers finds high-maturity
organizations showing similar instability growth — "engineering maturity
is not a shield." The constructs differ enough that this is tension, not
refutation, but this position's confidence is formally downgraded until
a second replication settles it. Cap agents at
individual-assist until the foundations hold. That agents themselves are
the highest-leverage tool for fixing those foundations — test debt, CI
speed — is inference here, not a cited finding; no cited source makes
that claim directly.
→ [why, and what would change this](questions/preconditions-for-agentic-adoption.md)

## Expect throughput before stability

AI adoption now improves delivery throughput — a 2024→2025 sign flip in
DORA's data, corroborated by Atlassian's matched study and now by Faros
telemetry across 22,000 developers — but it still raises delivery
instability (bugs per developer +54%, incidents per PR tripled, in the
same telemetry), and unmanaged instability can negate the throughput gains
downstream. Treat that gap as the work — while knowing the remedy is now
contested: the same telemetry finds mature engineering organizations not
visibly protected. Named multipliers, held more lightly than before:
value stream management and platform quality, per DORA. And budget for the J-curve's
dip as tuition, not failure — it decomposes into a learning curve, a
verification tax, and pipeline adaptation.
→ [why, and what would change this](questions/does-ai-adoption-improve-delivery.md)

## Hand-write context files; expect efficiency, not correctness

The evidence on AGENTS.md-style files splits cleanly. For task success:
the best study is a null — no improvement across agents and models, over
20% added inference cost, and LLM-generated files mildly *hurt*. For
efficiency: paired runs show real savings (−29% median runtime, −17%
output tokens) with correctness explicitly unevaluated. Both studies point
at the same practice: if you keep one, hand-write it, keep it minimal and
requirement-focused, never auto-generate it — and buy cheaper runs, not
better ones. The rot half of the question has no data at all yet.
→ [why, and what would change this](questions/do-context-files-pay-off.md)

## Never assemble the lethal trifecta

An agent with private-data access, untrusted-content exposure, and the
ability to communicate externally can be trivially induced to exfiltrate —
LLMs follow instructions in content, and detection-based guardrails are
not to be relied on. The mitigation is structural: strip one leg. Alongside
it, two more evidenced failure classes: verify that any package an agent
suggests actually exists before installing (package hallucination runs
5–22% and attackers register the names), and scope the agent's authority so
a confused deputy has little to spend. The review gate doubles as the
security boundary — that pairing is our inference, argued in the note.
→ [why, and what would change this](questions/securing-agentic-development.md)

## Encode rules as checks, not prose

Agents follow written instructions — and it doesn't improve their success
rate. What pays is machine-executable enforcement: types, linters, tests,
hooks, build failures. DORA's compensations for the verification tax are
all mechanical; the thing blocking production agent adoption in the field
is missing verification, not missing instruction. Two disciplines keep it
honest: checks must fail closed, and since agents can game checks, humans
review the checks themselves.
→ [why, and what would change this](questions/does-mechanical-enforcement-beat-instructions.md)

## Invest in the harness, not the model choice

Where agents genuinely ship production code — OpenAI's zero-manual-code
product, Stripe's thousand-plus agent PRs a week, Ramp's third of all
merges, Uber's org-wide adoption with costs up sixfold — four first-party
accounts converge on the same surround:
pre-warmed full-environment sandboxes, verification the agent runs itself,
curated tools, the repository as system of record, and a review loop.
Model choice appears in none of them as the differentiator. These are
self-reports, not measurements — and they disagree on exactly one thing
this playbook cares about: Stripe keeps mandatory human review at merge
while OpenAI has gone almost fully agent-to-agent. Which survives contact
with incidents is open, and it is the standing test of our own
review-gates position.
→ [why, and what would change this](questions/what-makes-a-production-agent-harness.md)

## Don't read coverage as evidence that agent-written tests work

Coverage separates a generator that exercises code from one that does not,
and for that it is fine. It does not tell you a suite defends the change in
front of you. Measured against code that actually contains a defect —
the situation that matters — coverage stops predicting whether the defect is
caught, and mutation score stops applying at all.

Agent-written tests are longer and assert more per test than human-written
ones. That is a description, not a defence: the study that measured it says
so and calls for fault-detection work it did not do.

Where an assertion carries weight, break the invariant and confirm exactly
one test fails. That answers the question coverage cannot.

→ [why, and what would change this](questions/what-does-coverage-prove-for-agent-tests.md)

## No position yet

- Multi-agent orchestration topologies — production deployment looks far
  thinner than the discourse, and verification-gated.
  → [open note](questions/multi-agent-orchestration-in-production.md)
- Agent-era observability — telemetry is standardizing, judgment is not;
  incident practice is unstudied.
  → [open note](questions/agent-era-observability.md)
