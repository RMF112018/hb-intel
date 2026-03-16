# PH7-RM-3 — Navigation Sidebar Implementation


> **Doc Classification:** Deferred Scope — Phase 7 remediation scope item. PH7.12 sign-off complete (2026-03-09, ADR-0091). Phase assignment decision pending (see OD-006 in P0-E2 Open Decisions Register). Do not implement until assigned to a Phase milestone.

**Version:** 1.0
**Governed by:** CLAUDE.md v1.2 · HB-Intel-Blueprint-V4.md
**Date:** 2026-03-08
**Depends on:** PH7-RM-1 (useReviewMode hook) · PH7-RM-2 (ReviewModeContext)
**Blocks:** PH7-RM-4 (RecordCard & EditDrawer) · PH7-RM-5 (Action Items)

---

## Summary

The Navigation Sidebar is the left-side collapsible panel of the Review Mode overlay. It displays a searchable, filterable list of records for the active section, marks reviewed items, and enables rapid navigation through record sets. The sidebar collapses to a 40px vertical label bar to maximize card space when not in use.

## Why It Matters

- **Real-time filtering:** Users can search and filter records without closing the overlay.
- **Visual feedback:** Checkmarks and opacity changes show review progress at a glance.
- **Space-efficient:** Smooth collapse transition reclaims up to 240px horizontal space.
- **Keyboard-friendly:** Search remains focused and responsive for fast user flows.

## Files to Create / Modify

| File Path | Purpose | Type |
|-----------|---------|------|
| `packages/review-mode/src/components/NavigationSidebar/NavigationSidebar.tsx` | Main sidebar container with collapse toggle and list rendering | Component |
| `packages/review-mode/src/components/NavigationSidebar/SidebarSearchInput.tsx` | Search input with clear button and auto-focus | Component |
| `packages/review-mode/src/components/NavigationSidebar/RecordPill.tsx` | Individual record item with reviewed indicator and status badge | Component |
| `packages/review-mode/src/components/NavigationSidebar/useFilteredRecords.ts` | Custom hook for filtering records by filters and search term | Hook |
| `packages/review-mode/src/types/sidebar.ts` | TypeScript interfaces for sidebar state and props | Types |

---

## Implementation

### 1. NavigationSidebar.tsx (Main Container)

