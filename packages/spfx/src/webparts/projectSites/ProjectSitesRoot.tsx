/**
 * Root React component for the Project Sites web part.
 *
 * Self-contained: loads available years, presents a year selector,
 * and renders the filtered card grid. No external props needed.
 *
 * **Light-mode only.** Governed by HbcThemeProvider(forceTheme='light')
 * at the mount boundary (apps/project-sites/src/mount.tsx). Griffel
 * styles additionally reference HBC_SURFACE_LIGHT compile-time tokens
 * as defense-in-depth. SharePoint manifest has supportsThemeVariants=false
 * so the host does not inject section theme variants.
 */
import React, { useState, useEffect, useMemo, type FC } from 'react';
import { makeStyles, mergeClasses } from '@griffel/react';
import {
  HbcEmptyState,
  HbcSegmentedControl,
  HBC_SURFACE_LIGHT,
  HBC_STATUS_COLORS,
  HBC_RADIUS_XL,
  HBC_RADIUS_SM,
  TRANSITION_NORMAL,
  elevationLevel1,
  heading1,
  label as labelType,
} from '@hbc/ui-kit';
import { Search, AlertTriangle } from '@hbc/ui-kit/icons';
import { useAvailableYears } from './hooks/useAvailableYears.js';
import { useProjectSites } from './hooks/useProjectSites.js';
import { resolveDefaultYear } from './types.js';
import { ProjectSiteCard } from './components/ProjectSiteCard.js';

// ── Styles ────────────────────────────────────────────────────────────────

const useStyles = makeStyles({
  root: {
    color: HBC_SURFACE_LIGHT['text-primary'],
    paddingTop: '24px',
    paddingBottom: '32px',
    paddingLeft: '0px',
    paddingRight: '0px',
  },

  // ── Header bar ──────────────────────────────────────────────────────
  header: {
    display: 'flex',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: '8px 16px',
    paddingBottom: '16px',
    marginBottom: '24px',
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: HBC_SURFACE_LIGHT['surface-3'],
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
    gap: '16px',
    marginLeft: 'auto',
    flexWrap: 'wrap',
  },
  countBadge: {
    fontSize: labelType.fontSize,
    fontWeight: labelType.fontWeight,
    color: HBC_SURFACE_LIGHT['text-muted'],
    backgroundColor: HBC_SURFACE_LIGHT['surface-2'],
    paddingTop: '2px',
    paddingBottom: '2px',
    paddingLeft: '8px',
    paddingRight: '8px',
    borderRadius: HBC_RADIUS_SM,
    whiteSpace: 'nowrap',
  },

  // ── Live region (always mounted for reliable announcements) ─────────
  liveRegion: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    paddingTop: '0',
    paddingBottom: '0',
    paddingLeft: '0',
    paddingRight: '0',
    marginTop: '-1px',
    marginBottom: '0',
    marginLeft: '0',
    marginRight: '0',
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
    borderTopWidth: '0',
    borderBottomWidth: '0',
    borderLeftWidth: '0',
    borderRightWidth: '0',
  },

  // ── Card grid ───────────────────────────────────────────────────────
  grid: {
    display: 'grid',
    gap: '24px',
    gridTemplateColumns: '1fr',
    '@media (min-width: 480px)': {
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    },
    '@media (min-width: 1200px)': {
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
    '@media (min-width: 768px)': {
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 380px))',
    },
  },
  gridItem: {
    minWidth: 0,
  },

  // ── Loading & empty states ──────────────────────────────────────────
  shimmerGrid: {
    display: 'grid',
    gap: '24px',
    gridTemplateColumns: '1fr',
    '@media (min-width: 480px)': {
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    },
  },
  shimmerCard: {
    height: '200px',
    borderRadius: HBC_RADIUS_XL,
    backgroundColor: HBC_SURFACE_LIGHT['surface-2'],
    boxShadow: elevationLevel1,
    animationName: {
      '0%': { opacity: 0.6 },
      '50%': { opacity: 0.3 },
      '100%': { opacity: 0.6 },
    },
    animationDuration: '1.5s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'ease-in-out',
    '@media (prefers-reduced-motion: reduce)': {
      animationName: {
        from: { opacity: 0.45 },
        to: { opacity: 0.45 },
      },
    },
  },
  emptyContainer: {
    marginTop: '8px',
    paddingTop: '32px',
    paddingBottom: '32px',
    borderRadius: HBC_RADIUS_XL,
    backgroundColor: HBC_SURFACE_LIGHT['surface-1'],
  },
});

// ── Icons (from @hbc/ui-kit/icons, sized for empty states) ──────────────

const EmptySearchIcon: FC = () => (
  <Search size="lg" color={HBC_SURFACE_LIGHT['text-muted']} />
);

const EmptyAlertIcon: FC = () => (
  <AlertTriangle size="lg" color={HBC_STATUS_COLORS.error} />
);

// ── Shimmer ───────────────────────────────────────────────────────────────

const LoadingShimmer: FC = () => {
  const classes = useStyles();
  return (
    <div className={classes.shimmerGrid} role="status" aria-label="Loading project sites">
      <div className={classes.shimmerCard} />
      <div className={classes.shimmerCard} />
      <div className={classes.shimmerCard} />
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

  // ── Years loading ─────────────────────────────────────────────────
  if (yearsResult.status === 'loading') {
    return (
      <section className={classes.root} aria-label="Project Sites">
        <div className={classes.header}>
          <h2 className={classes.title}>Project Sites</h2>
        </div>
        <LoadingShimmer />
      </section>
    );
  }

  // ── Years error ───────────────────────────────────────────────────
  if (yearsResult.status === 'error') {
    return (
      <section className={classes.root} aria-label="Project Sites">
        <div className={classes.header}>
          <h2 className={classes.title}>Project Sites</h2>
        </div>
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
        <div className={classes.header}>
          <h2 className={classes.title}>Project Sites</h2>
        </div>
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

      <div className={classes.header}>
        <h2 className={classes.title}>Project Sites</h2>
        <div className={classes.headerTrailing}>
          <HbcSegmentedControl
            label="Year:"
            options={yearOptions}
            value={year}
            onChange={setSelectedYear}
            size="sm"
          />
          {projectsResult?.status === 'success' && (
            <span className={classes.countBadge}>
              {entryCount} project{entryCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

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
