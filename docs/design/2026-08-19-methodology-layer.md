# Methodology Layer for ai-native-sdlc — Design

**Date:** 2026-08-19
**Status:** approved pending user review

## Context

This repo is the research engine behind an eventual public reference — a website
where software developers and AI practitioners can find and interpret what's
latest and what matters in the AI × software development space, with an interface
good for humans and a format good for agents to ingest.

Near-term, it is a personal thinking tool. Everything is therefore written so it
can later be published and machine-ingested **without rework**: plain markdown,
stable identifiers, traceable claims. The website itself is a separate future
project with its own spec; this design covers only the content engine beneath it.

## Decisions already made

| Decision | Choice |
| --- | --- |
| Layers | Research protocol + question notes + playbook (no AGENTS.md for now) |
| Organizing spine of notes | Open questions — one file per question being answered |
| Structure level | Light template + one hard traceability rule (approach C) |
| Playbook form | Full prose |
| Near-term audience | The author; public trajectory shapes citation discipline from day one |

## Structure

```
sources.md              # exists — the vetted source registry
docs/
  protocol.md           # how research happens here (~1 page)
  questions/            # the thinking layer — one file per question
    <slug>.md
  playbook.md           # the output layer — full-prose positions
.github/workflows/
  links.yml             # lychee link check (push + weekly cron)
```

## Components

### docs/protocol.md (~1 page)

Four rules:

1. **Admission** — sources enter `sources.md` only through its signal filter
   (publishes methodology? reports null results? primary?).
2. **Reading discipline** — a source read either updates at least one question
   note or is consciously dropped. No passive collecting.
3. **Traceability** — nothing enters the playbook without a question note behind
   it; every playbook claim links to its note; every note cites registry
   entries. Chain: `playbook.md → questions/*.md → sources.md → primary source`.
4. **Change order** — when a position shifts, the question note updates first,
   the playbook follows. Prevents the prose layer drifting from its evidence.

Review cadence is inherited from `sources.md` (monthly skim, quarterly re-rank);
no second calendar.

### Question notes (docs/questions/<slug>.md)

Minimal fixed shape. Three frontmatter fields — the one concession to future
agent ingestion, adopted now because it is near-free at 4 files and painful to
retrofit at 40:

```markdown
---
title: <the question, as a sentence>
status: open | working-answer | parked
updated: YYYY-MM-DD
---
## Question
## Current position
## Evidence            <!-- cites ../../sources.md#<citekey> -->
## What would change my mind
```

"What would change my mind" is mandatory — it is what separates thinking from
collecting. Known accepted cost: `status` and `updated` will sometimes go stale;
that is an untidy index, not wrong content.

### docs/playbook.md (full prose)

- Sections **emerge from settled questions**; the file starts nearly empty and
  that is correct. No pre-scaffolded outline.
- Every claim ends with a link to its question note
  (`questions/<slug>.md`).
- "No position yet" may be said out loud. For the eventual public resource,
  honest uncertainty is a differentiator, not a gap.

### sources.md changes

Each entry gains a stable **citekey anchor** (e.g. `dora-2025`,
`bhati-2026-asdlc`, `mcp-spec-2026-07`). Question notes cite
`[dora-2025](../../sources.md#dora-2025)` rather than prose references. Stable
IDs are the substrate for citation discipline now and for site/agent ingestion
later.

## Tooling

### Adopt now

- **Citekey convention** in `sources.md` (above) — zero tooling, foundation for
  everything else.
- **lychee** via `lycheeverse/lychee-action` — open-source Rust link checker,
  actively maintained (verified 2026-08). Runs on push **and a weekly cron**
  (link rot happens between commits). Mechanically enforces the traceability
  chain — broken internal links fail CI — and automates the "re-verify every
  link resolves" chore in `sources.md`'s quarterly review. Configure to open a
  GitHub issue on new failures. Free-tier Actions minutes are a non-issue for a
  docs check on a private repo.

### Adopt later (named so they are not re-researched)

- **llms.txt** — for the site, when it exists. Adoption at ~14% of top-100k
  sites (June 2026), W3C standardization proposal filed June 2026. Our
  markdown-with-frontmatter is already the right substrate.
- **Zotero + Better BibTeX** — only if the registry outgrows one file (~50+
  sources) or the site needs CSL-JSON export.
- **Quartz or Astro Starlight** — site-generator candidates that consume this
  format as-is. Decision belongs to the site's own spec.

### Considered and rejected

- **Pandoc + citeproc/BibTeX** — academic citation rendering; we need traceable
  links, not formatted bibliographies.
- **Obsidian/Foam wikilinks** — nonstandard syntax: no GitHub rendering, tool
  lock-in, unverifiable by lychee. Plain relative markdown links everywhere.
  (Obsidian as a local viewer is fine; files must never depend on it.)
- **Frontmatter schema validation** — scaffolding at 4 files × 3 fields.
  Revisit if `questions/` reaches dozens of files.

## Seeding (part of this work, not deferred)

Empty structure rots. Four question notes seeded with real positions and
citations from research already in hand:

1. Does spec-driven development actually reduce rework and drift?
2. Where must human review sit in an agentic SDLC for the ROI to materialize?
3. Which benchmark results can actually inform tool selection?
4. What must be true of a team before agentic adoption amplifies rather than
   degrades?

## Error handling & testing

For a docs system these reduce to integrity checks: lychee in CI is the test
suite (internal chain + external rot). The spec self-review and change-order
rule are the process-level guards. No other machinery.

## Out of scope

The website and any generator/JSON export; evidence-grading rubrics; AGENTS.md
(revisit when agent-driven work starts in earnest here); frontmatter validation.

## Success criteria

- Every playbook claim is two clicks from a primary source.
- CI fails when the traceability chain breaks.
- The four seeded questions each state a position and a falsifier.
- Total ongoing overhead stays under the existing monthly/quarterly cadence.
