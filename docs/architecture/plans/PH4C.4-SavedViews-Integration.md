# PH4C.4 — SavedViews Integration

**Version:** 1.0
**Date Created:** 2026-03-07
**Status:** Ready for Implementation
**Audience:** Frontend Engineers, UI Kit Maintainers, DataTable Consumers
**Implementation Objective:** Integrate `useSavedViews` hook into HbcDataTable via config-only `savedViewsConfig` prop; establish internal state management pattern; defer full controlled/uncontrolled duality to future phase.

---

## Purpose

The `useSavedViews` hook is currently exported from the UI Kit but not internally integrated into the HbcDataTable component. This task wires the hook into the DataTable via an optional configuration prop, allowing consuming applications to optionally enable saved view functionality without needing to manage the hook independently.

This is the **config-only integration pattern**: consumers provide configuration and callbacks, but the DataTable manages internal saved view state. Full controlled/uncontrolled duality (where external applications provide state directly) is explicitly deferred beyond PH4C.

---

## Prerequisites

**No hard prerequisites.** This task is independent and can proceed in parallel with PH4C.3 and PH4C.5.

---

## Implementation Steps

### 4C.4.1 — Audit the Existing useSavedViews Hook API

Inspect the current hook implementation to understand its contract: parameters, return type, side effects, and persistence mechanism.

**File Reference:** `/sessions/tender-zen-rubin/mnt/hb-intel/packages/ui-kit/src/HbcDataTable/hooks/useSavedViews.ts`

```bash
cat /sessions/tender-zen-rubin/mnt/hb-intel/packages/ui-kit/src/HbcDataTable/hooks/useSavedViews.ts
```

**Action Items:**
- Record the exact function signature
- Note the return type (shape of the state object)
- Identify any dependencies (localStorage, sessionStorage, API calls, etc.)
- Document callback signatures (onViewSaved, onViewDeleted, etc.)
- Confirm whether the hook can be called conditionally or requires refactoring for optional invocation

**Example Hook Structure** (for context; adapt to actual implementation):
```ts
interface SavedView {
  id: string;
  name: string;
  filters?: Record<string, any>;
  columnConfig?: any[];
  sortConfig?: any;
  createdAt: string;
  updatedAt: string;
}

interface UseSavedViewsReturn {
  views: SavedView[];
  currentViewId: string | null;
  isSaving: boolean;
  isDeleting: boolean;
  saveView: (viewName: string, config: any) => Promise<void>;
  deleteView: (viewId: string) => Promise<void>;
  applyView: (viewId: string) => void;
}

export const useSavedViews = (tableId: string, userId: string): UseSavedViewsReturn => {
  // Implementation
};
```

---

### 4C.4.2 — Audit the Existing HbcDataTable Props Interface

Inspect the HbcDataTable component to understand the existing props structure and identify where the new `savedViewsConfig` prop should be added.

**File Reference:** `/sessions/tender-zen-rubin/mnt/hb-intel/packages/ui-kit/src/HbcDataTable/index.tsx`

```bash
cat /sessions/tender-zen-rubin/mnt/hb-intel/packages/ui-kit/src/HbcDataTable/index.tsx | head -100
```

Also check the types file:

```bash
cat /sessions/tender-zen-rubin/mnt/hb-intel/packages/ui-kit/src/HbcDataTable/types.ts
```

**Action Items:**
- Locate the `HbcDataTableProps` interface definition
- Understand the structure: which props control columns, filters, sorting, etc.
- Identify any existing internal state hooks (useState, useContext, etc.)
- Note the component's render structure and where saved views UI might be added
- Check if there is already a toolbar or column chooser component where saved views controls would live

**Documentation:**
Record the current props interface structure. Example outline:
```ts
interface HbcDataTableProps {
  // Data
  items: any[];
  columns?: any[];

  // Callbacks
  onSelectionChange?: (selectedKeys: Set<string>) => void;
  onSort?: (sortState: any) => void;

  // Visual
  density?: 'compact' | 'normal' | 'spacious';
  // ... other props
}
```

