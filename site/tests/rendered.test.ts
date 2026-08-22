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

  beforeAll(() => {
    notePages = [
      ...glob('positions').map((d) => `positions/${d.name}/index.html`),
      ...glob('questions').map((d) => `questions/${d.name}/index.html`),
    ];
    allPages = fs
      .readdirSync(DIST, { recursive: true } as never)
      .filter((f) => String(f).endsWith('index.html'))
      .map(String);
  });

  it('builds the expected page set', () => {
    expect(notePages.length).toBe(11);
    expect(allPages.length).toBe(17);
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
    const md = fs
      .readdirSync(DIST, { recursive: true } as never)
      .filter((f) => String(f).endsWith('.md'))
      .map(String)
      // playbook.md is a deliberate alias of index.md: the adoption
      // instructions name the playbook by that word, so the guessed URL
      // must resolve. It has no page of its own, hence no 1:1 partner.
      .filter((f) => f !== 'playbook.md');
    expect(md.length).toBe(allPages.length - 1);
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
    expect(read('positions.digest').trim()).toBe(
      JSON.parse(read('positions.json')).digest,
    );
  });

  it('pins a schema version downstream parsers can check', () => {
    expect(JSON.parse(read('positions.json')).schemaVersion).toBe(1);
  });

  it('answers /playbook.md, which the instructions send adopters to', () => {
    expect(read('playbook.md')).toContain('# AI-Native SDLC Playbook');
  });
});
