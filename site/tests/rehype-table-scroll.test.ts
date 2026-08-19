import { describe, it, expect } from 'vitest';
import type { Root, Element } from 'hast';
import { rehypeTableScroll } from '../src/lib/rehype-table-scroll';

function h2(text: string): Element {
  return {
    type: 'element',
    tagName: 'h2',
    properties: { id: text.toLowerCase().replace(/\s+/g, '-') },
    children: [{ type: 'text', value: text }],
  };
}

function table(rows = 2): Element {
  const th = (n: number): Element => ({
    type: 'element',
    tagName: 'th',
    properties: {},
    children: [{ type: 'text', value: `Col ${n}` }],
  });
  return {
    type: 'element',
    tagName: 'table',
    properties: {},
    children: [
      {
        type: 'element',
        tagName: 'thead',
        properties: {},
        children: [
          {
            type: 'element',
            tagName: 'tr',
            properties: {},
            children: Array.from({ length: rows }, (_, i) => th(i + 1)),
          },
        ],
      },
    ],
  };
}

function run(tree: Root): void {
  rehypeTableScroll()(tree);
}

describe('rehypeTableScroll', () => {
  it('wraps a table in a focusable, labelled region using the preceding heading', () => {
    const tree: Root = { type: 'root', children: [h2('Source registry'), table(3)] };
    run(tree);

    expect(tree.children).toHaveLength(2);
    const wrapper = tree.children[1] as Element;
    expect(wrapper.type).toBe('element');
    expect(wrapper.tagName).toBe('div');
    expect(wrapper.properties?.className).toEqual(['table-scroll']);
    expect(wrapper.properties?.tabIndex).toBe(0);
    expect(wrapper.properties?.role).toBe('region');
    expect(wrapper.properties?.ariaLabel).toBe('Source registry');
    expect(wrapper.children).toHaveLength(1);
    expect((wrapper.children[0] as Element).tagName).toBe('table');
  });

  it('falls back to "Table" when there is no preceding heading', () => {
    const tree: Root = { type: 'root', children: [table(2)] };
    run(tree);

    const wrapper = tree.children[0] as Element;
    expect(wrapper.tagName).toBe('div');
    expect(wrapper.properties?.ariaLabel).toBe('Table');
  });

  it('wraps every table independently, each labelled by its own nearest heading', () => {
    const tree: Root = {
      type: 'root',
      children: [h2('Review log'), table(2), h2('Registry'), table(3)],
    };
    run(tree);

    expect(tree.children).toHaveLength(4);
    const first = tree.children[1] as Element;
    const second = tree.children[3] as Element;
    expect(first.properties?.ariaLabel).toBe('Review log');
    expect(second.properties?.ariaLabel).toBe('Registry');
  });
});
