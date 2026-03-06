# ADR-0049: Form Validation Architecture Finalization (HF-007 / D-07)

**Status:** Accepted  
**Date:** 2026-03-06  
**Phase:** 4b.15

## Context

Phase 4b.8 established `HbcForm` primitives and draft persistence patterns, but HF-007 required finalization of centralized validation architecture. D-07 mandates that every data-entry form use `HbcForm` with centralized validation instead of page-specific validation plumbing.

## Decision

1. `HbcForm` is now the centralized validation boundary and provisions `react-hook-form` APIs through `HbcFormContext`.
2. `zodResolver` integration is implemented in `HbcForm`, with support for explicit `resolver` override.
3. `HbcTextField`, `HbcSelect`, and `HbcCheckbox` use a dual-mode contract:
   - RHF mode when `name` is provided inside `HbcForm`
   - legacy controlled fallback for migration compatibility.
4. Error summary consolidates RHF schema errors and legacy inline errors into one banner.
5. Draft consolidation keeps both store + hook but standardizes `useFormDraft` as the consumer-facing API, while `useFormDraftStore` remains low-level.

## Public API Shape

- `HbcForm` props now include: `schema`, `resolver`, `defaultValues`, `onValidSubmit` (with legacy `onSubmit` retained).
- `HbcFormContext` now exposes:
  - `register`, `handleSubmit`, `formState`, `control`, `setValue`, `getValues`, `watch`, `trigger`, `reset`
  - existing field registry/error helpers for summary labeling/focus.
- `useFormDraft` now includes RHF-aligned helpers:
  - `saveCurrentValues`
  - `restoreDraftValues`
  - `restoreIntoReset`
  - `submitWithDraftClear`

## Migration Strategy

- Existing forms continue to work through the controlled fallback path.
- New/remediated forms should use `name` + schema-driven `HbcForm` validation.
- Teams can migrate incrementally without forcing immediate page-wide RHF rewrites.

## Consequences

### Positive
- D-07 enforcement is concrete and centralized.
- Validation behavior and error rendering are consistent across form primitives.
- Draft workflows align with RHF submit/reset flows while preserving existing keys and behavior.

### Risks
- Dual-mode complexity is higher than RHF-only architecture.
- Inconsistent usage (`name` omitted on new fields) can bypass centralized validation until lint/pattern enforcement is tightened.

## Verification Evidence

- `pnpm turbo run build`
- `pnpm turbo run type-check`
- `pnpm turbo run lint`
- Storybook verification for `HbcForm` stories including schema + draft scenario.
