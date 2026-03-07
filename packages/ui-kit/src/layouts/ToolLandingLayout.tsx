/**
 * ToolLandingLayout — Tool list/dashboard page layout
 * PH4.5 §Step 2 | Blueprint §1f, §2c
 * Traceability: D-PH4C-24, D-PH4C-25
 *
 * Structure: Page Header (sticky) → Command Bar (sticky) → KPI Cards → Content → Status Bar (sticky bottom)
 */
import * as React from 'react';
import { makeStyles, mergeClasses, shorthands } from '@griffel/react';
import { heading1, label as labelType } from '../theme/typography.js';
import { HBC_SPACE_XS, HBC_SPACE_SM, HBC_SPACE_MD, HBC_SPACE_LG } from '../theme/grid.js';
import { HBC_BREAKPOINT_CONTENT_MEDIUM, HBC_BREAKPOINT_MOBILE } from '../theme/breakpoints.js';
import { elevationRest } from '../theme/elevation.js';
import {
  HBC_SURFACE_LIGHT,
  HBC_ACCENT_ORANGE,
  HBC_STATUS_COLORS,
} from '../theme/tokens.js';
import { TRANSITION_NORMAL } from '../theme/animations.js';
import type { ToolLandingLayoutProps, KpiCardData, LayoutAction } from './types.js';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100%',
    position: 'relative',
  },
  pageHeader: {
    position: 'sticky',
    top: '0px',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: `${HBC_SPACE_LG}px`,
    paddingRight: `${HBC_SPACE_LG}px`,
    backgroundColor: HBC_SURFACE_LIGHT['surface-0'],
    ...shorthands.borderBottom('1px', 'solid', HBC_SURFACE_LIGHT['border-default']),
    zIndex: 10,
    flexShrink: 0,
  },
  pageTitle: {
    ...heading1,
    color: HBC_SURFACE_LIGHT['text-primary'],
    marginTop: '0px',
    marginBottom: '0px',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
  },
  actionButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
    paddingLeft: `${HBC_SPACE_MD}px`,
    paddingRight: `${HBC_SPACE_MD}px`,
    paddingTop: `${HBC_SPACE_SM}px`,
    paddingBottom: `${HBC_SPACE_SM}px`,
    ...shorthands.borderRadius('6px'),
    ...shorthands.borderStyle('none'),
    fontWeight: '600',
    fontSize: '0.875rem',
    cursor: 'pointer',
    transitionProperty: 'background-color, opacity',
    transitionDuration: TRANSITION_NORMAL,
    backgroundColor: HBC_SURFACE_LIGHT['surface-2'],
    color: HBC_SURFACE_LIGHT['text-primary'],
    ':hover': {
      backgroundColor: HBC_SURFACE_LIGHT['surface-3'],
    },
    ':disabled': {
      opacity: '0.5',
      cursor: 'not-allowed',
    },
  },
  actionButtonPrimary: {
    backgroundColor: HBC_ACCENT_ORANGE,
    color: '#FFFFFF',
    ':hover': {
      backgroundColor: '#E06018',
    },
  },
  commandBarSlot: {
    position: 'sticky',
    top: '64px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    paddingLeft: `${HBC_SPACE_LG}px`,
    paddingRight: `${HBC_SPACE_LG}px`,
    backgroundColor: HBC_SURFACE_LIGHT['surface-1'],
    ...shorthands.borderBottom('1px', 'solid', HBC_SURFACE_LIGHT['border-default']),
    zIndex: 9,
    flexShrink: 0,
  },
  kpiRow: {
    display: 'grid',
    gap: `${HBC_SPACE_LG}px`,
    paddingLeft: `${HBC_SPACE_LG}px`,
    paddingRight: `${HBC_SPACE_LG}px`,
    paddingTop: `${HBC_SPACE_LG}px`,
    paddingBottom: `${HBC_SPACE_LG}px`,
    gridTemplateColumns: 'repeat(4, 1fr)',
    // PH4C.12: layout breakpoints are centralized to keep shell and content transitions aligned.
    [`@media (max-width: ${HBC_BREAKPOINT_CONTENT_MEDIUM}px)`]: {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
    [`@media (max-width: ${HBC_BREAKPOINT_MOBILE}px)`]: {
      gridTemplateColumns: '1fr',
    },
  },
  kpiCard: {
    backgroundColor: HBC_SURFACE_LIGHT['surface-0'],
    boxShadow: elevationRest,
    ...shorthands.borderRadius('8px'),
    paddingLeft: `${HBC_SPACE_MD}px`,
    paddingRight: `${HBC_SPACE_MD}px`,
    paddingTop: `${HBC_SPACE_MD}px`,
    paddingBottom: `${HBC_SPACE_MD}px`,
  },
  kpiLabel: {
    ...labelType,
    color: HBC_SURFACE_LIGHT['text-muted'],
    marginBottom: `${HBC_SPACE_XS}px`,
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
  },
  kpiValue: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: HBC_SURFACE_LIGHT['text-primary'],
    lineHeight: '1.3',
  },
  kpiTrend: {
    ...labelType,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    marginTop: `${HBC_SPACE_XS}px`,
  },
  kpiTrendUp: {
    color: HBC_STATUS_COLORS.success,
  },
  kpiTrendDown: {
    color: HBC_STATUS_COLORS.error,
  },
  kpiTrendFlat: {
    color: HBC_SURFACE_LIGHT['text-muted'],
  },
  contentArea: {
    flexGrow: 1,
    overflowY: 'auto',
    paddingLeft: `${HBC_SPACE_LG}px`,
    paddingRight: `${HBC_SPACE_LG}px`,
    paddingTop: `${HBC_SPACE_LG}px`,
    paddingBottom: `${HBC_SPACE_LG}px`,
  },
  statusBar: {
    position: 'sticky',
    bottom: '0px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: `${HBC_SPACE_LG}px`,
    paddingRight: `${HBC_SPACE_LG}px`,
    backgroundColor: HBC_SURFACE_LIGHT['surface-1'],
    ...shorthands.borderTop('1px', 'solid', HBC_SURFACE_LIGHT['border-default']),
    fontSize: '0.6875rem',
    color: HBC_SURFACE_LIGHT['text-muted'],
    flexShrink: 0,
    zIndex: 8,
  },
});

