# The assessors on foreign repositories: a second wave

**Date:** 2026-11-04. **Status:** findings recorded; no assessor changed.
Seven defects, none fixed here. Finding 1 was fixed separately on
2026-11-11; the other six stand.

## Context

[The first wave](2026-09-19-assessors-on-foreign-repositories.md) ran the
assessors on seven repositories, fixed four defects, and named the shapes it
had not covered: a monorepo with several manifests, a GitLab host, a JVM
build. This wave covers those shapes and four more. Its purpose is
measurement, not repair: every defect is recorded with a reproduction and
left in place, so the next change to the assessor can be judged against a
fixed baseline.

## What was run

Ten public repositories, none covered by the first wave, chosen to vary
language, build tool, host, size and age. Each was cloned shallow at the
commit shown.

| Repository                | Commit    | Shape                                                                          |
| ------------------------- | --------- | ------------------------------------------------------------------------------ |
| `spf13/cobra`             | `adbc881` | Go module, single package, tests beside the code                               |
| `google/gson`             | `5773104` | Java, Maven multi-module                                                       |
| `square/okhttp`           | `00a922d` | Kotlin, Gradle Kotlin DSL, more than 30 projects                               |
| `vitejs/vite`             | `95c2daf` | TypeScript, pnpm workspace monorepo                                            |
| `python-poetry/poetry`    | `6ecadf5` | Python, Poetry lockfile                                                        |
| `sinatra/sinatra`         | `cb22afd` | Ruby, Bundler, three gems in one repository                                    |
| `jqlang/jq`               | `5c001b1` | C, autotools; default branch `master`                                          |
| `openai/codex`            | `93b4e5b` | Rust Cargo workspace under `codex-rs/`, Bazel, root `package.json` for tooling |
| `honojs/hono`             | `28e7498` | TypeScript, pnpm, tests beside the code                                        |
| `gitlab-org/cli` (GitLab) | `571cdce` | Go, GitLab CI, hosted on gitlab.com                                            |

`tools/assess.mjs` ran as the adoption page documents,
`node tools/assess.mjs <clone>`, against the published capability map
(generated 2026-09-19). The assessor code was the head of
`research/assessor-foreign-repos` (`5551be0`). Each repository was assessed
twice, and the two reports were compared byte for byte.

`tools/assess-host.mjs` could not run as documented. Its command-line entry
point first checks `gh auth status`, and that check fails in an environment
where `gh api` is authenticated by a proxy rather than a stored token. The
exported `assessHost()` was therefore called directly with its default `gh`
runner, which makes the same queries. The environment grants API access
only to this project's own repository, so every foreign query was refused
with HTTP 403. The host run therefore tests one thing: whether the assessor
reports a refusal as "cannot see" and not as "not configured". This
repository was the control.

