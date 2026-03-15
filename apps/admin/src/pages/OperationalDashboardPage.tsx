import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import {
  useCurrentSession,
  PermissionGate,
  ADMIN_PROVISIONING_ALERT_FULL_DETAIL,
} from '@hbc/auth';
import type { IProjectSetupRequest, ProjectSetupRequestState } from '@hbc/models';
import { createProvisioningApiClient } from '@hbc/provisioning';
import { AdminAlertDashboard, ImplementationTruthDashboard } from '@hbc/features-admin';
import {
  HbcBanner,
  HbcCard,
  HbcCoachingCallout,
  HbcEmptyState,
  HbcStatusBadge,
  HbcTypography,
  WorkspacePageShell,
} from '@hbc/ui-kit';
import { resolveSessionToken } from '../utils/resolveSessionToken.js';
import { RUNBOOK_LINKS } from '../constants/runbookLinks.js';
import {
  computeStateCounts,
  computeQueueHealthSummary,
  detectBottlenecks,
} from '../utils/bottleneckRules.js';

/** Labels for ProjectSetupRequestState values. */
const STATE_LABELS: Record<ProjectSetupRequestState, string> = {
  Submitted: 'Submitted',
  UnderReview: 'Under Review',
  NeedsClarification: 'Needs Clarification',
  AwaitingExternalSetup: 'Awaiting External Setup',
  ReadyToProvision: 'Ready to Provision',
  Provisioning: 'Provisioning',
  Completed: 'Completed',
  Failed: 'Failed',
};

/** Map state to HbcStatusBadge variant. */
function stateToVariant(
  state: ProjectSetupRequestState,
): 'error' | 'warning' | 'completed' | 'inProgress' | 'neutral' {
  switch (state) {
    case 'Failed':
      return 'error';
    case 'NeedsClarification':
    case 'AwaitingExternalSetup':
      return 'warning';
    case 'Completed':
      return 'completed';
    case 'Provisioning':
    case 'ReadyToProvision':
      return 'inProgress';
    default:
      return 'neutral';
  }
}

const useStyles = makeStyles({
  stateGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '12px',
    marginBottom: '16px',
  },
  stateCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '12px',
  },
  summaryRow: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
    marginBottom: '16px',
  },
  summaryCard: {
    flex: '1 1 200px',
    padding: '16px',
  },
  section: {
    marginTop: '24px',
  },
  bottleneckRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginBottom: '12px',
  },
});

/**
 * G6-T03: Operational dashboard page — queue overview, alert dashboard,
 * and infrastructure truth dashboard.
 */