```typescript
// packages/review-mode/src/components/NavigationSidebar/NavigationSidebar.tsx

import React, { useMemo } from 'react';
import {
  makeStyles,
  shorthands,
  tokens,
  Button,
  Text,
} from '@fluentui/react-components';
import { ChevronLeftRegular, ChevronRightRegular } from '@fluentui/react-icons';
import { useReviewMode } from '../../hooks/useReviewMode';
import { useFilteredRecords } from './useFilteredRecords';
import { SidebarSearchInput } from './SidebarSearchInput';
import { RecordPill } from './RecordPill';
import type { ISidebarPillSchema } from '../../types/sidebar';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: tokens.colorNeutralBackground2,
    borderRight: `1px solid ${tokens.colorNeutralStroke1}`,
    position: 'relative',
    transition: 'width 0.2s ease-out',
    overflow: 'hidden',

    '&[data-collapsed="false"]': {
      width: '280px',
    },
    '&[data-collapsed="true"]': {
      width: '40px',
    },
  },

  expandedContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    paddingTop: tokens.spacingVerticalM,
    paddingRight: tokens.spacingHorizontalS,
    paddingLeft: tokens.spacingHorizontalS,
    gap: tokens.spacingVerticalS,
  },

  searchSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },

  recordsScrollable: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    paddingRight: tokens.spacingHorizontalXS,

    // Custom scrollbar styling
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

  reviewedCount: {
    paddingTop: tokens.spacingVerticalM,
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    textAlign: 'center',
    color: tokens.colorNeutralForeground3,
    fontSize: '12px',
  },

  collapsedLabel: {
    writingMode: 'vertical-rl',
    transform: 'rotate(180deg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: tokens.colorNeutralForeground3,
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.5px',
  },

  collapseToggle: {
    position: 'absolute',
    right: '4px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '32px',
    height: '32px',
    minWidth: '32px',
    minHeight: '32px',
    padding: '4px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: tokens.borderRadiusMedium,
    color: tokens.colorNeutralForeground3,
    transition: 'background-color 0.15s ease, color 0.15s ease',

    '&:hover': {
      backgroundColor: tokens.colorNeutralBackground3,
      color: tokens.colorNeutralForeground1,
    },

    '&:active': {
      backgroundColor: tokens.colorNeutralBackground4,
    },
  },

  emptyState: {
    textAlign: 'center',
    paddingTop: tokens.spacingVerticalXL,
    color: tokens.colorNeutralForeground3,
    fontSize: '13px',
  },
});

export interface NavigationSidebarProps {
  /**
   * Optional className for root element.
   */
  className?: string;
}

/**
 * Navigation Sidebar component.
 *
 * Displays a searchable, filterable list of records for the active section.
 * Collapses to a 40px vertical label bar. Shows reviewed state via checkmarks
 * and opacity changes. Integrates with useReviewMode() hook for state management.
 */
export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  className,
}) => {
  const styles = useStyles();
  const {
    activeSection,
    activeSectionId,
    activeRecordId,
    sidebarSearch,
    setSidebarSearch,
    sidebarCollapsed,
    toggleSidebar,
    goToRecord,
    reviewedRecordIds,
    activeFilterValues,
  } = useReviewMode();

  // Compute filtered records based on current filters and search term
  const filteredRecords = useFilteredRecords(
    activeSection?.data ?? [],
    activeSection?.filters ?? [],
    activeFilterValues,
    sidebarSearch,
    activeSection?.sidebarSchema,
  );

  // Count reviewed records in the filtered list
  const reviewedCount = useMemo(() => {
    return filteredRecords.filter((record) => {
      const recordId = activeSection?.recordIdGetter(record);
      return reviewedRecordIds.has(recordId);
    }).length;
  }, [filteredRecords, reviewedRecordIds, activeSection]);

  const handleClearSearch = () => {
    setSidebarSearch('');
  };

  const handleToggleSidebar = () => {
    toggleSidebar();
  };

  if (!activeSection) {
    return (
      <div className={`${styles.root} ${className ?? ''}`} data-collapsed="false">
        <div className={styles.expandedContainer}>
          <Text className={styles.emptyState}>No section selected</Text>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${styles.root} ${className ?? ''}`}
      data-collapsed={sidebarCollapsed}
      role="navigation"
      aria-label="Review mode navigation sidebar"
    >
      {!sidebarCollapsed ? (
        <>
          <div className={styles.expandedContainer}>
            {/* Search Section */}
            <div className={styles.searchSection}>
              <SidebarSearchInput
                value={sidebarSearch}
                onChange={setSidebarSearch}
                onClear={handleClearSearch}
                placeholder="Search records…"
              />
            </div>

            {/* Records List */}
            <div className={styles.recordsScrollable}>
              {filteredRecords.length === 0 ? (
                <Text className={styles.emptyState}>
                  No records match your filters
                </Text>
              ) : (
                filteredRecords.map((record, index) => {
                  const recordId = activeSection.recordIdGetter(record);
                  const isActive = recordId === activeRecordId;
                  const isReviewed = reviewedRecordIds.has(recordId);
                  const schema = activeSection.sidebarSchema(record);

                  return (
                    <RecordPill
                      key={recordId}
                      schema={schema}
                      isActive={isActive}
                      isReviewed={isReviewed}
                      onClick={() => goToRecord(recordId)}
                      aria-current={isActive ? 'page' : undefined}
                    />
                  );
                })
              )}
            </div>

            {/* Reviewed Count Footer */}
            <div className={styles.reviewedCount}>
              <Text size={300} align="center">
                {reviewedCount} of {filteredRecords.length} reviewed
              </Text>
            </div>
          </div>

          {/* Collapse Toggle Button */}
          <button
            className={styles.collapseToggle}
            onClick={handleToggleSidebar}
            title="Collapse sidebar (◀)"
            aria-label="Collapse sidebar"
            aria-expanded="true"
          >
            <ChevronLeftRegular fontSize={16} />
          </button>
        </>
      ) : (
        <>
          {/* Collapsed State */}
          <div className={styles.collapsedLabel}>Records</div>

          {/* Expand Toggle Button */}
          <button
            className={styles.collapseToggle}
            onClick={handleToggleSidebar}
            title="Expand sidebar (▶)"
            aria-label="Expand sidebar"
            aria-expanded="false"
          >
            <ChevronRightRegular fontSize={16} />
          </button>
        </>
      )}
    </div>
  );
};

