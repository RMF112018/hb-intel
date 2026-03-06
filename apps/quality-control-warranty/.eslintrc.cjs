/**
 * ESLint configuration — Component Consumption Enforcement
 * PH4B.11 §4b.11.3 — Binding decision D-10
 *
 * All 10 enforcement rules active. Error-level rules block CI.
 * Pages must import exclusively from @hb-intel/ui-kit.
 *
 * @see docs/architecture/adr/ADR-0045-component-consumption-enforcement.md
 */
module.exports = {
  extends: ['../../.eslintrc.base.js'],
  plugins: ['@hb-intel/hbc'],
  rules: {
    '@hb-intel/hbc/no-direct-fluent-import': 'error',
    '@hb-intel/hbc/enforce-hbc-tokens': 'error',
    '@hb-intel/hbc/no-inline-styles': 'warn',
    '@hb-intel/hbc/require-workspace-page-shell': 'error',
    '@hb-intel/hbc/no-manual-nav-active': 'error',
    '@hb-intel/hbc/no-inline-feedback': 'warn',
    '@hb-intel/hbc/no-raw-form-elements': 'error',
    '@hb-intel/hbc/require-layout-variant': 'error',
    '@hb-intel/hbc/no-page-breakpoints': 'warn',
    '@hb-intel/hbc/no-direct-spinner': 'warn',
    '@hb-intel/hbc/no-direct-buttons-in-content': 'warn',
  },
};
