# Capability Architecture — Design

**Date:** 2026-08-23
**Status:** approved

## Purpose

Make this project able to assess another repository's software-development
lifecycle, rather than only publish positions about parts of one. That needs
a map of the domains, a way to describe a target repository, and a way to
report what it contains — without asserting more than the evidence here
supports.

## Context

The capability model this was asked for spans roughly thirteen domains. This
project holds nine positions and two open questions. They bear on about
eight domains, and each is a single narrow claim inside one rather than
coverage of it. Persistence, testing depth, documentation, runtime
performance, and repository boundaries had no note, no source, and no
position. Observability is carried as an open question on purpose.

Every mechanism here had been validated against one repository, on one
stack.

Protocol Rule 1 forbids asserting more than the cited registry entry
records. A capability model that recommended practice across thirteen
domains would have broken that rule in five of them.

## Decisions

**Uncovered domains are published as uncovered, and offer nothing.** The
alternative — filling them with conventional best practice labelled as
inference — would put unsourced advice on a site whose value is that claims
trace to primary sources. Five of fifteen domains report `uncovered`, and a
test asserts they carry no guidance.

**Evidence is derived, support is authored.** A domain's evidence level
comes from the status of the notes it links, so it cannot claim knowledge
the playbook does not hold, and a note changing status moves its domain with
it. Support — what ships here that an adopting repository could use — is a
separate, authored claim about this project's mechanisms. Conflating them is
how "generic" becomes "validated".

**Support is resolved against shapes actually assessed, not shapes that
ought to work.** `VALIDATED_SHAPES` holds one entry. Every other repository,
including a near miss such as pnpm in place of npm, resolves to
`assessment-only` and is told why. The list grows when a real repository of
a new shape has been assessed and the result reviewed.

**An assessment reports observations, never verdicts.** Three kinds of
statement are kept apart: what was observed, what needs the host's API, and
what requires judgment the tool cannot make. Absence of an observation is
not a finding, because a repository may enforce something a file-level probe
cannot see. A test asserts the report carries no field that ranks a
repository.

**The map, the manifest, and an adopted policy share one vocabulary.** Every
note carries its domain, so an assessment of a repository and the policy
that repository adopted name the same things.

## Consequences

Accepted:

- The assessment is shallow by construction. It observes files, not
  behaviour, and says so in every domain it touches.
- Six domains are `assessment-only` and three are `first-class`. That
  disparity is now published rather than implied.
- Adding a note requires placing it on the map. The build fails otherwise,
  which is deliberate: a map that silently stops describing the playbook is
  worse than a build error.
- The capability map is a fourth authored artefact alongside the playbook,
  the notes, and the registry. It is derived where it can be, but the
  taxonomy and the support levels are judgment and will need revisiting.

## Unresolved risks

- **The taxonomy is unvalidated.** Fifteen domains is one person's map of
  the territory. Nothing tests that it carves the space usefully, and a
  domain that is missing will not announce itself.
- **`first-class` rests on n=1.** One repository of one shape has been
  assessed. The label is honest about what it means, but the sample cannot
  support a claim that the mechanisms generalise.
- **Probes drift silently.** A probe looks for file names. Conventions
  change, and a probe that stops matching reports "nothing observed", which
  is indistinguishable from a repository that genuinely has nothing.

## Handoffs

- **Host-API probes.** Branch protection, required checks, secret scanning
  and release history are determinable but need credentials and a different
  trust model than a file-level tool. Not attempted here.
- **Filling uncovered domains.** Each needs the ordinary route: admit
  sources through the filter, write a question note, then take a position.
  Five domains are waiting.
- **Second validated shape.** The most valuable single addition is an
  assessment of a repository this project did not write.
