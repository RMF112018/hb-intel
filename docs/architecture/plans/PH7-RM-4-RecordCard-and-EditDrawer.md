# PH7-RM-4 — Record Card & Edit Drawer Implementation


> **Doc Classification:** Deferred Scope — remediation scope item identified during Phase 7 but not yet assigned to an active execution phase; confirm scheduling status before PH7.12 sign-off.

**Version:** 1.0
**Governed by:** CLAUDE.md v1.2 · HB-Intel-Blueprint-V4.md
**Date:** 2026-03-08
**Depends on:** PH7-RM-1 (useReviewMode hook) · PH7-RM-2 (ReviewModeContext) · PH7-RM-3 (NavigationSidebar)
**Blocks:** PH7-RM-5 (Action Items) · PH7-RM-6 (Header & Filter Bar)

---

## Summary

The Record Card and Edit Drawer form the interactive core of the Review Mode overlay. The card displays the active record's content via a render prop, provides previous/next navigation with chevron buttons, shows a keyboard shortcut legend, and includes a "Mark Reviewed" toggle. The edit drawer slides in from the right to present the feature's edit form, preserving form state while outside the card.

## Why It Matters

- **Render prop flexibility:** Each feature provides its own card display logic without Review Mode knowing the schema.
- **Quick navigation:** Chevron buttons and keyboard shortcuts enable rapid record review without leaving the overlay.
- **In-place editing:** Edit drawer loads and caches the feature's edit form without closing Review Mode.
- **UX clarity:** Keyboard legend auto-hides but reappears on first interaction, teaching users shortcuts without clutter.

## Files to Create / Modify

| File Path | Purpose | Type |
|-----------|---------|------|
| `packages/review-mode/src/components/RecordCard/RecordCardFrame.tsx` | Main card container with chevron navigation and keyboard legend | Component |
| `packages/review-mode/src/components/RecordCard/RecordCardHeader.tsx` | Header with position counter, record title, and action buttons | Component |
| `packages/review-mode/src/components/RecordCard/RecordCardBody.tsx` | Scrollable content area that renders the feature's card content | Component |
| `packages/review-mode/src/components/EditDrawer/EditDrawer.tsx` | Sliding drawer panel for editing record details | Component |
| `packages/review-mode/src/components/EditDrawer/EditDrawerHeader.tsx` | Close button and title for the edit drawer | Component |
| `packages/review-mode/src/hooks/useKeyboardNav.ts` | Keyboard navigation hook (arrow keys, E for edit, M for mark, Esc to close) | Hook |
| `packages/review-mode/src/types/card.ts` | TypeScript interfaces for card and drawer props | Types |

---

## Implementation

### 1. RecordCardFrame.tsx (Main Card Container)

