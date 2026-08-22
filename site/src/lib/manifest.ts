import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { SITE_ORIGIN, SITE_BASE, CONTENT } from './site-config';

export interface ManifestPosition {
  id: string;
  title: string;
  status: 'working-answer' | 'open' | 'parked';
  updated: string;
  digest: string;
  url: string;
  markdown: string;
  falsifiers: string[];
}

export interface Manifest {
  generated: string;
  digest: string;
  site: string;
  protocol: string;
  changelog: string;
  positions: ManifestPosition[];
}

const short = (s: string) =>
  createHash('sha256').update(s).digest('hex').slice(0, 12);

// Bullets under "## What would change my mind" — the part a downstream
// adoption most needs, since a position carried without its falsifier is a
// rule rather than a claim.
export function extractFalsifiers(markdown: string): string[] {
  const section = markdown.split(/^## What would change my mind\s*$/m)[1];
  if (!section) return [];
  const body = section.split(/^## /m)[0];
  return body
    .split(/^- /m)
    .slice(1)
    .map((b) => b.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

export function buildManifest(
  notes: {
    id: string;
    title: string;
    status: ManifestPosition['status'];
    updated: string;
  }[],
  generated: string,
  readNote: (id: string) => string = (id) =>
    fs.readFileSync(path.join(CONTENT.questionsDir, `${id}.md`), 'utf8'),
): Manifest {
  const base = `${SITE_ORIGIN}${SITE_BASE}`;
  // Sorted by id so the output — and therefore the digest — is deterministic
  // by construction rather than by loader order.
  const positions = [...notes]
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    .map((n) => {
      const source = readNote(n.id);
      const kind = n.status === 'working-answer' ? 'positions' : 'questions';
      return {
        id: n.id,
        title: n.title,
        status: n.status,
        updated: n.updated,
        // Over the source markdown: changes when the position changes, not
        // when the renderer does.
        digest: short(source),
        url: `${base}/${kind}/${n.id}/`,
        markdown: `${base}/${kind}/${n.id}.md`,
        falsifiers: extractFalsifiers(source),
      };
    });

  return {
    generated,
    // Over the per-position digests only: "did anything move?" without being
    // perturbed by the generation date.
    digest: short(positions.map((p) => `${p.id}:${p.digest}`).join('\n')),
    site: `${base}/`,
    protocol: `${base}/protocol/`,
    changelog: `${base}/changelog.xml`,
    positions,
  };
}
