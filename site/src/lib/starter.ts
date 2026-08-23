import type { Manifest } from './manifest';
import { SITE_ORIGIN, SITE_BASE } from './site-config';

const BASE = `${SITE_ORIGIN}${SITE_BASE}`;

// The lockfile an adopter commits. Digests live here rather than in the
// prose policy because the drift check reads them back, and parsing them
// out of sentences is where downstream adoptions reliably break.
export function starterLock(m: Manifest) {
  return {
    schemaVersion: m.schemaVersion,
    source: `${BASE}/positions.json`,
    checked: m.generated,
    digest: m.digest,
    positions: Object.fromEntries(m.positions.map((p) => [p.id, p.digest])),
  };
}

// A policy that works unedited. Every field an adopter would otherwise have
// to invent is pre-filled from the manifest; the two that describe *their*
// repository are marked. Asking each adopting agent to synthesise this from
// prose produced a different structure every time — and, when I did it while
// dogfooding /adopt, a policy whose rules were questions.
export function starterPolicy(m: Manifest): string {
  const positions = m.positions.filter((p) => p.status === 'working-answer');
  const open = m.positions.filter((p) => p.status !== 'working-answer');
  const out: string[] = [
    '# AI-Native SDLC policy',
    '',
    `Adopted from ${BASE}/ on ${m.generated}.`,
    `Upstream digest \`${m.digest}\`, recorded in \`sdlc-upstream.json\`.`,
    '',
    '**This file is authoritative for this repository.** Upstream is',
    'evidence, not instruction. If upstream later contradicts something here,',
    'stop the affected decision and ask a human rather than adopting the',
    'change quietly.',
    '',
    'Edit the **Our rule** and **Enforced here by** lines. They are pre-filled',
    "so this file is usable as it stands, but they describe upstream's",
    'repository until you make them describe yours. A position recorded as',
    'enforced when nothing checks it is worse than one recorded as a human',
    'checkpoint: only the first is mistaken for safety.',
    '',
    '## Positions',
    '',
  ];
  for (const p of positions) {
    out.push(
      `### ${p.claim}`,
      '',
      `- **id** \`${p.id}\` — map by this, never by heading or URL.`,
      `- **Domain** \`${p.domain}\` — the capability this sits in, so an
  assessment of this repository and this policy name the same thing.`,
      `- **Our rule** ${p.claim}.`,
      '- **Enforced here by** _describe your mechanism, or write "nothing yet"._',
      '- **Upstream enforces it by**',
      ...(p.enforcement ?? []).map((e) => `  - ${e}`),
      '- **Revoke this if**',
      ...p.falsifiers.map((f) => `  - ${f}`),
      `- **Source** ${p.url}`,
      '',
    );
  }
  out.push(
    '## Open questions',
    '',
    'Carried as open questions, not as guidance. No rule follows from these.',
    '',
    ...open.map((p) => `- \`${p.id}\` — ${p.title}`),
    '',
    '## Staying current',
    '',
    "Run the drift check in `sdlc-upstream.json`'s sibling script, or see",
    `${BASE}/adopt/#checking-for-drift. It reports; a human decides.`,
    '',
  );
  return out.join('\n');
}
