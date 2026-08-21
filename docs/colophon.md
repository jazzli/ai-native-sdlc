# How This Site Is Built

This site recommends practices for AI-native software development. It was
also built by them: one human directing agents, over three days, across
[125+ commits](https://github.com/jazzli/ai-native-sdlc/commits/main) and two dozen pull requests — every line of
code, content, and infrastructure agent-written under human review gates.

State the caveats first, because that is the house style: this page is a
self-report, n=1, from a tiny team, describing a days-old codebase. It is
the same source class as the vendor case studies in the
[registry](../sources.md) — admitted there under the label "primary for its own
practice; self-reported, no methodology." Judge this page by the same
filter. What it offers that prose claims cannot: every receipt below is a
public commit or pull request you can read.

## The practices, applied to themselves

**Spec-driven development** ([position](playbook.md)) — every feature here
began as a committed spec and plan before any implementation:
[the methodology layer](https://github.com/jazzli/ai-native-sdlc/pull/1), [the site](https://github.com/jazzli/ai-native-sdlc/pull/6),
[the currency layer](https://github.com/jazzli/ai-native-sdlc/pull/23), the OG cards. The specs and plans are in
the open repo, including their mid-execution amendments.

**Human attention at the gates** — every task was implemented by a fresh
agent, then reviewed by a different agent instructed to be adversarial,
with a whole-branch review before each merge. The gates caught real
defects, not style nits. Three worth reading:

- A registry entry asserting the **opposite** of its primary source — the
  gloss propagated into two content layers before the final review caught
  it by re-reading the source PDF ([fixed in #2](https://github.com/jazzli/ai-native-sdlc/pull/2)). The protocol
  gained a rule (entries are verified against primaries) because the
  review method itself had a blind spot.
- The site's falsifier-section enforcement **failing open** — the one
  element whose absence should fail the build, silently not doing so
  ([caught in the #6 final review](https://github.com/jazzli/ai-native-sdlc/pull/6)).
- Long OG-card titles silently unclamped and overlapping the footer,
  because the renderer's clamp only engages on one display mode — found
  only because the reviewer **rendered the images and looked at them**
  ([#25](https://github.com/jazzli/ai-native-sdlc/pull/25)).

**Foundations before scale** — link and fragment integrity, note-shape
checks, format/lint/typecheck/test gates, and required status checks all
predate every content expansion. The gates have rejected work: two
dependency-major upgrades arrived broken and
[were held](https://github.com/jazzli/ai-native-sdlc/pull/16) [by policy](https://github.com/jazzli/ai-native-sdlc/pull/18) rather than merged, then
the frameworks [migrated deliberately](https://github.com/jazzli/ai-native-sdlc/pull/20).

**Hand-written, minimal context files** — this repo's
[AGENTS.md](https://github.com/jazzli/ai-native-sdlc/blob/main/AGENTS.md) is short, requirement-focused, and
carries its own growth rule, because the
[evidence in our registry](questions/do-context-files-pay-off.md) says
bloated context files cost money and buy no correctness.

**Mechanical enforcement over prose** — the rules the
[protocol](protocol.md) states in prose are enforced by machines: a
pre-commit hook, CI on every push, a build that throws on a broken citation
chain, a missing falsifier section, or a glyph the card fonts cannot
render. When Dependabot delivered an incompatible TypeScript major, no
instruction was involved in rejecting it — `npm ci` refused the tree.

**The security posture** — fetched web content is treated as data, never
instructions ([AGENTS.md](https://github.com/jazzli/ai-native-sdlc/blob/main/AGENTS.md)); the
[monthly falsifier watch](https://jazzli.github.io/ai-native-sdlc/changelog/) runs with read-and-search tools
only, no connectors, and files issues rather than editing content.

**The harness** ([position](questions/what-makes-a-production-agent-harness.md))
— the build process used isolated per-task agents with curated briefs,
machine-readable feedback, and review loops: the same five convergent
elements the harness note describes at OpenAI, Stripe, and Ramp scale,
exercised here at n=1.

**Not exercised: benchmark-driven tool choice.** The
[benchmarks position](questions/which-benchmarks-inform-tool-selection.md)
recommends self-built evals over leaderboards; this project chose its
tools without either. Honesty requires saying so.

## The self-correction record

The [changelog](https://jazzli.github.io/ai-native-sdlc/changelog/) is generated from the registry's own review
log, so the corrections are not commentary — they are the record. The one
that matters most: within a day of launch, the
[falsifier watch surfaced independent telemetry](https://github.com/jazzli/ai-native-sdlc/pull/24) against a
published position, and the site
[downgraded its own confidence](questions/preconditions-for-agentic-adoption.md)
in public, with the tension stated rather than smoothed.

## What would change this page

- Evidence that the review gates missed a defect class that shipped —
  which the public issue tracker would record.
- The practices failing at larger n: a second project, more humans, or a
  longer timeline producing materially worse outcomes under the same
  methods.
- Independent replication being impossible: if a reader following the
  specs, plans, and AGENTS.md in this repo cannot reproduce the workflow,
  this page overclaims.
