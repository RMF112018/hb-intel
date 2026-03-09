module.exports = {
  extends: ['../../.eslintrc.base.js'],
  rules: {
    // env.d.ts triple-slash reference is required for ambient type declarations
    '@typescript-eslint/triple-slash-reference': 'off',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
  },
  overrides: [
    {
      files: ['src/__tests__/**/*.ts', 'src/__tests__/**/*.tsx', 'src/**/__tests__/**/*.ts', 'src/**/__tests__/**/*.tsx'],
      rules: {
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],
};
