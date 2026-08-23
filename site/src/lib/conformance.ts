import type { Manifest } from './manifest';

export interface Finding {
  level: 'error' | 'warning';
  code: string;
  message: string;
  /** Position this concerns, where the finding is position-scoped. */
  id?: string;
}

export interface PolicyInput {
  /** The prose policy, as committed by the adopter. */
  policy: string;
  /** The parsed digest lockfile. Unknown shape until validated. */
  lock: unknown;
  /** The upstream manifest to check against. */
  manifest: Manifest;
}

const DIGEST = /^[0-9a-f]{12}$/;

// Checks the contract /adopt states, against a policy an adopter has already
// edited. Adopters are told to adapt the generated starter, so this asserts
// presence rather than layout: a policy that reorganises the headings, merges
// positions into existing sections, or writes in another language for the
// local rule still passes, provided it carries what the contract requires.
//
// Deliberately absent: a check that an open question is not recorded as
// guidance. The contract requires it, but detecting it reliably needs to
// understand the policy's prose, and a heuristic here would fire on
// well-formed policies. Carrying the open question at all is checked; how it
// is framed is left to human review.
export function checkPolicy({
  policy,
  lock,
  manifest,
}: PolicyInput): Finding[] {
  const out: Finding[] = [];
  const err = (code: string, message: string, id?: string) =>
    out.push({ level: 'error', code, message, id });
  const warn = (code: string, message: string, id?: string) =>
    out.push({ level: 'warning', code, message, id });

  // --- the lockfile -------------------------------------------------------
  if (typeof lock !== 'object' || lock === null || Array.isArray(lock)) {
    err('lock/unreadable', 'The lockfile is not a JSON object.');
    return out;
  }
  const l = lock as Record<string, unknown>;

  if (l.schemaVersion !== manifest.schemaVersion) {
    err(
      'lock/schema-version',
      `Lockfile records schemaVersion ${JSON.stringify(l.schemaVersion)}; upstream publishes ${manifest.schemaVersion}. A parser written against one may not read the other.`,
    );
  }
  if (typeof l.digest !== 'string' || !DIGEST.test(l.digest)) {
    err(
      'lock/digest-format',
      `Lockfile digest ${JSON.stringify(l.digest)} is not a 12-character hex digest.`,
    );
  } else if (l.digest !== manifest.digest) {
    warn(
      'lock/digest-stale',
      `Lockfile records ${l.digest}; upstream is now ${manifest.digest}. Review what moved before updating it.`,
    );
  }

  const locked =
    typeof l.positions === 'object' && l.positions !== null
      ? (l.positions as Record<string, unknown>)
      : {};
  if (!Object.keys(locked).length) {
    err('lock/no-positions', 'The lockfile records no position digests.');
  }

  for (const id of Object.keys(locked)) {
    if (!manifest.positions.some((p) => p.id === id)) {
      warn(
        'lock/unknown-position',
        `Lockfile records "${id}", which upstream no longer publishes. It may have been renamed or withdrawn.`,
        id,
      );
    }
  }

  // --- the policy ---------------------------------------------------------
  const placeholder = policy.match(/\b(TODO|FIXME|XXX)\b/);
  if (placeholder) {
    err(
      'policy/placeholder',
      `The policy still contains "${placeholder[1]}". A policy with unfilled sections records an intention, not a rule.`,
    );
  }

  // Upstream URLs contain the id, so a policy that merely links to a position
  // would otherwise read as having mapped it. Mapping by id means writing the
  // id as an identifier somewhere the adopter controls.
  const prose = policy.replace(/https?:\/\/\S+/g, ' ');

  for (const p of manifest.positions) {
    const carried = prose.includes(p.id);
    if (!carried) {
      err(
        'policy/position-absent',
        `Position "${p.id}" is not mentioned in the policy. Positions are mapped by id so the mapping survives a heading rewrite on either side.`,
        p.id,
      );
      continue;
    }

    if (!(p.id in locked)) {
      err(
        'lock/position-absent',
        `Position "${p.id}" is in the policy but has no digest in the lockfile, so drift in it cannot be detected.`,
        p.id,
      );
    } else if (locked[p.id] !== p.digest) {
      warn(
        'lock/position-stale',
        `Position "${p.id}" is recorded at ${String(locked[p.id])}; upstream is now ${p.digest}.`,
        p.id,
      );
    }

    // Open questions carry no claim and no falsifier obligation: they are
    // carried so the adopter knows the question is live, not answered.
    if (p.status !== 'working-answer') continue;

    if (!p.falsifiers.some((f) => policy.includes(f))) {
      err(
        'policy/falsifier-absent',
        `Position "${p.id}" carries none of its falsifiers. A position without what would overturn it is a rule, not a claim.`,
        p.id,
      );
    }
    if (p.claim && !policy.includes(p.claim)) {
      warn(
        'policy/claim-absent',
        `Position "${p.id}" does not carry its claim verbatim. A policy built from the note title records the question it answers where its rule belongs.`,
        p.id,
      );
    }
  }

  return out;
}

export const errorsIn = (findings: Finding[]) =>
  findings.filter((f) => f.level === 'error');
