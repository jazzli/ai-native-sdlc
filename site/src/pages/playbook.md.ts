import type { APIRoute } from 'astro';
import { rawRewritten } from '../lib/raw';

// Alias of `/index.md`. The adoption instructions name the playbook by that
// word, and an adopting agent that guesses `/playbook.md` should not 404.
export const GET: APIRoute = async () =>
  new Response(await rawRewritten('../docs/playbook.md'), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