```typescript
// packages/review-mode/src/components/RecordCard/RecordCardFrame.tsx

import React, { useState, useCallback, useEffect } from 'react';
import {
  makeStyles,
  shorthands,
  tokens,
  Button,
  Spinner,
  Text,
} from '@fluentui/react-components';
import {
  ChevronLeftRegular,
  ChevronRightRegular,
} from '@fluentui/react-icons';
import { useReviewMode } from '../../hooks/useReviewMode';
import { useKeyboardNav } from '../../hooks/useKeyboardNav';
import { RecordCardHeader } from './RecordCardHeader';
import { RecordCardBody } from './RecordCardBody';
import { EditDrawer } from '../EditDrawer/EditDrawer';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    height: '100%',
    position: 'relative',
    backgroundColor: tokens.colorNeutralBackground1,
    overflow: 'hidden',
  },

  navigationContainer: {
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 0,
  },

  navigationButton: {
    position: 'absolute',
    width: '48px',
    height: '48px',
    minWidth: '48px',
    minHeight: '48px',
    padding: '8px',
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: tokens.colorNeutralForeground1,
    transition: 'all 0.15s ease',
    pointerEvents: 'auto',

    '&:hover:not(:disabled)': {
      backgroundColor: 'rgba(0, 0, 0, 0.12)',
    },

    '&:active:not(:disabled)': {
      backgroundColor: 'rgba(0, 0, 0, 0.16)',
    },

    '&:disabled': {
      opacity: 0.3,
      cursor: 'default',
    },

    '&:focus': {
      outline: `2px solid ${tokens.colorBrandForeground1}`,
      outlineOffset: '2px',
    },
  },

  previousButton: {
    left: '16px',
  },

  nextButton: {
    right: '16px',
  },

  contentArea: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    position: 'relative',
    zIndex: 1,
    paddingLeft: tokens.spacingHorizontalXXL,
    paddingRight: tokens.spacingHorizontalXXL,
  },

  keyboardLegend: {
    position: 'fixed',
    bottom: '24px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    color: tokens.colorNeutralBackground1,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    borderRadius: tokens.borderRadiusMedium,
    fontSize: '11px',
    fontWeight: 500,
    lineHeight: '1.4',
    letterSpacing: '0.3px',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    opacity: 0,
    transition: 'opacity 0.3s ease',
    zIndex: 100,

    '&[data-visible="true"]': {
      opacity: 1,
    },

    '& a': {
      color: tokens.colorBrandForeground1,
      textDecoration: 'none',
      fontWeight: 600,
    },
  },

  keyboardLegendText: {
    userSelect: 'none',
  },

  emptyState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: tokens.colorNeutralForeground3,
    textAlign: 'center',
  },
});

export interface RecordCardFrameProps {
  /**
   * Optional className for root element.
   */
  className?: string;
}

/**
 * Record Card Frame component.
 *
 * Main card container that displays the active record using a render prop.
 * Provides previous/next navigation via chevron buttons and keyboard shortcuts.
 * Shows an auto-hiding keyboard shortcut legend.
 * Integrates the edit drawer on the right side.
 */
export const RecordCardFrame: React.FC<RecordCardFrameProps> = ({
  className,
}) => {
  const styles = useStyles();
  const {
    activeSection,
    activeRecord,
    goNext,
    goPrevious,
    filteredRecords,
    isEditDrawerOpen,
    close,
  } = useReviewMode();

  const [showLegend, setShowLegend] = useState(true);
  const [legendTimeout, setLegendTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  // Keyboard navigation
  useKeyboardNav({
    disabled: isEditDrawerOpen,
  });

  // Auto-hide keyboard legend after 3 seconds on mount
  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowLegend(false);
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  // Show legend for 3s after any mouse movement
  const handleMouseMove = useCallback(() => {
    setShowLegend(true);

    if (legendTimeout) {
      clearTimeout(legendTimeout);
    }

    const timeout = setTimeout(() => {
      setShowLegend(false);
    }, 3000);

    setLegendTimeout(timeout);
  }, [legendTimeout]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (legendTimeout) {
        clearTimeout(legendTimeout);
      }
    };
  }, [legendTimeout]);

  if (!activeSection || !activeRecord) {
    return (
      <div className={`${styles.root} ${className ?? ''}`}>
        <div className={styles.emptyState}>
          <Text size={400}>No record selected</Text>
        </div>
      </div>
    );
  }

  // Get filtered records count for position tracking
  const recordIndex = filteredRecords.findIndex(
    (record) => activeSection.recordIdGetter(record) ===
                 activeSection.recordIdGetter(activeRecord)
  );
  const isFirstRecord = recordIndex === 0;
  const isLastRecord = recordIndex === filteredRecords.length - 1;

  return (
    <div
      className={`${styles.root} ${className ?? ''}`}
      onMouseMove={handleMouseMove}
      role="main"
      aria-label="Review mode record card"
    >
      {/* Navigation Buttons */}
      <div className={styles.navigationContainer}>
        <button
          className={`${styles.navigationButton} ${styles.previousButton}`}
          onClick={goPrevious}
          disabled={isFirstRecord}
          title="Previous record (← or arrow up)"
          aria-label="Previous record"
        >
          <ChevronLeftRegular fontSize={20} />
        </button>

        <button
          className={`${styles.navigationButton} ${styles.nextButton}`}
          onClick={goNext}
          disabled={isLastRecord}
          title="Next record (→ or arrow down)"
          aria-label="Next record"
        >
          <ChevronRightRegular fontSize={20} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className={styles.contentArea}>
        <RecordCardHeader
          recordIndex={recordIndex}
          totalRecords={filteredRecords.length}
        />
        <RecordCardBody />
      </div>

      {/* Edit Drawer */}
      <EditDrawer />

      {/* Keyboard Legend */}
      <div
        className={styles.keyboardLegend}
        data-visible={showLegend}
        role="status"
        aria-live="polite"
        aria-label="Keyboard shortcuts"
      >
        <span className={styles.keyboardLegendText}>
          ← → navigate • E edit • M mark reviewed • Esc exit
        </span>
      </div>
    </div>
  );
};

RecordCardFrame.displayName = 'RecordCardFrame';
```

