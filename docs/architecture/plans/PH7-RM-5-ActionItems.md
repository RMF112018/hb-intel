# PH7-RM-5 — Action Items: FAB, Tray, List, and Data Layer


> **Doc Classification:** Deferred Scope — Phase 7 remediation scope item. PH7.12 sign-off complete (2026-03-09, ADR-0091). Assigned to Phase 3 — Project Hub and Project Context (OD-006 resolved 2026-03-16). Remains Deferred Scope until Phase 3 kickoff approval, at which point reclassify to Canonical Normative Plan. Do not implement until Phase 3 is formally activated.

**Version:** 1.0
**Governed by:** CLAUDE.md v1.2 · HB-Intel-Blueprint-V4.md
**Date:** 2026-03-08
**Depends on:** PH7-RM-4 (Card and Edit Drawer complete), @hbc/ui-kit, @hbc/data-access, TanStack Query
**Blocks:** PH7-RM-6 (Session Summary screen), PH7-RM-7 (Estimating Integration)

---

## Summary

Phase 5 implements the action item creation and list workflow within Review Mode. This includes the floating action button (FAB) positioned bottom-right, the compact ActionItemTray slide-up form for quick item creation, the ActionItemList component shown at the bottom of each record card, the TanStack Query hook `useActionItems`, and the complete data layer (`actionItemsQueries.ts`) for CRUD operations against the `/api/review/action-items` endpoints. Session context is extended to collect all action items created during a review session for export in Phase 6.

## Why It Matters

- **Core Review Workflow**: Action items are the primary output of a review session—capturing follow-ups, blockers, and assignments.
- **Non-Blocking Creation**: The compact tray allows reviewers to quickly add action items without leaving the record view.
- **Source Attribution**: Each action item automatically captures the source record (module, record ID, label) for traceability.
- **Async Data Sync**: TanStack Query ensures action items are fetched, cached, and invalidated correctly when records change.
- **Session Completeness**: Session context tracks all action items created this session for the exit summary screen (Phase 6).
- **Keyboard Accessibility**: "A" shortcut opens the tray; Enter submits; Escape closes.

## Files to Create / Modify

### New Files
1. `packages/review-mode/src/components/ActionItems/ActionItemFab.tsx`
2. `packages/review-mode/src/components/ActionItems/ActionItemTray.tsx`
3. `packages/review-mode/src/components/ActionItems/ActionItemList.tsx`
4. `packages/review-mode/src/components/ActionItems/index.ts` (barrel)
5. `packages/review-mode/src/hooks/useActionItems.ts`
6. `packages/review-mode/src/data/actionItemsQueries.ts`

### Modifications
7. `packages/review-mode/src/context/ReviewModeContext.ts` (extend session state)
8. `packages/review-mode/src/hooks/useKeyboardNav.ts` (add KeyA handler)

---

## Implementation

### Step 1: Data Layer — `actionItemsQueries.ts`

#### Create `packages/review-mode/src/data/actionItemsQueries.ts`

This is the complete backend integration using `getHttpAdapter()` from `@hbc/data-access`.

