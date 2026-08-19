import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import {
  buildStatusMap, extractAnchors, rewriteTarget, type Ctx,
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
