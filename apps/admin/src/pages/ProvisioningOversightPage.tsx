import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import {
  useCurrentSession,
  PermissionGate,
  ADMIN_PROVISIONING_RETRY,
  ADMIN_PROVISIONING_ESCALATE,
  ADMIN_PROVISIONING_ARCHIVE,
  ADMIN_PROVISIONING_FORCE_STATE,
} from '@hbc/auth';
import { HbcComplexityDial, HbcComplexityGate } from '@hbc/complexity';
import type { IProvisioningStatus, ISagaStepResult } from '@hbc/models';
import { createProvisioningApiClient } from '@hbc/provisioning';
import {
  HbcBanner,
  HbcButton,
  HbcCard,
  HbcConfirmDialog,
  HbcDataTable,
  HbcEmptyState,
  HbcModal,
  HbcSelect,
  HbcStatusBadge,
  HbcTabs,
  HbcTypography,
  WorkspacePageShell,
  useToast,
} from '@hbc/ui-kit';
import type { ColumnDef, LayoutTab } from '@hbc/ui-kit';
import { AdminAlertBadge, computeAlertBadge } from '@hbc/features-admin';
import type { IAdminAlertBadge } from '@hbc/features-admin';
import { resolveSessionToken } from '../utils/resolveSessionToken.js';
import {
  FAILURE_CLASS_LABELS,
  FAILURE_CLASS_DESCRIPTIONS,
  FAILURE_CLASS_BADGE_VARIANT,
  getFailedStep,
} from '../utils/failureClassification.js';
import {
  PROVISIONING_STATUS_LABELS,
  PROVISIONING_STATUS_VALUES,
  getProvisioningStatusVariant,
  isStuckInTransitional,
  ACTIVE_STATUS_VALUES,
} from '../utils/provisioningStatusHelpers.js';

type FilterTabId = 'active' | 'failures' | 'completed' | 'all';

const FILTER_TABS: LayoutTab[] = [
  { id: 'active', label: 'Active Runs' },
  { id: 'failures', label: 'Failures' },
  { id: 'completed', label: 'Completed' },
  { id: 'all', label: 'All' },
];

/** G6-T01: Retry ceiling per provisioning-runbook.md alert thresholds. */
const MAX_RETRY_ATTEMPTS = 3;

const useStyles = makeStyles({
  actionRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  modalFooter: { display: 'flex', gap: '8px', justifyContent: 'flex-end' },
  badgeRow: { display: 'flex', gap: '4px', alignItems: 'center' },
  stepTable: { marginTop: '12px' },
  diagnosticBlock: { fontFamily: 'monospace', fontSize: '12px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' },
  overrideSection: { marginTop: '16px', display: 'flex', gap: '8px', alignItems: 'flex-end' },
});

/**
 * W0-G4-T04: Admin provisioning oversight page — expanded from ProvisioningFailuresPage.
 * Shows all provisioning runs (active, failed, completed) with state filter tabs.
 * Provides admin-exclusive actions: force retry, archive, escalation acknowledgment,
 * and expert-tier manual state override.
 * W0-G4-T07: Session guard, load-error via shell, dismissible error banners.
 *
 * Traceability: docs/architecture/plans/MVP/G4/W0-G4-T04 §5.2
 */
