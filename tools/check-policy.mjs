// Checks a policy adopted from the AI-Native SDLC playbook against the
// contract that https://jazzli.github.io/ai-native-sdlc/adopt/ states.
//
// Self-contained on purpose: no dependencies, no build step, one file an
// adopting repository can fetch and run.
//
//   curl -fsSL https://jazzli.github.io/ai-native-sdlc/check-policy.mjs \
//     -o check-policy.mjs
//   node check-policy.mjs docs/sdlc-policy.md docs/sdlc-upstream.json
//
// Exit codes are 0 conforming, 1 errors found, 2 could not run. They are
// distinct so a scheduled run can tell "the policy is wrong" from "the check
// itself failed" — the same distinction the drift check makes.

const DIGEST = /^[0-9a-f]{12}$/;
const MANIFEST = "https://jazzli.github.io/ai-native-sdlc/positions.json";

/**
 * @param {{policy: string, lock: unknown, manifest: any}} input
 * @returns {{level: 'error'|'warning', code: string, message: string, id?: string}[]}
 *
 * Checks presence, not layout. Adopters are told to adapt the generated
 * starter, so a policy that reorganises the headings, merges positions into
 * existing sections, or writes its local rules in other words still passes,
 * provided it carries what the contract requires.
 *
 * Deliberately absent: whether an open question has been recorded as
 * guidance. The contract requires that it is not, but detecting it reliably
 * needs to understand the policy's prose, and a heuristic would fire on
 * well-formed policies. That one is left to human review.
 */
export function checkPolicy({ policy, lock, manifest }) {
  const out = [];
  const err = (code, message, id) =>
    out.push({ level: "error", code, message, id });
  const warn = (code, message, id) =>
    out.push({ level: "warning", code, message, id });

  if (typeof lock !== "object" || lock === null || Array.isArray(lock)) {
    err("lock/unreadable", "The lockfile is not a JSON object.");
    return out;
  }

  if (lock.schemaVersion !== manifest.schemaVersion) {
    err(
      "lock/schema-version",
      `Lockfile records schemaVersion ${JSON.stringify(lock.schemaVersion)}; upstream publishes ${manifest.schemaVersion}. A parser written against one may not read the other.`,
    );
  }
  if (typeof lock.digest !== "string" || !DIGEST.test(lock.digest)) {
    err(
      "lock/digest-format",
      `Lockfile digest ${JSON.stringify(lock.digest)} is not a 12-character hex digest.`,
    );
  } else if (lock.digest !== manifest.digest) {
    warn(
      "lock/digest-stale",
      `Lockfile records ${lock.digest}; upstream is now ${manifest.digest}. Review what moved before updating it.`,
    );
  }

  const locked =
    typeof lock.positions === "object" && lock.positions !== null
      ? lock.positions
      : {};
  if (!Object.keys(locked).length) {
    err("lock/no-positions", "The lockfile records no position digests.");
  }
  for (const id of Object.keys(locked)) {
    if (!manifest.positions.some((p) => p.id === id)) {
      warn(
        "lock/unknown-position",
        `Lockfile records "${id}", which upstream no longer publishes. It may have been renamed or withdrawn.`,
        id,
      );
    }
  }

  const placeholder = policy.match(/\b(TODO|FIXME|XXX)\b/);
  if (placeholder) {
    err(
      "policy/placeholder",
      `The policy still contains "${placeholder[1]}". A policy with unfilled sections records an intention, not a rule.`,
    );
  }

  // Upstream URLs contain the id, so a policy that merely links to a position
  // would otherwise read as having mapped it. Mapping by id means writing the
  // id as an identifier somewhere the adopter controls.
  const prose = policy.replace(/https?:\/\/\S+/g, " ");

  for (const p of manifest.positions) {
    if (!prose.includes(p.id)) {
      err(
        "policy/position-absent",
        `Position "${p.id}" is not mentioned in the policy. Positions are mapped by id so the mapping survives a heading rewrite on either side.`,
        p.id,
      );
      continue;
    }
    if (!(p.id in locked)) {
      err(
        "lock/position-absent",
        `Position "${p.id}" is in the policy but has no digest in the lockfile, so drift in it cannot be detected.`,
        p.id,
      );
    } else if (locked[p.id] !== p.digest) {
      warn(
        "lock/position-stale",
        `Position "${p.id}" is recorded at ${String(locked[p.id])}; upstream is now ${p.digest}.`,
        p.id,
      );
    }

    // Open questions carry no claim and no falsifier obligation: they are
    // carried so the adopter knows the question is live, not answered.
    if (p.status !== "working-answer") continue;

    if (!p.falsifiers.some((f) => policy.includes(f))) {
      err(
        "policy/falsifier-absent",
        `Position "${p.id}" carries none of its falsifiers. A position without what would overturn it is a rule, not a claim.`,
        p.id,
      );
    }
    if (p.claim && !policy.includes(p.claim)) {
      warn(
        "policy/claim-absent",
        `Position "${p.id}" does not carry its claim verbatim. A policy built from the note title records the question it answers where its rule belongs.`,
        p.id,
      );
    }
  }
  return out;
}

export const errorsIn = (findings) =>
  findings.filter((f) => f.level === "error");

// --- command line --------------------------------------------------------
// Guarded so importing this module for its checks does not run the CLI.

if (
  process.argv[1] &&
  import.meta.url === new URL(`file://${process.argv[1]}`).href
) {
  const { readFileSync } = await import("node:fs");
  const [policyPath, lockPath, manifestArg] = process.argv.slice(2);

  const die = (msg) => {
    console.error(msg);
    process.exit(2);
  };
  if (!policyPath || !lockPath) {
    die(
      "usage: node check-policy.mjs <policy.md> <lockfile.json> [manifest-url-or-path]",
    );
  }
  const read = (p) => {
    try {
      return readFileSync(p, "utf8");
    } catch {
      return die(`cannot read ${p}`);
    }
  };

  const source = manifestArg ?? MANIFEST;
  let manifest;
  try {
    manifest = /^https?:/.test(source)
      ? await (await fetch(source)).json()
      : JSON.parse(read(source));
  } catch (e) {
    die(`cannot load the manifest from ${source}: ${e}`);
  }
  if (!manifest?.positions?.length) {
    die(`${source} is not a positions manifest.`);
  }

  let lock;
  try {
    lock = JSON.parse(read(lockPath));
  } catch (e) {
    die(`${lockPath} is not valid JSON: ${e}`);
  }

  const findings = checkPolicy({ policy: read(policyPath), lock, manifest });
  for (const f of findings) {
    console.log(
      `${f.level === "error" ? "error" : " warn"} ${f.code}${f.id ? ` [${f.id}]` : ""}`,
    );
    console.log(`      ${f.message}`);
  }
  const errors = errorsIn(findings);
  console.log(
    findings.length
      ? `\n${errors.length} error(s), ${findings.length - errors.length} warning(s) against ${manifest.digest}`
      : `conforming, against ${manifest.digest}`,
  );
  process.exit(errors.length ? 1 : 0);
}
