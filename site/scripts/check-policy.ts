// Checks an adopted policy against the contract /adopt states.
//
//   npm run check-policy -- <policy.md> <lockfile.json> [manifest-url]
//
// Exit codes are 0 conforming, 1 errors found, 2 could not run — kept
// distinct so a scheduler can tell "the policy is wrong" from "the check
// itself failed", the same distinction the drift check makes.
import fs from 'node:fs';
import { checkPolicy, errorsIn } from '../src/lib/conformance.ts';
import type { Manifest } from '../src/lib/manifest.ts';
import { SITE_ORIGIN, SITE_BASE } from '../src/lib/site-config.ts';

const [policyPath, lockPath, manifestArg] = process.argv.slice(2);
if (!policyPath || !lockPath) {
  console.error(
    'usage: check-policy <policy.md> <lockfile.json> [manifest-url-or-path]',
  );
  process.exit(2);
}

const read = (p: string) => {
  try {
    return fs.readFileSync(p, 'utf8');
  } catch {
    console.error(`cannot read ${p}`);
    process.exit(2);
  }
};

const source = manifestArg ?? `${SITE_ORIGIN}${SITE_BASE}/positions.json`;
let manifest: Manifest;
try {
  manifest = /^https?:/.test(source)
    ? await (await fetch(source)).json()
    : JSON.parse(read(source));
} catch (e) {
  console.error(`cannot load the manifest from ${source}: ${String(e)}`);
  process.exit(2);
}

let lock: unknown;
try {
  lock = JSON.parse(read(lockPath));
} catch (e) {
  console.error(`${lockPath} is not valid JSON: ${String(e)}`);
  process.exit(2);
}

const findings = checkPolicy({ policy: read(policyPath), lock, manifest });
for (const f of findings) {
  const where = f.id ? ` [${f.id}]` : '';
  console.log(`${f.level === 'error' ? 'error' : ' warn'} ${f.code}${where}`);
  console.log(`      ${f.message}`);
}

const errors = errorsIn(findings);
const warnings = findings.length - errors.length;
console.log(
  findings.length
    ? `\n${errors.length} error(s), ${warnings} warning(s) against ${manifest.digest}`
    : `conforming, against ${manifest.digest}`,
);
process.exit(errors.length ? 1 : 0);
