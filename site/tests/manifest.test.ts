import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  buildManifest,
  extractFalsifiers,
  extractClaims,
  extractEnforcement,
} from '../src/lib/manifest';
import { CONTENT } from '../src/lib/site-config';

const realNotes = fs
  .readdirSync(CONTENT.questionsDir)
  .filter((f) => f.endsWith('.md'))
  .map((f) => {
    const src = fs.readFileSync(path.join(CONTENT.questionsDir, f), 'utf8');
    return {
      id: f.replace(/\.md$/, ''),
      title: src.match(/^title:\s*(.+)$/m)![1],
      status: src.match(/^status:\s*(\S+)$/m)![1] as
        'working-answer' | 'open' | 'parked',
      updated: src.match(/^updated:\s*(\S+)$/m)![1],
    };
  });

describe('extractFalsifiers', () => {
  it('pulls every bullet from the falsifier section and stops at the next heading', () => {
    const md = [
      '## Current position',
      '- not a falsifier',
      '## What would change my mind',
      '- First thing',
      '- Second thing',
      '  wrapped onto another line',
      '## Evidence',
      '- not a falsifier either',
    ].join('\n');
    const f = extractFalsifiers(md);
    expect(f).toHaveLength(2);
    expect(f[0]).toBe('First thing');
    expect(f[1]).toBe('Second thing wrapped onto another line');
  });

  it('returns empty for a document with no falsifier section', () => {
    expect(extractFalsifiers('# Just a page\n\nProse.')).toEqual([]);
  });

  it('finds falsifiers in every real note — a position without one is a rule', () => {
    for (const n of realNotes) {
      const src = fs.readFileSync(
        path.join(CONTENT.questionsDir, `${n.id}.md`),
        'utf8',
      );
      expect(extractFalsifiers(src).length, n.id).toBeGreaterThan(0);
    }
  });
});

