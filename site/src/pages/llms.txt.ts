import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE_ORIGIN, SITE_BASE } from '../lib/site-config';

export const GET: APIRoute = async () => {
  const notes = await getCollection('notes');
  const abs = (p: string) => `${SITE_ORIGIN}${SITE_BASE}${p}`;
  const line = (n: (typeof notes)[number]) => {
    const kind = n.data.status === 'working-answer' ? 'positions' : 'questions';
    const date = n.data.updated.toISOString().slice(0, 10);
    return `- [${n.data.title}](${abs(`/${kind}/${n.id}.md`)}): ${n.data.status}, updated ${date}`;
  };
  const positions = notes.filter((n) => n.data.status === 'working-answer');
  const open = notes.filter((n) => n.data.status !== 'working-answer');

  const body = `# AI-Native SDLC

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
`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
