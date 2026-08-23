import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { buildManifest } from '../src/lib/manifest';
import { starterPolicy, starterLock } from '../src/lib/starter';
// The published checker itself, not a copy: what adopters fetch is what
// these assertions run against.
import { checkPolicy, errorsIn } from '../../tools/check-policy.mjs';
import { CONTENT } from '../src/lib/site-config';

const realNotes = fs
  .readdirSync(CONTENT.questionsDir)
  .filter((f) => f.endsWith('.md'))
  .map((f) => {
    const src = fs.readFileSync(path.join(CONTENT.questionsDir, f), 'utf8');
    return {
      id: f.replace(/\.md$/, ''),
      title: src.match(/^title:\s*(.+)$/m)![1],
      status: src.match(/^status:\s*(\S+)$/m)![1] as
        'working-answer' | 'open' | 'parked',
      updated: src.match(/^updated:\s*(\S+)$/m)![1],
    };
  });

const manifest = buildManifest(realNotes, '2026-08-23');
const policy = starterPolicy(manifest);
const lock = starterLock(manifest);
const codes = (f: ReturnType<typeof checkPolicy>) => f.map((x) => x.code);

describe('policy conformance', () => {
  // The keystone. If the starter we publish stops satisfying the contract we
  // publish, one of the two has drifted and this fails before an adopter
  // inherits the inconsistency.
  it('passes the starter this project generates, with no errors', () => {
    expect(errorsIn(checkPolicy({ policy, lock, manifest }))).toEqual([]);
  });

  // Adopters are told to adapt the starter. A checker coupled to its layout
  // would reject a policy that did exactly what the instructions asked.
  it('passes a policy that has been reorganised and rewritten', () => {
    const adapted = [
      '# Engineering policy',
      '',
      'Our rules, and where they came from.',
      '',
      ...manifest.positions.map((p) =>
        [
          `### ${p.claim ?? p.title} <!-- upstream: ${p.id} -->`,
          p.status === 'working-answer'
            ? `We do this. Enforced by our CI. Revoked if: ${p.falsifiers[0]}`
            : 'Carried as an open question.',
        ].join('\n'),
      ),
    ].join('\n');
    expect(errorsIn(checkPolicy({ policy: adapted, lock, manifest }))).toEqual(
      [],
    );
  });

  it('rejects a policy that drops a position', () => {
    const id = manifest.positions[2].id;
    const stripped = policy.split(`\`${id}\``).join('`removed`');
    const f = checkPolicy({ policy: stripped, lock, manifest });
    expect(codes(f)).toContain('policy/position-absent');
    expect(f.find((x) => x.code === 'policy/position-absent')?.id).toBe(id);
  });

  it('rejects a position carried without any of its falsifiers', () => {
    const p = manifest.positions.find((x) => x.status === 'working-answer')!;
    let stripped = policy;
    for (const f of p.falsifiers)
      stripped = stripped.split(f).join('(removed)');
    expect(codes(checkPolicy({ policy: stripped, lock, manifest }))).toContain(
      'policy/falsifier-absent',
    );
  });

  it('rejects a policy left with a placeholder', () => {
    const f = checkPolicy({
      policy: `${policy}\n- **Enforced here by** TODO`,
      lock,
      manifest,
    });
    expect(codes(f)).toContain('policy/placeholder');
  });

  it('rejects a lockfile whose schema version is not the published one', () => {
    const f = checkPolicy({
      policy,
      lock: { ...lock, schemaVersion: 99 },
      manifest,
    });
    expect(codes(f)).toContain('lock/schema-version');
  });

  it('rejects a position with no digest to detect drift against', () => {
    const id = manifest.positions[0].id;
    const positions = { ...lock.positions };
    delete positions[id];
    const f = checkPolicy({ policy, lock: { ...lock, positions }, manifest });
    expect(codes(f)).toContain('lock/position-absent');
  });

  it('rejects a malformed digest, and a lockfile that is not an object', () => {
    expect(
      codes(
        checkPolicy({ policy, lock: { ...lock, digest: 'nope' }, manifest }),
      ),
    ).toContain('lock/digest-format');
    expect(codes(checkPolicy({ policy, lock: [], manifest }))).toEqual([
      'lock/unreadable',
    ]);
  });

  // Drift is not malformation. A policy pinned to yesterday's digest is
  // correct and out of date; reporting it as an error would train adopters
  // to ignore the output.
  it('reports staleness as a warning, not an error', () => {
    const f = checkPolicy({
      policy,
      lock: { ...lock, digest: '000000000000' },
      manifest,
    });
    expect(codes(f)).toContain('lock/digest-stale');
    expect(errorsIn(f)).toEqual([]);
  });

  it('warns when upstream no longer publishes a locked position', () => {
    const f = checkPolicy({
      policy,
      lock: {
        ...lock,
        positions: { ...lock.positions, 'gone-away': 'abc123abc123' },
      },
      manifest,
    });
    expect(codes(f)).toContain('lock/unknown-position');
    expect(errorsIn(f)).toEqual([]);
  });

  it('warns when a rule was built from the note title instead of the claim', () => {
    const p = manifest.positions.find((x) => x.claim)!;
    const swapped = policy.split(p.claim!).join(p.title);
    const f = checkPolicy({ policy: swapped, lock, manifest });
    expect(codes(f)).toContain('policy/claim-absent');
  });
});