NavigationSidebar.displayName = 'NavigationSidebar';
```

---

### 2. SidebarSearchInput.tsx (Search Input Component)

```typescript
// packages/review-mode/src/components/NavigationSidebar/SidebarSearchInput.tsx

import React, { useCallback, useEffect, useRef } from 'react';
import {
  Input,
  makeStyles,
  shorthands,
  tokens,
  Button,
} from '@fluentui/react-components';
import { DismissRegular } from '@fluentui/react-icons';
import { useReviewMode } from '../../hooks/useReviewMode';

const useStyles = makeStyles({
  root: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },

  input: {
    width: '100%',
    fontSize: '13px',
    fontFamily: tokens.fontFamilyBase,

    '&::placeholder': {
      color: tokens.colorNeutralForeground4,
    },
  },

  clearButton: {
    position: 'absolute',
    right: '6px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '24px',
    height: '24px',
    minWidth: '24px',
    minHeight: '24px',
    padding: '2px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: tokens.colorNeutralForeground4,
    transition: 'color 0.15s ease',

    '&:hover': {
      color: tokens.colorNeutralForeground2,
    },
  },
});

export interface SidebarSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
}

/**
 * Search input for the sidebar.
 *
 * Controlled input that filters records in real-time.
 * Clears when the active section changes (via useEffect).
 * Shows a clear (×) button when non-empty.
 */
export const SidebarSearchInput: React.FC<SidebarSearchInputProps> = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search records…',
}) => {
  const styles = useStyles();
  const inputRef = useRef<HTMLInputElement>(null);
  const { activeSectionId } = useReviewMode();

  // Clear search when section changes
  useEffect(() => {
    onClear();
  }, [activeSectionId, onClear]);

  const handleClear = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      onClear();
      inputRef.current?.focus();
    },
    [onClear],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange],
  );

  return (
    <div className={styles.root}>
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={styles.input}
        contentBefore={undefined}
        contentAfter={
          value ? (
            <button
              className={styles.clearButton}
              onClick={handleClear}
              aria-label="Clear search"
              title="Clear"
              type="button"
            >
              <DismissRegular fontSize={14} />
            </button>
          ) : undefined
        }
        aria-label="Search records"
      />
    </div>
  );
};

SidebarSearchInput.displayName = 'SidebarSearchInput';
```

---

### 3. RecordPill.tsx (Individual Record Item)

```typescript
// packages/review-mode/src/components/NavigationSidebar/RecordPill.tsx

