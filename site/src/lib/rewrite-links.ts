import fs from 'node:fs';
import path from 'node:path';
import { visit } from 'unist-util-visit';
import type { Root, Link } from 'mdast';

export type Status = 'open' | 'working-answer' | 'parked';
export type StatusMap = Record<string, Status>;
export interface Ctx {
  base: string;
  statusMap: StatusMap;
  anchors: Set<string>;
}

export function buildStatusMap(questionsDir: string): StatusMap {
  const map: StatusMap = {};
  for (const f of fs.readdirSync(questionsDir).filter((f) => f.endsWith('.md'))) {
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
  for (const m of text.matchAll(/<a id="([a-z0-9-]+)"><\/a>/g)) anchors.add(m[1]);
  for (const m of text.matchAll(/^##\s+(.+)$/gm)) {
    anchors.add(
      m[1].toLowerCase().replace(/[^a-z0-9 -]/g, '').trim().replace(/\s+/g, '-'),
    );
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
    };
  };
}
