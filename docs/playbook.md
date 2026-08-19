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
Spec Kit's own repo publishes no quantitative claims at all. No controlled
comparison of SDD against disciplined ad-hoc prompting exists yet, so
adopt it on the strength of the mechanism, not the numbers. Below feature
size, skip the ceremony — spec overhead plausibly exceeds rework savings
on small tasks.
→ [why, and what would change this](questions/does-sdd-reduce-rework.md)

## Put human attention at the gates, not in the loop

Two human checkpoints: spec approval before agent execution, and review
at merge. Between them, verification belongs to tests, CI, and agent
cross-checks. Inline supervision does not scale — watching an agent type
is the most expensive possible use of the attention that becomes the
binding constraint. DORA's ROI analysis locates realized returns at code
review, not generation speed: shipping code faster without review
capacity just moves the queue. Whether review capacity itself becomes the
new bottleneck is open — and if it does, the fix is likely tiered or
sampled review, not more gates.
→ [why, and what would change this](questions/where-must-human-review-sit.md)

## Don't pick tools by leaderboard

Public benchmarks screen the frontier set; they don't rank within it.
Saturation and test-insufficiency inflation dominate the last few points
of SWE-bench Verified — UTBoost's re-scoring alone moved 11 Verified
leaderboard positions. What to run instead is judgment, not a sourced
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
user-centric focus, and quality internal platforms. Three of the seven
are about data and platform readiness, not the CI-and-review hygiene a
team might expect — the instinct to substitute familiar DevOps
foundations here is strong, and wrong. A team without these that scales
agent usage gets more code through broken gates, faster: amplified
dysfunction, and the deep end of the ROI J-curve with no climb out. Cap
agents at individual-assist until the foundations hold. That agents
themselves are the highest-leverage tool for fixing those foundations —
test debt, CI speed — is this note's inference; no cited source makes
that claim directly.
→ [why, and what would change this](questions/preconditions-for-agentic-adoption.md)

## No position yet

- Multi-agent orchestration topologies — which coordination patterns
  survive production.
- Where AGENTS.md-style context files pay off vs. rot.
- What agent-era observability and incident response look like.
