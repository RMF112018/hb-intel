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

    // PH7.13 T01-D01 — Surface TODO/FIXME/HACK/XXX at lint time.
    // Warn (not error) to avoid immediately blocking CI on existing debt.
    // Reviewers may escalate individual TODOs to errors at PR time.
    'no-warning-comments': ['warn', {
      terms: ['TODO', 'FIXME', 'HACK', 'XXX'],
      location: 'anywhere',
    }],

    // PH7.13 T01-D02 — Require a description when suppressing TypeScript errors.
    // Bare @ts-ignore is an error; @ts-ignore with ≥10-char description is allowed.
    '@typescript-eslint/ban-ts-comment': ['error', {
      'ts-ignore': 'allow-with-description',
      'ts-expect-error': 'allow-with-description',
      'ts-nocheck': true,
      minimumDescriptionLength: 10,
    }],
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
