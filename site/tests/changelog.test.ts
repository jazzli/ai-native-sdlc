import { describe, it, expect } from 'vitest';
import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { entryHtml, entryId, buildFeed } from '../src/lib/changelog';
import { parseReviewLog } from '../src/lib/review-log';

describe('entryHtml', () => {
  it('renders bold and rewrites internal links to absolute URLs', async () => {
    const html = await entryHtml(
      '**Bold** and [a note](questions/does-sdd-reduce-rework.md)',
    );
    expect(html).toContain('<strong>Bold</strong>');
    expect(html).toContain(
      'https://jazzli.github.io/ai-native-sdlc/positions/does-sdd-reduce-rework/',
    );
  });

  it('escapes raw angle brackets rather than passing script through', async () => {
    const html = await entryHtml('entry with <script>alert(1)</script>');
    expect(html).not.toContain('<script>');
  });
});

describe('entryId', () => {
  it('is stable and unique across same-date entries', () => {
    const a = entryId({ date: '2026-08-20', markdown: 'first thing' });
    const b = entryId({ date: '2026-08-20', markdown: 'second thing' });
    expect(a).toBe(entryId({ date: '2026-08-20', markdown: 'first thing' }));
    expect(a).not.toBe(b);
    expect(a).toMatch(
      /^tag:jazzli\.github\.io,2026:changelog:2026-08-20:[0-9a-f]{12}$/,
    );
  });
});

describe('buildFeed on the real log', () => {
  it('produces well-formed Atom with one entry per log row', async () => {
    const entries = parseReviewLog('../sources.md');
    const xml = await buildFeed(entries);
    expect(XMLValidator.validate(xml)).toBe(true);
    const doc = new XMLParser().parse(xml);
    const feedEntries = Array.isArray(doc.feed.entry)
      ? doc.feed.entry
      : [doc.feed.entry];
    expect(feedEntries.length).toBe(entries.length);
    expect(doc.feed.updated).toBe(`${entries[0].date}T00:00:00Z`);
  });
});
