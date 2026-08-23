import type { APIRoute } from 'astro';
import { rawRewritten } from '../lib/raw';

export const GET: APIRoute = async () =>
  new Response(await rawRewritten('../docs/capabilities.md'), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