describe('buildManifest', () => {
  const m = buildManifest(realNotes, '2026-01-01');

  it('carries every note with the required fields', () => {
    expect(m.positions).toHaveLength(realNotes.length);
    for (const p of m.positions) {
      expect(p.id, 'id').toBeTruthy();
      expect(p.title, `${p.id} title`).toBeTruthy();
      expect(['working-answer', 'open', 'parked'], `${p.id} status`).toContain(
        p.status,
      );
      expect(p.updated, `${p.id} updated`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(p.digest, `${p.id} digest`).toMatch(/^[0-9a-f]{12}$/);
      expect(p.url, `${p.id} url`).toContain('/ai-native-sdlc/');
      expect(p.markdown, `${p.id} markdown`).toMatch(/\.md$/);
      expect(p.falsifiers.length, `${p.id} falsifiers`).toBeGreaterThan(0);
    }
  });

  it('routes by status, so open questions are never mistaken for guidance', () => {
    for (const p of m.positions) {
      const kind = p.status === 'working-answer' ? 'positions' : 'questions';
      expect(p.url, p.id).toContain(`/${kind}/${p.id}/`);
    }
  });

  it('is sorted by id, so output is deterministic by construction', () => {
    const ids = m.positions.map((p) => p.id);
    expect(ids).toEqual([...ids].sort());
  });

  // The second build uses a different date deliberately: a downstream
  // policy reports when this digest moves, so were the build date ever
  // folded in, every adopter would see drift on a day no position
  // changed and would learn to ignore the alarm.
  it('produces identical digests for identical content', () => {
    const again = buildManifest(realNotes, '2099-12-31');
    expect(again.digest).toBe(m.digest);
    expect(again.positions.map((p) => p.digest)).toEqual(
      m.positions.map((p) => p.digest),
    );
  });

  it('changes exactly one position digest, plus the top-level digest, when one note changes', () => {
    const target = 'does-sdd-reduce-rework';
    const read = (id: string) => {
      const src = fs.readFileSync(
        path.join(CONTENT.questionsDir, `${id}.md`),
        'utf8',
      );
      return id === target ? `${src}\nEDITED` : src;
    };
    const mutated = buildManifest(realNotes, '2026-01-01', read);
    expect(mutated.digest).not.toBe(m.digest);
    const moved = mutated.positions.filter(
      (p, i) => p.digest !== m.positions[i].digest,
    );
    expect(moved.map((p) => p.id)).toEqual([target]);
  });

  it('links the protocol and changelog an adopter needs', () => {
    expect(m.protocol).toContain('/protocol/');
    expect(m.changelog).toContain('/changelog.xml');
    expect(m.generated).toBe('2026-01-01');
  });
});

describe('extractClaims', () => {
  const playbook = [
    '# Playbook',
    '## Use spec-driven development for agent-executed feature work',
    'Some prose.',
    '→ [why](questions/does-sdd-reduce-rework.md)',
    '## No position yet',
    '→ [the open one](questions/still-open.md)',
    '## A section citing nothing',
    'Prose with no note link.',
  ].join('\n');

  it('maps each note to the heading of the section linking it', () => {
    const c = extractClaims(playbook);
    expect(c['does-sdd-reduce-rework']).toBe(
      'Use spec-driven development for agent-executed feature work',
    );
  });

  it('ignores sections that link no note', () => {
    expect(Object.keys(extractClaims(playbook))).toHaveLength(2);
  });
});

// The manifest published only `title` — the *question* a note answers — so an
// adopter mapping by id recorded "Does SDD actually reduce rework?" where its
// rule belonged. The claim is the playbook heading, authored in one place and
// derived here rather than restated.
describe('published claims', () => {
  const m = buildManifest(realNotes, '2026-08-23');

  it('gives every position a claim, and no open question one', () => {
    for (const p of m.positions) {
      if (p.status === 'working-answer') expect(p.claim, p.id).toBeTruthy();
      else expect(p.claim, p.id).toBeUndefined();
    }
  });

  it('states claims as assertions, never as the question they answer', () => {
    for (const p of m.positions.filter((x) => x.claim)) {
      expect(p.claim, p.id).not.toMatch(/\?\s*$/);
      expect(p.claim, `${p.id} restates its title`).not.toBe(p.title);
    }
  });

  it('refuses to publish a position whose claim is missing', () => {
    expect(() =>
      buildManifest(realNotes, '2026-08-23', undefined, () => '# Playbook\n'),
    ).toThrow(/no playbook section/);
  });

  it('moves the digest when a claim changes, so drift checks fire', () => {
    const base = buildManifest(realNotes, '2026-08-23');
    const edited = buildManifest(realNotes, '2026-08-23', undefined, () =>
      fs
        .readFileSync(CONTENT.playbookFile, 'utf8')
        .replace(/^## Use spec-driven/m, '## Prefer spec-driven'),
    );
    expect(edited.digest).not.toBe(base.digest);
    const moved = edited.positions.filter(
      (p, i) => p.digest !== base.positions[i].digest,
    );
    expect(moved.map((p) => p.id)).toEqual(['does-sdd-reduce-rework']);
  });
});

// /adopt asks adopters to record how each position is mechanically enforced
// and, until now, handed them nothing: a policy generated from the manifest
// during the dogfooding pass read "Enforcement: TODO" nine times. Most
// positions cannot be mechanically enforced, and saying so is the point —
// a rule recorded as enforced when nothing checks it is worse than one
// recorded as a human checkpoint.
describe('published enforcement', () => {
  const m = buildManifest(realNotes, '2026-08-23');

  it('gives every position enforcement, and no open question any', () => {
    for (const p of m.positions) {
      if (p.status === 'working-answer') {
        expect(p.enforcement, p.id).toBeTruthy();
        expect(p.enforcement!.length, p.id).toBeGreaterThan(0);
      } else expect(p.enforcement, p.id).toBeUndefined();
    }
  });

  it('refuses to publish a position whose section is present but empty', () => {
    const hollow = (id: string) => {
      const src = fs.readFileSync(
        path.join(CONTENT.questionsDir, `${id}.md`),
        'utf8',
      );
      return src.replace(
        /## How to enforce this[\s\S]*?(?=## Evidence)/,
        '## How to enforce this\n\n',
      );
    };
    expect(() => buildManifest(realNotes, '2026-08-23', hollow)).toThrow(
      /no bullets under/,
    );
  });

  it('stops at the next heading, taking no evidence bullets with it', () => {
    const md = [
      '## How to enforce this',
      '- Enforced by the hook.',
      '## Evidence',
      '- not enforcement',
    ].join('\n');
    expect(extractEnforcement(md)).toEqual(['Enforced by the hook.']);
  });
});
