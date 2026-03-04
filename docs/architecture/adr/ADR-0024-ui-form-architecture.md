# ADR-0024: UI Form Architecture

**Status:** Accepted
**Date:** 2026-03-04
**Phase:** 4.11
**References:** PH4.11-UI-Design-Plan.md §11, Blueprint §1d

## Context

Phase 4.6 delivered basic form components (HbcForm, HbcFormSection, HbcTextField, HbcSelect, HbcCheckbox). Phase 4.11 needs to add form-level validation state, dirty tracking, error summary, responsive form rows, and a reusable footer component without breaking existing consumers.

## Decisions

### 1. React Context with Noop Defaults

**Decision:** Form context uses `createContext` with noop default functions.

**Rationale:** Fields used outside an HbcForm (e.g., in quick filters or standalone inputs) receive the noop context and continue functioning normally. This avoids the need for null checks or wrapper requirements.

### 2. Backward-Compatible Enhancement

**Decision:** All new props on HbcForm, HbcTextField, HbcSelect, and HbcCheckbox are optional.

**Rationale:** Existing consumers using `<HbcForm onSubmit={fn}>` with no context props continue working identically. Zero migration needed.

### 3. Z-Index Layer at 50

**Decision:** Sticky form footer uses `Z_INDEX.stickyFooter: 50` instead of the spec's z-index 100.

**Rationale:** `Z_INDEX.sidebar` is already 100. Placing the form footer at 50 keeps it above content (0) but below the sidebar, preventing visual conflicts.

### 4. HbcStickyFormFooter is Positioning-Agnostic

**Decision:** The footer component renders buttons and styling but does NOT apply `position: sticky`.

**Rationale:** HbcForm's existing `stickyFooter` wrapper div handles positioning. This separation allows HbcStickyFormFooter to be reused in non-sticky contexts (modals, tearsheets, inline forms).

### 5. HbcFormRow vs HbcFormLayout

**Decision:** HbcFormRow (flex, responsive stacking) coexists with HbcFormLayout (CSS Grid, multi-column).

**Rationale:** Different semantic purposes. FormRow is for placing 2-3 fields side-by-side with automatic mobile stacking. FormLayout is for structured grid layouts with explicit column counts.

### 6. Touch Target via Density Hook

**Decision:** `useFormDensity` wraps `useAdaptiveDensity` to provide `inputMinHeight` per tier (touch: 56px, standard: 36px, compact: 28px).

**Rationale:** Reuses the existing density detection infrastructure from HbcDataTable while providing form-specific sizing. Meets WCAG 2.5.8 Target Size requirements.

### 7. Dropzone Deferred

**Decision:** HbcDropzone (file upload) is deferred to Phase 4.12.

**Rationale:** File upload is a separate concern with its own drag-and-drop, progress, and validation requirements. Keeping it separate reduces Phase 4.11 scope.

## Consequences

- All existing form consumers continue working without changes
- Fields outside HbcForm work identically (noop context)
- Form validation is opt-in per field via `fieldId` + validation callback
- Error summary automatically aggregates field errors with anchor navigation
- Touch targets enforce 56px minimum height on coarse-pointer devices
