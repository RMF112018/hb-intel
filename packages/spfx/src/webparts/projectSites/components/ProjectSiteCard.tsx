/**
 * ProjectSiteCard — polished project-site link card.
 *
 * Composes HbcCard (weight="standard") with structured metadata
 * and a primary action linking to the project's SharePoint site.
 *
 * Light-theme only, governed by @hbc/ui-kit tokens.
 */
import React, { type FC } from 'react';
import { makeStyles, mergeClasses } from '@griffel/react';
import { HbcCard } from '@hbc/ui-kit';
import {
  HBC_PRIMARY_BLUE,
  HBC_BRAND_ACTION,
  HBC_BRAND_ACTION_HOVER,
  HBC_SURFACE_LIGHT,
  HBC_RADIUS_SM,
  elevationLevel1,
  elevationLevel2,
  TRANSITION_FAST,
} from '@hbc/ui-kit';
import type { IProjectSiteEntry } from '../types.js';

// ── Styles ────────────────────────────────────────────────────────────────

const useStyles = makeStyles({
  cardWrapper: {
    textDecorationLine: 'none',
    color: 'inherit',
    display: 'block',
    borderRadius: '8px',
    transitionProperty: 'box-shadow, transform',
    transitionDuration: TRANSITION_FAST,
    transitionTimingFunction: 'ease-in-out',
    boxShadow: elevationLevel1,
    ':hover': {
      boxShadow: elevationLevel2,
      transform: 'translateY(-2px)',
    },
    ':focus-visible': {
      outlineWidth: '2px',
      outlineStyle: 'solid',
      outlineColor: HBC_PRIMARY_BLUE,
      outlineOffset: '2px',
      boxShadow: elevationLevel2,
    },
    '@media (prefers-reduced-motion: reduce)': {
      transitionDuration: '0.01ms',
    },
  },
  disabledWrapper: {
    cursor: 'default',
    opacity: 0.65,
    ':hover': {
      boxShadow: elevationLevel1,
      transform: 'none',
    },
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
  },
  projectNumber: {
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '0.025em',
    color: HBC_PRIMARY_BLUE,
    backgroundColor: '#E8F1F8',
    paddingTop: '2px',
    paddingBottom: '2px',
    paddingLeft: '8px',
    paddingRight: '8px',
    borderRadius: HBC_RADIUS_SM,
    whiteSpace: 'nowrap',
  },
  stageBadge: {
    fontSize: '0.6875rem',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    paddingTop: '2px',
    paddingBottom: '2px',
    paddingLeft: '6px',
    paddingRight: '6px',
    borderRadius: HBC_RADIUS_SM,
    whiteSpace: 'nowrap',
  },
  stageActive: {
    color: '#065F46',
    backgroundColor: '#D1FAE5',
  },
  stagePursuit: {
    color: '#92400E',
    backgroundColor: '#FEF3C7',
  },
  stageDefault: {
    color: HBC_SURFACE_LIGHT['text-muted'],
    backgroundColor: HBC_SURFACE_LIGHT['surface-2'],
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  projectName: {
    fontSize: '1rem',
    fontWeight: 600,
    lineHeight: '1.4',
    color: HBC_SURFACE_LIGHT['text-primary'],
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as const,
  },
  metaGrid: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    columnGap: '8px',
    rowGap: '4px',
    alignItems: 'baseline',
  },
  metaLabel: {
    fontSize: '0.75rem',
    fontWeight: 500,
    color: HBC_SURFACE_LIGHT['text-muted'],
    whiteSpace: 'nowrap',
  },
  metaValue: {
    fontSize: '0.8125rem',
    color: HBC_SURFACE_LIGHT['text-primary'],
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
  },
  department: {
    fontSize: '0.6875rem',
    fontWeight: 500,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    color: HBC_SURFACE_LIGHT['text-muted'],
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  openSiteLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: HBC_BRAND_ACTION,
    textDecorationLine: 'none',
    whiteSpace: 'nowrap',
    ':hover': {
      color: HBC_BRAND_ACTION_HOVER,
      textDecorationLine: 'underline',
    },
  },
  provisioningLabel: {
    fontSize: '0.8125rem',
    fontStyle: 'italic',
    color: HBC_SURFACE_LIGHT['text-muted'],
  },
  srOnly: {
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
    borderTopWidth: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
  },
});

