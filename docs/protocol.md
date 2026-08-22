# Research Protocol

How research happens in this repo. One page; five rules.

This repo is the research engine behind an eventual public reference for
developers and AI practitioners navigating the AI × software development
space. Near-term it is a personal thinking tool; everything is written so it
can later be published and machine-ingested without rework.

## The five rules

1. **Admission.** Sources enter [sources.md](../sources.md) only through its
   [signal filter](../sources.md#signal-filter): does it publish methodology?
   report null results? is it primary? State which questions a new entry
   passes when adding it.
2. **Reading discipline.** A source read either updates at least one question
   note in [questions/](questions/) or is consciously dropped. No passive
   collecting.
3. **Traceability.** Nothing enters the playbook without a question note
   behind it — one carve-out: the "No position yet" section exists to name
   open questions, which by definition have no answered note. Every playbook
   claim links its note; every note cites registry citekeys
   (`../../sources.md#<citekey>`). The chain is
   `playbook.md → questions/*.md → sources.md → primary source`, and CI
   (lychee) fails when a *link* in it breaks. lychee checks URL and anchor
   resolution only — it cannot tell whether a claim still matches its source.
   That is Rule 5's job, and it is manual.
4. **Change order.** When a position shifts, update the question note first;
   the playbook follows. The prose layer never leads its evidence.
5. **Entry verification.** A registry entry's own gloss is a claim *about* a
   source, so it gets checked against the primary artifact — never against the
   notes citing it, which is circular. Do this when the entry is written, and
   again at the quarterly re-rank. A note faithfully echoing a wrong entry is
   the failure this catches; no other rule here can see it.

## Reader challenges

Anyone reading a position can open a challenge from its page — a pre-filled
issue naming the position and asking for the evidence. Challenges are an
intake, not an exception: they pass Rule 1's filter like any other source,
and one that moves a position becomes a registry entry, a note revision, and
a changelog line. A challenge that fails the filter is answered in the issue
and left on the record rather than deleted.

## Question notes

One file per question in [questions/](questions/), kebab-case slug. Exactly
three frontmatter fields (`title`, `status`, `updated`); `status` is
`open | working-answer | parked`. Body sections: `## Question`,
`## Current position`, `## Evidence`, `## What would change my mind`, and —
once a note reaches a working answer — `## How to enforce this`.

The falsifier is mandatory and concrete: a claim without one is not
publishable. The enforcement section is mandatory for a position, and it
must say plainly when a position cannot be mechanically enforced. Most
cannot. A rule that reads like a gate but is not one is worse than an
acknowledged human checkpoint, because only the first is mistaken for
safety. A stale `status` is an accepted cost.

## Cadence

Inherited from [sources.md](../sources.md) — monthly skim, quarterly full
re-rank. No second calendar. lychee runs weekly in CI and automates the
"re-verify every link resolves" chore.
