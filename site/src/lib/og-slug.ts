import fs from 'node:fs';
import path from 'node:path';
import { CONTENT } from './site-config';
import { buildStatusMap } from './rewrite-links';
import { kindFor } from './note-route';
import type { CardSpec } from './og-card';

// Maps a rendered page pathname to its card slug; null = page has no card.
export function ogSlug(pathname: string, base: string): string | null {
  let p = pathname;
  if (p.startsWith(base)) p = p.slice(base.length);
  p = p.replace(/^\/+|\/+$/g, '');
  if (p === '') return 'index';
  if (/^(positions|questions)\/[a-z0-9-]+$/.test(p)) return p;
  if (
    p === 'sources' ||
    p === 'protocol' ||
    p === 'colophon' ||
    p === 'adopt' ||
    p === 'changelog'
  )
    return p;
  return null;
}

function noteTitle(file: string): { title: string; updated: string } {
  const text = fs.readFileSync(file, 'utf8');
  const title = text.match(/^title:\s*(.+?)\s*$/m)?.[1];
  const updated = text.match(/^updated:\s*(\d{4}-\d{2}-\d{2})\s*$/m)?.[1];
  if (!title || !updated)
    throw new Error(`Missing title/updated frontmatter: ${file}`);
  return { title, updated };
}

// The single source of truth for which cards exist. The endpoint's
// getStaticPaths IS this list; Base.astro's ogSlug must agree (parity test).
export function allCardTargets(): { slug: string; spec: CardSpec }[] {
  const targets: { slug: string; spec: CardSpec }[] = [];
  const statusMap = buildStatusMap(CONTENT.questionsDir);

  for (const [slug, status] of Object.entries(statusMap)) {
    const { title, updated } = noteTitle(
      path.join(CONTENT.questionsDir, `${slug}.md`),
    );
    const kind = kindFor(status);
    targets.push({
      slug: `${kind}/${slug}`,
      spec: { kind: 'note', title, status, updated },
    });
  }

  const positions = Object.values(statusMap).filter(
    (s) => kindFor(s) === 'positions',
  ).length;
  const sources = (
    fs.readFileSync(CONTENT.sourcesFile, 'utf8').match(/<a id="/g) ?? []
  ).length;

  targets.push(
    {
      slug: 'index',
      spec: {
        kind: 'page',
        title: 'AI-Native SDLC',
        subtitle: `Every position states what would overturn it — ${positions} positions · ${sources} sources`,
      },
    },
    {
      slug: 'sources',
      spec: {
        kind: 'page',
        title: 'Source Map',
        subtitle: 'Tiered, filter-stated, primary-verified sources',
      },
    },
    {
      slug: 'protocol',
      spec: {
        kind: 'page',
        title: 'Research Protocol',
        subtitle: 'Five rules; every claim walkable to a primary source',
      },
    },
    {
      slug: 'changelog',
      spec: {
        kind: 'page',
        title: 'Changelog',
        subtitle: "What changed, when — from the registry's own review log",
      },
    },
    {
      slug: 'adopt',
      spec: {
        kind: 'page',
        title: 'Adopt',
        subtitle:
          'One paste to adopt this playbook, with a manifest so it stays current',
      },
    },
    {
      slug: 'colophon',
      spec: {
        kind: 'page',
        title: 'Colophon',
        subtitle: 'The practices this site recommends, applied to building it',
      },
    },
  );
  return targets;
}
