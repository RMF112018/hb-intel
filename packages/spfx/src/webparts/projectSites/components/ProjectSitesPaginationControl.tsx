/**
 * Real, accessible pagination control for the Project Sites surface.
 *
 * Shape:
 *   [‹ prev]  [1] [2] … [n-1] [n]  [next ›]   |   Showing 21–40 of 156
 *
 * Compact-mode collapses to:
 *   [‹]  Page 2 of 14  [›]
 *
 * Premium stack: lucide-react chevron icons, motion-aware via CSS
 * `prefers-reduced-motion`, real `<nav>` semantics, ≥44px touch targets.
 * Hidden when `totalPages <= 1`.
 */
import React, { type FC } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { makeStyles, mergeClasses, shorthands } from '@griffel/react';
import {
  HBC_SURFACE_LIGHT,
  HBC_PRIMARY_BLUE,
  HBC_RADIUS_SM,
  HBC_SPACE_XS,
  HBC_SPACE_SM,
  HBC_SPACE_MD,
  HBC_SPACE_LG,
  TRANSITION_FAST,
  bodySmall,
  label as labelType,
} from '@hbc/ui-kit/theme';
import { buildPageWindow } from '../projectSitesPagination.js';
import type { ProjectSitesLayoutMode } from '../projectSitesLayoutMode.js';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: `${HBC_SPACE_MD}px`,
    paddingTop: `${HBC_SPACE_LG}px`,
    paddingBottom: `${HBC_SPACE_SM}px`,
    marginTop: `${HBC_SPACE_LG}px`,
    ...shorthands.borderTop('1px', 'solid', HBC_SURFACE_LIGHT['border-default']),
  },
  rangeLabel: {
    ...bodySmall,
    color: HBC_SURFACE_LIGHT['text-muted'],
    flex: '0 0 auto',
  },
  pager: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_XS}px`,
    flex: '1 1 auto',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
  },
  pagerCompact: {
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    ...labelType,
    minWidth: '44px',
    minHeight: '44px',
    paddingTop: `${HBC_SPACE_XS}px`,
    paddingBottom: `${HBC_SPACE_XS}px`,
    paddingLeft: `${HBC_SPACE_SM}px`,
    paddingRight: `${HBC_SPACE_SM}px`,
    backgroundColor: HBC_SURFACE_LIGHT['surface-0'],
    color: HBC_SURFACE_LIGHT['text-primary'],
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transitionProperty: 'background-color, color, border-color',
    transitionDuration: TRANSITION_FAST,
    ...shorthands.border('1px', 'solid', HBC_SURFACE_LIGHT['border-default']),
    ...shorthands.borderRadius(HBC_RADIUS_SM),
    ':hover:not(:disabled)': {
      backgroundColor: HBC_SURFACE_LIGHT['surface-1'],
      ...shorthands.borderColor(HBC_PRIMARY_BLUE),
    },
    ':focus-visible': {
      outlineStyle: 'solid',
      outlineWidth: '2px',
      outlineOffset: '2px',
      outlineColor: HBC_PRIMARY_BLUE,
    },
    ':disabled': {
      opacity: 0.4,
      cursor: 'not-allowed',
    },
    '@media (prefers-reduced-motion: reduce)': {
      transitionDuration: '0ms',
    },
  },
  buttonActive: {
    backgroundColor: HBC_PRIMARY_BLUE,
    color: HBC_SURFACE_LIGHT['surface-0'],
    cursor: 'default',
    ...shorthands.borderColor(HBC_PRIMARY_BLUE),
    ':hover:not(:disabled)': {
      backgroundColor: HBC_PRIMARY_BLUE,
      ...shorthands.borderColor(HBC_PRIMARY_BLUE),
    },
  },
  ellipsis: {
    ...labelType,
    color: HBC_SURFACE_LIGHT['text-muted'],
    minWidth: '32px',
    textAlign: 'center',
    userSelect: 'none',
  },
  compactReadout: {
    ...labelType,
    color: HBC_SURFACE_LIGHT['text-primary'],
    flex: '1 1 auto',
    textAlign: 'center',
  },
  iconOnly: {
    paddingLeft: `${HBC_SPACE_XS}px`,
    paddingRight: `${HBC_SPACE_XS}px`,
  },
});

export interface ProjectSitesPaginationControlProps {
  page: number;
  totalPages: number;
  totalItems: number;
  /** Inclusive 1-based [start, end] range — `[0, 0]` when no items. */
  range: [number, number];
  layoutMode: ProjectSitesLayoutMode;
  onPageChange: (nextPage: number) => void;
  /** Optional id for ARIA `aria-controls` from external controls. */
  controlsId?: string;
}

const PAGE_BUTTONS_BY_MODE: Record<ProjectSitesLayoutMode, number> = {
  wide: 7,
  medium: 5,
  compact: 0, // compact uses a different shape entirely
};

export const ProjectSitesPaginationControl: FC<ProjectSitesPaginationControlProps> = ({
  page,
  totalPages,
  totalItems,
  range,
  layoutMode,
  onPageChange,
  controlsId,
}) => {
  const classes = useStyles();

  if (totalPages <= 1) return null;

  const isCompact = layoutMode === 'compact';
  const isFirst = page <= 1;
  const isLast = page >= totalPages;
  const goTo = (n: number) => {
    if (n < 1 || n > totalPages || n === page) return;
    onPageChange(n);
  };

  const rangeLabel = totalItems > 0
    ? `Showing ${range[0]}–${range[1]} of ${totalItems}`
    : '';

  if (isCompact) {
    return (
      <nav
        className={classes.root}
        aria-label="Project sites pagination"
        aria-controls={controlsId}
      >
        <span className={classes.rangeLabel}>{rangeLabel}</span>
        <div className={mergeClasses(classes.pager, classes.pagerCompact)}>
          <button
            type="button"
            className={mergeClasses(classes.button, classes.iconOnly)}
            onClick={() => goTo(page - 1)}
            disabled={isFirst}
            aria-label="Previous page"
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <span className={classes.compactReadout} aria-live="polite">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            className={mergeClasses(classes.button, classes.iconOnly)}
            onClick={() => goTo(page + 1)}
            disabled={isLast}
            aria-label="Next page"
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
      </nav>
    );
  }

  const window = buildPageWindow(page, totalPages, PAGE_BUTTONS_BY_MODE[layoutMode]);

  return (
    <nav
      className={classes.root}
      aria-label="Project sites pagination"
      aria-controls={controlsId}
    >
      <span className={classes.rangeLabel} aria-live="polite">{rangeLabel}</span>
      <div className={classes.pager}>
        <button
          type="button"
          className={mergeClasses(classes.button, classes.iconOnly)}
          onClick={() => goTo(1)}
          disabled={isFirst}
          aria-label="First page"
        >
          <ChevronsLeft size={18} aria-hidden="true" />
        </button>
        <button
          type="button"
          className={mergeClasses(classes.button, classes.iconOnly)}
          onClick={() => goTo(page - 1)}
          disabled={isFirst}
          aria-label="Previous page"
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>

        {window.map((slot, idx) =>
          slot === '…' ? (
            <span key={`ellipsis-${idx}`} className={classes.ellipsis} aria-hidden="true">
              …
            </span>
          ) : (
            <button
              key={`page-${slot}`}
              type="button"
              className={mergeClasses(
                classes.button,
                slot === page && classes.buttonActive,
              )}
              onClick={() => goTo(slot)}
              aria-label={`Page ${slot}`}
              aria-current={slot === page ? 'page' : undefined}
            >
              {slot}
            </button>
          ),
        )}

        <button
          type="button"
          className={mergeClasses(classes.button, classes.iconOnly)}
          onClick={() => goTo(page + 1)}
          disabled={isLast}
          aria-label="Next page"
        >
          <ChevronRight size={18} aria-hidden="true" />
        </button>
        <button
          type="button"
          className={mergeClasses(classes.button, classes.iconOnly)}
          onClick={() => goTo(totalPages)}
          disabled={isLast}
          aria-label="Last page"
        >
          <ChevronsRight size={18} aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
};
