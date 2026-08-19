import { defineConfig } from 'astro/config';
import { rehypeHeadingIds } from '@astrojs/markdown-remark';
import { SITE_ORIGIN, SITE_BASE, CONTENT } from './src/lib/site-config';
import { remarkRewriteLinks } from './src/lib/rewrite-links';
import { rehypeFalsifier } from './src/lib/rehype-falsifier';

export default defineConfig({
  site: SITE_ORIGIN,
  base: SITE_BASE,
  markdown: {
    remarkPlugins: [remarkRewriteLinks({ base: SITE_BASE, ...CONTENT })],
    // Astro injects heading ids AFTER user rehype plugins; rehypeFalsifier
    // matches on the heading id, so ids must be applied explicitly first.
    rehypePlugins: [rehypeHeadingIds, rehypeFalsifier],
  },
});
