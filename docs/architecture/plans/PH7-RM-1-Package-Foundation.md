# PH7-RM-1 — Review Mode Package Foundation

> **Doc Classification:** Deferred Scope — remediation scope item identified during Phase 7 but not yet assigned to an active execution phase; confirm scheduling status before PH7.12 sign-off.

**Version:** 1.0
**Governed by:** CLAUDE.md v1.2 · HB-Intel-Blueprint-V4.md
**Date:** 2026-03-08
**Depends on:** HB-Intel-Foundation-Plan Phase 2 (shared packages complete), @hbc/ui-kit, @hbc/auth, @hbc/models, @hbc/data-access
**Blocks:** PH7-RM-2 (Shell and Layout), PH7-RM-3 (Sidebar), PH7-RM-4 (Card), PH7-RM-5 (Edit Drawer), PH7-RM-6 (Action Items)

---

## Summary

Phase 1 of the `@hbc/review-mode` package establishes the foundation: package scaffold, TypeScript type contracts (`IReviewConfig<T>`, action item and session tracking types), React Context/Provider for state management, and the `ReviewModeButton` entry point. This phase creates the contract that all downstream review-mode features will implement against.

## Why It Matters

- **Contract-First Design**: By defining `IReviewConfig<T>` as the central interface, all consuming modules (Accounting, Estimating, Project Hub, Leadership, Business Development) implement a consistent, type-safe review experience.
- **Isolation & Reusability**: Standalone package with zero module dependencies other than auth, models, data-access, and ui-kit ensures `@hbc/review-mode` can be shipped independently.
- **Session Tracking**: Foundation for audit trail (session start, records reviewed, action items created, elapsed time) critical for compliance and team accountability.
- **State Management**: Zustand + useReducer hybrid pattern (via Context/Provider) allows fine-grained control over review flow while supporting keyboard navigation, filtering, and drawer interactions across all layouts.

## Files to Create / Modify

### New Files (Package Scaffold)
1. `packages/review-mode/` (directory)
2. `packages/review-mode/package.json`
3. `packages/review-mode/tsconfig.json`
4. `packages/review-mode/src/index.ts` (barrel)
5. `packages/review-mode/README.md` (minimal - full docs in phase ADRs)

### New Files (Types)
6. `packages/review-mode/src/types/IReviewConfig.ts`
7. `packages/review-mode/src/types/IActionItem.ts`
8. `packages/review-mode/src/types/ISessionSummary.ts`
9. `packages/review-mode/src/types/index.ts` (barrel)

### New Files (Context & Provider)
10. `packages/review-mode/src/context/ReviewModeContext.ts`
11. `packages/review-mode/src/context/ReviewModeProvider.tsx`
12. `packages/review-mode/src/context/useReviewMode.ts`

### New Files (Components)
13. `packages/review-mode/src/components/ReviewModeButton.tsx`
14. `packages/review-mode/src/components/index.ts` (barrel)

### Modifications
15. `pnpm-workspace.yaml` — add `packages/review-mode` to packages list

---

## Implementation

### Step 1: Package Scaffold

#### Create `packages/review-mode/` Directory
```bash
mkdir -p packages/review-mode/src/{types,context,components}
```

#### Create `packages/review-mode/package.json`
```json
{
  "name": "@hbc/review-mode",
  "version": "0.1.0",
  "description": "HB Intel fullscreen record review experience with session tracking and action items.",
  "private": true,
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsc",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src",
    "test": "vitest"
  },
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "dependencies": {
    "@hbc/auth": "workspace:*",
    "@hbc/data-access": "workspace:*",
    "@hbc/models": "workspace:*",
    "@hbc/ui-kit": "workspace:*"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "typescript": "workspace:*"
  },
  "keywords": [
    "review-mode",
    "hb-intel",
    "fullscreen",
    "record-review"
  ]
}
```

#### Create `packages/review-mode/tsconfig.json`
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "dist",
    "**/*.test.ts",
    "**/*.test.tsx"
  ]
}
```

#### Create `packages/review-mode/README.md`
```markdown
# @hbc/review-mode

Fullscreen record-by-record review experience for HB Intel applications.

## Quick Start

```tsx
import { ReviewModeProvider, ReviewModeButton, type IReviewConfig } from '@hbc/review-mode';

const config: IReviewConfig<PursuitRecord> = {
  sessionKey: 'pursuits-review',
  sessionTitle: 'Pursuits Review',
  sections: [
    {
      id: 'active',
      label: 'Active Pursuits',
      data: pursuits,
      sidebarSchema: (p) => ({ title: p.title, subtitle: p.status }),
      renderCard: (p) => <PursuitCard pursuit={p} />,
    },
  ],
};

export function App() {
  return (
    <ReviewModeProvider>
      <ReviewModeButton config={config} />
    </ReviewModeProvider>
  );
}
```

## Documentation

- Architecture: `docs/architecture/adr/` (decision records)
- API Reference: `docs/reference/review-mode/`
- How-To Guides: `docs/how-to/developer/review-mode-integration.md`
- Troubleshooting: `docs/troubleshooting/review-mode.md`
```

#### Update `pnpm-workspace.yaml`
Add `packages/review-mode` to the packages list:
```yaml
packages:
  - 'packages/*'
  - 'apps/*'
  - 'tools/*'
```

---

### Step 2: Type Definitions

#### Create `packages/review-mode/src/types/IReviewConfig.ts`
```typescript
import type { ReactNode } from 'react';

/**
 * Configuration contract for a review-mode session.
 * Implementers pass this to ReviewModeButton or useReviewMode().open().
 *
 * @template T - Record type being reviewed. Must have `id: string`.
 *
 * @example
 * const config: IReviewConfig<PursuitRecord> = {
 *   sessionKey: 'pursuits',
 *   sessionTitle: 'Pursuits Review Session',
 *   sections: [{ ... }],
 * };
 */
