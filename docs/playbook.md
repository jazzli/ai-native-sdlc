# AI-Native SDLC Playbook

Positions, in prose, each traceable to a question note that holds the
evidence and — as important — what would overturn it. Sections exist only
where a question has reached a working answer; "no position yet" is said
out loud. Governed by the [research protocol](protocol.md).

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
cross-checks. DORA's ROI analysis locates realized returns at code
review, not generation speed: shipping code faster without review
capacity just moves the queue. That inline supervision therefore does not
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
deep end of the ROI J-curve with no climb out. Cap agents at
individual-assist until the foundations hold. That agents themselves are
the highest-leverage tool for fixing those foundations — test debt, CI
speed — is inference here, not a cited finding; no cited source makes
that claim directly.
→ [why, and what would change this](questions/preconditions-for-agentic-adoption.md)

## No position yet

- Multi-agent orchestration topologies — which coordination patterns
  survive production.
- Where AGENTS.md-style context files pay off vs. rot.
- What agent-era observability and incident response look like.
