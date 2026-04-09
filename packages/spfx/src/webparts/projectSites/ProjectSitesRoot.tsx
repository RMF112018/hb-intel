/**
 * Root React component for the Project Sites web part.
 *
 * Self-contained: loads available years, presents a year selector,
 * and renders the filtered card grid. No external props needed.
 *
 * **Light-mode only.** Governed by `HbcThemeProvider(forceTheme='light')`
 * at the mount boundary (`apps/project-sites/src/mount.tsx`). Griffel
 * styles additionally reference `HBC_SURFACE_LIGHT` compile-time tokens
 * as defense-in-depth. The SharePoint manifest has `supportsThemeVariants=false`
 * so the host does not inject section theme variants.
 *
 * Import discipline (W01r-P11 Project Sites compliance closure):
 *   - Primitives from `@hbc/ui-kit/primitives`
 *   - Theme tokens, typography, spacing, elevation, motion from `@hbc/ui-kit/theme`
 *   - HBC icons from `@hbc/ui-kit/icons`
 *   - No root `@hbc/ui-kit` imports.
 *
 * Premium productive-surface polish (W01r-P11):
 *   - Header uses a vertically anchored title + eyebrow composition with
 *     the segmented-control + count-badge control cluster right-aligned
 *     on a dedicated trailing row at narrow widths.
 *   - Grid rhythm is token-driven (`HBC_SPACE_MD` / `HBC_SPACE_LG`)
 *     and uses governed breakpoints via `hbcMediaQuery()`.
 *   - Loading shimmer renders a realistic card skeleton (header, body,
 *     footer) instead of a flat rectangle.
 *   - Empty / error states share a single polished container with
 *     `elevationLevel1` and subtle border rather than no framing.
 *   - Reduced-motion / a11y invariants preserved.
 */
import React, { useState, useEffect, useMemo, type FC } from 'react';
import { makeStyles, mergeClasses, shorthands } from '@griffel/react';
import {
  HbcEmptyState,
  HbcSegmentedControl,
} from '@hbc/ui-kit/primitives';
import {
  HBC_SURFACE_LIGHT,
  HBC_STATUS_COLORS,
  HBC_RADIUS_XL,
  HBC_RADIUS_SM,
  HBC_SPACE_XS,
  HBC_SPACE_SM,
  HBC_SPACE_MD,
  HBC_SPACE_LG,
  HBC_SPACE_XL,
  TRANSITION_NORMAL,
  TRANSITION_SLOW,
  elevationLevel0,
  elevationLevel1,
  heading1,
  label as labelType,
  bodySmall,
  hbcMediaQuery,
} from '@hbc/ui-kit/theme';
import { Search, AlertTriangle } from '@hbc/ui-kit/icons';
import { useAvailableYears } from './hooks/useAvailableYears.js';
import { useProjectSites } from './hooks/useProjectSites.js';
import { resolveDefaultYear } from './types.js';
import { ProjectSiteCard } from './components/ProjectSiteCard.js';

// ── Styles ────────────────────────────────────────────────────────────────

