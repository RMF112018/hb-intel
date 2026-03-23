# SF26-T05 - `SavedViewPicker` and `SavedViewChip`: View Switcher and Active View Indicator

**Phase Reference:** Phase 3 — Workstream I (Shared Feature Infrastructure)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-26-Shared-Feature-Saved-Views.md`
**Decisions Applied:** L-02, L-06
**Estimated Effort:** 0.5 sprint-weeks
**Depends On:** SF26-T04

> **Doc Classification:** Canonical Normative Plan — SF26-T05 picker and chip UI task; sub-plan of `SF26-Saved-Views.md`.

---

## Objective

Define the UX contracts and `@hbc/ui-kit` placement requirements for `SavedViewPicker` (view switcher dropdown) and `SavedViewChip` (active view indicator chip). Both components are reusable visual surfaces and must be implemented in `@hbc/ui-kit`.

---

## UI Ownership Reminder

`SavedViewPicker` and `SavedViewChip` are reusable across modules and surfaces.
Both belong in `@hbc/ui-kit`, not in `@hbc/saved-views`.
`@hbc/saved-views` may provide thin composition shells that connect hook state to these components, but the components themselves must not be defined inside the saved-views package.

---

## `SavedViewPicker` — View Switcher

### Props

```typescript
interface SavedViewPickerProps {
  moduleKey: string;
  workspaceKey: string;
  views: ISavedViewDefinition[];
  activeViewId: string | undefined;
  defaultViewId: string | undefined;
  hasUnsavedChanges: boolean;
  onApplyView: (viewId: string) => void;
  onSaveCurrentView: () => void;
  onOpenSaveDialog: () => void;
  permissions: ISavedViewScopePermissions;
  isLoading?: boolean;
}
```

### Visual Behavior

- appears consistently in grid and queue command bars; position follows `@hbc/ui-kit` command bar placement rules
- lists views grouped by scope: personal views first, then team, then role, then system
- marks the default view with a visual indicator (e.g., star or badge)
- marks the currently active view with a checkmark or selection state
- includes a quick-save action ("Save view") when `hasUnsavedChanges` is `true`
- includes a "Save as new view" action to open the `SaveViewDialog`
- system-scope views are labeled distinctly to distinguish them from user-owned views

### Accessibility Requirements

- follows `@hbc/ui-kit` dropdown pattern for keyboard navigation
- active view announced as selected on open
- scope group labels are rendered as list group headings, not as interactive items

---

## `SavedViewChip` — Active View Indicator

A compact chip displayed in the command bar or table header to show the current active view name and scope badge.

### Props

```typescript
interface SavedViewChipProps {
  activeView: ISavedViewDefinition | undefined;
  hasUnsavedChanges: boolean;
  onOpenPicker: () => void;
}
```

### Visual Behavior

- shows active view title; falls back to "Default view" if no saved view is active
- shows an `unsaved-changes` indicator (e.g., dot or asterisk) when `hasUnsavedChanges` is `true`
- clicking opens the `SavedViewPicker` or toggles the picker inline

---

## Command Bar Placement Contract

`SavedViewPicker` and `SavedViewChip` are always placed in the command bar zone of a data surface, not inline within the grid body.
Module surfaces must not create a second "view" control outside the command bar that duplicates saved-view switching.

---

## Verification Commands

```bash
pnpm --filter @hbc/ui-kit check-types
pnpm --filter @hbc/ui-kit test --coverage
pnpm --filter @hbc/saved-views check-types
```
