import { describe, it, expect } from 'vitest';
import { assessHost, query } from '../../tools/assess-host.mjs';

/** A fake `gh api`, so these assert on parsing rather than on a network. */
const transport = (routes: Record<string, unknown>) => (p: string) => {
  // Exact paths: an endsWith match lets the repository route swallow every
  // other query, which is how the first version of this helper lied.
  if (!(p in routes)) {
    const e: Error & { stderr?: string } = new Error('gh: 404 Not Found');
    e.stderr = 'HTTP 404: Not Found';
    throw e;
  }
  return JSON.stringify(routes[p]);
};
const R = 'repos/o/r';

const guarded: Record<string, unknown> = {
  [R]: {
    default_branch: 'main',
    security_and_analysis: { secret_scanning: { status: 'enabled' } },
  },
  [`${R}/rules/branches/main`]: [
    {
      type: 'required_status_checks',
      parameters: { required_status_checks: [{ context: 'build' }] },
    },
    {
      type: 'pull_request',
      parameters: { required_approving_review_count: 1 },
    },
    { type: 'non_fast_forward' },
    { type: 'deletion' },
  ],
  [`${R}/actions/permissions/workflow`]: {
    default_workflow_permissions: 'read',
  },
  [`${R}/releases?per_page=1`]: [
    { tag_name: 'v1.2.0', published_at: '2026-08-01T00:00:00Z' },
  ],
  [`${R}/environments`]: {
    total_count: 1,
    environments: [{ name: 'production' }],
  },
};

type Finding = {
  id: string;
  observed: string[];
  absent: string[];
  needsPermission: string[];
};
const find = (r: { domains: Finding[] }, id: string) =>
  r.domains.find((d) => d.id === id)!;

describe('assessHost', () => {
  it('reports the rules a protected branch carries', () => {
    const r = assessHost('o/r', transport(guarded));
    expect(find(r, 'mechanical-enforcement').observed.join(' ')).toContain(
      'build',
    );
    const rev = find(r, 'review-and-falsification').observed.join(' ');
    expect(rev).toContain('pull request');
    expect(rev).toContain('cannot be force-pushed');
    expect(rev).toContain('cannot be deleted');
  });

  it('reports an unprotected branch as not configured, not as unknown', () => {
    // An administrator's view: no ruleset, and the legacy endpoint says so
    // in words rather than with a bare 404.
    const admin = (p: string) => {
      if (p === `${R}/branches/main/protection`) {
        const e: Error & { stderr?: string } = new Error('gh: 404');
        e.stderr = 'HTTP 404: Branch not protected';
        throw e;
      }
      return transport({ ...guarded, [`${R}/rules/branches/main`]: [] })(p);
    };
    const r = assessHost('o/r', admin);
    const rev = find(r, 'review-and-falsification');
    expect(rev.absent.join(' ')).toContain('accepts direct pushes');
    expect(rev.absent.join(' ')).toContain('can be force-pushed');
    expect(rev.needsPermission).toEqual([]);
  });

  // The property that makes the report trustworthy. A refused query and an
  // absent setting are different answers, and collapsing them would let a
  // permission gap read as a finding about the repository.
  it('never records a refused query as an absent setting', () => {
    // Only repository metadata answers; every other route 404s.
    const r = assessHost('o/r', transport({ [R]: { default_branch: 'main' } }));
    for (const id of [
      'mechanical-enforcement',
      'review-and-falsification',
      'delivery-and-release',
    ]) {
      const d = find(r, id);
      expect(d.needsPermission.length, id).toBeGreaterThan(0);
      expect(d.absent, id).toEqual([]);
    }
  });

  it('separates a disabled setting from one the host does not report', () => {
    const disabled = assessHost(
      'o/r',
      transport({
        ...guarded,
        [R]: {
          default_branch: 'main',
          security_and_analysis: { secret_scanning: { status: 'disabled' } },
        },
      }),
    );
    expect(find(disabled, 'security').absent.join(' ')).toContain(
      'secret scanning is disabled',
    );

    const silent = assessHost(
      'o/r',
      transport({ ...guarded, [R]: { default_branch: 'main' } }),
    );
    expect(find(silent, 'security').needsPermission.join(' ')).toContain(
      'secret scanning',
    );
  });

  it('follows the default branch the host names, not an assumed one', () => {
    const r = assessHost(
      'o/r',
      transport({
        [R]: { default_branch: 'trunk' },
        [`${R}/rules/branches/trunk`]: [{ type: 'deletion' }],
      }),
    );
    expect(r.defaultBranch).toBe('trunk');
    expect(find(r, 'review-and-falsification').observed.join(' ')).toContain(
      'trunk cannot be deleted',
    );
  });

  it('classifies why a query failed', () => {
    const notFound = query('x', () => {
      const e: Error & { stderr?: string } = new Error('boom');
      e.stderr = 'HTTP 404: Not Found';
      throw e;
    });
    expect(notFound).toMatchObject({ ok: false, reason: 'not-found' });
    const refused = query('x', () => {
      const e: Error & { stderr?: string } = new Error('boom');
      e.stderr = 'HTTP 403: Resource not accessible by integration';
      throw e;
    });
    expect(refused.ok).toBe(false);
    expect(refused.reason).toBe('not-permitted');
  });
});

