# Adoption Contract — Design

**Date:** 2026-08-22
**Status:** approved

## Purpose

A downstream repository adopted this playbook (jazzli/email-work-gateway,
branch `phase/ai-native-sdlc-adoption`) and had to hand-roll everything the
adoption needed: it derived an authority model from prose, mapped positions
by their headings, and recorded currency as `**Upstream checked:**
2026-08-22` — a date, not a pin, because this site publishes nothing better.

That adoption succeeded because the adopting agent was capable, not because
this site made it easy. This change publishes the contract that makes it
reliable for a weaker harness, and makes re-checking mechanical rather than
manual.

## Decisions

| Decision | Choice |
| --- | --- |
| Position ID | The note slug. Frontmatter is locked at exactly three fields by `.strict()` and the protocol, so an `id:` field is out; the slug is already the public URL, so it is already de facto permanent. Declared permanent explicitly, mirroring "citekeys never change once assigned" |
| Versioning | Content digests, no counter. A monotonic number needs stored state that can drift. Top-level digest answers "did anything move?"; per-position digests answer "which ones?" |
| Digest input | The note's **source markdown**, so a digest changes when the position changes but not when the renderer does |
| Manifest generation | An Astro endpoint over the notes collection, mirroring `llms.txt.ts`. Never hand-maintained |
| Adopt page content | `docs/adopt.md` through the singles collection, inheriting the raw `.md` variant, an OG card, and lychee checking like every other page |
| Falsifiers | Included per position, extracted from `## What would change my mind` — the part the downstream adoption found most worth transmitting |

## Components

**`/positions.json`** (`site/src/pages/positions.json.ts`)

```json
{
  "generated": "YYYY-MM-DD",
  "digest": "<12 hex over all position digests>",
  "site": "https://jazzli.github.io/ai-native-sdlc/",
  "protocol": "https://jazzli.github.io/ai-native-sdlc/protocol/",
  "changelog": "https://jazzli.github.io/ai-native-sdlc/changelog.xml",
  "positions": [
    {
      "id": "<slug>",
      "title": "<frontmatter title>",
      "status": "working-answer | open | parked",
      "updated": "YYYY-MM-DD",
      "digest": "<12 hex over source markdown>",
      "url": "<live page>",
      "markdown": "<live raw .md>",
      "falsifiers": ["<one per bullet under What would change my mind>"]
    }
  ]
}
```

Positions are sorted by `id` so output is deterministic by construction, as
`llms.txt` already is. Both `working-answer` and `open`/`parked` notes appear;
`status` distinguishes them, so an adopter can carry open questions as open
rather than mistaking them for guidance.

**`/adopt/`** (`docs/adopt.md` → `site/src/pages/adopt.astro` + `adopt.md.ts`)

**Leads with a single copy-paste block.** The installation method stays what
it already is — paste one instruction at an agent — and the page's job is to
make that one paste produce a rigorous adoption instead of a hand-rolled one.
The prompt therefore instructs the adopting agent to record the manifest
digest and wire its own drift check; the human's experience remains one
paste. The authority model, manifest reference, and drift-check snippet
follow below it, for the agent to read and for a human to audit.

**Security constraint.** The page stays descriptive prose, with the prompt
fenced as material a human copies deliberately. Publishing imperative text
that a passing agent could mistake for instructions would violate this
project's own position that fetched web content is data, not instructions.

**Wiring.** `llms.txt` gains reference lines for the manifest and the adopt
page. OG card target count 16 → 17.

## Testing

- Manifest shape: required keys present; every position carries all fields.
- Determinism: two generations of the same content produce identical digests;
  changing a note's body changes only that position's digest and the
  top-level digest.
- IDs: every manifest `id` matches a real note slug, and the set equals the
  built page set.
- Falsifier extraction: against real notes, non-empty for every position.
- Rendered: `/positions.json` exists in `dist`, parses as JSON, and its ids
  match the built `positions/` + `questions/` directories.

## Out of scope

A hosted drift-check service, webhooks, semver on positions, and any endpoint
accepting input. The site stays static with zero attack surface.