---

### 2. RecordCardHeader.tsx (Card Header)

```typescript
// packages/review-mode/src/components/RecordCard/RecordCardHeader.tsx

import React, { useCallback } from 'react';
import {
  makeStyles,
  shorthands,
  tokens,
  Button,
  Text,
  Tooltip,
} from '@fluentui/react-components';
import {
  CheckmarkCircleRegular,
  CheckmarkRegular,
  EditRegular,
  AddRegular,
} from '@fluentui/react-icons';
import { useReviewMode } from '../../hooks/useReviewMode';
import { usePermissionStore } from '@hbc/stores-permissions';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    paddingBottom: tokens.spacingVerticalM,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalM,
  },

  leftSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    flex: 1,
    minWidth: 0,
  },

  positionIndicator: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground3,
    fontWeight: 500,
  },

  title: {
    fontSize: '18px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
    wordBreak: 'break-word',
  },

  actionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
  },

  markReviewedButton: {
    minWidth: 'auto',
    height: '32px',
    paddingLeft: tokens.spacingHorizontalM,
    paddingRight: tokens.spacingHorizontalM,
  },

  actionButton: {
    height: '32px',
    minWidth: '32px',
    paddingLeft: tokens.spacingHorizontalS,
    paddingRight: tokens.spacingHorizontalS,
  },

  reviewedIcon: {
    color: tokens.colorPaletteGreenForeground1,
    marginRight: tokens.spacingHorizontalXS,
  },
});

export interface RecordCardHeaderProps {
  recordIndex: number;
  totalRecords: number;
}

/**
 * Record Card Header component.
 *
 * Displays:
 * - Position indicator ("Record 3 of 12")
 * - Record title
 * - Action buttons:
 *   1. Mark Reviewed toggle
 *   2. Edit button (if feature provides edit form + user has write permission)
 *   3. Add Action Item button (for action items FAB)
 */
export const RecordCardHeader: React.FC<RecordCardHeaderProps> = ({
  recordIndex,
  totalRecords,
}) => {
  const styles = useStyles();
  const {
    activeSection,
    activeRecord,
    activeRecordId,
    reviewedRecordIds,
    markReviewed,
    openEditDrawer,
  } = useReviewMode();

  const { canEdit } = usePermissionStore();

  const isReviewed = reviewedRecordIds.has(activeRecordId);
  const canRenderEditForm =
    activeSection?.renderEditForm !== undefined &&
    canEdit(activeSection?.entity || '');

  const handleToggleReviewed = useCallback(() => {
    markReviewed(activeRecordId, !isReviewed);
  }, [activeRecordId, isReviewed, markReviewed]);

  const handleOpenEdit = useCallback(() => {
    openEditDrawer();
  }, [openEditDrawer]);

  if (!activeSection || !activeRecord) {
    return null;
  }

  const recordTitle = activeSection.sidebarSchema(activeRecord).title;

  return (
    <div className={styles.root} role="region" aria-label="Record card header">
      <div className={styles.header}>
        <div className={styles.leftSection}>
          <Text className={styles.positionIndicator}>
            Record {recordIndex + 1} of {totalRecords}
          </Text>
          <h2 className={styles.title}>{recordTitle}</h2>
        </div>

        <div className={styles.actionRow}>
          {/* Mark Reviewed Button */}
          <Tooltip
            content={isReviewed ? 'Mark as unreviewed' : 'Mark as reviewed (M)'}
            withArrow
          >
            <Button
              className={styles.markReviewedButton}
              onClick={handleToggleReviewed}
              appearance={isReviewed ? 'primary' : 'outline'}
              size="small"
              icon={
                isReviewed && <CheckmarkRegular className={styles.reviewedIcon} />
              }
            >
              {isReviewed ? 'Reviewed' : 'Review'}
            </Button>
          </Tooltip>

          {/* Edit Button */}
          {canRenderEditForm && (
            <Tooltip content="Edit this record (E)" withArrow>
              <Button
                className={styles.actionButton}
                onClick={handleOpenEdit}
                appearance="outline"
                size="small"
                icon={<EditRegular />}
                aria-label="Edit record"
              />
            </Tooltip>
          )}

          {/* Add Action Item Button */}
          <Tooltip content="Add action item (A)" withArrow>
            <Button
              className={styles.actionButton}
              onClick={() => {
                // Handled by PH7-RM-5 (Action Items)
                // Opens the action item tray
              }}
              appearance="outline"
              size="small"
              icon={<AddRegular />}
              aria-label="Add action item"
            />
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

RecordCardHeader.displayName = 'RecordCardHeader';
```

