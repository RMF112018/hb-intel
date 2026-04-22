module.exports = {
  extends: ['../../../.eslintrc.base.js'],
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
  },
  overrides: [
    {
      files: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/test/**/*.ts', 'src/test/**/*.tsx'],
      rules: {
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],
};
