# Colophon — Design

**Date:** 2026-08-21
**Status:** approved (concept approved by user; this fixes the specifics)

## Purpose

A "how this site is built" page turning the repo's own history into the
trust artifact: the practices the playbook recommends, applied to building
the site that carries them — with commit/PR receipts for every claim.

## Decisions

| Decision | Choice |
| --- | --- |
| Content home | `docs/colophon.md` — a singles-collection markdown doc like protocol/playbook, single-sourced to the site. NOT a playbook position, NOT a question note (protocol Rule 3 governs the playbook only); its evidence layer is the git history itself, cited as GitHub PR/commit URLs that lychee verifies |
| Epistemics | Self-report caveats stated upfront (n=1, one human + agents, days old — same source class as the registry's vendor case studies, judged by the same filter language). Closes with its own "What would change this page" section — the falsifier convention applied to the meta-claim |
| Structure | Premise → the chain in one paragraph → position-by-position "practiced here" receipts (positions with no honest receipt say so — benchmarks position was NOT exercised in tool choice, stated plainly) → the self-correction record → caveats + falsifiers |
| Route | `/colophon/` via the singles pattern; raw variant `/colophon.md`; page-kind OG card (subtitle: "The practices this site recommends, applied to building it") — card count 15→16 |
| Discovery | Footer link on every page ("How this site is built"), replacing nothing; llms.txt Reference line. Masthead nav unchanged (four items is the spine) |
| Changelog | One review-log row announcing it (site-launch row is precedent for non-registry events) → flows to changelog/feed automatically |

## Authoring split

Content (docs/colophon.md + review-log row) is authored by the controller —
the session ledger and git history are the source material — then
fact-checked by a dedicated reviewer verifying EVERY claim and link against
the actual history. Site wiring (collection glob, page, raw endpoint,
ogSlug/allCardTargets, Base footer, llms.txt, test bumps) is a subagent task
with the standard review.

## Testing

Existing gates; og targets test 15→16 with parity; colophon appears in
llms.txt and raw set; footer link on all pages; lychee validates the
GitHub receipt URLs.

## Out of scope

Playbook/protocol edits; a tenth position; metrics dashboards; screenshots.
