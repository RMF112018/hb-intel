/**
 * ESLint configuration — packages/ui-kit (permissive)
 * PH4B.11 §4b.11.3 — ui-kit IS the implementation layer
 *
 * Most enforcement rules are off here because ui-kit wraps Fluent UI,
 * defines spinners, feedback components, and uses inline styles internally.
 * Only enforce-hbc-tokens remains active (warn) to catch hardcoded hex values.
 *
 * @see docs/architecture/adr/ADR-0045-component-consumption-enforcement.md
 */
module.exports = {
  extends: ['../../.eslintrc.base.js'],
  plugins: ['@hb-intel/hbc'],
  rules: {
    '@hb-intel/hbc/no-direct-fluent-import': 'off',
    '@hb-intel/hbc/no-inline-styles': 'off',
    '@hb-intel/hbc/no-raw-form-elements': 'off',
    '@hb-intel/hbc/no-direct-spinner': 'off',
    '@hb-intel/hbc/no-inline-feedback': 'off',
    'no-restricted-imports': [
      'warn',
      {
        paths: [
          {
            name: '@fluentui/react-theme',
            message:
              'Do not import from @fluentui/react-theme directly. Use HBC design tokens from @hb-intel/ui-kit/theme instead.',
          },
        ],
      },
    ],
  },
  overrides: [
    {
      files: ['src/**/*.ts', 'src/**/*.tsx'],
      excludedFiles: [
        'src/theme/**',
        'src/icons/**',
        '*.stories.tsx',
      ],
      rules: {
        '@hb-intel/hbc/enforce-hbc-tokens': 'warn',
      },
    },
  ],
};
