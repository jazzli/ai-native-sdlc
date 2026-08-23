import tseslint from 'typescript-eslint';
import eslintPluginAstro from 'eslint-plugin-astro';

export default [
  { ignores: ['dist/', '.astro/', 'node_modules/', 'coverage/'] },
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
];