---

### 4C.4.3 — Define the HbcDataTableSavedViewsConfig Interface

Create a new configuration interface that will be passed as the `savedViewsConfig` prop. This interface encapsulates everything the DataTable needs to enable saved views.

**File Reference:** Choose one of:
- Add directly to `/sessions/tender-zen-rubin/mnt/hb-intel/packages/ui-kit/src/HbcDataTable/index.tsx`
- Or create a dedicated types file: `/sessions/tender-zen-rubin/mnt/hb-intel/packages/ui-kit/src/HbcDataTable/saved-views-config.ts` (if not already present)

**Code to Add:**

```ts
/**
 * Configuration for internal saved views management in HbcDataTable.
 *
 * @remarks
 * When provided to HbcDataTable, this config enables the internal useSavedViews hook
 * and integrates saved view controls into the table's toolbar or column chooser.
 * The table manages all saved view state internally; consumers provide configuration
 * and optional callbacks to respond to view save/delete events.
 */
export interface HbcDataTableSavedViewsConfig {
  /**
   * Unique identifier for this table instance.
   *
   * @remarks
   * Used as the storage key for persisting saved views. Should be stable and unique
   * within the application scope. Example: 'accounting-transactions-table',
   * 'project-hub-gantt-view'.
   */
  tableId: string;

  /**
   * User identifier.
   *
   * @remarks
   * Used to scope saved views per user. Allows the same table to maintain
   * separate saved view collections for different users.
   */
  userId: string;

  /**
   * Callback invoked after a view is successfully saved.
   *
   * @remarks
   * Useful for analytics, logging, or UI notifications (e.g., "View saved" toast).
   * The SavedView object includes the view ID, name, configuration, and timestamps.
   *
   * @param view - The saved view that was created or updated.
   */
  onViewSaved?: (view: SavedView) => void;

  /**
   * Callback invoked after a view is successfully deleted.
   *
   * @remarks
   * Useful for analytics, logging, or UI notifications (e.g., "View deleted" toast).
   *
   * @param viewId - The ID of the deleted view.
   */
  onViewDeleted?: (viewId: string) => void;

  /**
   * Optional callback invoked when a saved view is applied to the table.
   *
   * @remarks
   * If provided, called when the user selects a saved view from the dropdown.
   * Can be used to trigger side effects like route changes, analytics, or data fetches.
   *
   * @param viewId - The ID of the view being applied.
   * @param view - The complete SavedView object.
   */
  onViewApplied?: (viewId: string, view: SavedView) => void;
}
```

**Verification:**
```bash
grep -n "HbcDataTableSavedViewsConfig" \
  /sessions/tender-zen-rubin/mnt/hb-intel/packages/ui-kit/src/HbcDataTable/index.tsx \
  /sessions/tender-zen-rubin/mnt/hb-intel/packages/ui-kit/src/HbcDataTable/saved-views-config.ts 2>/dev/null | head -5
```

---

### 4C.4.4 — Add savedViewsConfig Prop to HbcDataTableProps Interface

Add the new optional prop to the main props interface with comprehensive JSDoc documentation.

**File Reference:** `/sessions/tender-zen-rubin/mnt/hb-intel/packages/ui-kit/src/HbcDataTable/index.tsx` or types file

**Locate the `HbcDataTableProps` interface and add:**

