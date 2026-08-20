import { createHash } from 'node:crypto';
import { remark } from 'remark';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import { visit } from 'unist-util-visit';
import type { Root, Html } from 'mdast';
import { SITE_ORIGIN, SITE_BASE, CONTENT } from './site-config';
import { remarkRewriteLinks } from './rewrite-links';
import type { LogEntry } from './review-log';

// Reject raw HTML in entries: fail-closed policy.
function remarkRejectHtml() {
  return (tree: Root) => {
    visit(tree, 'html', (node: Html) => {
      throw new Error(
        `Raw HTML is not allowed in review-log entries: "${node.value}"`,
      );
    });
  };
}

// Feed and page share one renderer. Links are rewritten with the ABSOLUTE
// base so entries read correctly from a feed reader, and the same
// fail-closed enforcement applies to changelog entries as to notes.
const processor = remark()
  .use(remarkRejectHtml)
  .use(remarkRewriteLinks({ base: `${SITE_ORIGIN}${SITE_BASE}`, ...CONTENT }))
  .use(remarkRehype)
  .use(rehypeStringify);

export async function entryHtml(markdown: string): Promise<string> {
  return String(await processor.process(markdown));
}

// Generate stable hash from markdown content (first 12 hex chars of SHA1).
function getContentHash(markdown: string): string {
  return createHash('sha1').update(markdown).digest('hex').slice(0, 12);
}

export function entryId(e: LogEntry): string {
  const hash = getContentHash(e.markdown);
  return `tag:jazzli.github.io,2026:changelog:${e.date}:${hash}`;
}

export function entryAnchor(e: LogEntry): string {
  const hash = getContentHash(e.markdown);
  return `e-${hash}`;
}

export function entryTitle(e: LogEntry): string {
  // Strip markdown formatting: remove **, *, backticks, collapse [text](url) to text.
  const text = e.markdown
    .replace(/\*\*(.+?)\*\*/g, '$1') // bold
    .replace(/\*(.+?)\*/g, '$1') // italic
    .replace(/`(.+?)`/g, '$1') // code
    .replace(/\[(.+?)\]\(.+?\)/g, '$1'); // links

  // Truncate to 80 code points safely (no split surrogates).
  const codePoints = Array.from(text);
  if (codePoints.length > 80) {
    return codePoints.slice(0, 80).join('');
  }
  return text;
}

const escapeXml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export async function buildFeed(entries: LogEntry[]): Promise<string> {
  const site = `${SITE_ORIGIN}${SITE_BASE}`;

  // Check for duplicate entries (same ID).
  const ids = new Set<string>();
  for (const e of entries) {
    const id = entryId(e);
    if (ids.has(id)) {
      throw new Error(`Duplicate entry found with ID: ${id}`);
    }
    ids.add(id);
  }

  const items = await Promise.all(
    entries.map(async (e) => {
      const html = await entryHtml(e.markdown);
      const title = entryTitle(e);
      const anchor = entryAnchor(e);
      return [
        '  <entry>',
        `    <id>${entryId(e)}</id>`,
        `    <title>${escapeXml(title)}</title>`,
        `    <updated>${e.date}T00:00:00Z</updated>`,
        `    <link href="${site}/changelog/#${anchor}"/>`,
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
