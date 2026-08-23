import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
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

  it('reports unknown rather than guessing', () => {
    const p = detectProfile(make('bare', ['README.md']));
    expect(p.runtime).toBe('unknown');
    expect(p.packageManager).toBe('unknown');
    expect(p.manifestAt).toBeNull();
  });
});

// The mechanism that stops "it should work anywhere" being recorded as
// support. Only shapes actually assessed count, and there is one.
describe('resolveSupport', () => {
  it('recognises the one shape this project has assessed', () => {
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
        packageManager: 'pnpm',
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
