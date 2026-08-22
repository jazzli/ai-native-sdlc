import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE_ORIGIN, SITE_BASE } from '../lib/site-config';
import { kindFor } from '../lib/note-route';
import { siteManifest } from '../lib/site-manifest';

export const GET: APIRoute = async () => {
  // Collection order is a loader implementation detail (it changed between
  // Astro majors); sort by id so the listing is deterministic by construction.
  const notes = (await getCollection('notes')).sort((a, b) =>
    a.id < b.id ? -1 : a.id > b.id ? 1 : 0,
  );
  const abs = (p: string) => `${SITE_ORIGIN}${SITE_BASE}${p}`;
  // A position's own title is the question it answers; its claim is stated in
  // the playbook. Listing titles here put nine interrogatives under a heading
  // reading "Positions" — the same defect the manifest had. Labels come from
  // the manifest rather than from a second copy of the rule about which notes
  // have claims: reading the playbook directly here labelled the note under
  // "## No position yet" with that heading.
  const labels = Object.fromEntries(
    (await siteManifest()).positions.map((p) => [p.id, p.claim ?? p.title]),
  );
  const line = (n: (typeof notes)[number]) => {
    const kind = kindFor(n.data.status);
    const date = n.data.updated.toISOString().slice(0, 10);
    return `- [${labels[n.id]}](${abs(`/${kind}/${n.id}.md`)}): ${n.data.status}, updated ${date}`;
  };
  const positions = notes.filter((n) => kindFor(n.data.status) === 'positions');
  const open = notes.filter((n) => kindFor(n.data.status) === 'questions');

  const body = `# AI-Native SDLC

> ADOPTING THIS? Follow ${abs('/adopt.md')} — one page, written for you.
>
> Evidence-tiered positions on AI-native software development. Every claim
> traces through a question note to a primary-verified source registry, and
> every position states what would change it.

## Positions

${positions.map(line).join('\n')}

## Open questions

${open.map(line).join('\n')}

## Reference

- [Playbook](${abs('/index.md')}): all positions in one document
- [Source registry](${abs('/sources.md')}): tiered, filter-stated, primary-verified sources
- [Research protocol](${abs('/protocol.md')}): the five rules governing this content
- [Adopt](${abs('/adopt.md')}): one paste to adopt this playbook into your repository
- [Positions manifest](${abs('/positions.json')}): machine-readable positions, falsifiers, and content digests
- [Colophon](${abs('/colophon.md')}): how this site is built — the practices applied to themselves
- [Changelog feed](${abs('/changelog.xml')}): Atom feed of the registry's review log
`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
