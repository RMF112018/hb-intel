/**
 * FinancialOperationalBanner — runtime-honesty disclosure component.
 *
 * Renders a governed operational-state banner at the top of every
 * Financial surface, disclosing data source truthfulness, editability,
 * readiness posture, blockers, and next action.
 *
 * Uses @hbc/ui-kit HbcStatusBadge and HbcButton for consistency.
 */

import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import { Text, HbcStatusBadge, HbcButton, HBC_SPACE_SM, HBC_SPACE_XS } from '@hbc/ui-kit';
import type { FinancialOperationalState, OperationalBlocker } from '../hooks/useFinancialOperationalState.js';

const useStyles = makeStyles({
  banner: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${HBC_SPACE_XS}px`,
    paddingTop: `${HBC_SPACE_SM}px`,
    paddingBottom: `${HBC_SPACE_SM}px`,
    paddingLeft: `${HBC_SPACE_SM}px`,
    paddingRight: `${HBC_SPACE_SM}px`,
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--colorNeutralStroke2)',
    backgroundColor: 'var(--colorNeutralBackground2)',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
    flexWrap: 'wrap',
  },
  blockerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
    paddingTop: `${HBC_SPACE_XS}px`,
  },
  nextActionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
    paddingTop: `${HBC_SPACE_XS}px`,
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    borderTopColor: 'var(--colorNeutralStroke3)',
  },
  mockWarning: {
    backgroundColor: 'var(--colorPaletteYellowBackground1)',
    borderBottomWidth: '2px',
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--colorPaletteYellowBorder1)',
  },
});

// ── Props ──────────────────────────────────────────────────────────────

export interface FinancialOperationalBannerProps {
  readonly state: FinancialOperationalState;
  readonly onNavigateToTool?: (toolSlug: string) => void;
}

// ── Variant mapping ────────────────────────────────────────────────────

const EDITABILITY_VARIANT: Record<string, 'info' | 'success' | 'warning' | 'error' | 'neutral'> = {
  editable: 'info',
  'read-only': 'neutral',
  locked: 'warning',
  blocked: 'error',
  'approval-pending': 'warning',
};

const READINESS_VARIANT: Record<string, 'success' | 'warning' | 'error' | 'neutral'> = {
  ready: 'success',
  blocked: 'error',
  warning: 'warning',
  'not-started': 'neutral',
};

const BLOCKER_VARIANT: Record<string, 'error' | 'warning' | 'info'> = {
  error: 'error',
  warning: 'warning',
  info: 'info',
};

// ── Component ──────────────────────────────────────────────────────────

export function FinancialOperationalBanner({
  state,
  onNavigateToTool,
}: FinancialOperationalBannerProps): ReactNode {
  const styles = useStyles();

  return (
    <div
      className={`${styles.banner} ${state.isMockData ? styles.mockWarning : ''}`}
      data-testid="financial-operational-banner"
    >
      {/* Row 1: Data source + editability + readiness */}
      <div className={styles.row}>
        <HbcStatusBadge
          variant={state.isMockData ? 'warning' : state.dataSource === 'stale' ? 'warning' : state.dataSource === 'failed' ? 'error' : 'neutral'}
          label={state.dataSourceLabel}
          size="small"
        />
        <HbcStatusBadge
          variant={EDITABILITY_VARIANT[state.editability] ?? 'neutral'}
          label={state.editabilityLabel}
          size="small"
        />
        <HbcStatusBadge
          variant={READINESS_VARIANT[state.readiness] ?? 'neutral'}
          label={state.readinessLabel}
          size="small"
        />
      </div>

      {/* Row 2: Blockers (if any) */}
      {state.blockers.length > 0 && (
        <div>
          {state.blockers.map((blocker: OperationalBlocker) => (
            <div key={blocker.id} className={styles.blockerRow} data-testid={`blocker-${blocker.id}`}>
              <HbcStatusBadge
                variant={BLOCKER_VARIANT[blocker.severity] ?? 'warning'}
                label={blocker.label}
                size="small"
              />
              {blocker.actionLabel && blocker.actionToolSlug && onNavigateToTool && (
                <HbcButton
                  size="sm"
                  variant="secondary"
                  onClick={() => onNavigateToTool(blocker.actionToolSlug!)}
                >
                  {blocker.actionLabel}
                </HbcButton>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Row 3: Next action */}
      {state.nextAction && (
        <div className={styles.nextActionRow} data-testid="next-action">
          <Text size={200} weight="semibold">Next:</Text>
          <Text size={200}>{state.nextAction.label}</Text>
          <Text size={100} style={{ opacity: 0.6 }}>Owner: {state.nextAction.owner}</Text>
          {state.nextAction.toolSlug && !state.nextAction.isBlocked && onNavigateToTool && (
            <HbcButton
              size="sm"
              variant="secondary"
              onClick={() => onNavigateToTool(state.nextAction!.toolSlug!)}
            >
              Go
            </HbcButton>
          )}
        </div>
      )}
    </div>
  );
}