```ts
/**
 * Hbc DataTable component props.
 */
export interface HbcDataTableProps {
  // ... existing props (preserve all exactly as-is)

  /**
   * Optional configuration for internal saved views management.
   *
   * @remarks
   * When provided, HbcDataTable automatically:
   * 1. Invokes the `useSavedViews` hook internally
   * 2. Manages saved view state internally
   * 3. Integrates saved view controls into the table toolbar or column chooser
   * 4. Calls the provided callbacks when views are saved, deleted, or applied
   *
   * Consumers provide configuration (tableId, userId) and optional callbacks,
   * but do **not** directly control saved view state. The DataTable handles
   * all persistence, state updates, and UI integration.
   *
   * **Example:**
   * ```tsx
   * <HbcDataTable
   *   items={data}
   *   columns={columns}
   *   savedViewsConfig={{
   *     tableId: 'accounting-transactions',
   *     userId: currentUser.id,
   *     onViewSaved: (view) => {
   *       toast.success(`Saved view: ${view.name}`);
   *       analytics.track('table_view_saved', { viewName: view.name });
   *     },
   *     onViewDeleted: (viewId) => {
   *       toast.info('View deleted');
   *     },
   *   }}
   * />
   * ```
   *
   * **Deferred Scope:**
   * Full controlled/uncontrolled duality — where consuming applications provide
   * external `savedViews` state and `onSavedViewsChange` callback to completely
   * override internal management — is intentionally deferred beyond PH4C.
   *
   * When that capability is needed (e.g., loading a saved view from a URL parameter
   * or syncing with external state), refer to the Deferred-Scope Roadmap in
   * `docs/architecture/plans/PH4C-UI-Design-Completion-Plan.md`.
   *
   * @see {@link HbcDataTableSavedViewsConfig}
   * @see {@link docs/architecture/plans/PH4C-UI-Design-Completion-Plan.md}
   */
  savedViewsConfig?: HbcDataTableSavedViewsConfig;
}
```

**Verification:**
```bash
grep -A 15 "savedViewsConfig\?" \
  /sessions/tender-zen-rubin/mnt/hb-intel/packages/ui-kit/src/HbcDataTable/index.tsx | head -20
```

---

### 4C.4.5 — Destructure savedViewsConfig in the Component Function

In the HbcDataTable functional component, destructure the `savedViewsConfig` prop from the props object.

**File Reference:** `/sessions/tender-zen-rubin/mnt/hb-intel/packages/ui-kit/src/HbcDataTable/index.tsx`

**Locate the component function signature and add:**

```ts
export const HbcDataTable: React.FC<HbcDataTableProps> = ({
  // ... existing destructured props
  items,
  columns,
  density,
  // ... etc

  // NEW
  savedViewsConfig,
}) => {
  // ... component implementation
};
```

---

### 4C.4.6 — Conditionally Invoke useSavedViews and Store Result

Add the conditional hook invocation. This requires careful consideration of React hooks rules: hooks must be called in the same order on every render.

**Important Note:** If the current useSavedViews hook cannot be called conditionally (i.e., it accesses ref or localStorage in a way that breaks with conditional calls), you may need to:
1. Refactor useSavedViews to handle a "disabled" state, OR
2. Always call the hook but pass a conditional flag

**File Reference:** `/sessions/tender-zen-rubin/mnt/hb-intel/packages/ui-kit/src/HbcDataTable/index.tsx`

**Add after component function signature:**

```ts
// Option 1: If useSavedViews supports being called with null/undefined or a "disabled" flag
const internalSavedViews = useSavedViews(savedViewsConfig);

// OR

// Option 2: If useSavedViews requires unconditional calls, use a wrapper
const internalSavedViews = useSavedViewsInternal({
  enabled: !!savedViewsConfig,
  config: savedViewsConfig,
});

// Then optionally create a wrapper hook in the same file or hooks/ directory:
const useSavedViewsInternal = (options: {
  enabled: boolean;
  config?: HbcDataTableSavedViewsConfig;
}) => {
  const hookResult = useSavedViews(
    options.config?.tableId ?? 'disabled',
    options.config?.userId ?? 'disabled'
  );

  // Return null or disabled state if not enabled
  return options.enabled ? hookResult : null;
};
```

**Action Item:** Choose the appropriate approach based on the existing useSavedViews implementation. Document the choice in the Progress Notes.

---

### 4C.4.7 — Wire Saved Views State into Toolbar/Column Chooser

Integrate the returned saved views state into the table's existing UI controls (toolbar, column chooser, or a new dedicated panel).