export function ProvisioningOversightPage(): ReactNode {
  const styles = useStyles();
  const session = useCurrentSession();
  const { toast } = useToast();

  const [allRuns, setAllRuns] = useState<IProvisioningStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('failures');
  const [selectedRun, setSelectedRun] = useState<IProvisioningStatus | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeActionByProjectId, setActiveActionByProjectId] = useState<Record<string, string>>({});

  // Confirmation dialog state
  const [confirmAction, setConfirmAction] = useState<{
    type: 'forceRetry' | 'archive' | 'stateOverride';
    projectId: string;
    targetState?: string;
  } | null>(null);

  // State override select state
  const [overrideTarget, setOverrideTarget] = useState<string>('');

  // G6-T01: Alert badge (stub data acceptable; T04 will wire live monitors)
  const [alertBadge] = useState<IAdminAlertBadge>(() => computeAlertBadge([]));

  const authToken = useMemo(() => resolveSessionToken(session), [session]);
  const functionAppUrl = (import.meta.env as Record<string, string | undefined>).VITE_FUNCTION_APP_URL ?? '';
  const client = useMemo(
    () => createProvisioningApiClient(functionAppUrl, async () => authToken),
    [authToken, functionAppUrl],
  );

  // ── Data loading ────────────────────────────────────────────────────────
  const loadRuns = useCallback(async (): Promise<void> => {
    if (!session) return;
    setLoading(true);
    setLoadError(null);
    try {
      const runs = await client.listProvisioningRuns();
      setAllRuns(runs);
    } catch {
      // Fallback: if listProvisioningRuns is not yet available on backend,
      // fall back to listFailedRuns for the failures tab.
      try {
        const failedRuns = await client.listFailedRuns();
        setAllRuns(failedRuns);
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : 'Failed to load provisioning runs');
      }
    } finally {
      setLoading(false);
    }
  }, [client, session]);

  useEffect(() => {
    loadRuns().catch(() => {});
  }, [loadRuns]);

  // ── ?projectId= query param handling ────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('projectId');
    if (projectId && allRuns.length > 0) {
      const match = allRuns.find((r) => r.projectId === projectId);
      if (match) setSelectedRun(match);
    }
  }, [allRuns]);

  // ── Tab filtering ───────────────────────────────────────────────────────
  const filteredRuns = useMemo(() => {
    const tabId = activeTab as FilterTabId;
    switch (tabId) {
      case 'active':
        return allRuns.filter((r) => ACTIVE_STATUS_VALUES.has(r.overallStatus));
      case 'failures':
        return allRuns.filter((r) => r.overallStatus === 'Failed');
      case 'completed':
        return allRuns
          .filter((r) => r.overallStatus === 'Completed')
          .sort((a, b) => new Date(b.completedAt ?? 0).getTime() - new Date(a.completedAt ?? 0).getTime())
          .slice(0, 50);
      case 'all':
      default:
        return allRuns;
    }
  }, [allRuns, activeTab]);

  // ── Action helpers ──────────────────────────────────────────────────────
  const runAction = useCallback(
    async (projectId: string, actionLabel: string, action: () => Promise<void>, successMsg: string) => {
      setActiveActionByProjectId((prev) => ({ ...prev, [projectId]: actionLabel }));
      setActionLoading(true);
      setError(null);
      try {
        await action();
        await loadRuns();
        toast.success(successMsg);
      } catch (err) {
        setError(err instanceof Error ? err.message : `${actionLabel} failed`);
      } finally {
        setActiveActionByProjectId((prev) => {
          const next = { ...prev };
          delete next[projectId];
          return next;
        });
        setActionLoading(false);
      }
    },
    [loadRuns, toast],
  );

  const handleForceRetry = useCallback(() => {
    if (!confirmAction || confirmAction.type !== 'forceRetry') return;
    const { projectId } = confirmAction;
    setConfirmAction(null);
    runAction(projectId, 'Retrying', () => client.retryProvisioning(projectId), 'Force retry initiated.');
  }, [confirmAction, client, runAction]);

  const handleArchive = useCallback(() => {
    if (!confirmAction || confirmAction.type !== 'archive') return;
    const { projectId } = confirmAction;
    setConfirmAction(null);
    runAction(projectId, 'Archiving', () => client.archiveFailure(projectId), 'Failure archived.');
  }, [confirmAction, client, runAction]);

  const handleAcknowledgeEscalation = useCallback(
    (projectId: string) => {
      runAction(projectId, 'Acknowledging', () => client.acknowledgeEscalation(projectId), 'Escalation acknowledged.');
    },
    [client, runAction],
  );

  const handleStateOverride = useCallback(() => {
    if (!confirmAction || confirmAction.type !== 'stateOverride' || !confirmAction.targetState) return;
    const { projectId, targetState } = confirmAction;
    setConfirmAction(null);
    setOverrideTarget('');
    runAction(
      projectId,
      'Overriding',
      () => client.forceStateTransition(projectId, targetState),
      `State overridden to ${targetState}.`,
    );
  }, [confirmAction, client, runAction]);

  // ── Queue columns ──────────────────────────────────────────────────────
  const columns = useMemo<ColumnDef<IProvisioningStatus, unknown>[]>(
    () => [
      { accessorKey: 'projectNumber', header: 'Project #' },
      { accessorKey: 'projectName', header: 'Project Name' },
      {
        id: 'overallStatus',
        header: 'Status',
        cell: ({ row }) => {
          const run = row.original;
          return (
            <div className={styles.badgeRow}>
              <HbcStatusBadge
                variant={getProvisioningStatusVariant(run)}
                label={PROVISIONING_STATUS_LABELS[run.overallStatus]}
                size="small"
              />
              {run.escalatedBy && (
                <HbcStatusBadge variant="warning" label="Escalated" size="small" />
              )}
            </div>
          );
        },
      },
      {
        id: 'failureClass',
        header: 'Failure Class',
        cell: ({ row }) => {
          const fc = row.original.failureClass;
          if (!fc) return '—';
          return (
            <HbcStatusBadge
              variant={FAILURE_CLASS_BADGE_VARIANT[fc]}
              label={FAILURE_CLASS_LABELS[fc]}
              size="small"
            />
          );
        },
      },
      {
        id: 'currentStep',
        header: 'Current Step',
        cell: ({ row }) => {
          const run = row.original;
          if (run.overallStatus === 'Failed') {
            const failed = getFailedStep(run);
            return failed ? `Step ${failed.stepNumber}: ${failed.stepName}` : '—';
          }
          const current = run.steps.find((s) => s.status === 'InProgress');
          if (current) return `Step ${current.stepNumber}: ${current.stepName}`;
          return `Step ${run.currentStep}`;
        },
      },
      { accessorKey: 'triggeredBy', header: 'Triggered By' },
      {
        id: 'startedAt',
        header: 'Started',
        cell: ({ row }) => new Date(row.original.startedAt).toLocaleString(),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const run = row.original;
          const isBusy = Boolean(activeActionByProjectId[run.projectId]);
          const retryExhausted = run.retryCount >= MAX_RETRY_ATTEMPTS;
          return (
            <div className={styles.actionRow}>
              <HbcButton size="sm" variant="secondary" onClick={() => setSelectedRun(run)}>
                Details
              </HbcButton>
              {run.overallStatus === 'Failed' && (
                <>
                  {/* G6-T01: Retry gated by permission + retry threshold */}
                  <PermissionGate action={ADMIN_PROVISIONING_RETRY}>
                    <HbcButton
                      size="sm"
                      disabled={isBusy || retryExhausted}
                      onClick={() => setConfirmAction({ type: 'forceRetry', projectId: run.projectId })}
                    >
                      {activeActionByProjectId[run.projectId] === 'Retrying'
                        ? 'Retrying…'
                        : `Retry (${run.retryCount}/${MAX_RETRY_ATTEMPTS})`}
                    </HbcButton>
                  </PermissionGate>
                  {/* G6-T01: Archive gated by permission */}
                  <PermissionGate action={ADMIN_PROVISIONING_ARCHIVE}>
                    <HbcButton
                      size="sm"
                      variant="secondary"
                      disabled={isBusy}
                      onClick={() => setConfirmAction({ type: 'archive', projectId: run.projectId })}
                    >
                      {activeActionByProjectId[run.projectId] === 'Archiving' ? 'Archiving…' : 'Archive'}
                    </HbcButton>
                  </PermissionGate>
                </>
              )}
              {run.escalatedBy && (
                /* G6-T01: Escalation ack gated by permission */
                <PermissionGate action={ADMIN_PROVISIONING_ESCALATE}>
                  <HbcButton
                    size="sm"
                    variant="secondary"
                    disabled={isBusy}
                    onClick={() => handleAcknowledgeEscalation(run.projectId)}
                  >
                    {activeActionByProjectId[run.projectId] === 'Acknowledging' ? 'Acknowledging…' : 'Ack Escalation'}
                  </HbcButton>
                </PermissionGate>
              )}
            </div>
          );
        },
      },
    ],
    [activeActionByProjectId, styles, handleAcknowledgeEscalation],
  );

  // ── Step detail columns for modal ──────────────────────────────────────
  const stepColumns = useMemo<ColumnDef<ISagaStepResult, unknown>[]>(
    () => [
      { accessorKey: 'stepNumber', header: '#' },
      { accessorKey: 'stepName', header: 'Step' },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const s = row.original.status;
          const variant: Record<string, string> = {
            Completed: 'completed',
            Failed: 'error',
            InProgress: 'inProgress',
            Skipped: 'neutral',
            DeferredToTimer: 'warning',
            NotStarted: 'neutral',
          };
          return <HbcStatusBadge variant={(variant[s] ?? 'neutral') as 'error'} label={s} size="small" />;
        },
      },
      {
        id: 'startedAt',
        header: 'Started',
        cell: ({ row }) => (row.original.startedAt ? new Date(row.original.startedAt).toLocaleString() : '—'),
      },
      {
        id: 'duration',
        header: 'Duration',
        cell: ({ row }) => {
          const s = row.original;
          if (!s.startedAt || !s.completedAt) return '—';
          const ms = new Date(s.completedAt).getTime() - new Date(s.startedAt).getTime();
          return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
        },
      },
    ],
    [],
  );

  // W0-G4-T07: Session loading guard (after all hooks)
  if (!session) {
    return (
      <WorkspacePageShell layout="list" title="Loading..." isLoading>
        {null}
      </WorkspacePageShell>
    );
  }

  // W0-G4-T07: Full load error — no data at all
  if (loadError && allRuns.length === 0 && !loading) {
    return (
      <WorkspacePageShell
        layout="list"
        title="Provisioning Oversight"
        isError
        errorMessage={loadError}
        onRetry={() => { setLoadError(null); loadRuns().catch(() => {}); }}
      >
        {null}
      </WorkspacePageShell>
    );
  }

  return (
    <WorkspacePageShell layout="list" title="Provisioning Oversight">
      {/* W0-G4-T06: Complexity dial for tier selection */}
      <HbcComplexityDial variant="header" />

      {/* G6-T01: Alert badge — stub data until T04 wires live monitors */}
      <AdminAlertBadge badge={alertBadge} onOpenDashboard={() => {/* T04 will wire dashboard navigation */}} />

      {/* W0-G4-T07: Dismissible action error banner */}
      {error && (
        <HbcBanner variant="error" onDismiss={() => setError(null)}>
          {error}
        </HbcBanner>
      )}

      <HbcTabs tabs={FILTER_TABS} activeTabId={activeTab} onTabChange={setActiveTab} />

      {filteredRuns.length === 0 && !loading ? (
        <HbcEmptyState
          title={activeTab === 'failures' ? 'No failed provisioning runs' : 'No provisioning runs'}
          description={activeTab === 'failures'
            ? 'Failed runs will appear here with recovery actions.'
            : 'Provisioning runs matching this filter will appear here.'}
        />
      ) : (
        <HbcDataTable<IProvisioningStatus>
          data={filteredRuns}
          columns={columns}
          enableSorting
          enablePagination
          pageSize={25}
          height="600px"
          isLoading={loading}
        />
      )}

      {/* ── Force Retry Confirmation ──────────────────────────────────── */}
      <HbcConfirmDialog
        open={confirmAction?.type === 'forceRetry'}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleForceRetry}
        title="Force Retry"
        description={(() => {
          const retryRun = confirmAction ? allRuns.find((r) => r.projectId === confirmAction.projectId) : undefined;
          const attempt = (retryRun?.retryCount ?? 0) + 1;
          return `This is retry attempt ${attempt} of ${MAX_RETRY_ATTEMPTS}. Force-retrying a structural or permissions failure may produce duplicate partial state if the failed step was not idempotent. Confirm only if you have investigated the failure cause.`;
        })()}
        confirmLabel="Force Retry"
        variant="danger"
        loading={actionLoading}
      />

      {/* ── Archive Confirmation ──────────────────────────────────────── */}
      <HbcConfirmDialog
        open={confirmAction?.type === 'archive'}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleArchive}
        title="Archive Failure"
        description="Archive this failure? The request will be removed from the active failures queue."
        confirmLabel="Archive"
        variant="warning"
        loading={actionLoading}
      />

      {/* ── State Override Confirmation ───────────────────────────────── */}
      <HbcConfirmDialog
        open={confirmAction?.type === 'stateOverride'}
        onClose={() => { setConfirmAction(null); setOverrideTarget(''); }}
        onConfirm={handleStateOverride}
        title="Manual State Override"
        description={`Manually overriding the provisioning state is a last-resort recovery action. This may cause data inconsistency if the saga has partially completed steps. Target state: ${confirmAction?.targetState ?? ''}. Confirm only after investigation.`}
        confirmLabel="Override State"
        variant="danger"
        loading={actionLoading}
      />

      {/* ── Detail Modal ─────────────────────────────────────────────── */}
      <HbcModal
        open={selectedRun !== null}
        onClose={() => setSelectedRun(null)}
        title={selectedRun ? `${selectedRun.projectName} — Provisioning Detail` : ''}
        size="lg"
        footer={
          <div className={styles.modalFooter}>
            <HbcButton variant="secondary" onClick={() => setSelectedRun(null)}>Close</HbcButton>
          </div>
        }
      >
        {selectedRun && (
          <ProvisioningDetailContent
            run={selectedRun}
            stepColumns={stepColumns}
            styles={styles}
            overrideTarget={overrideTarget}
            onOverrideTargetChange={setOverrideTarget}
            onConfirmOverride={(projectId, targetState) =>
              setConfirmAction({ type: 'stateOverride', projectId, targetState })
            }
          />
        )}
      </HbcModal>
    </WorkspacePageShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Detail content component (extracted to avoid hook rules issues in modal)
