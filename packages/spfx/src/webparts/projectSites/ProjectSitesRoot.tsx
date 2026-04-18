/**
 * Root React component for the Project Sites web part.
 *
 * Self-contained: loads available years, exposes a premium productive
 * control bar (search, scope, sort, advanced filters, chips, reset), and
 * renders the filtered card grid. No external props needed.
 *
 * **Light-mode only.** Governed by `HbcThemeProvider(forceTheme='light')`
 * at the mount boundary (`apps/project-sites/src/mount.tsx`).
 *
 * Import discipline (W01r-P11 Project Sites compliance closure):
 *   - Primitives from `@hbc/ui-kit/primitives`
 *   - Theme tokens, typography, spacing, elevation, motion from `@hbc/ui-kit/theme`
 *   - HBC icons from `@hbc/ui-kit/icons`
 *
 * W01r-P12 enhancement (search / filter / sort):
 *   - Scope model: `{ kind: 'year' | 'all' }` — supports an `All Projects`
 *     view in addition to the year-scoped view.
 *   - Client-side pipeline: search → filter → sort over the normalized
 *     entry set returned by the hook. Pipeline logic lives in
 *     `projectSitesFilter.ts` so it can be unit-tested independently.
 *   - Premium control bar: `HbcSearch` (local, debounced), segmented
 *     scope, native styled sort select, ghost filter toggle, active
 *     filter chips, text reset.
 */
import React, { useState, useEffect, useMemo, useCallback, useRef, type FC } from 'react';
import { makeStyles, mergeClasses, shorthands } from '@griffel/react';
import {
  HbcEmptyState,
  HbcSegmentedControl,
  HbcSearch,
  HbcButton,
} from '@hbc/ui-kit/primitives';
import {
  HBC_SURFACE_LIGHT,
  HBC_STATUS_COLORS,
  HBC_PRIMARY_BLUE,
  HBC_RADIUS_XL,
  HBC_RADIUS_SM,
  HBC_RADIUS_MD,
  HBC_SPACE_XS,
  HBC_SPACE_SM,
  HBC_SPACE_MD,
  HBC_SPACE_LG,
  HBC_SPACE_XL,
  HBC_SPACE_2XL,
  TRANSITION_FAST,
  TRANSITION_SLOW,
  elevationLevel0,
  elevationLevel1,
  heading1,
  label as labelType,
  bodySmall,
  hbcMediaQuery,
} from '@hbc/ui-kit/theme';
import { Search, AlertTriangle, Filter, Cancel } from '@hbc/ui-kit/icons';
import { useAvailableYears } from './hooks/useAvailableYears.js';
import { useProjectSites } from './hooks/useProjectSites.js';
import {
  resolveInitialProjectSitesScope,
  scopeFromYear,
  SCOPE_ALL,
  scopesEqual,
  DEFAULT_SORT_KEY,
  EMPTY_FILTERS,
  SORT_OPTIONS,
  filtersAreEmpty,
  countActiveFilters,
  type ProjectSitesScope,
  type ProjectSitesSortKey,
  type ProjectSitesFilters,
  type IProjectSiteEntry,
  type IProjectSitesRuntimeContext,
  type IResolvedProjectSitesScope,
  type ProjectSitesScopeSource,
} from './types.js';
import {
  applyProjectSitesPipeline,
  extractProjectSitesFacets,
} from './projectSitesFilter.js';
import { useProjectSitesPeopleDisplayLabels } from './hooks/useProjectSitesPeopleDisplayLabels.js';
import { formatProjectSitesPersonLabel } from './projectSitesPeopleDisplay.js';
import { ProjectSiteCard } from './components/ProjectSiteCard.js';
import {
  useProjectSitesContainerState,
  type ProjectSitesLayoutMode,
} from './projectSitesLayoutMode.js';

// ── Styles ────────────────────────────────────────────────────────────────

