/**
 * HistoryPage — History / Audit investigation workspace.
 *
 * Route: /project-hub/:projectId/financial/history
 * Governance: Version timeline, audit event trace, investigation navigation.
 */

import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import { Text, HbcStatusBadge, HbcCard, HbcButton, HBC_SPACE_SM, HBC_SPACE_MD, HBC_SPACE_XS, HBC_STATUS_COLORS } from '@hbc/ui-kit';
import { useHistorySurface } from '../hooks/useHistorySurface.js';
import { useFinancialSessionHistory } from '../hooks/useFinancialSessionHistory.js';
import { FinancialSessionTimeline } from './FinancialSessionTimeline.js';
import type { FinancialViewerRole, FinancialComplexityTier } from '../hooks/useFinancialControlCenter.js';

const useStyles = makeStyles({
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: `${HBC_SPACE_MD}px`, paddingBottom: `${HBC_SPACE_MD}px`, paddingLeft: `${HBC_SPACE_MD}px`, paddingRight: `${HBC_SPACE_MD}px`, borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'var(--colorNeutralStroke1)' },
  section: { paddingTop: `${HBC_SPACE_MD}px`, paddingBottom: `${HBC_SPACE_MD}px`, paddingLeft: `${HBC_SPACE_MD}px`, paddingRight: `${HBC_SPACE_MD}px` },
  versionRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: `${HBC_SPACE_SM}px`, paddingBottom: `${HBC_SPACE_SM}px`, borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'var(--colorNeutralStroke2)' },
  eventRow: { display: 'flex', gap: `${HBC_SPACE_SM}px`, paddingTop: `${HBC_SPACE_SM}px`, paddingBottom: `${HBC_SPACE_SM}px`, borderBottomWidth: '1px', borderBottomStyle: 'solid', borderBottomColor: 'var(--colorNeutralStroke2)', alignItems: 'flex-start' },
  eventTime: { minWidth: '80px', fontSize: '11px', opacity: 0.6 },
  significanceIndicator: { minWidth: '8px', minHeight: '8px', borderRadius: '50%', marginTop: '4px' },
  routine: { backgroundColor: HBC_STATUS_COLORS.info },
  notable: { backgroundColor: HBC_STATUS_COLORS.warning },
  critical: { backgroundColor: HBC_STATUS_COLORS.error },
});

const VERSION_STATE_VARIANT: Record<string, 'success' | 'info' | 'completed' | 'neutral'> = {
  Working: 'info',
  ConfirmedInternal: 'success',
  PublishedMonthly: 'completed',
  Superseded: 'neutral',
};

export interface HistoryPageProps {
  readonly projectId: string;
  readonly viewerRole?: FinancialViewerRole;
  readonly complexityTier?: FinancialComplexityTier;
  readonly onBack?: () => void;
}

export function HistoryPage({ projectId: _projectId, viewerRole, complexityTier, onBack }: HistoryPageProps): ReactNode {
  const styles = useStyles();
  const data = useHistorySurface({ viewerRole, complexityTier });
  const sessionHistory = useFinancialSessionHistory();

  return (
    <>
      <div className={styles.header} data-testid="history-header">
        <Text size={400} weight="semibold">History & Audit</Text>
        {onBack && <HbcButton variant="secondary" onClick={onBack}>Back</HbcButton>}
      </div>

      <div className={styles.section}>
        <Text size={300} weight="semibold" style={{ marginBottom: `${HBC_SPACE_SM}px` }}>
          Version Timeline ({data.versions.length} versions)
        </Text>
        {data.versions.map((ver) => (
          <div key={ver.id} className={styles.versionRow} data-testid={`history-version-${ver.id}`}>
            <div>
              <Text size={200} weight="semibold">Version {ver.versionNumber} — {ver.reportingMonth}</Text>
              <Text size={100} style={{ opacity: 0.6 }}>
                Created {new Date(ver.createdAt).toLocaleDateString()}
                {ver.confirmedAt && ` · Confirmed ${new Date(ver.confirmedAt).toLocaleDateString()}`}
                {ver.publishedAt && ` · Published ${new Date(ver.publishedAt).toLocaleDateString()}`}
                {ver.derivationReason && ` · Reason: ${ver.derivationReason}`}
              </Text>
            </div>
            <HbcStatusBadge variant={VERSION_STATE_VARIANT[ver.state] ?? 'neutral'} label={ver.state} size="small" />
          </div>
        ))}
      </div>

      <div className={styles.section}>
        <Text size={300} weight="semibold" style={{ marginBottom: `${HBC_SPACE_SM}px` }}>
          Operational Sessions ({sessionHistory.sessions.length})
        </Text>
        {sessionHistory.hasFailedSessions && (
          <HbcStatusBadge variant="error" label="Failed sessions require attention" size="small" />
        )}
        {sessionHistory.hasPartialSessions && (
          <HbcStatusBadge variant="warning" label="Partial sessions have unresolved items" size="small" />
        )}
        <FinancialSessionTimeline
          sessions={sessionHistory.sessions}
          onNavigateToTool={onBack ? undefined : undefined}
        />
      </div>

      <div className={styles.section}>
        <Text size={300} weight="semibold" style={{ marginBottom: `${HBC_SPACE_SM}px` }}>
          Audit Trail ({data.auditEvents.length} events)
        </Text>
        {data.auditEvents.map((evt) => (
          <div key={evt.id} className={styles.eventRow} data-testid={`history-event-${evt.id}`}>
            <div className={`${styles.significanceIndicator} ${styles[evt.significance]}`} />
            <div className={styles.eventTime}>{new Date(evt.occurredAt).toLocaleDateString()}</div>
            <div>
              <Text size={200} weight="semibold">{evt.eventType}</Text>
              <Text size={200}>{evt.summary}</Text>
              <Text size={100} style={{ opacity: 0.6 }}>{evt.actor}</Text>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
