// The ONLY place the base path and content locations live.
// A future custom domain changes SITE_ORIGIN/SITE_BASE here and nowhere else.
export const SITE_ORIGIN = 'https://jazzli.github.io';
export const SITE_BASE = '/ai-native-sdlc';

// Paths are relative to the site/ project root (process cwd for astro & vitest).
export const CONTENT = {
  questionsDir: '../docs/questions',
  sourcesFile: '../sources.md',
  playbookFile: '../docs/playbook.md',
} as const;
