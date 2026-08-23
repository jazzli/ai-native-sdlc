// Pure helpers for the discovery sweep — extracted so the site's vitest
// suite can cover them; discover.mjs stays the thin I/O shell.

export const makeMatcher = (keywords) => {
  const kw = keywords.map((k) => k.toLowerCase());
  return (text) => {
    const t = text.toLowerCase();
    return kw.some((k) => t.includes(k));
  };
};

// Feed titles are attacker-reachable (anyone can post to HN). Neutralize
// markdown link-hijacks, backticks, and @-mentions (zero-width break), cap
// length, and only accept http(s) links with parens/whitespace encoded.
export const sanitize = (s) =>
  s
    .slice(0, 200)
    .replace(/[\[\]`]/g, "\\$&")
    .replace(/[()]/g, (c) => (c === "(" ? "&#40;" : "&#41;"))
    .replace(/@/g, "@\u200b");

export const safeLink = (u) =>
  /^https?:\/\//.test(u) ? u.replace(/\)/g, "%29").replace(/\s/g, "%20") : "";

// Strip, decode, strip again: GitHub's Atom feeds carry HTML escaped as
// text, which only becomes tags after decoding.
const strip = (s) =>
  s.replace(/<!\[CDATA\[|\]\]>/g, "").replace(/<[^>]+>/g, " ");
const decode = (s) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"');
export const clean = (s) =>
  strip(decode(strip(s)))
    .replace(/&#?\w+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const pick = (xml, tag) =>
  xml
    .match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"))?.[1]
    ?.trim() ?? "";
export const pickLink = (xml) =>
  xml.match(/<link[^>]*href="([^"]+)"/i)?.[1] ?? pick(xml, "link");

// Dedupes by link (two queries can surface the same item) and formats one
// digest line per finding.
export const createCollector = () => {
  const seen = new Set();
  const findings = [];
  const entry = (label, title, link) => {
    const l = safeLink(link);
    const key = l || title;
    if (seen.has(key)) return;
    seen.add(key);
    findings.push(
      l
        ? `- **${sanitize(label)}**: [${sanitize(title)}](${l})`
        : `- **${sanitize(label)}**: ${sanitize(title)}`,
    );
  };
  return { entry, findings };
};

// --- parsing -------------------------------------------------------------
// Each takes a fetched body and returns what the sweep should collect, so the
// extraction and filtering are testable without a network.

export const parseFeed = (xml, { since, always, matches }) => {
  const items =
    xml.match(/<item[\s>][\s\S]*?<\/item>|<entry[\s>][\s\S]*?<\/entry>/gi) ??
    [];
  const out = [];
  for (const item of items) {
    const date = new Date(
      pick(item, "pubDate") ||
        pick(item, "updated") ||
        pick(item, "published") ||
        0,
    ).getTime();
    if (!date || date < since) continue;
    const title = clean(pick(item, "title"));
    const summary = clean(
      pick(item, "description") ||
        pick(item, "summary") ||
        pick(item, "content"),
    ).slice(0, 300);
    if (!always && !matches(`${title} ${summary}`)) continue;
    out.push({ title, link: pickLink(item) });
  }
  return out;
};

export const parseArxiv = (xml, { since, matches }) => {
  const out = [];
  for (const ent of xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? []) {
    const date = new Date(pick(ent, "published")).getTime();
    if (!date || date < since) continue;
    const title = clean(pick(ent, "title"));
    const summary = clean(pick(ent, "summary"));
    if (!matches(`${title} ${summary}`)) continue;
    out.push({ title, link: pick(ent, "id") });
  }
  return out;
};

// Query results stray, so the keyword gate is applied again to what the API
// returns rather than trusted from the query alone.
export const parseHn = (hits, { matches, limit = 5 }) =>
  (hits ?? [])
    .slice(0, limit)
    .map((h) => ({
      title: clean(h.title ?? ""),
      link: h.url ?? `https://news.ycombinator.com/item?id=${h.objectID}`,
      points: h.points ?? 0,
    }))
    .filter((h) => matches(h.title));

// --- reporting -----------------------------------------------------------

export const digestBody = ({ date, collected, errors }) =>
  [
    `### ${date}`,
    "",
    collected.length
      ? collected.join("\n")
      : errors.length
        ? "_No matching items in the window — but the sources below failed to fetch, so this may be under-reporting._"
        : "_No matching items in the window._",
    errors.length
      ? `\n<details><summary>Fetch errors (${errors.length})</summary>\n\n${errors.map((e) => `- ${e}`).join("\n")}\n</details>`
      : "",
    "",
    "_Discovery is not admission: triage through the signal filter._",
  ].join("\n");

// What the run should do, separated from doing it. A zero-finding day with
// dead sources must still post: the errors would otherwise reach only a
// workflow log nobody reads, and the monthly watch — which proposes removals
// from recurring fetch errors — would never see them.
export const sweepOutcome = ({ collected, errors, sourceCount, dry }) => {
  if (
    !dry &&
    collected.length === 0 &&
    errors.length >= Math.ceil(sourceCount / 2)
  )
    return {
      action: "fail",
      reason: `${errors.length}/${sourceCount} sources errored with zero collected — silence would be indistinguishable from health`,
    };
  if (dry) return { action: "skip", reason: "dry run: no issue posted" };
  if (collected.length === 0 && errors.length === 0)
    return {
      action: "skip",
      reason: "all sources healthy, nothing new: no issue posted",
    };
  return { action: "post", reason: "" };
};