export function OperationalDashboardPage(): ReactNode {
  const styles = useStyles();
  const session = useCurrentSession();

  const [requests, setRequests] = useState<IProjectSetupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const authToken = useMemo(() => resolveSessionToken(session), [session]);
  const functionAppUrl =
    (import.meta.env as Record<string, string | undefined>).VITE_FUNCTION_APP_URL ?? '';
  const client = useMemo(
    () => createProvisioningApiClient(functionAppUrl, async () => authToken),
    [authToken, functionAppUrl],
  );

  const loadData = useCallback(async (): Promise<void> => {
    if (!session) return;
    setLoading(true);
    setLoadError(null);
    try {
      const data = await client.listRequests();
      setRequests(data);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load queue data');
    } finally {
      setLoading(false);
    }
  }, [client, session]);

  useEffect(() => {
    loadData().catch(() => {});
  }, [loadData]);

  const nowIso = useMemo(() => new Date().toISOString(), []);
  const stateCounts = useMemo(() => computeStateCounts(requests), [requests]);
  const healthSummary = useMemo(() => computeQueueHealthSummary(requests, nowIso), [requests, nowIso]);
  const bottlenecks = useMemo(() => detectBottlenecks(requests, nowIso), [requests, nowIso]);

  // Session loading guard
  if (!session) {
    return (
      <WorkspacePageShell layout="list" title="Loading..." isLoading>
        {null}
      </WorkspacePageShell>
    );
  }

  // Full load error
  if (loadError && requests.length === 0 && !loading) {
    return (
      <WorkspacePageShell
        layout="list"
        title="Operational Dashboards"
        isError
        errorMessage={loadError}
        onRetry={() => {
          setLoadError(null);
          loadData().catch(() => {});
        }}
      >
        {null}
      </WorkspacePageShell>
    );
  }

  return (
    <WorkspacePageShell layout="list" title="Operational Dashboards">
      {/* ── Queue Health Summary (all admins) ────────────────────────── */}
      <HbcTypography intent="heading2">Queue Health Summary</HbcTypography>
      <div className={styles.summaryRow}>
        <HbcCard className={styles.summaryCard}>
          <HbcTypography intent="label">Active Requests</HbcTypography>
          <HbcTypography intent="heading1">{healthSummary.activeCount}</HbcTypography>
        </HbcCard>
        <HbcCard className={styles.summaryCard}>
          <HbcTypography intent="label">Needs Attention</HbcTypography>
          <HbcTypography intent="heading1">{healthSummary.needsAttentionCount}</HbcTypography>
        </HbcCard>
        <HbcCard className={styles.summaryCard}>
          <HbcTypography intent="label">Completed (7d)</HbcTypography>
          <HbcTypography intent="heading1">{healthSummary.completedRecentCount}</HbcTypography>
        </HbcCard>
        <HbcCard className={styles.summaryCard}>
          <HbcTypography intent="label">Overall Health</HbcTypography>
          <HbcStatusBadge
            variant={healthSummary.overallHealth === 'healthy' ? 'completed' : 'warning'}
            label={healthSummary.overallHealth === 'healthy' ? 'Healthy' : 'Degraded'}
          />
        </HbcCard>
      </div>

      {/* ── G6-T05: Healthy state guidance ─────────────────────────────── */}
      {healthSummary.overallHealth === 'healthy' && bottlenecks.length === 0 && (
        <HbcCoachingCallout message="No active failures or stuck workflows. All systems operating normally." />
      )}

      {/* ── Bottleneck Indicators ─────────────────────────────────────── */}
      {bottlenecks.length > 0 && (
        <div className={styles.bottleneckRow}>
          {bottlenecks.map((b) => (
            <HbcBanner key={`${b.state}-${b.type}`} variant={b.type === 'count' ? 'error' : 'warning'}>
              {b.message}
            </HbcBanner>
          ))}
        </div>
      )}

      {/* ── Queue Overview by State ───────────────────────────────────── */}
      <HbcTypography intent="heading2">Queue Overview</HbcTypography>
      {requests.length === 0 && !loading ? (
        <HbcEmptyState
          title="No provisioning requests"
          description="Provisioning requests will appear here once submitted."
        />
      ) : (
        <div className={styles.stateGrid}>
          {(Object.entries(stateCounts) as [ProjectSetupRequestState, number][]).map(
            ([state, count]) => (
              <HbcCard key={state} className={styles.stateCard}>
                <HbcStatusBadge variant={stateToVariant(state)} label={STATE_LABELS[state]} size="small" />
                <HbcTypography intent="heading3">{count}</HbcTypography>
              </HbcCard>
            ),
          )}
        </div>
      )}

      {/* ── Alert Dashboard (technical admin only) ────────────────────── */}
      <PermissionGate action={ADMIN_PROVISIONING_ALERT_FULL_DETAIL}>
        <div className={styles.section}>
          <HbcTypography intent="heading2">Alert Dashboard</HbcTypography>
          <HbcBanner variant="info">
            Wave 0: alerts are in-memory only and do not persist across page reloads.
          </HbcBanner>
          <HbcCoachingCallout
            message="Alert thresholds are documented in the Provisioning Runbook."
            actionLabel="Alert Thresholds"
            onAction={() => window.open(RUNBOOK_LINKS.ALERT_THRESHOLDS, '_blank')}
          />
          <AdminAlertDashboard />
        </div>
      </PermissionGate>

      {/* ── Infrastructure Truth (technical admin only) ────────────────── */}
      <PermissionGate action={ADMIN_PROVISIONING_ALERT_FULL_DETAIL}>
        <div className={styles.section}>
          <HbcTypography intent="heading2">Infrastructure Health</HbcTypography>
          <HbcBanner variant="info">
            Probe data is stub until T06 implements live connections.
          </HbcBanner>
          <HbcCoachingCallout
            message="Run probes manually to check current infrastructure health. Results are cached for 30 minutes."
            actionLabel="KQL Queries"
            onAction={() => window.open(RUNBOOK_LINKS.KQL_QUERIES, '_blank')}
          />
          <ImplementationTruthDashboard />
        </div>
      </PermissionGate>
    </WorkspacePageShell>
  );
}
