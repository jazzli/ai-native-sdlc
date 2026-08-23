import fs from 'node:fs';
import { CONTENT } from './site-config';
import type { Status } from './note-route';

export const SUPPORT = [
  'first-class',
  'compatible',
  'assessment-only',
] as const;
export type Support = (typeof SUPPORT)[number];

/** Derived from the notes a domain links; never authored. */
export type Evidence = 'position' | 'open' | 'uncovered';

export interface Capability {
  id: string;
  title: string;
  support: Support;
  evidence: Evidence;
  /** Notes with a working answer. */
  positions: string[];
  /** Notes carried open. A domain can hold both. */
  openQuestions: string[];
}

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

// The map names the domains and states what this project can do for each.
// What it *knows* about each is derived from the notes the domain links, so
// a note that changes status moves its domain's evidence with it and cannot
// be contradicted by a stale label.
//
// Fail closed on every way the map and the notes can disagree: an unknown
// note, a domain with no support level, and — the one most likely to happen
// — a note that exists but no domain claims, which would otherwise drop out
// of the map silently.
export function buildCapabilities(
  map: string,
  notes: { id: string; status: Status }[],
): Capability[] {
  const status = new Map(notes.map((n) => [n.id, n.status]));
  const out: Capability[] = [];

  for (const section of map.split(/^## /m).slice(1)) {
    const title = section.split('\n')[0].trim();
    const linked = [
      ...section.matchAll(/\]\(questions\/([a-z0-9-]+)\.md\)/g),
    ].map((m) => m[1]);
    for (const id of linked) {
      if (!status.has(id))
        throw new Error(`Capability "${title}" links unknown note "${id}"`);
    }

    const declared = section.match(/^\*\*Support:\*\*\s*(.+)$/m)?.[1].trim();
    const support = declared?.toLowerCase().replace(/\s+/g, '-') as Support;
    if (!SUPPORT.includes(support))
      throw new Error(
        `Capability "${title}" declares support ${JSON.stringify(declared)}; expected one of ${SUPPORT.join(', ')}`,
      );

    // Reported separately: a domain that holds a position *and* an open
    // question is not fully answered, and one label cannot say both.
    const positions = linked.filter(
      (id) => status.get(id) === 'working-answer',
    );
    const openQuestions = linked.filter(
      (id) => status.get(id) !== 'working-answer',
    );
    const evidence: Evidence = positions.length
      ? 'position'
      : openQuestions.length
        ? 'open'
        : 'uncovered';

    out.push({
      id: slug(title),
      title,
      support,
      evidence,
      positions,
      openQuestions,
    });
  }

  const placed = new Set(
    out.flatMap((c) => [...c.positions, ...c.openQuestions]),
  );
  const orphans = notes.map((n) => n.id).filter((id) => !placed.has(id));
  if (orphans.length)
    throw new Error(
      `Notes belong to no capability domain: ${orphans.join(', ')}. Every note is placed on the map, or the map stops describing the playbook.`,
    );

  return out;
}

export const readCapabilities = (
  notes: { id: string; status: Status }[],
): Capability[] =>
  buildCapabilities(fs.readFileSync(CONTENT.capabilitiesFile, 'utf8'), notes);