Each report was read against the repository itself. An observation counts
as **true** if the file or setting it names exists and means what the label
says. A **miss** is an artifact of a kind the probe already names in its own
output ("lint, format or type configuration", "dependency update
automation", "test directory", "agent instruction file", and so on), in a
location its tool or ecosystem uses by convention, that the report did not
mention. Gaps in a domain's scope, such as observability, which no probe
attempts, are not counted as misses. Both definitions involve judgment;
the per-repository detail below is there so a reader can reapply them.

## Accuracy

### File assessor

| Repository       | Profile reported                 | Profile verdict                        | Observed (true / total) | Misses |
| ---------------- | -------------------------------- | -------------------------------------- | ----------------------- | ------ |
| `cobra`          | go, go — assessment-only         | correct                                | 10 / 10                 | 2      |
| `gson`           | jvm, unknown — assessment-only   | manager missed (Maven)                 | 8 / 8                   | 3      |
| `okhttp`         | jvm, yarn — assessment-only      | wrong manifest and manager             | 10 / 10                 | 4      |
| `vite`           | node, pnpm — first-class         | correct                                | 12 / 12                 | 3      |
| `poetry`         | python, poetry — assessment-only | correct                                | 17 / 17                 | 0      |
| `sinatra`        | unknown, unknown                 | Ruby not recognized; honest "unknown"  | 10 / 10                 | 1      |
| `jq`             | unknown, unknown                 | correct; no manifest it claims to read | 10 / 10                 | 1      |
| `codex`          | node, pnpm — **first-class**     | wrong; first-class unearned            | 12 / 12                 | 7      |
| `hono`           | node, pnpm — first-class         | correct                                | 12 / 12                 | 1      |
| `gitlab-org/cli` | go, go, gitlab-ci, gitlab        | correct                                | 16 / 16                 | 5      |
| **Total**        |                                  | **6 of 10 correct**                    | **117 / 117**           | **27** |

- **False positives: none.** Every one of the 117 observations names
  something that exists. One is true but misleading: okhttp's
  `maven-tests/.gitignore present` describes a test fixture, which the
  profile mistook for the project (finding 1).
- **Recall: 117 of 144, about 81%**, by the definition above. The misses
  cluster by domain: mechanical enforcement 7, adoption readiness 6,
  testing 4, security 3, repository boundaries 2, review 2, context
  engineering 2, delivery 1.
- **Profile: 6 of 10 correct.** Two are wrong (okhttp, codex), one names
  the runtime but not the manager (gson), and one reports "unknown" for a
  runtime it does not read (sinatra). The support verdict is wrong once:
  codex is reported `first-class`, matching a validated Node/pnpm shape,
  though it is a Rust and Bazel repository with a small Node tooling
  manifest at the root.
- **Crashes: none** on the ten repositories. One crash on a malformed
  invocation (finding 6).
- **Stability: 20 of 20 runs reproduced byte for byte.** One observation
  depends on the operator's local Git configuration rather than on the
  repository, so two clones of the same commit can disagree (finding 7).

The misses do not become false claims: an empty domain prints "nothing
observed — not a finding of absence". Adoption readiness is the exception
in practice. It prints a short list of positives, and a reader of
"continuous integration is configured" without "a test suite is present"
will take the omission as an absence.

Correct negatives also matter. Sinatra keeps a `CODEOWNERS` file in
`.github/workflows/`, where GitHub does not read it, and the assessor did
not report it. Poetry's `.pre-commit-hooks.yaml`, which publishes hooks
rather than consuming them, was likewise not reported as hook
configuration.

### Host assessor

| Target                | Observed | Not configured | Cannot see | Verdict                                                     |
| --------------------- | -------- | -------------- | ---------- | ----------------------------------------------------------- |
| this repository       | 4        | 1              | 4          | all five statements match the host                          |
| nine foreign, refused | 0        | 0              | 6 each     | refusals reported as "cannot see"; one false default branch |

The host assessor reads only GitHub, so `gitlab-org/cli` was not a target.

On the control, the required checks (`site-build`, `linkChecker`,
`pr-title`), the pull request requirement, and the force-push and deletion
protections match the ruleset. "No releases published" was confirmed
against the releases endpoint. On the nine refused repositories, no refusal
was turned into an absence, which is the property the first wave's fix
introduced. The exception is the header: every refused report states the
default branch as `main`, which is false for jq (finding 3). Both runs were
identical.

What the host assessor detects on a foreign repository with read access
was not measured in this wave. That needs a run with credentials this
environment did not have.

## Findings

In descending severity. Every reproduction runs from the repository root
against this branch and needs no network beyond the capability map.

### 1. The profile can describe the wrong project

`detectProfile` takes the first manifest it finds, root first and then each
subdirectory in name order, and locates the lockfile by a separate search
that ignores where the manifest was found. `build.gradle.kts` is not in the
manifest list. In okhttp, the root `build.gradle.kts` is skipped, the
manifest becomes `maven-tests/pom.xml` (a fixture), and the manager becomes
yarn from `kotlin-js-store/yarn.lock`, a Kotlin/JS artifact. The probes are
then pointed at `maven-tests/` as well as the root. In codex, a root
`package.json` with one dev dependency outranks the Cargo workspace that
holds the product, and the shape matches a validated one, so the report
claims `first-class`.

This is the most consequential defect because the profile drives both the
support claim and where the probes look.

```bash
d=$(mktemp -d); mkdir -p "$d/fixtures" "$d/js-store"
touch "$d/build.gradle.kts" "$d/fixtures/pom.xml" "$d/js-store/yarn.lock"
node --input-type=module -e "import {detectProfile} from './tools/assess.mjs'; console.log(detectProfile('$d'))"
# runtime: 'jvm', packageManager: 'yarn', manifestAt: 'fixtures/pom.xml'
```

```bash
d=$(mktemp -d); mkdir -p "$d/core" "$d/.github/workflows"
echo '{"private":true}' > "$d/package.json"
touch "$d/pnpm-lock.yaml" "$d/core/Cargo.toml" "$d/core/Cargo.lock"
node --input-type=module -e "import {detectProfile,resolveSupport} from './tools/assess.mjs'; const p=detectProfile('$d'); console.log(p.runtime, p.packageManager, resolveSupport(p))"
# node pnpm first-class
```

**Fixed 2026-11-11.** A lockfile is now read only from the manifest's own
directory and only for the manifest's runtime; `build.gradle.kts` is a
manifest, and Maven and Gradle are named as managers; a repository that also
holds another runtime's manifest is `assessment-only`, and the report names
those manifests. The profile still reads the first manifest it finds, so
codex is described from its root `package.json` — but it is no longer
certified on that basis. Re-run on fresh shallow clones of the same
repositories, okhttp reads as `jvm, gradle` from `build.gradle.kts`, gson
as `jvm, maven`, and codex as `assessment-only`; the five validated
repositories keep their profiles and `first-class`. The first reproduction
above now reports `runtime: 'jvm', packageManager: 'gradle', manifestAt:
'build.gradle.kts'`, and the second prints `node pnpm assessment-only`.

### 2. Tests are found by root directory name only, and adoption readiness disagrees with testing

The testing probe looks for `tests`, `test`, `__tests__` or `spec` at the
root or beside the manifest. Go keeps tests beside the code (`*_test.go`),
Maven and Gradle under `src/test` or per-module source sets, Rust inside
each crate, and Vite and Hono beside the code or in nested `__tests__`.
Four repositories with substantial suites reported no test directory. The
adoption readiness probe reuses the same directory check and ignores what
the testing probe found, so for Vite and Hono the testing domain reports a
Vitest configuration while adoption readiness omits "a test suite is
present". Six of ten repositories are affected.

```bash
d=$(mktemp -d); mkdir -p "$d/src" "$d/.github/workflows"
echo '{}' > "$d/package.json"; touch "$d/package-lock.json" "$d/vitest.config.ts" "$d/src/a.test.ts"
node tools/assess.mjs "$d" | grep -A2 -E '^## (Testing|Adoption)'
# Testing: observed vitest.config.ts. Adoption readiness: no test suite.
```

### 3. The host assessor states a default branch it could not read

When the repository metadata query is refused, `assessHost` falls back to
`main` and reports it as `defaultBranch`, and its "cannot see" lines name
`main`. For jq, whose default branch is `master`, the report states a fact
that is false. This is the "cannot see" versus "not configured" collapse
the first wave fixed for branch protection, recurring in the header.

```bash
node --input-type=module -e "import {assessHost} from './tools/assess-host.mjs'; console.log(assessHost('o/r', () => { throw { stderr: 'HTTP 403' }; }).defaultBranch)"
# main
```

### 4. Configuration file names are matched exactly, at fixed paths

Several common, valid spellings and locations are missed:

- `.github/dependabot.yaml` (Dependabot accepts both extensions): codex.
- `.github/renovate.json5` (the probe checks only a root `renovate.json`):
  okhttp, vite.
- `.prettierrc.toml` and other Prettier variants: codex.
- `.gitlab/CODEOWNERS` and `.gitlab/merge_request_templates/`, the GitLab
  equivalents of files the probes check under `.github/`: gitlab-org/cli.
- `ChangeLog`, the GNU spelling: jq.
- A nested `AGENTS.md`, which applies to its subtree: codex
  (`codex-rs/code-mode-host/AGENTS.md`).

```bash
d=$(mktemp -d); mkdir -p "$d/.github"
touch "$d/.github/dependabot.yaml" "$d/.github/renovate.json5" "$d/.prettierrc.toml"
node tools/assess.mjs "$d" | grep -A3 -E '^## (Security|Mechanical)'
# both domains: nothing observed
```

### 5. Configuration inside build files, and tools outside the list, are invisible

The first wave fixed this for `pyproject.toml`. The same pattern recurs for
JVM builds: gson configures Spotless and Error Prone in `pom.xml`, and
okhttp applies ktlint and Spotless through Gradle convention plugins in
`build-logic/`. Tools absent from the list are also unseen: oxlint and oxfmt
(vite), RuboCop (sinatra), Lefthook (gitlab-org/cli), GitLab Duo agent
configuration under `.gitlab/duo/` (gitlab-org/cli), and Rust lint
configuration in a workspace subdirectory (`codex-rs/clippy.toml`,
`codex-rs/rustfmt.toml`) when the profile has chosen a different manifest.
No reproduction is given beyond the repositories named: each is a missing
entry in a list, and the open decision is whether the list approach scales
at all.

### 6. A path that is not a directory crashes the assessor

The command line checks that the path exists, not that it is a directory.
`readdirSync` then throws, and the process exits 1 with a stack trace. The
documented contract is exit 0 for a report and exit 2 for "could not run".

```bash
node tools/assess.mjs README.md; echo "exit $?"
# Error: ENOTDIR ... exit 1
```

### 7. One observation describes the clone, not the repository

"git hooks path is configured" is read from the clone's `.git/config`, which
is local state. A tool that sets `core.hooksPath` on install, as Husky does,
makes the observation appear after `npm install` and not before. Two
operators assessing the same commit can therefore get different reports.
This was the only source of instability found. Repeated runs on one
checkout were identical.

```bash
d=$(mktemp -d); git -C "$d" init -q
b=$(mktemp); node tools/assess.mjs "$d" > "$b"
git -C "$d" config core.hooksPath .husky/_
node tools/assess.mjs "$d" | diff "$b" -
# > observed       git hooks path is configured
```

Inference, not tested here: `searchRoots` relies on the order in which
`readdirSync` returns entries. Node returns them sorted on Linux, which is
why runs were stable. A filesystem that orders case-insensitively would
choose a different first manifest when sibling directories differ only in
case. This affects only repositories with more than one subdirectory
manifest and none at the root.

## Decisions

- **No assessor change in this branch.** Each finding has a reproduction
  so that a fix can be shown to change the result. Fixes belong in a
  separate change, one finding at a time.
- **No shape added to `VALIDATED_SHAPES`.** Python with Poetry (poetry)
  produced no false observation and no miss, and is the strongest
  candidate. Adding it is a code change and a review decision, so it is
  proposed here rather than made.
- **Codex's `first-class` verdict is recorded as an error, not a
  validation.** The shape it matched was validated on repositories where
  Node was the project. A matching tuple is not a matching repository, and
  finding 1 is what separates them.

## Consequences

- The `first-class` label is weaker evidence than the first wave implied.
  It certifies a tuple of runtime, manager, CI and host, and the profile
  that produces the tuple is wrong in two of ten repositories here. Until
  finding 1 is fixed, a `first-class` report on a polyglot or multi-module
  repository should be read as `assessment-only`.
- The file assessor's precision is high and its recall is moderate. That
  matches its stated design (it under-reports rather than over-claims), but
  the misses are not random. They track ecosystems the probe lists were not
  written for (JVM, Ruby, GitLab) and colocated tests. An adopter on one of
  those stacks will see a systematically emptier report.
- The host assessor's accuracy for an ordinary reader of a public
  repository rests on one run, `pallets/flask` in the first wave. This wave
  added refusals and a control, not a second reader-path sample.
- The sample is still a convenience sample of seventeen repositories. Shapes
  still absent: a Windows-first repository, a private GitLab instance, a
  repository with no CI at all, and one that commits generated code.
