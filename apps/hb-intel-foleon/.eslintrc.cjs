module.exports = {
  extends: ['../../.eslintrc.base.js'],
  plugins: ['@hb-intel/hbc'],
  rules: {
    '@hb-intel/hbc/no-direct-fluent-import': 'error',
    '@hb-intel/hbc/enforce-hbc-tokens': 'warn',
    '@hb-intel/hbc/no-inline-styles': 'warn',
    '@hb-intel/hbc/no-direct-spinner': 'warn',
    '@hb-intel/hbc/no-direct-buttons-in-content': 'warn',
  },
};
