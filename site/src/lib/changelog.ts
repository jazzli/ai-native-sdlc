import { createHash } from 'node:crypto';
import { remark } from 'remark';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import { SITE_ORIGIN, SITE_BASE, CONTENT } from './site-config';
import { remarkRewriteLinks } from './rewrite-links';
import type { LogEntry } from './review-log';

// Feed and page share one renderer. Links are rewritten with the ABSOLUTE
// base so entries read correctly from a feed reader, and the same
// fail-closed enforcement applies to changelog entries as to notes.
const processor = remark()
  .use(remarkRewriteLinks({ base: `${SITE_ORIGIN}${SITE_BASE}`, ...CONTENT }))
  .use(remarkRehype)
  .use(rehypeStringify);

export async function entryHtml(markdown: string): Promise<string> {
  return String(await processor.process(markdown));
}

export function entryId(e: LogEntry): string {
  const hash = createHash('sha1').update(e.markdown).digest('hex').slice(0, 12);
  return `tag:jazzli.github.io,2026:changelog:${e.date}:${hash}`;
}

const escapeXml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export async function buildFeed(entries: LogEntry[]): Promise<string> {
  const site = `${SITE_ORIGIN}${SITE_BASE}`;
  const items = await Promise.all(
    entries.map(async (e) => {
      const html = await entryHtml(e.markdown);
      return [
        '  <entry>',
        `    <id>${entryId(e)}</id>`,
        `    <title>${escapeXml(e.markdown.slice(0, 80))}</title>`,
        `    <updated>${e.date}T00:00:00Z</updated>`,
        `    <link href="${site}/changelog/"/>`,
        `    <content type="html">${escapeXml(html)}</content>`,
        '  </entry>',
      ].join('\n');
    }),
  );
  return [
    '<?xml version="1.0" encoding="utf-8"?>',
    '<feed xmlns="http://www.w3.org/2005/Atom">',
    `  <id>${site}/</id>`,
    '  <title>AI-Native SDLC — Changelog</title>',
    `  <updated>${entries[0].date}T00:00:00Z</updated>`,
    `  <link href="${site}/changelog.xml" rel="self"/>`,
    `  <link href="${site}/changelog/"/>`,
    '  <author><name>AI-Native SDLC</name></author>',
    ...items,
    '</feed>',
    '',
  ].join('\n');
}
