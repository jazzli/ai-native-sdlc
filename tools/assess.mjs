// Assesses a repository against the AI-Native SDLC capability map.
//
//   curl -fsSL https://jazzli.github.io/ai-native-sdlc/assess.mjs -o assess.mjs
//   node assess.mjs [repo-path] [capabilities-url-or-path]
//
// Reports what is observably present in a repository, per capability domain.
// It does not score, rank, or judge. "Not observed" is not "bad": a project
// may enforce something in a way this tool cannot see, and the report says
// which domains it could not assess and why.
//
// Three kinds of statement, kept apart on purpose:
//   observed       a fact about a file or configuration
//   needsHostApi   determinable, but not from the filesystem — assess-host.mjs
//                  answers these against the code host
//   notAssessable  requires judgment this tool cannot make
//
// Exit codes: 0 report produced, 2 could not run. There is no failing
// assessment — a report is not a test.

import fs from "node:fs";
import path from "node:path";

const CAPABILITIES =
  "https://jazzli.github.io/ai-native-sdlc/capabilities.json";

// Shapes this project has actually assessed a real repository of. It grows
// only when that happens and the result is reviewed — not when a mechanism
// looks like it ought to generalise. Everything else is assessment-only,
// which is the whole point of recording it.
const VALIDATED_SHAPES = [
  {
    runtime: "node",
    packageManager: "npm",
    ci: "github-actions",
    host: "github",
  },
];

const exists = (root, ...p) => fs.existsSync(path.join(root, ...p));
const readIf = (root, p) => {
  try {
    return fs.readFileSync(path.join(root, p), "utf8");
  } catch {
    return null;
  }
};
const firstPresent = (root, candidates) =>
  candidates.find((c) => exists(root, c)) ?? null;

// A project manifest often sits one level down — site/, app/, packages/*.
// Looking only at the root reported this project's own repository as an
// unknown runtime, which is how the limitation was found. The search stops
// at depth one: deeper is a monorepo, where one profile would be wrong
// anyway.
const searchRoots = (root) => {
  const subs = fs.existsSync(root)
    ? fs
        .readdirSync(root, { withFileTypes: true })
        .filter(
          (d) =>
            d.isDirectory() &&
            !d.name.startsWith(".") &&
            d.name !== "node_modules",
        )
        .map((d) => d.name)
    : [];
  return [".", ...subs];
};

/** The first directory, root first, containing any of these files. */
const locate = (root, names) => {
  for (const dir of searchRoots(root))
    for (const n of names) if (exists(root, dir, n)) return { dir, name: n };
  return null;
};

/** What kind of repository this is, from what it contains. */
export function detectProfile(root) {
  const manifest = locate(root, [
    "package.json",
    "pyproject.toml",
    "requirements.txt",
    "go.mod",
    "Cargo.toml",
    "pom.xml",
    "build.gradle",
  ]);
  const lock = locate(root, [
    "pnpm-lock.yaml",
    "yarn.lock",
    "package-lock.json",
    "bun.lockb",
    "uv.lock",
    "poetry.lock",
    "Cargo.lock",
    "go.sum",
  ]);
  const pkg = manifest?.name === "package.json" ? "{}" : null;
  const runtime =
    {
      "package.json": "node",
      "pyproject.toml": "python",
      "requirements.txt": "python",
      "go.mod": "go",
      "Cargo.toml": "rust",
      "pom.xml": "jvm",
      "build.gradle": "jvm",
    }[manifest?.name] ?? "unknown";

  const packageManager =
    {
      "pnpm-lock.yaml": "pnpm",
      "yarn.lock": "yarn",
      "package-lock.json": "npm",
      "bun.lockb": "bun",
      "uv.lock": "uv",
      "poetry.lock": "poetry",
      "Cargo.lock": "cargo",
      "go.sum": "go",
    }[lock?.name] ?? "unknown";

  const ci = exists(root, ".github/workflows")
    ? "github-actions"
    : exists(root, ".gitlab-ci.yml")
      ? "gitlab-ci"
      : exists(root, ".circleci")
        ? "circleci"
        : exists(root, "Jenkinsfile")
          ? "jenkins"
          : "none-detected";

  const host = exists(root, ".github")
    ? "github"
    : exists(root, ".gitlab-ci.yml")
      ? "gitlab"
      : "unknown";

  return {
    runtime,
    packageManager,
    ci,
    host,
    versionControl: exists(root, ".git") ? "git" : "unknown",
    // Where the manifest was found, so a reader can see whether the profile
    // describes the repository or one project inside it.
    manifestAt: manifest ? path.join(manifest.dir, manifest.name) : null,
  };
}

/** Whether this project has ever assessed a repository of this shape. */
export function resolveSupport(profile) {
  const matched = VALIDATED_SHAPES.some((s) =>
    Object.entries(s).every(([k, v]) => profile[k] === v),
  );
  return matched ? "first-class" : "assessment-only";
}

const anyOf = (root, paths) => paths.filter((p) => exists(root, p));

