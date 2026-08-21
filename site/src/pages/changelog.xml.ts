import type { APIRoute } from 'astro';
import { parseReviewLog } from '../lib/review-log';
import { buildFeed } from '../lib/changelog';
import { CONTENT } from '../lib/site-config';

export const GET: APIRoute = async () =>
  new Response(await buildFeed(parseReviewLog(CONTENT.sourcesFile)), {
    headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' },
  });
