# Currency Layer — Design

**Date:** 2026-08-20
**Status:** approved pending user review

## Context

The site is live but static in presentation: a visitor cannot tell it is
maintained, and a returning visitor cannot see what moved. The registry
already produces the editorial record — the review log in `sources.md` —
but it renders as a buried table. This design surfaces it as a changelog
page and an Atom feed, and replaces the memory-dependent monthly skim with
a scheduled falsifier watch.

## Decisions already made

| Decision | Choice |
| --- | --- |
| Data source | The existing review-log table in `sources.md`, parsed at build time — no new content files, no duplication |
| Rejected | Separate CHANGELOG.md (drifts); git-history derivation (commit-grained, not reader-grained) |
| Watch runtime | Scheduled cloud agent (monthly Claude routine), not a plain Action |
| Watch authority | The watch never edits content; findings flow through the normal entry → note → playbook pipeline via human-reviewed work |

## Components

### 1. Review-log parser — `site/src/lib/review-log.ts`

- `parseReviewLog(sourcesFile: string): { date: string; markdown: string }[]`
  Extracts rows from the `### Review log` table, preserving table order
  (newest-first). `date` is the `YYYY-MM-DD` cell; `markdown` is the Action
  cell's raw markdown (bold, links intact).
- **Fails closed**: throws if the heading is missing, the table is empty,
  or any row lacks a valid date — a malformed log must fail the build.
- Tests (`site/tests/review-log.test.ts`): parses real `sources.md`
  (≥ 7 entries today); synthetic cases for missing heading, empty table,
  bad date; order preservation.

### 2. `/changelog` page — `site/src/pages/changelog.astro`

- Base layout; entries grouped by date, newest first; each entry's markdown
  rendered through the existing pipeline (links get the site rewrite).
- One line of intro copy: generated from the registry's own review log,
  linking `/sources/#review-log` (heading anchor exists via slugger:
  verify slug `review-log` at implementation).
- Nav in `Base.astro` gains "Changelog" as the fourth item.
- Raw variant `/changelog.md` is NOT built — the log's source of truth is
  `sources.md`, already served raw; llms.txt points there for agents.

### 3. Atom feed — `site/src/pages/changelog.xml.ts`

- Valid Atom: feed `id` = site URL; `updated` = newest entry date
  (`T00:00:00Z`); author = site name.
- Entry `id` = `tag:jazzli.github.io,2026:changelog:<date>:<sha1(markdown) first 12>`
  — stable across rebuilds, unique across same-day entries.
- Entry `link` → `/changelog/`; entry content = the rendered-HTML entry
  (escaped), `type="html"`. Markdown links inside entries are rewritten to
  absolute site URLs.
- Advertised: `<link rel="alternate" type="application/atom+xml">` in
  `Base.astro` head; one line in the llms.txt Reference section.

### 4. Falsifier watch — scheduled cloud routine

- Cadence: monthly, 19th, 09:00 Asia/Singapore.
- Self-contained prompt: clone `github.com/jazzli/ai-native-sdlc` (public);
  read every `docs/questions/*.md` "What would change my mind" section and
  `sources.md`'s Maintenance watchlist; research each falsifier against the
  live web; apply the three-question signal filter to anything found.
- Output contract: if something moved, file ONE GitHub issue titled
  `Falsifier watch YYYY-MM` — findings with primary links, each mapped to
  the note it would change, explicitly labeled confirmed/plausible; if
  nothing moved, end with a no-change report and file nothing.
- The watch never commits, never edits content, never closes issues.

## Enforcement & tests

- Parser failure fails the build (site-build gate).
- `site/tests/` gains review-log tests; the llms.txt/nav changes are
  covered by build greps in the plan's verification steps.
- the page's internal links are enforced at build time by the link-rewrite
  transform (lychee does not scan .astro files); feed XML validity asserted by a test
  parsing the built output (well-formedness via a strict XML parse).

## Out of scope

og:image/social cards; a weekly change-detection Action; backdating or
restructuring existing review-log entries; RSS 2.0 (Atom only); rendering
the changelog into the raw-markdown variant set.

## Success criteria

- `/changelog` renders every review-log row, newest first, links working.
- `/changelog.xml` is well-formed Atom with stable ids; discoverable from
  every page's head.
- Deleting the review-log table from `sources.md` fails the site build.
- The routine exists, is scheduled monthly, and its first manual test run
  produces a correctly-shaped report.
