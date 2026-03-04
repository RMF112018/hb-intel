# Phase 4.17 — Storybook Configuration & Testing

**Phase:** 4.17
**Reference:** PH4.17-UI-Design-Plan.md §17, Blueprint §1d

## Overview

Phase 4.17 closes the remaining Storybook gaps after Phase 4.16 (V2.1 finalization):
- Corrected preview background color to `#FAFBFC`
- Added WCAG 2.2 AA global a11y parameters
- Added custom viewport presets (Field Tablet, Field Mobile)
- Standardized all shell and layout stories to 4 required exports
- Added `@storybook/test-runner` with axe-playwright for CI automation

## Story Export Standard

Every non-demo story file must export these 4 named exports:

| Export | Purpose |
|--------|---------|
| `Default` | Primary use case with sensible defaults |
| `AllVariants` | Grid/stack showing all visual states |
| `FieldMode` | Wrapped in `FluentProvider` + `hbcFieldTheme` + `#0F1419` bg |
| `A11yTest` | Keyboard navigation instructions + screen reader verification |

### FieldMode Pattern

```tsx
import { FluentProvider } from '@fluentui/react-components';
import { hbcFieldTheme } from '../theme/theme.js';

export const FieldMode: Story = {
  render: () => (
    <FluentProvider theme={hbcFieldTheme}>
      <div style={{ backgroundColor: '#0F1419', padding: '24px' }}>
        <YourComponent />
      </div>
    </FluentProvider>
  ),
};
```

### A11yTest Pattern

```tsx
export const A11yTest: Story = {
  name: 'A11y Test (Focus + Keyboard)',
  render: () => (
    <div>
      <p style={{ marginBottom: '16px', fontSize: '0.875rem', color: '#605E5C' }}>
        Instructions for keyboard/screen reader testing...
      </p>
      <YourComponent />
    </div>
  ),
};
```

## Running the Test Runner

```bash
# Start Storybook first
pnpm --filter @hbc/ui-kit storybook

# In another terminal, run a11y tests
pnpm --filter @hbc/ui-kit test-storybook
```

The test runner uses axe-playwright to check WCAG 2.2 AA compliance on every story. It runs as part of the CI pipeline.

## Configuration Files

| File | Purpose |
|------|---------|
| `.storybook/preview.tsx` | Global theme decorator, a11y params, viewport presets |
| `.storybook/test-runner.ts` | axe-playwright CI integration |
| `.storybook/main.ts` | Storybook config (addon-a11y registered) |

## Verification

```bash
# Build (zero TS errors)
pnpm turbo run build --filter=@hbc/ui-kit

# Lint (zero errors)
pnpm turbo run lint --filter=@hbc/ui-kit

# Verify all stories have 4 exports
grep -c 'export const Default\|export const AllVariants\|export const FieldMode\|export const A11yTest' \
  packages/ui-kit/src/**/*.stories.tsx
```

## Files Changed

### New
- `.storybook/test-runner.ts` — axe-playwright CI config
- `docs/architecture/adr/ADR-0031-ui-storybook-configuration.md`

### Modified
- `.storybook/preview.tsx` — bg fix + a11y + viewport params
- `package.json` — test-storybook script + deps
- 7 story files — added missing exports (shell + layout stories)
