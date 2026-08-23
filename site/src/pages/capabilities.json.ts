import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { readCapabilities } from '../lib/capabilities';
import { SITE_ORIGIN, SITE_BASE } from '../lib/site-config';

// The capability map, machine-readable. `evidence` says what this project
// knows about a domain; `support` says what it can do for a repository
// adopting it. They are different questions, and a domain can be well
// supported on a single narrow position.
export const GET: APIRoute = async () => {
  const notes = (await getCollection('notes')).map((n) => ({
    id: n.id,
    status: n.data.status,
  }));
  const body = {
    schemaVersion: 1,
    generated: new Date().toISOString().slice(0, 10),
    manifest: `${SITE_ORIGIN}${SITE_BASE}/positions.json`,
    legend: {
      evidence: {
        position: 'A falsifiable position, traced to primary sources.',
        open: 'Carried as an open question. No position.',
        uncovered: 'No position and no open question. Nothing is offered.',
      },
      support: {
        'first-class':
          'A mechanism ships here, validated against a real repository.',
        compatible:
          'A position applies and is stack-agnostic; no mechanism ships.',
        'assessment-only':
          'Named so it is not silently omitted. Nothing beyond the question.',
      },
    },
    capabilities: readCapabilities(notes),
  };
  return new Response(JSON.stringify(body, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
