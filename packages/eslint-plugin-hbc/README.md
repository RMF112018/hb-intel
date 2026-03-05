# @hbc/eslint-plugin-hbc

ESLint plugin for HBC Design System token and component enforcement.

## Rules

### `@hbc/hbc/enforce-hbc-tokens`

Warns on hardcoded hex color string literals (e.g., `#FF0000`). Use HBC design tokens from `@hbc/ui-kit/theme` instead.

## Usage

Add to your `.eslintrc.cjs`:

```js
module.exports = {
  plugins: ['@hbc/hbc'],
  rules: {
    '@hbc/hbc/enforce-hbc-tokens': 'warn',
  },
};
```

## References

- PH4B-UI-Design-Audit-Remeditation-Plan SS3.1 F-004
- ADR-0034
