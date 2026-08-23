import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { buildCapabilities, SUPPORT } from '../src/lib/capabilities';
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
const map = fs.readFileSync(CONTENT.capabilitiesFile, 'utf8');
const caps = buildCapabilities(map, notes);

describe('capability map', () => {
  it('places every note in a domain', () => {
    const placed = caps.flatMap((c) => [...c.positions, ...c.openQuestions]);
    expect(placed.slice().sort()).toEqual(notes.map((n) => n.id).sort());
  });

  it('declares a known support level for every domain', () => {
    for (const c of caps) expect(SUPPORT, c.id).toContain(c.support);
  });

  // Evidence is derived, so a domain cannot claim knowledge the playbook
  // does not hold. This is the property that keeps the map honest as notes
  // change status underneath it.
  it('derives evidence from the notes, not from the map', () => {
    const byId = new Map(notes.map((n) => [n.id, n.status]));
    for (const c of caps) {
      for (const id of c.positions)
        expect(byId.get(id), id).toBe('working-answer');
      for (const id of c.openQuestions)
        expect(byId.get(id), id).not.toBe('working-answer');
      const want = c.positions.length
        ? 'position'
        : c.openQuestions.length
          ? 'open'
          : 'uncovered';
      expect(c.evidence, c.id).toBe(want);
    }
  });

  // The point of naming an uncovered domain is that it offers nothing. If it
  // ever carried guidance, the map would be asserting past its evidence.
  it('offers nothing at all for an uncovered domain', () => {
    const uncovered = caps.filter((c) => c.evidence === 'uncovered');
    expect(uncovered.length).toBeGreaterThan(0);
    for (const c of uncovered) {
      expect(c.positions, c.id).toEqual([]);
      expect(c.openQuestions, c.id).toEqual([]);
      expect(c.support, c.id).toBe('assessment-only');
    }
  });

  it('refuses a domain that links a note which does not exist', () => {
    expect(() =>
      buildCapabilities(
        '## Invented\n\n→ [x](questions/not-a-note.md)\n\n**Support:** compatible\n',
        notes,
      ),
    ).toThrow(/unknown note "not-a-note"/);
  });

  it('refuses a domain with no support level, or an unrecognised one', () => {
    expect(() => buildCapabilities('## Bare\n\nProse only.\n', notes)).toThrow(
      /declares support/,
    );
    expect(() =>
      buildCapabilities('## Bare\n\n**Support:** excellent\n', notes),
    ).toThrow(/expected one of/);
  });

  // The failure most likely to happen in practice: a note is added and the
  // map is not updated, so the domain map quietly stops describing the
  // playbook.
  it('refuses to build when a note belongs to no domain', () => {
    expect(() =>
      buildCapabilities(map, [...notes, { id: 'brand-new', status: 'open' }]),
    ).toThrow(/belong to no capability domain: brand-new/);
  });
});
