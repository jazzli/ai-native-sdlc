import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import path from 'node:path';
import { rawRewritten } from '../../lib/raw';
import { CONTENT } from '../../lib/site-config';

export async function getStaticPaths() {
  const notes = await getCollection('notes', (n) => n.data.status === 'working-answer');
  return notes.map((n) => ({ params: { slug: n.id } }));
}

export const GET: APIRoute = async ({ params }) =>
  new Response(
    await rawRewritten(path.join(CONTENT.questionsDir, `${params.slug}.md`)),
    { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } },
  );
