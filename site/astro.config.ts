import { defineConfig } from 'astro/config';
import { SITE_ORIGIN, SITE_BASE, CONTENT } from './src/lib/site-config';
import { remarkRewriteLinks } from './src/lib/rewrite-links';

export default defineConfig({
  site: SITE_ORIGIN,
  base: SITE_BASE,
  markdown: {
    remarkPlugins: [remarkRewriteLinks({ base: SITE_BASE, ...CONTENT })],
  },
});
