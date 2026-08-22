import type { APIRoute } from 'astro';
import { siteManifest } from '../lib/site-manifest';

// Retained alias of `/positions.digest.txt`, which is canonical because Pages
// types this extensionless path as application/octet-stream. Identical bytes:
// the drift check published on /adopt named this URL, and a URL already put in
// front of adopters keeps working. New references should use the .txt form.
export const GET: APIRoute = async () =>
  new Response(`${(await siteManifest()).digest}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
