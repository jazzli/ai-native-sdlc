import { createHash } from 'node:crypto';
import { remark } from 'remark';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import { visit } from 'unist-util-visit';
import type { Root, Html } from 'mdast';
import { SITE_ORIGIN, SITE_BASE, CONTENT } from './site-config';
import smartypants from 'remark-smartypants';
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
  // Astro applies smartypants to markdown pages but not to this standalone
  // processor, so changelog entries rendered with straight quotes and
  // hyphens while every other page rendered typographic ones.
  .use(smartypants)
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

// Sentinel used to park code-span contents while other stripping passes
// run, so a span like `arr[i](x)` survives with its brackets intact instead
// of being reinterpreted as a link. Private-Use-Area code point: safe
// against collision with real review-log prose.
const SPAN_MARK = '';

export function entryTitle(e: LogEntry): string {
  let text = e.markdown;

  // Code spans go first, and their contents are parked behind the sentinel
  // above so nothing later (links, emphasis) can reinterpret punctuation
  // inside them.
  const codeSpans: string[] = [];
  text = text.replace(/`([^`]+)`/g, (_, inner: string) => {
    codeSpans.push(inner);
    return `${SPAN_MARK}${codeSpans.length - 1}${SPAN_MARK}`;
  });

  // Images: ![alt](url) -> alt. Must run before link-stripping, since the
  // link pattern would otherwise match the trailing [alt](url) and leave a
  // stray "!" behind.
  text = text.replace(/!\[(.*?)\]\(.*?\)/g, '$1');

  // Links: [text](url) -> text.
  text = text.replace(/\[(.+?)\]\(.+?\)/g, '$1');

  // Emphasis: only strip a marker run when it is a genuine paired
  // delimiter — hugging non-space text on both sides. A lone "*" between
  // spaces (e.g. "a * b") never satisfies this, so it's left alone.
  text = text.replace(/\*\*(\S(?:.*?\S)?)\*\*/g, '$1'); // bold
  text = text.replace(/\*(\S(?:.*?\S)?)\*/g, '$1'); // italic

  // Unescape a literal escaped asterisk.
  text = text.replace(/\\\*/g, '*');

  // Restore protected code span text, brackets and all.
  text = text.replace(
    new RegExp(`${SPAN_MARK}(\\d+)${SPAN_MARK}`, 'g'),
    (_, i: string) => codeSpans[Number(i)],
  );

  text = text.trim();

  // Truncate to 80 code points safely (no split surrogates), breaking at
  // the last word boundary at-or-before the limit so titles never end
  // mid-word.
  const codePoints = Array.from(text);
  if (codePoints.length <= 80) return text;

  let truncated = codePoints.slice(0, 80).join('');
  // Only back up to the previous word boundary if the cut actually lands
  // mid-word — i.e. the very next character continues the same word. If
  // the 80th character is already a word's last, or is followed by
  // whitespace, the slice is already clean and keeping it preserves the
  // full final word instead of dropping it unnecessarily.
  const nextChar = codePoints[80];
  if (nextChar !== undefined && !/\s/.test(nextChar)) {
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace !== -1) truncated = truncated.slice(0, lastSpace);
  }
  return truncated.trimEnd() + '…';
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
