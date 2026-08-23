import type { APIRoute } from 'astro';
import { siteManifest } from '../lib/site-manifest';
import { SITE_ORIGIN, SITE_BASE } from '../lib/site-config';

const BASE = `${SITE_ORIGIN}${SITE_BASE}`;

// Pages that exist independently of the content collection.
const STATIC = [
  '/',
  '/adopt/',
  '/capabilities/',
  '/protocol/',
  '/sources/',
  '/changelog/',
  '/colophon/',
];

// Note URLs come from the manifest rather than a second list, so a note added
// or moved between sections cannot be missing here. Redirect stubs are
// excluded: they are marked noindex and point at the canonical page.
export const GET: APIRoute = async () => {
  const manifest = await siteManifest();
  const urls = [
    ...STATIC.map((p) => ({ loc: `${BASE}${p}`, lastmod: manifest.generated })),
    ...manifest.positions.map((p) => ({ loc: p.url, lastmod: p.updated })),
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod></url>`).join('\n')}
</urlset>
`;
  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