---

### 3. RecordCardBody.tsx (Card Content Area)

```typescript
// packages/review-mode/src/components/RecordCard/RecordCardBody.tsx

import React from 'react';
import {
  makeStyles,
  shorthands,
  tokens,
  Spinner,
  Text,
} from '@fluentui/react-components';
import { useReviewMode } from '../../hooks/useReviewMode';

const useStyles = makeStyles({
  root: {
    flex: 1,
    overflowY: 'auto',
    paddingTop: tokens.spacingVerticalL,
    paddingBottom: tokens.spacingVerticalL,

    // Custom scrollbar
    scrollbarWidth: 'thin',
    scrollbarColor: `${tokens.colorNeutralStroke2} transparent`,

    '&::-webkit-scrollbar': {
      width: '6px',
    },
    '&::-webkit-scrollbar-track': {
      background: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      background: tokens.colorNeutralStroke2,
      borderRadius: '3px',
    },
  },

  skeleton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '200px',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },

  emptyState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '200px',
    color: tokens.colorNeutralForeground3,
    textAlign: 'center',
  },

  renderContent: {
    // Content rendered by feature's renderCard function
    // Can apply feature-specific styles here if needed
  },
});

/**
 * Record Card Body component.
 *
 * Scrollable content area that renders the feature's card display.
 * Shows a loading spinner while the section is loading.
 * Shows "No records" message if data is empty.
 */
export const RecordCardBody: React.FC = () => {
  const styles = useStyles();
  const { activeSection, activeRecord } = useReviewMode();

  if (!activeSection || !activeRecord) {
    return (
      <div className={styles.emptyState}>
        <Text>No record loaded</Text>
      </div>
    );
  }

  if (activeSection.isLoading) {
    return (
      <div className={styles.skeleton}>
        <Spinner size="large" label="Loading record…" />
      </div>
    );
  }

  if (!activeRecord) {
    return (
      <div className={styles.emptyState}>
        <Text>No records in this section</Text>
      </div>
    );
  }

  return (
    <div className={styles.root} role="region" aria-label="Record details">
      <div className={styles.renderContent}>
        {activeSection.renderCard(activeRecord)}
      </div>
    </div>
  );
};

RecordCardBody.displayName = 'RecordCardBody';
```

---

### 4. EditDrawer.tsx (Sliding Edit Drawer)

