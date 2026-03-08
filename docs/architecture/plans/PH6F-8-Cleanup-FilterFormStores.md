# PH6F-8 — Wire `useFilterStore` and `useFormDraft` to Data-Driven Pages

**Plan ID:** PH6F-8-Cleanup-FilterFormStores
**Parent Plan:** PH6F-DeadWiring-Cleanup-Plan.md
**Blueprint Reference:** §4b (Data grid UX), §4c (Multi-step form patterns)
**Foundation Plan Reference:** Phase 5D (useFilterStore, useDomainFilters, useFormDraft, encodeFiltersToUrl)
**Priority:** MEDIUM
**Execution Order:** 8th in sequence (progressive — applied per page as pages are built)
**Estimated Effort:** 1 hour to establish patterns + ongoing per page
**Risk:** LOW — additive hooks; no existing behavior is replaced

---

## Problem Statement

`@hbc/query-hooks` (or equivalent package) exports two critical page-level utilities:

**`useFilterStore` / `useDomainFilters`** — Provides filter state management with:
- Per-domain filter state isolation (each list page has its own filter namespace)
- URL encoding/decoding so filters survive page refresh and can be bookmarked
- Saved views (named filter presets)
- Pagination state

**`useFormDraft`** — Provides auto-save draft state for multi-step forms:
- Saves form state to `sessionStorage` periodically and on change
- Restores draft automatically on mount
- Clears draft on successful form submission

Neither hook is used in any page. List pages (invoices, projects, scorecards, etc.) have no
persistent filter state. Multi-step forms (BD scorecard wizard, project creation) cannot
restore unsaved work after a page refresh or accidental navigation.

---

## Step 1 — Locate and Verify Hook Package

```bash
grep -r "useFilterStore\|useDomainFilters\|useFormDraft\|encodeFiltersToUrl" \
  packages/ --include="*.ts" -l
```

Determine the exact package name (`@hbc/query-hooks`, `@hbc/shell`, or other) and the
correct import paths. Update all examples below with the actual paths.

---

## Step 2 — Establish the Filter Wiring Pattern

This pattern is applied to every `HbcDataTable` list page. Document it here so all developers
follow the same approach.

**Pattern implementation (example: Accounting Invoice List):**

```typescript
// apps/pwa/src/routes/accounting/index.tsx
// D-PH6F-8: Filter wiring pattern — apply to all list pages.

import { useDomainFilters, encodeFiltersToUrl } from '@hbc/query-hooks';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { FILTER_KEYS } from '../../features/filterKeys.js';

function AccountingInvoiceList() {
  const navigate = useNavigate();
  // Read current URL search params (for URL → filter sync on mount)
  const search = useSearch({ from: '/accounting/' });

  // Domain-scoped filter state — isolated from other pages
  const { filters, setFilter, resetFilters, savedViews, pagination } =
    useDomainFilters(FILTER_KEYS.ACCOUNTING_INVOICES, {
      initialFromUrl: search, // hydrate from URL params on mount
    });

  // Sync filter changes back to URL (replace = no back-button spam)
  React.useEffect(() => {
    void navigate({
      to: '/accounting/',
      search: encodeFiltersToUrl(filters),
      replace: true,
    });
  }, [filters]);

  return (
    <HbcDataTable
      filters={filters}
      onFilterChange={setFilter}
      onResetFilters={resetFilters}
      savedViews={savedViews}
      pagination={pagination}
      // ...
    />
  );
}
```

---

## Step 3 — Establish the Form Draft Wiring Pattern

This pattern is applied to every multi-step form (BD scorecard wizard, project creation wizard,
estimate forms, etc.):

```typescript
// D-PH6F-8: Form draft wiring pattern — apply to all multi-step forms.

import { useFormDraft } from '@hbc/query-hooks';
import { useForm } from 'react-hook-form';

function ScorecardFormWizard({ scorecardId }: { scorecardId?: string }) {
  // Draft key is unique per entity (new vs. edit mode)
  const draftKey = scorecardId ? `scorecard-edit-${scorecardId}` : 'scorecard-new';

  const { draft, setDraft, clearDraft, hasDraft } = useFormDraft<ScorecardFormValues>(draftKey);

  const { control, reset, handleSubmit, watch } = useForm<ScorecardFormValues>({
    defaultValues: draft ?? defaultFormValues,
  });

  // Auto-save on field change (debounced internally by useFormDraft)
  const formValues = watch();
  React.useEffect(() => {
    setDraft(formValues);
  }, [formValues]);

  // Show "draft restored" banner if draft was loaded
  const [showDraftBanner, setShowDraftBanner] = React.useState(hasDraft);

  const onSubmit = async (data: ScorecardFormValues) => {
    await submitScorecard(data);
    clearDraft(); // Clear draft on successful submit — don't restore after submit
    toast.success('Scorecard submitted.');
  };

  return (
    <>
      {showDraftBanner && (
        <DraftRestoredBanner onDismiss={() => setShowDraftBanner(false)} />
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* ... wizard steps */}
      </form>
    </>
  );
}
```

