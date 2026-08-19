# AI-Native SDLC — Source Map

A tracked list of sources for the latest thinking, practices, projects, tools, and
methodologies in AI-native software development.

**Last full review:** 2026-08-19
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
| <a id="dora-publications"></a>[DORA Publications](https://dora.dev/research/publications/) | The index; start here | Highest-signal source in the field |
| <a id="dora-2025"></a>[State of AI-assisted Software Development 2025](https://dora.dev/research/2025/dora-report/) | ~5,000 respondents + 100+ hrs interviews; introduces the DORA AI Capabilities Model | Core thesis: AI is an **amplifier** — magnifies strong engineering systems *and* dysfunction |
| <a id="dora-capabilities-2025"></a>[DORA AI Capabilities Model](https://services.google.com/fh/files/misc/2025_dora_ai_capabilities_model.pdf) | The seven capabilities, named: clear and communicated AI stance; healthy data ecosystems; AI-accessible internal data; strong version control practices; working in small batches; user-centric focus; quality internal platforms | DORA calls the model "complementary to the DORA Core Model" and says "It does not replace it"; "many of these are the same core capabilities that have long been proven to enable high-performing, technology-driven teams" — strong version control and small batches are DORA Core items. What it adds on top is data-ecosystem and platform readiness plus an explicit AI stance. **Filter:** primary (the model itself, not a summary); reports adverse effects (AI raising delivery instability; weak user-focus teams losing performance). Methodology is not in this PDF — it directs readers to [dora-2025](#dora-2025) as its companion |
| <a id="dora-roi-2026"></a>[The ROI of AI-assisted Software Development](https://services.google.com/fh/files/misc/dora-roi-of-ai-assisted-software-development-2026.pdf) (v. 2026.1) | J-curve model for value realization; ROI runs through code review and process redesign, not generation speed | **Primary:** the report PDF, linked from the title. Its [landing page](https://cloud.google.com/resources/content/dora-roi-of-ai-assisted-software-development) is lead-capture-gated; the PDF is not. [InfoQ](https://www.infoq.com/news/2026/05/dora-roi-ai-assisted-dev-report/) is a **secondary summary** — do not cite it for numbers |
| <a id="anthropic-trends-2026"></a>[Anthropic 2026 Agentic Coding Trends Report](https://resources.anthropic.com/2026-agentic-coding-trends-report) | Eight trends on the shift from writing code to orchestrating agents; case studies (Rakuten, CRED, TELUS, Zapier) | ⚠️ Landing page does not disclose survey methodology — treat figures as directional |
| <a id="bhati-2026-asdlc"></a>[Agentic AI in the SDLC](https://arxiv.org/abs/2604.26275) (Bhati) | Six-layer reference architecture; traditional SDLC vs. "A-SDLC"; reframes the shift as "delegated execution under human supervision"; SWE-bench Verified 1.96% → 78.4% (Oct 2023–Apr 2026); 13.6–55.8% time savings across controlled studies | Best single academic synthesis. Names five open problems: evaluation, governance, technical debt, skill redistribution, economics of attention |
| <a id="forrester-2026"></a>[Forrester: State of Agentic Software Development, 2026](https://www.forrester.com/blogs/agentic-software-development-takes-the-lead-from-code-assistants-to-orchestrated-sdlc-agents/) | Analyst framing | ⚠️ **Passes none of the three filter questions** — a blog *about* a paywalled report: no methodology, no sample size, not primary. Retained for the framing and the executive vocabulary, not as evidence; do not cite it for a number |

---

## Tier 2 — Practitioner methodology

How people actually work, from people who actually ship.

- <a id="willison-patterns"></a>**[Simon Willison — Agentic Engineering Patterns](https://simonwillison.net/2026/Feb/23/agentic-engineering-patterns/)**
  Best working practitioner guide. Living document, 12+ chapters, updated 1–2/week.
  Covers red/green TDD as an agent-control mechanism, the "lethal trifecta" security
  framing, and fighting cognitive debt.
  Entry point: [Pragmatic Summit talk (~45 min)](https://www.youtube.com/watch?v=owmJyKVu5f8)

- <a id="sdd-2026"></a>**Spec-driven development (SDD)**
  The methodology that consolidated in 2025–26 as the answer to vibe-coding drift:
  an executable, version-controlled spec is the source of truth, not the code.
  Read the primary repos, not the roundup blogs — [GitHub Spec Kit](https://github.com/github/spec-kit),
  AWS Kiro, OpenSpec, BMAD, Tessl.
  **Negative finding (checked 2026-08-19):** Spec Kit's repo publishes no efficacy
  data of any kind — no percentages, no iteration counts, no comparison against
  ad-hoc prompting. The order-of-magnitude rework reduction widely attributed to
  GitHub's internal use of it appears only in secondary blogs, never in the repo.
  Academic taxonomy: [From Prompt to Process](https://arxiv.org/pdf/2606.04967)

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

---

## Tier 3 — Standards & specs

Track these directly; they move faster than commentary about them.

- <a id="agents-md"></a>**[AGENTS.md](https://agents.md/)** — 60k+ repos. Stewarded by the **Agentic AI Foundation
  under the Linux Foundation**. Emerged from OpenAI Codex, Amp, Google Jules, Cursor, Factory.
  Plain Markdown, nested files in monorepos with closest-wins precedence.
- <a id="mcp-spec-2026-07"></a>**[MCP spec 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28)** — current
  revision adds stateless operations, Tasks for long-running work, enterprise-managed identity.
  [Rationale on the spec blog](https://blog.modelcontextprotocol.io/posts/2026-07-28/)
- <a id="mcp-security-2025"></a>**[Securing MCP: Risks, Controls, and Governance](https://arxiv.org/html/2511.20920v1)** —
  five-category control framework (authn/authz, provenance, sandboxing, policy enforcement,
  centralized governance). Read if governance is in scope.

---

## Tier 4 — Evaluation

⚠️ **Treat vendor benchmark claims skeptically.** SWE-bench Verified is saturating and
increasingly gamed — top reported scores include semantically-wrong passes.

Current honest set: Terminal-Bench, Aider Polyglot, SWE-bench Pro, SetupBench, SEC-bench.

Two papers that explain why the headline numbers mislead:
- <a id="benchmarks-position-2026"></a>[Position: Coding Benchmarks Are Misaligned with Agentic Software Engineering](https://arxiv.org/pdf/2606.17799)
- <a id="utboost-2025"></a>[UTBoost: Rigorous Evaluation of Coding Agents on SWE-Bench](https://arxiv.org/pdf/2506.09289)
  — Yu, Zhu, He, Kang. LLM-generated test augmentation (UTGenerator) exposes
  345 erroneous patches scored as passing; **24.4% of SWE-bench Verified
  leaderboard entries affected, 11 ranking changes** (40.9% of Lite, 18
  ranking changes). The concrete evidence that leaderboard deltas are unsafe.

---

## Tier 5 — Ongoing feeds

- <a id="latent-space"></a>**[Latent Space](https://www.latent.space/)** (swyx) — best for AI engineering as a
  distinct discipline from ML research
- <a id="ai-engineer"></a>**[AI Engineer](https://www.ai.engineer/)** — World's Fair 2026 talks on their YouTube
  channel; [Code Summit](https://www.ai.engineer/code/2026) (Nov 10–12) is the
  coding-agent-focused event
- <a id="broad-digests"></a>Broad digests (TLDR AI, The Batch) — pair one with a technical source; low
  independent signal on SDLC specifically

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
