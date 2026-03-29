/**
 * Root React component for the Project Sites web part.
 *
 * Renders a year-context header and a responsive grid of ProjectSiteCard
 * components, with governed empty/loading/error states from @hbc/ui-kit.
 */
import React, { type FC } from 'react';
import { makeStyles } from '@griffel/react';
import {
  HbcEmptyState,
  HbcSpinner,
  HBC_PRIMARY_BLUE,
  HBC_SURFACE_LIGHT,
  HBC_RADIUS_MD,
  TRANSITION_NORMAL,
} from '@hbc/ui-kit';
import { useProjectSites } from './hooks/useProjectSites.js';
import { ProjectSiteCard } from './components/ProjectSiteCard.js';
import type { IResolvedPageYear } from './types.js';

// ── Styles ────────────────────────────────────────────────────────────────

const useStyles = makeStyles({
  root: {
    fontFamily:
      "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif",
    color: HBC_SURFACE_LIGHT['text-primary'],
    paddingTop: '24px',
    paddingBottom: '24px',
    paddingLeft: '0px',
    paddingRight: '0px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: 700,
    lineHeight: '1.3',
    color: HBC_SURFACE_LIGHT['text-primary'],
    margin: 0,
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
    minHeight: '28px',
  },
  count: {
    fontSize: '0.875rem',
    fontWeight: 400,
    color: HBC_SURFACE_LIGHT['text-muted'],
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
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
  spinnerContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '200px',
  },
  emptyContainer: {
    marginTop: '16px',
  },
});

// ── Icons (inline SVG) ────────────────────────────────────────────────────

const SettingsIcon: FC = () => (
  <svg width="40" height="40" viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <circle cx="24" cy="24" r="8" stroke={HBC_SURFACE_LIGHT['text-muted']} strokeWidth="2.5" fill="none" />
    <path
      d="M24 4V10M24 38V44M4 24H10M38 24H44M9.86 9.86L14.1 14.1M33.9 33.9L38.14 38.14M38.14 9.86L33.9 14.1M14.1 33.9L9.86 38.14"
      stroke={HBC_SURFACE_LIGHT['text-muted']}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);

const SearchIcon: FC = () => (
  <svg width="40" height="40" viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <circle cx="22" cy="22" r="12" stroke={HBC_SURFACE_LIGHT['text-muted']} strokeWidth="2.5" fill="none" />
    <path d="M31 31L40 40" stroke={HBC_SURFACE_LIGHT['text-muted']} strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const AlertIcon: FC = () => (
  <svg width="40" height="40" viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <path
      d="M24 8L4 40H44L24 8Z"
      stroke="#FF4D4D"
      strokeWidth="2.5"
      strokeLinejoin="round"
      fill="none"
    />
    <path d="M24 20V30" stroke="#FF4D4D" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="24" cy="35" r="1.5" fill="#FF4D4D" />
  </svg>
);

// ── Component ─────────────────────────────────────────────────────────────

export interface ProjectSitesRootProps {
  resolvedYear: IResolvedPageYear | null;
}

export const ProjectSitesRoot: FC<ProjectSitesRootProps> = ({ resolvedYear }) => {
  const classes = useStyles();
  const result = useProjectSites(resolvedYear);

  // ── No year configured ──────────────────────────────────────────────
  if (result.status === 'no-year') {
    return (
      <div className={classes.root}>
        <div className={classes.emptyContainer}>
          <HbcEmptyState
            title="Year Not Configured"
            description="This web part displays project sites for a specific year. Set the Year property on the hosting page, or use the property pane Year Override."
            icon={<SettingsIcon />}
          />
        </div>
      </div>
    );
  }

  const year = result.resolvedYear!.year;

  // ── Loading ─────────────────────────────────────────────────────────
  if (result.status === 'loading') {
    return (
      <div className={classes.root}>
        <div className={classes.header}>
          <h2 className={classes.title}>Project Sites</h2>
          <span className={classes.yearBadge}>{year}</span>
        </div>
        <div className={classes.spinnerContainer} role="status">
          <HbcSpinner size="lg" label={`Loading project sites for ${year}`} />
        </div>
      </div>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────
  if (result.status === 'error') {
    return (
      <div className={classes.root}>
        <div className={classes.header}>
          <h2 className={classes.title}>Project Sites</h2>
          <span className={classes.yearBadge}>{year}</span>
        </div>
        <div className={classes.emptyContainer}>
          <HbcEmptyState
            title="Unable to Load Project Sites"
            description={result.errorMessage ?? 'An unexpected error occurred while loading project sites.'}
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
        <div className={classes.header}>
          <h2 className={classes.title}>Project Sites</h2>
          <span className={classes.yearBadge}>{year}</span>
        </div>
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
      <div className={classes.header}>
        <h2 className={classes.title}>Project Sites</h2>
        <span className={classes.yearBadge}>{year}</span>
        <span className={classes.count}>
          {result.entries.length} project{result.entries.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className={classes.grid} role="list" aria-label={`Project sites for ${year}`}>
        {result.entries.map((entry) => (
          <div key={entry.id} role="listitem">
            <ProjectSiteCard entry={entry} />
          </div>
        ))}
      </div>
    </div>
  );
};
