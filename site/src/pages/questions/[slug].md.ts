import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import path from 'node:path';
import { rawRewritten } from '../../lib/raw';
import { CONTENT } from '../../lib/site-config';

// Served under both sections, with identical content. An HTML reader lands on
// a redirect after a status change; an agent holding a stale `.md` URL cannot
// follow one usefully, so it gets the note itself. The manifest remains the
// authority on which URL is canonical.
export async function getStaticPaths() {
  const notes = await getCollection('notes');
  return notes.map((n) => ({ params: { slug: n.id } }));
}

export const GET: APIRoute = async ({ params }) =>
  new Response(
    await rawRewritten(path.join(CONTENT.questionsDir, `${params.slug}.md`)),
    { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } },
  );