export interface IReviewConfig<T extends { id: string }> {
  /**
   * Unique identifier for this review session type.
   * Used for session tracking, analytics, and permissions.
   * Convention: kebab-case, e.g., 'pursuits', 'estimates', 'project-hub'.
   */
  sessionKey: string;

  /**
   * Human-readable title displayed in review mode header.
   * E.g., "Pursuits Review", "Estimates Review".
   */
  sessionTitle: string;

  /**
   * Sections (tabs) within this review session.
   * Allows grouping records by category or workflow state.
   * At least one section is required.
   */
  sections: IReviewSection<T>[];

  /**
   * Optional permission key for write/edit access.
   * Defaults to `${sessionKey}:write`.
   * Used by EditDrawer and ActionItemTray to gate operations.
   *
   * @example
   * writePermissionKey: 'pursuits:edit'
   */
  writePermissionKey?: string;
}

/**
 * Represents a tab/category within a review session.
 * Each section displays a list of records and allows filtering, sidebar navigation, and editing.
 */
export interface IReviewSection<T extends { id: string }> {
  /**
   * Unique identifier for this section within the session.
   * Used as tab key and state tracking.
   */
  id: string;

  /**
   * Label displayed on the section tab in the header.
   * Can include counts: e.g., "Active (12)" populated by parent.
   */
  label: string;

  /**
   * Records to review in this section.
   * Filtered by active filter values at runtime.
   */
  data: T[];

  /**
   * Loading state for async data fetching.
   * When true, UI shows skeleton or spinner instead of cards.
   */
  isLoading?: boolean;

  /**
   * Render function for sidebar pill schema.
   * Called for each record; determines title, subtitle, status badge.
   * Used by Sidebar component to build searchable pill list.
   *
   * @param record - The record being reviewed.
   * @returns Schema object with title, subtitle, and optional status badge.
   */
  sidebarSchema: (record: T) => ISidebarPillSchema;

  /**
   * Render function for the main card body.
   * Called when a record is selected; displays full record details read-only.
   * Responsible for all display logic; review-mode provides container & layout.
   *
   * @param record - The active record to display.
   * @returns React node (typically a custom Card component).
   *
   * @example
   * renderCard: (pursuit) => (
   *   <PursuitDetailCard
   *     pursuit={pursuit}
   *     readonly
   *   />
   * )
   */
  renderCard: (record: T) => ReactNode;

  /**
   * Optional render function for an edit form in the right drawer.
   * If not provided, edit mode is disabled for this section.
   * Called when user clicks "Edit" button on card.
   *
   * @param record - The record being edited.
   * @param onSave - Callback when user saves edits.
   * @param onCancel - Callback to close drawer without saving.
   * @returns React node (typically a Form component).
   *
   * @example
   * renderEditForm: (pursuit, onSave, onCancel) => (
   *   <PursuitEditForm
   *     pursuit={pursuit}
   *     onSubmit={async (data) => {
   *       await updatePursuit(data);
   *       onSave();
   *     }}
   *     onCancel={onCancel}
   *   />
   * )
   */
  renderEditForm?: (
    record: T,
    onSave: () => void,
    onCancel: () => void
  ) => ReactNode;

  /**
   * Optional array of filters applied to records in this section.
   * Each filter provides options; user selects one option per filter.
   * Multiple filters use AND logic.
   */
  filters?: IReviewFilter<T>[];
}

/**
 * Sidebar pill schema: title, subtitle, and optional status badge.
 * Rendered by Sidebar component for each record as a searchable, selectable pill.
 */
export interface ISidebarPillSchema {
  /**
   * Primary label for the pill. Searched by sidebar search input.
   * Should be concise and distinctive, e.g., record name or primary ID.
   */
  title: string;

  /**
   * Optional secondary label, e.g., record status, owner, or date.
   * Displayed below title in muted color.
   */
  subtitle?: string;

  /**
   * Optional status badge with label and color variant.
   * Displayed on right side of pill with small background.
   * Variants: 'success' (green), 'warning' (orange), 'error' (red), 'neutral' (gray).
   */
  statusBadge?: {
    label: string;
    variant: 'success' | 'warning' | 'error' | 'neutral';
  };
}

/**
 * Optional filter applied to records in a section.
 * Rendered as a dropdown in the header filter bar.
 * Multiple filters use AND logic; user can clear individual or all filters.
 *
 * @template T - Record type being filtered.
 *
 * @example
 * const statusFilter: IReviewFilter<PursuitRecord> = {
 *   id: 'status',
 *   label: 'Status',
 *   filterFn: (record, value) => record.status === value,
 *   options: [
 *     { value: 'active', label: 'Active' },
 *     { value: 'won', label: 'Won' },
 *     { value: 'lost', label: 'Lost' },
 *   ],
 * };
 */
export interface IReviewFilter<T> {
  /**
   * Unique identifier for this filter within the section.
   * Used as state key and dropdown key.
   */
  id: string;

  /**
   * Label displayed in the filter dropdown.
   */
  label: string;

  /**
   * Filter predicate function.
   * Returns true if record matches the selected filter value.
   *
   * @param record - Record to test.
   * @param value - Selected filter option value.
   * @returns true if record matches the filter.
   */
  filterFn: (record: T, value: string) => boolean;

  /**
   * Array of selectable options for this filter.
   * User selects one option; no multi-select.
   */
  options: Array<{ value: string; label: string }>;
}
```

#### Create `packages/review-mode/src/types/IActionItem.ts`
```typescript
/**
 * Action item status enumeration.
 * Represents the lifecycle state of an action item created during review.
 */
export type ActionItemStatus = 'Open' | 'In Progress' | 'Done';

