// Generates the GitHub repository social preview card: the image shown when a
// link to the repository is shared. The site's own Open Graph cards are built
// per page and served from /og/; this one is not served at all, because GitHub
// holds it as a repository setting uploaded by hand. Keeping the source here
// makes it reproducible and reviewable rather than existing only in a settings
// page nobody can diff.
//
//   npm run social-preview      writes ../.github/social-preview.png
import fs from 'node:fs';
import path from 'node:path';
import { renderCard } from '../src/lib/og-card.ts';

const png = await renderCard(
  {
    kind: 'page',
    title: 'AI-Native SDLC',
    subtitle:
      'Evidence-tiered positions on building software with AI agents. Every position states what would overturn it.',
  },
  // GitHub's stated recommendation for the social preview.
  { width: 1280, height: 640 },
);
const out = path.resolve(process.cwd(), '../.github/social-preview.png');
fs.writeFileSync(out, png);
console.log(`${out} — ${(png.length / 1024).toFixed(0)} KB, 1280x640`);