// One probe per domain in the capability map. A probe reports what it can
// see and states what it cannot; it never converts that into a score.
// Domains absent here are reported as unprobed rather than as passing.
const PROBES = {
  "repository-and-change-boundaries": (r) => ({
    observed: [
      ...anyOf(r, [".gitignore", "CODEOWNERS", ".github/CODEOWNERS"]).map(
        (p) => `${p} present`,
      ),
      ...anyOf(r, [
        "package-lock.json",
        "pnpm-lock.yaml",
        "yarn.lock",
        "poetry.lock",
        "uv.lock",
        "Cargo.lock",
        "go.sum",
      ]).map((p) => `dependency lockfile: ${p}`),
    ],
    notAssessable: [
      "which files are generated and owned by a tool rather than edited",
      "which parts of the tree an agent may safely change",
    ],
  }),

  "context-engineering": (r) => ({
    observed: anyOf(r, [
      "AGENTS.md",
      "CLAUDE.md",
      ".cursorrules",
      ".github/copilot-instructions.md",
      "GEMINI.md",
    ]).map((p) => `agent instruction file: ${p}`),
    notAssessable: [
      "whether the instruction file is current, or contradicts the code",
    ],
  }),

  "mechanical-enforcement": (r) => {
    const hooks = readIf(r, ".git/config")?.includes("hooksPath");
    return {
      observed: [
        ...(hooks ? ["git hooks path is configured"] : []),
        ...anyOf(r, [".githooks", ".husky", ".pre-commit-config.yaml"]).map(
          (p) => `hook directory or config: ${p}`,
        ),
        ...anyOf(r, [
          "eslint.config.js",
          ".eslintrc.json",
          ".eslintrc.cjs",
          "ruff.toml",
          ".golangci.yml",
          "clippy.toml",
          ".prettierrc",
          "prettier.config.js",
          "tsconfig.json",
          "mypy.ini",
        ]).map((p) => `lint, format or type configuration: ${p}`),
      ],
      needsHostApi: ["whether any of these checks are required before a merge"],
      notAssessable: [
        "whether a check fails closed, or reports and is ignored",
      ],
    };
  },

  "specification-and-planning": (r) => ({
    observed: anyOf(r, [
      "docs/design",
      "docs/specs",
      "docs/rfcs",
      "rfcs",
      "docs/decisions",
      "docs/adr",
    ]).map((p) => `design or specification directory: ${p}`),
    notAssessable: ["whether a specification precedes the work it describes"],
  }),

  persistence: (r) => ({
    observed: anyOf(r, [
      "migrations",
      "db/migrate",
      "alembic",
      "prisma/schema.prisma",
      "drizzle.config.ts",
      "schema.sql",
    ]).map((p) => `schema or migration artefact: ${p}`),
    notAssessable: [
      "transaction boundaries, constraint coverage, and concurrency behaviour",
      "whether tests run against a real database",
    ],
  }),

  testing: (r) => ({
    observed: [
      ...anyOf(r, ["tests", "test", "__tests__", "spec"]).map(
        (p) => `test directory: ${p}`,
      ),
      ...anyOf(r, [
        "vitest.config.ts",
        "jest.config.js",
        "pytest.ini",
        "tox.ini",
        "codecov.yml",
      ]).map((p) => `test or coverage configuration: ${p}`),
    ],
    notAssessable: [
      "whether the tests assert behaviour or restate the implementation",
      "what coverage actually demonstrates",
    ],
  }),

  "ai-evaluation": (r) => ({
    observed: anyOf(r, [
      "promptfooconfig.yaml",
      "evals",
      "eval",
      ".promptfoo",
    ]).map((p) => `evaluation configuration or suite: ${p}`),
    notAssessable: [
      "whether graders are calibrated, and whether evaluations gate a release",
    ],
  }),

  "observability-and-debugging": () => ({
    observed: [],
    notAssessable: [
      "this project carries observability as an open question and offers no position",
      "whether a failure can be reproduced from what is recorded",
    ],
  }),

  security: (r) => ({
    observed: [
      ...anyOf(r, ["SECURITY.md", ".github/SECURITY.md"]).map(
        (p) => `${p} present`,
      ),
      ...anyOf(r, [".github/dependabot.yml", "renovate.json"]).map(
        (p) => `dependency update automation: ${p}`,
      ),
    ],
    needsHostApi: [
      "secret scanning, and whether workflow permissions are least-privilege",
    ],
    notAssessable: [
      "whether an agent can reach private data, untrusted content, and a way out at once",
    ],
  }),

  "delivery-and-release": (r) => ({
    observed: [
      ...anyOf(r, [
        ".github/workflows",
        ".gitlab-ci.yml",
        ".circleci",
        "Jenkinsfile",
      ]).map((p) => `continuous integration configuration: ${p}`),
      ...anyOf(r, ["CHANGELOG.md", "CHANGELOG"]).map((p) => `${p} present`),
    ],
    needsHostApi: [
      "release history, deployment environments, and rollback record",
    ],
    notAssessable: ["whether a deployment can be reversed in practice"],
  }),

  "review-and-falsification": (r) => ({
    observed: anyOf(r, [
      ".github/PULL_REQUEST_TEMPLATE.md",
      ".github/pull_request_template.md",
      "CODEOWNERS",
      ".github/CODEOWNERS",
    ]).map((p) => `review configuration: ${p}`),
    needsHostApi: [
      "branch protection, required checks, and review requirements",
    ],
    notAssessable: ["whether review catches anything, or approves by default"],
  }),

  documentation: (r) => ({
    observed: [
      ...anyOf(r, ["README.md", "README.rst"]).map((p) => `${p} present`),
      ...anyOf(r, ["docs", "CONTRIBUTING.md"]).map((p) => `${p} present`),
      ...anyOf(r, ["docs/adr", "docs/decisions", "adr"]).map(
        (p) => `decision records: ${p}`,
      ),
      ...anyOf(r, ["docs/runbooks", "runbooks"]).map((p) => `runbooks: ${p}`),
    ],
    notAssessable: [
      "whether the documentation is current, or contradicts the code",
    ],
  }),

  "runtime-performance": (r) => ({
    observed: anyOf(r, ["bench", "benchmarks", ".benchmarks"]).map(
      (p) => `benchmark directory: ${p}`,
    ),
    notAssessable: [
      "measured performance, resource cost, and whether a regression budget exists",
    ],
  }),

  "agent-harness-and-orchestration": (r) => ({
    observed: anyOf(r, [
      ".claude",
      ".cursor",
      ".aider.conf.yml",
      ".devcontainer",
      ".mcp.json",
    ]).map((p) => `agent or environment configuration: ${p}`),
    notAssessable: ["what surrounds the agent when it ships production code"],
  }),

  "adoption-readiness": (r) => {
    const ci = exists(r, ".github/workflows") || exists(r, ".gitlab-ci.yml");
    const tests = ["tests", "test", "__tests__", "spec"].some((p) =>
      exists(r, p),
    );
    const vcs = exists(r, ".git");
    return {
      observed: [
        ...(vcs ? ["under version control"] : []),
        ...(ci ? ["continuous integration is configured"] : []),
        ...(tests ? ["a test suite is present"] : []),
      ],
      notAssessable: [
        "whether the foundations hold under the load agents put on them",
      ],
    };
  },
};

