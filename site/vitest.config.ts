import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      // Without an explicit include the reporter lists only whatever happened
      // to be instrumented, which hid an entirely untested module (raw.ts).
      // Known limitation: watch/*.mjs is covered by tests/watch-lib.test.ts
      // but cannot appear here — v8 does not instrument outside the project
      // root, and moving the root breaks the site includes.
      include: ['src/lib/**/*.ts'],
      // Informational, not a gate: the five checks already fail closed, and a
      // threshold would add maintenance for no added signal.
      thresholds: undefined,
    },
  },
});