const useStyles = makeStyles({
  root: {
    color: HBC_SURFACE_LIGHT['text-primary'],
    paddingTop: `${HBC_SPACE_LG}px`,
    // Host-fit resilience: honor safe-area insets at the bottom so
    // SharePoint mobile / iframe hosts with bottom chrome do not crowd
    // the last card row. `max(...)` keeps the desktop padding intact
    // when there is no inset.
    paddingBottom: `max(${HBC_SPACE_XL}px, calc(${HBC_SPACE_MD}px + env(safe-area-inset-bottom, 0px)))`,
    // W01r-P14: responsive horizontal inset so the full-bleed
    // SharePoint-section rendering has comfortable breathing room
    // at the left/right edges without collapsing the full-width
    // behavior or introducing a fixed max-width lock. Mobile keeps
    // a modest 16 px gutter; tablet widens to 32 px; desktop opens
    // to 64 px so the header / control bar / card grid never feel
    // pressed against the section edges.
    paddingLeft: `max(${HBC_SPACE_MD}px, env(safe-area-inset-left, 0px))`,
    paddingRight: `max(${HBC_SPACE_MD}px, env(safe-area-inset-right, 0px))`,
    [hbcMediaQuery('tablet')]: {
      paddingLeft: `${HBC_SPACE_XL}px`,
      paddingRight: `${HBC_SPACE_XL}px`,
    },
    [hbcMediaQuery('desktop')]: {
      paddingLeft: `${HBC_SPACE_2XL}px`,
      paddingRight: `${HBC_SPACE_2XL}px`,
    },
  },
  rootCompact: {
    paddingTop: `${HBC_SPACE_MD}px`,
  },
  rootMedium: {
    paddingTop: `${HBC_SPACE_MD}px`,
  },

  // ── Header bar ──────────────────────────────────────────────────────
  header: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    rowGap: `${HBC_SPACE_MD}px`,
    columnGap: `${HBC_SPACE_LG}px`,
    paddingBottom: `${HBC_SPACE_MD}px`,
    marginBottom: `${HBC_SPACE_LG}px`,
    ...shorthands.borderBottom('1px', 'solid', HBC_SURFACE_LIGHT['surface-3']),
  },
  // Compact/tight: drop the paddingBottom+marginBottom to a combined
  // single-space rhythm so the first card row arrives sooner on
  // constrained first screens. Eyebrow is suppressed via render
  // branching in compact mode.
  headerTight: {
    rowGap: `${HBC_SPACE_XS}px`,
    paddingBottom: `${HBC_SPACE_XS}px`,
    marginBottom: `${HBC_SPACE_MD}px`,
  },
  headerLead: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${HBC_SPACE_XS}px`,
    minWidth: 0,
  },
  eyebrow: {
    fontSize: labelType.fontSize,
    fontWeight: labelType.fontWeight,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: HBC_SURFACE_LIGHT['text-muted'],
    lineHeight: 1.2,
  },
  title: {
    fontSize: heading1.fontSize,
    fontWeight: heading1.fontWeight,
    lineHeight: heading1.lineHeight,
    letterSpacing: heading1.letterSpacing,
    color: HBC_SURFACE_LIGHT['text-primary'],
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
  },
  countBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_XS}px`,
    fontSize: labelType.fontSize,
    fontWeight: 600,
    color: HBC_SURFACE_LIGHT['text-muted'],
    backgroundColor: HBC_SURFACE_LIGHT['surface-2'],
    paddingTop: `${HBC_SPACE_XS}px`,
    paddingBottom: `${HBC_SPACE_XS}px`,
    paddingLeft: `${HBC_SPACE_SM}px`,
    paddingRight: `${HBC_SPACE_SM}px`,
    borderRadius: HBC_RADIUS_SM,
    ...shorthands.border('1px', 'solid', HBC_SURFACE_LIGHT['surface-3']),
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  },
  scopeContextPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_XS}px`,
    fontSize: bodySmall.fontSize,
    color: HBC_SURFACE_LIGHT['text-muted'],
    backgroundColor: HBC_SURFACE_LIGHT['surface-1'],
    paddingTop: `${HBC_SPACE_XS}px`,
    paddingBottom: `${HBC_SPACE_XS}px`,
    paddingLeft: `${HBC_SPACE_SM}px`,
    paddingRight: `${HBC_SPACE_SM}px`,
    borderRadius: HBC_RADIUS_SM,
    ...shorthands.border('1px', 'solid', HBC_SURFACE_LIGHT['surface-3']),
  },
  contextSummary: {
    marginTop: `${HBC_SPACE_SM}px`,
    marginBottom: `${HBC_SPACE_MD}px`,
    paddingTop: `${HBC_SPACE_SM}px`,
    paddingBottom: `${HBC_SPACE_SM}px`,
    paddingLeft: `${HBC_SPACE_MD}px`,
    paddingRight: `${HBC_SPACE_MD}px`,
    borderRadius: HBC_RADIUS_SM,
    backgroundColor: HBC_SURFACE_LIGHT['surface-1'],
    ...shorthands.border('1px', 'solid', HBC_SURFACE_LIGHT['surface-3']),
    fontSize: bodySmall.fontSize,
    color: HBC_SURFACE_LIGHT['text-muted'],
    lineHeight: 1.35,
  },
  contextSummaryCompact: {
    marginTop: `${HBC_SPACE_XS}px`,
    marginBottom: `${HBC_SPACE_SM}px`,
    paddingTop: `${HBC_SPACE_XS}px`,
    paddingBottom: `${HBC_SPACE_XS}px`,
    paddingLeft: `${HBC_SPACE_SM}px`,
    paddingRight: `${HBC_SPACE_SM}px`,
  },
  contextSummaryWarning: {
    ...shorthands.borderColor(HBC_STATUS_COLORS.warning),
    color: HBC_SURFACE_LIGHT['text-primary'],
  },

  // ── Control bar (search / scope / sort / filters) ──────────────────
  controlBar: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
    marginBottom: `${HBC_SPACE_MD}px`,
  },
  // Medium/tablet: deliberate two-lane composition. Lane 1 = search
  // (full width). Lane 2 = scope + sort + filters grouped in a single
  // inline row with a subtle top divider that reads as a designed
  // secondary surface rather than wrapped overflow.
  controlBarMedium: {
    alignItems: 'stretch',
    rowGap: `${HBC_SPACE_SM}px`,
  },
  controlBarCompact: {
    alignItems: 'stretch',
    flexDirection: 'column',
  },
  searchSlot: {
    flex: '1 1 260px',
    minWidth: '220px',
    maxWidth: '480px',
  },
  searchSlotStacked: {
    flexBasis: '100%',
    maxWidth: '100%',
    minWidth: 0,
  },
  // Dedicated lane-2 container for medium mode. Groups scope, sort,
  // and filter clusters as a single horizontal row under the search
  // lane, with a subtle divider that signals "this is a second
  // operating row" rather than "search wrapped to a new line".
  secondaryControlLane: {
    display: 'flex',
    flexBasis: '100%',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: `${HBC_SPACE_MD}px`,
    paddingTop: `${HBC_SPACE_SM}px`,
    ...shorthands.borderTop('1px', 'solid', HBC_SURFACE_LIGHT['surface-3']),
  },
  secondaryControlLaneActions: {
    marginLeft: 'auto',
  },
  controlCluster: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
  },
  controlClusterStacked: {
    flex: '1 1 100%',
    minWidth: 0,
  },
  controlClusterCompact: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: `${HBC_SPACE_XS}px`,
  },
  controlLabel: {
    fontSize: labelType.fontSize,
    fontWeight: labelType.fontWeight,
    letterSpacing: '0.02em',
    textTransform: 'uppercase',
    color: HBC_SURFACE_LIGHT['text-muted'],
    whiteSpace: 'nowrap',
  },
  controlLabelCompactHidden: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
    ...shorthands.borderWidth(0),
  },
  sortSelect: {
    height: '36px',
    minWidth: '200px',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    color: HBC_SURFACE_LIGHT['text-primary'],
    backgroundColor: HBC_SURFACE_LIGHT['surface-0'],
    ...shorthands.border('1px', 'solid', HBC_SURFACE_LIGHT['border-default']),
    borderRadius: HBC_RADIUS_MD,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: `${HBC_SPACE_SM}px`,
    paddingRight: `${HBC_SPACE_SM}px`,
    cursor: 'pointer',
    transitionProperty: 'border-color',
    transitionDuration: TRANSITION_FAST,
    ':focus-visible': {
      ...shorthands.borderColor(HBC_PRIMARY_BLUE),
      outlineWidth: '2px',
      outlineStyle: 'solid',
      outlineColor: HBC_PRIMARY_BLUE,
      outlineOffset: '1px',
    },
  },
  compactScopeSelect: {
    height: '36px',
    width: '100%',
    minWidth: 0,
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    color: HBC_SURFACE_LIGHT['text-primary'],
    backgroundColor: HBC_SURFACE_LIGHT['surface-0'],
    ...shorthands.border('1px', 'solid', HBC_SURFACE_LIGHT['border-default']),
    borderRadius: HBC_RADIUS_MD,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: `${HBC_SPACE_SM}px`,
    paddingRight: `${HBC_SPACE_SM}px`,
    cursor: 'pointer',
    transitionProperty: 'border-color',
    transitionDuration: TRANSITION_FAST,
    ':focus-visible': {
      ...shorthands.borderColor(HBC_PRIMARY_BLUE),
      outlineWidth: '2px',
      outlineStyle: 'solid',
      outlineColor: HBC_PRIMARY_BLUE,
      outlineOffset: '1px',
    },
  },
  filterToggleBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '18px',
    height: '18px',
    paddingLeft: `${HBC_SPACE_XS}px`,
    paddingRight: `${HBC_SPACE_XS}px`,
    marginLeft: `${HBC_SPACE_XS}px`,
    borderRadius: '9px',
    backgroundColor: HBC_PRIMARY_BLUE,
    color: '#ffffff',
    fontSize: '0.6875rem',
    fontWeight: 700,
    lineHeight: 1,
    fontVariantNumeric: 'tabular-nums',
  },

  // ── Active filter chips row ─────────────────────────────────────────
  activeChipsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: `${HBC_SPACE_XS}px`,
    marginBottom: `${HBC_SPACE_MD}px`,
  },
  activeChipsLabel: {
    fontSize: labelType.fontSize,
    fontWeight: labelType.fontWeight,
    letterSpacing: '0.02em',
    textTransform: 'uppercase',
    color: HBC_SURFACE_LIGHT['text-muted'],
    marginRight: `${HBC_SPACE_XS}px`,
  },
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_XS}px`,
    paddingTop: '3px',
    paddingBottom: '3px',
    paddingLeft: `${HBC_SPACE_SM}px`,
    paddingRight: `${HBC_SPACE_XS}px`,
    fontSize: bodySmall.fontSize,
    fontWeight: 500,
    color: HBC_PRIMARY_BLUE,
    backgroundColor: HBC_SURFACE_LIGHT['surface-2'],
    ...shorthands.border('1px', 'solid', HBC_SURFACE_LIGHT['surface-3']),
    borderRadius: HBC_RADIUS_SM,
    whiteSpace: 'nowrap',
    maxWidth: '260px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  chipLabel: {
    color: HBC_SURFACE_LIGHT['text-muted'],
    fontWeight: 600,
    marginRight: '2px',
  },
  chipRemove: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '18px',
    height: '18px',
    borderRadius: '9px',
    backgroundColor: 'transparent',
    color: HBC_SURFACE_LIGHT['text-muted'],
    ...shorthands.border('0'),
    cursor: 'pointer',
    transitionProperty: 'background-color, color',
    transitionDuration: TRANSITION_FAST,
    ':hover': {
      backgroundColor: HBC_SURFACE_LIGHT['surface-3'],
      color: HBC_SURFACE_LIGHT['text-primary'],
    },
    ':focus-visible': {
      outlineWidth: '2px',
      outlineStyle: 'solid',
      outlineColor: HBC_PRIMARY_BLUE,
      outlineOffset: '1px',
    },
  },
  chipRemoveCompact: {
    width: '28px',
    height: '28px',
    borderRadius: '14px',
  },
  chipCompact: {
    paddingTop: '5px',
    paddingBottom: '5px',
    paddingLeft: `${HBC_SPACE_SM}px`,
    paddingRight: '3px',
    maxWidth: '100%',
  },
  // Compact progressive-disclosure summary: `N filters active · Show`.
  // Keeps state awareness truthful without paying the full chip-row
  // height cost in narrow/short containers.
  compactFiltersSummary: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: `${HBC_SPACE_SM}px`,
    marginBottom: `${HBC_SPACE_SM}px`,
    paddingTop: `${HBC_SPACE_XS}px`,
    paddingBottom: `${HBC_SPACE_XS}px`,
    paddingLeft: `${HBC_SPACE_SM}px`,
    paddingRight: `${HBC_SPACE_SM}px`,
    borderRadius: HBC_RADIUS_SM,
    backgroundColor: HBC_SURFACE_LIGHT['surface-1'],
    ...shorthands.border('1px', 'solid', HBC_SURFACE_LIGHT['surface-3']),
    fontSize: bodySmall.fontSize,
  },
  compactFiltersSummaryText: {
    color: HBC_SURFACE_LIGHT['text-primary'],
    fontWeight: 600,
  },
  compactFiltersSummaryToggle: {
    display: 'inline-flex',
    alignItems: 'center',
    minHeight: '32px',
    paddingTop: `${HBC_SPACE_XS}px`,
    paddingBottom: `${HBC_SPACE_XS}px`,
    paddingLeft: `${HBC_SPACE_SM}px`,
    paddingRight: `${HBC_SPACE_SM}px`,
    fontSize: bodySmall.fontSize,
    fontWeight: 600,
    color: HBC_PRIMARY_BLUE,
    backgroundColor: 'transparent',
    ...shorthands.border('1px', 'solid', HBC_SURFACE_LIGHT['surface-3']),
    borderRadius: HBC_RADIUS_SM,
    cursor: 'pointer',
    transitionProperty: 'background-color',
    transitionDuration: TRANSITION_FAST,
    ':hover': {
      backgroundColor: HBC_SURFACE_LIGHT['surface-2'],
    },
    ':focus-visible': {
      outlineWidth: '2px',
      outlineStyle: 'solid',
      outlineColor: HBC_PRIMARY_BLUE,
      outlineOffset: '1px',
    },
  },
  activeChipsRowCompact: {
    marginBottom: `${HBC_SPACE_SM}px`,
  },

  // ── Advanced filter panel ──────────────────────────────────────────
  filterPanel: {
    backgroundColor: HBC_SURFACE_LIGHT['surface-1'],
    ...shorthands.border('1px', 'solid', HBC_SURFACE_LIGHT['surface-3']),
    borderRadius: HBC_RADIUS_MD,
    paddingTop: `${HBC_SPACE_MD}px`,
    paddingBottom: `${HBC_SPACE_MD}px`,
    paddingLeft: `${HBC_SPACE_MD}px`,
    paddingRight: `${HBC_SPACE_MD}px`,
    marginBottom: `${HBC_SPACE_MD}px`,
    boxShadow: elevationLevel0,
    animationName: {
      from: { opacity: 0, transform: 'translateY(-4px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
    },
    animationDuration: TRANSITION_FAST,
    animationFillMode: 'forwards',
    '@media (prefers-reduced-motion: reduce)': {
      animationDuration: '0.01ms',
    },
  },
  filterPanelCompact: {
    paddingTop: `${HBC_SPACE_SM}px`,
    paddingBottom: `${HBC_SPACE_SM}px`,
    paddingLeft: `${HBC_SPACE_SM}px`,
    paddingRight: `${HBC_SPACE_SM}px`,
  },
  filterPanelHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: `${HBC_SPACE_SM}px`,
    marginBottom: `${HBC_SPACE_MD}px`,
    paddingBottom: `${HBC_SPACE_SM}px`,
    ...shorthands.borderBottom('1px', 'solid', HBC_SURFACE_LIGHT['surface-3']),
  },
  filterPanelTitle: {
    fontSize: bodySmall.fontSize,
    fontWeight: 700,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: HBC_SURFACE_LIGHT['text-primary'],
  },
  filterPanelGrid: {
    display: 'grid',
    gap: `${HBC_SPACE_MD}px`,
    gridTemplateColumns: '1fr',
    [hbcMediaQuery('tablet')]: {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
    [hbcMediaQuery('desktop')]: {
      gridTemplateColumns: 'repeat(3, 1fr)',
    },
  },
  facetGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${HBC_SPACE_XS}px`,
    minWidth: 0,
  },
  facetGroupHeader: {
    fontSize: bodySmall.fontSize,
    fontWeight: 700,
    color: HBC_SURFACE_LIGHT['text-primary'],
    marginBottom: `${HBC_SPACE_XS}px`,
  },
  facetList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    maxHeight: '180px',
    overflowY: 'auto',
  },
  facetOption: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
    paddingTop: `${HBC_SPACE_XS}px`,
    paddingBottom: `${HBC_SPACE_XS}px`,
    paddingLeft: `${HBC_SPACE_XS}px`,
    paddingRight: `${HBC_SPACE_XS}px`,
    borderRadius: HBC_RADIUS_SM,
    cursor: 'pointer',
    fontSize: bodySmall.fontSize,
    color: HBC_SURFACE_LIGHT['text-primary'],
    transitionProperty: 'background-color',
    transitionDuration: TRANSITION_FAST,
    ':hover': {
      backgroundColor: HBC_SURFACE_LIGHT['surface-2'],
    },
  },
  facetOptionLabel: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flex: 1,
    minWidth: 0,
  },
  facetEmpty: {
    fontSize: bodySmall.fontSize,
    color: HBC_SURFACE_LIGHT['text-muted'],
    fontStyle: 'italic',
    paddingTop: `${HBC_SPACE_XS}px`,
    paddingBottom: `${HBC_SPACE_XS}px`,
  },

  // ── Live region ────────────────────────────────────────────────────
  liveRegion: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
    marginTop: '-1px',
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
    ...shorthands.borderWidth(0),
    ...shorthands.borderStyle('none'),
  },

  // ── Card grid ───────────────────────────────────────────────────────
  grid: {
    display: 'grid',
    gap: `${HBC_SPACE_LG}px`,
    gridTemplateColumns: '1fr',
    [hbcMediaQuery('tablet')]: {
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    },
    [hbcMediaQuery('desktop')]: {
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    },
  },
  gridModeWide: {
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
  },
  gridModeMedium: {
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
  },
  gridModeCompact: {
    gridTemplateColumns: '1fr',
  },
  gridSparse: {
    [hbcMediaQuery('tablet')]: {
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 380px))',
    },
  },
  // Wide/ultrawide sparse cluster (1–2 results). Cards stay left-
  // anchored to the usable content area; the card width is bounded so a
  // lone pair of cards does not stretch into oversized panels. The
  // grid does not center and has no outer maxWidth — centering a sparse
  // set on wide displays was the wrong choice and is reverted here.
  gridSparseCluster: {
    justifyContent: 'start',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 420px))',
  },
  // Single-card sparse featured width. A lone card is still bounded to
  // a credible reading width so it does not stretch to the full
  // container, but it sits left-anchored — not centered.
  gridSparseFeatured: {
    gridTemplateColumns: 'minmax(320px, 520px)',
    justifyContent: 'start',
  },
  gridItem: {
    minWidth: 0,
    display: 'flex',
  },

  // ── Loading shimmer (realistic card skeleton) ──────────────────────
  shimmerGrid: {
    display: 'grid',
    gap: `${HBC_SPACE_LG}px`,
    gridTemplateColumns: '1fr',
    [hbcMediaQuery('tablet')]: {
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    },
  },
  shimmerCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${HBC_SPACE_SM}px`,
    paddingTop: `${HBC_SPACE_MD}px`,
    paddingBottom: `${HBC_SPACE_MD}px`,
    paddingLeft: `${HBC_SPACE_MD}px`,
    paddingRight: `${HBC_SPACE_MD}px`,
    minHeight: '200px',
    borderRadius: HBC_RADIUS_XL,
    backgroundColor: HBC_SURFACE_LIGHT['surface-1'],
    ...shorthands.border('1px', 'solid', HBC_SURFACE_LIGHT['surface-3']),
    ...shorthands.borderTop('3px', 'solid', HBC_SURFACE_LIGHT['surface-3']),
    boxShadow: elevationLevel1,
  },
  shimmerLine: {
    height: '12px',
    borderRadius: HBC_RADIUS_SM,
    backgroundColor: HBC_SURFACE_LIGHT['surface-2'],
    animationName: {
      '0%': { opacity: 0.55 },
      '50%': { opacity: 0.25 },
      '100%': { opacity: 0.55 },
    },
    animationDuration: TRANSITION_SLOW,
    animationIterationCount: 'infinite',
    animationTimingFunction: 'ease-in-out',
    '@media (prefers-reduced-motion: reduce)': {
      animationName: {
        from: { opacity: 0.4 },
        to: { opacity: 0.4 },
      },
    },
  },
  shimmerLineShort: { width: '40%' },
  shimmerLineWide: { width: '85%', height: '18px' },
  shimmerLineMedium: { width: '60%' },
  shimmerFooter: {
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
    paddingTop: `${HBC_SPACE_SM}px`,
    ...shorthands.borderTop('1px', 'solid', HBC_SURFACE_LIGHT['surface-2']),
  },

  // ── Empty / error framing ──────────────────────────────────────────
  emptyContainer: {
    marginTop: `${HBC_SPACE_SM}px`,
    paddingTop: `${HBC_SPACE_XL}px`,
    paddingBottom: `${HBC_SPACE_XL}px`,
    paddingLeft: `${HBC_SPACE_LG}px`,
    paddingRight: `${HBC_SPACE_LG}px`,
    backgroundColor: HBC_SURFACE_LIGHT['surface-1'],
    borderRadius: HBC_RADIUS_XL,
    ...shorthands.border('1px', 'dashed', HBC_SURFACE_LIGHT['surface-3']),
    boxShadow: elevationLevel0,
  },
});

