/**
 * Root React component for the Project Sites web part.
 *
 * Renders a year-context header and a responsive card grid with
 * governed empty/loading/error/invalid-year states from @hbc/ui-kit.
 *
 * Light-theme only. Designed for SharePoint modern page zones.
 */
import React, { type FC } from 'react';
import { makeStyles } from '@griffel/react';
import {
  HbcEmptyState,
  HbcSpinner,
  HBC_PRIMARY_BLUE,
  HBC_SURFACE_LIGHT,
  HBC_RADIUS_MD,
  HBC_RADIUS_XL,
  TRANSITION_NORMAL,
  elevationLevel1,
} from '@hbc/ui-kit';
import { useProjectSites } from './hooks/useProjectSites.js';
import { ProjectSiteCard } from './components/ProjectSiteCard.js';
import type { PageYearResolution } from './types.js';

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
    gap: '10px',
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
  yearBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.8125rem',
    fontWeight: 700,
    color: '#FFFFFF',
    backgroundColor: HBC_PRIMARY_BLUE,
    paddingTop: '4px',
    paddingBottom: '4px',
    paddingLeft: '12px',
    paddingRight: '12px',
    borderRadius: HBC_RADIUS_MD,
    letterSpacing: '0.02em',
    lineHeight: '1',
    minHeight: '26px',
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

  // ── Grid ──────────────────────────────────────────────────────────────
  grid: {
    display: 'grid',
    gap: '20px',
    // Default: single column for narrow SharePoint zones (< 480px)
    gridTemplateColumns: '1fr',
    // 480px+: auto-fill with 280px min — fits 1/3-width SP zones
    '@media (min-width: 480px)': {
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    },
    // 1200px+: cap at 4 columns max for readability
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
    minWidth: 0,  // prevent grid blowout from long text
  },

  // ── Status containers ─────────────────────────────────────────────────
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
  invalidDetail: {
    marginTop: '8px',
    fontSize: '0.75rem',
    fontFamily: "'Consolas', 'Courier New', monospace",
    color: HBC_SURFACE_LIGHT['text-muted'],
    backgroundColor: HBC_SURFACE_LIGHT['surface-2'],
    paddingTop: '6px',
    paddingBottom: '6px',
    paddingLeft: '10px',
    paddingRight: '10px',
    borderRadius: HBC_RADIUS_MD,
    display: 'inline-block',
  },
});

// ── Icons (inline SVG, brand-colored, aria-hidden) ────────────────────────

const SettingsIcon: FC = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <circle cx="24" cy="24" r="8" stroke={HBC_SURFACE_LIGHT['text-muted']} strokeWidth="2" fill="none" />
    <path
      d="M24 4V10M24 38V44M4 24H10M38 24H44M9.86 9.86L14.1 14.1M33.9 33.9L38.14 38.14M38.14 9.86L33.9 14.1M14.1 33.9L9.86 38.14"
      stroke={HBC_SURFACE_LIGHT['text-muted']}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const SearchIcon: FC = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <circle cx="22" cy="22" r="12" stroke={HBC_SURFACE_LIGHT['text-muted']} strokeWidth="2" fill="none" />
    <path d="M31 31L40 40" stroke={HBC_SURFACE_LIGHT['text-muted']} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const AlertIcon: FC = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <path
      d="M24 8L4 40H44L24 8Z"
      stroke="#FF4D4D"
      strokeWidth="2"
      strokeLinejoin="round"
      fill="none"
    />
    <path d="M24 20V30" stroke="#FF4D4D" strokeWidth="2" strokeLinecap="round" />
    <circle cx="24" cy="35" r="1.5" fill="#FF4D4D" />
  </svg>
);

const WarningIcon: FC = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <circle cx="24" cy="24" r="18" stroke="#FFB020" strokeWidth="2" fill="none" />
    <path d="M24 14V28" stroke="#FFB020" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="24" cy="34" r="1.5" fill="#FFB020" />
  </svg>
);

// ── Shared header ─────────────────────────────────────────────────────────

interface SectionHeaderProps {
  year?: number;
  count?: number;
}