import React from 'react';
import {
  makeStyles,
  shorthands,
  tokens,
  Text,
} from '@fluentui/react-components';
import { CheckmarkCircleRegular } from '@fluentui/react-icons';
import { HbcStatusBadge } from '@hbc/ui-kit';
import type { ISidebarPillSchema } from '../../types/sidebar';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
    ...shorthands.padding('8px', '12px'),
    height: '56px',
    backgroundColor: 'transparent',
    border: 'none',
    borderLeft: `3px solid transparent`,
    borderRadius: tokens.borderRadiusMedium,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    textAlign: 'left',
    fontFamily: tokens.fontFamilyBase,
    fontSize: '13px',

    '&:hover': {
      backgroundColor: tokens.colorNeutralBackground3,
    },

    '&[data-active="true"]': {
      backgroundColor: tokens.colorBrandBackground2,
      borderLeftColor: tokens.colorBrandForeground1,
    },

    '&[data-reviewed="true"]:not([data-active="true"])': {
      opacity: 0.65,
    },

    '&:focus': {
      outline: `2px solid ${tokens.colorBrandForeground1}`,
      outlineOffset: '-2px',
    },
  },

  indicator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    minWidth: '20px',
    flexShrink: 0,
    color: tokens.colorPaletteGreenForeground1,
  },

  emptyIndicator: {
    width: '20px',
    height: '20px',
    minWidth: '20px',
    borderRadius: tokens.borderRadiusCircle,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
  },

  textColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
  },

  title: {
    fontSize: '13px',
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',

    '&[data-reviewed="true"]': {
      textDecoration: 'line-through',
      color: tokens.colorNeutralForeground3,
    },
  },

  subtitle: {
    fontSize: '11px',
    color: tokens.colorNeutralForeground3,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  statusBadge: {
    flexShrink: 0,
  },
});

export interface RecordPillProps {
  schema: ISidebarPillSchema;
  isActive: boolean;
  isReviewed: boolean;
  onClick: () => void;
  className?: string;
}

/**
 * Individual record pill in the sidebar.
 *
 * Shows:
 * - Reviewed indicator (checkmark or placeholder circle)
 * - Title and subtitle (truncated to 1 line each)
 * - Optional status badge on the right
 *
 * States:
 * - Active: brand background with left border
 * - Reviewed (not active): reduced opacity and strikethrough title
 * - Hover: slightly lighter background
 */
export const RecordPill: React.FC<RecordPillProps> = ({
  schema,
  isActive,
  isReviewed,
  onClick,
  className,
}) => {
  const styles = useStyles();

  return (
    <button
      className={`${styles.root} ${className ?? ''}`}
      onClick={onClick}
      data-active={isActive}
      data-reviewed={isReviewed}
      role="button"
      aria-current={isActive ? 'page' : undefined}
      aria-label={`${schema.title}${schema.subtitle ? ` - ${schema.subtitle}` : ''} ${
        isReviewed ? '(reviewed)' : ''
      }`}
      title={schema.title}
    >
      {/* Reviewed Indicator */}
      <div className={styles.indicator}>
        {isReviewed ? (
          <CheckmarkCircleRegular fontSize={16} />
        ) : (
          <div className={styles.emptyIndicator} />
        )}
      </div>

      {/* Text Column */}
      <div className={styles.textColumn}>
        <div className={styles.title} data-reviewed={isReviewed}>
          {schema.title}
        </div>
        {schema.subtitle && <div className={styles.subtitle}>{schema.subtitle}</div>}
      </div>

      {/* Status Badge (if present) */}
      {schema.statusBadge && (
        <div className={styles.statusBadge}>
          <HbcStatusBadge
            status={schema.statusBadge.status}
            size="small"
            aria-label={`Status: ${schema.statusBadge.status}`}
          />
        </div>
      )}
    </button>
  );
};

RecordPill.displayName = 'RecordPill';
```

---

### 4. useFilteredRecords.ts (Filtering Hook)

```typescript
// packages/review-mode/src/components/NavigationSidebar/useFilteredRecords.ts

import { useMemo } from 'react';
import type {
  IReviewModeFilter,
  IReviewModeFilterValue,
  ISidebarSchema,
} from '../../types/review-mode';

/**
 * Filters a record array by active filter values and search term.
 *
 * @param records - The raw records array
 * @param filters - Available filter definitions
 * @param filterValues - Currently active filter values (map of filterId -> value)
 * @param searchTerm - Search string (case-insensitive)
 * @param sidebarSchema - Function to extract sidebar schema (title, subtitle) from record
 * @returns Filtered records array
 */
