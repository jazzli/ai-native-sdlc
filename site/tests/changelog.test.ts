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
    expect(Array.from(title).length).toBeLessThanOrEqual(81); // 80 + the ellipsis
    expect(!/[\uD800-\uDBFF]$/.test(title)).toBe(true);
  });

  it('truncates over-length titles at the last word boundary with an ellipsis', () => {
    // 75 'a's, a space, then 20 'b's: the 80-code-point cutoff lands inside
    // the run of 'b's, so the result must back up to the space and drop
    // the partial word rather than keep "...bbbb".
    const markdown = 'a'.repeat(75) + ' ' + 'b'.repeat(20);
    const title = entryTitle({ date: '2026-08-20', markdown });
    expect(title).toBe('a'.repeat(75) + '…');
  });

  it('does not drop a final word that already ends exactly at the limit', () => {
    const words = Array(9).fill('elephant').join(' '); // exactly 80 code points
    const title = entryTitle({
      date: '2026-08-20',
      markdown: words + ' more text after the boundary',
    });
    expect(title).toBe(words + '…');
  });

  it('keeps code-span contents, brackets included, out of link-stripping', () => {
    const title = entryTitle({
      date: '2026-08-20',
      markdown: 'See `arr[i](x)` for details',
    });
    expect(title).toBe('See arr[i](x) for details');
  });

  it('converts image syntax to its alt text', () => {
    const title = entryTitle({
      date: '2026-08-20',
      markdown: '![chart](https://example.com/u.png)',
    });
    expect(title).toBe('chart');
  });

  it('leaves a lone asterisk between spaces untouched', () => {
    const title = entryTitle({ date: '2026-08-20', markdown: 'a * b' });
    expect(title).toBe('a * b');
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
