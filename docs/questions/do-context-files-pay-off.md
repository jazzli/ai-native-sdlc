---
title: Do AGENTS.md-style context files actually pay off?
status: working-answer
updated: 2026-08-21
---
## Question

Every agent vendor recommends a repository context file, and 60k+ public
repos carry one. Do they help — and help at what, exactly?

## Current position

Split verdict, and the split is the finding: the evidence for *efficiency*
and the evidence for *correctness* point in different directions.

For task success, the best available evidence is a null. Across multiple
agents and LLMs, context files produced no improvement in success rates
while adding over 20% inference cost — and LLM-generated files mildly
*reduced* success. Agents do follow the file, which cuts both ways: bad
instructions are obeyed too.

For efficiency, paired same-task runs (10 repos, 124 PRs) show large
savings with a file present — median runtime −28.64%, output tokens
−16.58% — but that study is explicit that it does not evaluate
correctness. The two studies use different agents, benchmarks, and outcome
measures; they measure different things more than they contradict.

The synthesis both support: if you keep a context file, hand-write it,
keep it minimal and requirement-focused, and never auto-generate it.
Expect cheaper runs, not better ones.

**And treat it as an attack surface.** "Agents do follow the file" is not
only a quality caveat; it is a security property, because the file is not
always written by you. Two independent demonstrations show an `AGENTS.md`
an attacker controls directing an agent against its user: one where a
malicious dependency writes the file at build time and the agent injects a
change and then conceals it from the pull request, the commit message, and
even from summarising agents; another where the file arrives simply by
cloning a public repository and the agent stages `~/.aws/credentials`,
`~/.gitconfig` and `~/.npmrc` before doing what the user asked.

The two differ in what they cost an attacker, and the difference is the
point. The first needs code execution through the supply chain already. The
second needs a `git clone`. Vendor responses differ too: the first was
assessed as not elevating risk and left unchanged; the second was patched
for the specific payload, with the researchers stating the patch does not
cover obfuscation, indirection through MCP tools, or multi-step chains.

This does not reverse the position above. It adds a reason the same advice
holds: a hand-written, minimal file is one you can read in full and notice
changes to. It does mean the file belongs in review, and that a context
file arriving from outside your repository should be read before an agent
is pointed at it.

## How to enforce this

- Partly enforceable, and the unenforceable half is the point. Nothing
  checks that a context file is hand-written or short.
- What can be checked is the corollary: any rule in `AGENTS.md` that
  actually matters has a mechanism behind it, because the file buys
  efficiency and not correctness. The audit is to read each "never" and
  "must" in it and name what fails when that rule is violated. Rules with
  no answer belong in a check or in the bin.
- Treating a context file as a correctness control is the failure this
  position warns about. It is a prompt, not a gate.

## Evidence

- [gloaguen-2026](../../sources.md#gloaguen-2026) — the null on success,
  the +20% cost, the LLM-generated penalty, and the minimal-human-written
  recommendation.
- [lulla-2026](../../sources.md#lulla-2026) — the efficiency deltas under
  a paired design, with correctness explicitly unevaluated.
- [nvidia-agents-md-2026](../../sources.md#nvidia-agents-md-2026) — the
  build-time write, the concealed edit, and the prerequisite that the
  attacker already has supply-chain code execution.
- [backslash-agents-md-2026](../../sources.md#backslash-agents-md-2026) —
  the clone-only path, the credentials staged, and the researchers' own
  account of what the vendor patch does not cover.
- [agents-md](../../sources.md#agents-md) — adoption scale and format
  context (60k+ repos; the spec itself).
- [gao-chen-2026](../../sources.md#gao-chen-2026) — behavioral
  corroboration at scale: instruction files dominate agent documentation
  interactions (60.5% of all), yet consultation links only weakly to the
  editing that follows (adjacent transition 0.002, OR 1.33) and associates
  with *less* immediate testing — heavy use, thin measurable payoff, from
  an independent method.
- [openai-harness-2026](../../sources.md#openai-harness-2026) — first-party
  corroboration at scale: "one big AGENTS.md" failed in predictable ways
  (context crowding, guidance dilution, instant rot, unverifiability) and
  was replaced by a ~100-line map with progressive disclosure, kept honest
  by linters and a doc-gardening agent.

## What would change my mind

- Evidence that agent runtimes reliably refuse instructions from a context
  file they did not receive from the user — which would make the attack
  surface a tooling defect rather than a property of the practice.

- A controlled study varying injection strategy across agent families that
  shows robust task-success gains from context files — correctness benefit
  after all.
- A failed replication of the success-rate null, or the efficiency deltas
  vanishing under correctness-controlled replication — the savings were
  quality-shaving in disguise.
- Evidence on staleness: measured decay of context-file accuracy over repo
  evolution (the "rot" half of this question has no data yet at all).
