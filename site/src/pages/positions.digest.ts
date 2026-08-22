import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { buildManifest } from '../lib/manifest';

// The manifest's top-level digest, alone, as text. A drift check needs only
// this; serving it separately means a scheduler compares two strings instead
// of parsing JSON in shell, where key order and whitespace become load-bearing.
export const GET: APIRoute = async () => {
  const notes = (await getCollection('notes')).map((n) => ({
    id: n.id,
    title: n.data.title,
    status: n.data.status,
    updated: n.data.updated.toISOString().slice(0, 10),
  }));
  const { digest } = buildManifest(
    notes,
    new Date().toISOString().slice(0, 10),
  );
  return new Response(`${digest}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