**File Reference:** `/sessions/tender-zen-rubin/mnt/hb-intel/packages/ui-kit/src/HbcDataTable/index.tsx`

**Pseudo-code structure:**

```ts
export const HbcDataTable: React.FC<HbcDataTableProps> = ({
  items,
  columns,
  savedViewsConfig,
  // ... other props
}) => {
  const internalSavedViews = savedViewsConfig
    ? useSavedViews(savedViewsConfig.tableId, savedViewsConfig.userId)
    : null;

  // If internalSavedViews is available, pass it to the toolbar/column chooser
  return (
    <div className="hbc-data-table">
      {/* Toolbar with optional saved views dropdown */}
      {internalSavedViews && (
        <HbcDataTableToolbar
          savedViews={internalSavedViews}
          onViewSaved={savedViewsConfig?.onViewSaved}
          onViewDeleted={savedViewsConfig?.onViewDeleted}
          onViewApplied={savedViewsConfig?.onViewApplied}
        />
      )}

      {/* Rest of table */}
      <DataGridBody
        items={items}
        columns={columns}
        // ... other props
      />
    </div>
  );
};
```

**Action Items:**
- Identify the exact toolbar or column chooser component name
- Determine which props need to be passed (views array, save/delete functions, current view ID, etc.)
- Add conditional rendering: only render saved views UI if `internalSavedViews` is not null
- Update the toolbar/column chooser component to accept saved views props
- Connect save/delete/apply actions to invoke the hooks' returned functions

**Example Toolbar Integration:**

```ts
interface HbcDataTableToolbarProps {
  savedViews?: {
    views: SavedView[];
    currentViewId: string | null;
    saveView: (name: string, config: any) => Promise<void>;
    deleteView: (viewId: string) => Promise<void>;
    applyView: (viewId: string) => void;
  };
  onViewSaved?: (view: SavedView) => void;
  onViewDeleted?: (viewId: string) => void;
  onViewApplied?: (viewId: string, view: SavedView) => void;
  // ... other toolbar props
}

const HbcDataTableToolbar: React.FC<HbcDataTableToolbarProps> = ({
  savedViews,
  onViewSaved,
  onViewDeleted,
  onViewApplied,
  // ...
}) => {
  return (
    <div className="hbc-data-table-toolbar">
      {/* Existing toolbar content */}

      {/* Saved views dropdown */}
      {savedViews && (
        <SavedViewsDropdown
          views={savedViews.views}
          currentViewId={savedViews.currentViewId}
          onSelectView={async (viewId) => {
            savedViews.applyView(viewId);
            const view = savedViews.views.find((v) => v.id === viewId);
            if (view) {
              onViewApplied?.(viewId, view);
            }
          }}
          onSaveCurrentView={async (viewName) => {
            await savedViews.saveView(viewName, {
              /* current table config */
            });
            onViewSaved?.({
              /* view object */
            });
          }}
          onDeleteView={async (viewId) => {
            await savedViews.deleteView(viewId);
            onViewDeleted?.(viewId);
          }}
        />
      )}
    </div>
  );
};
```

---

### 4C.4.8 — Confirm Backward Compatibility

Verify that HbcDataTable without the `savedViewsConfig` prop still renders and functions identically to before.

**Test Case:**

```tsx
// This should work exactly as before (no changes in behavior)
<HbcDataTable
  items={data}
  columns={columns}
  density="normal"
/>
```

**Action Items:**
- Render the DataTable without `savedViewsConfig` in a test or story
- Confirm no console errors or warnings
- Verify all other props and features work as expected
- Run existing tests to confirm no regressions

---

### 4C.4.9 — Add/Update Storybook Story

Create or update a Storybook story demonstrating the `savedViewsConfig` integration.

**File Reference:** `/sessions/tender-zen-rubin/mnt/hb-intel/packages/ui-kit/src/HbcDataTable/HbcDataTable.stories.tsx` (or similar)

**Story Template:**

