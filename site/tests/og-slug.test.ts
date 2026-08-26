import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { CONTENT } from '../src/lib/site-config';
import { ogSlug, allCardTargets } from '../src/lib/og-slug';
import { buildStatusMap } from '../src/lib/rewrite-links';

const BASE = '/ai-native-sdlc';

describe('ogSlug', () => {
  it('maps every page type', () => {
    expect(ogSlug('/ai-native-sdlc/', BASE)).toBe('index');
    expect(
      ogSlug('/ai-native-sdlc/positions/does-sdd-reduce-rework/', BASE),
    ).toBe('positions/does-sdd-reduce-rework');
    expect(
      ogSlug('/ai-native-sdlc/questions/agent-era-observability/', BASE),
    ).toBe('questions/agent-era-observability');
    expect(ogSlug('/ai-native-sdlc/sources/', BASE)).toBe('sources');
    expect(ogSlug('/ai-native-sdlc/protocol/', BASE)).toBe('protocol');
    expect(ogSlug('/ai-native-sdlc/colophon/', BASE)).toBe('colophon');
    expect(ogSlug('/ai-native-sdlc/changelog/', BASE)).toBe('changelog');
  });

  it('returns null for pages without cards', () => {
    expect(ogSlug('/ai-native-sdlc/404', BASE)).toBeNull();
    expect(ogSlug('/ai-native-sdlc/og/index.png', BASE)).toBeNull();
    expect(ogSlug('/ai-native-sdlc/changelog.xml', BASE)).toBeNull();
  });
});

describe('allCardTargets against real content', () => {
  const targets = allCardTargets();

  it('yields one card per note plus one per standalone page', () => {
    const notes = fs
      .readdirSync(CONTENT.questionsDir)
      .filter((f) => f.endsWith('.md')).length;
    const pages = targets.filter((t) => t.spec.kind === 'page').length;
    expect(targets).toHaveLength(notes + pages);
  });

  it('covers every note with its real status routing', () => {
    const map = buildStatusMap('../docs/questions');
    for (const [slug, status] of Object.entries(map)) {
      const kind = status === 'working-answer' ? 'positions' : 'questions';
      expect(targets.map((t) => t.slug)).toContain(`${kind}/${slug}`);
    }
  });

  it('note specs carry real frontmatter titles', () => {
    const t = targets.find(
      (t) => t.slug === 'positions/does-sdd-reduce-rework',
    );
    expect(t?.spec.kind).toBe('note');
    expect(t?.spec.title).toMatch(/spec-driven development/);
    expect(t?.spec.status).toBe('working-answer');
    expect(t?.spec.updated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('index subtitle carries live counts', () => {
    const t = targets.find((t) => t.slug === 'index');
    expect(t?.spec.subtitle).toMatch(/\d+ positions · \d+ sources/);
  });

  it('parity: every card target round-trips through ogSlug', () => {
    for (const t of targets) {
      const path = t.slug === 'index' ? `${BASE}/` : `${BASE}/${t.slug}/`;
      expect(ogSlug(path, BASE)).toBe(t.slug);
    }
  });
});
