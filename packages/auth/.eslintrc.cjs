module.exports = {
  extends: ['../../.eslintrc.base.js'],
  rules: {
    // D-PH5C-08: enforce alignment markers on critical auth/shell integration files.
    'alignment-markers': [
      'warn',
      {
        requiredFiles: [
          'packages/shell/src/ShellCore.tsx',
          'src/stores/authStore.ts',
          'src/guards/guardResolution.ts',
          'src/adapters/sessionNormalization.ts',
        ],
        markerPattern: 'ALIGNMENT:.*(?:PH5C|D-PH5C-\\d{2})',
      },
    ],
  },
};
