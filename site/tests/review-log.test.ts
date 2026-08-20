import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { parseReviewLog } from '../src/lib/review-log';

function tmpFile(content: string): string {
  const p = path.join(
    os.tmpdir(),
    `review-log-${Math.random().toString(36).slice(2)}.md`,
  );
  fs.writeFileSync(p, content);
  return p;
}

describe('parseReviewLog on the real registry', () => {
  const entries = parseReviewLog('../sources.md');

  it('finds at least 7 entries', () => {
    expect(entries.length).toBeGreaterThanOrEqual(7);
  });

  it('sorts newest date first, stably', () => {
    const dates = entries.map((e) => e.date);
    const sorted = [...dates].sort().reverse();
    expect(dates).toEqual(sorted);
    // the oldest row (initial compilation) sorts last despite being first in the file
    expect(entries[entries.length - 1].markdown).toMatch(/Initial compilation/);
  });

  it('preserves entry markdown verbatim', () => {
    const launched = entries.find((e) => e.markdown.includes('Site launched'));
    expect(launched?.markdown).toContain('**Site launched**');
  });
});

describe('parseReviewLog failure modes', () => {
  it('throws when the heading is missing', () => {
    const p = tmpFile(
      '# No log here\n\n| Date | Action |\n| --- | --- |\n| 2026-01-01 | x |\n',
    );
    expect(() => parseReviewLog(p)).toThrow(/Review log heading not found/);
  });

  it('throws on an empty table', () => {
    const p = tmpFile('### Review log\n\n| Date | Action |\n| --- | --- |\n');
    expect(() => parseReviewLog(p)).toThrow(/no entries/i);
  });

  it('throws on a malformed date cell', () => {
    const p = tmpFile(
      '### Review log\n\n| Date | Action |\n| --- | --- |\n| yesterday | broke it |\n',
    );
    expect(() => parseReviewLog(p)).toThrow(/Malformed review-log row/);
  });
});
