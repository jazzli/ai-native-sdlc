import { defineConfig } from 'astro/config';
import { rehypeHeadingIds, unified } from '@astrojs/markdown-remark';
import { SITE_ORIGIN, SITE_BASE, CONTENT } from './src/lib/site-config';
import { remarkRewriteLinks } from './src/lib/rewrite-links';
import { rehypeContents } from './src/lib/rehype-contents';
import { rehypeFalsifier } from './src/lib/rehype-falsifier';
import { rehypeTableScroll } from './src/lib/rehype-table-scroll';

export default defineConfig({
  site: SITE_ORIGIN,
  base: SITE_BASE,
  // Self-contained pages: inline all CSS regardless of size, so a page is
  // one request and the zero-external-resource posture holds.
  build: { inlineStylesheets: 'always' },
  // Astro 7 defaults to 'jsx' compression, which strips whitespace between
  // inline elements and can join adjacent text. Keep the conservative
  // whitespace handling so rendered prose is byte-identical to Astro 5.
  compressHTML: true,
  markdown: {
    // Astro 7 renders markdown with its native pipeline by default; our
    // plugins are remark/rehype, so we stay on the unified() processor
    // (@astrojs/markdown-remark is now an explicit dependency).
    processor: unified({
      remarkPlugins: [remarkRewriteLinks({ base: SITE_BASE, ...CONTENT })],
      // Astro injects heading ids AFTER user rehype plugins; rehypeFalsifier
      // matches on the heading id, so ids must be applied explicitly first.
      // rehypeTableScroll reads preceding heading text for its aria-label, so
      // it also needs ids-and-text already in place — order after both.
      rehypePlugins: [
        rehypeHeadingIds,
        rehypeContents,
        rehypeFalsifier,
        rehypeTableScroll,
      ],
    }),
  },
});
