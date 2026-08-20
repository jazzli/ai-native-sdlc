import type { Root, Element, Parent, RootContent } from 'hast';
import { visit } from 'unist-util-visit';

const isHeading = (n: RootContent): n is Element =>
  n.type === 'element' && /^h[1-6]$/.test(n.tagName);

function textContent(node: RootContent | Root): string {
  let text = '';
  const walk = (n: RootContent | Root): void => {
    if (n.type === 'text') {
      text += n.value;
    } else if ('children' in n) {
      for (const child of n.children) walk(child);
    }
  };
  walk(node);
  return text.trim();
}

// `table { display: block; overflow-x: auto }` makes a table scrollable but
// strips its role from the accessibility tree (a block-display table is no
// longer exposed as a table to AT) and gives keyboard users no way to reach
// the horizontal scroll — CSS alone can't fix either problem. Wrapping every
// <table> in a tabbable, labelled <div> keeps the table itself intact for
// AT while giving keyboard users a focusable scroll region.
export function rehypeTableScroll() {
  return (tree: Root) => {
    // hast nodes are `type: 'element'` with a `tagName`; a string test only
    // matches `node.type`, so the tag itself must be checked in the visitor.
    visit(
      tree,
      'element',
      (node: Element, index, parent: Parent | undefined) => {
        if (node.tagName !== 'table' || index == null || !parent) return;
        let label = 'Table';
        for (let i = index - 1; i >= 0; i--) {
          const sibling = parent.children[i];
          if (isHeading(sibling)) {
            const text = textContent(sibling);
            if (text) label = text;
            break;
          }
        }
        const wrapper: Element = {
          type: 'element',
          tagName: 'div',
          properties: {
            className: ['table-scroll'],
            tabIndex: 0,
            role: 'region',
            ariaLabel: label,
          },
          children: [node],
        };
        parent.children[index] = wrapper;
      },
    );
  };
}
