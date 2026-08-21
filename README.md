# AI-Native SDLC

Evidence-tiered positions on AI-native software development — every claim
traceable to a primary-verified source, and every position stating what
would change it.

## The chain

```
docs/playbook.md  →  docs/questions/*.md  →  sources.md#<citekey>  →  primary source
   positions          evidence + falsifiers    filter-stated registry
```

The chain is enforced mechanically at three layers: a pre-commit hook, CI
link/fragment checking on every push and PR (plus a weekly rot cron), and a
site build that fails on any unresolvable reference or any question note
missing its falsifier section.

## What's here

- [docs/playbook.md](docs/playbook.md) — the positions, in prose
- [docs/questions/](docs/questions/) — one file per question: stated
  position, evidence, and **what would change my mind**
- [sources.md](sources.md) — the registry: tiered, filter-stated,
  primary-verified
- [docs/protocol.md](docs/protocol.md) — the five rules governing all of it
- [site/](site/) — the public site: single-sourced from the files above,
  agent-ingestible (raw markdown variants + `llms.txt`), zero client JS
- [watch/](watch/) — the daily discovery sweep: practitioner feeds, Hacker
  News, arXiv, releases, and change-detection targets into a triage queue
- [AGENTS.md](AGENTS.md) — working rules for coding agents in this repo

## Challenging a position

Every position page carries a challenge link that opens a pre-filled issue
naming that position. Challenges pass the same signal filter as any other
source — does it publish methodology, report null results, is it primary —
and the monthly watch triages them ahead of its own research. A challenge
that fails the filter is answered on the record rather than deleted.

## Working on the site

```
cd site
npm ci
npm run dev        # local dev server
npm test           # plugin + enforcement tests
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
npm run format     # prettier
```

One-time repo setup: `git config core.hooksPath .githooks`

## Method, in one paragraph

Sources are admitted through a three-question signal filter (published
methodology? null results reported? primary?). Registry entries are
verified against their primary sources on admission and re-checked
quarterly. Positions change only after their question note changes, and the
note changes only after the evidence does. Corrections are recorded, not
erased — the history of this repo includes its own mistakes, on purpose.
