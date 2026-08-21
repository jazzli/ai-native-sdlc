import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const notes = defineCollection({
  loader: glob({ pattern: '*.md', base: '../docs/questions' }),
  schema: z
    .object({
      title: z.string(),
      status: z.enum(['open', 'working-answer', 'parked']),
      updated: z.coerce.date(),
    })
    .strict(), // protocol fixes note frontmatter at exactly these three fields
});

// Playbook, protocol, and the source registry have no frontmatter — loose schema.
const singles = defineCollection({
  loader: glob({
    pattern: [
      'docs/playbook.md',
      'docs/protocol.md',
      'docs/colophon.md',
      'sources.md',
    ],
    base: '..',
  }),
  schema: z.object({}).passthrough(),
});

export const collections = { notes, singles };
