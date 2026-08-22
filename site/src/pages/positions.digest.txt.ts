import type { APIRoute } from 'astro';
import { siteManifest } from '../lib/site-manifest';

// The canonical digest endpoint. GitHub Pages types responses by file
// extension and has no override — no `_headers`, no server config — so it
// served the extensionless `.digest` as application/octet-stream, which a
// browser downloads rather than shows and a strict HTTP client may refuse.
// `.txt` is typed text/plain, which is what this always was.
//
// `/positions.digest` remains and serves the same bytes: it was published in
// the drift check on /adopt, and this project does not break a URL it has
// already put in front of adopters.
export const GET: APIRoute = async () =>
  new Response(`${(await siteManifest()).digest}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
