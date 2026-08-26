#!/usr/bin/env node
// Daily discovery + change-detection. No AI, no deps: fetch, regex, diff.
// Discovery is not admission -- collected land in a rolling GitHub issue for
// the intelligent watch (or a human) to triage through the signal filter.
// Per-source failures are reported in the digest, never fatal.
import fs from "node:fs";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import {
  makeMatcher,
  createCollector,
  parseFeed,
  parseArxiv,
  parseHn,
  digestBody,
  sweepOutcome,
} from "./lib.mjs";

const DRY = process.argv.includes("--dry");
const ROOT = new URL("..", import.meta.url).pathname;
const list = JSON.parse(
  fs.readFileSync(new URL("./watchlist.json", import.meta.url), "utf8"),
);
const STATE_FILE = process.env.STATE_FILE ?? `${ROOT}watch/state.json`;
const WINDOW_H = 26; // daily cron + 2h overlap; better a rare duplicate than a gap
const since = Date.now() - WINDOW_H * 3600_000;

const state = fs.existsSync(STATE_FILE)
  ? JSON.parse(fs.readFileSync(STATE_FILE, "utf8"))
  : {};
const errors = [];

const matches = makeMatcher(list.keywords);
// Links reported on previous runs, with the date they were last seen, so a
// story lingering on a feed is reported once. Entries older than the window
// are dropped: state that only grows is state nobody prunes.
const SEEN_DAYS = Number(process.env.SEEN_DAYS ?? 30);
const cutoff = new Date(Date.now() - SEEN_DAYS * 86400_000)
  .toISOString()
  .slice(0, 10);
const seenBefore = Object.entries(state.__seen ?? {}).filter(
  ([, date]) => date >= cutoff,
);
const {
  entry,
  findings: collected,
  reported,
} = createCollector(seenBefore.map(([link]) => link));

async function get(url) {
  const res = await fetch(url, {
    headers: { "user-agent": "ai-native-sdlc-discovery/1.0" },
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

async function scanFeed({ name, url, always }) {
  for (const it of parseFeed(await get(url), { since, always, matches }))
    entry(name, it.title, it.link);
}

async function scanHn(queries) {
  for (const q of queries) {
    const url = `https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(q)}&tags=story&numericFilters=created_at_i>${Math.floor(since / 1000)}`;
    const hits = JSON.parse(await get(url)).hits;
    for (const h of parseHn(hits, { matches }))
      entry(`HN "${q}" (${h.points} pts)`, h.title, h.link);
  }
}

async function scanArxiv(query) {
  const url = `https://export.arxiv.org/api/query?search_query=${encodeURIComponent(query)}&sortBy=submittedDate&sortOrder=descending&max_results=15`;
  for (const it of parseArxiv(await get(url), { since, matches }))
    entry("arXiv", it.title, it.link);
}

async function checkTarget(t) {
  if (t.type === "page-hash") {
    const body = await get(t.url);
    const hash = crypto
      .createHash("sha256")
      .update(body.replace(/\s+/g, " "))
      .digest("hex");
    if (state[t.name] && state[t.name] !== hash) {
      collected.push(
        `- **CHANGED**: [${t.name}](${t.url}) — page content differs from last run`,
      );
    }
    state[t.name] = hash;
  } else if (t.type === "npm-peer") {
    const meta = JSON.parse(
      await get(`https://registry.npmjs.org/${t.pkg}/latest`),
    );
    const range = meta.peerDependencies?.[t.peer] ?? "(none)";
    if (state[t.name] && state[t.name] !== range) {
      collected.push(
        `- **CHANGED**: ${t.pkg} peer range for ${t.peer} is now \`${range}\` (was \`${state[t.name]}\`) — dependency holds may be liftable`,
      );
    }
    state[t.name] = range;
  }
}

const jobs = [
  ...list.feeds.map((f) =>
    scanFeed(f).catch((e) => errors.push(`${f.name}: ${e.message}`)),
  ),
  ...list.apis.map((a) =>
    (a.type === "hn-algolia" ? scanHn(a.queries) : scanArxiv(a.query)).catch(
      (e) => errors.push(`${a.name}: ${e.message}`),
    ),
  ),
  ...list.targets.map((t) =>
    checkTarget(t).catch((e) => errors.push(`${t.name}: ${e.message}`)),
  ),
];
await Promise.all(jobs);
fs.mkdirSync(new URL(".", new URL(STATE_FILE, "file://")).pathname, {
  recursive: true,
});
const today = new Date().toISOString().slice(0, 10);
// Recorded before the state is written, and regardless of whether a digest
// is posted: a link this run saw is "already reported" next time either way.
state.__seen = Object.fromEntries([
  ...seenBefore,
  ...reported.map((link) => [link, today]),
]);
fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));

const suppressed = reported.length - collected.length;
const body = digestBody({ date: today, collected, errors, suppressed });

console.log(body);
// Always in the run log, posted or not: a zero-finding day that suppressed
// forty repeats is healthy, and one that saw nothing at all may not be.
console.error(
  `[seen ${reported.length}, new ${collected.length}, suppressed ${suppressed}, errors ${errors.length}]`,
);
const sourceCount = list.feeds.length + list.apis.length + list.targets.length;
const outcome = sweepOutcome({
  collected,
  errors,
  sourceCount,
  dry: DRY,
});
if (outcome.action === "fail") {
  console.error(`[FAILING: ${outcome.reason}]`);
  process.exit(1);
}
if (outcome.action === "skip") {
  console.error(`[${outcome.reason}]`);
  process.exit(0);
}
const gh = (args, input) =>
  execFileSync("gh", args, { input, encoding: "utf8" });
gh([
  "label",
  "create",
  "discovery",
  "--force",
  "--color",
  "1D7F6B",
  "--description",
  "Daily discovery digest — triage through the signal filter",
]);
const existing = gh([
  "issue",
  "list",
  "--label",
  "discovery",
  "--state",
  "open",
  "--json",
  "number",
  "--jq",
  ".[0].number // empty",
]).trim();
if (existing) {
  gh(["issue", "comment", existing, "--body-file", "-"], body);
  console.error(`[appended to issue #${existing}]`);
} else {
  gh(
    [
      "issue",
      "create",
      "--title",
      "Discovery digest",
      "--label",
      "discovery",
      "--body-file",
      "-",
    ],
    `Rolling digest from the daily discovery workflow. The monthly falsifier watch triages this queue through the signal filter; close after triage to start a fresh one.\n\n${body}`,
  );
  console.error("[created new digest issue]");
}