/**
 * Action item priority level.
 * Used for sorting, filtering, and visual urgency cues.
 */
export type ActionItemPriority = 'High' | 'Medium' | 'Low';

/**
 * Action item record as persisted to the HBIntelActionItems SharePoint list.
 * Created during review sessions to track follow-up work.
 *
 * @example
 * const item: IActionItem = {
 *   id: 'ai-001',
 *   title: 'Review pursuit assumptions',
 *   description: 'Verify market sizing with sales team.',
 *   assignedToUpn: 'john.doe@hbi.com',
 *   assignedToName: 'John Doe',
 *   dueDate: '2026-03-15',
 *   status: 'Open',
 *   priority: 'High',
 *   sourceModule: 'estimating',
 *   sourceRecordId: 'est-001',
 *   sourceRecordLabel: 'Acme Corp – Platform Migration',
 *   createdAt: '2026-03-08T14:30:00Z',
 *   createdByUpn: 'reviewer@hbi.com',
 * };
 */
export interface IActionItem {
  /**
   * Unique identifier (SharePoint item ID or GUID).
   * Assigned by data-access layer on save.
   */
  id: string;

  /**
   * Action item title. Displayed in list and session summary.
   * Should be concise and action-oriented.
   * Example: "Verify cost assumptions with finance"
   */
  title: string;

  /**
   * Optional detailed description.
   * Supports context and acceptance criteria.
   */
  description?: string;

  /**
   * UPN of assigned user.
   * Must be a valid Azure AD principal; used for notifications and reporting.
   */
  assignedToUpn?: string;

  /**
   * Display name of assigned user (resolved from UPN).
   * Populated by data-access layer; read-only to UI.
   */
  assignedToName?: string;

  /**
   * Due date in ISO-8601 format (YYYY-MM-DD).
   * Optional; null means no deadline.
   * Used for sorting and overdue detection.
   */
  dueDate?: string;

  /**
   * Current status of the action item.
   * Managed by external system (task management, backlog).
   * Review mode tracks creation; status updates happen elsewhere.
   */
  status: ActionItemStatus;

  /**
   * Priority level for sorting and urgency.
   * Guides triage and resource allocation.
   */
  priority: ActionItemPriority;

  /**
   * Module/app that created this action item.
   * Example: 'estimating', 'accounting', 'pursuits'.
   * Used for analytics and cross-module filtering.
   */
  sourceModule: string;

  /**
   * ID of the record being reviewed when action item was created.
   * Allows deep-linking back to the source record.
   */
  sourceRecordId: string;

  /**
   * Human-readable label of the source record.
   * Example: "Acme Corp – Platform Migration (Est-2024-001)".
   * Displayed in lists and session summary for context.
   */
  sourceRecordLabel: string;

  /**
   * Timestamp (ISO-8601) when action item was created.
   * Assigned by backend; read-only to UI.
   */
  createdAt: string;

  /**
   * UPN of user who created the action item.
   * For audit trail and assignment notifications.
   */
  createdByUpn: string;
}

/**
 * Form data structure for creating or updating an action item.
 * Passed to ActionItemTray form submission.
 * Subset of IActionItem (excludes computed/auditable fields).
 *
 * @example
 * const formData: IActionItemFormData = {
 *   title: 'Review assumptions',
 *   description: 'Verify with finance team.',
 *   assignedToUpn: 'john@hbi.com',
 *   dueDate: '2026-03-15',
 *   priority: 'High',
 * };
 */
export interface IActionItemFormData {
  /**
   * Action item title. Required; must be non-empty.
   */
  title: string;

  /**
   * Optional description.
   */
  description?: string;

  /**
   * UPN of assigned user. Optional; can be null for unassigned items.
   * Validated against Azure AD principals.
   */
  assignedToUpn?: string;

  /**
   * Due date in ISO-8601 format (YYYY-MM-DD). Optional.
   */
  dueDate?: string;

  /**
   * Priority level. Required.
   */
  priority: ActionItemPriority;
}
```

#### Create `packages/review-mode/src/types/ISessionSummary.ts`
```typescript
import type { ActionItemPriority, ActionItemStatus } from './IActionItem.js';

/**
 * Session summary: aggregate metrics and artifacts from a completed review session.
 * Displayed on exit; used for analytics, compliance audit trail, and team accountability.
 *
 * @example
 * const summary: ISessionSummary = {
 *   sessionKey: 'pursuits',
 *   sessionTitle: 'Q1 Pursuits Review',
 *   startedAt: '2026-03-08T09:00:00Z',
 *   endedAt: '2026-03-08T11:30:00Z',
 *   elapsedMinutes: 150,
 *   sectionsReviewed: [
 *     { sectionId: 'active', sectionLabel: 'Active', totalRecords: 12, reviewedRecords: 10 },
 *   ],
 *   actionItemsCreated: [
 *     { title: 'Verify assumptions', assignedToName: 'Jane Smith', dueDate: '2026-03-15', priority: 'High', sourceRecordLabel: 'Acme Corp' },
 *   ],
 * };
 */
export interface ISessionSummary {
  /**
   * Session key (matches IReviewConfig.sessionKey).
   * Used for analytics, filtering, and audit logging.
   */
  sessionKey: string;

  /**
   * Session title (matches IReviewConfig.sessionTitle).
   * Displayed in summary header.
   */
  sessionTitle: string;

  /**
   * ISO-8601 timestamp when session started.
   * Assigned when ReviewModeShell mounts.
   */
  startedAt: string;

  /**
   * ISO-8601 timestamp when session ended.
   * Assigned when user clicks Exit or session times out.
   */
  endedAt: string;

  /**
   * Total elapsed time in minutes (computed from startedAt and endedAt).
   * Used for team workload and productivity analytics.
   */
  elapsedMinutes: number;

