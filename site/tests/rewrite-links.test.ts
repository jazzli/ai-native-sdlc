import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { visit } from 'unist-util-visit';
import type { Root, Definition, Image } from 'mdast';
import {
  buildStatusMap, extractAnchors, rewriteTarget, checkImageUrl, checkRawHtml,
  type Ctx,
} from '../src/lib/rewrite-links';

const ctx: Ctx = {
  base: '/ai-native-sdlc',
  statusMap: {
    'does-sdd-reduce-rework': 'working-answer',
    'agent-era-observability': 'open',
  },
  anchors: new Set(['dora-2025', 'signal-filter']),
};

describe('rewriteTarget', () => {
  it('passes external and same-page links through as null', () => {
    expect(rewriteTarget('https://dora.dev/x', ctx)).toBeNull();
    expect(rewriteTarget('mailto:x@y.z', ctx)).toBeNull();
    expect(rewriteTarget('#signal-filter', ctx)).toBeNull();
  });

  it('rewrites note-relative sources citations', () => {
    expect(rewriteTarget('../../sources.md#dora-2025', ctx))
      .toBe('/ai-native-sdlc/sources/#dora-2025');
    expect(rewriteTarget('../sources.md#signal-filter', ctx))
      .toBe('/ai-native-sdlc/sources/#signal-filter');
    expect(rewriteTarget('../sources.md', ctx)).toBe('/ai-native-sdlc/sources/');
  });

  it('throws on an unknown sources anchor', () => {
    expect(() => rewriteTarget('../../sources.md#not-a-citekey', ctx))
      .toThrow(/Unknown anchor/);
  });

  it('routes note links by status', () => {
    expect(rewriteTarget('questions/does-sdd-reduce-rework.md', ctx))
      .toBe('/ai-native-sdlc/positions/does-sdd-reduce-rework/');
    expect(rewriteTarget('questions/agent-era-observability.md', ctx))
      .toBe('/ai-native-sdlc/questions/agent-era-observability/');
    // sibling link from one note to another (no questions/ prefix)
    expect(rewriteTarget('agent-era-observability.md', ctx))
      .toBe('/ai-native-sdlc/questions/agent-era-observability/');
  });

  it('throws on a link to a nonexistent note', () => {
    expect(() => rewriteTarget('questions/nope.md', ctx)).toThrow(/unknown note/i);
  });

  it('rewrites protocol, playbook, and bare directory links', () => {
    expect(rewriteTarget('protocol.md', ctx)).toBe('/ai-native-sdlc/protocol/');
    expect(rewriteTarget('docs/protocol.md', ctx)).toBe('/ai-native-sdlc/protocol/');
    expect(rewriteTarget('playbook.md', ctx)).toBe('/ai-native-sdlc/');
    expect(rewriteTarget('questions/', ctx)).toBe('/ai-native-sdlc/');
  });

  it('throws on unrecognized internal links', () => {
    expect(() => rewriteTarget('random-file.txt', ctx)).toThrow(/Unrecognized/);
  });
});

describe('against the real repository content', () => {
  const real: Ctx = {
    base: '/ai-native-sdlc',
    statusMap: buildStatusMap('../docs/questions'),
    anchors: extractAnchors('../sources.md'),
  };

  it('buildStatusMap finds all 8 notes with valid statuses', () => {
    expect(Object.keys(real.statusMap)).toHaveLength(8);
    expect(real.statusMap['does-sdd-reduce-rework']).toBe('working-answer');
    expect(real.statusMap['agent-era-observability']).toBe('open');
  });

  it('extractAnchors finds citekeys and heading slugs', () => {
    expect(real.anchors.has('dora-2025')).toBe(true);
    expect(real.anchors.has('utboost-2025')).toBe(true);
    expect(real.anchors.has('signal-filter')).toBe(true);
    expect(real.anchors.has('maintenance')).toBe(true);
  });

  it('slugs em-dash headings the same way github-slugger (rendered ids) does', () => {
    // "Tier 1 — Empirical research" — github-slugger collapses the em dash's
    // surrounding spaces into a DOUBLE hyphen, not a single one. The old
    // hand-rolled regex produced the single-hyphen form, which never matched
    // a rendered id.
    expect(real.anchors.has('tier-1--empirical-research')).toBe(true);
    expect(real.anchors.has('tier-1-empirical-research')).toBe(false);
    expect(real.anchors.has('tier-2--practitioner-methodology')).toBe(true);
    expect(real.anchors.has('tier-3--standards--specs')).toBe(true);
  });

  it('every internal link in every content file resolves', async () => {
    // Parse with the real pipeline — a raw regex would misread code-span
    // EXAMPLES of the citation syntax (sources.md documents it in backticks)
    // as actual links. Only genuine link nodes reach the plugin.
    const { remark } = await import('remark');
    const remarkFrontmatter = (await import('remark-frontmatter')).default;
    const { remarkRewriteLinks } = await import('../src/lib/rewrite-links');
    const plugin = remarkRewriteLinks({
      base: '/ai-native-sdlc',
      questionsDir: '../docs/questions',
      sourcesFile: '../sources.md',
    });
    const files = [
      '../docs/playbook.md',
      '../docs/protocol.md',
      '../sources.md',
      ...fs.readdirSync('../docs/questions')
        .filter((f) => f.endsWith('.md'))
        .map((f) => `../docs/questions/${f}`),
    ];
    for (const f of files) {
      const text = fs.readFileSync(f, 'utf8');
      // process() throws iff the plugin throws on a genuine broken link.
      await expect(
        remark().use(remarkFrontmatter).use(plugin).process(text),
        f,
      ).resolves.toBeDefined();
    }
  });
});

