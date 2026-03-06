# ADR-0042: Form Architecture (D-07)

**Status:** Accepted
**Date:** 2026-03-06
**Phase:** 4b.8 (updated with 4b.15 finalization)

## Context

All data entry forms in HB Intel need standardized validation, dirty tracking, draft persistence, unsaved changes protection, and density-aware sizing. Individual pages should not implement their own form infrastructure.

## Decision

### D-07: Form Component Enforcement
All data entry forms must use `HbcForm`, `HbcFormLayout`, `HbcFormSection`, and `HbcStickyFormFooter`. Raw form elements (`<form>`, `<input>`, `<select>`) are prohibited in page code.

### Draft Persistence (§4b.8.2)
`useFormDraft(formId)` hook in `@hbc/query-hooks` wraps `useFormDraftStore` for auto-save/restore:
- Key format: `"domain:entityId"` (e.g., `risk:new`, `rfi:123`)
- Pages save drafts in `onDirtyChange` callback, restore on mount from `draft`
- Drafts are cleared on submit or cancel
- `@hbc/ui-kit` does NOT depend on `@hbc/query-hooks` — draft wiring is page-level

### Validation Finalization (§4b.15 / HF-007)
- `HbcForm` now provisions centralized `react-hook-form` context with `zodResolver` support.
- `HbcFormContext` now exposes `register`, `handleSubmit`, `formState`, `control`, `setValue`, `getValues`, `watch`, `trigger`, and `reset`.
- `HbcTextField`, `HbcSelect`, and `HbcCheckbox` now run in dual mode:
  - RHF context mode via `name`
  - legacy controlled fallback via `value`/`onChange` (or `checked`/`onChange`)
- Error summary now merges RHF schema errors and legacy inline errors into one centralized banner.
- D-07 enforcement remains strict: all data-entry forms must route validation through `HbcForm` context.

### Draft Consolidation Finalization (§4b.15 / HF-007)
- `useFormDraft` is the consumer-facing integration surface.
- `useFormDraftStore` remains the low-level state container (compatibility maintained).
- RHF-aligned helper methods added to `useFormDraft`:
  - `saveCurrentValues`
  - `restoreDraftValues`
  - `restoreIntoReset`
  - `submitWithDraftClear`

### Unsaved Changes Protection (§4b.8.3)
`HbcFormGuard` component in `@hbc/ui-kit` combines:
- `useUnsavedChangesBlocker` — browser `beforeunload` protection
- `HbcConfirmDialog` — in-app "Unsaved Changes" warning dialog
- `HbcFormGuardContext` — exposes `setShowPrompt` for router blocker integration

### Density Integration (§4b.8.5)
- `useFormDensity` now delegates to canonical `useDensity()` from `theme/useDensity.ts`
- Replaces previous `useAdaptiveDensity` from DataTable (inconsistency resolved)
- `CreateUpdateLayout` applies density-aware footer height and content padding:
  - `touch`: 64px footer, 32px padding
  - `comfortable`: 56px footer, 24px padding
  - `compact`: 48px footer, 24px padding

## Consequences

- Consistent form behavior across all data entry pages
- Automatic draft persistence without page-level boilerplate
- Unsaved changes protection with a single wrapper component
- Form density aligns with shell-level density system
- No circular dependency: `@hbc/ui-kit` stays independent of `@hbc/query-hooks`

## Files Changed

| File | Change |
|------|--------|
| `packages/query-hooks/src/stores/useFormDraft.ts` | New hook wrapping useFormDraftStore |
| `packages/ui-kit/src/HbcForm/HbcFormGuard.tsx` | New unsaved changes guard component |
| `packages/ui-kit/src/HbcForm/hooks/useFormDensity.ts` | Switched to canonical useDensity |
| `packages/ui-kit/src/layouts/CreateUpdateLayout.tsx` | Density-aware footer and content |
| `docs/how-to/developer/phase-4b.8-form-architecture-guide.md` | New how-to guide |
| `packages/ui-kit/src/HbcForm/HbcFormContext.tsx` | HF-007 centralized RHF validation API exposure |
| `packages/ui-kit/src/HbcForm/HbcForm.tsx` | zodResolver + RHF submit orchestration + merged summary errors |
| `packages/ui-kit/src/HbcForm/HbcTextField.tsx` | RHF/controller mode + controlled fallback |
| `packages/ui-kit/src/HbcForm/HbcSelect.tsx` | RHF/controller mode + controlled fallback |
| `packages/ui-kit/src/HbcForm/HbcCheckbox.tsx` | RHF/controller mode + controlled fallback |
| `packages/ui-kit/src/HbcForm/HbcForm.stories.tsx` | Schema validation + draft workflow example |
