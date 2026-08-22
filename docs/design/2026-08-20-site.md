# Public Site for ai-native-sdlc — Design

**Date:** 2026-08-20
**Status:** approved pending user review

## Context

The deferred site project from the methodology-layer design
(`2026-08-19-methodology-layer-design.md`, "Out of scope"). The content
engine now holds 6 playbook positions, 2 open questions, 8 question notes,
and a 22-entry primary-verified registry. The site publishes that content
for developers and AI practitioners, human-readable and agent-ingestible.

## Decisions already made

| Decision | Choice |
| --- | --- |
| Primary job | Playbook-first: "tell me what to do," positions as the product |
| Stack | Astro with custom layouts (approach A) — full IA control, markdown-native, zero client JS by default |
| Source visibility | Repo goes public at launch — but the flip is a separate, explicitly confirmed launch decision, never part of implementation |
| URL | `https://jazzli.github.io/ai-native-sdlc` for now; custom domain later is a one-line `base`/`site` config change |
| Single-sourcing | Site reads `docs/` and `sources.md` in place; no content copied, moved, or reformatted for the site's benefit |

## Structure

```
site/                       # Astro project (new)
  astro.config.mjs          # site + base config, single spot
  src/
    content.config.ts       # collections: notes (glob ../docs/questions/),
                            # singletons (playbook, protocol, sources)
    lib/rewrite-links.ts    # the link transform (see below)
    layouts/                # base + note layout
    pages/
      index.astro           # positions + open questions
      positions/[slug].astro
      questions/[slug].astro
      sources.astro
      protocol.astro
      llms.txt.ts           # generated, not hand-written
  public/                   # favicon etc.
.github/workflows/deploy.yml  # new; links.yml untouched
```

## Pages (5 types, 11 pages at current content)

- **`/`** — the six position statements rendered plainly from
  `docs/playbook.md` sections, each linking its page; then the two open
  questions under an honestly-labeled heading; then one short paragraph on
  what the site is, linking `/protocol/`.
- **`/positions/<slug>/`** — one per `working-answer` note. Layout mirrors
  the note: question, current position, evidence (citekeys link to
  `/sources#<citekey>`), and **What would change my mind** as a visually
  distinct first-class block — the site's signature element. Status badge
  and `updated` date visible.
- **`/questions/<slug>/`** — same layout for `status: open` notes, framed
  as questions not yet answered. Split is driven by frontmatter `status`;
  a note flipping status moves pages automatically on next build. `parked`
  notes (none exist yet) render under `/questions/` with a parked badge.
- **`/sources/`** — `sources.md` rendered whole: signal filter, tiers,
  review log. Citekey anchors (`<a id="...">`) must survive rendering so
  `/sources#dora-2025` resolves — every evidence link on the site targets
  these.
- **`/protocol/`** — `docs/protocol.md` rendered. The trust anchor.

The playbook page itself has no separate URL: `/` is the playbook.

## Link rewriting (the one hard part)

A build-time transform maps source-relative links to site URLs:

| In source markdown | On the site |
| --- | --- |
| `../../sources.md#<citekey>` (from notes) | `/sources#<citekey>` |
| `../sources.md#...`, `sources.md#...` (protocol, playbook) | `/sources#...` |
| `questions/<slug>.md` (from playbook) | `/positions/<slug>/` or `/questions/<slug>/` by that note's status |
| `<slug>.md` (note → sibling note) | same status-aware mapping |
| `protocol.md`, `docs/protocol.md` | `/protocol/` |
| `questions/` (bare directory link, used by protocol.md) | `/` |
| Same-page anchors (`#signal-filter`, `#maintenance`) | pass through unchanged |

**The transform fails the build** on any internal link whose target file,
slug, or citekey anchor does not exist — extending the repo's traceability
enforcement into the publishing layer. External links pass through
untouched (lychee owns those).

## Agent ingestion

- **Raw markdown variants:** every content page serves its source at a
  parallel `.md` URL (e.g. `/positions/<slug>.md`), with the *rewritten*
  links so citations resolve for an agent reading the raw file. Each HTML
  page links its own `.md` variant visibly.
- **`llms.txt`** at the site root, generated at build from the same
  collections: site description, then links to the `.md` variants of the
  index, each position/question, sources, and protocol, each with a
  one-line description drawn from frontmatter/first paragraph.

## Visual intent

Direction, not pixel spec — details at implementation via the
frontend-design skill:

- Text-first, fast, zero client-side JS by default.
- Three identity elements: position statements set large and plain; the
  falsifier block styled as a first-class object, never a footnote;
  status + `updated` visible everywhere — intellectual honesty is the brand.
- Light and dark both supported.

## Deploy & CI

`deploy.yml`:
- **On pull_request:** build the site (`astro build` + `astro check` if TS
  is used). A failed build blocks merge — second required check beside
  lychee.
- **On push to main:** build and deploy to GitHub Pages via
  `actions/deploy-pages` (Pages source: GitHub Actions).
- Node LTS, npm cache. `links.yml` untouched. `lychee.toml`'s
  `exclude_path` gains `site/` only if lychee ever chokes on site
  internals; not preemptively.

While the repo is private, GitHub Pages deployment requires the repo to be
public on the free plan — so **deploys are verified only at launch**; until
then, PR builds + local preview are the verification. The deploy job must
therefore tolerate Pages being unconfigured (deploy step conditional or
allowed to fail without failing the workflow) until launch.

## Testing / enforcement

1. lychee on source files (existing, untouched).
2. Link-rewrite transform failing the build on unresolvable internal
   references (new — the site-side chain check).
3. PR build check (new).
4. Manual: local `astro preview` pass over all 11 pages before the launch
   PR.

## Out of scope

Repo visibility flip (launch decision, separately confirmed at launch);
custom domain; search; analytics; RSS; comments; `llms-full.txt`; CMS;
publishing cadence/currency features; visual regression tooling.

## Success criteria

- Every position page shows position, evidence, and falsifier with every
  citekey link resolving to `/sources#<citekey>`.
- A deliberately broken internal link or citekey fails the PR build.
- Every content page has a working raw-`.md` variant; `llms.txt` lists them
  and parses per the spec's plain-markdown convention.
- No content file was modified to make the site work.
- Zero client-side JavaScript shipped on any page (view-source check).
- The repo is still private when implementation ends; going public is its
  own confirmed step.