// ── Helpers ───────────────────────────────────────────────────────────────

function formatDepartment(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getStageStyle(
  classes: ReturnType<typeof useStyles>,
  stage: string,
): string {
  const lower = stage.toLowerCase();
  if (lower === 'active') return mergeClasses(classes.stageBadge, classes.stageActive);
  if (lower === 'pursuit') return mergeClasses(classes.stageBadge, classes.stagePursuit);
  return mergeClasses(classes.stageBadge, classes.stageDefault);
}

// ── Arrow icon (inline SVG — no external dep) ────────────────────────────

const ArrowIcon: FC = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
    style={{ flexShrink: 0 }}
  >
    <path
      d="M4 12L12 4M12 4H6M12 4V10"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ── Component ─────────────────────────────────────────────────────────────

export interface ProjectSiteCardProps {
  entry: IProjectSiteEntry;
}

export const ProjectSiteCard: FC<ProjectSiteCardProps> = ({ entry }) => {
  const classes = useStyles();

  const hasMetadata = entry.clientName || entry.projectLocation || entry.projectType;

  // ── Header ──────────────────────────────────────────────────────────
  const headerContent = (
    <div className={classes.header}>
      {entry.projectNumber ? (
        <span className={classes.projectNumber}>{entry.projectNumber}</span>
      ) : (
        <span />
      )}
      {entry.projectStage && (
        <span className={getStageStyle(classes, entry.projectStage)}>
          {entry.projectStage}
        </span>
      )}
    </div>
  );

  // ── Footer ──────────────────────────────────────────────────────────
  const footerContent = (
    <div className={classes.footer}>
      <span className={classes.department}>
        {formatDepartment(entry.department)}
      </span>
      {entry.hasSiteUrl ? (
        <span className={classes.openSiteLink} aria-hidden="true">
          Open Site <ArrowIcon />
        </span>
      ) : (
        <span className={classes.provisioningLabel}>Provisioning&hellip;</span>
      )}
    </div>
  );

  // ── Card body ───────────────────────────────────────────────────────
  const bodyContent = (
    <div className={classes.body}>
      <h3 className={classes.projectName}>{entry.projectName}</h3>
      {hasMetadata && (
        <div className={classes.metaGrid}>
          {entry.clientName && (
            <>
              <span className={classes.metaLabel}>Client</span>
              <span className={classes.metaValue}>{entry.clientName}</span>
            </>
          )}
          {entry.projectLocation && (
            <>
              <span className={classes.metaLabel}>Location</span>
              <span className={classes.metaValue}>{entry.projectLocation}</span>
            </>
          )}
          {entry.projectType && (
            <>
              <span className={classes.metaLabel}>Type</span>
              <span className={classes.metaValue}>{entry.projectType}</span>
            </>
          )}
        </div>
      )}
    </div>
  );

  // ── Render ──────────────────────────────────────────────────────────
  if (entry.hasSiteUrl) {
    return (
      <a
        href={entry.siteUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={classes.cardWrapper}
        aria-label={`Open ${entry.projectName} project site${entry.projectNumber ? ` (${entry.projectNumber})` : ''}`}
      >
        <HbcCard weight="standard" header={headerContent} footer={footerContent}>
          {bodyContent}
        </HbcCard>
      </a>
    );
  }

  return (
    <div
      className={mergeClasses(classes.cardWrapper, classes.disabledWrapper)}
      aria-label={`${entry.projectName} — site provisioning in progress`}
    >
      <HbcCard weight="standard" header={headerContent} footer={footerContent}>
        {bodyContent}
      </HbcCard>
    </div>
  );
};
