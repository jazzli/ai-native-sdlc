import type { Root, Element, RootContent } from 'hast';

// Wraps the section starting at <h2 id="what-would-change-my-mind"> (through
// the next h2 or end of document) in <aside class="falsifier">.
//
// The protocol makes that section mandatory for question notes: every note
// must state what would change it. hast alone can't tell which collection a
// document belongs to, so this keys off the source file path that Astro's
// markdown pipeline attaches to the vfile (file.path is the absolute path to
// the .md file being rendered). Files under docs/questions/ are notes and
// MUST have the heading — its absence throws, naming the file, so a note
// missing its falsifier fails the build instead of silently losing the
// section. Non-note documents (playbook, protocol, sources) stay no-op when
// the heading is absent, same as before.
export function rehypeFalsifier() {
  return (tree: Root, file: { path?: string }) => {
    const kids = tree.children;
    const isH2 = (n: RootContent): n is Element =>
      n.type === 'element' && n.tagName === 'h2';
    const start = kids.findIndex(
      (n) => isH2(n) && n.properties?.id === 'what-would-change-my-mind',
    );
    if (start === -1) {
      if (file.path?.includes('docs/questions/')) {
        throw new Error(
          `${file.path}: missing mandatory falsifier section ` +
            '(<h2 id="what-would-change-my-mind">) — every question note ' +
            'must state what would change it',
        );
      }
      return;
    }
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