// ─────────────────────────────────────────────────────────────────────────────

interface ProvisioningDetailContentProps {
  run: IProvisioningStatus;
  stepColumns: ColumnDef<ISagaStepResult, unknown>[];
  styles: ReturnType<typeof useStyles>;
  overrideTarget: string;
  onOverrideTargetChange: (value: string) => void;
  onConfirmOverride: (projectId: string, targetState: string) => void;
}

function ProvisioningDetailContent({
  run,
  stepColumns,
  styles,
  overrideTarget,
  onOverrideTargetChange,
  onConfirmOverride,
}: ProvisioningDetailContentProps): ReactNode {
  const failedStep = run.overallStatus === 'Failed' ? getFailedStep(run) : undefined;

  return (
    <>
      {/* ── Essential tier: Core summary ──────────────────────────────── */}
      <div className={styles.badgeRow}>
        <HbcStatusBadge
          variant={getProvisioningStatusVariant(run)}
          label={PROVISIONING_STATUS_LABELS[run.overallStatus]}
        />
        {run.escalatedBy && <HbcStatusBadge variant="warning" label="Escalated" />}
      </div>

      <HbcCard>
        <p><strong>Project #:</strong> {run.projectNumber}</p>
        <p><strong>Project Name:</strong> {run.projectName}</p>
        <p><strong>Triggered By:</strong> {run.triggeredBy}</p>
        <p><strong>Submitted By:</strong> {run.submittedBy}</p>
        <p><strong>Started:</strong> {new Date(run.startedAt).toLocaleString()}</p>
        {run.completedAt && <p><strong>Completed:</strong> {new Date(run.completedAt).toLocaleString()}</p>}
        {run.failedAt && <p><strong>Failed:</strong> {new Date(run.failedAt).toLocaleString()}</p>}
        <p><strong>Retry Count:</strong> {run.retryCount}</p>
        {run.lastRetryAt && <p><strong>Last Retry:</strong> {new Date(run.lastRetryAt).toLocaleString()}</p>}
        {run.escalatedBy && <p><strong>Escalated By:</strong> {run.escalatedBy}</p>}
        {run.escalatedAt && <p><strong>Escalated At:</strong> {new Date(run.escalatedAt).toLocaleString()}</p>}
        {run.siteUrl && <p><strong>Site URL:</strong> <a href={run.siteUrl} target="_blank" rel="noopener noreferrer">{run.siteUrl}</a></p>}
      </HbcCard>

      {/* ── Failure classification ────────────────────────────────────── */}
      {run.failureClass && (
        <HbcCard>
          <HbcTypography intent="heading3">Failure Classification</HbcTypography>
          <HbcStatusBadge
            variant={FAILURE_CLASS_BADGE_VARIANT[run.failureClass]}
            label={FAILURE_CLASS_LABELS[run.failureClass]}
          />
          <p>{FAILURE_CLASS_DESCRIPTIONS[run.failureClass]}</p>
          {failedStep && (
            <p><strong>Failed at:</strong> Step {failedStep.stepNumber}: {failedStep.stepName}</p>
          )}
        </HbcCard>
      )}

      {/* ── Standard tier: Full step log ──────────────────────────────── */}
      <HbcComplexityGate minTier="standard">
        <HbcCard>
          <HbcTypography intent="heading3">Provisioning Steps</HbcTypography>
          <div className={styles.stepTable}>
            <HbcDataTable<ISagaStepResult>
              data={run.steps}
              columns={stepColumns}
              height="300px"
            />
          </div>
        </HbcCard>
      </HbcComplexityGate>

      {/* ── Expert tier: Diagnostic detail ────────────────────────────── */}
      <HbcComplexityGate minTier="expert">
        {/* Step error messages */}
        {run.steps.some((s) => s.errorMessage) && (
          <HbcCard>
            <HbcTypography intent="heading3">Error Details</HbcTypography>
            {run.steps
              .filter((s) => s.errorMessage)
              .map((s) => (
                <div key={s.stepNumber}>
                  <HbcTypography intent="label">Step {s.stepNumber}: {s.stepName}</HbcTypography>
                  <pre className={styles.diagnosticBlock}>{s.errorMessage}</pre>
                </div>
              ))}
          </HbcCard>
        )}

        {/* Step metadata */}
        {run.steps.some((s) => s.metadata && Object.keys(s.metadata).length > 0) && (
          <HbcCard>
            <HbcTypography intent="heading3">Step Metadata</HbcTypography>
            {run.steps
              .filter((s) => s.metadata && Object.keys(s.metadata).length > 0)
              .map((s) => (
                <div key={s.stepNumber}>
                  <HbcTypography intent="label">Step {s.stepNumber}: {s.stepName}</HbcTypography>
                  <pre className={styles.diagnosticBlock}>{JSON.stringify(s.metadata, null, 2)}</pre>
                </div>
              ))}
          </HbcCard>
        )}

        {/* Entra ID group IDs */}
        {run.entraGroups && (
          <HbcCard>
            <HbcTypography intent="heading3">Entra ID Groups</HbcTypography>
            <p><strong>Leaders Group:</strong> <code>{run.entraGroups.leadersGroupId}</code></p>
            <p><strong>Team Group:</strong> <code>{run.entraGroups.teamGroupId}</code></p>
            <p><strong>Viewers Group:</strong> <code>{run.entraGroups.viewersGroupId}</code></p>
          </HbcCard>
        )}

        {/* Correlation and internal IDs */}
        <HbcCard>
          <HbcTypography intent="heading3">Internal Identifiers</HbcTypography>
          <p><strong>Project ID:</strong> <code>{run.projectId}</code></p>
          <p><strong>Correlation ID:</strong> <code>{run.correlationId}</code></p>
          {run.step5DeferredToTimer && (
            <p><strong>Step 5 Deferred:</strong> Yes (timer retry count: {run.step5TimerRetryCount})</p>
          )}
        </HbcCard>

        {/* G6-T01: Manual state override — expert-tier + permission-gated */}
        <PermissionGate action={ADMIN_PROVISIONING_FORCE_STATE}>
          {isStuckInTransitional(run) && (
            <HbcCard>
              <HbcTypography intent="heading3">Manual State Override</HbcTypography>
              <HbcBanner variant="warning">
                This is a last-resort recovery action. Only use if the provisioning saga is stuck and cannot recover automatically.
              </HbcBanner>
              <div className={styles.overrideSection}>
                <HbcSelect
                  label="Target State"
                  value={overrideTarget}
                  onChange={onOverrideTargetChange}
                  placeholder="Select target state…"
                  options={PROVISIONING_STATUS_VALUES
                    .filter((s) => s !== run.overallStatus)
                    .map((s) => ({ value: s, label: PROVISIONING_STATUS_LABELS[s] }))}
                />
                <HbcButton
                  variant="primary"
                  disabled={!overrideTarget}
                  onClick={() => onConfirmOverride(run.projectId, overrideTarget)}
                >
                  Override State
                </HbcButton>
              </div>
            </HbcCard>
          )}
        </PermissionGate>
      </HbcComplexityGate>
    </>
  );
}