  /**
   * Array of section summaries (one per section in config).
   * Shows progress: how many records reviewed in each section.
   */
  sectionsReviewed: ISessionSectionSummary[];

  /**
   * Array of action items created during this session.
   * Subset of data (title, assignee, due date, priority, source).
   * Displayed in summary and exported to compliance audit trail.
   */
  actionItemsCreated: ISessionActionItemSummary[];
}

/**
 * Summary for a single review section within a session.
 * Tracks progress (reviewed count / total count).
 */
export interface ISessionSectionSummary {
  /**
   * Section ID (matches IReviewSection.id).
   */
  sectionId: string;

  /**
   * Section label (matches IReviewSection.label).
   * Displayed in summary breakdown.
   */
  sectionLabel: string;

  /**
   * Total record count in this section (after filtering).
   */
  totalRecords: number;

  /**
   * Count of records marked as reviewed in this section.
   * Ratio (reviewedRecords / totalRecords) shown as progress bar.
   */
  reviewedRecords: number;
}

/**
 * Action item summary excerpt displayed in session summary.
 * Subset of IActionItem for readability and audit compliance.
 */
export interface ISessionActionItemSummary {
  /**
   * Action item title.
   */
  title: string;

  /**
   * Assigned-to display name (if assigned).
   */
  assignedToName?: string;

  /**
   * Due date (ISO-8601).
   */
  dueDate?: string;

  /**
   * Priority level.
   */
  priority: ActionItemPriority;

  /**
   * Source record label for context.
   * Example: "Acme Corp – Platform Migration".
   */
  sourceRecordLabel: string;
}
```

#### Create `packages/review-mode/src/types/index.ts`
```typescript
/**
 * Barrel export for all review-mode types.
 * Public API for consuming modules.
 */

export type {
  IReviewConfig,
  IReviewSection,
  ISidebarPillSchema,
  IReviewFilter,
} from './IReviewConfig.js';

export type {
  IActionItem,
  IActionItemFormData,
  ActionItemStatus,
  ActionItemPriority,
} from './IActionItem.js';

export type {
  ISessionSummary,
  ISessionSectionSummary,
  ISessionActionItemSummary,
} from './ISessionSummary.js';
```

---

### Step 3: Context & Provider

#### Create `packages/review-mode/src/context/ReviewModeContext.ts`
```typescript
import { createContext } from 'react';
import type {
  IReviewConfig,
  IReviewSection,
  IReviewFilter,
} from '../types/IReviewConfig.js';
import type { IActionItem } from '../types/IActionItem.js';

/**
 * Review mode state machine.
 * Tracks active section, record, review progress, filters, UI toggles,
 * and session artifacts (action items, start time).
 *
 * @template T - Record type being reviewed. Defaults to { id: string }.
 */
export interface IReviewModeState<T extends { id: string } = { id: string }> {
  /**
   * True when review overlay is open (fullscreen display active).
   */
  isOpen: boolean;

  /**
   * Current config passed to open(). Null when closed.
   * Holds all sections, filters, render functions.
   */
  config: IReviewConfig<T> | null;

  /**
   * ID of the active section (tab).
   * Must match one of config.sections[].id when open.
   * Null when closed.
   */
  activeSectionId: string | null;

  /**
   * ID of the currently selected record in the active section.
   * Must match one of the records in the active section's data.
   * Null when no section is active or no record selected.
   */
  activeRecordId: string | null;

  /**
   * Set of record IDs marked as reviewed in this session.
   * Persists across section changes.
   * Cleared when session ends.
   */
  reviewedRecordIds: Set<string>;

  /**
   * Current filter selections: filterId -> selected value.
   * Empty object when no filters applied.
   * Updated by setFilter(); used to compute filtered data.
   */
  filterValues: Record<string, string>;

  /**
   * Sidebar search text.
   * Filters pills (sidebar) by title/subtitle match.
   * Case-insensitive substring match.
   */
  sidebarSearch: string;

  /**
   * True when sidebar (left panel) is collapsed.
   * Toggled by toggleSidebar(); affects layout width.
   */
  sidebarCollapsed: boolean;

  /**
   * ISO-8601 timestamp when session started.
   * Set when open() is called.
   * Null when closed.
   * Used to compute elapsedMinutes in session summary.
   */
  sessionStartedAt: string | null;

  /**
   * Action items created during this session (in-memory buffer).
   * Populated by addSessionActionItem().
   * Exported to session summary and persisted to SharePoint on exit.
   */
  sessionActionItems: IActionItem[];

  /**
   * True when edit drawer is open (right panel visible).
   * Toggled by openEditDrawer() and closeEditDrawer().
   */
  isEditDrawerOpen: boolean;

  /**
   * True when action item creation tray is open (right panel visible).
   * Toggled by openActionItemTray() and closeActionItemTray().
   * Cannot be open simultaneously with isEditDrawerOpen.
   */
  isActionItemTrayOpen: boolean;
}

/**
 * Review mode action creators (reducer dispatch actions).
 * All methods called by UI components and hooks.
 */
export interface IReviewModeActions {
  /**
   * Open review mode with the given config.
   * Sets isOpen=true, initializes activeSectionId to first section.
   * Starts session timer (sessionStartedAt = now).
   *
   * @param config - IReviewConfig<T> defining sections, filters, render functions.
   */
  open: (config: IReviewConfig<any>) => void;

  /**
   * Close review mode.
   * Sets isOpen=false, clears activeRecordId/activeSectionId/config.
   * Stops session (but session artifacts remain for summary export).
   */
  close: () => void;

  /**
   * Activate a different section (tab).
   * Sets activeSectionId and resets activeRecordId to first record (or null).
   * Respects current filter values.
   *
   * @param sectionId - ID of section to activate (must exist in config.sections).
   */
  setActiveSection: (sectionId: string) => void;