```typescript
// packages/review-mode/src/components/EditDrawer/EditDrawer.tsx

import React, { useEffect, useRef } from 'react';
import {
  makeStyles,
  shorthands,
  tokens,
} from '@fluentui/react-components';
import { useReviewMode } from '../../hooks/useReviewMode';
import { EditDrawerHeader } from './EditDrawerHeader';
import { useQueryClient } from '@tanstack/react-query';

const useStyles = makeStyles({
  root: {
    position: 'absolute',
    right: '0',
    top: '0',
    height: '100%',
    width: '480px',
    backgroundColor: tokens.colorNeutralBackground1,
    borderLeft: `1px solid ${tokens.colorNeutralStroke1}`,
    boxShadow: '-4px 0 16px rgba(0, 0, 0, 0.12)',
    display: 'flex',
    flexDirection: 'column',
    transform: 'translateX(100%)',
    transition: 'transform 0.25s ease',
    zIndex: 10,
    overflow: 'hidden',

    '&[data-open="true"]': {
      transform: 'translateX(0)',
    },
  },

  header: {
    flexShrink: 0,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },

  body: {
    flex: 1,
    overflowY: 'auto',
    ...shorthands.padding(
      tokens.spacingVerticalL,
      tokens.spacingHorizontalL
    ),

    // Custom scrollbar
    scrollbarWidth: 'thin',
    scrollbarColor: `${tokens.colorNeutralStroke2} transparent`,

    '&::-webkit-scrollbar': {
      width: '6px',
    },
    '&::-webkit-scrollbar-track': {
      background: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      background: tokens.colorNeutralStroke2,
      borderRadius: '3px',
    },
  },
});

/**
 * Edit Drawer component.
 *
 * Slides in from the right side of the overlay when isEditDrawerOpen is true.
 * Renders the feature's edit form (from renderEditForm).
 * Preserves form state while drawer is closed.
 *
 * The edit form is responsible for:
 * - Rendering the form UI
 * - Handling save/cancel callbacks
 * - Invalidating cache on successful save
 */
export const EditDrawer: React.FC = () => {
  const styles = useStyles();
  const {
    activeSection,
    activeRecord,
    activeRecordId,
    isEditDrawerOpen,
    closeEditDrawer,
  } = useReviewMode();

  const queryClient = useQueryClient();
  const formRef = useRef<HTMLDivElement>(null);

  // Auto-focus the drawer when it opens
  useEffect(() => {
    if (isEditDrawerOpen && formRef.current) {
      const firstFocusable = formRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement | null;

      if (firstFocusable) {
        setTimeout(() => {
          firstFocusable.focus();
        }, 0);
      }
    }
  }, [isEditDrawerOpen]);

  if (!activeSection || !activeRecord || !activeSection.renderEditForm) {
    return null;
  }

  const recordTitle = activeSection.sidebarSchema(activeRecord).title;

  const handleSave = () => {
    // Invalidate TanStack Query cache for this record
    // The exact key depends on the feature's query structure
    queryClient.invalidateQueries({
      queryKey: [activeSection.entity, activeRecordId],
    });

    closeEditDrawer();
  };

  const handleCancel = () => {
    closeEditDrawer();
  };

  return (
    <div
      className={styles.root}
      data-open={isEditDrawerOpen}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-drawer-title"
      aria-hidden={!isEditDrawerOpen}
    >
      <div className={styles.header}>
        <EditDrawerHeader title={`Edit ${recordTitle}`} />
      </div>

      <div className={styles.body} ref={formRef}>
        {activeSection.renderEditForm(activeRecord, handleSave, handleCancel)}
      </div>
    </div>
  );
};

EditDrawer.displayName = 'EditDrawer';
```

---

### 5. EditDrawerHeader.tsx (Drawer Header)

```typescript
// packages/review-mode/src/components/EditDrawer/EditDrawerHeader.tsx

import React from 'react';
import {
  makeStyles,
  shorthands,
  tokens,
  Button,
  Text,
} from '@fluentui/react-components';
import { DismissRegular } from '@fluentui/react-icons';
import { useReviewMode } from '../../hooks/useReviewMode';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalM,
    ...shorthands.padding(
      tokens.spacingVerticalM,
      tokens.spacingHorizontalL
    ),
    minHeight: '52px',
  },

  title: {
    fontSize: '14px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  closeButton: {
    minWidth: '32px',
    minHeight: '32px',
    padding: '6px',
    flexShrink: 0,
  },
});

export interface EditDrawerHeaderProps {
  title: string;
}

/**
 * Edit Drawer Header component.
 *
 * Displays the drawer title (e.g., "Edit Pursuit")
 * and a close button that calls closeEditDrawer().
 */
export const EditDrawerHeader: React.FC<EditDrawerHeaderProps> = ({
  title,
}) => {
  const styles = useStyles();
  const { closeEditDrawer } = useReviewMode();

  return (
    <div className={styles.root}>
      <Text id="edit-drawer-title" className={styles.title} title={title}>
        {title}
      </Text>
      <Button
        className={styles.closeButton}
        icon={<DismissRegular />}
        onClick={closeEditDrawer}
        appearance="subtle"
        title="Close (Esc)"
        aria-label="Close edit drawer"
      />
    </div>
  );
};

EditDrawerHeader.displayName = 'EditDrawerHeader';
```

