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

The only sources here with defensible numbers.

| Source | What it gives you | Notes |
| --- | --- | --- |
| <a id="dora-publications"></a>[DORA Publications](https://dora.dev/research/publications/) | The index; start here | Highest-signal source in the field |
| <a id="dora-2025"></a>[State of AI-assisted Software Development 2025](https://dora.dev/dora-report-2025/) | ~5,000 respondents + 100+ hrs interviews; DORA AI Capabilities Model (7 practices) | Core thesis: AI is an **amplifier** — magnifies strong engineering systems *and* dysfunction |
| <a id="dora-roi-2026"></a>ROI of AI-Assisted Software Development (2026.01) | J-curve model for value realization; ROI runs through code review and process redesign, not generation speed | Linked from the publications index; [InfoQ summary](https://www.infoq.com/news/2026/05/dora-roi-ai-assisted-dev-report/) |
| <a id="anthropic-trends-2026"></a>[Anthropic 2026 Agentic Coding Trends Report](https://resources.anthropic.com/2026-agentic-coding-trends-report) | Eight trends on the shift from writing code to orchestrating agents; case studies (Rakuten, CRED, TELUS, Zapier) | ⚠️ Landing page does not disclose survey methodology — treat figures as directional |
| <a id="bhati-2026-asdlc"></a>[Agentic AI in the SDLC](https://arxiv.org/abs/2604.26275) (Bhati) | Six-layer reference architecture; traditional SDLC vs. "A-SDLC"; reframes the shift as "delegated execution under human supervision"; SWE-bench Verified 1.96% → 78.4% (Oct 2023–Apr 2026); 13.6–55.8% time savings across controlled studies | Best single academic synthesis. Names five open problems: evaluation, governance, technical debt, skill redistribution, economics of attention |
| <a id="forrester-2026"></a>[Forrester: State of Agentic Software Development, 2026](https://www.forrester.com/blogs/agentic-software-development-takes-the-lead-from-code-assistants-to-orchestrated-sdlc-agents/) | Analyst framing | Useful for executive conversations; paywalled full report |

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
  Read the primary repos, not the roundup blogs — GitHub Spec Kit, AWS Kiro, OpenSpec,
  BMAD, Tessl.
  Academic taxonomy: [From Prompt to Process](https://arxiv.org/pdf/2606.04967)

- <a id="atlassian-2026"></a>**[Atlassian engineering blog](https://www.atlassian.com/blog/ai-at-work/ai-native-sdlc-paying-off-per-developer-per-week)**
  Unusually specific internal data (19% more PRs, 2–3 hrs/dev/week). Vendor, but
  publishes real numbers from its own org — clears the bar on that basis.

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
- Re-apply the [signal filter](#signal-filter) to every entry; drop what no longer clears it.
- Update `Last full review` above.

**Admission rule for new entries:** state which of the three filter questions it passes.
If it passes none, it goes in Tier 5 or not at all.

### Review log

| Date | Action |
| --- | --- |
| 2026-08-19 | Initial compilation |
