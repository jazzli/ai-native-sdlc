import type { APIRoute } from 'astro';
import fs from 'node:fs';

// Served verbatim from tools/assess-host.mjs — the same file the tests
// exercise, so what a repository runs cannot drift from what is tested here.
export const GET: APIRoute = async () =>
  new Response(fs.readFileSync('../tools/assess-host.mjs', 'utf8'), {
    headers: { 'Content-Type': 'text/javascript; charset=utf-8' },
  });