```typescript
import { getHttpAdapter } from '@hbc/data-access';
import type { IActionItem, IActionItemFormData } from '../types/index.js';

/**
 * actionItemsQueries.ts
 *
 * Complete CRUD operations for action items via the review-mode API endpoints.
 * Endpoints:
 *   GET  /api/review/action-items?sourceRecordId={id}
 *   POST /api/review/action-items
 *   PATCH /api/review/action-items/:id
 *   DELETE /api/review/action-items/:id
 *
 * All functions use getHttpAdapter() for context-aware HTTP (PWA vs SPFx).
 */

/**
 * Fetch all action items for a given source record.
 *
 * @param sourceRecordId - The ID of the record being reviewed.
 * @returns Promise<IActionItem[]> – array of action items (may be empty).
 *
 * @example
 * const items = await fetchActionItems('pursuit-123');
 */
export async function fetchActionItems(sourceRecordId: string): Promise<IActionItem[]> {
  const http = getHttpAdapter();
  const url = `/api/review/action-items?sourceRecordId=${encodeURIComponent(sourceRecordId)}`;
  const response = await http.get<IActionItem[]>(url);
  return response;
}

/**
 * Create a new action item.
 * Auto-populates createdAt and createdByUpn from the server (based on auth context).
 *
 * @param data - Action item data (omits id, createdAt, createdByUpn).
 * @returns Promise<IActionItem> – the created item with id, createdAt, createdByUpn set.
 *
 * @example
 * const item = await createActionItem({
 *   title: 'Follow up with owner',
 *   description: 'Confirm bid bond timeline',
 *   assignedToUpn: 'jane.smith@company.com',
 *   dueDate: '2026-03-15',
 *   priority: 'high',
 *   sourceModule: 'estimating',
 *   sourceRecordId: 'pursuit-123',
 *   sourceRecordLabel: 'Ocean Towers — 2026-OCEAN',
 * });
 */
export async function createActionItem(
  data: Omit<IActionItem, 'id' | 'createdAt' | 'createdByUpn'>
): Promise<IActionItem> {
  const http = getHttpAdapter();
  const response = await http.post<IActionItem>('/api/review/action-items', data);
  return response;
}

/**
 * Update an existing action item.
 * Supports partial updates: only supplied fields are changed.
 * Common use cases:
 *   - Change status: Open → In Progress → Done
 *   - Update assignment: reassign to another person
 *   - Change due date
 *
 * @param params - Update payload: { id, ...partial fields }.
 * @returns Promise<IActionItem> – the updated item.
 *
 * @example
 * const updated = await updateActionItem({
 *   id: 'action-item-abc123',
 *   status: 'In Progress',
 * });
 */
export async function updateActionItem(
  params: { id: string } & Partial<IActionItemFormData & { status: 'Open' | 'In Progress' | 'Done' }>
): Promise<IActionItem> {
  const http = getHttpAdapter();
  const { id, ...updates } = params;
  const response = await http.patch<IActionItem>(`/api/review/action-items/${encodeURIComponent(id)}`, updates);
  return response;
}

/**
 * Delete an action item.
 *
 * @param id - The action item ID.
 * @returns Promise<void>
 *
 * @example
 * await deleteActionItem('action-item-abc123');
 */
export async function deleteActionItem(id: string): Promise<void> {
  const http = getHttpAdapter();
  await http.delete(`/api/review/action-items/${encodeURIComponent(id)}`);
}
```

### Step 2: Hook — `useActionItems`

#### Create `packages/review-mode/src/hooks/useActionItems.ts`

TanStack Query integration for fetching, creating, updating action items.

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchActionItems,
  createActionItem,
  updateActionItem,
  deleteActionItem,
} from '../data/actionItemsQueries.js';
import type { IActionItem, IActionItemFormData } from '../types/index.js';

/**
 * Query key factory for action items.
 */
const queryKeys = {
  all: () => ['action-items'] as const,
  byRecord: (recordId: string) => [...queryKeys.all(), 'record', recordId] as const,
};

/**
 * Hook for fetching, creating, and updating action items for a given record.
 *
 * Provides:
 *   - `items`: IActionItem[] – all items for the record
 *   - `isLoading`: boolean – true while initial fetch is pending
 *   - `error`: Error | null – fetch error
 *   - `create`: async function – create a new action item
 *   - `update`: async function – update an existing item (status, assignment, etc.)
 *   - `delete`: async function – delete an item
 *
 * On success:
 *   - create/update/delete mutations automatically invalidate the query cache
 *   - Items list is refetched from server
 *
 * @param recordId - The source record ID to fetch action items for.
 * @returns Object with items, isLoading, error, create, update, delete functions.
 *
 * @example
 * function ActionItemPanel({ recordId }) {
 *   const { items, isLoading, create, update } = useActionItems(recordId);
 *
 *   if (isLoading) return <Spinner />;
 *   return (
 *     <>
 *       {items.map(item => (
 *         <ActionItemRow
 *           key={item.id}
 *           item={item}
 *           onStatusChange={(newStatus) => update({ id: item.id, status: newStatus })}
 *         />
 *       ))}
 *     </>
 *   );
 * }
 */
