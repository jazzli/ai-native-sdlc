import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { detectProfile, resolveSupport, assess } from '../../tools/assess.mjs';
import { buildCapabilities } from '../src/lib/capabilities';
import { CONTENT } from '../src/lib/site-config';

const notes = fs
  .readdirSync(CONTENT.questionsDir)
  .filter((f) => f.endsWith('.md'))
  .map((f) => ({
    id: f.replace(/\.md$/, ''),
    status: fs
      .readFileSync(path.join(CONTENT.questionsDir, f), 'utf8')
      .match(/^status:\s*(\S+)$/m)![1] as 'working-answer' | 'open' | 'parked',
  }));
const caps = buildCapabilities(
  fs.readFileSync(CONTENT.capabilitiesFile, 'utf8'),
  notes,
);

let tmp: string;
const make = (name: string, files: string[]) => {
  const root = path.join(tmp, name);
  for (const f of files) {
    const full = path.join(root, f);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    if (!f.endsWith('/')) fs.writeFileSync(full, '');
  }
  return root;
};

beforeAll(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'assess-'));
});
afterAll(() => fs.rmSync(tmp, { recursive: true, force: true }));

describe('detectProfile', () => {
  it('reads a conventional Node repository', () => {
    const r = make('node', [
      'package.json',
      'package-lock.json',
      '.github/workflows/ci.yml',
      '.git/config',
    ]);
    expect(detectProfile(r)).toMatchObject({
      runtime: 'node',
      packageManager: 'npm',
      ci: 'github-actions',
      host: 'github',
    });
  });

  it('reads a Python repository on GitLab', () => {
    const r = make('py', ['pyproject.toml', 'poetry.lock', '.gitlab-ci.yml']);
    expect(detectProfile(r)).toMatchObject({
      runtime: 'python',
      packageManager: 'poetry',
      ci: 'gitlab-ci',
    });
  });

  // The manifest often sits one level down. Looking only at the root
  // reported this project's own repository as an unknown runtime.
  it('finds a manifest one level down, and says where', () => {
    const r = make('nested', [
      'site/package.json',
      'site/package-lock.json',
      '.github/workflows/ci.yml',
    ]);
    const p = detectProfile(r);
    expect(p.runtime).toBe('node');
    expect(p.manifestAt).toBe(path.join('site', 'package.json'));
  });

  // square/okhttp: the root build.gradle.kts was not a known manifest, a test
  // fixture's pom.xml became the project, and a Kotlin/JS yarn.lock in a third
  // directory became its package manager.
  it('reads the Gradle Kotlin DSL and names the build tool', () => {
    expect(
      detectProfile(
        make('gradle-kts', ['build.gradle.kts', 'fixtures/pom.xml']),
      ),
    ).toMatchObject({
      runtime: 'jvm',
      packageManager: 'gradle',
      manifestAt: 'build.gradle.kts',
    });
    expect(detectProfile(make('maven', ['pom.xml'])).packageManager).toBe(
      'maven',
    );
  });

  it('takes a lockfile only from beside the manifest', () => {
    const r = make('stray-lock', ['package.json', 'js-store/yarn.lock']);
    expect(detectProfile(r).packageManager).toBe('npm');
  });

  it('ignores a lockfile that belongs to another ecosystem', () => {
    const r = make('mixed-lock', ['pom.xml', 'yarn.lock']);
    expect(detectProfile(r)).toMatchObject({
      runtime: 'jvm',
      packageManager: 'maven',
    });
  });

  it('lists manifests of another runtime alongside the one it read', () => {
    const r = make('polyglot', [
      'package.json',
      'pnpm-lock.yaml',
      'core/Cargo.toml',
      'core/Cargo.lock',
      'site/package.json',
    ]);
    expect(detectProfile(r)).toMatchObject({
      runtime: 'node',
      manifestAt: 'package.json',
      otherRuntimes: [path.join('core', 'Cargo.toml')],
    });
  });

  it('reports unknown rather than guessing', () => {
    const p = detectProfile(make('bare', ['README.md']));
    expect(p.runtime).toBe('unknown');
    expect(p.packageManager).toBe('unknown');
    expect(p.manifestAt).toBeNull();
  });
});

