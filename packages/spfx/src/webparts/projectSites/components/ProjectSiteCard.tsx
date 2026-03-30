/**
 * ProjectSiteCard — Governed project-site link card with state differentiation.
 *
 * Three visual states:
 * - **Active** (hasSiteUrl + active/pursuit stage): HBC blue top accent, full elevation, hover lift
 * - **Provisioning** (!hasSiteUrl): HBC orange top accent, dashed border, pulsing dot
 * - **Archived/Other** (hasSiteUrl + non-active stage): muted top accent, reduced elevation
 *
 * Light-theme only, governed by @hbc/ui-kit tokens.
 */
import React, { useMemo, type FC } from 'react';
import { makeStyles, mergeClasses } from '@griffel/react';
import { HbcCard, HbcStatusBadge, HbcDescriptionList } from '@hbc/ui-kit';
import type { StatusVariant, DescriptionListItem } from '@hbc/ui-kit';
import {
  HBC_PRIMARY_BLUE,
  HBC_ACCENT_ORANGE,
  HBC_BRAND_ACTION,
  HBC_SURFACE_LIGHT,
  HBC_RADIUS_SM,
  HBC_RADIUS_XL,
  hbcBrandRamp,
  elevationLevel1,
  elevationLevel2,
  elevationLevel0,
  TRANSITION_FAST,
  heading3,
  bodySmall,
  label as labelType,
} from '@hbc/ui-kit';
import { ExternalLink } from '@hbc/ui-kit/icons';
import type { IProjectSiteEntry } from '../types.js';

// ── Styles ────────────────────────────────────────────────────────────────