---

### 6. useKeyboardNav.ts (Keyboard Navigation Hook)

```typescript
// packages/review-mode/src/hooks/useKeyboardNav.ts

import { useEffect } from 'react';
import { useReviewMode } from './useReviewMode';

export interface UseKeyboardNavOptions {
  /**
   * If true, keyboard navigation is disabled (e.g., when edit drawer is open
   * and focus is inside a form).
   */
  disabled?: boolean;
}

/**
 * Keyboard navigation hook for Review Mode overlay.
 *
 * Bindings:
 * - ArrowRight / ArrowDown → goNext()
 * - ArrowLeft / ArrowUp → goPrevious()
 * - KeyE → openEditDrawer() (if renderEditForm defined and user has write permission)
 * - KeyM → markReviewed(activeRecordId)
 * - Escape → if isEditDrawerOpen: closeEditDrawer(); else: close()
 *
 * Guards against firing when:
 * - Focus is inside an input, textarea, or select element
 * - isActionItemTrayOpen is true
 * - disabled option is true
 */
export function useKeyboardNav(options?: UseKeyboardNavOptions): void {
  const {
    goNext,
    goPrevious,
    openEditDrawer,
    closeEditDrawer,
    markReviewed,
    close,
    activeRecordId,
    activeSection,
    isEditDrawerOpen,
    isActionItemTrayOpen,
  } = useReviewMode();

  useEffect(() => {
    if (options?.disabled) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't fire if focus is in an interactive element
      const activeElement = document.activeElement;
      const isInFormControl =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement instanceof HTMLSelectElement;

      if (isInFormControl) {
        return;
      }

      // Don't fire if action item tray is open
      if (isActionItemTrayOpen) {
        return;
      }

      const key = event.code || event.key;

      switch (key) {
        case 'ArrowRight':
        case 'ArrowDown':
          event.preventDefault();
          goNext();
          break;

        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault();
          goPrevious();
          break;

        case 'KeyE':
          event.preventDefault();
          if (
            activeSection?.renderEditForm &&
            !isEditDrawerOpen
          ) {
            openEditDrawer();
          }
          break;

        case 'KeyM':
          event.preventDefault();
          markReviewed(activeRecordId, undefined); // Toggle current state
          break;

        case 'Escape':
          event.preventDefault();
          if (isEditDrawerOpen) {
            closeEditDrawer();
          } else {
            close();
          }
          break;

        default:
          // Do nothing for other keys
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    goNext,
    goPrevious,
    openEditDrawer,
    closeEditDrawer,
    markReviewed,
    close,
    activeRecordId,
    activeSection,
    isEditDrawerOpen,
    isActionItemTrayOpen,
    options?.disabled,
  ]);
}
```

---

### 7. card.ts (Type Definitions)

```typescript
// packages/review-mode/src/types/card.ts

import type { ReactNode } from 'react';

/**
 * Props passed to a feature's edit form render function.
 */
export interface IEditFormRenderProps<T> {
  record: T;
  onSave: () => void;
  onCancel: () => void;
}

/**
 * Props for the record card render prop.
 */
export interface ICardRenderProps<T> {
  record: T;
}

/**
 * Function to render a record's card display.
 * Called by RecordCardBody.
 */
export type CardRenderFn<T> = (record: T) => ReactNode;

/**
 * Function to render a record's edit form.
 * Called by EditDrawer.
 * The form is responsible for calling onSave/onCancel.
 */
export type EditFormRenderFn<T> = (
  record: T,
  onSave: () => void,
  onCancel: () => void
) => ReactNode;
```

---

## Verification

### Build & Lint
```bash
# From repository root
pnpm turbo run build --filter=@hbc/review-mode
pnpm turbo run lint --filter=@hbc/review-mode
```

### Component Snapshot Tests
```bash
# Create tests for each component
cd packages/review-mode
pnpm test --testPathPattern="RecordCard|EditDrawer|useKeyboardNav"
```

### Manual Testing Checklist