export function useActionItems(recordId: string) {
  const queryClient = useQueryClient();

  // Fetch action items for the record.
  const query = useQuery({
    queryKey: queryKeys.byRecord(recordId),
    queryFn: () => fetchActionItems(recordId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });

  // Create action item mutation.
  const createMutation = useMutation({
    mutationFn: (data: Omit<IActionItem, 'id' | 'createdAt' | 'createdByUpn'>) =>
      createActionItem(data),
    onSuccess: () => {
      // Invalidate the query to refetch the list.
      queryClient.invalidateQueries({
        queryKey: queryKeys.byRecord(recordId),
      });
    },
  });

  // Update action item mutation.
  const updateMutation = useMutation({
    mutationFn: (params: { id: string } & Partial<IActionItemFormData & { status: 'Open' | 'In Progress' | 'Done' }>) =>
      updateActionItem(params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.byRecord(recordId),
      });
    },
  });

  // Delete action item mutation.
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteActionItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.byRecord(recordId),
      });
    },
  });

  return {
    items: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    create: createMutation.mutate,
    createAsync: createMutation.mutateAsync,
    update: updateMutation.mutate,
    updateAsync: updateMutation.mutateAsync,
    delete: deleteMutation.mutate,
    deleteAsync: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
```

### Step 3: FAB Component

#### Create `packages/review-mode/src/components/ActionItems/ActionItemFab.tsx`

Floating action button positioned bottom-right of the overlay.

```typescript
import React from 'react';
import { Button } from '@fluentui/react-button';
import { Add24Regular } from '@fluentui/react-icons';
import { Tooltip } from '@fluentui/react-tooltip';
import { useReviewMode } from '../../context/useReviewMode.js';

/**
 * ActionItemFab component.
 *
 * Floating action button fixed at the bottom-right of the overlay (24px from bottom, 24px from right).
 * Position: absolute (relative to ReviewModeShell), z-index: 10 (above card, below tray).
 * Hidden when tray is open (isActionItemTrayOpen === true).
 *
 * Size: 48×48 circular button
 * Icon: Fluent AddCircle24Regular
 * Color: brand background with contrasting foreground text
 * Keyboard: Alt+A (or configurable shortcut)
 *
 * onClick: opens the ActionItemTray.
 */
export function ActionItemFab() {
  const { isActionItemTrayOpen, openActionItemTray } = useReviewMode();

  // Hide when tray is open.
  if (isActionItemTrayOpen) {
    return null;
  }

  return (
    <Tooltip content="Add action item (A)" positioning="before">
      <Button
        appearance="primary"
        size="large"
        shape="circular"
        icon={<Add24Regular />}
        onClick={openActionItemTray}
        aria-label="Add action item"
        style={{
          position: 'absolute',
          bottom: 24,
          right: 24,
          zIndex: 10,
          width: 48,
          height: 48,
        }}
      />
    </Tooltip>
  );
}
```

### Step 4: ActionItemTray Component

#### Create `packages/review-mode/src/components/ActionItems/ActionItemTray.tsx`

Slide-up tray for quick action item creation.

```typescript
import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Button,
  Input,
  Textarea,
  Field,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogBody,
  DialogActions,
} from '@fluentui/react-components';
import { Dismiss24Regular } from '@fluentui/react-icons';
import { HbcPeoplePicker, HbcStatusBadge } from '@hbc/ui-kit';
import { useReviewMode } from '../../context/useReviewMode.js';
import { useActionItems } from '../../hooks/useActionItems.js';
import { createActionItem } from '../../data/actionItemsQueries.js';
import type { IActionItemFormData } from '../../types/index.js';

/**
 * ActionItemTray component.
 *
 * Slide-up tray (280px tall when open) for compact action item creation.
 * Position: absolute, bottom: 0, left: 0, right: 0 (full width of overlay)
 * Transform: translateY(100%) → translateY(0) when open, 0.25s ease
 * z-index: 20 (above FAB, above card)
 *
 * Layout:
 *   Header row:
 *     - Left: "New Action Item" title + source context (muted)
 *     - Right: close (×) button
 *   Form body (compact):
 *     - Row 1: title input (required, autofocus, full width)
 *     - Row 2: assignedToUpn picker (50%) + dueDate input (25%) + priority select (25%)
 *     - Row 3: description textarea (2 rows)
 *   Footer:
 *     - Right: Cancel button + Add Action Item button (primary)
 *
 * Source auto-population:
 *   - sourceModule: from reviewConfig.sessionKey
 *   - sourceRecordId: from activeRecordId
 *   - sourceRecordLabel: from sidebar schema (title + subtitle)
 *
 * Keyboard:
 *   - Escape: close tray
 *   - Enter (in title field): submit (if title is not empty)
 */