  /**
   * Select a record for display.
   * Sets activeRecordId to the specified record.
   * Card body re-renders with activeRecord.
   *
   * @param recordId - ID of record to select.
   */
  setActiveRecord: (recordId: string) => void;

  /**
   * Advance to the next record in the active section.
   * Navigates within filtered+sorted list.
   * No-op if already on last record.
   * Respects current filter values and sort order.
   */
  goNext: () => void;

  /**
   * Advance to the previous record in the active section.
   * Navigates within filtered+sorted list.
   * No-op if already on first record.
   */
  goPrevious: () => void;

  /**
   * Mark a record as reviewed.
   * Adds recordId to reviewedRecordIds.
   * Typically called by Card component when user reads it.
   * Used to compute progress (reviewed count / total count).
   *
   * @param recordId - ID of record to mark reviewed.
   */
  markReviewed: (recordId: string) => void;

  /**
   * Update a single filter value.
   * Sets filterValues[filterId] = value.
   * Filtered data re-computed; activeRecordId reset to first matching record.
   * Pass empty string '' to clear a filter.
   *
   * @param filterId - ID of filter to update (must exist in active section's filters).
   * @param value - Selected option value (or '' to clear).
   */
  setFilter: (filterId: string, value: string) => void;

  /**
   * Set sidebar search text.
   * Filters pills by title/subtitle substring match.
   *
   * @param search - Search text (case-insensitive).
   */
  setSidebarSearch: (search: string) => void;

  /**
   * Toggle sidebar visibility.
   * Inverts sidebarCollapsed; affects layout.
   */
  toggleSidebar: () => void;

  /**
   * Open the edit drawer (right panel).
   * Sets isEditDrawerOpen=true, isActionItemTrayOpen=false.
   * EditDrawer component renders renderEditForm for activeRecord.
   */
  openEditDrawer: () => void;

  /**
   * Close the edit drawer.
   * Sets isEditDrawerOpen=false.
   */
  closeEditDrawer: () => void;

  /**
   * Open the action item creation tray (right panel).
   * Sets isActionItemTrayOpen=true, isEditDrawerOpen=false.
   * ActionItemTray renders form for creating a new action item.
   */
  openActionItemTray: () => void;

  /**
   * Close the action item tray.
   * Sets isActionItemTrayOpen=false.
   */
  closeActionItemTray: () => void;

  /**
   * Add an action item to the session buffer.
   * Appends to sessionActionItems.
   * Later exported to session summary and persisted to SharePoint.
   *
   * @param item - IActionItem to add (typically with id and createdAt assigned by backend).
   */
  addSessionActionItem: (item: IActionItem) => void;
}

/**
 * React Context holding review mode state + actions.
 * Provided by ReviewModeProvider; consumed by useReviewMode() hook and components.
 */
export const ReviewModeContext = createContext<
  (IReviewModeState & IReviewModeActions) | null
>(null);
```

#### Create `packages/review-mode/src/context/ReviewModeProvider.tsx`
```typescript
import React, { useCallback, useReducer, useEffect, ReactNode } from 'react';
import {
  ReviewModeContext,
  type IReviewModeState,
  type IReviewModeActions,
} from './ReviewModeContext.js';
import type { IReviewConfig } from '../types/IReviewConfig.js';
import type { IActionItem } from '../types/IActionItem.js';

type ReviewModeAction =
  | { type: 'OPEN'; payload: IReviewConfig<any> }
  | { type: 'CLOSE' }
  | { type: 'SET_ACTIVE_SECTION'; payload: string }
  | { type: 'SET_ACTIVE_RECORD'; payload: string }
  | { type: 'GO_NEXT' }
  | { type: 'GO_PREVIOUS' }
  | { type: 'MARK_REVIEWED'; payload: string }
  | { type: 'SET_FILTER'; payload: { filterId: string; value: string } }
  | { type: 'SET_SIDEBAR_SEARCH'; payload: string }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'OPEN_EDIT_DRAWER' }
  | { type: 'CLOSE_EDIT_DRAWER' }
  | { type: 'OPEN_ACTION_ITEM_TRAY' }
  | { type: 'CLOSE_ACTION_ITEM_TRAY' }
  | { type: 'ADD_SESSION_ACTION_ITEM'; payload: IActionItem };

const initialState: IReviewModeState = {
  isOpen: false,
  config: null,
  activeSectionId: null,
  activeRecordId: null,
  reviewedRecordIds: new Set(),
  filterValues: {},
  sidebarSearch: '',
  sidebarCollapsed: false,
  sessionStartedAt: null,
  sessionActionItems: [],
  isEditDrawerOpen: false,
  isActionItemTrayOpen: false,
};

/**
 * Reducer function for review mode state transitions.
 * Enforces state invariants and computes derived state (filtered records, navigation bounds).
 */
