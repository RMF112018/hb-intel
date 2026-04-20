# HB-Intel — Phase 4b: UI Design Implementation Plan Task 8
### Comprehensive UI Kit + Shell Integration

**Version:** 1.0
**Date:** March 5, 2026
**Depends On:** Phase 4 (UI Kit component build — partially complete)
**Objective:** Deliver a fully wired UI Kit and Shell such that any page built to the system is guaranteed to render correctly according to HBC design specifications — with zero design decisions required from the page author.

---

## Table of Contents

1. [Objective & Success Criteria](#1-objective--success-criteria)
2. [Architectural Decisions (Binding Constraints)](#2-architectural-decisions-binding-constraints)
3. [Prerequisites & Audit Remediation](#3-prerequisites--audit-remediation)
4. [Phase 4b.1 — Build & Packaging Foundation](#4-phase-4b1--build--packaging-foundation)
5. [Phase 4b.2 — Shell Completion & WorkspacePageShell](#5-phase-4b2--shell-completion--workspacepageshell)
6. [Phase 4b.3 — Layout Variant System](#6-phase-4b3--layout-variant-system)
7. [Phase 4b.4 — Command Bar & Page Actions](#7-phase-4b4--command-bar--page-actions)
8. [Phase 4b.5 — Navigation & Active State](#8-phase-4b5--navigation--active-state)
9. [Phase 4b.6 — Theme & Token Enforcement](#9-phase-4b6--theme--token-enforcement)
10. [Phase 4b.7 — Data Loading & State Handling](#10-phase-4b7--data-loading--state-handling)
11. [Phase 4b.8 — Form Architecture](#11-phase-4b8--form-architecture)
12. [Phase 4b.9 — Notifications & Feedback](#12-phase-4b9--notifications--feedback)
13. [Phase 4b.10 — Mobile & Field Mode](#13-phase-4b10--mobile--field-mode)
14. [Phase 4b.11 — Component Consumption Enforcement](#14-phase-4b11--component-consumption-enforcement)
15. [Phase 4b.12 — Integration Verification & Acceptance](#15-phase-4b12--integration-verification--acceptance)
16. [Developer Playbook](#16-developer-playbook)
17. [Completion Criteria](#17-completion-criteria)

---

## 1. Objective & Success Criteria

### Primary Objective

Deliver a fully wired UI Kit and Shell such that **any page built to the system is guaranteed to render correctly according to HBC design specifications** — with zero design decisions required from the page author.

### What "Guaranteed to Render Correctly" Means

A page is guaranteed when all of the following are true without any effort from the page author:

- ✅ It appears inside the correct shell frame (header, sidebar, content area)
- ✅ It uses a named layout variant appropriate to its purpose
- ✅ Its action buttons appear in the correct command bar zone
- ✅ Its sidebar navigation item is highlighted automatically
- ✅ Its colors, spacing, and typography come from HBC design tokens only
- ✅ Its loading, empty, and error states render consistently
- ✅ Its forms follow the standard validation and submission pattern
- ✅ Its feedback (save, delete, error) triggers a consistent toast notification
- ✅ It adapts correctly between office desktop and field mobile contexts
- ✅ It uses only `@hb-intel/ui-kit` components — never raw HTML or direct Fluent UI imports

### Success Metrics

| Metric | Target |
|--------|--------|
| Pages using `WorkspacePageShell` | 100% of all workspace pages |
| Pages using a named layout variant | 100% |
| Token violations in CI | 0 |
| Direct `@fluentui/react-components` imports in `apps/` | 0 |
| Components with Storybook stories | 100% (44/44) |
| Components with reference documentation | 100% (44/44) |
| Loading/error state handled by shell | 100% of data pages |
| Build artifact contamination in `src/` | 0 files |

---

## 2. Architectural Decisions (Binding Constraints)

These 10 decisions were established through the Phase 4b design interview and are **binding constraints** for all implementation work. They are not subject to re-evaluation during implementation without a formal ADR update.

| # | Decision | Binding Rule |
|---|----------|-------------|
| **D-01** | Shell enforcement model | Every page **must** use `WorkspacePageShell` as its outer container. Direct rendering without the shell is prohibited. |
| **D-02** | Layout variant system | Every page **must** declare one of the named layout variants: `dashboard`, `form`, `detail`, or `landing`. No free-composition inside the wrapper. |
| **D-03** | Command bar zone | All page actions **must** be passed to the shell's command bar zone via the `actions` prop on `WorkspacePageShell`. Direct button placement outside the command bar is prohibited. |
| **D-04** | Navigation active state | Active sidebar state **must** be derived automatically from the router. Pages must never manually set active nav state. |
| **D-05** | Token enforcement | All color, spacing, typography, and shadow values **must** come from `@hb-intel/ui-kit` tokens. Hardcoded values are a lint error. |
| **D-06** | Data state handling | Loading, empty, and error states **must** be passed to `WorkspacePageShell` via `isLoading`, `isEmpty`, and `isError` props. Pages must not implement their own spinners or error UIs. |
| **D-07** | Form architecture | All data entry forms **must** use `HbcForm`, `HbcFormLayout`, `HbcFormSection`, and `HbcStickyFormFooter`. Raw form elements are prohibited in page code. |
| **D-08** | Notifications | All user feedback (success, error, warning) **must** be triggered via `useToast`. Inline feedback components on pages are prohibited except `HbcBanner` for persistent page-level warnings. |
| **D-09** | Mobile/field mode | Pages **must** declare supported layout modes. The shell handles all context switching via `useFieldMode`. Pages must not contain their own breakpoint logic. |
| **D-10** | Component consumption | Pages **must** import exclusively from `@hb-intel/ui-kit`. Direct imports from `@fluentui/react-components`, raw HTML structural elements, and inline styles are prohibited and enforced via ESLint. |

---

## 11. Phase 4b.8 — Form Architecture

**Goal:** Every data entry page uses the standard `HbcForm` system. Validation, dirty-state tracking, unsaved-changes warnings, and sticky save/cancel footer are automatic for all forms.

**Depends on:** Phase 4b.3 complete (`CreateUpdateLayout` implemented)

### Tasks

#### 4b.8.1 — Verify HbcForm complete implementation

Confirm the following are fully implemented in `packages/ui-kit/src/HbcForm/`:

| Component | Purpose |
|-----------|---------|
| `HbcForm` | Root form container. Manages validation context via `HbcFormContext`. |
| `HbcFormLayout` | Responsive field grid (1, 2, or 3 column). |
| `HbcFormSection` | Named section with divider and optional description. |
| `HbcFormRow` | Single row within a layout. |
| `HbcTextField` | Text input wired to form context. |
| `HbcSelect` | Dropdown wired to form context. |
| `HbcCheckbox` | Checkbox wired to form context. |
| `HbcStickyFormFooter` | Always-visible Save/Cancel/Delete footer. |

#### 4b.8.2 — Wire `useFormDraftStore` to `HbcForm`

```ts
// HbcForm automatically persists draft to Zustand on every change
// Draft is keyed by formId prop
const { saveDraft, clearDraft, getDraft } = useFormDraftStore();

// On mount: restore draft if exists
// On field change: auto-save draft
// On submit/cancel: clear draft
```

#### 4b.8.3 — Wire `useUnsavedChangesBlocker`

```ts
// HbcForm automatically blocks navigation when form is dirty
const isDirty = formState.isDirty;
useUnsavedChangesBlocker(isDirty);
// Shows HbcConfirmDialog: "You have unsaved changes. Leave anyway?"
```

#### 4b.8.4 — Standard form page pattern

Document the canonical pattern for all form pages:

```tsx
// ✅ Correct — standard form page pattern
const NewRiskItemPage = () => {
  const { mutate, isLoading } = useCreateRiskItem();

  return (
    <WorkspacePageShell
      layout="form"
      title="New Risk Item"
      breadcrumbs={[{ label: 'Risk Register', path: '/risk' }, { label: 'New' }]}
    >
      <HbcForm
        formId="new-risk-item"
        onSubmit={(data) => mutate(data)}
        defaultValues={RISK_DEFAULTS}
      >
        <HbcFormSection title="Risk Details">
          <HbcFormLayout columns={2}>
            <HbcTextField name="title" label="Risk Title" required />
            <HbcSelect name="category" label="Category" options={RISK_CATEGORIES} />
            <HbcTextField name="description" label="Description" multiline span={2} />
          </HbcFormLayout>
        </HbcFormSection>
        <HbcStickyFormFooter
          onCancel={() => navigate('/risk')}
          isSaving={isLoading}
        />
      </HbcForm>
    </WorkspacePageShell>
  );
};
```

#### 4b.8.5 — Form density integration

`HbcForm` reads from `useDensity()`. In `compact` density, field heights and spacing reduce automatically. Page authors never set density manually.

### Acceptance Criteria

- [ ] All `HbcForm` sub-components fully implemented and exported
- [ ] `useFormDraftStore` auto-saves on every field change
- [ ] `useUnsavedChangesBlocker` triggers `HbcConfirmDialog` on dirty navigation
- [ ] `HbcStickyFormFooter` remains visible at bottom of viewport on scroll
- [ ] Form density responds to `useDensity()` without page-level code
- [ ] Storybook stories cover: empty form, pre-populated, validation errors, saving state, dirty state

---

*Phase 4b — HB-Intel UI Design Implementation Plan*
*Version 1.0 — March 5, 2026*
*Supersedes: Phase 4 partial implementation (ADR-0016 through ADR-0033)*
*Next Phase: Phase 5 — SPFx Webpart Breakout*

<!-- IMPLEMENTATION PROGRESS & NOTES
Phase 4b.8 (Form Architecture & Draft System) completed: 2026-03-06
  - 4b.8.1: HbcForm sub-components verified (HbcFormSection, HbcFormLayout, HbcStickyFormFooter)
  - 4b.8.2: useFormDraft hook for auto-save draft persistence
  - 4b.8.3: HbcFormGuard with HbcConfirmDialog for unsaved changes blocking
  - 4b.8.5: Density integration via useDensity() — compact mode auto-applied
  - 4b.8.4: Documentation
  - ADR created: ADR-0042-form-architecture.md
  - Documentation added: docs/how-to/developer/phase-4b.8-form-architecture-guide.md
  - Build: 23/23 packages pass, 0 errors
Next: Phase 4b.9
-->