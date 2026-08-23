import { describe, it, expect, vi } from 'vitest';
import {
  renderCard,
  cardElement,
  normalizeCardText,
  type CardSpec,
  type CardElement,
} from '../src/lib/og-card';

// These render real PNGs through satori and resvg, font loading included, and
// take about six seconds together. The default five-second timeout sits inside
// that range, so the suite failed intermittently under parallel load on work
// that was progressing normally.
vi.setConfig({ testTimeout: 20_000 });

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const pngWidth = (b: Buffer) => b.readUInt32BE(16);
const pngHeight = (b: Buffer) => b.readUInt32BE(20);

const note: CardSpec = {
  kind: 'note',
  title: 'Does spec-driven development actually reduce rework?',
  status: 'working-answer',
  updated: '2026-08-21',
};

describe('renderCard', () => {
  it('renders a note card as a 1200x630 PNG', async () => {
    const png = await renderCard(note);
    expect(png.subarray(0, 8).equals(PNG_MAGIC)).toBe(true);
    expect(pngWidth(png)).toBe(1200);
    expect(pngHeight(png)).toBe(630);
  });

  it('renders a page card', async () => {
    const png = await renderCard({
      kind: 'page',
      title: 'Source Map',
      subtitle: 'Tiered, filter-stated, primary-verified sources',
    });
    expect(png.subarray(0, 8).equals(PNG_MAGIC)).toBe(true);
    expect(pngWidth(png)).toBe(1200);
  });

  it('survives a very long title without throwing', async () => {
    const png = await renderCard({
      ...note,
      title:
        'What does security look like when the developer is partly an agent and the title keeps going well past any reasonable length for a heading',
    });
    expect(pngHeight(png)).toBe(630);
  });

  it('fails closed on malformed specs', async () => {
    await expect(renderCard({ kind: 'note', title: 'x' })).rejects.toThrow(
      /note card requires/,
    );
    await expect(renderCard({ kind: 'page', title: 'x' })).rejects.toThrow(
      /page card requires/,
    );
  });

  it('renders a title containing → without throwing', async () => {
    const png = await renderCard({
      ...note,
      title:
        'AI×throughput turned negative→positive — does the sign flip hold?',
    });
    expect(png.subarray(0, 8).equals(PNG_MAGIC)).toBe(true);
    expect(pngHeight(png)).toBe(630);
  });

  it('rejects a title containing characters outside the vendored subset', async () => {
    await expect(
      renderCard({ ...note, title: '日本語のタイトル' }),
    ).rejects.toThrow(/unsupported character/);
  });
});

describe('normalizeCardText', () => {
  it('maps → to a subset-covered angle quotation mark', () => {
    expect(normalizeCardText('a→b')).toBe('a›b');
  });

  it('maps ← to a subset-covered angle quotation mark', () => {
    expect(normalizeCardText('a←b')).toBe('a‹b');
  });

  it('passes em dash and multiplication sign through untouched', () => {
    expect(normalizeCardText('a—b×c')).toBe('a—b×c');
  });

  it('throws naming the offending character for uncovered glyphs', () => {
    expect(() => normalizeCardText('日本語')).toThrow(/日/);
  });
});

// Structural regression guard: satori's lineClamp only engages on
// display:'block' elements. If a future edit flips the title/subtitle back
// to display:'flex', clamping silently stops working with no render error —
// these tests catch that at the element-tree level, before a PNG is ever
// produced.
describe('cardElement structural guards', () => {
  const titleAndSubtitle = (spec: CardSpec) => {
    const root = cardElement(spec);
    const [, title, subtitle] = root.props.children as CardElement[];
    return { title, subtitle };
  };

  it('clamps the note title with block display and a numeric lineClamp', () => {
    const { title } = titleAndSubtitle(note);
    expect(title.props.style?.display).toBe('block');
    expect(typeof title.props.style?.lineClamp).toBe('number');
  });

  it('clamps the page subtitle with block display and a numeric lineClamp', () => {
    const { subtitle } = titleAndSubtitle({
      kind: 'page',
      title: 'Source Map',
      subtitle: 'Tiered, filter-stated, primary-verified sources',
    });
    expect(subtitle.props.style?.display).toBe('block');
    expect(typeof subtitle.props.style?.lineClamp).toBe('number');
  });
});
