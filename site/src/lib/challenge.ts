import { SITE_ORIGIN, SITE_BASE } from './site-config';

const REPO = 'https://github.com/jazzli/ai-native-sdlc';

export interface ChallengeSpec {
  title: string;
  slug: string;
  kind: 'positions' | 'questions';
  status: string;
  updated: string;
}

// Builds a pre-filled GitHub issue so a reader who disagrees lands in a form
// that already names the position. Reader challenges are an intake path into
// the same signal filter every other source passes through.
export function challengeUrl(spec: ChallengeSpec): string {
  const page = `${SITE_ORIGIN}${SITE_BASE}/${spec.kind}/${spec.slug}/`;
  const body = [
    `**Position:** [${spec.title}](${page})`,
    `**As published:** ${spec.status}, updated ${spec.updated}`,
    '',
    '**The evidence** (a primary source is most useful — a link, and what it measures):',
    '',
    '',
    '**Which stated falsifier it speaks to, if any:**',
    '',
    '',
    '---',
    'Challenges enter the same filter as every other source: does it publish',
    'methodology? does it report null results? is it primary? A challenge that',
    'moves a position becomes a registry entry and a changelog line.',
  ].join('\n');

  const q = new URLSearchParams({
    labels: 'challenge',
    title: `Challenge: ${spec.title}`,
    body,
  });
  return `${REPO}/issues/new?${q}`;
}