const useStyles = makeStyles({
  root: {
    color: HBC_SURFACE_LIGHT['text-primary'],
    paddingTop: `${HBC_SPACE_LG}px`,
    paddingBottom: `${HBC_SPACE_XL}px`,
    paddingLeft: 0,
    paddingRight: 0,
  },

  // ── Header bar ──────────────────────────────────────────────────────
  // Premium productive composition: eyebrow + title stack on the left,
  // year selector + count badge cluster right-aligned on desktop and
  // wrapping below the title at narrow widths.
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
  headerTrailing: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_MD}px`,
    flexWrap: 'wrap',
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
  // ── Live region (always mounted for reliable announcements) ─────────
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
    animationName: {
      from: { opacity: 0, transform: 'translateY(6px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
    },
    animationDuration: TRANSITION_NORMAL,
    animationFillMode: 'forwards',
    animationTimingFunction: 'ease-out',
    '@media (prefers-reduced-motion: reduce)': {
      animationDuration: '0.01ms',
    },
  },
  gridSparse: {
    [hbcMediaQuery('tablet')]: {
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 380px))',
    },
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
  shimmerLineShort: {
    width: '40%',
  },
  shimmerLineWide: {
    width: '85%',
    height: '18px',
  },
  shimmerLineMedium: {
    width: '60%',
  },
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

  // ── Helper text on the empty container ─────────────────────────────
  // Keeps text metrics consistent with the rest of the surface.
  helperText: {
    fontSize: bodySmall.fontSize,
    lineHeight: bodySmall.lineHeight,
    color: HBC_SURFACE_LIGHT['text-muted'],
  },
});

// ── Icons (from @hbc/ui-kit/icons, sized for empty states) ──────────────

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

// ── Component ─────────────────────────────────────────────────────────────

export const ProjectSitesRoot: FC = () => {
  const classes = useStyles();
  const yearsResult = useAvailableYears();
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  // Set default year when years load
  useEffect(() => {
    if (yearsResult.status === 'success' && selectedYear === null) {
      setSelectedYear(resolveDefaultYear(yearsResult.years));
    }
  }, [yearsResult.status, yearsResult.years, selectedYear]);

  const projectsResult = useProjectSites(selectedYear);

  // Build year options for HbcSegmentedControl
  const yearOptions = useMemo(
    () =>
      yearsResult.status === 'success'
        ? yearsResult.years.map((y) => ({ value: y, label: String(y) }))
        : [],
    [yearsResult],
  );

  const entryCount = projectsResult?.status === 'success' ? projectsResult.entries.length : 0;
  const isSparse = entryCount > 0 && entryCount <= 2;

  // Build announcement text for the live region
  const announcement = useMemo(() => {
    if (!projectsResult) return '';
    if (projectsResult.status === 'loading') return `Loading project sites for ${selectedYear}`;
    if (projectsResult.status === 'error') return 'Failed to load project sites';
    if (projectsResult.status === 'empty') return `No projects found for ${selectedYear}`;
    if (projectsResult.status === 'success') {
      return `${entryCount} project${entryCount !== 1 ? 's' : ''} for ${selectedYear}`;
    }
    return '';
  }, [projectsResult, selectedYear, entryCount]);

  const renderHeader = (showControls: boolean) => (
    <div className={classes.header}>
      <div className={classes.headerLead}>
        <span className={classes.eyebrow}>HB Central · Projects</span>
        <h2 className={classes.title}>Project Sites</h2>
      </div>
      {showControls && yearsResult.status === 'success' && selectedYear !== null && (
        <div className={classes.headerTrailing}>
          <HbcSegmentedControl
            label="Year:"
            options={yearOptions}
            value={selectedYear}
            onChange={setSelectedYear}
            size="sm"
          />
          {projectsResult?.status === 'success' && (
            <span className={classes.countBadge}>
              {entryCount} project{entryCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}
    </div>
  );

  // ── Years loading ─────────────────────────────────────────────────
  if (yearsResult.status === 'loading') {
    return (
      <section className={classes.root} aria-label="Project Sites">
        {renderHeader(false)}
        <LoadingShimmer />
      </section>
    );
  }

  // ── Years error ───────────────────────────────────────────────────
  if (yearsResult.status === 'error') {
    return (
      <section className={classes.root} aria-label="Project Sites">
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
      <section className={classes.root} aria-label="Project Sites">
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

  // ── Years loaded — render selector + projects ─────────────────────
  const year = selectedYear!;

  return (
    <section className={classes.root} aria-label="Project Sites">
      {/* Persistent live region for screen reader announcements */}
      <div className={classes.liveRegion} aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      {renderHeader(true)}

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

      {/* Empty results */}
      {projectsResult?.status === 'empty' && (
        <div className={classes.emptyContainer} role="status">
          <HbcEmptyState
            title="No Project Sites"
            description={`No projects were found for ${year}. Projects will appear here once they are added to the Projects list with Year set to ${year}.`}
            icon={<EmptySearchIcon />}
          />
        </div>
      )}

      {/* Success — key on year for fresh fade-in animation */}
      {projectsResult?.status === 'success' && (
        <div
          key={year}
          className={mergeClasses(classes.grid, isSparse && classes.gridSparse)}
          role="list"
          aria-label={`${entryCount} project site${entryCount !== 1 ? 's' : ''} for ${year}`}
        >
          {projectsResult.entries.map((entry) => (
            <div key={entry.id} role="listitem" className={classes.gridItem}>
              <ProjectSiteCard entry={entry} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
