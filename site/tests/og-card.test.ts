import { describe, it, expect } from 'vitest';
import { renderCard, type CardSpec } from '../src/lib/og-card';

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
});
