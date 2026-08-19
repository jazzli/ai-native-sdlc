# AGENTS.md

Research content engine for an eventual public reference on AI-native
software development. Everything here is plain markdown built around one
traceability chain:

`docs/playbook.md` → `docs/questions/*.md` → `sources.md#<citekey>` → primary source

Read `docs/protocol.md` (one page, five rules) before changing content.

## Requirements

- Never assert more than the cited registry entry records. If a claim needs
  more, enrich the entry from the primary source first (protocol Rule 5),
  then update the note, then the playbook — in that order (Rule 4).
- Unsourced reasoning must be labeled as inference in the text, not left
  reading as sourced.
- New `sources.md` entries: citekey anchor (`<a id="...">`, kebab-case,
  permanent), a **Filter:** line stating which of the three signal-filter
  questions it passes, and verification at the primary source on admission.
- Question notes: frontmatter is exactly `title`, `status`
  (`open | working-answer | parked`), `updated` (YYYY-MM-DD); a
  `## What would change my mind` section with concrete falsifiers is
  mandatory. Bump `updated` when content changes.
- Plain relative markdown links only; never `[[wikilinks]]`. The playbook
  never cites `sources.md` directly.
- Verify with `lychee --config lychee.toml --no-progress .` before pushing;
  never weaken `lychee.toml` or the workflow to get green. New accept-codes
  or excludes need a comment naming the host and reason.
- Work on a feature branch; open a PR; CI must pass. Commits end with a
  `Co-Authored-By:` trailer.

This file is deliberately minimal: the repo's own research
(`docs/questions/do-context-files-pay-off.md`) finds no correctness benefit
from context files and real cost from bloated ones. Add a line here only if
an agent actually got it wrong without one.
