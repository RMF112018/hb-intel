/**
 * HbcPagination — Standalone pagination with page numbers and size selector
 * PH4.10 §Step 4 | Blueprint §2c
 *
 * - Hidden when single page (totalItems <= pageSize)
 * - Ellipsis truncation for large page counts (first, last, current +/- 2)
 * - Page size selector (25, 50, 100)
 * - Field Mode: dark surface tokens
 */
import * as React from 'react';
import { makeStyles, mergeClasses } from '@griffel/react';
import { HBC_ACCENT_ORANGE, HBC_SURFACE_LIGHT, HBC_SURFACE_FIELD } from '../theme/tokens.js';
import { TRANSITION_FAST } from '../theme/animations.js';
import { ChevronBack, ChevronForward } from '../icons/index.js';
import type { HbcPaginationProps, PageSizeOption } from './types.js';

const PAGE_SIZES: PageSizeOption[] = [25, 50, 100];

const useStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '48px',
    paddingLeft: '16px',
    paddingRight: '16px',
    borderTop: `1px solid ${HBC_SURFACE_LIGHT['border-default']}`,
    fontSize: '0.8125rem',
    color: HBC_SURFACE_LIGHT['text-muted'],
  },
  rootField: {
    borderTop: `1px solid ${HBC_SURFACE_FIELD['border-default']}`,
    color: HBC_SURFACE_FIELD['text-muted'],
  },
  summary: {
    whiteSpace: 'nowrap',
  },
  pageButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
  },
  navButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    background: 'none',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    color: HBC_SURFACE_LIGHT['text-primary'],
    transitionProperty: 'background-color',
    transitionDuration: TRANSITION_FAST,
    ':hover': {
      backgroundColor: HBC_SURFACE_LIGHT['surface-2'],
    },
    ':disabled': {
      opacity: 0.3,
      cursor: 'not-allowed',
    },
  },
  navButtonField: {
    color: HBC_SURFACE_FIELD['text-primary'],
    ':hover': {
      backgroundColor: HBC_SURFACE_FIELD['surface-2'],
    },
  },
  pageButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '32px',
    height: '32px',
    background: 'none',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.8125rem',
    fontFamily: 'inherit',
    color: HBC_SURFACE_LIGHT['text-primary'],
    transitionProperty: 'background-color, color',
    transitionDuration: TRANSITION_FAST,
    ':hover': {
      backgroundColor: HBC_SURFACE_LIGHT['surface-2'],
    },
  },
  pageButtonField: {
    color: HBC_SURFACE_FIELD['text-primary'],
    ':hover': {
      backgroundColor: HBC_SURFACE_FIELD['surface-2'],
    },
  },
  pageButtonActive: {
    backgroundColor: HBC_ACCENT_ORANGE,
    color: '#FFFFFF',
    fontWeight: '600',
    ':hover': {
      backgroundColor: HBC_ACCENT_ORANGE,
    },
  },
  ellipsis: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '32px',
    height: '32px',
    fontSize: '0.8125rem',
    color: HBC_SURFACE_LIGHT['text-muted'],
    userSelect: 'none',
  },
  ellipsisField: {
    color: HBC_SURFACE_FIELD['text-muted'],
  },
  sizeSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  select: {
    fontSize: '0.8125rem',
    fontFamily: 'inherit',
    border: `1px solid ${HBC_SURFACE_LIGHT['border-default']}`,
    borderRadius: '4px',
    backgroundColor: HBC_SURFACE_LIGHT['surface-0'],
    color: HBC_SURFACE_LIGHT['text-primary'],
    paddingLeft: '6px',
    paddingRight: '6px',
    paddingTop: '4px',
    paddingBottom: '4px',
    cursor: 'pointer',
  },
  selectField: {
    border: `1px solid ${HBC_SURFACE_FIELD['border-default']}`,
    backgroundColor: HBC_SURFACE_FIELD['surface-1'],
    color: HBC_SURFACE_FIELD['text-primary'],
  },
});

/** Compute visible page numbers with ellipsis gaps */
function getPageNumbers(current: number, total: number, max: number): (number | 'ellipsis')[] {
  if (total <= max) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const result: (number | 'ellipsis')[] = [];
  const sideCount = Math.floor((max - 3) / 2); // reserve slots for first, last, and one ellipsis

  let start = Math.max(2, current - sideCount);
  let end = Math.min(total - 1, current + sideCount);

  // Adjust if near edges
  if (current <= sideCount + 2) {
    end = max - 2;
  }
  if (current >= total - sideCount - 1) {
    start = total - max + 3;
  }

  result.push(1);
  if (start > 2) result.push('ellipsis');
  for (let i = start; i <= end; i++) result.push(i);
  if (end < total - 1) result.push('ellipsis');
  result.push(total);

  return result;
}

export const HbcPagination: React.FC<HbcPaginationProps> = ({
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  maxPageButtons = 7,
  isFieldMode = false,
  className,
}) => {
  const styles = useStyles();

  const totalPages = Math.ceil(totalItems / pageSize);

  // Hidden when single page
  if (totalItems <= pageSize) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  const pages = getPageNumbers(currentPage, totalPages, maxPageButtons);

  return (
    <div
      data-hbc-ui="pagination"
      className={mergeClasses(
        styles.root,
        isFieldMode && styles.rootField,
        className,
      )}
    >
      {/* Left: Summary */}
      <span className={styles.summary}>
        Showing {startItem}&ndash;{endItem} of {totalItems} items
      </span>

      {/* Center: Page buttons */}
      <div className={styles.pageButtons}>
        <button
          type="button"
          className={mergeClasses(styles.navButton, isFieldMode && styles.navButtonField)}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous page"
        >
          <ChevronBack size="sm" />
        </button>

        {pages.map((page, idx) =>
          page === 'ellipsis' ? (
            <span key={`ellipsis-${idx}`} className={mergeClasses(styles.ellipsis, isFieldMode && styles.ellipsisField)}>
              &hellip;
            </span>
          ) : (
            <button
              key={page}
              type="button"
              className={mergeClasses(
                styles.pageButton,
                isFieldMode && styles.pageButtonField,
                page === currentPage && styles.pageButtonActive,
              )}
              onClick={() => onPageChange(page)}
              aria-label={`Page ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          ),
        )}

        <button
          type="button"
          className={mergeClasses(styles.navButton, isFieldMode && styles.navButtonField)}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
        >
          <ChevronForward size="sm" />
        </button>
      </div>

      {/* Right: Page size selector */}
      <div className={styles.sizeSelector}>
        <span>Rows:</span>
        <select
          className={mergeClasses(styles.select, isFieldMode && styles.selectField)}
          value={pageSize}
          onChange={(e) => onPageSizeChange?.(Number(e.target.value) as PageSizeOption)}
          aria-label="Page size"
        >
          {PAGE_SIZES.map((size) => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export type { HbcPaginationProps, PageSizeOption } from './types.js';
