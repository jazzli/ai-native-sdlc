import { describe, it, expect } from 'vitest';
import type { Root, Element } from 'hast';
import { rehypeFalsifier } from '../src/lib/rehype-falsifier';

function h2(id: string, text: string): Element {
  return {
    type: 'element',
    tagName: 'h2',
    properties: { id },
    children: [{ type: 'text', value: text }],
  };
}

function p(text: string): Element {
  return {
    type: 'element',
    tagName: 'p',
    properties: {},
    children: [{ type: 'text', value: text }],
  };
}

// The transformer unified would call as (tree, file) — invoke it directly so
// tests don't need a parse pipeline to construct valid hast.
function run(tree: Root, path?: string): void {
  const transform = rehypeFalsifier();
  transform(tree, { path });
}

describe('rehypeFalsifier', () => {
  it('wraps the section starting at h2#what-would-change-my-mind when present', () => {
    const tree: Root = {
      type: 'root',
      children: [
        h2('intro', 'Intro'),
        p('intro text'),
        h2('what-would-change-my-mind', 'What would change my mind'),
        p('a falsifier bullet'),
        h2('next', 'Next section'),
        p('after'),
      ],
    };
    run(tree, '/repo/docs/questions/does-x-work.md');

    expect(tree.children).toHaveLength(5);
    const aside = tree.children[2] as Element;
    expect(aside.type).toBe('element');
    expect(aside.tagName).toBe('aside');
    expect(aside.properties?.className).toEqual(['falsifier']);
    expect(aside.children).toHaveLength(2);
    expect((aside.children[0] as Element).properties?.id).toBe(
      'what-would-change-my-mind',
    );
    expect((tree.children[3] as Element).properties?.id).toBe('next');
  });

  it('throws naming the file for a questions-path document without the section', () => {
    const tree: Root = {
      type: 'root',
      children: [h2('intro', 'Intro'), p('no falsifier heading anywhere')],
    };
    expect(() =>
      run(tree, '/repo/docs/questions/missing-falsifier.md'),
    ).toThrow(/missing-falsifier\.md/);
    expect(() =>
      run(tree, '/repo/docs/questions/missing-falsifier.md'),
    ).toThrow(/what-would-change-my-mind/);
  });

  it('no-ops for a non-questions path without the section', () => {
    const tree: Root = {
      type: 'root',
      children: [h2('intro', 'Intro'), p('protocol text, no falsifier')],
    };
    const before = JSON.parse(JSON.stringify(tree));
    expect(() => run(tree, '/repo/docs/protocol.md')).not.toThrow();
    expect(tree).toEqual(before);
  });
});
