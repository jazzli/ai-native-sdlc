import { describe, it, expect } from 'vitest';
// The discovery sweep's pure helpers live outside site/ but inside the
// same gate suite — untested load-bearing code is the one shape this repo
// does not ship.
import {
  makeMatcher,
  sanitize,
  safeLink,
  clean,
  pick,
  pickLink,
  createCollector,
} from '../../watch/lib.mjs';

describe('makeMatcher', () => {
  const m = makeMatcher(['coding agent', '智能体', 'AI 编程']);
  it('matches case-insensitively in English and Chinese', () => {
    expect(m('A Coding Agent story')).toBe(true);
    expect(m('本期聊聊智能体的未来')).toBe(true);
    expect(m('ai 编程实践')).toBe(true);
    expect(m('unrelated kubernetes news')).toBe(false);
  });
});

describe('sanitize', () => {
  it('neutralizes markdown hijacks, backticks, and mentions', () => {
    const out = sanitize('pwn](https://evil.example) @jazzli `x`');
    expect(out).not.toContain(']('); // link-out is broken
    expect(out).toContain('\\]');
    expect(out).toContain('&#40;');
    expect(out).toContain('@​');
    expect(out).toContain('\\`');
  });
  it('caps length at 200', () => {
    expect(sanitize('a'.repeat(500)).length).toBeLessThanOrEqual(200);
  });
});

describe('safeLink', () => {
  it('accepts only http(s) and encodes breakout characters', () => {
    expect(safeLink('javascript:alert(1)')).toBe('');
    expect(safeLink('ftp://x')).toBe('');
    expect(safeLink('https://a/b) c')).toBe('https://a/b%29%20c');
  });
});

describe('clean', () => {
  it('strips double-escaped HTML from GitHub-style Atom content', () => {
    const gh = '&lt;h2&gt;Release&lt;/h2&gt;&lt;pre&gt;code&lt;/pre&gt; done';
    const out = clean(gh);
    expect(out).not.toMatch(/<\w+/);
    expect(out).toContain('Release');
    expect(out).toContain('done');
  });
  it('handles CDATA and entities', () => {
    expect(clean('<![CDATA[<b>Hi</b> &amp; bye]]>')).toBe('Hi & bye');
  });
});

describe('pick / pickLink', () => {
  const rss = '<item><title>T</title><link>https://r/x</link></item>';
  const atom = '<entry><title>T</title><link href="https://a/y"/></entry>';
  it('extracts from both RSS and Atom shapes', () => {
    expect(pick(rss, 'title')).toBe('T');
    expect(pickLink(rss)).toBe('https://r/x');
    expect(pickLink(atom)).toBe('https://a/y');
  });
});

describe('createCollector', () => {
  it('dedupes by link and formats findings', () => {
    const { entry, findings } = createCollector();
    entry('HN "q1" (5 pts)', 'Same story', 'https://x/1');
    entry('HN "q2" (5 pts)', 'Same story', 'https://x/1');
    entry('arXiv', 'Other', 'https://x/2');
    expect(findings).toHaveLength(2);
    expect(findings[0]).toContain('[Same story](https://x/1)');
  });
  it('sanitizes hostile titles end to end', () => {
    const { entry, findings } = createCollector();
    entry('HN', 'x](https://evil) @user', 'https://ok/1');
    expect(findings[0]).not.toContain('](https://evil)');
    expect(findings[0]).toContain('@​');
  });
});
