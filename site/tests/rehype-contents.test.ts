import { describe, it, expect } from 'vitest';
import type { Root, Element, RootContent } from 'hast';
import { rehypeContents } from '../src/lib/rehype-contents';

const h2 = (id: string | undefined, text: string): Element => ({
  type: 'element',
  tagName: 'h2',
  properties: id === undefined ? {} : { id },
  children: [{ type: 'text', value: text }],
});
const p = (text: string): Element => ({
  type: 'element',
  tagName: 'p',
  properties: {},
  children: [{ type: 'text', value: text }],
});

const run = (children: RootContent[], path = '/repo/docs/playbook.md') => {
  const tree: Root = { type: 'root', children };
  rehypeContents()(tree, { path });
  return tree;
};
const nav = (tree: Root) =>
  tree.children.find(
    (n): n is Element => n.type === 'element' && n.tagName === 'nav',
  );

describe('rehypeContents', () => {
  it('lists every section and links its heading id', () => {
    const tree = run([
      p('lede'),
      h2('one', 'First'),
      p('a'),
      h2('two', 'Second'),
    ]);
    const links = JSON.stringify(nav(tree));
    expect(links).toContain('#one');
    expect(links).toContain('#two');
    expect(links).toContain('First');
    expect(links).toContain('Second');
  });

  it('inserts before the first heading, leaving the lede above it', () => {
    const tree = run([p('lede'), h2('one', 'First')]);
    const kinds = tree.children.map((n) =>
      n.type === 'element' ? n.tagName : n.type,
    );
    expect(kinds).toEqual(['p', 'nav', 'h2']);
  });

  it('touches nothing outside the playbook', () => {
    const tree = run([p('lede'), h2('one', 'First')], '/repo/docs/protocol.md');
    expect(nav(tree)).toBeUndefined();
  });

  it('is a no-op on a document with no sections', () => {
    const tree = run([p('lede')]);
    expect(nav(tree)).toBeUndefined();
  });

  // The ids come from rehypeHeadingIds. If plugin order ever changed, a
  // silently empty href would ship a contents list that goes nowhere —
  // exactly the kind of quiet breakage this project fails closed on.
  it('throws when a heading has no id, rather than linking nowhere', () => {
    expect(() => run([p('lede'), h2(undefined, 'Unanchored')])).toThrow(
      /rehypeHeadingIds/,
    );
  });
});