// The mechanism that stops "it should work anywhere" being recorded as
// support. Only shapes actually assessed count; each names the repository
// it was run against.
describe('resolveSupport', () => {
  it('recognises the shapes this project has assessed', () => {
    expect(
      resolveSupport({
        runtime: 'node',
        packageManager: 'npm',
        ci: 'github-actions',
        host: 'github',
      }),
    ).toBe('first-class');
  });

  it('refuses everything else, including a near miss', () => {
    for (const p of [
      {
        runtime: 'python',
        packageManager: 'poetry',
        ci: 'gitlab-ci',
        host: 'gitlab',
      },
      {
        runtime: 'node',
        packageManager: 'yarn',
        ci: 'github-actions',
        host: 'github',
      },
      {
        runtime: 'node',
        packageManager: 'npm',
        ci: 'circleci',
        host: 'github',
      },
    ])
      expect(resolveSupport(p), JSON.stringify(p)).toBe('assessment-only');
  });

  // openai/codex: a tooling package.json at the root of a Rust and Bazel
  // repository matched a validated Node/pnpm shape and was reported
  // first-class. A matching tuple is not a matching repository.
  it('withholds first-class when the repository holds another runtime', () => {
    const shape = {
      runtime: 'node',
      packageManager: 'pnpm',
      ci: 'github-actions',
      host: 'github',
    };
    expect(
      resolveSupport({ ...shape, otherRuntimes: ['codex-rs/Cargo.toml'] }),
    ).toBe('assessment-only');
    expect(resolveSupport({ ...shape, otherRuntimes: [] })).toBe('first-class');
  });

  it('carries the polyglot case end to end', () => {
    const r = make('codex-like', [
      'package.json',
      'pnpm-lock.yaml',
      'codex-rs/Cargo.toml',
      'codex-rs/Cargo.lock',
      '.github/workflows/ci.yml',
    ]);
    expect(resolveSupport(detectProfile(r))).toBe('assessment-only');
  });
});

describe('assess', () => {
  it('reports on every domain the map names, probe or not', () => {
    const r = assess(make('empty', ['README.md']), caps);
    expect(r.domains.map((d: { id: string }) => d.id)).toEqual(
      caps.map((c) => c.id),
    );
  });

  // Absence of an observation is not a finding. A repository may enforce
  // something in a way this tool cannot see, and the report has to leave
  // room for that rather than reading as a failure.
  it('never converts an observation into a score or a verdict', () => {
    const r = assess(make('empty2', ['README.md']), caps);
    // Structural, not lexical: the prose legitimately contains words like
    // "fails closed". What must not exist is a field that ranks a
    // repository, because a report is not a test.
    const fields = new Set(
      r.domains.flatMap((d: Record<string, unknown>) => Object.keys(d)),
    );
    for (const banned of [
      'score',
      'grade',
      'rating',
      'result',
      'passed',
      'compliant',
    ])
      expect([...fields], banned).not.toContain(banned);
    expect([...fields].sort()).toEqual([
      'absent',
      'id',
      'needsHostApi',
      'notAssessable',
      'observed',
      'title',
      'upstreamEvidence',
      'upstreamSupport',
    ]);
  });

  it('carries the upstream evidence level through, uncovered included', () => {
    const r = assess(make('empty3', ['README.md']), caps);
    const uncovered = r.domains.filter(
      (d: { upstreamEvidence: string }) => d.upstreamEvidence === 'uncovered',
    );
    expect(uncovered.length).toBe(
      caps.filter((c) => c.evidence === 'uncovered').length,
    );
  });

  it('separates what it saw, what needs the host, and what it cannot judge', () => {
    const r = assess(
      make('rich', [
        'package.json',
        'package-lock.json',
        '.githooks/pre-commit',
        'SECURITY.md',
        '.github/workflows/ci.yml',
      ]),
      caps,
    );
    const sec = r.domains.find((d: { id: string }) => d.id === 'security');
    expect(sec.observed.join(' ')).toContain('SECURITY.md');
    expect(sec.needsHostApi.length).toBeGreaterThan(0);
    expect(sec.notAssessable.length).toBeGreaterThan(0);
  });
});

