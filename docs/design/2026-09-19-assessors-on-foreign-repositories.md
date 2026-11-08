# The assessors, run on repositories this project did not write

**Date:** 2026-09-19. **Status:** done; four defects fixed, five shapes
validated, no shape demoted.

## Context

Until today `tools/assess.mjs` and `tools/assess-host.mjs` had been run on
exactly one repository: this one, assessing itself. `VALIDATED_SHAPES` had one
entry, and every `first-class` claim in the capability map rested on it. The
adoption contract promises an adopter that the assessor's observations are
facts about their repository; that promise had never been tested against a
repository whose layout the author did not already know.

## What was run

Seven repositories, chosen for shape rather than fame: this one (Node/npm,
the baseline); `jazzli/ordomata` (Python, no lockfile by design) and
`jazzli/ordomata-agent-host` (shell and prose, no manifest at all), both
private; and four public ones cloned shallow — `pallets/flask` (Python/uv),
`BurntSushi/ripgrep` (Rust/cargo), `expressjs/express` (Node, no lockfile),
`unjs/ofetch` (Node/pnpm). The host assessor was run against `jazzli/ordomata`,
`pallets/flask` and this repository.

## What it found

Four defects, in descending severity. Every one is the same shape: the
assessor looked in one place, the repository kept the thing in another, and
the report said _absent_ where it should have said _elsewhere_ or _cannot
see_.

1. **The host assessor read only the rulesets API.** `jazzli/ordomata` is
   protected the older way — branch protection with five required checks and
   one code-owner review — and carries no ruleset. The assessor reported it
   as unprotected: no required checks, direct pushes allowed, force-pushable,
   deletable. That is a false "not configured" on the one claim a host
   assessor exists to make. It now reads both mechanisms and merges them.
   The legacy endpoint also answers 404 to two different situations — "Branch
   not protected" to an administrator, a bare 404 to everyone else — and only
   the first is an absence; the second is now reported as "cannot see".
2. **Probes looked only at the repository root.** The profile already knew
   the manifest could sit one level down, but the per-domain probes did not,
   so this repository's own tests, lint and type configuration under `site/`
   were reported absent. Testing showed "nothing observed" on a repository
   with two hundred tests. Probes now look where the manifest lives as well.
3. **Lint configured inside `pyproject.toml` was invisible.** Ruff, mypy,
   pyright, pytest and coverage all commonly live there; `ordomata` and
   `flask` both reported no lint configuration. `rustfmt.toml` was not in the
   list either, so `ripgrep` reported none. Both are now detected.
4. **A manifest without a lockfile reported an unknown package manager.**
   `express` commits no lockfile, `ordomata` has no dependencies to lock;
   both were reported as unknowable when they were merely unlocked. The
   manifest names the manager (npm unless `packageManager` says otherwise;
   pip; cargo; go), and the missing lockfile is now recorded where it
   belongs — as a boundary finding, "no dependency lockfile is committed" —
   which is a real supply-chain observation, not a profiling failure.

## Decisions

- **Five shapes are now validated**, each annotated in `VALIDATED_SHAPES`
  with the repository it was run against and the date: Node/npm, Node/pnpm,
  Python/uv, Python/pip, Rust/cargo, all on GitHub Actions and GitHub. A
  shape enters that list only after the assessor has been run on such a
  repository and its findings read against the repository itself.
- **A repository with no manifest stays `assessment-only`.** The agent-host
  repository — shell scripts and prose — is a real shape, and the assessor
  has nothing to say about it beyond CODEOWNERS and CI. Saying so is the
  correct output.
- **"Cannot see" is kept distinct from "not configured" at every new
  seam.** The rulesets-only bug was a collapse of the two; the fix adds a
  third state rather than a smarter guess.

## Consequences

- The capability map's `first-class` entries now rest on n=6 across three
  runtimes rather than n=1, which is the claim the adoption contract was
  making all along.
- The assessor is still a file-layout reader. It cannot tell whether a check
  fails closed, whether tests assert behaviour, or whether a lockfile is
  honoured — and it says so on every domain. Widening what it _sees_ did not
  narrow what it _cannot judge_.
- The seven repositories are a convenience sample. The next defect will
  come from a shape not in it: a monorepo with several manifests, a GitLab
  host, a JVM build. Those are named as unvalidated, not assumed.
