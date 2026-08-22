import type { APIRoute } from 'astro';
import { siteManifest } from '../lib/site-manifest';

// The manifest's top-level digest, alone, as text. A drift check needs only
// this; serving it separately means a scheduler compares two strings instead
// of parsing JSON in shell, where key order and whitespace become load-bearing.
export const GET: APIRoute = async () =>
  new Response(`${(await siteManifest()).digest}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