function reviewModeReducer(
  state: IReviewModeState,
  action: ReviewModeAction
): IReviewModeState {
  switch (action.type) {
    case 'OPEN': {
      const config = action.payload;
      const firstSectionId = config.sections[0]?.id ?? null;
      const firstSection = config.sections[0];
      const firstRecord = firstSection?.data[0];

      return {
        ...state,
        isOpen: true,
        config,
        activeSectionId: firstSectionId,
        activeRecordId: firstRecord?.id ?? null,
        reviewedRecordIds: new Set(),
        filterValues: {},
        sidebarSearch: '',
        sidebarCollapsed: false,
        sessionStartedAt: new Date().toISOString(),
        sessionActionItems: [],
        isEditDrawerOpen: false,
        isActionItemTrayOpen: false,
      };
    }

    case 'CLOSE': {
      return {
        ...state,
        isOpen: false,
        activeSectionId: null,
        activeRecordId: null,
        config: null,
        // Preserve session artifacts (reviewedRecordIds, sessionStartedAt, sessionActionItems)
        // for session summary export before clearing isOpen.
      };
    }

    case 'SET_ACTIVE_SECTION': {
      const sectionId = action.payload;
      const section = state.config?.sections.find((s) => s.id === sectionId);

      if (!section) return state;

      // Apply current filters to get visible records.
      const filteredData = getFilteredData(section, state.filterValues);
      const firstRecord = filteredData[0];

      return {
        ...state,
        activeSectionId: sectionId,
        activeRecordId: firstRecord?.id ?? null,
      };
    }

    case 'SET_ACTIVE_RECORD': {
      return {
        ...state,
        activeRecordId: action.payload,
      };
    }

    case 'GO_NEXT': {
      if (!state.config || !state.activeSectionId || !state.activeRecordId) {
        return state;
      }

      const section = state.config.sections.find(
        (s) => s.id === state.activeSectionId
      );
      if (!section) return state;

      const filteredData = getFilteredData(section, state.filterValues);
      const currentIndex = filteredData.findIndex(
        (r) => r.id === state.activeRecordId
      );

      if (currentIndex === -1 || currentIndex === filteredData.length - 1) {
        return state; // Already at end or record not found.
      }

      const nextRecord = filteredData[currentIndex + 1];
      return {
        ...state,
        activeRecordId: nextRecord?.id ?? state.activeRecordId,
      };
    }

    case 'GO_PREVIOUS': {
      if (!state.config || !state.activeSectionId || !state.activeRecordId) {
        return state;
      }

      const section = state.config.sections.find(
        (s) => s.id === state.activeSectionId
      );
      if (!section) return state;

      const filteredData = getFilteredData(section, state.filterValues);
      const currentIndex = filteredData.findIndex(
        (r) => r.id === state.activeRecordId
      );

      if (currentIndex <= 0) {
        return state; // Already at start or record not found.
      }

      const prevRecord = filteredData[currentIndex - 1];
      return {
        ...state,
        activeRecordId: prevRecord?.id ?? state.activeRecordId,
      };
    }

    case 'MARK_REVIEWED': {
      const newReviewedIds = new Set(state.reviewedRecordIds);
      newReviewedIds.add(action.payload);
      return {
        ...state,
        reviewedRecordIds: newReviewedIds,
      };
    }

    case 'SET_FILTER': {
      const { filterId, value } = action.payload;
      const newFilterValues = { ...state.filterValues };

      if (value === '') {
        delete newFilterValues[filterId];
      } else {
        newFilterValues[filterId] = value;
      }

      // Re-compute filtered data and reset activeRecordId.
      if (!state.config || !state.activeSectionId) {
        return { ...state, filterValues: newFilterValues };
      }

      const section = state.config.sections.find(
        (s) => s.id === state.activeSectionId
      );
      if (!section) return { ...state, filterValues: newFilterValues };

      const filteredData = getFilteredData(section, newFilterValues);
      const firstRecord = filteredData[0];

      return {
        ...state,
        filterValues: newFilterValues,
        activeRecordId: firstRecord?.id ?? null,
      };
    }

    case 'SET_SIDEBAR_SEARCH': {
      return {
        ...state,
        sidebarSearch: action.payload,
      };
    }

    case 'TOGGLE_SIDEBAR': {
      return {
        ...state,
        sidebarCollapsed: !state.sidebarCollapsed,
      };
    }

    case 'OPEN_EDIT_DRAWER': {
      return {
        ...state,
        isEditDrawerOpen: true,
        isActionItemTrayOpen: false,
      };
    }

    case 'CLOSE_EDIT_DRAWER': {
      return {
        ...state,
        isEditDrawerOpen: false,
      };
    }

    case 'OPEN_ACTION_ITEM_TRAY': {
      return {
        ...state,
        isActionItemTrayOpen: true,
        isEditDrawerOpen: false,
      };
    }

    case 'CLOSE_ACTION_ITEM_TRAY': {
      return {
        ...state,
        isActionItemTrayOpen: false,
      };
    }

    case 'ADD_SESSION_ACTION_ITEM': {
      return {
        ...state,
        sessionActionItems: [...state.sessionActionItems, action.payload],
      };
    }

    default:
      return state;
  }
}

/**
 * Helper: filter records by current filter values.
 * Applies all active filters with AND logic.
 */
function getFilteredData(
  section: ReturnType<IReviewConfig['sections'][0]>,
  filterValues: Record<string, string>
): typeof section.data {
  return section.data.filter((record) => {
    // Apply all active filters; all must match (AND logic).
    return (section.filters ?? []).every((filter) => {
      const selectedValue = filterValues[filter.id];
      // If no value selected for this filter, pass all records.
      if (!selectedValue) return true;
      // Apply filter predicate.
      return filter.filterFn(record, selectedValue);
    });
  });
}

interface ReviewModeProviderProps {
  children: ReactNode;
}

/**
 * ReviewModeProvider component.
 * Wraps the application with review mode state management.
 * Must wrap ReviewModeButton and any component using useReviewMode().
 *
 * @example
 * <ReviewModeProvider>
 *   <App />
 * </ReviewModeProvider>
 */
