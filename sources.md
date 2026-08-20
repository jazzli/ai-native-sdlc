# AI-Native SDLC — Source Map

A tracked list of sources for the latest thinking, practices, projects, tools, and
methodologies in AI-native software development.

**Last full review:** 2026-08-20
**Review cadence:** monthly skim, quarterly full re-rank (see [Maintenance](#maintenance))

**Citing:** every entry carries a stable citekey anchor. Cite from question
notes as `[<citekey>](../../sources.md#<citekey>)`. Citekeys never change once
assigned, even if the entry's title or URL updates.

---

## Signal filter

The "AI-native SDLC" space is heavily polluted by vendor lead-gen: invented maturity
models, unsourced percentages, no null results. Everything below is admitted or dropped
on three questions:

1. **Does it publish methodology?** Sample size, instrument, and how respondents were reached.
2. **Does it report null or negative results?** Sources that only ever find wins are marketing.
3. **Is it primary?** Prefer the report, the spec, or the repo over a blog summarizing it.

Sources are tiered by how far they clear that bar, not by how well known they are.

---

## Tier 1 — Empirical research

The first place to look, and the closest this field gets to evidence — but the
tier is not uniform and the heading is not a warranty on any number in it.
Entries range from a published survey design and a downloadable report to
analyst framing with no disclosed methodology at all. Every Notes cell states
where that entry actually stands against the [signal filter](#signal-filter);
read it before citing a figure.

| Source | What it gives you | Notes |
| --- | --- | --- |
| <a id="dora-publications"></a>[DORA Publications](https://dora.dev/research/publications/) | The index; start here | Highest-signal source in the field. **Filter:** a primary index that carries no findings itself — cite the reports, never this page |
| <a id="dora-2025"></a>[State of AI-assisted Software Development 2025](https://dora.dev/research/2025/dora-report/) | Nearly 5,000 respondents; "more than 100 hours of qualitative data" (78 in-depth interviews); introduces the DORA AI Capabilities Model. Deep-read 2026-08-20: **2024→2025 sign flips** — AI×throughput and AI×valuable-time turned negative→positive, product performance neutral→positive — while delivery instability stays elevated and can "negate any perceived gains in throughput"; seven team archetypes from cluster analysis (foundational challenges 10%, legacy bottleneck 11%, constrained by process 17%, high impact/low cadence 7%, stable and methodical 15%, pragmatic performers 20%, harmonious high-achievers 20%); VSM named a force multiplier; platform adoption 90%, dedicated platform teams 76%, "a high-quality platform amplifies the effects of AI adoption on organizational performance" | Core thesis: AI is an **amplifier** — magnifies strong engineering systems *and* dysfunction. **Filter:** passes all three — methodology published (sample, survey design, interview count), adverse outcomes reported (delivery instability, burnout, friction), primary. Verified at the report PDF 2026-08-20 |
| <a id="dora-capabilities-2025"></a>[DORA AI Capabilities Model](https://services.google.com/fh/files/misc/2025_dora_ai_capabilities_model.pdf) | The seven capabilities, named: clear and communicated AI stance; healthy data ecosystems; AI-accessible internal data; strong version control practices; working in small batches; user-centric focus; quality internal platforms | DORA calls the model "complementary to the DORA Core Model" and says "It does not replace it"; "many of these are the same core capabilities that have long been proven to enable high-performing, technology-driven teams" — strong version control and small batches are DORA Core items. What it adds on top is data-ecosystem and platform readiness plus an explicit AI stance. **Filter:** primary (the model itself, not a summary); reports adverse effects (AI raising delivery instability; weak user-focus teams losing performance). Methodology is not in this PDF — it directs readers to [dora-2025](#dora-2025) as its companion |
| <a id="dora-roi-2026"></a>[The ROI of AI-assisted Software Development](https://services.google.com/fh/files/misc/dora-roi-of-ai-assisted-software-development-2026.pdf) (v. 2026.1) | J-curve of value realization — a temporary productivity dip precedes returns; the **"verification tax"**: AI-raised velocity and code volume put the pressure on review, and unmanaged it cuts deployment frequency and lengthens lead time. Named compensations: non-optional checkpoints, pre-commit hooks with static analysis, automated testing, AI-assisted review. The dip decomposes into three named components — the learning curve, the verification tax, pipeline adaptation — framed as "the tuition cost of transformation"; "ROI is measured by how much latent human creativity your organization can unlock through clearing systemic toil" | **Primary:** the report PDF, linked from the title. Its [landing page](https://cloud.google.com/resources/content/dora-roi-of-ai-assisted-software-development) is lead-capture-gated; the PDF is not. [InfoQ](https://www.infoq.com/news/2026/05/dora-roi-ai-assisted-dev-report/) is a **secondary summary** — do not cite it for numbers. **Filter:** primary ✓; adverse effects are its core content ✓; but its ROI arithmetic is self-described as "a high-uncertainty estimate meant to spark a conversation" — cite the model and mechanisms, never the arithmetic as measurement. Verified at the report PDF 2026-08-20 |
| <a id="anthropic-trends-2026"></a>[Anthropic 2026 Agentic Coding Trends Report](https://resources.anthropic.com/2026-agentic-coding-trends-report) | Eight trends on the shift from writing code to orchestrating agents; case studies (Rakuten, CRED, TELUS, Zapier) | ⚠️ **Filter:** primary for what Anthropic itself claims, but no methodology published and no negative results reported — fails Q1 and Q2. Treat figures as directional; retained as the vendor's own articulation of the orchestration shift |
| <a id="bhati-2026-asdlc"></a>[Agentic AI in the SDLC](https://arxiv.org/abs/2604.26275) (Bhati) | Six-layer reference architecture; traditional SDLC vs. "A-SDLC"; reframes the shift as "delegated execution under human supervision"; SWE-bench Verified 1.96% → 78.4% (Oct 2023–Apr 2026); 13.6–55.8% time savings across controlled studies | Best single academic synthesis. Names five open problems: evaluation, governance, technical debt, skill redistribution, economics of attention. **Filter:** primary; methodology is literature synthesis over cited controlled studies; naming open problems is the adverse-results discipline the filter wants. Figures verified at abstract 2026-08-19 |
| <a id="forrester-2026"></a>[Forrester: State of Agentic Software Development, 2026](https://www.forrester.com/blogs/agentic-software-development-takes-the-lead-from-code-assistants-to-orchestrated-sdlc-agents/) | Analyst framing | ⚠️ **Passes none of the three filter questions** — a blog *about* a paywalled report: no methodology, no sample size, not primary. Retained for the framing and the executive vocabulary, not as evidence; do not cite it for a number |
| <a id="gloaguen-2026"></a>[Evaluating AGENTS.md: Are Repository-Level Context Files Helpful for Coding Agents?](https://www.sri.inf.ethz.ch/publications/gloaguen2026agentsmd) (ETH SRI; MemAgents @ ICLR 2026 — oral, runner-up best paper) | Across multiple agents and LLMs: context files give **no task-success improvement** and **+20% inference cost**; LLM-generated files mildly reduce success; agents do respect the file's instructions; both file types push broader exploration | Recommendation from the authors: minimal, requirement-focused, human-written files. **Filter:** passes all three — methodology published (two settings: SWE-bench with LLM-generated files; novel issues with developer-provided files), null result is the headline, primary. Verified at publication page 2026-08-20 |
| <a id="lulla-2026"></a>[On the Impact of AGENTS.md Files on the Efficiency of AI Coding Agents](https://assets.empirical-software.engineering/pdf/jaws26-agents.md-efficiency.pdf) (Lulla, Zhang, Mohsenimofidi, Baltes) | Paired same-task runs, 10 repos / 124 PRs: with AGENTS.md, median runtime **−28.64%** and output tokens **−16.58%**, with "comparable task completion behavior" | **Filter:** methodology published (paired design, sample stated) ✓; honestly self-limited — states it is *not* a correctness evaluation ✓; primary ✓. Efficiency evidence only — never cite it for quality effects. Verified at PDF 2026-08-20 |
| <a id="apostolou-2026"></a>[Agentic AI in Industry: Adoption Level and Deployment Barriers](https://arxiv.org/abs/2605.14675) (Apostolou, Bosch, Holmström Olsson) | 16 practitioners across 12 companies on a six-level maturity framework: 7 at L1 (AI assistants), 4 at L2, **1 at L3 (multi-agent orchestration)**. Names the capability–deployment **verification gap**: 4 companies hold higher-level experimental capabilities they cannot productionize because output verification mechanisms are absent | **Filter:** qualitative methodology stated (n=16/12) ✓; reports barriers, not wins ✓; primary ✓. Small n — treat as existence proof and direction, not as rates. Verified at abstract 2026-08-20 |
| <a id="spracklen-2025"></a>[We Have a Package for You! A Comprehensive Analysis of Package Hallucinations by Code Generating LLMs](https://arxiv.org/abs/2406.10279) (Spracklen et al., USENIX Security 2025) | 576,000 code samples across 16 LLMs in two languages: hallucinated-package rates of **at least 5.2% (commercial) and 21.7% (open-source)**; 205,474 unique hallucinated names — the substrate of slopsquatting supply-chain attacks | **Filter:** passes all three — methodology published, the adverse finding is the content, primary. Figures verified at abstract 2026-08-20. The repeatability claim (43% of names recur on every rerun) is in the paper body, relayed here via secondaries — verify before citing it |

---

## Tier 2 — Practitioner methodology

How people actually work, from people who actually ship.

- <a id="willison-patterns"></a>**[Simon Willison — Agentic Engineering Patterns](https://simonwillison.net/guides/agentic-engineering-patterns/)**
  The working practitioner guide. Six chapters — Principles; Working with coding
  agents; Testing and QA; Understanding code; Annotated prompts; Appendix — as a
  living document. Red/green TDD is a core pattern, and "inflicting unreviewed
  code on collaborators" is a named anti-pattern.
  **Corrected 2026-08-20:** this entry previously claimed "12+ chapters, updated
  1–2/week" and coverage of the "lethal trifecta" and "cognitive debt" — none of
  which is in the guide (those concepts live elsewhere in Willison's writing).
  It also linked the [announcement post](https://simonwillison.net/2026/Feb/23/agentic-engineering-patterns/)
  instead of the guide. **Filter:** primary; practitioner experience with no
  quantitative claims to misuse.
  Entry point: [Pragmatic Summit talk (~45 min)](https://www.youtube.com/watch?v=owmJyKVu5f8)

- <a id="willison-trifecta-2025"></a>**[The lethal trifecta for AI agents](https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/)**
  The injection-risk frame: an agent combining (1) access to private data,
  (2) exposure to untrusted content, and (3) the ability to communicate
  externally can be trivially induced to exfiltrate — because "LLMs follow
  instructions in content." Mitigation is structural: never assemble all
  three legs; guardrail products claiming near-perfect detection are not to
  be relied on. Distinct from [willison-patterns](#willison-patterns) — the
  trifecta lives in this standalone post, not the guide. **Filter:**
  primary; practitioner analysis with no quantitative claims. Verified at
  the post 2026-08-20

- <a id="sdd-2026"></a>**Spec-driven development (SDD)**
  The methodology that consolidated in 2025–26 as the answer to vibe-coding drift:
  an executable, version-controlled spec is the source of truth, not the code.
  Read the primary repos, not the roundup blogs — [GitHub Spec Kit](https://github.com/github/spec-kit),
  AWS Kiro, OpenSpec, BMAD, Tessl.
  **Negative finding (checked 2026-08-19):** Spec Kit's repo publishes no efficacy
  data of any kind — no percentages, no iteration counts, no comparison against
  ad-hoc prompting. The order-of-magnitude rework reduction widely attributed to
  GitHub's internal use of it appears only in secondary blogs, never in the repo.
  Academic taxonomy: [From Prompt to Process](https://arxiv.org/abs/2606.04967) —
  a six-dimension taxonomy (specification, context, roles, execution, validation,
  portability) assessed over six frameworks: Spec Kit, OpenSpec, BMAD, Get Shit
  Done, Spec Kitty, Reversa. (Kiro and Tessl above are this registry's additions,
  not the paper's set.) Findings: convergence away from the isolated prompt toward
  persistent artifacts, traceability, and human review; no framework covers all
  six dimensions; recurring risks include spec–code drift and insufficient
  benchmarks. **Filter:** repos and paper are primary; the paper states its method
  and reports risks, not only wins. Read 2026-08-20

- <a id="atlassian-2026"></a>**[Atlassian engineering blog](https://www.atlassian.com/blog/ai-at-work/ai-native-sdlc-paying-off-per-developer-per-week)**
  Two headline figures, two different methods — and neither is plain internal
  telemetry. The **19% more merged PRs/month is customer data**: 3,400 repos
  sampled from 2,500 customers, adopting repos matched to comparable
  non-adopters by propensity score. The **2–3 hrs/dev/week is an
  extrapolation**: a self-report survey of Atlassian's own developers (2–4 hrs
  claimed; the 20th percentile taken instead of the mean as a conservative
  floor), then standardised to customers by usage intensity. Vendor-published
  and single-product, but it states design, sample, and comparison group —
  admitted on **published methodology**, not on being internal data.

- <a id="openai-harness-2026"></a>**[Harness engineering: leveraging Codex in an agent-first world](https://openai.com/index/harness-engineering/)**
  (OpenAI, Feb 2026.) Five-month experiment: an internal beta product of ~1M
  lines with **zero manually-written code** — ~1,500 PRs, three→seven
  engineers, ~3.5 PRs/engineer/day, hundreds of internal users. "Humans
  steer. Agents execute." Named mechanisms: per-worktree bootable app
  instances with agent-legible logs/metrics (LogQL/PromQL, Chrome DevTools
  Protocol); repository as the system of record; **"one big AGENTS.md"
  failed in predictable ways** — replaced by a ~100-line map with
  progressive disclosure, enforced by linters, CI, and a doc-gardening
  agent; review pushed almost entirely agent-to-agent, humans optional.
  **Filter:** primary for its own practice; self-reported, no methodology,
  bottlenecks acknowledged (human QA capacity) but no failure rates.
  Verified at the post 2026-08-20

- <a id="stripe-minions-2026"></a>**[Minions: Stripe's one-shot, end-to-end coding agents](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents)**
  (Stripe, 2026; [part 2](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents-part-2).)
  1,000+ fully minion-produced PRs merged weekly — "human-reviewed, they
  contain no human-written code." Architecture: pre-warmed **devboxes**
  (10-second spin-up, code and services pre-loaded); **Toolshed**, a central
  server of 400+ MCP tools; a fork of Block's goose; the same lint/test
  pipelines as human engineers (sub-5s local lint, CI capped at two rounds);
  **mandatory human review before merge**. Admits imperfect runs are common
  and often serve as starting points. **Filter:** primary for its own
  practice; self-reported, no methodology or failure rates. Verified at the
  post 2026-08-20

- <a id="ramp-inspect-2026"></a>**[Why we built our own background agent](https://engineering.ramp.com/post/why-we-built-our-background-agent)**
  (Ramp, 2026.) Inspect writes ~30% of merged PRs across frontend and
  backend a couple of months after launch (secondary reporting places it
  ~50% by Feb 2026 — unverified at primary). Architecture: Modal sandboxes
  rebuilt every 30 minutes with the full local-equivalent environment
  (Postgres, Temporal, Vite "the works"), OpenCode as the agent, wired into
  Sentry/Datadog/LaunchDarkly/GitHub/Slack/Buildkite; closes its own loop —
  runs tests, reads telemetry, **visually verifies frontend work** with
  screenshots. Build-over-buy rationale: "it only has to work on your
  code." **Filter:** primary for its own practice; self-reported, and
  reports no limits at all — fails the null-results question hardest of the
  three. Verified at the post 2026-08-20

---

## Tier 3 — Standards & specs

Track these directly; they move faster than commentary about them.

- <a id="agents-md"></a>**[AGENTS.md](https://agents.md/)** — 60k+ repos. Stewarded by the **Agentic AI Foundation
  under the Linux Foundation**. Emerged from OpenAI Codex, Amp, Google Jules, Cursor, Factory.
  Plain Markdown, nested files in monorepos with closest-wins precedence.
  **Filter:** primary (the spec site); the adoption figure is the site's own claim, unaudited.
- <a id="mcp-spec-2026-07"></a>**[MCP spec 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28)** — current
  revision adds stateless operations, Tasks for long-running work, enterprise-managed identity.
  Also: multi-round-trip requests, header-based routing, cacheable list results,
  a formal extensions framework, and a 12-month deprecation policy.
  [Rationale on the spec blog](https://blog.modelcontextprotocol.io/posts/2026-07-28/).
  **Filter:** primary (spec + maintainers' rationale). Verified 2026-08-20
- <a id="mcp-security-2025"></a>**[Securing MCP: Risks, Controls, and Governance](https://arxiv.org/html/2511.20920v1)** —
  five-category control framework (authn/authz, provenance, sandboxing, policy enforcement,
  centralized governance). Read if governance is in scope. **Filter:** primary; a
  controls *proposal*, not empirical measurement. Categories verified at abstract 2026-08-20
- <a id="otel-genai"></a>**[OpenTelemetry GenAI semantic conventions](https://github.com/open-telemetry/semantic-conventions-genai)** —
  CNCF-backed telemetry schema for agent systems: spans, metrics, and events
  for GenAI clients, MCP, and provider-specific conventions (scope per the
  repo README, verified 2026-08-20). Secondary reporting places most
  conventions in experimental status as of early 2026 — check the status
  markers in the repo before building on any one of them; that stability
  claim is not yet verified here at primary. **Filter:** primary (the
  conventions repo itself); a standard, not evidence.

---

## Tier 4 — Evaluation

⚠️ **Treat vendor benchmark claims skeptically.** SWE-bench Verified is saturating and
increasingly gamed — top reported scores include semantically-wrong passes.

Current honest set: Terminal-Bench, Aider Polyglot, SWE-bench Pro, SetupBench, SEC-bench.

Two papers that explain why the headline numbers mislead:
- <a id="benchmarks-position-2026"></a>[Position: Coding Benchmarks Are Misaligned with Agentic Software Engineering](https://arxiv.org/abs/2606.17799)
  — Gorinova, Baker, Heineike, Shaposhnikov, Willoughby, Knox. Three named
  misalignments: scores conflate the model with the harness; grading against a
  single reference solution penalises equally valid alternatives; no
  component-level signal to iterate on. **Filter:** primary; a position paper —
  argument, not measurement. Verified at abstract 2026-08-20
- <a id="utboost-2025"></a>[UTBoost: Rigorous Evaluation of Coding Agents on SWE-Bench](https://arxiv.org/pdf/2506.09289)
  — Yu, Zhu, He, Kang. LLM-generated test augmentation (UTGenerator) exposes
  345 erroneous patches scored as passing; **24.4% of SWE-bench Verified
  leaderboard entries affected, 11 ranking changes** (40.9% of Lite, 18
  ranking changes). The concrete evidence that leaderboard deltas are unsafe.
  **Filter:** primary; publishes its method (test augmentation) and its findings are adverse by nature. Verified at abstract 2026-08-19

---

## Tier 5 — Ongoing feeds

- <a id="latent-space"></a>**[Latent Space](https://www.latent.space/)** (swyx & Alessio) — best for AI
  engineering as a distinct discipline from ML research. **Filter:** a feed, not
  evidence — fails Q1/Q2 by design; kept for coverage, never for citation
- <a id="ai-engineer"></a>**[AI Engineer](https://www.ai.engineer/)** — World's Fair 2026 talks on their YouTube
  channel; [Code Summit](https://www.ai.engineer/code/2026) (Nov 10–12) is the
  coding-agent-focused event. **Filter:** talks are primary practitioner accounts;
  the feed itself carries no methodology — cite a talk, not the feed
- <a id="broad-digests"></a>Broad digests (TLDR AI, The Batch) — pair one with a
  technical source; low independent signal on SDLC specifically. **Filter:** fails
  all three; sits in Tier 5 exactly as the admission rule requires

---

## Maintenance

**Monthly (skim, ~30 min)**
- New DORA publication? New MCP spec revision? New AGENTS.md stewardship change?
- Any Tier 1 source that stopped publishing methodology → demote.

**Quarterly (full re-rank)**
- Re-verify every link resolves.
- Re-read each entry's own gloss against its primary source — not against the
  notes citing it ([protocol](docs/protocol.md) Rule 5).
- Re-apply the [signal filter](#signal-filter) to every entry; drop what no longer clears it.
- Update `Last full review` above.

**Admission rule for new entries:** state which of the three filter questions it passes.
If it passes none, it goes in Tier 5 or not at all.

### Review log

| Date | Action |
| --- | --- |
| 2026-08-19 | Initial compilation |
| 2026-08-20 | **Site launched**: repo public, Pages live at jazzli.github.io/ai-native-sdlc, first deploy green, required checks (site-build, linkChecker) active on main |
| 2026-08-20 | Harness pass: openai-harness-2026, stripe-minions-2026, ramp-inspect-2026 admitted (all primary-verified first-party accounts); harness note seeded; OpenAI's big-AGENTS.md failure added to the context-files note as corroboration |
| 2026-08-20 | Course-guide gap analysis (external syllabus as map, not source): security-of-agentic-development and mechanical-enforcement identified as missing aspects; spracklen-2025 and willison-trifecta-2025 admitted, both primary-verified; context-lifecycle management named as a known thin spot, not yet actioned |
| 2026-08-20 | Open-questions pass: gloaguen-2026, lulla-2026, apostolou-2026, otel-genai admitted (all filter-stated, all primary-verified); three question notes seeded for the former no-position areas |
| 2026-08-20 | Deep read of both DORA PDFs end-to-end: archetype base rates, 2024→2025 sign flips, VSM/platform multipliers, J-curve decomposition recorded; new question note on delivery impact seeded |
| 2026-08-20 | Rule 5 sweep: all 18 entries verified against primaries or marked unverifiable; filter standing recorded on every entry; willison-patterns corrected (wrong link, wrong chapter count, two absent topics); DORA figures confirmed at both report PDFs |
