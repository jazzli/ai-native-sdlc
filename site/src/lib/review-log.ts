import fs from 'node:fs';

export interface LogEntry {
  date: string;
  markdown: string;
}

// Parses the review-log table out of sources.md. Fail-closed: a missing or
// malformed log must fail the site build, the same way a broken citation does.
export function parseReviewLog(sourcesFile: string): LogEntry[] {
  const text = fs.readFileSync(sourcesFile, 'utf8');
  const idx = text.indexOf('### Review log');
  if (idx === -1)
    throw new Error(`Review log heading not found in ${sourcesFile}`);

  const entries: LogEntry[] = [];
  let tableStarted = false;
  for (const rawLine of text.slice(idx).split('\n')) {
    const line = rawLine.trimEnd();
    if (!line.startsWith('|')) {
      // Once the table has started, a non-| line means the table has ended.
      if (tableStarted) break;
      // Before the table starts, skip non-| lines.
      continue;
    }

    // Table has started; mark this before filtering headers.
    tableStarted = true;

    if (/^\|\s*Date\s*\|/.test(line) || /^\|\s*-+\s*\|/.test(line)) continue;
    const m = line.match(/^\|\s*(\S+)\s*\|\s*(.+?)\s*\|$/);
    if (!m || !/^\d{4}-\d{2}-\d{2}$/.test(m[1])) {
      throw new Error(`Malformed review-log row: "${line}"`);
    }
    entries.push({ date: m[1], markdown: m[2] });
  }
  if (entries.length === 0) throw new Error('Review log has no entries');

  // Newest date first; Array.prototype.sort is stable, so same-date rows
  // keep their table order (which is already newest-first within a date).
  return entries.sort((a, b) => b.date.localeCompare(a.date));
}
