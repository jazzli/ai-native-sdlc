// Assesses what only the code host can answer: branch rules, required
// checks, workflow permissions, releases. The file-level assessor states
// these as "needs host API"; this fills them in.
//
//   curl -fsSL https://jazzli.github.io/ai-native-sdlc/assess-host.mjs -o assess-host.mjs
//   node assess-host.mjs [owner/repo]
//
// Opt-in and separate from assess.mjs on purpose: reading a repository's
// files and querying its host are different trust models, and a tool that
// only reads files should not ask for credentials.
//
// It handles no token. Every request goes through the `gh` CLI, using
// whatever authentication the operator already has, and nothing is written.
//
// Exit codes: 0 report produced, 2 could not run.

import { execFileSync } from "node:child_process";

/** One query. Returns parsed JSON, or a reason it could not be answered. */
export function query(path, run = ghApi) {
  try {
    return { ok: true, data: JSON.parse(run(path)) };
  } catch (e) {
    const msg = String(e.stderr ?? e.message ?? e);
    if (/404|Not Found/.test(msg)) return { ok: false, reason: "not-found" };
    if (/403|404.*permission|Resource not accessible/i.test(msg))
      return { ok: false, reason: "not-permitted" };
    return { ok: false, reason: "unavailable" };
  }
}

const ghApi = (p) =>
  execFileSync("gh", ["api", p], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

const say = (o, s) => o.observed.push(s);
const cannot = (o, s) => o.needsPermission.push(s);

/**
 * @param {string} repo  owner/name
 * @param {(path: string) => string} run  injected for tests
 *
 * Reports what the host says. Where a query is refused, that is recorded as
 * a permission gap rather than as an absence: "cannot see" and "not there"
 * are different answers and must not be collapsed.
 */
export function assessHost(repo, run = ghApi) {
  const q = (p) => query(`repos/${repo}/${p}`, run);
  const domains = {};
  const domain = (id) =>
    (domains[id] ??= { id, observed: [], absent: [], needsPermission: [] });

  // --- mechanical enforcement and review ---------------------------------
  const meta = query(`repos/${repo}`, run);
  const branch = meta.ok ? (meta.data.default_branch ?? "main") : "main";
  const rules = q(`rules/branches/${branch}`);
  const enforce = domain("mechanical-enforcement");
  const review = domain("review-and-falsification");

  if (!rules.ok) {
    cannot(enforce, `branch rules for ${branch} (${rules.reason})`);
    cannot(review, `branch rules for ${branch} (${rules.reason})`);
  } else {
    const types = rules.data.map((r) => r.type);
    const checks =
      rules.data.find((r) => r.type === "required_status_checks")?.parameters
        ?.required_status_checks ?? [];
    checks.length
      ? say(
          enforce,
          `checks required before merge on ${branch}: ${checks.map((c) => c.context).join(", ")}`,
        )
      : enforce.absent.push(
          `no status check is required before merge on ${branch}`,
        );

    const pr = rules.data.find((r) => r.type === "pull_request");
    pr
      ? say(
          review,
          `changes to ${branch} must go through a pull request (${pr.parameters?.required_approving_review_count ?? 0} approvals required)`,
        )
      : review.absent.push(`${branch} accepts direct pushes`);
    types.includes("non_fast_forward")
      ? say(review, `${branch} cannot be force-pushed`)
      : review.absent.push(`${branch} can be force-pushed`);
    types.includes("deletion")
      ? say(review, `${branch} cannot be deleted`)
      : review.absent.push(`${branch} can be deleted`);
  }

  // --- security ----------------------------------------------------------
  const sec = domain("security");
  const perms = q("actions/permissions/workflow");
  if (!perms.ok) cannot(sec, `default workflow permissions (${perms.reason})`);
  else
    say(
      sec,
      `default workflow token: ${perms.data.default_workflow_permissions ?? "unknown"}` +
        (perms.data.can_approve_pull_request_reviews
          ? "; workflows may approve pull requests"
          : ""),
    );

  if (meta.ok) {
    const s = meta.data.security_and_analysis ?? {};
    for (const [k, label] of [
      ["secret_scanning", "secret scanning"],
      ["secret_scanning_push_protection", "push protection for secrets"],
    ]) {
      const st = s[k]?.status;
      if (st === "enabled") say(sec, `${label} is enabled`);
      else if (st === "disabled") sec.absent.push(`${label} is disabled`);
      else cannot(sec, `${label} (not reported for this repository)`);
    }
  } else cannot(sec, `repository metadata (${meta.reason})`);

  // --- delivery and release ----------------------------------------------
  const rel = domain("delivery-and-release");
  const releases = q("releases?per_page=1");
  if (!releases.ok) cannot(rel, `releases (${releases.reason})`);
  else if (releases.data.length)
    say(
      rel,
      `most recent release: ${releases.data[0].tag_name} (${String(releases.data[0].published_at).slice(0, 10)})`,
    );
  else rel.absent.push("no releases published");

  const envs = q("environments");
  if (!envs.ok) cannot(rel, `deployment environments (${envs.reason})`);
  else if (envs.data.total_count)
    say(
      rel,
      `deployment environments: ${envs.data.environments.map((e) => e.name).join(", ")}`,
    );
  else rel.absent.push("no deployment environments configured");

  return {
    schemaVersion: 1,
    repo,
    defaultBranch: branch,
    domains: Object.values(domains),
  };
}

// --- command line --------------------------------------------------------

if (
  process.argv[1] &&
  import.meta.url === new URL(`file://${process.argv[1]}`).href
) {
  const die = (m) => {
    console.error(m);
    process.exit(2);
  };
  try {
    execFileSync("gh", ["auth", "status"], { stdio: "ignore" });
  } catch {
    die(
      "the GitHub CLI is required and must be authenticated: https://cli.github.com\n" +
        "This tool handles no token of its own — it uses the authentication you already have.",
    );
  }

  let repo = process.argv[2];
  if (!repo) {
    try {
      repo = JSON.parse(
        execFileSync("gh", ["repo", "view", "--json", "nameWithOwner"], {
          encoding: "utf8",
        }),
      ).nameWithOwner;
    } catch {
      die(
        "usage: node assess-host.mjs <owner/repo>   (or run inside a GitHub repository)",
      );
    }
  }

  const r = assessHost(repo);
  console.log(
    `# Host assessment of ${r.repo}  (default branch: ${r.defaultBranch})\n`,
  );
  for (const d of r.domains) {
    console.log(`## ${d.id}`);
    for (const o of d.observed) console.log(`  observed        ${o}`);
    for (const o of d.absent) console.log(`  not configured  ${o}`);
    for (const o of d.needsPermission) console.log(`  cannot see      ${o}`);
    console.log();
  }
  const gaps = r.domains.reduce((n, d) => n + d.needsPermission.length, 0);
  console.log(
    gaps
      ? `${gaps} question(s) the current authentication could not answer. "Cannot see" is not "not there".`
      : "Every question was answerable with the current authentication.",
  );
  process.exit(0);
}