```ts
import { Meta, StoryObj } from '@storybook/react';
import { HbcDataTable, HbcDataTableProps } from './index';
import { useState } from 'react';

const meta: Meta<typeof HbcDataTable> = {
  title: 'UI Kit / DataTable / HbcDataTable',
  component: HbcDataTable,
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * HbcDataTable with Saved Views enabled.
 *
 * When savedViewsConfig is provided, the DataTable automatically integrates
 * saved views functionality:
 * - Users can save the current column configuration as a named view
 * - Users can delete saved views
 * - Users can switch between saved views
 * - Callbacks notify the parent component of view changes
 */
export const WithSavedViews: Story = {
  render: (args) => {
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    return (
      <>
        <HbcDataTable
          {...args}
          savedViewsConfig={{
            tableId: 'storybook-accounting-table',
            userId: 'storybook-user-123',
            onViewSaved: (view) => {
              setToastMessage(`✓ Saved view: "${view.name}"`);
              setTimeout(() => setToastMessage(null), 3000);
            },
            onViewDeleted: (viewId) => {
              setToastMessage(`✓ Deleted view`);
              setTimeout(() => setToastMessage(null), 3000);
            },
            onViewApplied: (viewId, view) => {
              setToastMessage(`✓ Applied view: "${view.name}"`);
              setTimeout(() => setToastMessage(null), 3000);
            },
          }}
        />
        {toastMessage && (
          <div
            style={{
              position: 'fixed',
              bottom: 16,
              right: 16,
              backgroundColor: '#10a37f',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          >
            {toastMessage}
          </div>
        )}
      </>
    );
  },
  args: {
    items: /* sample data */,
    columns: /* sample columns */,
  },
};

/**
 * HbcDataTable without Saved Views.
 *
 * When savedViewsConfig is omitted, the DataTable behaves as before.
 * No saved views UI is rendered.
 */
export const WithoutSavedViews: Story = {
  args: {
    items: /* sample data */,
    columns: /* sample columns */,
  },
};
```

**Action Items:**
- Create or locate the Storybook file
- Add the "WithSavedViews" story showing full functionality
- Add the "WithoutSavedViews" story showing backward compatibility
- Include JSDoc comments describing the expected behavior
- Manually test the story in Storybook UI to confirm interactions work

---

### 4C.4.10 — Update Reference Documentation

Update or create the HbcDataTable reference documentation to include the new prop.

**File Reference:** `/sessions/tender-zen-rubin/mnt/hb-intel/docs/reference/ui-kit/HbcDataTable.md` (or similar)

**Add to the Props section:**

```markdown
### Props

#### `savedViewsConfig` (optional)

Type: `HbcDataTableSavedViewsConfig | undefined`

Configuration for internal saved views management. When provided, HbcDataTable:
- Automatically invokes the `useSavedViews` hook
- Manages saved view state internally
- Integrates saved view controls into the toolbar
- Calls provided callbacks when views are saved, deleted, or applied

**Example:**

```tsx
<HbcDataTable
  items={data}
  columns={columns}
  savedViewsConfig={{
    tableId: 'accounting-transactions',
    userId: currentUser.id,
    onViewSaved: (view) => {
      toast.success(`Saved view: ${view.name}`);
    },
  }}
