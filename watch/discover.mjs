#!/usr/bin/env node
// Daily discovery + change-detection. No AI, no deps: fetch, regex, diff.
// Discovery is not admission -- findings land in a rolling GitHub issue for
// the intelligent watch (or a human) to triage through the signal filter.
// Per-source failures are reported in the digest, never fatal.
import fs from 'node:fs';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const DRY = process.argv.includes('--dry');
const ROOT = new URL('..', import.meta.url).pathname;
const list = JSON.parse(fs.readFileSync(new URL('./watchlist.json', import.meta.url), 'utf8'));
const STATE_FILE = process.env.STATE_FILE ?? `${ROOT}watch/state.json`;
const WINDOW_H = 26; // daily cron + 2h overlap; better a rare duplicate than a gap
const since = Date.now() - WINDOW_H * 3600_000;
const kw = list.keywords.map((k) => k.toLowerCase());

const state = fs.existsSync(STATE_FILE) ? JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')) : {};
const findings = [];
const errors = [];

const matches = (text) => {
  const t = text.toLowerCase();
  return kw.some((k) => t.includes(k));
};

async function get(url) {
  const res = await fetch(url, { headers: { 'user-agent': 'ai-native-sdlc-discovery/1.0' }, signal: AbortSignal.timeout(20_000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

const pick = (xml, tag) => xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'))?.[1]?.trim() ?? '';
const pickLink = (xml) => xml.match(/<link[^>]*href="([^"]+)"/i)?.[1] ?? pick(xml, 'link');
const clean = (s) => s.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#?\w+;/g, ' ').trim();

async function scanFeed({ name, url }) {
  const xml = await get(url);
  const items = xml.match(/<item[\s>][\s\S]*?<\/item>|<entry[\s>][\s\S]*?<\/entry>/gi) ?? [];
  for (const item of items) {
    const date = new Date(pick(item, 'pubDate') || pick(item, 'updated') || pick(item, 'published') || 0).getTime();
    if (!date || date < since) continue;
    const title = clean(pick(item, 'title'));
    const summary = clean(pick(item, 'description') || pick(item, 'summary') || pick(item, 'content')).slice(0, 300);
    if (!matches(`${title} ${summary}`)) continue;
    findings.push(`- **${name}**: [${title}](${pickLink(item)})`);
  }
}

async function scanHn(queries) {
  for (const q of queries) {
    const url = `https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(q)}&tags=story&numericFilters=created_at_i>${Math.floor(since / 1000)}`;
    const hits = JSON.parse(await get(url)).hits ?? [];
    for (const h of hits.slice(0, 5)) {
      const link = h.url ?? `https://news.ycombinator.com/item?id=${h.objectID}`;
      findings.push(`- **HN** ("${q}"): [${clean(h.title ?? '')}](${link}) (${h.points ?? 0} pts)`);
    }
  }
}

async function scanArxiv(query) {
  const url = `https://export.arxiv.org/api/query?search_query=${encodeURIComponent(query)}&sortBy=submittedDate&sortOrder=descending&max_results=15`;
  const xml = await get(url);
  for (const entry of xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? []) {
    const date = new Date(pick(entry, 'published')).getTime();
    if (!date || date < since) continue;
    const title = clean(pick(entry, 'title')).replace(/\s+/g, ' ');
    const id = pick(entry, 'id');
    findings.push(`- **arXiv**: [${title}](${id})`);
  }
}

async function checkTarget(t) {
  if (t.type === 'page-hash') {
    const body = await get(t.url);
    const hash = crypto.createHash('sha256').update(body.replace(/\s+/g, ' ')).digest('hex');
    if (state[t.name] && state[t.name] !== hash) {
      findings.push(`- **CHANGED**: [${t.name}](${t.url}) — page content differs from last run`);
    }
    state[t.name] = hash;
  } else if (t.type === 'npm-peer') {
    const meta = JSON.parse(await get(`https://registry.npmjs.org/${t.pkg}/latest`));
    const range = meta.peerDependencies?.[t.peer] ?? '(none)';
    if (state[t.name] && state[t.name] !== range) {
      findings.push(`- **CHANGED**: ${t.pkg} peer range for ${t.peer} is now \`${range}\` (was \`${state[t.name]}\`) — dependency holds may be liftable`);
    }
    state[t.name] = range;
  }
}

const jobs = [
  ...list.feeds.map((f) => scanFeed(f).catch((e) => errors.push(`${f.name}: ${e.message}`))),
  ...list.apis.map((a) =>
    (a.type === 'hn-algolia' ? scanHn(a.queries) : scanArxiv(a.query)).catch((e) => errors.push(`${a.name}: ${e.message}`)),
  ),
  ...list.targets.map((t) => checkTarget(t).catch((e) => errors.push(`${t.name}: ${e.message}`))),
];
await Promise.all(jobs);
fs.mkdirSync(new URL('.', new URL(STATE_FILE, 'file://')).pathname, { recursive: true });
fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));

const today = new Date().toISOString().slice(0, 10);
const body = [
  `### ${today}`,
  '',
  findings.length ? findings.join('\n') : '_No matching items in the window._',
  errors.length ? `\n<details><summary>Fetch errors (${errors.length})</summary>\n\n${errors.map((e) => `- ${e}`).join('\n')}\n</details>` : '',
  '',
  '_Discovery is not admission: triage through the signal filter._',
].join('\n');

console.log(body);
if (DRY || findings.length === 0) {
  console.error(DRY ? '[dry run: no issue posted]' : '[no findings: no issue posted]');
  process.exit(0);
}
const gh = (args, input) => execFileSync('gh', args, { input, encoding: 'utf8' });
const existing = gh(['issue', 'list', '--label', 'discovery', '--state', 'open', '--json', 'number', '--jq', '.[0].number // empty']).trim();
if (existing) {
  gh(['issue', 'comment', existing, '--body-file', '-'], body);
  console.error(`[appended to issue #${existing}]`);
} else {
  gh(['issue', 'create', '--title', 'Discovery digest', '--label', 'discovery', '--body-file', '-'],
    `Rolling digest from the daily discovery workflow. The monthly falsifier watch triages this queue through the signal filter; close after triage to start a fresh one.\n\n${body}`);
  console.error('[created new digest issue]');
}
