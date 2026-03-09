module.exports = {
  extends: ['../../.eslintrc.base.js'],
  overrides: [
    {
      files: ['src/__tests__/**/*.ts', 'src/__tests__/**/*.tsx'],
      rules: {
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
  ],
};
