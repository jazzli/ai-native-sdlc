import fs from 'node:fs';
import path from 'node:path';
import GithubSlugger from 'github-slugger';
import { visit } from 'unist-util-visit';
import type { Root, Link, Definition, Image, Html } from 'mdast';

export type Status = 'open' | 'working-answer' | 'parked';
export type StatusMap = Record<string, Status>;
export interface Ctx {
  base: string;
  statusMap: StatusMap;
  anchors: Set<string>;
}

export function buildStatusMap(questionsDir: string): StatusMap {
  const map: StatusMap = {};
  for (const f of fs
    .readdirSync(questionsDir)
    .filter((f) => f.endsWith('.md'))) {
    const text = fs.readFileSync(path.join(questionsDir, f), 'utf8');
    const m = text.match(/^status:\s*(open|working-answer|parked)\s*$/m);
    if (!m) throw new Error(`No valid status frontmatter in ${f}`);
    map[f.replace(/\.md$/, '')] = m[1] as Status;
  }
  return map;
}

export function extractAnchors(sourcesFile: string): Set<string> {
  const text = fs.readFileSync(sourcesFile, 'utf8');
  const anchors = new Set<string>();
  for (const m of text.matchAll(/<a id="([a-z0-9-]+)"><\/a>/g))
    anchors.add(m[1]);
  // Rendered heading ids come from rehypeHeadingIds, which slugs with
  // github-slugger (one Slugger instance per document, walked in heading
  // order). A hand-rolled regex disagrees with it on anything github-slugger
  // treats specially — e.g. an em dash collapses to a double hyphen, not a
  // single one — so use the real algorithm to keep the two in sync.
  const slugger = new GithubSlugger();
  for (const m of text.matchAll(/^##\s+(.+)$/gm)) {
    anchors.add(slugger.slug(m[1]));
  }
  return anchors;
}

export function rewriteTarget(url: string, ctx: Ctx): string | null {
  if (/^(https?:|mailto:)/.test(url)) return null;
  if (url.startsWith('#')) return null;
  const b = ctx.base.replace(/\/$/, '');

  const src = url.match(/^(?:\.\.\/)*(?:docs\/)?sources\.md(#.*)?$/);
  if (src) {
    const frag = src[1] ?? '';
    if (frag) {
      const id = frag.slice(1);
      if (!ctx.anchors.has(id)) {
        throw new Error(`Unknown anchor in sources.md: #${id} (from "${url}")`);
      }
    }
    return `${b}/sources/${frag}`;
  }
  if (/^(?:\.\.\/)*(?:docs\/)?protocol\.md$/.test(url)) return `${b}/protocol/`;
  if (/^(?:\.\.\/)*(?:docs\/)?colophon\.md$/.test(url)) return `${b}/colophon/`;
  if (/^(?:\.\.\/)*(?:docs\/)?adopt\.md$/.test(url)) return `${b}/adopt/`;
  if (/^(?:\.\.\/)*(?:docs\/)?playbook\.md$/.test(url)) return `${b}/`;
  if (/^questions\/?$/.test(url)) return `${b}/`;

  const note = url.match(/^(?:questions\/)?([a-z0-9-]+)\.md$/);
  if (note) {
    const slug = note[1];
    const status = ctx.statusMap[slug];
    if (!status) throw new Error(`Link to unknown note: "${url}"`);
    return status === 'working-answer'
      ? `${b}/positions/${slug}/`
      : `${b}/questions/${slug}/`;
  }
  throw new Error(`Unrecognized internal link: "${url}"`);
}

// No asset pipeline exists yet — there is nowhere on the site for a local
// image to live. Rather than publish a broken relative src, fail the build
// so the author either points at an external image or the policy gets built
// first. External http(s) images pass through untouched, same as links.
export function checkImageUrl(url: string): void {
  if (/^https?:\/\//.test(url)) return;
  throw new Error(
    `Image asset "${url}" has no defined home yet — this site has no image ` +
      'asset pipeline. Use an external https:// image, or build the asset ' +
      'policy before referencing a local one.',
  );
}

// Raw HTML bypasses the mdast link/image/definition nodes entirely, so an
// <a href="../../sources.md#x"> or <img src="./local.png"> would reach the
// published page with its relative target unrewritten — a silent 404 for
// readers. Anything that isn't external (http/https/mailto) or a same-page
// fragment must go through markdown syntax instead, where rewriteTarget (or
// checkImageUrl) can enforce it.
const RAW_HTML_TARGET_RE =
  /<a\s[^>]*\bhref\s*=\s*["']([^"']*)["']|<img\s[^>]*\bsrc\s*=\s*["']([^"']*)["']/gi;

export function checkRawHtml(value: string): void {
  for (const m of value.matchAll(RAW_HTML_TARGET_RE)) {
    const target = m[1] ?? m[2] ?? '';
    if (!/^(https?:|mailto:|#)/.test(target)) {
      throw new Error(
        `Raw HTML link/image target "${target}" bypasses link rewriting — ` +
          'use markdown syntax ([text](url) or ![alt](url)) instead of raw ' +
          `HTML so it gets checked and rewritten (found in: ${value})`,
      );
    }
  }
}

export function remarkRewriteLinks(opts: {
  base: string;
  questionsDir: string;
  sourcesFile: string;
}) {
  const ctx: Ctx = {
    base: opts.base,
    statusMap: buildStatusMap(opts.questionsDir),
    anchors: extractAnchors(opts.sourcesFile),
  };
  return function plugin() {
    return (tree: Root) => {
      visit(tree, 'link', (node: Link) => {
        const out = rewriteTarget(node.url, ctx);
        if (out !== null) node.url = out;
      });
      visit(tree, 'definition', (node: Definition) => {
        const out = rewriteTarget(node.url, ctx);
        if (out !== null) node.url = out;
      });
      visit(tree, 'image', (node: Image) => {
        checkImageUrl(node.url);
      });
      visit(tree, 'html', (node: Html) => {
        checkRawHtml(node.value);
      });
    };
  };
}
