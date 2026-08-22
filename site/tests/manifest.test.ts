import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { buildManifest, extractFalsifiers } from '../src/lib/manifest';
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
