module.exports = {
  extends: ['../../.eslintrc.base.js'],
  plugins: ['hbc'],
  rules: {
    'no-restricted-imports': [
      'warn',
      {
        paths: [
          {
            name: '@fluentui/react-theme',
            message:
              'Do not import from @fluentui/react-theme directly. Use HBC design tokens from @hbc/ui-kit/theme instead.',
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
        'src/lint/**',
        '*.stories.tsx',
      ],
      rules: {
        'hbc/enforce-hbc-tokens': 'warn',
      },
    },
  ],
};
