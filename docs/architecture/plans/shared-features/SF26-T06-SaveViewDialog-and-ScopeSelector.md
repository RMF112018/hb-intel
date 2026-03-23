# SF26-T06 - `SaveViewDialog` and Scope Selector: Save, Rename, Duplicate, and Share Workflows

**Phase Reference:** Phase 3 — Workstream I (Shared Feature Infrastructure)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-26-Shared-Feature-Saved-Views.md`
**Decisions Applied:** L-02, L-03, L-06
**Estimated Effort:** 0.5 sprint-weeks
**Depends On:** SF26-T05

> **Doc Classification:** Canonical Normative Plan — SF26-T06 save dialog and scope selector task; sub-plan of `SF26-Saved-Views.md`.

---

## Objective

Define the UX contracts for `SaveViewDialog`, `SavedViewScopeBadge`, `DefaultViewToggle`, and `ViewCompatibilityBanner`. All four are reusable visual surfaces and must be implemented in `@hbc/ui-kit`.

---

## UI Ownership Reminder

`SaveViewDialog`, `SavedViewScopeBadge`, `DefaultViewToggle`, and `ViewCompatibilityBanner` are reusable across modules and surfaces.
All four belong in `@hbc/ui-kit`.

---

## `SaveViewDialog` — Controlled Save and Share Workflow

### Props

```typescript
interface SaveViewDialogProps {
  mode: 'save' | 'save-as-new' | 'rename' | 'duplicate';
  existingView?: ISavedViewDefinition;
  permissions: ISavedViewScopePermissions;
  onConfirm: (result: SaveViewDialogResult) => void;
  onCancel: () => void;
}

interface SaveViewDialogResult {
  title: string;
  description?: string;
  scope: SavedViewScope;
  isDefault: boolean;
  replaceExisting: boolean;
}
```

### Dialog Behavior by Mode

**save (overwrite current view)**
- pre-fills title and scope from `existingView`
- shows "Set as default" toggle
- confirms overwrite if scope is team/role/system with a warning: "Saving will update this view for all members"

**save-as-new**
- empty title field; user must provide a name
- scope selector shows only permitted scopes based on `permissions`
- "Set as default" toggle
- "Replace existing" checkbox only when another view with the same title exists in the selected scope

**rename**
- pre-fills existing title; user edits in place
- scope and default state are not changeable in rename mode

**duplicate**
- suggests title "Copy of [original title]"; user may edit
- scope defaults to `personal` regardless of source view scope; user may elevate if permitted

### Scope Selector Behavior

- displays permitted scopes only (based on `permissions`)
- personal scope is always available and is the default
- team scope shows the team name(s) the user may write to
- role scope shows the role name(s) the user may write to
- system scope appears only for users with admin capability
- scope selection is never hidden — the user sees which scope they are saving to

### Sharing Intent Clarity Requirements

Sharing must be intentional, not implicit:

- switching scope from `personal` to `team`/`role`/`system` must show a one-sentence explanation of what happens: "This view will be visible to all members of [team/role name]."
- accidental mass-share is prevented by keeping `personal` as the default scope pre-fill

---

## `SavedViewScopeBadge`

Compact badge showing the scope of a view. Used in `SavedViewPicker` list rows and in the `SaveViewDialog` header.

```typescript
interface SavedViewScopeBadgeProps {
  scope: SavedViewScope;
  label?: string; // override default scope label
}
```

Visual rendering: `personal` → no badge or subtle indicator; `team` → team badge; `role` → role badge; `system` → system badge.

---

## `DefaultViewToggle`

Toggle control for setting or unsetting the default view for a module workspace.

```typescript
interface DefaultViewToggleProps {
  isDefault: boolean;
  onChange: (isDefault: boolean) => void;
  disabled?: boolean;
}
```

When `isDefault` is being set, display: "This view will open automatically when you visit [module/workspace]."

---

## `ViewCompatibilityBanner`

Inline banner rendered before or after applying a `degraded-compatible` view. Informs the user of what changed and gives them the option to apply anyway or cancel.

```typescript
interface ViewCompatibilityBannerProps {
  result: ISavedViewCompatibilityResult;
  onApplyAnyway: () => void;
  onCancel: () => void;
}
```

### Required Banner Content

- heading: "Some fields in this view are no longer available"
- bulleted list of removed columns, filter fields, and group fields
- explanation: "This view can still be applied, but the following items will be excluded: [list]"
- two actions: "Apply anyway" and "Cancel"

---

## Verification Commands

```bash
pnpm --filter @hbc/ui-kit check-types
pnpm --filter @hbc/ui-kit test --coverage
pnpm --filter @hbc/saved-views check-types
```
