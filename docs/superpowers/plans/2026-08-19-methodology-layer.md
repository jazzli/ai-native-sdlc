# Methodology Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the research content engine for ai-native-sdlc: protocol, four seeded question notes, full-prose playbook, citekey anchors in the source registry, and lychee link-checking in CI.

**Architecture:** Three plain-markdown layers connected by a hard traceability chain — `docs/playbook.md → docs/questions/*.md → sources.md#<citekey> → primary source`. lychee in GitHub Actions mechanically enforces the chain. No generators, no databases.

**Tech Stack:** Markdown, YAML frontmatter (3 fields), GitHub Actions, lychee (via lycheeverse/lychee-action).

**Spec:** `docs/superpowers/specs/2026-08-19-methodology-layer-design.md`

## Global Constraints

- Plain relative markdown links only. Never `[[wikilink]]` syntax.
- Question-note frontmatter is exactly three fields: `title`, `status`, `updated`. `status` ∈ `open | working-answer | parked`. `updated` is `YYYY-MM-DD`.
- Every question note MUST contain a `## What would change my mind` section with concrete falsifiers.
- Question notes cite the registry as `../../sources.md#<citekey>` (two levels up from `docs/questions/`).
- Playbook claims link their question note as `questions/<slug>.md` (playbook lives in `docs/`).
- Citekey format: lowercase kebab-case, `<who>-<year>` or `<what>-<year>` (e.g. `dora-2025`, `mcp-spec-2026-07`).
- Today's date for all `updated` fields and prose: **2026-08-19**.
- Working directory: `/Users/jazz/Projects/ai-native-sdlc`. All paths relative to it.
- Every commit message ends with: `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`
- Do not push until Task 8 (push triggers CI verification there).

---

### Task 1: Citekey anchors in sources.md

**Files:**
- Modify: `sources.md`

**Interfaces:**
- Produces: 17 HTML anchors (`<a id="<citekey>"></a>`) that Tasks 3–7 cite. Full citekey list in Step 1.

- [ ] **Step 1: Write the failing verification check**

Run this loop; it is the acceptance test for the task:

```bash
for k in dora-publications dora-2025 dora-roi-2026 anthropic-trends-2026 \
         bhati-2026-asdlc forrester-2026 willison-patterns sdd-2026 \
         atlassian-2026 agents-md mcp-spec-2026-07 mcp-security-2025 \
         benchmarks-position-2026 utboost-2025 latent-space ai-engineer \
         broad-digests; do
  grep -q "id=\"$k\"" sources.md || echo "MISSING: $k"
done
```

Expected now: 17 `MISSING:` lines.

- [ ] **Step 2: Insert the anchors**

For each row/bullet below, insert `<a id="<citekey>"></a>` immediately after the leading `| ` or `- ` (and before any `**`). Exact target lines, identified by their unique starting text:

| Citekey | Line starts with |
| --- | --- |
| `dora-publications` | `| [DORA Publications](https://dora.dev/research/publications/)` |
| `dora-2025` | `| [State of AI-assisted Software Development 2025](https://dora.dev/dora-report-2025/)` |
| `dora-roi-2026` | `| ROI of AI-Assisted Software Development (2026.01)` |
| `anthropic-trends-2026` | `| [Anthropic 2026 Agentic Coding Trends Report](https://resources.anthropic.com/2026-agentic-coding-trends-report)` |
| `bhati-2026-asdlc` | `| [Agentic AI in the SDLC](https://arxiv.org/abs/2604.26275)` |
| `forrester-2026` | `| [Forrester: State of Agentic Software Development, 2026](https://www.forrester.com/blogs/` |
| `willison-patterns` | `- **[Simon Willison — Agentic Engineering Patterns](https://simonwillison.net/2026/Feb/23/` |
| `sdd-2026` | `- **Spec-driven development (SDD)**` |
| `atlassian-2026` | `- **[Atlassian engineering blog](https://www.atlassian.com/blog/ai-at-work/` |
| `agents-md` | `- **[AGENTS.md](https://agents.md/)**` |
| `mcp-spec-2026-07` | `- **[MCP spec 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28)**` |
| `mcp-security-2025` | `- **[Securing MCP: Risks, Controls, and Governance](https://arxiv.org/html/2511.20920v1)**` |
| `benchmarks-position-2026` | `- [Position: Coding Benchmarks Are Misaligned with Agentic Software Engineering](https://arxiv.org/pdf/2606.17799)` |
| `utboost-2025` | `- [UTBoost: Rigorous Evaluation of Coding Agents on SWE-Bench](https://arxiv.org/pdf/2506.09289)` |
| `latent-space` | `- **[Latent Space](https://www.latent.space/)**` |
| `ai-engineer` | `- **[AI Engineer](https://www.ai.engineer/)**` |
| `broad-digests` | `- Broad digests (TLDR AI, The Batch)` |

