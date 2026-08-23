import type { APIRoute } from 'astro';
import fs from 'node:fs';

// Served verbatim from tools/check-policy.mjs — the same file the test suite
// imports, so the checker adopters run cannot drift from the one this project
// tests. It is dependency-free and needs no build step, which is why it is
// authored as plain JavaScript rather than compiled from the site's source.
export const GET: APIRoute = async () =>
  new Response(fs.readFileSync('../tools/check-policy.mjs', 'utf8'), {
    headers: { 'Content-Type': 'text/javascript; charset=utf-8' },
  });