#### RecordCardFrame
- [ ] Chevron buttons visible on left and right edges
- [ ] Click left chevron: goPrevious() fires, card content updates
- [ ] Click right chevron: goNext() fires, card content updates
- [ ] First record: left chevron is disabled (opacity 0.3)
- [ ] Last record: right chevron is disabled (opacity 0.3)
- [ ] Keyboard legend appears at bottom on page load
- [ ] Legend auto-hides after 3 seconds
- [ ] Moving mouse shows legend again for 3 seconds
- [ ] Focus outline appears on chevron buttons with Tab key

#### RecordCardHeader
- [ ] "Record N of M" text displays correctly
- [ ] Record title displays (from sidebarSchema.title)
- [ ] Mark Reviewed button toggles state
- [ ] When reviewed: button shows checkmark, green appearance
- [ ] When not reviewed: button is outlined
- [ ] Edit button only visible if renderEditForm is defined
- [ ] Edit button disabled if user lacks write permission
- [ ] Click Edit button: openEditDrawer() fires
- [ ] Add Action Item button visible (but action deferred to PH7-RM-5)
- [ ] All buttons have tooltips on hover
- [ ] All buttons are keyboard accessible (Tab, Enter)

#### RecordCardBody
- [ ] Content renders from activeSection.renderCard(activeRecord)
- [ ] Content scrolls independently when it exceeds container height
- [ ] Loading spinner shows when activeSection.isLoading is true
- [ ] Empty state text shows when activeRecord is null
- [ ] Scrollbar styling matches HB Intel design

#### EditDrawer
- [ ] Hidden off-screen by default (translateX(100%))
- [ ] Slides in from right when isEditDrawerOpen is true
- [ ] Smoothly animates in 0.25s
- [ ] Contains EditDrawerHeader with close button
- [ ] Renders activeSection.renderEditForm(activeRecord, onSave, onCancel)
- [ ] Click close (×) button: closeEditDrawer() fires
- [ ] Form state is preserved when drawer closes and reopens
- [ ] Escape key closes drawer
- [ ] First focusable element in form receives focus when drawer opens
- [ ] TanStack Query cache is invalidated on save

#### useKeyboardNav
- [ ] ArrowRight navigates to next record
- [ ] ArrowDown navigates to next record
- [ ] ArrowLeft navigates to previous record
- [ ] ArrowUp navigates to previous record
- [ ] KeyE opens edit drawer (if available)
- [ ] KeyM toggles reviewed state
- [ ] Escape closes edit drawer (if open) or closes Review Mode
- [ ] Key events do NOT fire when focus is inside input/textarea/select
- [ ] Key events do NOT fire when isActionItemTrayOpen is true
- [ ] Key events do NOT fire when disabled option is true
- [ ] No page scroll/zoom when navigation keys are pressed (preventDefault)

---

## Definition of Done

- [ ] All 7 files created with complete TypeScript code and JSDoc comments
- [ ] Fluent UI styles applied using `makeStyles` (no inline styles)
- [ ] `useReviewMode()` hook integration verified
- [ ] `useQueryClient()` integration verified for cache invalidation
- [ ] `usePermissionStore()` integration verified for edit button visibility
- [ ] RecordCardFrame chevron buttons are properly disabled at record boundaries
- [ ] EditDrawer slides in/out with smooth 0.25s transition
- [ ] Edit drawer has proper z-index layering (above card, below action items)
- [ ] Keyboard legend auto-hides and reappears correctly
- [ ] useKeyboardNav hook has all guards (input focus, action item tray, disabled flag)
- [ ] Component exports added to `packages/review-mode/src/index.ts`
- [ ] Type exports added to `packages/review-mode/src/types/index.ts`
- [ ] Unit tests written for all components (snapshot + interaction)
- [ ] Integration test confirms card + drawer + keyboard nav work together
- [ ] Accessibility: all buttons have aria-labels, drawer is modal with aria-modal
- [ ] Accessibility: keyboard legend has aria-live="polite"
- [ ] No console warnings or linting errors
- [ ] Ready to integrate with PH7-RM-5 (Action Items)

<!-- IMPLEMENTATION PROGRESS & NOTES
Phase PH7-RM-4 created: 2026-03-08
Documentation added: docs/architecture/plans/PH7-RM-4-RecordCard-and-EditDrawer.md
Next: PH7-RM-5 (Action Items FAB)
-->
