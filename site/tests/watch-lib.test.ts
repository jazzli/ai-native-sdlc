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
  trackHealth,
  chronic,
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

// A story lingering on a feed was reported on every digest: the queue held
// the same Zalando post three times and Spec Kit three times in five days.
// That is triage load carrying no new information.
describe('createCollector across runs', () => {
  const link = 'https://e.example/a';

  it('reports a link the first time it is seen', () => {
    const c = createCollector([]);
    c.entry('Feed', 'A story', link);
    expect(c.findings).toHaveLength(1);
    expect(c.reported).toEqual([link]);
  });

  it('does not report a link a previous run already reported', () => {
    const c = createCollector([link]);
    c.entry('Feed', 'A story', link);
    expect(c.findings).toEqual([]);
  });

  // The caller persists `reported`, so a link must stay recorded even on the
  // run that suppresses it — otherwise it reappears every other day.
  it('still records a suppressed link as seen', () => {
    const c = createCollector([link]);
    c.entry('Feed', 'A story', link);
    expect(c.reported).toEqual([link]);
  });

  it('still deduplicates within a single run', () => {
    const c = createCollector([]);
    c.entry('Feed', 'A story', link);
    c.entry('Other feed', 'Same story, other source', link);
    expect(c.findings).toHaveLength(1);
  });

  it('falls back to the title when a link is unusable', () => {
    const c = createCollector(['A titled story']);
    c.entry('Feed', 'A titled story', 'javascript:alert(1)');
    expect(c.findings).toEqual([]);
  });

  // The count belongs to whoever knows which entries were dropped. Derived by
  // the caller instead, it read `-1` in a published digest on 2026-08-27:
  // change-detection lines had been pushed onto the findings list, so the
  // subtraction was between two different populations.
  it('counts only the entries it suppressed', () => {
    const c = createCollector([link]);
    c.entry('Feed', 'A story', link);
    c.entry('Feed', 'Another story', 'https://e.example/b');
    expect(c.counts().suppressed).toBe(1);
    expect(c.findings).toHaveLength(1);
  });

  it('does not count a within-run duplicate as suppressed', () => {
    const c = createCollector([]);
    c.entry('Feed', 'A story', link);
    c.entry('Other feed', 'Same story', link);
    expect(c.counts().suppressed).toBe(0);
  });

  it('reports nothing suppressed on a first run', () => {
    const c = createCollector([]);
    c.entry('Feed', 'A story', link);
    expect(c.counts().suppressed).toBe(0);
  });

  // Whatever the caller appends to the digest afterwards, the count cannot go
  // negative: it is incremented, never derived from a list the caller holds.
  it('never reports a negative count', () => {
    const c = createCollector([]);
    for (const n of [1, 2, 3]) c.entry('Feed', `Story ${n}`, `${link}${n}`);
    c.findings.push('- **CHANGED**: a watched page differs from last run');
    expect(c.counts().suppressed).toBeGreaterThanOrEqual(0);
  });
});

describe('digestBody suppression', () => {
  it('distinguishes a quiet day from one that suppressed repeats', () => {
    const nothing = digestBody({
      date: '2026-08-26',
      collected: [],
      errors: [],
    });
    const repeats = digestBody({
      date: '2026-08-26',
      collected: [],
      errors: [],
      suppressed: 40,
    });
    expect(nothing).not.toContain('suppressed');
    expect(repeats).toContain('40 item(s) already reported');
  });
});

// Lenny's Podcast and the AI Engineer channel failed every run between
// 2026-08-24 and 2026-08-27 while returning 200 to a laptop, so the cause was
// the runner's IP, not the URL. Nothing escalated: two dead sources out of
// twenty are a line in a collapsed block, and the queue quietly under-reports.
describe('trackHealth', () => {
  const today = '2026-08-27';

  it('starts a streak at one on the first failure', () => {
    const h = trackHealth({}, { failed: ['A'], attempted: ['A', 'B'], today });
    expect(h.A).toEqual({ runs: 1, since: today });
  });

  it('counts consecutive failures and keeps the first date', () => {
    const h = trackHealth(
      { A: { runs: 3, since: '2026-08-24' } },
      { failed: ['A'], attempted: ['A'], today },
    );
    expect(h.A).toEqual({ runs: 4, since: '2026-08-24' });
  });

  it('forgets a source that succeeded', () => {
    const h = trackHealth(
      { A: { runs: 9, since: '2026-08-01' } },
      { failed: [], attempted: ['A'], today },
    );
    expect(h.A).toBeUndefined();
  });

  // State that only grows is state nobody prunes.
  it('drops a source no longer on the watchlist', () => {
    const h = trackHealth(
      { Gone: { runs: 9, since: '2026-08-01' } },
      { failed: ['A'], attempted: ['A'], today },
    );
    expect(h).toEqual({ A: { runs: 1, since: today } });
  });
});

describe('chronic', () => {
  it('ignores a source that flaked once', () => {
    expect(chronic({ A: { runs: 1, since: '2026-08-27' } })).toEqual([]);
  });

  it('reports a source at the threshold', () => {
    expect(chronic({ A: { runs: 3, since: '2026-08-24' } })).toHaveLength(1);
  });

  it('reports the worst offender first', () => {
    const out = chronic({
      A: { runs: 3, since: '2026-08-24' },
      B: { runs: 8, since: '2026-08-19' },
    });
    expect(out.map((h) => h.name)).toEqual(['B', 'A']);
  });
});

describe('digestBody chronic warning', () => {
  const ailing = [{ name: "Lenny's Podcast", runs: 4, since: '2026-08-24' }];

  it('says nothing when every source is healthy', () => {
    const body = digestBody({ date: '2026-08-27', collected: [], errors: [] });
    expect(body).not.toContain('WARNING');
  });

  it('names the source, the streak and the date', () => {
    const body = digestBody({
      date: '2026-08-27',
      collected: [],
      errors: ["Lenny's Podcast: HTTP 403"],
      chronic: ailing,
    });
    expect(body).toContain('4 consecutive runs since 2026-08-24');
  });

  // A collapsed block is where this failure already was, and where nobody saw
  // it. The warning has to outrank the fold.
  it('puts the warning above the collapsed error block', () => {
    const body = digestBody({
      date: '2026-08-27',
      collected: [],
      errors: ["Lenny's Podcast: HTTP 403"],
      chronic: ailing,
    });
    expect(body.indexOf('[!WARNING]')).toBeLessThan(body.indexOf('<details>'));
  });
});