// jazzli/ordomata is protected by branch protection, the older mechanism,
// and carries no ruleset. Read through the rulesets API alone it reported
// as unprotected, force-pushable and deletable — a false "not configured"
// on the claim a host assessor exists to make. Found 2026-09-19, the first
// time the assessor was run against a repository this project did not write.
describe('branch protection without rulesets', () => {
  const legacyOnly: Record<string, unknown> = {
    [R]: { default_branch: 'main' },
    [`${R}/rules/branches/main`]: [],
    [`${R}/branches/main/protection`]: {
      required_status_checks: { contexts: ['ci', 'lint'] },
      required_pull_request_reviews: { required_approving_review_count: 1 },
      allow_force_pushes: { enabled: false },
      allow_deletions: { enabled: false },
    },
  };

  it('reads the legacy protection when the rulesets are empty', () => {
    const r = assessHost('o/r', transport(legacyOnly));
    expect(find(r, 'mechanical-enforcement').observed).toEqual([
      'checks required before merge on main: ci, lint',
    ]);
    const review = find(r, 'review-and-falsification');
    expect(review.observed).toContain(
      'changes to main must go through a pull request (1 approvals required)',
    );
    expect(review.observed).toContain('main cannot be force-pushed');
    expect(review.observed).toContain('main cannot be deleted');
    expect(review.absent).toEqual([]);
  });

  it('merges checks from both mechanisms without repeating one', () => {
    const both = {
      ...legacyOnly,
      [`${R}/rules/branches/main`]: [
        {
          type: 'required_status_checks',
          parameters: {
            required_status_checks: [{ context: 'ci' }, { context: 'build' }],
          },
        },
      ],
    };
    const r = assessHost('o/r', transport(both));
    expect(find(r, 'mechanical-enforcement').observed).toEqual([
      'checks required before merge on main: ci, build, lint',
    ]);
  });

  // An administrator of an unprotected branch gets 404 "Branch not protected";
  // everyone else gets a bare 404. Only the first is an absence.
  it('treats "Branch not protected" as unprotected, and a bare 404 as unreadable', () => {
    const unprotected = (p: string) => {
      if (p === `${R}/branches/main/protection`) {
        const e: Error & { stderr?: string } = new Error('gh: 404');
        e.stderr = 'HTTP 404: Branch not protected';
        throw e;
      }
      return transport({
        [R]: { default_branch: 'main' },
        [`${R}/rules/branches/main`]: [],
      })(p);
    };
    const a = assessHost('o/r', unprotected);
    expect(find(a, 'review-and-falsification').absent).toContain(
      'main accepts direct pushes',
    );
    expect(find(a, 'mechanical-enforcement').needsPermission).toEqual([]);

    const b = assessHost(
      'o/r',
      transport({
        [R]: { default_branch: 'main' },
        [`${R}/rules/branches/main`]: [],
      }),
    );
    expect(find(b, 'review-and-falsification').absent).toEqual([]);
    expect(find(b, 'mechanical-enforcement').needsPermission[0]).toMatch(
      /branch protection for main/,
    );
    expect(find(b, 'review-and-falsification').needsPermission[0]).toMatch(
      /branch protection for main/,
    );
  });
});