Worked example, table row (before → after):

```markdown
| [DORA Publications](https://dora.dev/research/publications/) | The index; start here | Highest-signal source in the field |
```
```markdown
| <a id="dora-publications"></a>[DORA Publications](https://dora.dev/research/publications/) | The index; start here | Highest-signal source in the field |
```

Worked example, bullet (before → after):

```markdown
- **[AGENTS.md](https://agents.md/)** — 60k+ repos. Stewarded by the **Agentic AI Foundation
```
```markdown
- <a id="agents-md"></a>**[AGENTS.md](https://agents.md/)** — 60k+ repos. Stewarded by the **Agentic AI Foundation
```

- [ ] **Step 3: Add the citing convention note**

In `sources.md`, immediately under the `# AI-Native SDLC — Source Map` heading block (after the `**Review cadence:** …` line), add:

```markdown
**Citing:** every entry carries a stable citekey anchor. Cite from question
notes as `[<citekey>](../../sources.md#<citekey>)`. Citekeys never change once
assigned, even if the entry's title or URL updates.
```

- [ ] **Step 4: Re-run verification — expect zero MISSING lines**

Re-run the Step 1 loop. Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add sources.md
git commit -m "Add citekey anchors and citing convention to source registry

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 2: Research protocol

**Files:**
- Create: `docs/protocol.md`

**Interfaces:**
- Consumes: `sources.md#signal-filter` (existing heading anchor), citekey convention from Task 1.
- Produces: the four rules Tasks 3–7 must follow; status vocabulary `open | working-answer | parked`.

- [ ] **Step 1: Verify target links exist (the note's own acceptance test)**

```bash
grep -q "^## Signal filter" sources.md && echo OK-heading
grep -q 'id="dora-2025"' sources.md && echo OK-anchors
test -f docs/protocol.md || echo "protocol.md missing (expected before Step 2)"
```

Expected: `OK-heading`, `OK-anchors`, and the missing message.

- [ ] **Step 2: Write docs/protocol.md with exactly this content**

```markdown
# Research Protocol

How research happens in this repo. One page; four rules.

This repo is the research engine behind an eventual public reference for
developers and AI practitioners navigating the AI × software development
space. Near-term it is a personal thinking tool; everything is written so it
can later be published and machine-ingested without rework.

## The four rules

1. **Admission.** Sources enter [sources.md](../sources.md) only through its
   [signal filter](../sources.md#signal-filter): does it publish methodology?
   report null results? is it primary? State which questions a new entry
   passes when adding it.
2. **Reading discipline.** A source read either updates at least one question
   note in [questions/](questions/) or is consciously dropped. No passive
   collecting.
3. **Traceability.** Nothing enters the playbook without a question note
   behind it. Every playbook claim links its note; every note cites registry
   citekeys (`../../sources.md#<citekey>`). The chain is
   `playbook.md → questions/*.md → sources.md → primary source`, and CI
   (lychee) fails when it breaks.
4. **Change order.** When a position shifts, update the question note first;
   the playbook follows. The prose layer never leads its evidence.

## Question notes

One file per question in [questions/](questions/), kebab-case slug. Exactly
three frontmatter fields (`title`, `status`, `updated`); `status` is
`open | working-answer | parked`. Body sections: `## Question`,
`## Current position`, `## Evidence`, `## What would change my mind` — the
last one is mandatory and concrete. A stale `status` is an accepted cost; a
claim without a falsifier is not.

## Cadence

Inherited from [sources.md](../sources.md) — monthly skim, quarterly full
re-rank. No second calendar. lychee runs weekly in CI and automates the
"re-verify every link resolves" chore.
```

- [ ] **Step 3: Verify the file's links resolve**

```bash
test -f docs/protocol.md && echo OK-file
grep -q "signal-filter" docs/protocol.md && echo OK-link
```

Expected: `OK-file`, `OK-link`.

- [ ] **Step 4: Commit**

```bash
git add docs/protocol.md
git commit -m "Add research protocol

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 3: Question note — does SDD reduce rework

**Files:**
- Create: `docs/questions/does-sdd-reduce-rework.md`

**Interfaces:**
- Consumes: citekeys `sdd-2026`, `bhati-2026-asdlc`, `willison-patterns` (Task 1).
- Produces: slug `does-sdd-reduce-rework.md` cited by Task 7.

- [ ] **Step 1: Write the note with exactly this content**

```markdown
---
title: Does spec-driven development actually reduce rework and drift?
status: working-answer
updated: 2026-08-19
---
## Question

Vibe coding's failure mode is plausible code that drifts from intent. Every
major tool shipped a spec-driven-development flavor in 2025–26 in response.
Does making a version-controlled spec the source of truth measurably reduce
rework, or is it ceremony?

## Current position

Directionally yes, for agent-executed feature work — adopt it as the default
there. The mechanism is credible: agents lose intent across context windows,
and an executable spec re-anchors them. GitHub reports roughly an
order-of-magnitude fewer regenerate-from-scratch cycles with Spec Kit on
internal projects.

But hold the claim loosely: that figure is vendor-reported and observational.
No controlled comparison of SDD vs. disciplined ad-hoc prompting exists as of
2026-08. And for small tasks, spec overhead plausibly exceeds rework savings —
the position covers feature-sized work, not one-line fixes.

## Evidence

- [sdd-2026](../../sources.md#sdd-2026) — consolidation across GitHub Spec
  Kit, AWS Kiro, OpenSpec, BMAD, Tessl; the GitHub internal rework claim; the
  From Prompt to Process taxonomy.
- [bhati-2026-asdlc](../../sources.md#bhati-2026-asdlc) — 13.6–55.8% time
  savings across controlled studies of agentic coding generally (not SDD
  specifically; upper bound context only).
- [willison-patterns](../../sources.md#willison-patterns) — converging
  practitioner pattern: explicit artifacts (specs, tests) as agent control
  surfaces.

## What would change my mind

- A controlled study showing no rework difference vs. ad-hoc prompting on
  comparable feature-sized tasks.
- Measurements showing spec-maintenance cost exceeding rework savings at
  team scale.
- Evidence that specs rot like documentation once teams scale — which would
  collapse the "source of truth" premise.
```

- [ ] **Step 2: Verify structure and citations**

```bash
f=docs/questions/does-sdd-reduce-rework.md
grep -c "^title:\|^status:\|^updated:" $f          # expect 3
grep -q "^## What would change my mind" $f && echo OK-falsifier
for k in $(grep -o 'sources\.md#[a-z0-9-]*' $f | cut -d# -f2 | sort -u); do
  grep -q "id=\"$k\"" sources.md || echo "BROKEN CITE: $k"
done                                                # expect no output
```

- [ ] **Step 3: Commit**

```bash
git add docs/questions/does-sdd-reduce-rework.md
git commit -m "Seed question: does SDD reduce rework

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 4: Question note — where must human review sit

**Files:**
- Create: `docs/questions/where-must-human-review-sit.md`

**Interfaces:**
- Consumes: citekeys `dora-roi-2026`, `willison-patterns`, `bhati-2026-asdlc`, `anthropic-trends-2026` (Task 1).
- Produces: slug `where-must-human-review-sit.md` cited by Task 7.

- [ ] **Step 1: Write the note with exactly this content**

```markdown
---
title: Where must human review sit in an agentic SDLC for the ROI to materialize?
status: working-answer
updated: 2026-08-19
---
## Question

If agents write most of the code, where does scarce human attention have to
go — supervising generation inline, or gating artifacts at checkpoints?

## Current position

At the gates, not in the loop. Two checkpoints: spec approval before agent
execution, and review at merge. Between them, verification is delegated to
tests, CI, and agent cross-checks.

DORA's ROI analysis locates realized returns at code review — generation
speed without review capacity just moves the queue. Inline supervision does
not scale: watching an agent type is the most expensive possible use of the
attention that becomes the binding constraint (Bhati's "economics of
attention"). Practitioner patterns converge the same way: TDD and
verification harnesses exist precisely to move human judgment to
checkpoints.

Open sub-question, unresolved: whether review capacity itself becomes the
bottleneck that erases throughput gains — and if so, whether the answer is
tiered/sampled review rather than more gates.

## Evidence

- [dora-roi-2026](../../sources.md#dora-roi-2026) — J-curve; ROI runs
  through code review and process redesign, not generation speed.
- [bhati-2026-asdlc](../../sources.md#bhati-2026-asdlc) — "delegated
  execution under human supervision" framing; economics of attention named
  as an open problem.
- [willison-patterns](../../sources.md#willison-patterns) — red/green TDD as
  the agent-control mechanism; human attention at test boundaries.
- [anthropic-trends-2026](../../sources.md#anthropic-trends-2026) —
  role shift from writing code to orchestrating agents (directional; survey
  methodology undisclosed).

## What would change my mind

- Defect-class data showing gate-only review systematically misses failures
  that inline supervision catches (e.g. silent security regressions).
- Evidence that merge-gate review becomes the throughput bottleneck at
  agent-scale PR volume, with no tiered-review remedy — which would push the
  answer toward sampling, not gates.
```

- [ ] **Step 2: Verify structure and citations**

```bash
f=docs/questions/where-must-human-review-sit.md
grep -c "^title:\|^status:\|^updated:" $f          # expect 3
grep -q "^## What would change my mind" $f && echo OK-falsifier
for k in $(grep -o 'sources\.md#[a-z0-9-]*' $f | cut -d# -f2 | sort -u); do
  grep -q "id=\"$k\"" sources.md || echo "BROKEN CITE: $k"
done                                                # expect no output
```

- [ ] **Step 3: Commit**

```bash
git add docs/questions/where-must-human-review-sit.md
git commit -m "Seed question: where must human review sit

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 5: Question note — which benchmarks inform tool selection

**Files:**
- Create: `docs/questions/which-benchmarks-inform-tool-selection.md`

**Interfaces:**
- Consumes: citekeys `benchmarks-position-2026`, `utboost-2025`, `bhati-2026-asdlc` (Task 1).
- Produces: slug `which-benchmarks-inform-tool-selection.md` cited by Task 7.

- [ ] **Step 1: Write the note with exactly this content**

```markdown
---
title: Which benchmark results can actually inform tool selection?
status: working-answer
updated: 2026-08-19
---
## Question

Vendors lead with SWE-bench Verified scores. Saturation is visible (1.96% →
78.4% in thirty months; top scores now include semantically-wrong passes).
What role, if any, should public benchmarks play in choosing agentic tools?

## Current position

Benchmarks screen the frontier set; they do not rank within it. Headline
SWE-bench Verified deltas between frontier tools no longer predict anything
useful — saturation, contamination, and harness gaming dominate the last few
points. Weight instead: Terminal-Bench and SWE-bench Pro for breadth,
domain-matched suites (SetupBench, SEC-bench) where relevant, and above all
a small self-built eval on your own repo's tasks — ten representative issues
beat any leaderboard for a selection decision.

## Evidence

- [benchmarks-position-2026](../../sources.md#benchmarks-position-2026) —
  position paper: coding benchmarks are misaligned with agentic software
  engineering as actually practiced.
- [utboost-2025](../../sources.md#utboost-2025) — rigorous re-evaluation
  finding SWE-bench result inflation under stricter test augmentation.
- [bhati-2026-asdlc](../../sources.md#bhati-2026-asdlc) — the saturation
  trajectory; evaluation named as an open problem.

## What would change my mind

- A public benchmark demonstrating external validity: scores correlating
  with in-repo task success across multiple organizations.
- Contamination-controlled, semantically-verified leaderboards becoming the
  norm — which would restore within-frontier ranking value.
```

- [ ] **Step 2: Verify structure and citations**

```bash
f=docs/questions/which-benchmarks-inform-tool-selection.md
grep -c "^title:\|^status:\|^updated:" $f          # expect 3
grep -q "^## What would change my mind" $f && echo OK-falsifier
for k in $(grep -o 'sources\.md#[a-z0-9-]*' $f | cut -d# -f2 | sort -u); do
  grep -q "id=\"$k\"" sources.md || echo "BROKEN CITE: $k"
done                                                # expect no output
```

- [ ] **Step 3: Commit**

```bash
git add docs/questions/which-benchmarks-inform-tool-selection.md
git commit -m "Seed question: which benchmarks inform tool selection

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 6: Question note — preconditions for agentic adoption

**Files:**
- Create: `docs/questions/preconditions-for-agentic-adoption.md`

**Interfaces:**
- Consumes: citekeys `dora-2025`, `dora-roi-2026`, `atlassian-2026`, `forrester-2026` (Task 1).
- Produces: slug `preconditions-for-agentic-adoption.md` cited by Task 7.

- [ ] **Step 1: Write the note with exactly this content**

```markdown
---
title: What must be true of a team before agentic adoption amplifies rather than degrades?
status: working-answer
updated: 2026-08-19
---
## Question

DORA's central 2025 finding is that AI is an amplifier — it magnifies strong
engineering systems and dysfunction alike. What are the concrete
preconditions, and what should a team below the bar do first?

## Current position

The preconditions are unglamorous delivery foundations: fast reliable CI,
small batches, a working review process, clear ownership, and observable
systems. DORA's AI Capabilities Model (seven practices) is the best current
checklist. A team without them that scales agent usage gets more code
through broken gates, faster — amplified dysfunction, and the deep end of
the ROI J-curve with no climb out.

Teams below the bar should cap agents at individual-assist level while
fixing foundations — with the interesting caveat that agents themselves can
help fix them (test debt, CI speed), which is the highest-leverage early
use of agents on a weak-foundation team.

## Evidence

- [dora-2025](../../sources.md#dora-2025) — amplifier thesis; ~5,000
  respondents, 100+ hours of interviews; the seven-practice capabilities
  model.
- [dora-roi-2026](../../sources.md#dora-roi-2026) — J-curve of value
  realization; process redesign as the gating factor.
- [atlassian-2026](../../sources.md#atlassian-2026) — gains reported by an
  org with strong existing foundations (19% more PRs, 2–3 hrs/dev/week);
  consistent with, not proof of, the thesis.
- [forrester-2026](../../sources.md#forrester-2026) — orchestrated-SDLC
  framing; adoption staging toward end-to-end automation.

## What would change my mind

- Evidence of weak-foundation teams leapfrogging successfully — agents
  building the foundations bottom-up at scale, making preconditions
  endogenous rather than prior.
- Amplifier-effect data failing to replicate outside DORA's survey
  population.
```

- [ ] **Step 2: Verify structure and citations**

```bash
f=docs/questions/preconditions-for-agentic-adoption.md
grep -c "^title:\|^status:\|^updated:" $f          # expect 3
grep -q "^## What would change my mind" $f && echo OK-falsifier
for k in $(grep -o 'sources\.md#[a-z0-9-]*' $f | cut -d# -f2 | sort -u); do
  grep -q "id=\"$k\"" sources.md || echo "BROKEN CITE: $k"
done                                                # expect no output
```

- [ ] **Step 3: Commit**

```bash
git add docs/questions/preconditions-for-agentic-adoption.md
git commit -m "Seed question: preconditions for agentic adoption

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 7: Playbook

**Files:**
- Create: `docs/playbook.md`

**Interfaces:**
- Consumes: the four slugs from Tasks 3–6 (exact filenames in their Produces blocks).

- [ ] **Step 1: Verify the four question notes exist**

```bash
for s in does-sdd-reduce-rework where-must-human-review-sit \
         which-benchmarks-inform-tool-selection \
         preconditions-for-agentic-adoption; do
  test -f docs/questions/$s.md || echo "MISSING NOTE: $s"
done
```

Expected: no output.

- [ ] **Step 2: Write docs/playbook.md with exactly this content**

```markdown
# AI-Native SDLC Playbook

Positions, in prose, each traceable to a question note that holds the
evidence and — as important — what would overturn it. Sections exist only
where a question has reached a working answer; "no position yet" is said
out loud. Governed by the [research protocol](protocol.md).

## Use spec-driven development for agent-executed feature work

When an agent executes feature-sized work, a version-controlled spec —
approved before execution, kept as the source of truth — is the default.
The mechanism is intent re-anchoring across context loss, and the available
(vendor-reported) evidence points to large reductions in
regenerate-from-scratch cycles. Below feature size, skip the ceremony.
→ [why, and what would change this](questions/does-sdd-reduce-rework.md)

## Put human attention at the gates, not in the loop

Two human checkpoints: spec approval before agent execution, review at
merge. Between them, verification belongs to tests, CI, and agent
cross-checks. Inline supervision of generation is the most expensive
possible use of the attention that becomes your binding constraint — and
the ROI evidence says returns are realized at review, not generation.
Whether review capacity itself becomes the new bottleneck is open.
→ [why, and what would change this](questions/where-must-human-review-sit.md)

## Don't pick tools by leaderboard

Public benchmarks screen the frontier set; they cannot rank within it.
Saturation and gaming dominate the last few points of SWE-bench Verified.
For a selection decision, run ten representative issues from your own repo
against the candidates — a half-day that outperforms every leaderboard.
→ [why, and what would change this](questions/which-benchmarks-inform-tool-selection.md)

## Fix foundations before scaling agents

AI amplifies the engineering system it lands in. Without fast CI, small
batches, and working review, scaled agent adoption produces amplified
dysfunction and the deep end of the ROI J-curve. Cap agents at
individual-assist until the foundations hold — and point them at the
foundations first (test debt, CI speed): the highest-leverage early use on
a weak-foundation team.
→ [why, and what would change this](questions/preconditions-for-agentic-adoption.md)

## No position yet

- Multi-agent orchestration topologies — which coordination patterns
  survive production.
- Where AGENTS.md-style context files pay off vs. rot.
- What agent-era observability and incident response look like.
```

- [ ] **Step 3: Verify playbook links resolve**

```bash
for s in $(grep -o 'questions/[a-z-]*\.md' docs/playbook.md | sort -u); do
  test -f docs/$s || echo "BROKEN: $s"
done
grep -q "protocol.md" docs/playbook.md && echo OK-protocol-link
```

Expected: `OK-protocol-link`, no `BROKEN:` lines.

- [ ] **Step 4: Commit**

```bash
git add docs/playbook.md
git commit -m "Add playbook with four seeded positions

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 8: lychee CI

**Files:**
- Create: `lychee.toml`
- Create: `.github/workflows/links.yml`

**Interfaces:**
- Consumes: everything — this is the enforcement layer for the whole chain.

- [ ] **Step 1: Write lychee.toml with exactly this content**

```toml
# Link-integrity config. CI: .github/workflows/links.yml
# Fragment checking verifies the citekey anchors (<a id=...>) that the
# traceability chain depends on.
include_fragments = true
max_retries = 2
# Bot-hostile hosts return 403/429 to CI runners; a rot check should not
# fail on anti-bot responses.
accept = ["200..=299", "403", "429"]
exclude_path = ["docs/superpowers"]
```

- [ ] **Step 2: Write .github/workflows/links.yml with exactly this content**

```yaml
name: Links
on:
  push:
    branches: [main]
  schedule:
    - cron: "0 9 * * 1"   # weekly, Monday 09:00 UTC — link rot happens between commits
  workflow_dispatch:
jobs:
  linkChecker:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      issues: write
    steps:
      - uses: actions/checkout@v4
      - name: Run lychee
        id: lychee
        uses: lycheeverse/lychee-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}   # avoids rate-limiting on github.com links
        with:
          args: --config lychee.toml --no-progress .
          output: lychee/out.md
      - name: Open issue on scheduled failure
        if: failure() && github.event_name == 'schedule'
        uses: peter-evans/create-issue-from-file@v5
        with:
          title: "Link rot detected"
          content-filepath: lychee/out.md
          labels: link-rot
```

- [ ] **Step 3: Validate YAML and TOML locally**

```bash
python3 -c "import yaml,sys; yaml.safe_load(open('.github/workflows/links.yml')); print('YAML OK')" \
  || python3 -c "import tomllib" 2>/dev/null
python3 -c "import tomllib; tomllib.load(open('lychee.toml','rb')); print('TOML OK')"
```

Expected: `YAML OK` (if PyYAML is absent, skip that check — the push in Step 5 validates it authoritatively), `TOML OK`.

- [ ] **Step 4: Run lychee locally if available (optional but preferred)**

```bash
command -v lychee >/dev/null && lychee --config lychee.toml --offline . || echo "lychee not installed locally; CI will verify"
```

`--offline` checks the internal chain (files + fragments) without network. Expected if installed: 0 broken links. If fragment errors appear on `<a id=...>` anchors, that is a lychee false negative on HTML anchors — do NOT delete the anchors; investigate lychee's fragment handling before weakening the config.

- [ ] **Step 5: Commit, push, verify CI**

```bash
git add lychee.toml .github/workflows/links.yml
git commit -m "Add lychee link-integrity check (push + weekly cron)

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
git push
gh run watch --exit-status $(gh run list --workflow=links.yml --limit 1 --json databaseId --jq '.[0].databaseId')
```

Expected: workflow concludes `success`. If external-link failures occur, classify each: genuine rot → fix the link in a follow-up commit; anti-bot response not covered by `accept` → add the specific status code or an `exclude` pattern to `lychee.toml` with a comment naming the host and reason. Never blanket-exclude to get to green.

---

## Verification (whole feature)

After Task 8, the spec's success criteria map to:

- Every playbook claim two clicks from a primary source → Task 7 Step 3 + Task 3–6 Step 2 checks.
- CI fails when the chain breaks → Task 8 Step 5 green run (and `include_fragments = true` covering citekeys).
- Four seeded questions each state a position and falsifier → `grep -L "What would change my mind" docs/questions/*.md` returns nothing.
- Overhead stays inside existing cadence → protocol.md inherits sources.md's calendar; no new process files exist.
