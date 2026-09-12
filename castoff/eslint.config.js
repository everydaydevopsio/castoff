import globals from 'globals';
import pluginJs from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default [
  { files: ['**/*.{js,mjs,cjs}'] },
  { languageOptions: { globals: globals.node } },
  {
    files: ['**/*.test.js'],
    languageOptions: { globals: { ...globals.node, ...globals.jest } }
  },
  pluginJs.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    rules: {
      'no-console': 'warn'
    }
  },
  {
    ignores: ['node_modules', 'dist', 'coverage']
  }
];
