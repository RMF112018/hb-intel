/**
 * ProjectSiteCard — Governed project-site link card with state differentiation.
 *
 * Four visual states:
 * - **Live** (launch-ready): HBC blue top accent,
 *   full elevation, hover lift, and a brand-tinted action chip for the
 *   "Open Site" affordance.
 * - **Archived/Inactive**: muted top accent,
 *   reduced elevation, neutral action chip.
 * - **Provisioning** (not yet launchable): HBC orange top accent, dashed border,
 *   pulsing indicator dot, non-interactive.
 * - **Attention-needed** (data issue): error accent and explicit guidance.
 *
 * Light-theme only, governed by `@hbc/ui-kit/theme` tokens.
 *
 * Import discipline (W01r-P11 Project Sites compliance closure):
 *   - Primitives from `@hbc/ui-kit/primitives`
 *   - Tokens, typography, elevation, motion from `@hbc/ui-kit/theme`
 *   - Icons from `@hbc/ui-kit/icons`
 *   - No root `@hbc/ui-kit` imports.
 */
import React, { useMemo, type FC } from 'react';
import { makeStyles, mergeClasses, shorthands } from '@griffel/react';
import {
  HbcCard,
  HbcStatusBadge,
  HbcDescriptionList,
  type StatusVariant,
  type DescriptionListItem,
} from '@hbc/ui-kit/primitives';
import {
  HBC_PRIMARY_BLUE,
  HBC_ACCENT_ORANGE,
  HBC_BRAND_ACTION,
  HBC_STATUS_COLORS,
  HBC_SURFACE_LIGHT,
  HBC_RADIUS_SM,
  HBC_RADIUS_XL,
  HBC_RADIUS_FULL,
  HBC_SPACE_XS,
  HBC_SPACE_SM,
  hbcBrandRamp,
  elevationLevel0,
  elevationLevel1,
  elevationLevel2,
  TRANSITION_FAST,
  TRANSITION_SLOW,
  heading3,
  bodySmall,
  label as labelType,
} from '@hbc/ui-kit/theme';
import type { IProjectSiteEntry } from '../types.js';
import type { ProjectSitesLayoutMode } from '../projectSitesLayoutMode.js';
import { PROJECT_SITES_MODE_RESPONSIBILITIES } from '../projectSitesLayoutMode.js';
import { formatProjectSitesPersonLabel } from '../projectSitesPeopleDisplay.js';

/**
 * Card density variant. Mirrors the `cardDensity` field of the Project
 * Sites mode responsibilities contract (see `projectSitesLayoutMode.ts`).
 *
 * - `comfortable` — full metadata, all identity chips, launch-confidence
 *   message always on (wide / desktop+).
 * - `regular` — trimmed metadata, 2 identity chips, launch-confidence
 *   message only on non-launchable states (medium / tablet).
 * - `condensed` — minimal metadata, single year chip, launch-confidence
 *   message only on non-launchable states, footer department hidden
 *   (compact / phone or short-height).
 */
export type ProjectSitesCardDensity = 'comfortable' | 'regular' | 'condensed';

function densityFromLayoutMode(
  mode: ProjectSitesLayoutMode,
): ProjectSitesCardDensity {
  return PROJECT_SITES_MODE_RESPONSIBILITIES[mode].cardDensity;
}

// ── Styles ────────────────────────────────────────────────────────────────