const useStyles = makeStyles({
  // ── Card link wrapper (shared base) ────────────────────────────────
  cardWrapper: {
    textDecorationLine: 'none',
    color: 'inherit',
    display: 'flex',
    borderRadius: HBC_RADIUS_XL,
    transitionProperty: 'box-shadow, transform',
    transitionDuration: TRANSITION_FAST,
    transitionTimingFunction: 'ease-in-out',
    height: '100%',
    '@media (prefers-reduced-motion: reduce)': {
      transitionDuration: '0.01ms',
    },
  },
  cardFull: {
    width: '100%',
  },

  // ── Active state (live site, active/pursuit stage) ─────────────────
  activeWrapper: {
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
  },
  activeAccent: {
    borderTopWidth: '3px',
    borderTopStyle: 'solid',
    borderTopColor: HBC_PRIMARY_BLUE,
  },

  // ── Archived/other state (live site, non-active stage) ─────────────
  archivedWrapper: {
    boxShadow: elevationLevel0,
    opacity: 0.8,
    ':hover': {
      boxShadow: elevationLevel1,
      transform: 'translateY(-1px)',
    },
    ':focus-visible': {
      outlineWidth: '2px',
      outlineStyle: 'solid',
      outlineColor: HBC_PRIMARY_BLUE,
      outlineOffset: '2px',
      boxShadow: elevationLevel1,
    },
  },
  archivedAccent: {
    borderTopWidth: '3px',
    borderTopStyle: 'solid',
    borderTopColor: HBC_SURFACE_LIGHT['surface-3'],
  },

  // ── Provisioning state (no site yet) ───────────────────────────────
  provisioningWrapper: {
    cursor: 'default',
    opacity: 0.75,
    boxShadow: 'none',
    borderTopWidth: '3px',
    borderBottomWidth: '1px',
    borderLeftWidth: '1px',
    borderRightWidth: '1px',
    borderTopStyle: 'solid',
    borderBottomStyle: 'dashed',
    borderLeftStyle: 'dashed',
    borderRightStyle: 'dashed',
    borderTopColor: HBC_ACCENT_ORANGE,
    borderBottomColor: HBC_SURFACE_LIGHT['surface-3'],
    borderLeftColor: HBC_SURFACE_LIGHT['surface-3'],
    borderRightColor: HBC_SURFACE_LIGHT['surface-3'],
    ':hover': {
      boxShadow: 'none',
      transform: 'none',
    },
  },

  // ── Header ─────────────────────────────────────────────────────────
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    minHeight: '24px',
  },
  projectNumber: {
    fontSize: bodySmall.fontSize,
    fontWeight: '600',
    letterSpacing: '0.03em',
    fontVariantNumeric: 'tabular-nums',
    color: HBC_PRIMARY_BLUE,
    backgroundColor: hbcBrandRamp[150],
    paddingTop: '2px',
    paddingBottom: '2px',
    paddingLeft: '8px',
    paddingRight: '8px',
    borderRadius: HBC_RADIUS_SM,
    whiteSpace: 'nowrap',
    lineHeight: '1.4',
  },
  stageBadge: {
    marginLeft: 'auto',
  },

  // ── Body ───────────────────────────────────────────────────────────
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

  // ── Footer ─────────────────────────────────────────────────────────
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    minHeight: '20px',
  },
  department: {
    fontSize: bodySmall.fontSize,
    fontWeight: labelType.fontWeight,
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
    fontSize: bodySmall.fontSize,
    fontWeight: '600',
    color: HBC_BRAND_ACTION,
    textDecorationLine: 'none',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    transitionProperty: 'color',
    transitionDuration: TRANSITION_FAST,
    transitionTimingFunction: 'ease-in-out',
  },
  provisioningLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: bodySmall.fontSize,
    fontWeight: labelType.fontWeight,
    fontStyle: 'italic',
    color: HBC_ACCENT_ORANGE,
    flexShrink: 0,
  },
  provisioningDot: {
    display: 'inline-block',
    width: '6px',
    height: '6px',
    borderRadius: '3px',
    backgroundColor: HBC_ACCENT_ORANGE,
    animationName: {
      '0%': { opacity: 0.3 },
      '50%': { opacity: 1 },
      '100%': { opacity: 0.3 },
    },
    animationDuration: '1.5s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'ease-in-out',
    '@media (prefers-reduced-motion: reduce)': {
      animationName: {
        from: { opacity: 0.6 },
        to: { opacity: 0.6 },
      },
    },
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

function resolveCardState(entry: IProjectSiteEntry): 'active' | 'provisioning' | 'archived' {
  if (!entry.hasSiteUrl) return 'provisioning';
  const lower = entry.projectStage?.toLowerCase() ?? '';
  if (lower === 'active' || lower === 'pursuit') return 'active';
  return 'archived';
}

// ── Component ─────────────────────────────────────────────────────────────

export interface ProjectSiteCardProps {
  entry: IProjectSiteEntry;
}

export const ProjectSiteCard: FC<ProjectSiteCardProps> = ({ entry }) => {
  const classes = useStyles();
  const cardState = resolveCardState(entry);

  const metadataItems = useMemo<DescriptionListItem[]>(() => {
    const items: DescriptionListItem[] = [];
    if (entry.clientName) items.push({ label: 'Client', value: entry.clientName });
    if (entry.projectLocation) items.push({ label: 'Location', value: entry.projectLocation });
    if (entry.projectType) items.push({ label: 'Type', value: entry.projectType });
    return items;
  }, [entry.clientName, entry.projectLocation, entry.projectType]);

  const deptLabel = formatDepartment(entry.department);

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

  const footerContent = (
    <div className={classes.footer}>
      <span className={classes.department}>{deptLabel}</span>
      {entry.hasSiteUrl ? (
        <span className={classes.openSiteAction} aria-hidden="true">
          Open Site <ExternalLink size="sm" />
        </span>
      ) : (
        <span className={classes.provisioningLabel}>
          <span className={classes.provisioningDot} aria-hidden="true" />
          Provisioning
        </span>
      )}
    </div>
  );

  const bodyContent = (
    <div className={classes.body}>
      <h3 className={classes.projectName}>{entry.projectName}</h3>
      {metadataItems.length > 0 && (
        <HbcDescriptionList items={metadataItems} dense />
      )}
    </div>
  );

  const wrapperClass = mergeClasses(
    classes.cardWrapper,
    classes.cardFull,
    cardState === 'active' && classes.activeWrapper,
    cardState === 'active' && classes.activeAccent,
    cardState === 'archived' && classes.archivedWrapper,
    cardState === 'archived' && classes.archivedAccent,
    cardState === 'provisioning' && classes.provisioningWrapper,
  );

  if (entry.hasSiteUrl) {
    return (
      <a
        href={entry.siteUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={wrapperClass}
        aria-label={`Open ${entry.projectName} project site${entry.projectNumber ? ` (${entry.projectNumber})` : ''}`}
      >
        <HbcCard weight="standard" header={headerContent} footer={footerContent} className={classes.cardFull}>
          {bodyContent}
        </HbcCard>
      </a>
    );
  }

  return (
    <div
      className={wrapperClass}
      aria-disabled="true"
      aria-label={`${entry.projectName} — site provisioning in progress`}
    >
      <HbcCard weight="standard" header={headerContent} footer={footerContent} className={classes.cardFull}>
        {bodyContent}
      </HbcCard>
    </div>
  );
};