export function ActionItemTray() {
  const { isActionItemTrayOpen, closeActionItemTray, activeRecordId, activeRecordLabel, reviewConfig } = useReviewMode();
  const { createAsync } = useActionItems(activeRecordId || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [assignedToUpn, setAssignedToUpn] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [description, setDescription] = useState('');

  // Autofocus title input when tray opens.
  const titleInputRef = React.useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (isActionItemTrayOpen && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isActionItemTrayOpen]);

  // Handle form submission.
  const handleSubmit = async () => {
    if (!title.trim() || !activeRecordId) {
      return;
    }

    setIsSubmitting(true);
    try {
      await createAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        assignedToUpn: assignedToUpn || undefined,
        dueDate: dueDate || undefined,
        priority,
        sourceModule: reviewConfig?.sessionKey || 'review-mode',
        sourceRecordId: activeRecordId,
        sourceRecordLabel: activeRecordLabel || 'Unknown',
        status: 'Open',
      });

      // Reset form and close tray.
      setTitle('');
      setAssignedToUpn(null);
      setDueDate(null);
      setPriority('Medium');
      setDescription('');
      closeActionItemTray();

      // Optional: show brief toast. For now, visual feedback via form reset.
    } catch (error) {
      console.error('[ActionItemTray] Error creating action item:', error);
      // Could show error toast here.
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Enter key in title field.
  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && title.trim()) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Handle Escape key to close.
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeActionItemTray();
    }
  };

  if (!isActionItemTrayOpen) {
    return null;
  }

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 280,
        transform: isActionItemTrayOpen ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.25s ease',
        backgroundColor: 'var(--colorNeutralBackground1)',
        borderTop: '1px solid var(--colorNeutralStroke1)',
        boxShadow: '0 -4px 16px rgba(0,0,0,0.12)',
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        padding: 16,
        gap: 12,
        onKeyDown: handleKeyDown,
      }}
    >
      {/* Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>New Action Item</h3>
          <p style={{ margin: '4px 0 0 0', fontSize: 12, color: 'var(--colorNeutralForegroundHint)' }}>
            re: {activeRecordLabel || 'Unknown'}
          </p>
        </div>
        <Button
          appearance="subtle"
          size="small"
          icon={<Dismiss24Regular />}
          onClick={closeActionItemTray}
          aria-label="Close tray"
        />
      </div>

      {/* Form Body */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, overflow: 'auto' }}>
        {/* Title */}
        <Field label="Title" required>
          <Input
            ref={titleInputRef}
            placeholder="Action item…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleTitleKeyDown}
            disabled={isSubmitting}
          />
        </Field>

        {/* Assigned To, Due Date, Priority */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <Field label="Assign to">
            <HbcPeoplePicker
              selectedUpn={assignedToUpn}
              onSelect={setAssignedToUpn}
              disabled={isSubmitting}
            />
          </Field>
          <Field label="Due">
            <Input
              type="date"
              value={dueDate || ''}
              onChange={(e) => setDueDate(e.target.value || null)}
              disabled={isSubmitting}
            />
          </Field>
          <Field label="Priority">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'Low' | 'Medium' | 'High')}
              disabled={isSubmitting}
              style={{
                padding: '8px 12px',
                borderRadius: 4,
                border: '1px solid var(--colorNeutralStroke1)',
              }}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </Field>
        </div>

        {/* Description */}
        <Field label="Notes">
          <Textarea
            placeholder="Additional details…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
            rows={2}
          />
        </Field>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <Button
          appearance="secondary"
          onClick={closeActionItemTray}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          appearance="primary"
          onClick={handleSubmit}
          disabled={!title.trim() || isSubmitting}
        >
          {isSubmitting ? 'Adding…' : 'Add Action Item'}
        </Button>
      </div>
    </div>
  );
}
```

### Step 5: ActionItemList Component

#### Create `packages/review-mode/src/components/ActionItems/ActionItemList.tsx`

List of existing action items shown at bottom of card.

```typescript
import React from 'react';
import { Badge, Button, Text } from '@fluentui/react-components';
import { CheckmarkCircle24Regular, Circle24Regular, ChevronRight24Regular } from '@fluentui/react-icons';
import { HbcStatusBadge } from '@hbc/ui-kit';
import { useActionItems } from '../../hooks/useActionItems.js';

