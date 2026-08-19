import type { Root, Element, RootContent } from 'hast';

// Wraps the section starting at <h2 id="what-would-change-my-mind"> (through
// the next h2 or end of document) in <aside class="falsifier">. No-op for
// documents without that heading (sources, protocol, playbook).
export function rehypeFalsifier() {
  return (tree: Root) => {
    const kids = tree.children;
    const isH2 = (n: RootContent): n is Element =>
      n.type === 'element' && n.tagName === 'h2';
    const start = kids.findIndex(
      (n) => isH2(n) && n.properties?.id === 'what-would-change-my-mind',
    );
    if (start === -1) return;
    let end = kids.length;
    for (let i = start + 1; i < kids.length; i++) {
      if (isH2(kids[i])) { end = i; break; }
    }
    const aside: Element = {
      type: 'element',
      tagName: 'aside',
      properties: { className: ['falsifier'] },
      children: kids.slice(start, end) as Element[],
    };
    kids.splice(start, end - start, aside);
  };
}
