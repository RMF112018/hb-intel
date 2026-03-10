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

## `no-stub-implementations`

**Added:** PH7.13 (2026-03-10)
**Severity:** `error` on source files; not applied to test files or `tools/mocks/`
**ADR:** ADR-0095

Detects `throw new Error(msg)` statements where the error message matches a stub or
not-implemented pattern, indicating that a function body has not been implemented.

### Detected Patterns

```js
throw new Error('not implemented');         // ❌ error
throw new Error('Not yet implemented');      // ❌ error
throw new Error('stub — replace this');      // ❌ error
throw new Error('placeholder');              // ❌ error
throw new Error(`TODO: implement ${name}`);  // ❌ error
```

### Escape Hatch: `stub-approved`

Intentional stubs that are durably deferred may be exempted by adding a
`// stub-approved: <non-empty reason>` comment on the line immediately preceding
the stub throw:

```typescript
// stub-approved: pending SF04 @hbc/acknowledgment T07 activation — tracked backlog #42
throw new Error('not implemented');  // ✅ no error — exempted by stub-approved comment
```

The reason must be non-empty. A blank `// stub-approved:` comment does not satisfy the
escape hatch and will still produce an error.

### Exclusions

The rule is not applied to:
- `**/*.test.ts`, `**/*.test.tsx`, `**/*.spec.ts`, `**/*.spec.tsx` — test files
- `**/*.stories.tsx` — Storybook story files
- `tools/mocks/**` — SPFx SDK mocks (globally exempt per ADR-0095 D-06)
- `**/testing/**` — testing sub-path utilities

### Developer Tool

Use `pnpm scan-stubs` to scan the codebase locally for unapproved stubs.
Use `pnpm scan-stubs:all` to also list all `stub-approved` entries for inventory review.

See: `docs/architecture/plans/ph7-remediation/PH7.13-Stub-Detection-Enforcement.md`
