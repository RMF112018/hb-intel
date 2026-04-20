# Phase 4 Development Plan — UI Foundation & HB Intel Design System - Task 17
**Version:** 2.1
**Supersedes:** PH4-UI-Design-Plan.md V2.0
**Governed by:** HB-Intel-Blueprint-V4.md · CLAUDE.md v1.2
**Date:** March 2026

## 17. Storybook Configuration & Testing

### Storybook Setup — `preview.tsx` **[V2.1 — Field Mode story support]**

```tsx
import type { Preview } from '@storybook/react';
import { FluentProvider } from '@fluentui/react-components';
import { hbcLightTheme, hbcFieldTheme } from '../src/theme';

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'HB Intel theme',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'field', title: 'Field Mode (Dark)' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme === 'field' ? hbcFieldTheme : hbcLightTheme;
      const bg = context.globals.theme === 'field' ? '#0F1419' : '#FAFBFC';
      return (
        <FluentProvider theme={theme}>
          <div style={{ padding: '24px', background: bg, minHeight: '100vh' }}>
            <Story />
          </div>
        </FluentProvider>
      );
    },
  ],
};

export default preview;
```

### Required Story Structure Per Component **[V2.1]**

Every component must export four named stories:

1. **`Default`** — Most common use case with representative props
2. **`AllVariants`** — Every visual variant, size, and state in one view
3. **`FieldMode`** — **[V2.1]** The `Default` story rendered with `hbcFieldTheme` and dark background
4. **`A11yTest`** — Accessibility-focused story with explicit `aria-label` props

### Automated Testing Requirements **[V2.1]**

| Test Type | Tool | Pass Criteria |
|---|---|---|
| Accessibility | `@storybook/addon-a11y` | Zero WCAG 2.2 AA violations on all stories in both themes |
| Contrast (light) | `addon-a11y` | All text ≥ 4.5:1 ratio (normal), ≥ 3:1 (large/icons) |
| Contrast (Field Mode) | `addon-a11y` | All text ≥ 7:1 ratio (target AAA — sunlight visibility requirement) |
| Dual-channel status | Manual review | Every `HbcStatusBadge` variant shows both icon AND color in both themes |
| Animation performance | Browser DevTools | All animations at 60fps on mid-range hardware |
| Bundle size | `vite-bundle-visualizer` | All chunks under 500KB. ECharts in own chunk |
| TypeScript | `tsc --noEmit` | Zero type errors |
| Touch targets | Manual / Storybook controls | Touch density tier: all interactive elements ≥ 56×56px hit area |

<!-- IMPLEMENTATION PROGRESS & NOTES
Phase 4.17 completed: 2026-03-04
- G1: preview.tsx light bg #FFFFFF → #FAFBFC ✓
- G2: parameters.a11y (WCAG 2.2 AA rules) + viewport presets ✓
- G3: HbcHeader +AllVariants, +FieldMode, +A11yTest ✓
- G4: HbcSidebar +Default, +AllVariants, +FieldMode, +A11yTest ✓
- G5: HbcConnectivityBar +AllVariants, +FieldMode ✓
- G6: HbcAppShell +Default, +AllVariants, FieldMode rename, +A11yTest ✓
- G7: DetailLayout +AllVariants, +FieldMode, +A11yTest ✓
- G8: CreateUpdateLayout +Default, +AllVariants, +FieldMode, +A11yTest ✓
- G9: ToolLandingLayout +AllVariants, +FieldMode, +A11yTest ✓
- G10: @storybook/test-runner + axe-playwright + test-runner.ts ✓
- ADR-0031, developer guide created
- Build: zero errors; Lint: zero errors
-->