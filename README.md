# AI-Native SDLC

Evidence-tiered positions on AI-native software development. Every claim
traces to a primary-verified source, and every position states what would
overturn it.

[Read the playbook](https://jazzli.github.io/ai-native-sdlc/) ·
[Adopt it](https://jazzli.github.io/ai-native-sdlc/adopt/) ·
[Sources](https://jazzli.github.io/ai-native-sdlc/sources/) ·
[Changelog](https://jazzli.github.io/ai-native-sdlc/changelog/)

Positions carry confidence, not certainty. They are downgraded in public when
evidence arrives, and the changelog is the record. Some questions are carried
open with no position at all.

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
- [docs/capabilities.md](docs/capabilities.md) — the capability map: which
  domains of an agentic SDLC this project has a position on, which it carries
  open, and which it has nothing to say about
- [docs/protocol.md](docs/protocol.md) — the five rules governing all of it
- [site/](site/) — the public site: single-sourced from the files above,
  agent-ingestible (raw markdown variants + `llms.txt`), zero client JS
- [watch/](watch/) — the daily discovery sweep: practitioner feeds, Hacker
  News, arXiv, releases, and change-detection targets into a triage queue
- [docs/design/](docs/design/) — design records, and the historical
  implementation plans that followed them
- [AGENTS.md](AGENTS.md) — working rules for coding agents in this repo

## Adopting this

Copy the generated policy and its digest lockfile into a repository:

```sh
mkdir -p docs
curl -fsSL https://jazzli.github.io/ai-native-sdlc/starter/sdlc-policy.md \
  -o docs/sdlc-policy.md
curl -fsSL https://jazzli.github.io/ai-native-sdlc/starter/sdlc-upstream.json \
  -o docs/sdlc-upstream.json
```

Both files work unedited. Each position arrives with its claim, its
falsifiers, how it is enforced here, and a recorded content digest; two lines
per position describe the adopting repository and are the adopter's to write.
A scheduled check reports when an upstream digest moves. See
[adopt](https://jazzli.github.io/ai-native-sdlc/adopt/) for the agent-driven
path and the drift check.

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
npm run dev           # local dev server
npm run build         # static build into site/dist
npm test              # unit + rendered-output tests
npm run typecheck     # astro sync && tsc --noEmit
npm run lint          # eslint, spanning site/ and watch/
npm run format:check  # prettier, spanning site/ and watch/
npm run test:coverage # informational; no thresholds
npm run check-policy  # validate an adopted policy against the contract
```

`check-policy` takes an adopter's policy and digest lockfile and checks what
[adopt](https://jazzli.github.io/ai-native-sdlc/adopt/) requires: every
position mapped by id, falsifiers carried, digests recorded for each. It
asserts presence rather than layout, so a policy that has been reorganised
still passes. Exit codes are `0` conforming, `1` errors, `2` could not run.

`npm test` runs two suites. The unit tests always run; the rendered-output
tests in `tests/rendered.test.ts` assert against `site/dist` and **skip when
it is absent** — so run `npm run build` first to exercise them the way CI
does. CI builds before testing and sets `REQUIRE_RENDERED=1`, which turns a
missing `dist/` into a failure rather than a silent skip.

One-time repo setup: `git config core.hooksPath .githooks`

## Method, in one paragraph

Sources are admitted through a three-question signal filter (published
methodology? null results reported? primary?). Registry entries are
verified against their primary sources on admission and re-checked
quarterly. Positions change only after their question note changes, and the
note changes only after the evidence does. Corrections are recorded, not
erased — the history of this repo includes its own mistakes, on purpose.

## How this is built

This repository is written with coding agents working under human review, on
a project about how to do that well. Positions, source entries, and
corrections are the maintainer's responsibility regardless of what produced
the first draft; the rules agents follow here are in
[AGENTS.md](AGENTS.md), and the practices behind each position are recorded
in the [colophon](https://jazzli.github.io/ai-native-sdlc/colophon/).

## License

MIT. See [LICENSE](LICENSE).
