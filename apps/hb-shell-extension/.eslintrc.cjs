/**
 * ESLint configuration — hb-shell-extension (Lane B: Shell Extension Product)
 *
 * Extends the monorepo base and adds shell-extension-specific import guardrails.
 * Shell-extension surfaces must use @hbc/ui-kit/app-shell as their primary UI
 * entry point — not the broad @hbc/ui-kit root or @hbc/ui-kit/homepage.
 *
 * Allowed entry points:
 *   @hbc/ui-kit/app-shell — shell chrome components
 *   @hbc/ui-kit/theme     — token-only imports when needed
 *   @hbc/ui-kit/icons     — icon-only imports when needed
 *
 * Prohibited entry points:
 *   @hbc/ui-kit            — full library (exceeds bundle budget, breaks governance)
 *   @hbc/ui-kit/homepage   — homepage-specific surface (belongs to Lane A only)
 *
 * @see docs/reference/ui-kit/entry-points.md
 * @see docs/reference/sharepoint-homepage-shell-boundaries.md
 */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
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
    'no-restricted-imports': ['error', {
      paths: [
        {
          name: '@hbc/ui-kit',
          message: 'Shell-extension surfaces must import from @hbc/ui-kit/app-shell, not the full @hbc/ui-kit entry point.',
        },
        {
          name: '@hbc/ui-kit/homepage',
          message: 'Shell-extension surfaces must not import from @hbc/ui-kit/homepage. The homepage entry point belongs to Lane A (apps/hb-webparts).',
        },
      ],
    }],
  },
  ignorePatterns: ['dist/', 'node_modules/', 'coverage/', '*.js', '*.cjs'],
};