const useStyles = makeStyles({
  // ── Card link wrapper (shared base) ────────────────────────────────
  cardWrapper: {
    textDecorationLine: 'none',
    color: 'inherit',
    display: 'flex',
    borderRadius: HBC_RADIUS_XL,
    transitionProperty: 'box-shadow, transform, border-color',
    transitionDuration: TRANSITION_FAST,
    transitionTimingFunction: 'ease-in-out',
    height: '100%',
    '@media (prefers-reduced-motion: reduce)': {
      transitionDuration: '0.01ms',
      ':hover': {
        transform: 'none',
      },
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
  // Left-edge classification stripe reads as a deliberate identity
  // marker (closer to a bookmark / rail) instead of a thin top band —
  // making cards scannable by state at a glance without introducing
  // chromatic noise in the body.
  activeAccent: {
    ...shorthands.borderLeft('4px', 'solid', HBC_PRIMARY_BLUE),
  },

  // ── Archived/other state (live site, non-active stage) ─────────────
  archivedWrapper: {
    boxShadow: elevationLevel0,
    opacity: 0.82,
    ':hover': {
      opacity: 1,
      boxShadow: elevationLevel1,
      transform: 'translateY(-1px)',
    },
    ':focus-visible': {
      opacity: 1,
      outlineWidth: '2px',
      outlineStyle: 'solid',
      outlineColor: HBC_PRIMARY_BLUE,
      outlineOffset: '2px',
      boxShadow: elevationLevel1,
    },
  },
  archivedAccent: {
    ...shorthands.borderLeft('4px', 'solid', HBC_SURFACE_LIGHT['surface-3']),
  },

  // ── Provisioning state (no site yet) ───────────────────────────────
  provisioningWrapper: {
    cursor: 'default',
    opacity: 0.78,
    boxShadow: 'none',
    backgroundColor: HBC_SURFACE_LIGHT['surface-1'],
    ...shorthands.border('1px', 'dashed', HBC_SURFACE_LIGHT['surface-3']),
    ...shorthands.borderLeft('4px', 'solid', HBC_ACCENT_ORANGE),
    ':hover': {
      boxShadow: 'none',
      transform: 'none',
    },
  },
  // ── Attention-needed state (malformed launch-critical data) ────────
  attentionWrapper: {
    cursor: 'default',
    boxShadow: elevationLevel0,
    backgroundColor: '#fff5f5',
    ...shorthands.border('1px', 'solid', HBC_STATUS_COLORS.error),
    ...shorthands.borderLeft('4px', 'solid', HBC_STATUS_COLORS.error),
    ':hover': {
      boxShadow: elevationLevel0,
      transform: 'none',
    },
  },
  // ── Legacy-only classification accent (overrides launch-state stripe) ──
  // Applied on top of the launch-state wrapper to signal "no Projects
  // list row behind this card." Uses the same amber rail as
  // provisioning because both states share the "not a modern site"
  // signal; the small "Legacy" header badge disambiguates.
  sourceLegacyOnlyAccent: {
    ...shorthands.borderLeft('4px', 'solid', HBC_ACCENT_ORANGE),
  },

  // ── Header ─────────────────────────────────────────────────────────
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: `${HBC_SPACE_SM}px`,
    minHeight: '24px',
  },
  projectNumber: {
    fontSize: bodySmall.fontSize,
    fontWeight: 600,
    letterSpacing: '0.03em',
    fontVariantNumeric: 'tabular-nums',
    color: HBC_PRIMARY_BLUE,
    backgroundColor: hbcBrandRamp[150],
    paddingTop: '2px',
    paddingBottom: '2px',
    paddingLeft: `${HBC_SPACE_SM}px`,
    paddingRight: `${HBC_SPACE_SM}px`,
    borderRadius: HBC_RADIUS_SM,
    whiteSpace: 'nowrap',
    lineHeight: 1.4,
  },
  stageBadge: {
    marginLeft: 'auto',
  },

  // ── Body ───────────────────────────────────────────────────────────
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${HBC_SPACE_SM}px`,
  },
  projectName: {
    fontSize: heading3.fontSize,
    // Bump weight over the default heading3 so the project name
    // anchors the card visually — scanning should read
    // "Riverside Medical Center" before anything else.
    fontWeight: 700,
    lineHeight: heading3.lineHeight,
    letterSpacing: '-0.01em',
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
  identityRow: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: `${HBC_SPACE_XS}px`,
  },
  identityChip: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: bodySmall.fontSize,
    fontWeight: 600,
    lineHeight: 1.25,
    color: HBC_SURFACE_LIGHT['text-muted'],
    backgroundColor: HBC_SURFACE_LIGHT['surface-2'],
    ...shorthands.border('1px', 'solid', HBC_SURFACE_LIGHT['surface-3']),
    borderRadius: HBC_RADIUS_SM,
    paddingTop: '2px',
    paddingBottom: '2px',
    paddingLeft: `${HBC_SPACE_XS}px`,
    paddingRight: `${HBC_SPACE_XS}px`,
    maxWidth: '100%',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  accessConfidence: {
    fontSize: bodySmall.fontSize,
    color: HBC_SURFACE_LIGHT['text-muted'],
    lineHeight: 1.35,
  },
  accessConfidenceMuted: {
    color: HBC_SURFACE_LIGHT['text-muted'],
  },

  // ── Footer ─────────────────────────────────────────────────────────
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: `${HBC_SPACE_SM}px`,
    minHeight: '24px',
  },
  footerCompact: {
    alignItems: 'flex-start',
    flexDirection: 'column',
    justifyContent: 'flex-start',
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
  departmentCompact: {
    whiteSpace: 'normal',
  },
  // Premium productive action chip for "Open Site": brand-tinted
  // background, tighter horizontal padding, disciplined hover treatment.
  openSiteAction: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_XS}px`,
    fontSize: bodySmall.fontSize,
    fontWeight: 600,
    color: HBC_BRAND_ACTION,
    backgroundColor: hbcBrandRamp[100],
    paddingTop: `${HBC_SPACE_XS}px`,
    paddingBottom: `${HBC_SPACE_XS}px`,
    paddingLeft: `${HBC_SPACE_SM}px`,
    paddingRight: `${HBC_SPACE_SM}px`,
    borderRadius: HBC_RADIUS_SM,
    textDecorationLine: 'none',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    transitionProperty: 'background-color, color, transform',
    transitionDuration: TRANSITION_FAST,
    transitionTimingFunction: 'ease-in-out',
  },
  openSiteActionArchived: {
    backgroundColor: HBC_SURFACE_LIGHT['surface-2'],
    color: HBC_SURFACE_LIGHT['text-muted'],
  },
  openSiteActionCompact: {
    marginTop: `${HBC_SPACE_XS}px`,
  },
  provisioningLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_XS}px`,
    fontSize: bodySmall.fontSize,
    fontWeight: labelType.fontWeight,
    fontStyle: 'italic',
    color: HBC_ACCENT_ORANGE,
    flexShrink: 0,
  },
  provisioningLabelCompact: {
    marginTop: `${HBC_SPACE_XS}px`,
  },
  statusMessage: {
    fontSize: bodySmall.fontSize,
    color: HBC_SURFACE_LIGHT['text-muted'],
    lineHeight: 1.35,
  },
  statusMessageWarning: {
    color: HBC_STATUS_COLORS.error,
    fontWeight: 600,
  },
  provisioningDot: {
    display: 'inline-block',
    width: `${HBC_SPACE_XS + 2}px`,
    height: `${HBC_SPACE_XS + 2}px`,
    borderRadius: HBC_RADIUS_FULL,
    backgroundColor: HBC_ACCENT_ORANGE,
    animationName: {
      '0%': { opacity: 0.3 },
      '50%': { opacity: 1 },
      '100%': { opacity: 0.3 },
    },
    animationDuration: TRANSITION_SLOW,
    animationIterationCount: 'infinite',
    animationTimingFunction: 'ease-in-out',
    '@media (prefers-reduced-motion: reduce)': {
      animationName: {
        from: { opacity: 0.6 },
        to: { opacity: 0.6 },
      },
    },
  },
  metaList: {
    paddingTop: `${HBC_SPACE_XS}px`,
    ...shorthands.borderTop('1px', 'solid', HBC_SURFACE_LIGHT['surface-2']),
  },
});

// ── Helpers ───────────────────────────────────────────────────────────────

function formatDepartment(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatOfficeDivision(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function resolveIdentityLocation(entry: IProjectSiteEntry): string {
  const cityState = [entry.projectCity.trim(), entry.projectState.trim()].filter(Boolean).join(', ');
  if (cityState) return cityState;
  return entry.projectLocation;
}

function resolveLaunchActionLabel(entry: IProjectSiteEntry): string {
  if (entry.launchTargetKind === 'legacy-fallback') {
    return 'Open Legacy Project Files';
  }
  if (entry.launchStatus.state === 'archived') {
    return 'View Archived Site';
  }
  return 'Open Site';
}

function resolveStageVariant(stage: string): StatusVariant {
  const lower = stage.toLowerCase();
  if (lower === 'active') return 'onTrack';
  if (lower === 'pursuit') return 'warning';
  return 'neutral';
}

type CardVisualState = 'active' | 'provisioning' | 'archived' | 'attention';

function resolveVisualState(entry: IProjectSiteEntry): CardVisualState {
  if (entry.launchStatus.state === 'live') return 'active';
  if (entry.launchStatus.state === 'provisioning') return 'provisioning';
  if (entry.launchStatus.state === 'archived') return 'archived';
  return 'attention';
}

// ── Component ─────────────────────────────────────────────────────────────

export interface ProjectSiteCardProps {
  entry: IProjectSiteEntry;
  layoutMode?: ProjectSitesLayoutMode;
  /**
   * Explicit density override. When omitted, density is derived from
   * `layoutMode` via `PROJECT_SITES_MODE_RESPONSIBILITIES`.
   */
  density?: ProjectSitesCardDensity;
  peopleDisplayLabels?: Record<string, string>;
}

export const ProjectSiteCard: FC<ProjectSiteCardProps> = ({
  entry,
  layoutMode = 'wide',
  density,
  peopleDisplayLabels = {},
}) => {
  const classes = useStyles();
  const cardState = resolveVisualState(entry);
  const effectiveDensity: ProjectSitesCardDensity =
    density ?? densityFromLayoutMode(layoutMode);
  const isCondensed = effectiveDensity === 'condensed';
  const isRegular = effectiveDensity === 'regular';
  const isCompactLayout = layoutMode === 'compact';

  // Metadata policy by density — materially different information
  // strategy, not just a className change.
  //   comfortable: Client, Location, Type, PM, Lead Estimator, Exec
  //   regular:     Client, Location, PM, Exec           (drops Type + Lead Estimator)
  //   condensed:   Client, Location                      (drops all people)
  const metadataItems = useMemo<DescriptionListItem[]>(() => {
    const items: DescriptionListItem[] = [];
    if (entry.clientName) items.push({ label: 'Client', value: entry.clientName });
    const location = resolveIdentityLocation(entry);
    if (location) items.push({ label: 'Location', value: location });

    if (isCondensed) return items;

    if (!isRegular && entry.projectType) {
      items.push({ label: 'Type', value: entry.projectType });
    }
    if (entry.projectManagerUpn) {
      items.push({
        label: 'Project Manager',
        value: formatProjectSitesPersonLabel(entry.projectManagerUpn, peopleDisplayLabels),
      });
    }
    if (!isRegular && entry.leadEstimatorUpn) {
      items.push({
        label: 'Lead Estimator',
        value: formatProjectSitesPersonLabel(entry.leadEstimatorUpn, peopleDisplayLabels),
      });
    }
    if (entry.projectExecutiveUpn) {
      items.push({
        label: 'Project Executive',
        value: formatProjectSitesPersonLabel(entry.projectExecutiveUpn, peopleDisplayLabels),
      });
    }
    return items;
  }, [
    isCondensed,
    isRegular,
    entry.clientName,
    entry.projectCity,
    entry.projectLocation,
    entry.projectState,
    entry.projectType,
    entry.projectManagerUpn,
    entry.leadEstimatorUpn,
    entry.projectExecutiveUpn,
    peopleDisplayLabels,
  ]);

  const deptLabel = formatDepartment(entry.department);
  const officeDivisionLabel = formatOfficeDivision(entry.officeDivision);

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
      {/*
        Provenance indicator — renders only for legacy-only synthetic
        records (no Projects list row behind them). The action label
        ("Open Legacy Project Files") appears on both merged-without-
        primary-site and legacy-only cards, so this is the minimal
        signal that disambiguates the two for support triage.
      */}
      {entry.sourceClassification === 'legacy-only' && (
        <span
          className={classes.stageBadge}
          data-project-sites-provenance="legacy-only"
          aria-label="Legacy-only record — no Projects list entry behind this card"
        >
          <HbcStatusBadge variant="neutral" label="Legacy" size="small" />
        </span>
      )}
    </div>
  );

  // Identity chips policy by density:
  //   comfortable: year + office division + department
  //   regular:     year + office division
  //   condensed:   year only
  const showOfficeDivisionChip =
    !isCondensed && Boolean(officeDivisionLabel);
  const showDepartmentChip =
    !isCondensed && !isRegular && Boolean(deptLabel);

  const bodyContent = (
    <div className={classes.body}>
      <h3 className={classes.projectName}>{entry.projectName}</h3>
      <div className={classes.identityRow}>
        <span className={classes.identityChip}>{entry.year}</span>
        {showOfficeDivisionChip && (
          <span className={classes.identityChip}>{officeDivisionLabel}</span>
        )}
        {showDepartmentChip && (
          <span className={classes.identityChip}>{deptLabel}</span>
        )}
      </div>
      {!entry.launchStatus.isLaunchable && (
        <span
          className={mergeClasses(
            classes.statusMessage,
            entry.launchStatus.state === 'attention-needed' && classes.statusMessageWarning,
          )}
        >
          {entry.launchStatus.userMessage}
        </span>
      )}
      {metadataItems.length > 0 && (
        <div className={classes.metaList}>
          <HbcDescriptionList items={metadataItems} dense />
        </div>
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
    cardState === 'attention' && classes.attentionWrapper,
    // Legacy-only accent applied last so the amber rail wins over the
    // launch-state rail — provenance is the stronger identity signal
    // for synthetic records with no Projects list row behind them.
    entry.sourceClassification === 'legacy-only' && classes.sourceLegacyOnlyAccent,
  );

  if (entry.launchStatus.isLaunchable && entry.hasSiteUrl) {
    return (
      <a
        href={entry.siteUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={wrapperClass}
        data-project-sites-card-layout={layoutMode}
        data-project-sites-card-density={effectiveDensity}
        aria-label={`${resolveLaunchActionLabel(entry)}: ${entry.projectName}${entry.projectNumber ? ` (${entry.projectNumber})` : ''}`}
      >
        <HbcCard weight="standard" header={headerContent} className={classes.cardFull}>
          {bodyContent}
        </HbcCard>
      </a>
    );
  }

  return (
    <div
      className={wrapperClass}
      aria-disabled="true"
      data-project-sites-card-layout={layoutMode}
      aria-label={`${entry.projectName} — ${entry.launchStatus.userMessage}`}
    >
      <HbcCard weight="standard" header={headerContent} className={classes.cardFull}>
        {bodyContent}
      </HbcCard>
    </div>
  );
};
