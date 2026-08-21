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
