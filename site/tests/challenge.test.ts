import { describe, it, expect } from 'vitest';
import { challengeUrl } from '../src/lib/challenge';

const spec = {
  title: 'Does spec-driven development actually reduce rework?',
  slug: 'does-sdd-reduce-rework',
  kind: 'positions' as const,
  status: 'working-answer',
  updated: '2026-08-21',
};

describe('challengeUrl', () => {
  it('targets the repo issue form with the challenge label', () => {
    const u = challengeUrl(spec);
    expect(
      u.startsWith('https://github.com/jazzli/ai-native-sdlc/issues/new?'),
    ).toBe(true);
    expect(u).toContain('labels=challenge');
  });

  it('pre-fills the title and links the live position page', () => {
    const p = new URL(challengeUrl(spec)).searchParams;
    expect(p.get('title')).toBe(`Challenge: ${spec.title}`);
    expect(p.get('body')).toContain(
      'https://jazzli.github.io/ai-native-sdlc/positions/does-sdd-reduce-rework/',
    );
    expect(p.get('body')).toContain('working-answer, updated 2026-08-21');
  });

  it('routes open questions to the questions path', () => {
    const p = new URL(
      challengeUrl({
        ...spec,
        kind: 'questions',
        slug: 'agent-era-observability',
      }),
    ).searchParams;
    expect(p.get('body')).toContain('/questions/agent-era-observability/');
  });

  it('encodes titles containing URL metacharacters', () => {
    const u = challengeUrl({ ...spec, title: 'A&B? 100% — is it "x"' });
    expect(new URL(u).searchParams.get('title')).toBe(
      'Challenge: A&B? 100% — is it "x"',
    );
  });

  it('states the filter so the challenge arrives with the bar visible', () => {
    expect(new URL(challengeUrl(spec)).searchParams.get('body')).toContain(
      'same filter',
    );
  });
});