const SectionHeader: FC<SectionHeaderProps> = ({ year, count }) => {
  const classes = useStyles();
  return (
    <div className={classes.header} role="banner">
      <h2 className={classes.title}>Project Sites</h2>
      {year !== undefined && (
        <span className={classes.yearBadge} aria-label={`Filtered to year ${year}`}>
          {year}
        </span>
      )}
      {count !== undefined && (
        <>
          <div className={classes.headerSpacer} />
          <span className={classes.count} aria-live="polite">
            {count} project{count !== 1 ? 's' : ''}
          </span>
        </>
      )}
    </div>
  );
};

// ── Loading shimmer placeholders ──────────────────────────────────────────

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

export interface ProjectSitesRootProps {
  yearResolution: PageYearResolution;
}

export const ProjectSitesRoot: FC<ProjectSitesRootProps> = ({ yearResolution }) => {
  const classes = useStyles();
  const result = useProjectSites(yearResolution);

  // ── No year configured ──────────────────────────────────────────────
  if (result.status === 'no-year') {
    return (
      <div className={classes.root}>
        <SectionHeader />
        <div className={classes.emptyContainer}>
          <HbcEmptyState
            title="Year Not Configured"
            description="This web part displays project sites for a specific year. Set the Year property on the hosting page, or configure a Year Override in the web part property pane."
            icon={<SettingsIcon />}
          />
        </div>
      </div>
    );
  }

  // ── Invalid year ────────────────────────────────────────────────────
  if (result.status === 'invalid-year' && yearResolution.kind === 'invalid') {
    const rawDisplay = String(yearResolution.rawValue);
    const sourceLabel =
      yearResolution.source === 'property-pane'
        ? 'property pane override'
        : 'page metadata';
    return (
      <div className={classes.root}>
        <SectionHeader />
        <div className={classes.emptyContainer}>
          <HbcEmptyState
            title="Invalid Year Value"
            description={`The ${sourceLabel} contains a year value that is not a valid 4-digit year (1900\u20132100). Update the value to display project sites.`}
            icon={<WarningIcon />}
          />
          <div style={{ textAlign: 'center' }}>
            <span className={classes.invalidDetail}>
              Received: {rawDisplay}
            </span>
          </div>
        </div>
      </div>
    );
  }

  const year = result.resolvedYear!.year;

  // ── Loading ─────────────────────────────────────────────────────────
  if (result.status === 'loading') {
    return (
      <div className={classes.root}>
        <SectionHeader year={year} />
        <div className={classes.spinnerContainer} role="status" aria-label={`Loading project sites for ${year}`}>
          <HbcSpinner size="lg" label={`Loading project sites for ${year}`} />
        </div>
        <LoadingShimmer />
      </div>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────
  if (result.status === 'error') {
    return (
      <div className={classes.root}>
        <SectionHeader year={year} />
        <div className={classes.emptyContainer}>
          <HbcEmptyState
            title="Unable to Load Project Sites"
            description={result.errorMessage ?? 'An unexpected error occurred while loading project sites. Try refreshing the page.'}
            icon={<AlertIcon />}
          />
        </div>
      </div>
    );
  }

  // ── Empty results ───────────────────────────────────────────────────
  if (result.status === 'empty') {
    return (
      <div className={classes.root}>
        <SectionHeader year={year} />
        <div className={classes.emptyContainer}>
          <HbcEmptyState
            title="No Project Sites"
            description={`No projects were found for ${year}. Projects will appear here once they are added to the Projects list with Year set to ${year}.`}
            icon={<SearchIcon />}
          />
        </div>
      </div>
    );
  }

  // ── Success ─────────────────────────────────────────────────────────
  return (
    <div className={classes.root}>
      <SectionHeader year={year} count={result.entries.length} />
      <div
        className={classes.grid}
        role="list"
        aria-label={`${result.entries.length} project site${result.entries.length !== 1 ? 's' : ''} for ${year}`}
      >
        {result.entries.map((entry) => (
          <div key={entry.id} role="listitem" className={classes.gridItem}>
            <ProjectSiteCard entry={entry} />
          </div>
        ))}
      </div>
    </div>
  );
};
