/**
 * Root React component for the Project Sites web part.
 *
 * Self-contained: loads available years, presents a year selector,
 * and renders the filtered card grid. No external year-resolution props.
 *
 * Light-theme only. Designed for SharePoint modern page zones.
 */
import React, { useState, useEffect, type FC } from 'react';
import { makeStyles } from '@griffel/react';
import {
  HbcEmptyState,
  HbcSpinner,
  HBC_SURFACE_LIGHT,
  HBC_RADIUS_XL,
  TRANSITION_NORMAL,
  elevationLevel1,
} from '@hbc/ui-kit';
import { useAvailableYears } from './hooks/useAvailableYears.js';
import { useProjectSites } from './hooks/useProjectSites.js';
import { resolveDefaultYear } from './types.js';
import { YearSelector } from './components/YearSelector.js';
import { ProjectSiteCard } from './components/ProjectSiteCard.js';

// ── Styles ────────────────────────────────────────────────────────────────

const useStyles = makeStyles({
  root: {
    fontFamily:
      "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif",
    color: HBC_SURFACE_LIGHT['text-primary'],
    paddingTop: '24px',
    paddingBottom: '32px',
    paddingLeft: '0px',
    paddingRight: '0px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    marginBottom: '24px',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: 700,
    lineHeight: '1.3',
    color: HBC_SURFACE_LIGHT['text-primary'],
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
  },
  headerSpacer: {
    flexGrow: 1,
  },
  count: {
    fontSize: '0.8125rem',
    fontWeight: 400,
    color: HBC_SURFACE_LIGHT['text-muted'],
    whiteSpace: 'nowrap',
  },
  grid: {
    display: 'grid',
    gap: '20px',
    gridTemplateColumns: '1fr',
    '@media (min-width: 480px)': {
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    },
    '@media (min-width: 1200px)': {
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    },
    animationName: {
      from: { opacity: 0, transform: 'translateY(8px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
    },
    animationDuration: TRANSITION_NORMAL,
    animationFillMode: 'forwards',
    animationTimingFunction: 'ease-out',
    '@media (prefers-reduced-motion: reduce)': {
      animationDuration: '0.01ms',
    },
  },
  gridItem: {
    minWidth: 0,
  },
  spinnerContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '200px',
    paddingTop: '24px',
    paddingBottom: '24px',
  },
  shimmerGrid: {
    display: 'grid',
    gap: '20px',
    gridTemplateColumns: '1fr',
    '@media (min-width: 480px)': {
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    },
  },
  shimmerCard: {
    height: '180px',
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
    paddingTop: '16px',
    paddingBottom: '16px',
    borderRadius: HBC_RADIUS_XL,
    backgroundColor: HBC_SURFACE_LIGHT['surface-1'],
  },
});

// ── Icons ─────────────────────────────────────────────────────────────────

const SearchIcon: FC = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <circle cx="22" cy="22" r="12" stroke={HBC_SURFACE_LIGHT['text-muted']} strokeWidth="2" fill="none" />
    <path d="M31 31L40 40" stroke={HBC_SURFACE_LIGHT['text-muted']} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const AlertIcon: FC = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <path d="M24 8L4 40H44L24 8Z" stroke="#FF4D4D" strokeWidth="2" strokeLinejoin="round" fill="none" />
    <path d="M24 20V30" stroke="#FF4D4D" strokeWidth="2" strokeLinecap="round" />
    <circle cx="24" cy="35" r="1.5" fill="#FF4D4D" />
  </svg>
);

// ── Shimmer ───────────────────────────────────────────────────────────────

const LoadingShimmer: FC = () => {
  const classes = useStyles();
  return (
    <div className={classes.shimmerGrid} aria-hidden="true">
      {[1, 2, 3].map((i) => (
        <div key={i} className={classes.shimmerCard} />
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

  // ── Years loading ─────────────────────────────────────────────────
  if (yearsResult.status === 'loading') {
    return (
      <div className={classes.root}>
        <div className={classes.header}>
          <h2 className={classes.title}>Project Sites</h2>
        </div>
        <div className={classes.spinnerContainer} role="status">
          <HbcSpinner size="lg" label="Loading available years" />
        </div>
      </div>
    );
  }

  // ── Years error ───────────────────────────────────────────────────
  if (yearsResult.status === 'error') {
    return (
      <div className={classes.root}>
        <div className={classes.header}>
          <h2 className={classes.title}>Project Sites</h2>
        </div>
        <div className={classes.emptyContainer}>
          <HbcEmptyState
            title="Unable to Load Project Sites"
            description={yearsResult.errorMessage ?? 'Failed to load available years. Try refreshing the page.'}
            icon={<AlertIcon />}
          />
        </div>
      </div>
    );
  }

  // ── No years in list ──────────────────────────────────────────────
  if (yearsResult.status === 'empty') {
    return (
      <div className={classes.root}>
        <div className={classes.header}>
          <h2 className={classes.title}>Project Sites</h2>
        </div>
        <div className={classes.emptyContainer}>
          <HbcEmptyState
            title="No Project Sites"
            description="No projects with Year values were found in the Projects list."
            icon={<SearchIcon />}
          />
        </div>
      </div>
    );
  }

  // ── Years loaded — render selector + projects ─────────────────────
  const year = selectedYear!;

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <h2 className={classes.title}>Project Sites</h2>
        <YearSelector
          years={yearsResult.years}
          selectedYear={year}
          onYearChange={setSelectedYear}
        />
        {projectsResult?.status === 'success' && (
          <>
            <div className={classes.headerSpacer} />
            <span className={classes.count} aria-live="polite">
              {projectsResult.entries.length} project{projectsResult.entries.length !== 1 ? 's' : ''}
            </span>
          </>
        )}
      </div>

      {/* Projects loading */}
      {projectsResult?.status === 'loading' && (
        <>
          <div className={classes.spinnerContainer} role="status" aria-label={`Loading project sites for ${year}`}>
            <HbcSpinner size="lg" label={`Loading project sites for ${year}`} />
          </div>
          <LoadingShimmer />
        </>
      )}

      {/* Projects error */}
      {projectsResult?.status === 'error' && (
        <div className={classes.emptyContainer}>
          <HbcEmptyState
            title="Unable to Load Project Sites"
            description={projectsResult.errorMessage ?? 'An unexpected error occurred. Try refreshing the page.'}
            icon={<AlertIcon />}
          />
        </div>
      )}

      {/* Empty results */}
      {projectsResult?.status === 'empty' && (
        <div className={classes.emptyContainer}>
          <HbcEmptyState
            title="No Project Sites"
            description={`No projects were found for ${year}. Projects will appear here once they are added to the Projects list with Year set to ${year}.`}
            icon={<SearchIcon />}
          />
        </div>
      )}

      {/* Success */}
      {projectsResult?.status === 'success' && (
        <div
          className={classes.grid}
          role="list"
          aria-label={`${projectsResult.entries.length} project site${projectsResult.entries.length !== 1 ? 's' : ''} for ${year}`}
        >
          {projectsResult.entries.map((entry) => (
            <div key={entry.id} role="listitem" className={classes.gridItem}>
              <ProjectSiteCard entry={entry} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