export function ReviewModeProvider({ children }: ReviewModeProviderProps) {
  const [state, dispatch] = useReducer(reviewModeReducer, initialState);

  const actions: IReviewModeActions = {
    open: useCallback(
      (config: IReviewConfig<any>) => {
        dispatch({ type: 'OPEN', payload: config });
      },
      []
    ),

    close: useCallback(() => {
      dispatch({ type: 'CLOSE' });
    }, []),

    setActiveSection: useCallback((sectionId: string) => {
      dispatch({ type: 'SET_ACTIVE_SECTION', payload: sectionId });
    }, []),

    setActiveRecord: useCallback((recordId: string) => {
      dispatch({ type: 'SET_ACTIVE_RECORD', payload: recordId });
    }, []),

    goNext: useCallback(() => {
      dispatch({ type: 'GO_NEXT' });
    }, []),

    goPrevious: useCallback(() => {
      dispatch({ type: 'GO_PREVIOUS' });
    }, []),

    markReviewed: useCallback((recordId: string) => {
      dispatch({ type: 'MARK_REVIEWED', payload: recordId });
    }, []),

    setFilter: useCallback((filterId: string, value: string) => {
      dispatch({ type: 'SET_FILTER', payload: { filterId, value } });
    }, []),

    setSidebarSearch: useCallback((search: string) => {
      dispatch({ type: 'SET_SIDEBAR_SEARCH', payload: search });
    }, []),

    toggleSidebar: useCallback(() => {
      dispatch({ type: 'TOGGLE_SIDEBAR' });
    }, []),

    openEditDrawer: useCallback(() => {
      dispatch({ type: 'OPEN_EDIT_DRAWER' });
    }, []),

    closeEditDrawer: useCallback(() => {
      dispatch({ type: 'CLOSE_EDIT_DRAWER' });
    }, []),

    openActionItemTray: useCallback(() => {
      dispatch({ type: 'OPEN_ACTION_ITEM_TRAY' });
    }, []),

    closeActionItemTray: useCallback(() => {
      dispatch({ type: 'CLOSE_ACTION_ITEM_TRAY' });
    }, []),

    addSessionActionItem: useCallback((item: IActionItem) => {
      dispatch({ type: 'ADD_SESSION_ACTION_ITEM', payload: item });
    }, []),
  };

  // Keyboard navigation: arrow keys and Escape.
  useEffect(() => {
    if (!state.isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Arrow right / Down: next record
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        actions.goNext();
      }

      // Arrow left / Up: previous record
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        actions.goPrevious();
      }

      // Escape: close review mode
      if (e.key === 'Escape') {
        e.preventDefault();
        actions.close();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.isOpen, actions]);

  const value = {
    ...state,
    ...actions,
  };

  return (
    <ReviewModeContext.Provider value={value}>
      {children}
    </ReviewModeContext.Provider>
  );
}
```

#### Create `packages/review-mode/src/context/useReviewMode.ts`
```typescript
import { useContext } from 'react';
import { ReviewModeContext } from './ReviewModeContext.js';

/**
 * Hook to access review mode state and actions.
 * Must be called within a ReviewModeProvider.
 *
 * @returns Review mode state and action creators.
 * @throws Error if called outside ReviewModeProvider.
 *
 * @example
 * function MyComponent() {
 *   const { isOpen, activeRecordId } = useReviewMode();
 *   return isOpen ? <div>Record {activeRecordId}</div> : null;
 * }
 */
export function useReviewMode() {
  const ctx = useContext(ReviewModeContext);
  if (!ctx) {
    throw new Error(
      'useReviewMode must be used within a ReviewModeProvider. ' +
        'Wrap your app or component tree with <ReviewModeProvider>.'
    );
  }
  return ctx;
}
```

---

### Step 4: Components

#### Create `packages/review-mode/src/components/ReviewModeButton.tsx`
```typescript
import React from 'react';
import { Button } from '@hbc/ui-kit';
import type { IReviewConfig } from '../types/IReviewConfig.js';
import { useReviewMode } from '../context/useReviewMode.js';

interface ReviewModeButtonProps<T extends { id: string }> {
  /**
   * Review configuration to load when button is clicked.
   */
  config: IReviewConfig<T>;

  /**
   * Optional button label (default: "Review Mode").
   */
  label?: string;

  /**
   * Optional additional CSS class name.
   */
  className?: string;

  /**
   * Optional CSS-in-JS inline styles.
   */
  style?: React.CSSProperties;

  /**
   * Optional icon URL or Fluent icon name.
   * If not provided, defaults to presentation-screen icon.
   */
  icon?: string;

  /**
   * Optional callback fired when review mode closes.
   * Useful for parent components to react to session end.
   */
  onReviewEnd?: () => void;
}

/**
 * ReviewModeButton component.
 * Trigger button for entering fullscreen review mode.
 * Typically rendered in a page toolbar or action bar.
 *
 * @example
 * <ReviewModeProvider>
 *   <ReviewModeButton
 *     config={estimatingReviewConfig}
 *     label="Review Estimates"
 *   />
 * </ReviewModeProvider>
 */
export function ReviewModeButton<T extends { id: string }>(
  props: ReviewModeButtonProps<T>
) {
  const {
    config,
    label = 'Review Mode',
    className,
    style,
    icon = '📊',
  } = props;

  const { open } = useReviewMode();

  const handleClick = () => {
    open(config);
  };

  return (
    <Button
      onClick={handleClick}
      appearance="outline"
      className={className}
      style={style}
      aria-label={label}
      title={`Open ${config.sessionTitle}`}
    >
      <span style={{ marginRight: '0.5rem' }}>{icon}</span>
      {label}
    </Button>
  );
}
```

#### Create `packages/review-mode/src/components/index.ts`
```typescript
/**
 * Barrel export for all review-mode components.
 * Public API for consuming modules.
 */

