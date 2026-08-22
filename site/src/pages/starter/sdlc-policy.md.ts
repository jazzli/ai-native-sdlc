import type { APIRoute } from 'astro';
import { siteManifest } from '../../lib/site-manifest';
import { starterPolicy } from '../../lib/starter';

export const GET: APIRoute = async () =>
  new Response(starterPolicy(await siteManifest()), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