// ── Icons for empty states ────────────────────────────────────────────────

const EmptySearchIcon: FC = () => (
  <Search size="lg" color={HBC_SURFACE_LIGHT['text-muted']} />
);

const EmptyAlertIcon: FC = () => (
  <AlertTriangle size="lg" color={HBC_STATUS_COLORS.error} />
);

// ── Shimmer (realistic card skeleton) ────────────────────────────────────

const LoadingShimmer: FC = () => {
  const classes = useStyles();
  return (
    <div className={classes.shimmerGrid} role="status" aria-label="Loading project sites">
      {[0, 1, 2].map((i) => (
        <div key={i} className={classes.shimmerCard} aria-hidden="true">
          <div className={mergeClasses(classes.shimmerLine, classes.shimmerLineShort)} />
          <div className={mergeClasses(classes.shimmerLine, classes.shimmerLineWide)} />
          <div className={mergeClasses(classes.shimmerLine, classes.shimmerLineMedium)} />
          <div className={classes.shimmerFooter}>
            <div className={mergeClasses(classes.shimmerLine, classes.shimmerLineShort)} />
            <div className={mergeClasses(classes.shimmerLine, classes.shimmerLineShort)} />
          </div>
        </div>
      ))}
    </div>
  );
};

// ── Debounce hook ────────────────────────────────────────────────────────

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handle = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(handle);
  }, [value, delayMs]);
  return debounced;
}

