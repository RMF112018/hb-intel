module.exports = {
  extends: ['../../../.eslintrc.base.js'],
  plugins: ['@hb-intel/hbc'],
  rules: {
    '@hb-intel/hbc/no-direct-fluent-import': 'error',
    '@hb-intel/hbc/enforce-hbc-tokens': 'error',
    '@hb-intel/hbc/no-inline-styles': 'warn',
  },
};
