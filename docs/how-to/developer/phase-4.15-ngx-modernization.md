# Phase 4.15 — NGX Modernization Developer Guide

**Phase:** 4.15 | **Reference:** PH4.15-UI-Design-Plan.md §15

## Overview

Phase 4.15 enforces "Build Modern From Day One" via automated ESLint rules, mandatory Storybook coverage, and the DESIGN_SYSTEM.md authoring guide. This guide explains how to work with these enforcement mechanisms.

## ESLint: enforce-hbc-tokens Rule

### What It Does

The `hbc/enforce-hbc-tokens` rule warns when you use hardcoded hex color values (e.g., `#004B87`) in component source files. Use HBC design tokens instead.

### How to Run

```bash
# Lint the ui-kit package
pnpm turbo run lint --filter=@hbc/ui-kit

# Or directly
cd packages/ui-kit && pnpm lint
```

### Fixing Warnings

Replace hardcoded hex values with token imports:

```tsx
// Before (triggers warning)
const styles = makeStyles({ root: { color: '#004B87' } });

// After (correct)
import { HBC_COLORS } from '../theme/tokens.js';
const styles = makeStyles({ root: { color: HBC_COLORS.primary } });
```

### Excluded Files

The rule does not apply to:
- `src/theme/**` — Token definition files (source of truth for hex values)
- `src/icons/**` — SVG icon components
- `src/lint/**` — Lint rule source code
- `*.stories.tsx` — Storybook story files

## No-Restricted-Imports

Direct imports from `@fluentui/react-theme` are blocked. Use the HBC token layer:

```tsx
// ❌ Blocked
import { tokens } from '@fluentui/react-theme';

// ✅ Correct
import { hbcLightTheme, hbcFieldTheme } from '../theme/index.js';
```

## Storybook Compliance

### Required Exports

Every core component story must export these four:

| Export | Description |
|---|---|
| `Default` | Primary usage with minimal props |
| `AllVariants` | Visual grid of representative configurations |
| `FieldMode` | Dark theme with `hbcFieldTheme` + `#0F1419` background |
| `A11yTest` | Accessibility description + rendered component |

### Adding AllVariants

Show representative prop combinations, not exhaustive permutations:

```tsx
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <YourComponent variant="primary" />
      <YourComponent variant="secondary" />
      <YourComponent variant="ghost" disabled />
    </div>
  ),
};
```

### Adding FieldMode

Wrap in `FluentProvider` with `hbcFieldTheme`:

```tsx
export const FieldMode: Story = {
  render: () => (
    <FluentProvider theme={hbcFieldTheme}>
      <div style={{ padding: 24, backgroundColor: '#0F1419' }}>
        <YourComponent />
      </div>
    </FluentProvider>
  ),
};
```

### Adding A11yTest

Include instructional text about ARIA roles and keyboard behavior:

```tsx
export const A11yTest: Story = {
  render: () => (
    <div>
      <p style={{ fontSize: '0.875rem', color: '#605E5C', marginBottom: '16px' }}>
        Component uses role="button". Tab to focus, Enter/Space to activate.
      </p>
      <YourComponent />
    </div>
  ),
};
```

## DESIGN_SYSTEM.md

The complete authoring rules are in `packages/ui-kit/DESIGN_SYSTEM.md`. Read it before creating new components. Key rules:

1. All colors from design tokens
2. No external color/spacing imports
3. Four mandatory Storybook exports
4. Test in both light and field themes
5. `Hbc` prefix naming convention
6. WCAG 2.2 AA minimum, AAA for Field Mode
7. 44px min touch targets (56px in field mode)

## Verification

After making changes:

```bash
pnpm install                                    # Link local plugin
pnpm turbo run build --filter=@hbc/ui-kit       # Zero TypeScript errors
pnpm turbo run lint --filter=@hbc/ui-kit        # Check ESLint warnings
```
