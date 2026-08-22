import type { Root, Element, RootContent } from 'hast';

// Builds a contents list for the playbook from its own `##` headings and
// inserts it before the first one.
//
// The playbook runs to some 1,400 words across ten sections with no index: a
// reader met three paragraphs of lede and then the first position, with no
// way to see the shape of the argument or find the one they came for. The
// list is derived from the headings rather than written beside them — a
// hand-kept index is the same drift risk as the hardcoded counts already
// removed from this page's lede.
//
// Runs after rehypeHeadingIds, which supplies the ids linked here.
export function rehypeContents() {
  return (tree: Root, file: { path?: string }) => {
    if (!file.path?.includes('docs/playbook.md')) return;

    const kids = tree.children;
    const isH2 = (n: RootContent): n is Element =>
      n.type === 'element' && n.tagName === 'h2';
    const first = kids.findIndex(isH2);
    if (first === -1) return;

    const text = (n: RootContent): string =>
      n.type === 'text'
        ? n.value
        : n.type === 'element'
          ? n.children.map(text).join('')
          : '';

    const items = kids.filter(isH2).map((h) => {
      const id = h.properties?.id;
      if (typeof id !== 'string' || !id)
        throw new Error(
          `playbook heading "${text(h)}" has no id — rehypeContents must run ` +
            'after rehypeHeadingIds',
        );
      return { id, label: text(h).replace(/\s+/g, ' ').trim() };
    });

    const nav: Element = {
      type: 'element',
      tagName: 'nav',
      properties: { className: ['contents'], 'aria-label': 'Positions' },
      children: [
        {
          type: 'element',
          tagName: 'p',
          properties: { className: ['contents-label'] },
          children: [{ type: 'text', value: 'On this page' }],
        },
        {
          type: 'element',
          tagName: 'ol',
          properties: {},
          children: items.map((i) => ({
            type: 'element' as const,
            tagName: 'li',
            properties: {},
            children: [
              {
                type: 'element' as const,
                tagName: 'a',
                properties: { href: `#${i.id}` },
                children: [{ type: 'text' as const, value: i.label }],
              },
            ],
          })),
        },
      ],
    };
    kids.splice(first, 0, nav);
  };
}
