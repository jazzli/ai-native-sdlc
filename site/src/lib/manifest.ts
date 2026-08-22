import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { SITE_ORIGIN, SITE_BASE, CONTENT } from './site-config';
import { kindFor, type Status } from './note-route';

export interface ManifestPosition {
  id: string;
  title: string;
  status: Status;
  updated: string;
  digest: string;
  url: string;
  markdown: string;
  // Present for positions; absent while a question is still open.
  claim?: string;
  enforcement?: string[];
  falsifiers: string[];
}

// Bumped only when a consumer's parser would need to change. Downstream
// policies pin this so a field rename surfaces as a version mismatch
// rather than as silently-missing data.
export const MANIFEST_SCHEMA_VERSION = 1;

export interface Manifest {
  schemaVersion: number;
  generated: string;
  digest: string;
  site: string;
  protocol: string;
  changelog: string;
  positions: ManifestPosition[];
}

const short = (s: string) =>
  createHash('sha256').update(s).digest('hex').slice(0, 12);

// Bullets under a named `##` heading, stopping at the next one.
export function extractBullets(markdown: string, heading: string): string[] {
  const section = markdown.split(new RegExp(`^## ${heading}\\s*$`, 'm'))[1];
  if (!section) return [];
  return section
    .split(/^## /m)[0]
    .split(/^- /m)
    .slice(1)
    .map((b) => b.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

// The part a downstream adoption most needs: a position carried without its
// falsifier is a rule rather than a claim.
export const extractFalsifiers = (markdown: string): string[] =>
  extractBullets(markdown, 'What would change my mind');

// How the position is made to stick — or a plain statement that it cannot
// be, which most cannot. /adopt asks adopters to record the mechanical
// enforcement of each position and, until now, handed them nothing to work
// from: a generated policy said "Enforcement: TODO" nine times.
export const extractEnforcement = (markdown: string): string[] =>
  extractBullets(markdown, 'How to enforce this');

// The playbook states each position as a heading and links its note. That
// heading IS the claim — "Use spec-driven development for agent-executed
// feature work" — while the note's own title is the question it answers.
// Publishing only the title meant an adopter mapping by id recorded an
// interrogative where its rule belonged.
export function extractClaims(playbook: string): Record<string, string> {
  const claims: Record<string, string> = {};
  for (const section of playbook.split(/^## /m).slice(1)) {
    const heading = section.split('\n')[0].trim();
    const note = section.match(/\]\(questions\/([a-z0-9-]+)\.md\)/);
    if (note) claims[note[1]] = heading;
  }
  return claims;
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
  readPlaybook: () => string = () =>
    fs.readFileSync(CONTENT.playbookFile, 'utf8'),
): Manifest {
  const base = `${SITE_ORIGIN}${SITE_BASE}`;
  const claims = extractClaims(readPlaybook());
  // Sorted by id so the output — and therefore the digest — is deterministic
  // by construction rather than by loader order.
  const positions = [...notes]
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    .map((n) => {
      const source = readNote(n.id);
      const kind = kindFor(n.status);
      const claim = kind === 'positions' ? claims[n.id] : undefined;
      // Fail closed. A position whose playbook section was renamed or
      // unlinked would otherwise publish with no claim at all, and an
      // adopter would map an empty rule.
      if (kind === 'positions' && !claim)
        throw new Error(
          `Position "${n.id}" has no playbook section linking it, so no claim to publish`,
        );
      const enforcement =
        kind === 'positions' ? extractEnforcement(source) : undefined;
      // An empty section publishes a position with nothing under
      // `enforcement`, which reads as "no enforcement needed" rather than
      // "nobody wrote it". Saying a position cannot be enforced is a
      // sentence someone has to write.
      if (enforcement && enforcement.length === 0)
        throw new Error(
          `Position "${n.id}" has no bullets under "## How to enforce this"`,
        );
      return {
        id: n.id,
        title: n.title,
        status: n.status,
        updated: n.updated,
        // Over the source markdown: changes when the position changes, not
        // when the renderer does.
        // Over the note source *and* the claim: the claim is published as
        // the rule an adopter records, so an edit to it must move this
        // digest. A rule that changed while the digest held still would
        // leave every downstream drift check silent.
        digest: short(claim ? `${source}\n${claim}` : source),
        url: `${base}/${kind}/${n.id}/`,
        markdown: `${base}/${kind}/${n.id}.md`,
        ...(claim ? { claim } : {}),
        ...(enforcement ? { enforcement } : {}),
        falsifiers: extractFalsifiers(source),
      };
    });

  return {
    schemaVersion: MANIFEST_SCHEMA_VERSION,
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
