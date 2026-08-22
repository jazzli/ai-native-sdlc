# Contributing

The most valuable contribution to this project is evidence that a published
position is wrong.

## Challenging a position

Every position page carries a challenge link that opens an issue naming that
position. Use it rather than a blank issue: it records which position you are
disputing and how it was published at the time.

A challenge is strongest when it names a primary source and says what that
source measures. Challenges pass the same filter as any other source:

1. Does it publish its methodology?
2. Does it report null results?
3. Is it primary, rather than a description of someone else's finding?

A challenge that fails the filter is answered on the record rather than
closed silently. A challenge that succeeds changes the question note first
and the playbook second, and the change is listed in the changelog.

## Proposing a source

Open an issue with the source, what it measures, and which open question it
speaks to. Sources are admitted to `sources.md` with a tier, a citekey
anchor, and a stated reason they passed the filter. Entries are verified
against the primary source on admission, not against a summary of it.

## Changing content

Read [docs/protocol.md](docs/protocol.md) first. It is one page and governs
every content change, in particular the order: registry entry, then question
note, then playbook. A position may not assert more than its cited entry
records.

## Changing code

```sh
cd site
npm ci
npm run build      # required before npm test, which asserts on site/dist
npm test
npm run lint && npm run typecheck && npm run format:check
```

One-time setup: `git config core.hooksPath .githooks`. The pre-commit hook
checks note shape and internal links; do not bypass it with `--no-verify`.

Work on a branch and open a pull request. `main` requires both status checks
to pass and cannot be pushed to directly. Pull requests state why the change
exists, what changes, and how it was verified; see the conventions in
[AGENTS.md](AGENTS.md).

## Scope

This project takes positions on how to build software with AI agents and
supports them with primary sources. It is not a link directory, a news
aggregator, or a listing of tools. A contribution that does not change what
the evidence supports is unlikely to be merged.
