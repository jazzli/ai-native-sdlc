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
  parseFeed,
  parseArxiv,
  parseHn,
  digestBody,
  sweepOutcome,
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

const NOW = Date.parse('2026-08-23T00:00:00Z');
const SINCE = NOW - 48 * 3600_000;
const matchAgents = makeMatcher(['agent', 'sdlc']);

const rss = (items: string[]) =>
  `<rss><channel>${items.join('')}</channel></rss>`;
const item = (title: string, date: string, link = 'https://e.example/a') =>
  `<item><title>${title}</title><pubDate>${date}</pubDate><link>${link}</link><description>body</description></item>`;

describe('parseFeed', () => {
  it('keeps items inside the window that match a keyword', () => {
    const xml = rss([
      item('Coding agent benchmarks', '2026-08-22T10:00:00Z'),
      item('Unrelated gardening post', '2026-08-22T10:00:00Z'),
    ]);
    const out = parseFeed(xml, {
      since: SINCE,
      always: false,
      matches: matchAgents,
    });
    expect(out).toHaveLength(1);
    expect(out[0].title).toBe('Coding agent benchmarks');
  });

  it('drops items older than the window even when they match', () => {
    const xml = rss([item('Agent retrospective', '2026-01-01T00:00:00Z')]);
    expect(
      parseFeed(xml, { since: SINCE, always: false, matches: matchAgents }),
    ).toEqual([]);
  });

  // Some sources are followed wholesale rather than filtered: `always` is how
  // a low-volume, high-signal feed is admitted without keyword luck.
  it('keeps every in-window item from an always-on source', () => {
    const xml = rss([item('Unrelated gardening post', '2026-08-22T10:00:00Z')]);
    expect(
      parseFeed(xml, { since: SINCE, always: true, matches: matchAgents }),
    ).toHaveLength(1);
  });

  it('is empty, not broken, on a body that is not a feed', () => {
    expect(
      parseFeed('<html>nope</html>', {
        since: SINCE,
        always: true,
        matches: matchAgents,
      }),
    ).toEqual([]);
  });
});

describe('parseHn', () => {
  const hits = [
    {
      title: 'An agent harness in production',
      url: 'https://x.example/1',
      points: 40,
    },
    {
      title: 'Cooking with cast iron',
      url: 'https://x.example/2',
      points: 900,
    },
    { title: 'SDLC notes', objectID: '123', points: 5 },
  ];

  // The query is a coarse filter and its results stray, so the same keyword
  // gate the feeds use is applied to what the API actually returned.
  it('re-applies the keyword gate to what the API returned', () => {
    const out = parseHn(hits, { matches: matchAgents });
    expect(out.map((h: { title: string }) => h.title)).toEqual([
      'An agent harness in production',
      'SDLC notes',
    ]);
  });

  it('links to the discussion when a story has no URL of its own', () => {
    const out = parseHn(hits, { matches: matchAgents });
    expect(out[1].link).toBe('https://news.ycombinator.com/item?id=123');
  });

  it('caps how many hits one query can contribute', () => {
    const many = Array.from({ length: 20 }, (_, i) => ({
      title: `agent ${i}`,
      url: `https://x.example/${i}`,
    }));
    expect(parseHn(many, { matches: matchAgents, limit: 3 })).toHaveLength(3);
  });

  it('handles a response with no hits', () => {
    expect(parseHn(undefined, { matches: matchAgents })).toEqual([]);
  });
});

describe('digestBody', () => {
  it('says plainly when a quiet day may be under-reporting', () => {
    const quiet = digestBody({ date: '2026-08-23', collected: [], errors: [] });
    const broken = digestBody({
      date: '2026-08-23',
      collected: [],
      errors: ['feed X: HTTP 500'],
    });
    expect(quiet).toContain('No matching items in the window._');
    expect(quiet).not.toContain('under-reporting');
    expect(broken).toContain('under-reporting');
    expect(broken).toContain('feed X: HTTP 500');
  });
});

// The sweep runs unattended every day. What it decides to do with a quiet
// result is the part that previously went wrong: errors on a zero-finding day
// reached only the workflow log, where nothing read them.
describe('sweepOutcome', () => {
  const o = (
    collected: number,
    errors: number,
    sourceCount = 20,
    dry = false,
  ) =>
    sweepOutcome({
      collected: Array(collected).fill('x'),
      errors: Array(errors).fill('e'),
      sourceCount,
      dry,
    });

  it('posts when there are findings', () => {
    expect(o(3, 0).action).toBe('post');
  });

  it('posts a quiet day that had fetch errors, rather than staying silent', () => {
    expect(o(0, 1).action).toBe('post');
  });

  it('stays silent only when there is nothing to say and nothing broken', () => {
    expect(o(0, 0).action).toBe('skip');
  });

  it('fails the run when most sources are down and nothing was found', () => {
    const r = o(0, 10, 20);
    expect(r.action).toBe('fail');
    expect(r.reason).toContain('10/20');
  });

  it('never posts or fails on a dry run', () => {
    expect(o(5, 0, 20, true).action).toBe('skip');
    expect(o(0, 10, 20, true).action).toBe('skip');
  });
});

describe('parseArxiv', () => {
  const feed = (entries: string[]) => `<feed>${entries.join('')}</feed>`;
  const entry = (title: string, published: string, summary = 'abstract') =>
    `<entry><title>${title}</title><published>${published}</published><summary>${summary}</summary><id>https://arxiv.org/abs/1</id></entry>`;

  it('keeps in-window entries matching on title or abstract', () => {
    const xml = feed([
      entry('Formal methods', '2026-08-22T10:00:00Z', 'evaluating an agent'),
      entry('Protein folding', '2026-08-22T10:00:00Z', 'unrelated'),
    ]);
    const out = parseArxiv(xml, { since: SINCE, matches: matchAgents });
    expect(out).toHaveLength(1);
    expect(out[0].link).toBe('https://arxiv.org/abs/1');
  });

  it('drops entries submitted before the window', () => {
    const xml = feed([entry('Agent survey', '2026-01-01T00:00:00Z')]);
    expect(parseArxiv(xml, { since: SINCE, matches: matchAgents })).toEqual([]);
  });
});
