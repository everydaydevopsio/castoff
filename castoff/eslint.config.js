const globals = require('globals');
const pluginJs = require('@eslint/js');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = [
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
