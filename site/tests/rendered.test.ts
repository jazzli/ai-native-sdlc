import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// Smoke assertions over built output. The .astro layer is the highest-churn
// code in the repo and had no automated check: three real defects shipped to
// review here (changelog headings unstyled by a stray <section> wrapper, the
// colophon's falsifier slab silently absent, an empty footer's stray rule).
// Each was caught by a human looking at output. These assert the invariants
// those defects violated.
//
// Requires a build. Skipped locally when dist/ is absent; REQUIRE_RENDERED=1
// (set in CI, which builds first) turns absence into a failure so the checks
// can never silently vanish.
const DIST = path.resolve(__dirname, '../dist');
const built = fs.existsSync(DIST);

if (!built && process.env.REQUIRE_RENDERED === '1') {
  throw new Error(
    'REQUIRE_RENDERED=1 but site/dist is missing — run `npm run build` first',
  );
}

const read = (p: string) => fs.readFileSync(path.join(DIST, p), 'utf8');
const glob = (dir: string) =>
  fs.existsSync(path.join(DIST, dir))
    ? fs
        .readdirSync(path.join(DIST, dir), { withFileTypes: true })
        .filter((d) => d.isDirectory())
    : [];

describe.skipIf(!built)('rendered output', () => {
  let notePages: string[] = [];
  let allPages: string[] = [];
  let redirects: string[] = [];

  // Each note is built under both sections — one renders it, the other
  // redirects — so "page" here means the rendering one. Redirect stubs are
  // held separately and asserted on their own terms below.
  const isRedirect = (p: string) => read(p).includes('http-equiv="refresh"');

  beforeAll(() => {
    const noteHtml = [
      ...glob('positions').map((d) => `positions/${d.name}/index.html`),
      ...glob('questions').map((d) => `questions/${d.name}/index.html`),
    ];
    notePages = noteHtml.filter((p) => !isRedirect(p));
    redirects = noteHtml.filter(isRedirect);
    allPages = fs
      .readdirSync(DIST, { recursive: true } as never)
      .filter((f) => String(f).endsWith('index.html'))
      .map(String)
      .filter((p) => !redirects.includes(p));
  });

  it('builds the expected page set', () => {
    expect(notePages.length).toBe(11);
    expect(allPages.length).toBe(18);
    // One stub per note: the section it is not currently published under.
    expect(redirects.length).toBe(11);
  });

  it('renders the falsifier slab on every note page', () => {
    for (const p of notePages) {
      expect(read(p).match(/class="falsifier"/g)?.length, p).toBe(1);
    }
  });

  it('offers a challenge link on every note page', () => {
    for (const p of notePages) {
      expect(read(p), p).toContain('issues/new?labels=challenge');
    }
  });

  it('keeps changelog date headings unwrapped, so main > h2 styling applies', () => {
    const html = read('changelog/index.html');
    expect(html).toContain('<h2');
    expect(html).not.toContain('<section');
  });

  it('ships a colophon link in the footer of every page', () => {
    for (const p of allPages)
      expect(read(p), p).toContain('How this site is built');
  });

  it('points every page at an OG card that exists, and 404 at none', () => {
    for (const p of allPages) {
      const m = read(p).match(
        /property="og:image" content="[^"]*\/og\/([^"]+)"/,
      );
      expect(m, p).not.toBeNull();
      expect(
        fs.existsSync(path.join(DIST, 'og', m![1])),
        `${p} → og/${m![1]}`,
      ).toBe(true);
    }
    expect(read('404.html')).not.toContain('og:image');
  });

  it('preserves every registry citekey anchor on the sources page', () => {
    const inSource = fs.readFileSync(
      path.resolve(__dirname, '../../sources.md'),
      'utf8',
    );
    const keys = [...inSource.matchAll(/<a id="([a-z0-9-]+)"/g)].map(
      (m) => m[1],
    );
    const html = read('sources/index.html');
    expect(keys.length).toBeGreaterThanOrEqual(30);
    for (const k of keys) expect(html, k).toContain(`id="${k}"`);
  });

  it('serves a raw markdown variant for every page except the changelog', () => {
    const md = new Set(
      fs
        .readdirSync(DIST, { recursive: true } as never)
        .filter((f) => String(f).endsWith('.md'))
        .map(String),
    );
    // Membership rather than a count: deliberate extras exist (playbook.md
    // aliases index.md so the URL the adoption instructions imply resolves),
    // and a count would make every future addition look like a regression.
    const variant = (page: string) =>
      page === 'index.html'
        ? 'index.md'
        : page.replace(/\/index\.html$/, '.md');
    for (const page of allPages) {
      if (page.startsWith('changelog/')) continue;
      expect(md.has(variant(page)), variant(page)).toBe(true);
    }
    // A redirect cannot help an agent holding a stale `.md` URL, so the note
    // is served under both sections.
    for (const r of redirects)
      expect(md.has(variant(r)), variant(r)).toBe(true);
    expect(fs.existsSync(path.join(DIST, 'changelog.xml'))).toBe(true);
  });

  it('offers a skip-to-content link targeting main on every page', () => {
    for (const p of allPages) {
      const html = read(p);
      expect(html, p).toContain('class="skip" href="#main"');
      expect(html, p).toContain('<main id="main"');
    }
  });

  it('publishes a parseable positions manifest whose ids match the built pages', () => {
    const m = JSON.parse(read('positions.json'));
    expect(m.digest).toMatch(/^[0-9a-f]{12}$/);
    const built = notePages.map((p) => p.split('/')[1]).sort();
    expect(m.positions.map((x: { id: string }) => x.id).sort()).toEqual(built);
    for (const p of m.positions)
      expect(p.falsifiers.length, p.id).toBeGreaterThan(0);
  });

  it('makes every page self-describing to an agent that lands on it', () => {
    for (const p of allPages) {
      const html = read(p);
      expect(html, `${p} llms.txt`).toContain('type="text/plain"');
      expect(html, `${p} manifest`).toContain('/positions.json"');
    }
    // Pages with a raw variant advertise it; the changelog has none by
    // design (it serves Atom instead), so assert against the actual set.
    const withMd = allPages.filter((p) => !p.startsWith('changelog/'));
    for (const p of withMd) {
      expect(read(p), `${p} markdown alternate`).toContain(
        'type="text/markdown"',
      );
    }
  });

  it('ships zero client-side JavaScript', () => {
    for (const p of allPages) expect(read(p), p).not.toContain('<script');
  });

  it('lists every canonical page in the sitemap, and no redirect stub', () => {
    const locs = [...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      (m) => m[1].replace(/^https:\/\/[^/]+\/ai-native-sdlc/, ''),
    );
    for (const p of allPages) {
      const want =
        p === 'index.html' ? '/' : `/${p.replace('/index.html', '/')}`;
      expect(locs, want).toContain(want);
    }
    // Stubs carry noindex and point at the canonical page; listing them
    // would invite a crawler to index the redirect instead of the note.
    for (const r of redirects)
      expect(locs).not.toContain(`/${r.replace('/index.html', '/')}`);
  });

  it('points crawlers at the sitemap and agents at the manifests', () => {
    const robots = read('robots.txt');
    expect(robots).toContain('/sitemap.xml');
    expect(robots).toContain('/llms.txt');
    expect(robots).toContain('/positions.json');
  });

  it('declares each page as what it is, and describes notes by their claim', () => {
    expect(read('index.html')).toContain('og:type" content="website"');
    const note = read('positions/does-sdd-reduce-rework/index.html');
    expect(note).toContain('og:type" content="article"');
    // A description repeating the page title tells a search result nothing.
    const title = note.match(/<title>([^<·]+)/)![1].trim();
    const desc = note.match(/name="description" content="([^"]+)"/)![1];
    expect(desc).not.toBe(title);
    expect(desc).not.toMatch(/\?$/);
  });

  // A note that reaches a working answer moves from /questions/ to
  // /positions/ — the outcome the falsifier watch exists to cause — and
  // every link already made to it breaks. Both paths are always built: one
  // renders, the other redirects. Publishing `url` in the manifest makes
  // this the site's problem, not only the reader's.
  it('redirects each note from the section it is not published under', () => {
    const canonical = new Set(
      notePages.map((p) => p.replace('/index.html', '/')),
    );
    expect(redirects.length).toBe(notePages.length);
    for (const r of redirects) {
      const html = read(r);
      const to = html.match(/url=([^"']+)/)?.[1];
      expect(to, `${r} names a target`).toBeTruthy();
      const rel = to!.replace(/^\/ai-native-sdlc\//, '');
      // Same note, other section — never a different slug.
      expect(rel.split('/')[1], `${r} keeps the slug`).toBe(r.split('/')[1]);
      expect(rel.split('/')[0], `${r} switches section`).not.toBe(
        r.split('/')[0],
      );
      // The target renders. A redirect pointing at another redirect would
      // bounce a reader between two dead URLs forever.
      expect(canonical.has(rel), `${r} -> ${rel} must render`).toBe(true);
      expect(fs.existsSync(path.join(DIST, rel, 'index.html'))).toBe(true);
      expect(html, `${r} noindex`).toContain('noindex');
      expect(html, `${r} canonical`).toContain(`rel="canonical" href="${to}"`);
    }
  });
});

// The adoption contract's executable surface. A dogfooding pass — following
// /adopt cold against a scratch repo — found the published drift check
// reported an unreachable site as upstream drift, and depended on JSON key
// order and pretty-printing that nothing guarded. The fix serves the digest
// as text so a scheduler compares strings; these pin the artifacts that
// downstream policies now depend on.
describe.skipIf(!built)('adoption contract artifacts', () => {
  it('serves the top-level digest as bare text', () => {
    expect(read('positions.digest').trim()).toMatch(/^[0-9a-f]{12}$/);
  });

  it('serves a digest identical to the manifest, so a check cannot go stale', () => {
    expect(read('positions.digest.txt').trim()).toBe(
      JSON.parse(read('positions.json')).digest,
    );
  });

  // Pages types by extension and offers no override, so `.digest` was served
  // as application/octet-stream. `.txt` is canonical; the original URL stays
  // because it was published in the drift check on /adopt. The two must never
  // disagree — an adopter on either one compares against the same string.
  it('keeps the retained .digest alias byte-identical to the canonical one', () => {
    expect(read('positions.digest')).toBe(read('positions.digest.txt'));
  });

  it('wires the published drift check to the correctly-typed endpoint', () => {
    // Two sh blocks are published: the starter download and the drift check.
    // Assert against the one that fetches a digest, not whichever comes first.
    const blocks = [...read('adopt.md').matchAll(/```sh\n([\s\S]*?)```/g)].map(
      (m) => m[1],
    );
    const drift = blocks.filter((b) => b.includes('digest'));
    expect(drift, 'a drift-check block is published').toHaveLength(1);
    expect(drift[0]).toContain('positions.digest.txt');
  });

  it('pins a schema version downstream parsers can check', () => {
    expect(JSON.parse(read('positions.json')).schemaVersion).toBe(1);
  });

  it('answers /playbook.md, which the instructions send adopters to', () => {
    expect(read('playbook.md')).toContain('# AI-Native SDLC Playbook');
  });

  // Both agent-facing surfaces listed each position by the *question* it
  // answers, so an agent skimming them collected interrogatives under a
  // heading reading "Positions" — and an adopter mapping by id wrote them
  // into a policy as rules.
  // A fresh adopter downloads the starter and wires the drift check. If the
  // lockfile's digest disagreed with the manifest by even a build, their
  // very first check would report drift and they would learn to ignore it.
  // 1,400 words across ten sections used to open with three paragraphs of
  // lede and then the first position, with no way to see the shape of the
  // argument. The list is generated from the headings, so it cannot drift
  // from them the way a hand-kept index would.
  it('indexes the playbook from its own headings, with every link resolving', () => {
    const html = read('index.html');
    const nav = html.match(/<nav class="contents"[\s\S]*?<\/nav>/)?.[0];
    expect(nav, 'contents nav present').toBeTruthy();
    const hrefs = [...nav!.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);
    const ids = [...html.matchAll(/<h2[^>]*id="([^"]+)"/g)].map((m) => m[1]);
    expect(hrefs.length, 'one entry per section').toBe(ids.length);
    for (const h of hrefs) expect(ids, `#${h} resolves`).toContain(h);
  });

  it('keeps the generated index out of the markdown an agent fetches', () => {
    for (const f of ['index.md', 'playbook.md'])
      expect(read(f), f).not.toContain('nav class="contents"');
  });

  it('serves a starter whose lockfile agrees with the manifest it ships beside', () => {
    const lock = JSON.parse(read('starter/sdlc-upstream.json'));
    const manifest = JSON.parse(read('positions.json'));
    expect(lock.digest).toBe(manifest.digest);
    expect(lock.schemaVersion).toBe(manifest.schemaVersion);
    for (const p of manifest.positions)
      expect(lock.positions[p.id], p.id).toBe(p.digest);
    const policy = read('starter/sdlc-policy.md');
    expect(policy).toContain('# AI-Native SDLC policy');
    expect(policy).not.toMatch(/TODO|FIXME/);
  });

  // Adopters fetch this and run it against their own policy, so what is
  // served must be the file the suite exercises, not a copy of it.
  it('serves the conformance checker the tests import', () => {
    const served = read('check-policy.mjs');
    const source = fs.readFileSync(
      path.resolve(__dirname, '../../tools/check-policy.mjs'),
      'utf8',
    );
    expect(served).toBe(source);
    expect(served).toContain('export function checkPolicy');
  });

  // The map's value is that an uncovered domain is visible. A published
  // manifest that quietly dropped them would be worse than none.
  it('publishes uncovered domains rather than omitting them', () => {
    const c = JSON.parse(read('capabilities.json'));
    expect(c.schemaVersion).toBe(1);
    const uncovered = c.capabilities.filter(
      (d: { evidence: string }) => d.evidence === 'uncovered',
    );
    expect(uncovered.length).toBeGreaterThan(0);
    for (const d of uncovered) {
      expect(d.positions, d.id).toEqual([]);
      expect(d.openQuestions, d.id).toEqual([]);
    }
    // Every note the manifest publishes is placed somewhere on the map.
    const placed = c.capabilities.flatMap(
      (d: { positions: string[]; openQuestions: string[] }) => [
        ...d.positions,
        ...d.openQuestions,
      ],
    );
    const ids = JSON.parse(read('positions.json')).positions.map(
      (p: { id: string }) => p.id,
    );
    expect(placed.slice().sort()).toEqual(ids.slice().sort());
  });

  it('states positions as claims, on every agent-facing surface', () => {
    for (const p of JSON.parse(read('positions.json')).positions) {
      if (p.status !== 'working-answer') continue;
      expect(p.claim, p.id).toBeTruthy();
      expect(p.claim, `${p.id} is a claim, not a question`).not.toMatch(/\?$/);
    }
    const listed = read('llms.txt')
      .split('## Positions')[1]
      .split('## ')[0]
      .split('\n')
      .filter((l) => l.startsWith('- ['))
      .map((l) => l.slice(3, l.indexOf(']')));
    expect(listed).toHaveLength(9);
    for (const l of listed) {
      expect(l, 'listed as a claim').not.toMatch(/\?$/);
      expect(l, 'not a section heading').not.toBe('No position yet');
    }
  });
});
