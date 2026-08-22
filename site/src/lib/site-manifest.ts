import { getCollection } from 'astro:content';
import { buildManifest, type Manifest } from './manifest';

// One place the collection is mapped into the manifest shape. Five endpoints
// now serve from it — positions.json, positions.digest, llms.txt and both
// starter files — and a per-endpoint copy of this mapping is how they would
// come to disagree.
export async function siteManifest(): Promise<Manifest> {
  const notes = (await getCollection('notes')).map((n) => ({
    id: n.id,
    title: n.data.title,
    status: n.data.status,
    updated: n.data.updated.toISOString().slice(0, 10),
  }));
  return buildManifest(notes, new Date().toISOString().slice(0, 10));
}
