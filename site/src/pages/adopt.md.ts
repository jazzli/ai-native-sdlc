import type { APIRoute } from 'astro';
import { rawRewritten } from '../lib/raw';

export const GET: APIRoute = async () =>
  new Response(await rawRewritten('../docs/adopt.md'), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
