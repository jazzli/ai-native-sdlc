import fs from 'node:fs';
import { remark } from 'remark';
import remarkFrontmatter from 'remark-frontmatter';
import { SITE_BASE, CONTENT } from './site-config';
import { remarkRewriteLinks } from './rewrite-links';

// Serve source markdown with links rewritten to site URLs, so an agent
// reading the raw file can still resolve every citation.
export async function rawRewritten(filePath: string): Promise<string> {
  const text = fs.readFileSync(filePath, 'utf8');
  const out = await remark()
    .use(remarkFrontmatter)
    .use(remarkRewriteLinks({ base: SITE_BASE, ...CONTENT }))
    .process(text);
  return String(out);
}
