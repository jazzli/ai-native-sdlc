import type { APIRoute } from 'astro';
import { SITE_ORIGIN, SITE_BASE } from '../lib/site-config';

// Everything here is meant to be read, including by crawlers and by agents.
// The two machine-readable indexes are named so a crawler that only reads
// this file still finds them.
export const GET: APIRoute = async () =>
  new Response(
    `User-agent: *
Allow: /

Sitemap: ${SITE_ORIGIN}${SITE_BASE}/sitemap.xml

# Machine-readable indexes for agents:
#   ${SITE_ORIGIN}${SITE_BASE}/llms.txt
#   ${SITE_ORIGIN}${SITE_BASE}/positions.json
`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