/>
```

**Default:** `undefined` (saved views disabled)

---

#### `HbcDataTableSavedViewsConfig`

| Property | Type | Required | Description |
|---|---|---|---|
| `tableId` | string | ✓ | Unique identifier for the table instance. Used as storage key. |
| `userId` | string | ✓ | User identifier. Used to scope views per user. |
| `onViewSaved` | `(view: SavedView) => void` | | Callback invoked when a view is saved. |
| `onViewDeleted` | `(viewId: string) => void` | | Callback invoked when a view is deleted. |
| `onViewApplied` | `(viewId: string, view: SavedView) => void` | | Callback invoked when a view is applied. |

---

### Deferred Scope

> **Note:** Full controlled/uncontrolled duality for saved views — where consuming applications
> provide external `savedViews` state and `onSavedViewsChange` callback to completely override
> internal management — is intentionally deferred beyond PH4C.
>
> The config-only pattern satisfies all current use cases. When external state control is needed
> (e.g., loading a saved view from a URL parameter, syncing with Redux/Zustand, or coordinating
> multiple tables), implement the controlled pattern using standard React patterns:
>
> 1. **Lift state up:** Move saved views state to a parent component or context
> 2. **Provide callbacks:** Pass `onSavedViewsChange` to HbcDataTable (future prop)
> 3. **Coordinate multiple tables:** Use a custom hook or shared context
>
> Refer to `docs/architecture/plans/PH4C-UI-Design-Completion-Plan.md` for the Deferred-Scope Roadmap
> and timeline for this capability.
```

---

### 4C.4.11 — Run Build and Tests

Verify that all changes compile and tests pass.

```bash
cd /sessions/tender-zen-rubin/mnt/hb-intel && \
pnpm turbo run build --filter=@hbc/ui-kit 2>&1 | tail -20
```

```bash
cd /sessions/tender-zen-rubin/mnt/hb-intel && \
pnpm turbo run test --filter=@hbc/ui-kit 2>&1 | tail -20
```

**Expected:** Build succeeds, tests pass or show no regressions related to HbcDataTable.

---

## Success Criteria Checklist

- [ ] `useSavedViews` hook API audited and documented
- [ ] HbcDataTable props interface audited and documented
- [ ] `HbcDataTableSavedViewsConfig` interface defined with comprehensive JSDoc
- [ ] `savedViewsConfig` prop added to `HbcDataTableProps` with detailed documentation
- [ ] `savedViewsConfig` destructured in component function
- [ ] `useSavedViews` hook conditionally invoked (or refactored to support conditional calling)
- [ ] Saved views state wired into toolbar/column chooser UI
- [ ] Backward compatibility confirmed: DataTable works without `savedViewsConfig`
- [ ] Storybook stories created:
  - [ ] `WithSavedViews` story with full functionality
  - [ ] `WithoutSavedViews` story confirming backward compatibility
- [ ] Reference documentation updated in `docs/reference/ui-kit/HbcDataTable.md`
- [ ] Deferred-scope note added to documentation
- [ ] Build succeeds (`pnpm turbo run build`)
- [ ] Tests pass with no regressions (`pnpm turbo run test`)
- [ ] No TypeScript errors or warnings

---

## Verification Commands

### Verify Interface Definitions Exist
```bash
grep -n "HbcDataTableSavedViewsConfig" \
  /sessions/tender-zen-rubin/mnt/hb-intel/packages/ui-kit/src/HbcDataTable/index.tsx
```

**Expected:** Output shows the interface definition with JSDoc.

### Verify Props Interface Updated
```bash
grep -A 20 "savedViewsConfig\?" \
  /sessions/tender-zen-rubin/mnt/hb-intel/packages/ui-kit/src/HbcDataTable/index.tsx | head -25
```

**Expected:** Output shows the prop in `HbcDataTableProps` with comprehensive JSDoc.

### Verify Hook Invocation
```bash
grep -n "internalSavedViews\|useSavedViews" \
  /sessions/tender-zen-rubin/mnt/hb-intel/packages/ui-kit/src/HbcDataTable/index.tsx | head -10
```

**Expected:** Lines showing the hook being called conditionally or via wrapper.

### Verify Storybook Story
```bash
grep -n "WithSavedViews\|SavedViews.*Story" \
  /sessions/tender-zen-rubin/mnt/hb-intel/packages/ui-kit/src/HbcDataTable/HbcDataTable.stories.tsx
```

**Expected:** Story definitions present.

### Verify Documentation File
```bash
test -f /sessions/tender-zen-rubin/mnt/hb-intel/docs/reference/ui-kit/HbcDataTable.md && \
grep -n "savedViewsConfig\|Deferred Scope" \
  /sessions/tender-zen-rubin/mnt/hb-intel/docs/reference/ui-kit/HbcDataTable.md | head -5
```