/** Runs every probe the capability map names, in the map's order. */
export function assess(root, capabilities) {
  const profile = detectProfile(root);
  return {
    schemaVersion: 1,
    profile,
    support: resolveSupport(profile),
    domains: capabilities.map((c) => {
      const probe = PROBES[c.id];
      const r = probe ? probe(root) : null;
      return {
        id: c.id,
        title: c.title,
        upstreamEvidence: c.evidence,
        upstreamSupport: c.support,
        observed: r?.observed ?? [],
        needsHostApi: r?.needsHostApi ?? [],
        notAssessable: r
          ? (r.notAssessable ?? [])
          : ["no probe exists for this domain"],
      };
    }),
  };
}

// --- command line --------------------------------------------------------

if (
  process.argv[1] &&
  import.meta.url === new URL(`file://${process.argv[1]}`).href
) {
  const [rootArg, capsArg] = process.argv.slice(2);
  const root = path.resolve(rootArg ?? ".");
  const die = (m) => {
    console.error(m);
    process.exit(2);
  };
  if (!fs.existsSync(root)) die(`no such directory: ${root}`);

  const source = capsArg ?? CAPABILITIES;
  let caps;
  try {
    caps = /^https?:/.test(source)
      ? (await (await fetch(source)).json()).capabilities
      : JSON.parse(fs.readFileSync(source, "utf8")).capabilities;
  } catch (e) {
    die(`cannot load the capability map from ${source}: ${e}`);
  }
  if (!caps?.length) die(`${source} is not a capability map.`);

  const report = assess(root, caps);
  const p = report.profile;
  console.log(`# Assessment of ${root}\n`);
  console.log(
    `Profile: ${p.runtime}, ${p.packageManager}, ${p.ci}, ${p.host}\n` +
      `Support: ${report.support}` +
      (report.support === "assessment-only"
        ? " — this project has never assessed a repository of this shape.\n" +
          "         Observations below are still facts; the mapping to practice is not validated here.\n"
        : " — a repository of this shape has been assessed before.\n"),
  );
  for (const d of report.domains) {
    console.log(`## ${d.title}  (upstream: ${d.upstreamEvidence})`);
    for (const o of d.observed) console.log(`  observed       ${o}`);
    for (const o of d.needsHostApi) console.log(`  needs host API ${o}`);
    for (const o of d.notAssessable) console.log(`  not assessable ${o}`);
    if (!d.observed.length)
      console.log("  (nothing observed — not a finding of absence)");
    console.log();
  }
  const uncovered = report.domains.filter(
    (d) => d.upstreamEvidence === "uncovered",
  );
  console.log(
    `${report.domains.length} domains. ${uncovered.length} have no upstream position at all: ` +
      `${uncovered.map((d) => d.id).join(", ")}.`,
  );
  process.exit(0);
}
