import { describe, it, expect } from 'vitest';
import { XMLParser, XMLValidator } from 'fast-xml-parser';
import {
  entryHtml,
  entryId,
  entryTitle,
  entryAnchor,
  buildFeed,
} from '../src/lib/changelog';
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

  it('rejects raw HTML in entries', async () => {
    await expect(entryHtml('entry with <a id="x"></a>')).rejects.toThrow(
      /Raw HTML is not allowed/,
    );
  });
});

describe('entryTitle', () => {
  it('strips markdown formatting from title', () => {
    const title = entryTitle({
      date: '2026-08-20',
      markdown: '**Bold** and [link text](url)',
    });
    expect(title).toBe('Bold and link text');
  });

  it('truncates emoji-heavy strings without splitting surrogates', () => {
    const emojiHeavy = Array(100).fill('😀').join('');
    const title = entryTitle({
      date: '2026-08-20',
      markdown: emojiHeavy,
    });
    expect(Array.from(title).length).toBeLessThanOrEqual(80);
    expect(!/[\uD800-\uDBFF]$/.test(title)).toBe(true);
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

describe('entryAnchor', () => {
  it('returns anchor with entry hash', () => {
    const anchor = entryAnchor({
      date: '2026-08-20',
      markdown: 'test entry',
    });
    expect(anchor).toMatch(/^e-[0-9a-f]{12}$/);
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

  it('includes entry anchors in link hrefs', async () => {
    const entry = { date: '2026-08-20', markdown: 'test' };
    const xml = await buildFeed([entry]);
    expect(xml).toContain(`#${entryAnchor(entry)}`);
  });

  it('rejects duplicate entries with same id', async () => {
    const entry = { date: '2026-08-20', markdown: 'duplicate' };
    await expect(buildFeed([entry, entry])).rejects.toThrow(/duplicate/i);
  });
});
