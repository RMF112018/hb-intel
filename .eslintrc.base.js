/**
 * Root ESLint configuration — HB Intel monorepo
 * Phase 4b.6 §9 — Theme & Token Enforcement
 *
 * Includes @hb-intel/eslint-plugin-hbc for D-05 (token enforcement),
 * D-10 (import enforcement), and D-03 (command bar enforcement).
 *
 * @see PH4B.6-UI-Design-Plan.md §9 task 4b.6.3
 * @see PH4B-UI-Design-Plan.md §2 (binding decisions D-05, D-10)
 * @type {import('eslint').Linter.Config}
 */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', '@hb-intel/hbc'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  env: {
    browser: true,
    node: true,
    es2022: true,
  },
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/consistent-type-imports': 'warn',
  },
  overrides: [
    {
      // D-05: Token enforcement — all color, spacing, typography, shadow from tokens only
      // D-10: Import enforcement — no direct @fluentui/react-components in app code
      files: ['apps/**/*.ts', 'apps/**/*.tsx'],
      rules: {
        '@hb-intel/hbc/enforce-hbc-tokens': 'error',
        '@hb-intel/hbc/no-direct-fluent-import': 'error',
        '@hb-intel/hbc/require-feature-registration-contract': 'error',
      },
    },
  ],
  ignorePatterns: ['dist/', 'node_modules/', 'coverage/', '*.js', '*.cjs'],
};