// Found by running the assessor on repositories this project did not write
// (2026-09-19): express and a dependency-free Python project reported an
// unknown package manager for lacking a lockfile, this repository reported
// no tests because they live under site/, and ruff configured inside
// pyproject.toml was invisible.
describe('assessing a foreign repository', () => {
  it('names the manager a manifest implies when no lockfile is committed', () => {
    expect(
      detectProfile(make('unlocked', ['package.json'])).packageManager,
    ).toBe('npm');
    expect(
      detectProfile(make('pyunlocked', ['pyproject.toml'])).packageManager,
    ).toBe('pip');
    expect(detectProfile(make('cargo', ['Cargo.toml'])).packageManager).toBe(
      'cargo',
    );
  });

  it('honours a declared packageManager over the npm default', () => {
    const r = make('declared', ['package.json']);
    fs.writeFileSync(
      path.join(r, 'package.json'),
      '{"packageManager":"pnpm@9.1.0"}',
    );
    expect(detectProfile(r).packageManager).toBe('pnpm');
  });

  it('records an unlocked manifest as a boundary finding, not a guess', () => {
    const a = assess(make('unlocked2', ['package.json']), caps);
    const b = assess(
      make('locked', ['package.json', 'package-lock.json']),
      caps,
    );
    const dom = (r: ReturnType<typeof assess>) =>
      r.domains.find(
        (d: { id: string }) => d.id === 'repository-and-change-boundaries',
      )!;
    expect(dom(a).absent).toContain('no dependency lockfile is committed');
    expect(dom(b).absent).toEqual([]);
  });

  it('looks for tests and lint where the manifest lives', () => {
    const r = make('nested2', [
      'site/package.json',
      'site/package-lock.json',
      'site/tests/a.test.ts',
      'site/vitest.config.ts',
      'site/eslint.config.js',
    ]);
    const a = assess(r, caps);
    const testing = a.domains.find((d: { id: string }) => d.id === 'testing')!;
    const enforce = a.domains.find(
      (d: { id: string }) => d.id === 'mechanical-enforcement',
    )!;
    expect(testing.observed).toContain('test directory: site/tests');
    expect(testing.observed).toContain(
      'test or coverage configuration: site/vitest.config.ts',
    );
    expect(enforce.observed).toContain(
      'lint, format or type configuration: site/eslint.config.js',
    );
  });

  it('sees ruff, mypy and pytest configured inside pyproject.toml', () => {
    const r = make('py2', ['pyproject.toml', 'tests/x.py']);
    fs.writeFileSync(
      path.join(r, 'pyproject.toml'),
      '[project]\nname="x"\n[tool.ruff]\nline-length=100\n[tool.ruff.lint]\n[tool.mypy]\n[tool.pytest.ini_options]\n',
    );
    const a = assess(r, caps);
    const enforce = a.domains.find(
      (d: { id: string }) => d.id === 'mechanical-enforcement',
    )!;
    const testing = a.domains.find((d: { id: string }) => d.id === 'testing')!;
    expect(enforce.observed).toContain(
      'lint, format or type configuration: pyproject.toml [tool.ruff]',
    );
    expect(enforce.observed).toContain(
      'lint, format or type configuration: pyproject.toml [tool.mypy]',
    );
    expect(testing.observed).toContain(
      'test or coverage configuration: pyproject.toml [tool.pytest]',
    );
    // [tool.ruff.lint] is a sub-table of a tool already listed, not a second tool
    expect(
      enforce.observed.filter((o: string) => o.includes('[tool.ruff]')),
    ).toHaveLength(1);
  });
});

// The documented contract is exit 0 for a report and exit 2 for "could not
// run". Given a file, the command line checked only that the path existed,
// then crashed in readdirSync with exit 1 and a stack trace (wave 2, finding
// 6). Both refusals happen before the capability map is fetched.
describe('command line', () => {
  const cli = fileURLToPath(new URL('../../tools/assess.mjs', import.meta.url));
  const run = (target: string) =>
    spawnSync(process.execPath, [cli, target], { encoding: 'utf8' });

  it('refuses a path that is not a directory, with exit 2', () => {
    const file = path.join(make('cli-file', ['README.md']), 'README.md');
    const r = run(file);
    expect(r.status).toBe(2);
    expect(r.stderr).toMatch(/not a directory/);
    expect(r.stderr).not.toMatch(/at .*assess\.mjs/);
  });

  it('refuses a path that does not exist, with exit 2', () => {
    const r = run(path.join(tmp, 'no-such-repository'));
    expect(r.status).toBe(2);
    expect(r.stderr).toMatch(/no such directory/);
  });
});
