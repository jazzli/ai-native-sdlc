import { describe, it, expect } from 'vitest';
import { rawRewritten } from '../src/lib/raw';

// raw.ts backs every /*.md endpoint — the agent-ingestible half of the site.
// It was at 0% coverage until the reporter was configured to show it.
describe('rawRewritten', () => {
  it('preserves frontmatter and rewrites citations to site URLs', async () => {
    const out = await rawRewritten(
      '../docs/questions/does-sdd-reduce-rework.md',
    );
    expect(out).toMatch(/^---\n/);
    expect(out).toContain('title:');
    expect(out).toContain('/ai-native-sdlc/sources/#');
    expect(out).not.toContain('](../../sources.md#');
  });

  it('rewrites the playbook’s note links', async () => {
    const out = await rawRewritten('../docs/playbook.md');
    expect(out).toContain('/ai-native-sdlc/positions/');
    expect(out).not.toContain('](questions/');
  });

  it('propagates the fail-closed throw on an unresolvable reference', async () => {
    await expect(
      rawRewritten('../docs/questions/nonexistent-note.md'),
    ).rejects.toThrow();
  });
});
