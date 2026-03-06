# @hb-intel/eslint-plugin-hbc

ESLint plugin for HBC Design System component consumption enforcement.

Implements 11 rules that mechanically enforce the binding design decisions (D-01 through D-10) from the HB Intel UI Design Plan. All page-level imports in `apps/` must resolve exclusively to `@hb-intel/ui-kit`.

## Rules

| Rule | Decision | Default | Description |
|------|----------|---------|-------------|
| `no-direct-fluent-import` | D-10 | error | Blocks direct `@fluentui/*` imports |
| `enforce-hbc-tokens` | D-05 | error | Detects hardcoded hex color values |
| `require-workspace-page-shell` | D-01 | error | Requires WorkspacePageShell in `*Page.tsx` files |
| `no-manual-nav-active` | D-04 | error | Blocks `setActiveNavItem()` calls |
| `no-raw-form-elements` | D-07 | error | Blocks raw `<input>`, `<select>`, `<textarea>` |
| `require-layout-variant` | D-02 | error | Requires `layout` prop on WorkspacePageShell |
| `no-inline-styles` | D-10 | warn | Discourages inline `style` props |
| `no-inline-feedback` | D-08 | warn | Discourages raw Alert/MessageBar components |
| `no-page-breakpoints` | D-09 | warn | Discourages manual `@media`/`matchMedia` usage |
| `no-direct-spinner` | D-06 | warn | Discourages direct Spinner usage |
| `no-direct-buttons-in-content` | D-03 | warn | Blocks buttons as direct WorkspacePageShell children |

## Usage

Add to your workspace `.eslintrc.cjs`:

```js
module.exports = {
  extends: ['../../.eslintrc.base.js'],
  plugins: ['@hb-intel/hbc'],
  rules: {
    '@hb-intel/hbc/no-direct-fluent-import': 'error',
    '@hb-intel/hbc/enforce-hbc-tokens': 'error',
    '@hb-intel/hbc/require-workspace-page-shell': 'error',
    '@hb-intel/hbc/no-manual-nav-active': 'error',
    '@hb-intel/hbc/no-raw-form-elements': 'error',
    '@hb-intel/hbc/require-layout-variant': 'error',
    '@hb-intel/hbc/no-inline-styles': 'warn',
    '@hb-intel/hbc/no-inline-feedback': 'warn',
    '@hb-intel/hbc/no-page-breakpoints': 'warn',
    '@hb-intel/hbc/no-direct-spinner': 'warn',
    '@hb-intel/hbc/no-direct-buttons-in-content': 'warn',
  },
};
```

For `packages/ui-kit/` (permissive — ui-kit wraps Fluent UI):

```js
rules: {
  '@hb-intel/hbc/no-direct-fluent-import': 'off',
  '@hb-intel/hbc/no-inline-styles': 'off',
  '@hb-intel/hbc/no-raw-form-elements': 'off',
  '@hb-intel/hbc/no-direct-spinner': 'off',
  '@hb-intel/hbc/no-inline-feedback': 'off',
}
```

## Testing

```bash
node --test tests/rules/*.test.js
```

## References

- PH4B.11-UI-Design-Plan.md §14
- PH4B-UI-Design-Plan.md v1.2 §§2, 14, 16, 17 (D-10)
- ADR-0045-component-consumption-enforcement.md
- ADR-0034-audit-remediation.md