/**
 * ActionItemList component.
 *
 * Displays all action items for the active record (shown at bottom of card).
 * If no items exist: renders nothing (no empty state).
 * If items exist: shows a compact list under "Action Items" heading.
 *
 * Each row displays:
 *   - Status indicator (Open circle or Checkmark)
 *   - Title (bold)
 *   - Assigned To name (muted)
 *   - Due Date (muted, or highlighted if within 7 days)
 *   - Status badge (Open, In Progress, Done)
 *
 * Clicking the status badge cycles: Open → In Progress → Done → Open
 *
 * Props:
 *   - recordId: string – the ID of the record being reviewed
 */
export function ActionItemList({ recordId }: { recordId: string }) {
  const { items, isLoading, update } = useActionItems(recordId);

  if (isLoading) {
    return <p style={{ fontSize: 12, color: 'var(--colorNeutralForegroundHint)' }}>Loading action items…</p>;
  }

  if (items.length === 0) {
    return null; // No empty state.
  }

  const nextStatus = (current: string) => {
    const cycle = ['Open', 'In Progress', 'Done'];
    const idx = cycle.indexOf(current);
    return cycle[(idx + 1) % cycle.length];
  };

  const isOverdue = (dueDate: string | undefined) => {
    if (!dueDate) return false;
    const due = new Date(dueDate);
    const now = new Date();
    return due < now;
  };

  const isDueSoon = (dueDate: string | undefined) => {
    if (!dueDate) return false;
    const due = new Date(dueDate);
    const now = new Date();
    const daysUntilDue = Math.floor((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilDue >= 0 && daysUntilDue <= 7;
  };

  return (
    <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--colorNeutralStroke1)' }}>
      <h4 style={{ margin: '0 0 12px 0', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>
        Action Items
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '24px 1fr 120px 100px 80px',
              gap: 12,
              alignItems: 'center',
              padding: '8px 12px',
              backgroundColor: 'var(--colorNeutralBackground2)',
              borderRadius: 4,
              fontSize: 13,
            }}
          >
            {/* Status Icon */}
            <div>
              {item.status === 'Done' ? (
                <CheckmarkCircle24Regular style={{ color: 'var(--colorSuccessForeground)' }} />
              ) : (
                <Circle24Regular style={{ color: 'var(--colorNeutralForeground3)' }} />
              )}
            </div>

            {/* Title */}
            <Text weight="semibold">{item.title}</Text>

            {/* Assigned To (right-aligned, muted) */}
            <Text style={{ color: 'var(--colorNeutralForegroundHint)', textAlign: 'right' }}>
              {item.assignedToName || 'Unassigned'}
            </Text>

            {/* Due Date */}
            <Text
              style={{
                color: isOverdue(item.dueDate)
                  ? 'var(--colorErrorForeground)'
                  : isDueSoon(item.dueDate)
                    ? 'var(--colorWarningForeground)'
                    : 'var(--colorNeutralForegroundHint)',
              }}
            >
              {item.dueDate
                ? new Date(item.dueDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })
                : '—'}
            </Text>

            {/* Status Badge (clickable) */}
            <div
              onClick={() => update({ id: item.id, status: nextStatus(item.status) })}
              style={{ cursor: 'pointer' }}
            >
              <HbcStatusBadge
                label={item.status}
                variant={
                  item.status === 'Done'
                    ? 'success'
                    : item.status === 'In Progress'
                      ? 'warning'
                      : 'neutral'
                }
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Step 6: Barrel Export

#### Create `packages/review-mode/src/components/ActionItems/index.ts`

```typescript
/**
 * Barrel export for action item components.
 * Internal API (not all exported from package root).
 */

export { ActionItemFab } from './ActionItemFab.js';
export { ActionItemTray } from './ActionItemTray.js';
export { ActionItemList } from './ActionItemList.js';
```

### Step 7: Extend ReviewModeContext

#### Modify `packages/review-mode/src/context/ReviewModeContext.ts`

Add session-level tracking of all action items created during the review session.

```typescript
// In the ReviewModeContextType interface, add:
interface ReviewModeContextType {
  // ... existing fields ...

  /**
   * All action items created in this review session.
   * Used for the session summary (Phase 6).
   * Populated each time an action item is successfully created.
   */
  sessionActionItems: IActionItem[];

  /**
   * Add an action item to the session list.
   * Called by ActionItemTray after successful creation.
   */
  addSessionActionItem: (item: IActionItem) => void;

  /**
   * UI state for the action item tray.
   */
  isActionItemTrayOpen: boolean;
  openActionItemTray: () => void;
  closeActionItemTray: () => void;
}

// In the initial state object, add:
sessionActionItems: [],
isActionItemTrayOpen: false,

// In the reducer, add handlers:
case 'ADD_SESSION_ACTION_ITEM':
  return {
    ...state,
    sessionActionItems: [...state.sessionActionItems, action.payload],
  };

case 'OPEN_ACTION_ITEM_TRAY':
  return {
    ...state,
    isActionItemTrayOpen: true,
  };

case 'CLOSE_ACTION_ITEM_TRAY':
  return {
    ...state,
    isActionItemTrayOpen: false,
  };

// Expose context dispatch helpers in the Provider value:
addSessionActionItem: (item: IActionItem) => {
  dispatch({ type: 'ADD_SESSION_ACTION_ITEM', payload: item });
},
openActionItemTray: () => {
  dispatch({ type: 'OPEN_ACTION_ITEM_TRAY' });
},
closeActionItemTray: () => {
  dispatch({ type: 'CLOSE_ACTION_ITEM_TRAY' });
},
```

### Step 8: Extend Keyboard Navigation

#### Modify `packages/review-mode/src/hooks/useKeyboardNav.ts`

Add "A" shortcut to open the action item tray.

```typescript
// In the useKeyboardNav hook, add handler for KeyA:
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'a' || e.key === 'A') {
      if (!isActionItemTrayOpen && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        openActionItemTray();
      }
    }
    // ... existing handlers for arrow keys, Escape, etc. ...
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [isActionItemTrayOpen, openActionItemTray]);
```

---

## Verification

### Build and Type Check
```bash
cd packages/review-mode
pnpm build
pnpm typecheck
```

### Integration Test (example)
```bash
# Test in dev-harness with a mock review config.
# Verify:
# 1. FAB appears at bottom-right (48×48, circular, brand color).
# 2. Clicking FAB opens tray (slide-up animation).
# 3. Tray form allows entering title, assigning, setting due date, priority, notes.
# 4. Clicking "Add Action Item" creates item, refetches list, closes tray.
# 5. ActionItemList appears at bottom of card showing created item.
# 6. Clicking status badge cycles the status.
# 7. Pressing "A" opens tray (if not already open, and not in text input).
# 8. Pressing Escape closes tray.
```

### Lint and Format
```bash
pnpm lint --fix
pnpm format
```

---

## Definition of Done

- [ ] All four components created and exported from barrel.
- [ ] Data layer (actionItemsQueries.ts) fully implements all CRUD endpoints with error handling.
- [ ] useActionItems hook correctly manages query state and mutations.
- [ ] ReviewModeContext extended with sessionActionItems and tray state.
- [ ] ActionItemFab renders and hides based on tray state.
- [ ] ActionItemTray form validates required fields and submits successfully.
- [ ] ActionItemList displays items with correct styling and status cycling.
- [ ] Keyboard shortcuts ("A" to open, Escape to close) functional.
- [ ] Build succeeds with no type errors or lint warnings.
- [ ] All components render without console errors in dev-harness.
- [ ] Session summary screen (PH7-RM-6) can access sessionActionItems from context.
- [ ] Code follows HB Intel style: `@hbc/*` imports, Fluent UI v9, type safety.

<!-- IMPLEMENTATION PROGRESS & NOTES
Phase PH7-RM-5 completed: YYYY-MM-DD
Files created: 6
Hook and data layer: complete
UI components: complete (FAB, Tray, List)
Keyboard shortcuts: "A" + "Escape"
Context extensions: sessionActionItems tracking
Next: PH7-RM-6 (Session Summary screen)
-->
