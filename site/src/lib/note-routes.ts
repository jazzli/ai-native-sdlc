import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import path from 'node:path';
import { kindFor, type Kind } from './note-route';
import { rawRewritten } from './raw';
import { CONTENT } from './site-config';

// Every note is built under both sections. The one matching its status
// renders it; the other redirects, so a link made before a status change
// still resolves. The two section routes differ only in which they are, so
// the paths and the markdown handler are built once here.

/** Paths for one section, flagging whether that section is the note's home. */
export const noteParams = async (kind: Kind) =>
  (await getCollection('notes')).map((note) => ({
    params: { slug: note.id },
    props: { note, canonical: kindFor(note.data.status) === kind },
  }));

/** Both sections serve markdown for every note, so neither filters. */
export const allNoteParams = async () =>
  (await getCollection('notes')).map((n) => ({ params: { slug: n.id } }));

// Identical under both sections. An HTML reader lands on a redirect after a
// status change; an agent holding a stale `.md` URL cannot follow one
// usefully, so it gets the note itself. The manifest remains the authority
// on which URL is canonical.
export const noteMarkdown: APIRoute = async ({ params }) =>
  new Response(
    await rawRewritten(path.join(CONTENT.questionsDir, `${params.slug}.md`)),
    { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } },
  );
