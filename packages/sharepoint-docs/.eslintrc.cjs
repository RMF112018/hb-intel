module.exports = {
  extends: ['../../.eslintrc.base.js'],
  rules: {
    // Pre-existing: many type-only imports not yet migrated to `import type`
    '@typescript-eslint/consistent-type-imports': 'off',
    // Pre-existing: scaffold-stage code has intentional unused vars across API surface
    '@typescript-eslint/no-unused-vars': 'off',
  },
  overrides: [
    {
      files: ['src/__tests__/**/*.ts', 'src/__tests__/**/*.tsx'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],
};
