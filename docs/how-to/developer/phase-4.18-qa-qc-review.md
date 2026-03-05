# Phase 4.18 — QA/QC & Completeness Review Guide

**Phase:** 4.18
**Audience:** Developers
**Purpose:** Document the QA/QC verification process and results for Phase 4 closure

## Overview

Phase 4.18 is a pure verification phase — no new components or features. It cross-references every item in the PH4-UI-Design-Plan.md §20 completion checklist against actual files in the codebase, fixes minor documentation gaps, and formally closes Phase 4.

## Verification Commands

### Build & Lint Baseline

```bash
# Zero TypeScript errors required
pnpm turbo run build --filter=@hbc/ui-kit

# Zero errors required (warnings acceptable)
pnpm turbo run lint --filter=@hbc/ui-kit
```

### Story Export Verification

All 39+ standard Storybook stories must export 4 named exports:
- `Default` — default props rendering
- `AllVariants` — all visual variants side-by-side
- `FieldMode` — Field Mode (dark) theme rendering
- `A11yTest` — accessibility-focused story for axe testing

```bash
# Count story files
find packages/ui-kit/src -name "*.stories.tsx" | wc -l

# Verify 4 exports per story (grep for export pattern)
grep -r "export const Default\|export const AllVariants\|export const FieldMode\|export const A11yTest" \
  packages/ui-kit/src --include="*.stories.tsx" | wc -l
```

### File Count Verification

```bash
# Reference docs (expect 27)
ls docs/reference/ui-kit/*.md | wc -l

# ADR files (expect 16: ADR-0016 through ADR-0031)
ls docs/architecture/adr/ADR-00{16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31}*.md | wc -l

# Developer guides (expect 26+)
ls docs/how-to/developer/*.md | wc -l
```

## §20 Checklist Categories

### 1. Design System (8 items)
Token files in `packages/ui-kit/src/theme/`: `tokens.ts`, `theme.ts`, `typography.ts`, `grid.ts`, `animations.ts`, `elevation.ts`, `density.ts`, `useHbcTheme.ts`, `useConnectivity.ts`, `useDensity.ts`, `README.md`.

### 2. Global Application Shell (12 items)
Shell components in `src/HbcAppShell/` and `src/HbcBottomNav/`. SPFx Application Customizer items are Phase 5 scope.

### 3. Page Layouts (5 items)
Three layout patterns in `src/layouts/` with `useFocusMode` hook.

### 4. Components (28 items)
All component directories under `src/Hbc*/`. Notable: HbcDropzone, HbcTextArea, and HbcRichTextEditor are sub-components of `HbcInput`.

### 5. Saved Views (5 items)
`useSavedViews` hook in `src/HbcDataTable/hooks/`. SharePoint list schema deferred to Phase 5/7.

### 6. Testing (12 items)
WCAG 2.2 AA configured via `@storybook/addon-a11y` parameters. Automated CI testing via `@storybook/test-runner` with axe-playwright.

### 7. Documentation (6 items)
27 component reference docs, 16 ADRs (0016–0031), DESIGN_SYSTEM.md, theme README, NGX tracker.

## ADR Numbering Reference

The §20 checklist uses legacy ADR numbers from the pre-V2.1 plan:

| §20 Reference | Actual ADR | Topic |
|---------------|------------|-------|
| ADR 0008 | ADR-0016 | UI Design System Foundation |
| ADR 0009 | ADR-0027 | Field Mode Implementation |

## Deferred Items

Items in §20 that belong to later phases:

| Item | Phase | Reason |
|------|-------|--------|
| SPFx Application Customizer | 5 | SPFx webpart scope |
| SharePoint rendering | 5 | Requires SharePoint environment |
| `HBIntel_UserViews` list schema | 5/7 | Backend + SharePoint |
| PWA manifest, service worker | 5+ | App-level, not ui-kit |
| Background Sync, Push, Badging | 5+ | App-level PWA APIs |
| Installability banner | 5+ | App-level UX |

## Known Issues

1. **Storybook build:** `build-storybook` fails due to Vite 6 / Storybook 8 incompatibility. Does not affect `storybook dev` or `test-storybook`. Will resolve with future Storybook release.
2. **Lint warnings:** 65 `hbc/enforce-hbc-tokens` warnings on hardcoded hex values in layout and tooltip files. These are non-blocking warnings by design.