describe('checkImageUrl', () => {
  it('passes external https images through', () => {
    expect(() => checkImageUrl('https://example.com/x.png')).not.toThrow();
  });

  it('throws on any relative or internal image url — no asset home exists yet', () => {
    expect(() => checkImageUrl('../../sources.md')).toThrow(/no defined home/i);
    expect(() => checkImageUrl('./diagram.png')).toThrow(/no defined home/i);
  });
});

describe('checkRawHtml', () => {
  it('throws on a raw <a href> with an internal-looking target', () => {
    expect(() => checkRawHtml('<a href="../../sources.md#dora-2025">'))
      .toThrow(/markdown syntax/i);
  });

  it('throws on a raw <img src> with an internal-looking target', () => {
    expect(() => checkRawHtml('<img src="./diagram.png">')).toThrow(/markdown syntax/i);
  });

  it('passes raw HTML whose target is external, mailto, or a fragment', () => {
    expect(() => checkRawHtml('<a href="https://dora.dev/x">')).not.toThrow();
    expect(() => checkRawHtml('<a href="mailto:x@y.z">')).not.toThrow();
    expect(() => checkRawHtml('<a href="#signal-filter">')).not.toThrow();
    // the citekey anchors already in sources.md: no href at all
    expect(() => checkRawHtml('<a id="dora-2025"></a>')).not.toThrow();
  });
});

// I3: the walker used to only visit `link` nodes, so reference-style
// definitions, images, and raw-HTML <a>/<img> all passed through unrewritten
// and unchecked — silent 404s for readers. These exercise the real
// remark pipeline (not just the pure helpers above) so they prove the
// visitor itself reaches these node types, using the real repo content dirs
// to build a valid Ctx without needing fixture files.
describe('remarkRewriteLinks visits definition, image, and html nodes', () => {
  const opts = {
    base: '/ai-native-sdlc',
    questionsDir: '../docs/questions',
    sourcesFile: '../sources.md',
  };

  async function transform(markdown: string): Promise<Root> {
    const { unified } = await import('unified');
    const remarkParse = (await import('remark-parse')).default;
    const { remarkRewriteLinks } = await import('../src/lib/rewrite-links');
    const processor = unified().use(remarkParse).use(remarkRewriteLinks(opts));
    const tree = processor.parse(markdown) as Root;
    return processor.runSync(tree) as Root;
  }

  it('rewrites a reference-style definition the same as a link', async () => {
    const tree = await transform('[ref]: ../../sources.md#dora-2025\n');
    let def: Definition | undefined;
    visit(tree, 'definition', (node: Definition) => { def = node; });
    expect(def?.url).toBe('/ai-native-sdlc/sources/#dora-2025');
  });

  it('throws when a definition cites an unknown citekey', async () => {
    await expect(transform('[ref]: ../../sources.md#not-a-real-citekey\n'))
      .rejects.toThrow(/Unknown anchor/);
  });

  it('throws on an internal/relative image — no asset policy exists yet', async () => {
    await expect(transform('![alt](../../sources.md)\n'))
      .rejects.toThrow(/no defined home/i);
  });

  it('passes an external image through unchanged', async () => {
    const tree = await transform('![alt](https://example.com/x.png)\n');
    let img: Image | undefined;
    visit(tree, 'image', (node: Image) => { img = node; });
    expect(img?.url).toBe('https://example.com/x.png');
  });

  it('throws on a raw-HTML anchor with an internal-looking href', async () => {
    await expect(transform('<a href="../../sources.md#dora-2025">text</a>\n'))
      .rejects.toThrow(/markdown syntax/i);
  });
});