export function useFilteredRecords<T>(
  records: T[],
  filters: IReviewModeFilter[],
  filterValues: Map<string, IReviewModeFilterValue>,
  searchTerm: string,
  sidebarSchema?: (record: T) => { title: string; subtitle?: string },
): T[] {
  return useMemo(() => {
    let filtered = [...records];

    // Apply each active filter
    for (const filter of filters) {
      const filterValue = filterValues.get(filter.id);
      if (filterValue !== undefined && filter.filterFn) {
        filtered = filtered.filter((record) =>
          filter.filterFn(record, filterValue)
        );
      }
    }

    // Apply search term (case-insensitive) against title and subtitle
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter((record) => {
        if (!sidebarSchema) return true;
        const schema = sidebarSchema(record);
        const titleMatch = schema.title
          .toLowerCase()
          .includes(lowerSearch);
        const subtitleMatch = schema.subtitle
          ?.toLowerCase()
          .includes(lowerSearch) ?? false;
        return titleMatch || subtitleMatch;
      });
    }

    return filtered;
  }, [records, filters, filterValues, searchTerm, sidebarSchema]);
}
```

---

### 5. sidebar.ts (Type Definitions)

```typescript
// packages/review-mode/src/types/sidebar.ts

/**
 * Schema information for a single record pill in the sidebar.
 */
export interface ISidebarPillSchema {
  /**
   * Primary title text (truncated to 1 line).
   */
  title: string;

  /**
   * Secondary subtitle text (truncated to 1 line, muted color).
   * Optional.
   */
  subtitle?: string;

  /**
   * Status badge to display on the right side of the pill.
   * Optional.
   */
  statusBadge?: {
    status: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  };
}

/**
 * Function to extract sidebar schema from a record.
 */
export type ISidebarSchema<T> = (record: T) => ISidebarPillSchema;
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
pnpm test --testPathPattern="NavigationSidebar|SidebarSearchInput|RecordPill"
```

### Manual Testing Checklist
- [ ] Sidebar renders with full record list when collapsed is false
- [ ] Click collapse toggle button: sidebar smoothly transitions to 40px width
- [ ] Click expand toggle button: sidebar smoothly transitions back to 280px width
- [ ] Search input accepts text and filters records in real-time
- [ ] Click clear (×) button in search: search clears and input focuses
- [ ] Hover over RecordPill: background lightens
- [ ] Click RecordPill: activeRecordId updates, pill shows active styling
- [ ] Reviewed pills show checkmark indicator and reduced opacity (when not active)
- [ ] Reviewed count at bottom updates when records are marked reviewed
- [ ] Search clears when active section changes
- [ ] Keyboard navigation in search input works (Tab, Enter)
- [ ] Status badges render correctly if provided
- [ ] Empty state text shows when no records match filters

---

## Definition of Done

- [ ] All 5 files created with complete TypeScript code and JSDoc comments
- [ ] Fluent UI styles applied using `makeStyles` (no inline styles)
- [ ] `useReviewMode()` hook integration verified
- [ ] `useFilteredRecords()` hook is properly memoized and performant
- [ ] RecordPill accessibility: `aria-current`, `aria-label`, focus outline, keyboard support
- [ ] Search input auto-clears when section changes
- [ ] Collapse/expand toggle buttons are accessible with aria-labels and aria-expanded
- [ ] Component exports added to `packages/review-mode/src/index.ts`
- [ ] Type exports added to `packages/review-mode/src/types/index.ts`
- [ ] Unit tests written for all components (snapshot + interaction)
- [ ] Integration test confirms sidebar + filters + search work together
- [ ] No console warnings or linting errors
- [ ] Ready to integrate with PH7-RM-4 (RecordCard)

<!-- IMPLEMENTATION PROGRESS & NOTES
Phase PH7-RM-3 created: 2026-03-08
Documentation added: docs/architecture/plans/PH7-RM-3-NavigationSidebar.md
Next: PH7-RM-4 (RecordCard & EditDrawer)
-->
