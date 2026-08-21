# Per-Page OG Cards — Design

**Date:** 2026-08-21
**Status:** approved (user: "Approve, proceed all the way")

## Purpose

Links shared to the site currently unfurl as text-only cards. Every content
page gets a build-time-generated 1200×630 PNG Open Graph card so shares
render as large cards, with per-page content (a shared position shows THAT
position, status chip and all).

## Decisions

| Decision | Choice |
| --- | --- |
| Mechanism | Astro static endpoint `src/pages/og/[...slug].png.ts`; satori (layout→SVG) + @resvg/resvg-js (SVG→PNG) at build. Cards regenerate with content; render errors fail the build |
| Card set (15) | index, 9 positions, 2 questions, sources, protocol, changelog. 404 and raw `.md` variants excluded |
| Fonts | Vendored into `site/src/og-fonts/` with OFL license texts: Inter Regular+Bold, JetBrains Mono Regular (satori needs font buffers; TTF/OTF/WOFF v1 — NOT woff2). Build-time only; visitors still load zero webfonts |
| Visual | Ink ground (#15201e family), teal favicon square top-left, title large in sans (max 2 lines, ellipsized); notes carry status chip (working-answer teal / open amber) + `updated YYYY-MM-DD` mono; singles carry a one-line subtitle (index: strapline + live counts). Footer: wordmark + site URL in mono. Single variant |
| Wiring | Shared `ogSlug(pathname)` maps page path → card slug, used by BOTH `Base.astro` (emit absolute `og:image`, width/height, `twitter:card=summary_large_image`) and the endpoint's `getStaticPaths` — parity is tested. 404 emits no image tag |
| Error handling | Fail-closed: unknown slug, missing font, or satori/resvg error throws at build. No fallback card |

## Testing

- `renderCard` output: PNG magic bytes, decodes at 1200×630.
- Parity: every built page's `og:image` target ∈ the endpoint's slug set
  (derived from real content, like the link-walk test).
- Note cards read real title/status from the collection.
- Build check: 15 PNGs under `dist/og/`.

## Out of scope

Dark variants, per-platform sizes, animated cards, per-changelog-entry cards.