---

## Step 4 — Create `filterKeys.ts` Registry

**New file:** `apps/pwa/src/features/filterKeys.ts`

```typescript
// apps/pwa/src/features/filterKeys.ts
// D-PH6F-8: Canonical domain filter keys — prevents typos and key collisions across list pages.
// Add a new key for every list page that uses useDomainFilters.

export const FILTER_KEYS = {
  ACCOUNTING_INVOICES: 'accounting-invoices',
  ACCOUNTING_REPORTS: 'accounting-reports',
  ESTIMATING_PROJECTS: 'estimating-projects',
  ESTIMATING_QUOTES: 'estimating-quotes',
  BD_SCORECARDS: 'bd-scorecards',
  PROJECT_HUB_PROJECTS: 'project-hub-projects',
  PROJECT_HUB_TASKS: 'project-hub-tasks',
} as const;

export type FilterKey = (typeof FILTER_KEYS)[keyof typeof FILTER_KEYS];
```

---

## Step 5 — Apply to First Instance (BD Scorecards)

Apply the filter pattern to the BD scorecard list page (`/bd/scorecards`) and the form draft
pattern to the BD scorecard wizard (`/bd/scorecards/new` and `/bd/scorecards/:id/edit`). These
are the highest-priority targets given the BD module is actively being planned (PH7).

Apply the filter pattern there first to:
1. Validate the pattern works correctly in the codebase
2. Give the team a concrete reference implementation

---

## Files Modified / Created

| Action | File |
|--------|------|
| Create | `apps/pwa/src/features/filterKeys.ts` |
| Modify | List page route components (progressive — per page) |
| Modify | Multi-step form components (progressive — per form) |

---

## Verification Commands

```bash
# 1. Build check after filterKeys.ts creation
pnpm turbo run build

# 2. Manual verification — filter URL persistence
pnpm --filter pwa dev
# a. Navigate to a list page that has filters wired
# b. Apply a filter (e.g., status = Active)
# c. Verify: URL search params update (e.g., ?status=Active)
# d. Refresh the page
# e. Verify: filter is still applied (URL → filter hydration on mount)
# f. Share the URL → open in new tab → same filter is applied

# 3. Manual verification — form draft
# a. Navigate to /bd/scorecards/new (or equivalent form page)
# b. Fill in Step 1 of the wizard
# c. Close the browser tab (simulate accidental close)
# d. Reopen the URL
# e. Verify: "Draft restored" banner appears, form values are pre-filled
# f. Submit the form successfully
# g. Open the URL again — verify: NO draft restored (cleared on submit)
```

---

## Success Criteria

- [x] PH6F-8.1 `filterKeys.ts` registry created with keys for all current list page domains
- [x] PH6F-8.2 `useListFilterStoreBinding` pattern applied to BusinessDevelopmentPage (BD leads list)
- [x] PH6F-8.3 `useFormDraft` pattern applied to ScorecardPage with auto-save via inner component
- [x] PH6F-8.4 Filters round-trip correctly (filter → URL params → filter on reload)
- [x] PH6F-8.5 Form drafts survive page refresh and restore correctly on remount
- [x] PH6F-8.6 Form drafts are cleared after successful submission
- [x] PH6F-8.7 Build passes with zero TypeScript errors

<!-- IMPLEMENTATION PROGRESS & NOTES
Task created: 2026-03-07
Completed: 2026-03-07
Status: COMPLETE

PH6F-8.1: Created apps/pwa/src/features/filterKeys.ts with 8 domain keys (BD_LEADS added vs plan)
PH6F-8.2: Wired useListFilterStoreBinding + ListLayout + URL deep-link sync into BusinessDevelopmentPage.tsx
  - Used useListFilterStoreBinding (not raw useDomainFilters) for ListLayout-compatible props
  - URL sync via window.history.replaceState (avoids router re-renders)
  - Client-side filtering of MOCK_LEADS by stage field
PH6F-8.3: Wired useFormDraft into ScorecardPage.tsx with HbcForm + auto-save inner component
  - ScorecardDraftAutoSave inner component accesses useHbcFormContext inside HbcForm provider
  - Draft restored banner with dismiss via HbcBanner
  - submitWithDraftClear wraps onValidSubmit for auto-clear on success
PH6F-8.7: Build passes — pnpm turbo run build --filter=@hbc/pwa --filter=@hbc/query-hooks (0 errors)

API corrections applied vs governing plan examples:
  - useDomainFilters does NOT accept { initialFromUrl } — used decodeFiltersFromUrl() on mount
  - useListFilterStoreBinding is the correct hook for ListLayout prop wiring
  - encodeFiltersToUrl(key) reads from store, not from an arg
  - useFormDraft returns saveDraft (not setDraft)
-->
