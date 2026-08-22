import type { APIRoute } from 'astro';
import { siteManifest } from '../lib/site-manifest';

export const GET: APIRoute = async () =>
  new Response(JSON.stringify(await siteManifest(), null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