**Expected:** File exists and includes documentation of the new prop and deferred-scope note.

### Build Verification
```bash
cd /sessions/tender-zen-rubin/mnt/hb-intel && \
pnpm turbo run build --filter=@hbc/ui-kit 2>&1 | grep -E "error|Error|ERROR" || echo "✓ Build succeeded"
```

**Expected:** No errors reported (all warnings acceptable if they pre-existed).

---

## PH4C.4 Progress Notes

Use this section to document the execution of PH4C.4. Update it as you proceed through implementation steps.

- **4C.4.1 — Hook API Audit**
  - Date Completed: ___________
  - Hook Location: `packages/ui-kit/src/HbcDataTable/hooks/useSavedViews.ts`
  - Hook Signature: ___________
  - Return Type: ___________
  - Persistence Mechanism: [ ] localStorage [ ] sessionStorage [ ] API [ ] Other: ___________
  - Supports Conditional Calls: [ ] Yes [ ] No (refactoring needed)
  - Notes: ___________

- **4C.4.2 — Props Interface Audit**
  - Date Completed: ___________
  - Interface Location: ___________
  - Existing Props Count: ___________
  - Key Props Affecting Saved Views: ___________

- **4C.4.3 — Config Interface Defined**
  - Date Completed: ___________
  - File: [ ] Added to index.tsx [ ] Added to saved-views-config.ts
  - Status: [ ] Complete

- **4C.4.4 — Props Interface Updated**
  - Date Completed: ___________
  - `HbcDataTableProps.savedViewsConfig` added: [ ]
  - JSDoc complete: [ ]

- **4C.4.5 — Destructuring Added**
  - Date Completed: ___________
  - Component Function: ___________
  - Status: [ ] Complete

- **4C.4.6 — Hook Invocation**
  - Date Completed: ___________
  - Approach: [ ] Option 1 (Conditional) [ ] Option 2 (Wrapper) [ ] Other
  - Conditional Check: `savedViewsConfig ? useSavedViews(...) : null`
  - Status: [ ] Complete

- **4C.4.7 — Toolbar/Column Chooser Wired**
  - Date Completed: ___________
  - Toolbar Component: ___________
  - Props Connected: ___________
  - Status: [ ] Complete

- **4C.4.8 — Backward Compatibility Confirmed**
  - Date Tested: ___________
  - Test Result: [ ] Pass [ ] Fail
  - Notes: ___________

- **4C.4.9 — Storybook Stories Added**
  - Date Completed: ___________
  - Story File: ___________
  - WithSavedViews Story: [ ] Complete
  - WithoutSavedViews Story: [ ] Complete
  - Manual Testing Done: [ ] Yes [ ] No

- **4C.4.10 — Reference Documentation Updated**
  - Date Completed: ___________
  - File: `docs/reference/ui-kit/HbcDataTable.md`
  - Props Table Updated: [ ]
  - Deferred-Scope Note Added: [ ]

- **4C.4.11 — Build & Tests**
  - Date Completed: ___________
  - Build Status: [ ] Pass [ ] Fail
  - Test Status: [ ] Pass [ ] Fail [ ] N/A
  - Notes: ___________

---

## Verification Evidence

Record the results of each verification command here.

| Verification | Command | Status | Evidence |
|---|---|---|---|
| Config Interface | `grep HbcDataTableSavedViewsConfig` | [ ] Pass | ___________ |
| Props Updated | `grep -A 20 "savedViewsConfig\?"` | [ ] Pass | ___________ |
| Hook Invocation | `grep useSavedViews` | [ ] Pass | ___________ |
| Storybook Story | `grep WithSavedViews` | [ ] Pass | ___________ |
| Documentation | `test -f HbcDataTable.md` | [ ] Pass | ___________ |
| Build Success | `pnpm turbo run build` | [ ] Pass | ___________ |

---

**End of PH4C.4**
