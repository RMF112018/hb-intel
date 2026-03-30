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
import { HbcCard, HbcStatusBadge } from '@hbc/ui-kit';
import type { StatusVariant } from '@hbc/ui-kit';
import {
  HBC_PRIMARY_BLUE,
  HBC_BRAND_ACTION,
  HBC_SURFACE_LIGHT,
  HBC_RADIUS_SM,
  HBC_RADIUS_XL,
  hbcBrandRamp,
  elevationLevel1,
  elevationLevel2,
  TRANSITION_FAST,
  heading3,
  label as labelType,
  body as bodyType,
} from '@hbc/ui-kit';
import { ExternalLink } from '@hbc/ui-kit/icons';
import type { IProjectSiteEntry } from '../types.js';

// ── Styles ────────────────────────────────────────────────────────────────

const useStyles = makeStyles({
  // ── Wrapper ─────────────────────────────────────────────────────────
  cardWrapper: {
    textDecorationLine: 'none',
    color: 'inherit',
    display: 'block',
    borderRadius: HBC_RADIUS_XL,
    transitionProperty: 'box-shadow, transform',
    transitionDuration: TRANSITION_FAST,
    transitionTimingFunction: 'ease-in-out',
    boxShadow: elevationLevel1,
    height: '100%',
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
    opacity: 0.6,
    ':hover': {
      boxShadow: elevationLevel1,
      transform: 'none',
    },
  },

  // ── Header ──────────────────────────────────────────────────────────
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    minHeight: '24px',
  },
  projectNumber: {
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '0.025em',
    color: HBC_PRIMARY_BLUE,
    backgroundColor: hbcBrandRamp[150],
    paddingTop: '3px',
    paddingBottom: '3px',
    paddingLeft: '8px',
    paddingRight: '8px',
    borderRadius: HBC_RADIUS_SM,
    whiteSpace: 'nowrap',
    lineHeight: '1.3',
  },
  stageBadge: {
    marginLeft: 'auto',
  },

  // ── Body ────────────────────────────────────────────────────────────
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  projectName: {
    fontSize: heading3.fontSize,
    fontWeight: heading3.fontWeight,
    lineHeight: heading3.lineHeight,
    color: HBC_SURFACE_LIGHT['text-primary'],
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as const,
    wordBreak: 'break-word' as const,
  },
  metaGrid: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    columnGap: '10px',
    rowGap: '4px',
    alignItems: 'baseline',
  },
  metaLabel: {
    fontSize: labelType.fontSize,
    fontWeight: labelType.fontWeight,
    color: HBC_SURFACE_LIGHT['text-muted'],
    whiteSpace: 'nowrap',
  },
  metaValue: {
    fontSize: bodyType.fontSize,
    color: HBC_SURFACE_LIGHT['text-primary'],
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  // ── Footer ──────────────────────────────────────────────────────────
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    minHeight: '20px',
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
    flexShrink: 1,
    minWidth: 0,
  },
  openSiteAction: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: HBC_BRAND_ACTION,
    textDecorationLine: 'none',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    transitionProperty: 'color',
    transitionDuration: TRANSITION_FAST,
    transitionTimingFunction: 'ease-in-out',
  },
  openSiteActionHover: {
    // Applied to the action span when the CARD wrapper is hovered.
    // This is achieved via CSS descendant selector on the wrapper :hover.
    // Since Griffel doesn't support descendant selectors, we apply via
    // conditional className in the component instead.
  },
  provisioningLabel: {
    fontSize: '0.8125rem',
    fontStyle: 'italic',
    color: HBC_SURFACE_LIGHT['text-muted'],
    flexShrink: 0,
  },
});

// ── Helpers ───────────────────────────────────────────────────────────────

function formatDepartment(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function resolveStageVariant(stage: string): StatusVariant {
  const lower = stage.toLowerCase();
  if (lower === 'active') return 'onTrack';
  if (lower === 'pursuit') return 'warning';
  return 'neutral';
}

// ── Component ─────────────────────────────────────────────────────────────

export interface ProjectSiteCardProps {
  entry: IProjectSiteEntry;
}

export const ProjectSiteCard: FC<ProjectSiteCardProps> = ({ entry }) => {
  const classes = useStyles();

  const hasMetadata = entry.clientName || entry.projectLocation || entry.projectType;
  const deptLabel = formatDepartment(entry.department);

  // ── Header ──────────────────────────────────────────────────────────
  const headerContent = (
    <div className={classes.header}>
      {entry.projectNumber && (
        <span className={classes.projectNumber}>{entry.projectNumber}</span>
      )}
      {entry.projectStage && (
        <span className={classes.stageBadge}>
          <HbcStatusBadge
            variant={resolveStageVariant(entry.projectStage)}
            label={entry.projectStage}
            size="small"
          />
        </span>
      )}
    </div>
  );

  // ── Footer ──────────────────────────────────────────────────────────
  const footerContent = (
    <div className={classes.footer}>
      <span className={classes.department}>{deptLabel}</span>
      {entry.hasSiteUrl ? (
        <span className={classes.openSiteAction} aria-hidden="true">
          Open Site <ExternalLink size="sm" />
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

  // ── Render: linked card ─────────────────────────────────────────────
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

  // ── Render: disabled card (not focusable) ───────────────────────────
  return (
    <div
      className={mergeClasses(classes.cardWrapper, classes.disabledWrapper)}
      role="group"
      aria-label={`${entry.projectName} — site provisioning in progress`}
    >
      <HbcCard weight="standard" header={headerContent} footer={footerContent}>
        {bodyContent}
      </HbcCard>
    </div>
  );
};
