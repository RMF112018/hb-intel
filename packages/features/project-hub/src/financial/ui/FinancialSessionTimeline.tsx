/**
 * FinancialSessionTimeline — operational session history display.
 *
 * Renders a structured timeline of import, revision, review, and
 * publication sessions with status, outcome, and recovery paths.
 *
 * Uses @hbc/ui-kit HbcStatusBadge, HbcCard, HbcButton.
 */

import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import { Text, HbcStatusBadge, HbcCard, HbcButton, HBC_SPACE_SM, HBC_SPACE_XS, HBC_STATUS_COLORS } from '@hbc/ui-kit';
import type { OperationalSession } from '../hooks/useFinancialSessionHistory.js';

const useStyles = makeStyles({
  timeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${HBC_SPACE_SM}px`,
  },
  sessionCard: {
    borderLeftWidth: '3px',
    borderLeftStyle: 'solid',
  },
  complete: { borderLeftColor: HBC_STATUS_COLORS.success },
  partial: { borderLeftColor: HBC_STATUS_COLORS.warning },
  failed: { borderLeftColor: HBC_STATUS_COLORS.error },
  inProgress: { borderLeftColor: HBC_STATUS_COLORS.info },
  superseded: { borderLeftColor: HBC_STATUS_COLORS.neutral },
  returned: { borderLeftColor: HBC_STATUS_COLORS.warning },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailRow: {
    display: 'flex',
    gap: `${HBC_SPACE_SM}px`,
    alignItems: 'center',
    paddingTop: `${HBC_SPACE_XS}px`,
  },
  recoveryBox: {
    marginTop: `${HBC_SPACE_XS}px`,
    paddingTop: `${HBC_SPACE_XS}px`,
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    borderTopColor: 'var(--colorNeutralStroke3)',
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
  },
});

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
  complete: 'success',
  partial: 'warning',
  failed: 'error',
  'in-progress': 'info',
  superseded: 'neutral',
  returned: 'warning',
};

const STATUS_LABEL: Record<string, string> = {
  complete: 'Complete',
  partial: 'Partial — Action Required',
  failed: 'Failed',
  'in-progress': 'In Progress',
  superseded: 'Superseded',
  returned: 'Returned for Revision',
};

export interface FinancialSessionTimelineProps {
  readonly sessions: readonly OperationalSession[];
  readonly onNavigateToTool?: (toolSlug: string) => void;
  readonly maxVisible?: number;
}

export function FinancialSessionTimeline({
  sessions,
  onNavigateToTool,
  maxVisible = 10,
}: FinancialSessionTimelineProps): ReactNode {
  const styles = useStyles();
  const visible = sessions.slice(0, maxVisible);

  return (
    <div className={styles.timeline} data-testid="financial-session-timeline">
      {visible.map((session) => (
        <HbcCard
          key={session.id}
          className={`${styles.sessionCard} ${styles[session.status === 'in-progress' ? 'inProgress' : session.status] ?? ''}`}
        >
          <div className={styles.headerRow}>
            <Text size={200} weight="semibold">{session.label}</Text>
            <HbcStatusBadge
              variant={STATUS_VARIANT[session.status] ?? 'neutral'}
              label={STATUS_LABEL[session.status] ?? session.status}
              size="small"
            />
          </div>

          <div className={styles.detailRow}>
            <Text size={100} style={{ opacity: 0.6 }}>
              {session.actor} · {new Date(session.startedAt).toLocaleString()}
              {session.completedAt && ` → ${new Date(session.completedAt).toLocaleTimeString()}`}
            </Text>
          </div>

          <div className={styles.detailRow}>
            <Text size={200}>{session.scope}</Text>
          </div>

          <div className={styles.detailRow}>
            <Text size={200}>{session.outcomeLabel}</Text>
            {session.unresolvedCount > 0 && (
              <HbcStatusBadge variant="warning" label={`${session.unresolvedCount} unresolved`} size="small" />
            )}
          </div>

          {session.recoveryPath && (
            <div className={styles.recoveryBox} data-testid={`recovery-${session.id}`}>
              <Text size={200} weight="semibold">Recovery:</Text>
              <Text size={200}>{session.recoveryPath.description}</Text>
              {onNavigateToTool && (
                <HbcButton
                  size="sm"
                  variant="secondary"
                  onClick={() => onNavigateToTool(session.recoveryPath!.toolSlug)}
                >
                  {session.recoveryPath.action}
                </HbcButton>
              )}
            </div>
          )}
        </HbcCard>
      ))}
    </div>
  );
}
