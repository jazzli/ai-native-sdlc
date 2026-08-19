import { defineConfig } from 'astro/config';
import { SITE_ORIGIN, SITE_BASE } from './src/lib/site-config';

export default defineConfig({
  site: SITE_ORIGIN,
  base: SITE_BASE,
});
