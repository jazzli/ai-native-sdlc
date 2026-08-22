import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { buildManifest } from '../lib/manifest';

export const GET: APIRoute = async () => {
  const notes = (await getCollection('notes')).map((n) => ({
    id: n.id,
    title: n.data.title,
    status: n.data.status,
    updated: n.data.updated.toISOString().slice(0, 10),
  }));
  const manifest = buildManifest(notes, new Date().toISOString().slice(0, 10));
  return new Response(JSON.stringify(manifest, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