const TREND_ARROWS: Record<string, string> = {
  up: '\u2191',
  down: '\u2193',
  flat: '\u2192',
};

function renderAction(action: LayoutAction, styles: ReturnType<typeof useStyles>) {
  return (
    <button
      key={action.key}
      className={mergeClasses(styles.actionButton, action.primary && styles.actionButtonPrimary)}
      onClick={action.onClick}
      disabled={action.disabled}
      type="button"
    >
      {action.icon}
      {action.label}
    </button>
  );
}

function renderKpiCard(card: KpiCardData, styles: ReturnType<typeof useStyles>) {
  const trendClass = card.trend === 'up'
    ? styles.kpiTrendUp
    : card.trend === 'down'
      ? styles.kpiTrendDown
      : styles.kpiTrendFlat;

  return (
    <div key={card.id} className={styles.kpiCard}>
      <div className={styles.kpiLabel}>
        {card.icon}
        {card.label}
      </div>
      <div className={styles.kpiValue}>{card.value}</div>
      {card.trend && card.trendValue && (
        <div className={mergeClasses(styles.kpiTrend, trendClass)}>
          {TREND_ARROWS[card.trend]} {card.trendValue}
        </div>
      )}
    </div>
  );
}

export const ToolLandingLayout: React.FC<ToolLandingLayoutProps> = ({
  toolName,
  primaryAction,
  secondaryActions,
  commandBar,
  kpiCards,
  statusBar,
  children,
}) => {
  const styles = useStyles();

  return (
    <div className={styles.root} data-hbc-layout="tool-landing">
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>{toolName}</h1>
        <div className={styles.headerActions}>
          {secondaryActions?.map((action) => renderAction(action, styles))}
          {primaryAction && renderAction({ ...primaryAction, primary: true }, styles)}
        </div>
      </div>

      {/* Command Bar slot */}
      {commandBar && <div className={styles.commandBarSlot}>{commandBar}</div>}

      {/* KPI Cards Row */}
      {kpiCards && kpiCards.length > 0 && (
        <div className={styles.kpiRow}>
          {kpiCards.map((card) => renderKpiCard(card, styles))}
        </div>
      )}

      {/* Content Area */}
      <div className={styles.contentArea}>{children}</div>

      {/* Status Bar */}
      {statusBar && (
        <div className={styles.statusBar} role="status" aria-live="polite">
          <span>Showing {statusBar.showing} of {statusBar.total} items</span>
          {statusBar.lastSynced && <span>Last synced {statusBar.lastSynced}</span>}
        </div>
      )}
    </div>
  );
};