// ── Facet group (filter panel section) ──────────────────────────────────

interface FacetGroupProps {
  heading: string;
  values: string[];
  selected: string[];
  onToggle: (value: string) => void;
  labelFor?: (value: string) => string;
}

const FacetGroup: FC<FacetGroupProps> = ({ heading, values, selected, onToggle, labelFor }) => {
  const classes = useStyles();
  return (
    <div className={classes.facetGroup}>
      <span className={classes.facetGroupHeader}>{heading}</span>
      {values.length === 0 ? (
        <span className={classes.facetEmpty}>No options in current scope</span>
      ) : (
        <div className={classes.facetList} role="group" aria-label={heading}>
          {values.map((value) => {
            const id = `facet-${heading}-${value}`;
            const checked = selected.some(
              (s) => s.trim().toLowerCase() === value.trim().toLowerCase(),
            );
            return (
              <label key={id} className={classes.facetOption} htmlFor={id}>
                <input
                  id={id}
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(value)}
                />
                <span className={classes.facetOptionLabel}>
                  {labelFor ? labelFor(value) : value}
                </span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── Scope options helper ─────────────────────────────────────────────────

interface ScopeChoice {
  value: string;
  label: string;
  scope: ProjectSitesScope;
}

interface ProjectSiteCardListItemProps {
  entry: IProjectSiteEntry;
  layoutMode: ProjectSitesLayoutMode;
  peopleDisplayLabels: Record<string, string>;
  className: string;
}

const ProjectSiteCardListItem = React.memo(function ProjectSiteCardListItem({
  entry,
  layoutMode,
  peopleDisplayLabels,
  className,
}: ProjectSiteCardListItemProps) {
  return (
    <div role="listitem" className={className}>
      <ProjectSiteCard
        entry={entry}
        layoutMode={layoutMode}
        peopleDisplayLabels={peopleDisplayLabels}
      />
    </div>
  );
});

function buildScopeChoices(years: number[]): ScopeChoice[] {
  const choices: ScopeChoice[] = [
    { value: 'all', label: 'All Projects', scope: SCOPE_ALL },
  ];
  for (const year of years) {
    choices.push({ value: `year:${year}`, label: String(year), scope: scopeFromYear(year) });
  }
  return choices;
}

function scopeChoiceValue(scope: ProjectSitesScope): string {
  return scope.kind === 'all' ? 'all' : `year:${scope.year}`;
}

function describeScopeSource(source: ProjectSitesScopeSource): string {
  if (source === 'author-override') return 'Scope source: author override (yearOverride)';
  if (source === 'host-page-year') return 'Scope source: host page Year context';
  if (source === 'default-year') return 'Scope source: default year fallback';
  if (source === 'all-projects-fallback') return 'Scope source: all-projects fallback';
  return 'Scope source: user-selected';
}

function describeLayoutMode(mode: ProjectSitesLayoutMode): string {
  if (mode === 'compact') return 'compact';
  if (mode === 'medium') return 'medium';
  return 'wide';
}

function buildContextSummary(resolvedScope: IResolvedProjectSitesScope | null): string | null {
  if (!resolvedScope) return null;
  if (resolvedScope.source === 'author-override') {
    return `Showing ${resolvedScope.scope.kind === 'year' ? resolvedScope.scope.year : 'all projects'} from author override.`;
  }
  if (resolvedScope.source === 'host-page-year') {
    return `Showing ${resolvedScope.scope.kind === 'year' ? resolvedScope.scope.year : 'all projects'} from host page Year context.`;
  }
  if (resolvedScope.source === 'default-year') {
    return `No authoritative year context was provided; showing default year ${resolvedScope.resolvedYear ?? ''}.`;
  }
  if (resolvedScope.source === 'all-projects-fallback') {
    return 'No authoritative year context or valid Year values were available; showing All Projects.';
  }
  return 'Scope was set directly in this session.';
}

// ── Component ────────────────────────────────────────────────────────────

interface ProjectSitesRootProps {
  runtimeContext?: IProjectSitesRuntimeContext | null;
}

export const ProjectSitesRoot: FC<ProjectSitesRootProps> = ({ runtimeContext = null }) => {
  const classes = useStyles();
  const rootRef = useRef<HTMLElement | null>(null);
  const containerState = useProjectSitesContainerState(rootRef);
  const layoutMode = containerState.mode;
  const isCompactMode = layoutMode === 'compact';
  const isMediumMode = layoutMode === 'medium';
  const yearsResult = useAvailableYears();

  // Control-bar state
  const [scope, setScope] = useState<ProjectSitesScope | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebouncedValue(searchInput, 200);
  const [sortKey, setSortKey] = useState<ProjectSitesSortKey>(DEFAULT_SORT_KEY);
  const [filters, setFilters] = useState<ProjectSitesFilters>(EMPTY_FILTERS);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isCompactChipsExpanded, setIsCompactChipsExpanded] = useState(false);
  const [resolvedScope, setResolvedScope] = useState<IResolvedProjectSitesScope | null>(null);

  // Resolve initial scope from authoritative context when years first arrive.
  useEffect(() => {
    if (yearsResult.status === 'success' && scope === null) {
      const next = resolveInitialProjectSitesScope(yearsResult.years, runtimeContext);
      setScope(next.scope);
      setResolvedScope(next);
    }
  }, [yearsResult.status, yearsResult.years, scope, runtimeContext]);

  const projectsResult = useProjectSites(scope);

  // Scope segmented-control choices
  const scopeChoices = useMemo(
    () => (yearsResult.status === 'success' ? buildScopeChoices(yearsResult.years) : []),
    [yearsResult],
  );

  // Facets for the advanced filter panel — derived from the current
  // normalized entry set (so the panel only offers values that actually
  // exist in the current scope).
  const facets = useMemo(
    () => (projectsResult?.status === 'success' ? extractProjectSitesFacets(projectsResult.entries) : null),
    [projectsResult],
  );
  const peopleUpns = useMemo(() => {
    if (!facets) return [];
    return [
      ...facets.projectManagerUpns,
      ...facets.leadEstimatorUpns,
      ...facets.projectExecutiveUpns,
    ];
  }, [facets]);
  const peopleDisplayLabels = useProjectSitesPeopleDisplayLabels(peopleUpns);

  // Visible entries after client-side search / filter / sort.
  const visibleEntries = useMemo(() => {
    if (projectsResult?.status !== 'success') return [];
    return applyProjectSitesPipeline({
      entries: projectsResult.entries,
      searchTerm: debouncedSearch,
      sortKey,
      filters,
    });
  }, [projectsResult, debouncedSearch, sortKey, filters]);

  const totalEntryCount = projectsResult?.status === 'success' ? projectsResult.entries.length : 0;
  const visibleCount = visibleEntries.length;
  const isFiltered = debouncedSearch.trim().length > 0 || !filtersAreEmpty(filters);
  const isSparse = visibleCount > 0 && visibleCount <= 2;
  const activeFilterCount = countActiveFilters(filters);
  const attentionNeededCount = projectsResult?.status === 'success'
    ? projectsResult.entries.filter((e) => e.launchStatus.state === 'attention-needed').length
    : 0;
  const provisioningCount = projectsResult?.status === 'success'
    ? projectsResult.entries.filter((e) => e.launchStatus.state === 'provisioning').length
    : 0;
  const contextSummary = buildContextSummary(resolvedScope);
  const showContextWarning = resolvedScope?.source === 'all-projects-fallback'
    || resolvedScope?.source === 'default-year';

  // Live-region announcement text
  const announcement = useMemo(() => {
    if (!projectsResult) return '';
    const scopeLabel = scope?.kind === 'all' ? 'all projects' : `${scope?.year ?? ''}`;
    if (projectsResult.status === 'loading') return `Loading ${scopeLabel}`;
    if (projectsResult.status === 'error') return 'Failed to load project sites';
    if (projectsResult.status === 'empty') return `No projects found for ${scopeLabel}`;
    if (projectsResult.status === 'success') {
      if (isFiltered) {
        return `${visibleCount} of ${totalEntryCount} project${totalEntryCount !== 1 ? 's' : ''} shown for ${scopeLabel}`;
      }
      return `${totalEntryCount} project${totalEntryCount !== 1 ? 's' : ''} for ${scopeLabel}`;
    }
    return '';
  }, [projectsResult, scope, visibleCount, totalEntryCount, isFiltered]);

  // Filter mutators
  const toggleMultiSelect = useCallback((field: keyof ProjectSitesFilters, value: string) => {
    setFilters((prev) => {
      if (field === 'hasSiteOnly') return prev;
      const current = prev[field] as string[];
      const normalized = value.trim().toLowerCase();
      const isSelected = current.some((s) => s.trim().toLowerCase() === normalized);
      const next = isSelected
        ? current.filter((s) => s.trim().toLowerCase() !== normalized)
        : [...current, value];
      return { ...prev, [field]: next };
    });
  }, []);

  const clearAll = useCallback(() => {
    setSearchInput('');
    setSortKey(DEFAULT_SORT_KEY);
    setFilters(EMPTY_FILTERS);
  }, []);

  const removeChip = useCallback((field: keyof ProjectSitesFilters, value: string) => {
    setFilters((prev) => {
      if (field === 'hasSiteOnly') return { ...prev, hasSiteOnly: undefined };
      const current = prev[field] as string[];
      return {
        ...prev,
        [field]: current.filter((s) => s.trim().toLowerCase() !== value.trim().toLowerCase()),
      };
    });
  }, []);

  // Render the header + control bar block (shared between all render states).
  //
  // First-screen compression:
  // - eyebrow `HB Central · Projects` is suppressed on compact (the host
  //   SharePoint page already signals site/context; eyebrow is redundant).
  // - scope-source pill is suppressed on compact + medium (the scope
  //   selector itself already communicates the current scope). It
  //   remains on wide/ultrawide where vertical space is not at a premium.
  const tightHeader = isCompactMode || isMediumMode;
  const renderHeader = (showControls: boolean) => (
    <div className={mergeClasses(classes.header, tightHeader && classes.headerTight)}>
      <div className={classes.headerLead}>
        {!isCompactMode && (
          <span className={classes.eyebrow}>HB Central · Projects</span>
        )}
        <h2 className={classes.title}>Project Sites</h2>
        {showControls && resolvedScope && !tightHeader && (
          <span className={classes.scopeContextPill}>
            {describeScopeSource(resolvedScope.source)}
          </span>
        )}
      </div>
      {showControls && projectsResult?.status === 'success' && (
        <span
          className={classes.countBadge}
          aria-label={
            isFiltered
              ? `${visibleCount} of ${totalEntryCount} shown`
              : `${totalEntryCount} total`
          }
        >
          {isFiltered
            ? `${visibleCount} of ${totalEntryCount} shown`
            : `${totalEntryCount} project${totalEntryCount !== 1 ? 's' : ''}`}
        </span>
      )}
    </div>
  );

  const renderControlBar = () => {
    if (yearsResult.status !== 'success' || scope === null) return null;
    const currentScopeValue = scopeChoiceValue(scope);

    const scopeCluster = (
      <div
        className={mergeClasses(
          classes.controlCluster,
          isCompactMode && classes.controlClusterStacked,
          isCompactMode && classes.controlClusterCompact,
        )}
      >
        <span
          className={mergeClasses(
            classes.controlLabel,
            isCompactMode && classes.controlLabelCompactHidden,
          )}
          aria-hidden="true"
        >
          Scope:
        </span>
        {isCompactMode ? (
          <select
            aria-label="Scope (compact)"
            className={classes.compactScopeSelect}
            data-project-sites-compact-scope-control="true"
            value={currentScopeValue}
            onChange={(e) => {
              const chosen = scopeChoices.find((c) => c.value === e.target.value);
              if (chosen && (!scope || !scopesEqual(scope, chosen.scope))) {
                setScope(chosen.scope);
                setResolvedScope({
                  scope: chosen.scope,
                  source: 'user-selected',
                  resolvedYear: chosen.scope.kind === 'year' ? chosen.scope.year : null,
                });
              }
            }}
          >
            {scopeChoices.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        ) : (
          <HbcSegmentedControl
            label="Scope"
            options={scopeChoices.map((c) => ({ value: c.value, label: c.label }))}
            value={currentScopeValue}
            onChange={(next) => {
              const chosen = scopeChoices.find((c) => c.value === next);
              if (chosen && (!scope || !scopesEqual(scope, chosen.scope))) {
                setScope(chosen.scope);
                setResolvedScope({
                  scope: chosen.scope,
                  source: 'user-selected',
                  resolvedYear: chosen.scope.kind === 'year' ? chosen.scope.year : null,
                });
              }
            }}
            size="sm"
          />
        )}
      </div>
    );

    const sortCluster = (
      <div
        className={mergeClasses(
          classes.controlCluster,
          isCompactMode && classes.controlClusterStacked,
          isCompactMode && classes.controlClusterCompact,
        )}
      >
        <span
          className={mergeClasses(
            classes.controlLabel,
            isCompactMode && classes.controlLabelCompactHidden,
          )}
          aria-hidden="true"
        >
          Sort:
        </span>
        <select
          aria-label="Sort project sites"
          className={classes.sortSelect}
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as ProjectSitesSortKey)}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    );

    const actionsCluster = (
      <div
        className={mergeClasses(
          classes.controlCluster,
          isCompactMode && classes.controlClusterStacked,
          isMediumMode && classes.secondaryControlLaneActions,
        )}
      >
        <HbcButton
          variant="ghost"
          size="sm"
          pressed={isFilterPanelOpen}
          icon={<Filter size="sm" />}
          iconPosition="before"
          onClick={() => setIsFilterPanelOpen((prev) => !prev)}
          aria-expanded={isFilterPanelOpen}
          aria-controls="project-sites-filter-panel"
        >
          Filters
          {activeFilterCount > 0 && (
            <span className={classes.filterToggleBadge}>{activeFilterCount}</span>
          )}
        </HbcButton>
        {(isFiltered || sortKey !== DEFAULT_SORT_KEY) && (
          <HbcButton variant="ghost" size="sm" onClick={clearAll}>
            Reset
          </HbcButton>
        )}
      </div>
    );

    return (
      <>
        <div
          className={mergeClasses(
            classes.controlBar,
            isMediumMode && classes.controlBarMedium,
            isCompactMode && classes.controlBarCompact,
          )}
          role="search"
          aria-label="Project Sites controls"
          data-project-sites-control-layout={describeLayoutMode(layoutMode)}
        >
          <div
            className={mergeClasses(
              classes.searchSlot,
              (isCompactMode || isMediumMode) && classes.searchSlotStacked,
            )}
          >
            <HbcSearch
              variant="local"
              value={searchInput}
              onSearch={setSearchInput}
              placeholder="Search by name, number, client, location, or team…"
            />
          </div>
          {isMediumMode ? (
            <div
              className={classes.secondaryControlLane}
              data-project-sites-secondary-lane="medium"
            >
              {scopeCluster}
              {sortCluster}
              {actionsCluster}
            </div>
          ) : (
            <>
              {scopeCluster}
              {sortCluster}
              {actionsCluster}
            </>
          )}
        </div>
        {isFilterPanelOpen && facets && (
          <div
            id="project-sites-filter-panel"
            className={mergeClasses(
              classes.filterPanel,
              isCompactMode && classes.filterPanelCompact,
            )}
            role="region"
            aria-label="Advanced filters"
          >
            <div className={classes.filterPanelHeader}>
              <span className={classes.filterPanelTitle}>Advanced Filters</span>
              <HbcButton
                variant="ghost"
                size="sm"
                onClick={() => setFilters(EMPTY_FILTERS)}
                disabled={filtersAreEmpty(filters)}
              >
                Clear filters
              </HbcButton>
            </div>
            <div className={classes.filterPanelGrid}>
              <FacetGroup
                heading="Project Stage"
                values={facets.stages}
                selected={filters.stages}
                onToggle={(v) => toggleMultiSelect('stages', v)}
              />
              <FacetGroup
                heading="Project Manager"
                values={facets.projectManagerUpns}
                selected={filters.projectManagerUpns}
                onToggle={(v) => toggleMultiSelect('projectManagerUpns', v)}
                labelFor={(v) => formatProjectSitesPersonLabel(v, peopleDisplayLabels)}
              />
              <FacetGroup
                heading="Lead Estimator"
                values={facets.leadEstimatorUpns}
                selected={filters.leadEstimatorUpns}
                onToggle={(v) => toggleMultiSelect('leadEstimatorUpns', v)}
                labelFor={(v) => formatProjectSitesPersonLabel(v, peopleDisplayLabels)}
              />
              <FacetGroup
                heading="Project Executive"
                values={facets.projectExecutiveUpns}
                selected={filters.projectExecutiveUpns}
                onToggle={(v) => toggleMultiSelect('projectExecutiveUpns', v)}
                labelFor={(v) => formatProjectSitesPersonLabel(v, peopleDisplayLabels)}
              />
              <FacetGroup
                heading="Department"
                values={facets.departments}
                selected={filters.departments}
                onToggle={(v) => toggleMultiSelect('departments', v)}
              />
              <FacetGroup
                heading="Office Division"
                values={facets.officeDivisions}
                selected={filters.officeDivisions}
                onToggle={(v) => toggleMultiSelect('officeDivisions', v)}
              />
            </div>
          </div>
        )}
        {!filtersAreEmpty(filters) && (() => {
          const chipClass = mergeClasses(
            classes.chip,
            isCompactMode && classes.chipCompact,
          );
          const removeClass = mergeClasses(
            classes.chipRemove,
            isCompactMode && classes.chipRemoveCompact,
          );
          const chipsContent = (
            <>
              {filters.stages.map((v) => (
                <span key={`stage-${v}`} className={chipClass}>
                  <span className={classes.chipLabel}>Stage:</span>
                  {v}
                  <button
                    type="button"
                    className={removeClass}
                    aria-label={`Remove stage filter ${v}`}
                    onClick={() => removeChip('stages', v)}
                  >
                    <Cancel size="sm" />
                  </button>
                </span>
              ))}
              {filters.projectManagerUpns.map((v) => (
                <span key={`pm-${v}`} className={chipClass}>
                  <span className={classes.chipLabel}>PM:</span>
                  {formatProjectSitesPersonLabel(v, peopleDisplayLabels)}
                  <button
                    type="button"
                    className={removeClass}
                    aria-label={`Remove project manager filter ${v}`}
                    onClick={() => removeChip('projectManagerUpns', v)}
                  >
                    <Cancel size="sm" />
                  </button>
                </span>
              ))}
              {filters.leadEstimatorUpns.map((v) => (
                <span key={`est-${v}`} className={chipClass}>
                  <span className={classes.chipLabel}>Estimator:</span>
                  {formatProjectSitesPersonLabel(v, peopleDisplayLabels)}
                  <button
                    type="button"
                    className={removeClass}
                    aria-label={`Remove lead estimator filter ${v}`}
                    onClick={() => removeChip('leadEstimatorUpns', v)}
                  >
                    <Cancel size="sm" />
                  </button>
                </span>
              ))}
              {filters.projectExecutiveUpns.map((v) => (
                <span key={`pe-${v}`} className={chipClass}>
                  <span className={classes.chipLabel}>Exec:</span>
                  {formatProjectSitesPersonLabel(v, peopleDisplayLabels)}
                  <button
                    type="button"
                    className={removeClass}
                    aria-label={`Remove project executive filter ${v}`}
                    onClick={() => removeChip('projectExecutiveUpns', v)}
                  >
                    <Cancel size="sm" />
                  </button>
                </span>
              ))}
              {filters.departments.map((v) => (
                <span key={`dept-${v}`} className={chipClass}>
                  <span className={classes.chipLabel}>Dept:</span>
                  {v}
                  <button
                    type="button"
                    className={removeClass}
                    aria-label={`Remove department filter ${v}`}
                    onClick={() => removeChip('departments', v)}
                  >
                    <Cancel size="sm" />
                  </button>
                </span>
              ))}
              {filters.officeDivisions.map((v) => (
                <span key={`div-${v}`} className={chipClass}>
                  <span className={classes.chipLabel}>Division:</span>
                  {v}
                  <button
                    type="button"
                    className={removeClass}
                    aria-label={`Remove office division filter ${v}`}
                    onClick={() => removeChip('officeDivisions', v)}
                  >
                    <Cancel size="sm" />
                  </button>
                </span>
              ))}
            </>
          );

          if (isCompactMode) {
            return (
              <>
                <div
                  className={classes.compactFiltersSummary}
                  role="status"
                  aria-label="Active filters"
                  data-project-sites-compact-filters-summary="true"
                >
                  <span className={classes.compactFiltersSummaryText}>
                    {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
                  </span>
                  <button
                    type="button"
                    className={classes.compactFiltersSummaryToggle}
                    aria-expanded={isCompactChipsExpanded}
                    aria-controls="project-sites-compact-chips"
                    onClick={() => setIsCompactChipsExpanded((prev) => !prev)}
                  >
                    {isCompactChipsExpanded ? 'Hide' : 'Show'}
                  </button>
                </div>
                {isCompactChipsExpanded && (
                  <div
                    id="project-sites-compact-chips"
                    className={mergeClasses(
                      classes.activeChipsRow,
                      classes.activeChipsRowCompact,
                    )}
                    role="group"
                    aria-label="Active filter chips"
                  >
                    {chipsContent}
                  </div>
                )}
              </>
            );
          }

          return (
            <div
              className={classes.activeChipsRow}
              role="status"
              aria-label="Active filters"
            >
              <span className={classes.activeChipsLabel}>Filters:</span>
              {chipsContent}
            </div>
          );
        })()}
      </>
    );
  };

  // ── Years loading ─────────────────────────────────────────────────
  if (yearsResult.status === 'loading') {
    return (
      <section
        ref={rootRef}
        className={mergeClasses(
          classes.root,
          isMediumMode && classes.rootMedium,
          isCompactMode && classes.rootCompact,
        )}
        aria-label="Project Sites"
        data-project-sites-layout-mode={layoutMode}
        data-project-sites-short-height={containerState.isShortHeight ? 'true' : 'false'}
        data-project-sites-display-class={containerState.displayClass}
        data-project-sites-height-class={containerState.heightClass}
      >
        {renderHeader(false)}
        <LoadingShimmer />
      </section>
    );
  }

  // ── Years error ───────────────────────────────────────────────────
  if (yearsResult.status === 'error') {
    return (
      <section
        ref={rootRef}
        className={mergeClasses(
          classes.root,
          isMediumMode && classes.rootMedium,
          isCompactMode && classes.rootCompact,
        )}
        aria-label="Project Sites"
        data-project-sites-layout-mode={layoutMode}
        data-project-sites-short-height={containerState.isShortHeight ? 'true' : 'false'}
        data-project-sites-display-class={containerState.displayClass}
        data-project-sites-height-class={containerState.heightClass}
      >
        {renderHeader(false)}
        <div className={classes.emptyContainer} role="status">
          <HbcEmptyState
            title="Unable to Load Project Sites"
            description={yearsResult.errorMessage ?? 'Failed to load available years. Try refreshing the page.'}
            icon={<EmptyAlertIcon />}
          />
        </div>
      </section>
    );
  }

  // ── No years in list ──────────────────────────────────────────────
  if (yearsResult.status === 'empty') {
    return (
      <section
        ref={rootRef}
        className={mergeClasses(
          classes.root,
          isMediumMode && classes.rootMedium,
          isCompactMode && classes.rootCompact,
        )}
        aria-label="Project Sites"
        data-project-sites-layout-mode={layoutMode}
        data-project-sites-short-height={containerState.isShortHeight ? 'true' : 'false'}
        data-project-sites-display-class={containerState.displayClass}
        data-project-sites-height-class={containerState.heightClass}
      >
        {renderHeader(false)}
        <div className={classes.emptyContainer} role="status">
          <HbcEmptyState
            title="No Project Sites"
            description="No projects with Year values were found in the Projects list."
            icon={<EmptySearchIcon />}
          />
        </div>
      </section>
    );
  }

  // ── Years loaded — render control bar + projects ─────────────────
  const scopeLabelShort =
    scope?.kind === 'all' ? 'All Projects' : String(scope?.year ?? '');

  return (
    <section
      ref={rootRef}
      className={mergeClasses(
        classes.root,
        isMediumMode && classes.rootMedium,
        isCompactMode && classes.rootCompact,
      )}
      aria-label="Project Sites"
      data-project-sites-layout-mode={layoutMode}
      data-project-sites-short-height={containerState.isShortHeight ? 'true' : 'false'}
    >
      {/* Persistent live region for screen reader announcements */}
      <div className={classes.liveRegion} aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      {renderHeader(true)}
      {(() => {
        // First-screen compression: in compact mode the scope-source
        // narration is suppressed (the scope selector already conveys
        // the current scope). The warning state (all-projects-fallback
        // / default-year) is preserved because it carries trust
        // meaning, and attention/provisioning counts are always
        // preserved because they are truthful system state.
        const showScopeSourceText =
          contextSummary !== null && (!isCompactMode || showContextWarning);
        const stateCountsFragment =
          projectsResult?.status === 'success'
          && (attentionNeededCount > 0 || provisioningCount > 0)
            ? (
              <>
                {attentionNeededCount > 0
                  ? `${attentionNeededCount} record${attentionNeededCount !== 1 ? 's' : ''} ${attentionNeededCount === 1 ? 'needs' : 'need'} data correction.`
                  : ''}
                {provisioningCount > 0
                  ? ` ${provisioningCount} record${provisioningCount !== 1 ? 's' : ''} ${provisioningCount === 1 ? 'is' : 'are'} not yet launchable because sites are still provisioning.`
                  : ''}
              </>
            )
            : null;
        if (!showScopeSourceText && !stateCountsFragment) return null;
        return (
          <div
            className={mergeClasses(
              classes.contextSummary,
              isCompactMode && classes.contextSummaryCompact,
              showContextWarning && classes.contextSummaryWarning,
            )}
            role="status"
          >
            {showScopeSourceText && contextSummary}
            {showScopeSourceText && stateCountsFragment && ' '}
            {stateCountsFragment}
          </div>
        );
      })()}
      {renderControlBar()}

      {/* Projects loading */}
      {projectsResult?.status === 'loading' && <LoadingShimmer />}

      {/* Projects error */}
      {projectsResult?.status === 'error' && (
        <div className={classes.emptyContainer} role="alert">
          <HbcEmptyState
            title="Unable to Load Project Sites"
            description={projectsResult.errorMessage ?? 'An unexpected error occurred. Try refreshing the page.'}
            icon={<EmptyAlertIcon />}
          />
        </div>
      )}

      {/* Empty scope result (scope returned zero entries from SharePoint) */}
      {projectsResult?.status === 'empty' && (
        <div className={classes.emptyContainer} role="status">
          <HbcEmptyState
            title="No Project Sites"
            description={`No projects matched the current scope (${scopeLabelShort}). This means no records were returned for that scope from the Projects list.`}
            icon={<EmptySearchIcon />}
          />
        </div>
      )}

      {/* Success with no visible entries after client-side filtering */}
      {projectsResult?.status === 'success' && visibleCount === 0 && (
        <div className={classes.emptyContainer} role="status">
          <HbcEmptyState
            title="No matching projects"
            description={
              isFiltered
                ? `No projects in ${scopeLabelShort} match the current search or filters. Try adjusting the filters or clearing them.`
                : `No projects were found for ${scopeLabelShort}.`
            }
            icon={<EmptySearchIcon />}
          />
        </div>
      )}

      {/* Success with visible entries */}
      {projectsResult?.status === 'success' && visibleCount > 0 && (() => {
        const sparseCluster = isSparse && layoutMode !== 'compact';
        const sparseFeatured = sparseCluster && visibleCount === 1;
        const sparseVariant = sparseFeatured
          ? 'featured'
          : sparseCluster
          ? 'cluster'
          : isSparse
          ? 'bounded'
          : 'dense';
        return (
          <div
            className={mergeClasses(
              classes.grid,
              layoutMode === 'wide' && classes.gridModeWide,
              layoutMode === 'medium' && classes.gridModeMedium,
              layoutMode === 'compact' && classes.gridModeCompact,
              isSparse && classes.gridSparse,
              sparseCluster && classes.gridSparseCluster,
              sparseFeatured && classes.gridSparseFeatured,
            )}
            role="list"
            aria-label={`${visibleCount} project site${visibleCount !== 1 ? 's' : ''} shown for ${scopeLabelShort}`}
            data-project-sites-grid-sparse={sparseVariant}
            data-project-sites-grid-alignment="start"
          >
            {visibleEntries.map((entry) => (
              <ProjectSiteCardListItem
                key={entry.id}
                entry={entry}
                layoutMode={layoutMode}
                peopleDisplayLabels={peopleDisplayLabels}
                className={classes.gridItem}
              />
            ))}
          </div>
        );
      })()}
    </section>
  );
};