export { ReviewModeButton } from './ReviewModeButton.js';
export { ReviewModeShell } from './ReviewModeShell.js';
```

---

### Step 5: Update Root Barrel Export

#### Update `packages/review-mode/src/index.ts`
```typescript
/**
 * @hbc/review-mode – Fullscreen record review experience with session tracking.
 *
 * ## Quick Start
 *
 * ```tsx
 * import {
 *   ReviewModeProvider,
 *   ReviewModeButton,
 *   type IReviewConfig,
 * } from '@hbc/review-mode';
 *
 * const config: IReviewConfig<Record> = {
 *   sessionKey: 'my-session',
 *   sessionTitle: 'My Review',
 *   sections: [{ ... }],
 * };
 *
 * export function App() {
 *   return (
 *     <ReviewModeProvider>
 *       <ReviewModeButton config={config} />
 *     </ReviewModeProvider>
 *   );
 * }
 * ```
 *
 * ## Documentation
 *
 * - **How-To**: `docs/how-to/developer/review-mode-integration.md`
 * - **API Reference**: `docs/reference/review-mode/`
 * - **Architecture**: `docs/architecture/adr/0009-review-mode-architecture.md`
 * - **Troubleshooting**: `docs/troubleshooting/review-mode.md`
 */

// Context & Provider
export { ReviewModeProvider } from './context/ReviewModeProvider.js';
export { useReviewMode } from './context/useReviewMode.js';

// Components
export { ReviewModeButton } from './components/ReviewModeButton.js';
export { ReviewModeShell } from './components/ReviewModeShell.js';

// Types (public API)
export type {
  IReviewConfig,
  IReviewSection,
  ISidebarPillSchema,
  IReviewFilter,
} from './types/IReviewConfig.js';

export type {
  IActionItem,
  IActionItemFormData,
  ActionItemStatus,
  ActionItemPriority,
} from './types/IActionItem.js';

export type {
  ISessionSummary,
  ISessionSectionSummary,
  ISessionActionItemSummary,
} from './types/ISessionSummary.js';
```

---

### Step 6: Placeholder for ReviewModeShell

#### Create `packages/review-mode/src/components/ReviewModeShell.tsx`
```typescript
import React from 'react';
import { useReviewMode } from '../context/useReviewMode.js';

/**
 * Placeholder for ReviewModeShell component.
 * Implemented in PH7-RM-2.
 *
 * This component:
 * - Renders the fullscreen overlay when isOpen === true
 * - Calls useFullscreen().enter() on mount (context-aware: SPFx vs PWA)
 * - Renders ReviewModeHeader + main content area (sidebar + card)
 * - Shows SessionSummaryScreen when exiting
 * - Returns null when isOpen === false
 */
export function ReviewModeShell() {
  const { isOpen } = useReviewMode();

  if (!isOpen) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'var(--colorNeutralBackground1)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
        ReviewModeShell placeholder – Implemented in PH7-RM-2
      </div>
    </div>
  );
}
```

---

## Verification

### Run TypeScript Check
```bash
pnpm turbo run typecheck --filter=@hbc/review-mode
```

Expected output: No errors. All type definitions validated.

### Confirm Package Accessibility
```bash
pnpm -F @hbc/review-mode list
```

Expected output: Package listed with all peer dependencies resolved.

### Verify Exports
```bash
node -e "import('@hbc/review-mode').then(m => console.log(Object.keys(m).sort())).catch(console.error)"
```

Expected output:
```
[
  'IActionItem',
  'IActionItemFormData',
  'IReviewConfig',
  'IReviewFilter',
  'IReviewSection',
  'ISessionActionItemSummary',
  'ISessionSectionSummary',
  'ISessionSummary',
  'ReviewModeButton',
  'ReviewModeProvider',
  'ReviewModeShell',
  'useReviewMode',
  ... (other type exports)
]
```

---

## Definition of Done

- [ ] Package directory scaffold created (`packages/review-mode/`)
- [ ] `package.json` configured with correct peer dependencies and build scripts
- [ ] `tsconfig.json` extends base and targets `dist/` output
- [ ] All four type files created with full JSDoc comments:
  - [ ] `IReviewConfig.ts` (IReviewConfig, IReviewSection, ISidebarPillSchema, IReviewFilter)
  - [ ] `IActionItem.ts` (IActionItem, IActionItemFormData, ActionItemStatus, ActionItemPriority)
  - [ ] `ISessionSummary.ts` (ISessionSummary, ISessionSectionSummary, ISessionActionItemSummary)
  - [ ] `index.ts` barrel
- [ ] Context files created with full implementations:
  - [ ] `ReviewModeContext.ts` (interface definitions)
  - [ ] `ReviewModeProvider.tsx` (reducer, useReducer, keyboard listeners)
  - [ ] `useReviewMode.ts` (hook with error boundary)
- [ ] Components created:
  - [ ] `ReviewModeButton.tsx` (trigger button, styled with outline appearance)
  - [ ] `ReviewModeShell.tsx` (placeholder for PH7-RM-2)
  - [ ] `components/index.ts` barrel
- [ ] Root barrel export `src/index.ts` complete with all public APIs
- [ ] `pnpm-workspace.yaml` updated to include `packages/review-mode`
- [ ] `pnpm turbo run typecheck --filter=@hbc/review-mode` passes without errors
- [ ] README.md written with quick-start example
- [ ] All type definitions include complete JSDoc with examples
- [ ] Reducer handles all state transitions correctly (navigation, filtering, drawer toggles)
- [ ] Keyboard event listeners (arrow keys, Escape) wired in ReviewModeProvider useEffect
- [ ] No build errors or import resolution issues

---

<!-- IMPLEMENTATION PROGRESS & NOTES
Phase PH7-RM-1 complete: 2026-03-08
Blocked by: Awaiting Phase 1 completion before PH7-RM-2 (Shell/Layout) can proceed
Next: PH7-RM-2 – Shell and Layout (ReviewModeShell, ReviewModeHeader, useFullscreen)
Documentation: docs/architecture/plans/PH7-RM-2-Shell-and-Layout.md (in progress)
-->
