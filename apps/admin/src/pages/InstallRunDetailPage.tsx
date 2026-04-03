import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import { useCurrentSession } from '@hbc/auth';
import {
  HbcButton,
  HbcCard,
  HbcStatusBadge,
  HbcTextArea,
  HbcTypography,
  HBC_SPACE_MD,
  HBC_SPACE_SM,
  HBC_SPACE_LG,
  WorkspacePageShell,
} from '@hbc/ui-kit';
import type { StatusVariant } from '@hbc/ui-kit';
import { AdminRunStatus, AdminStepStatus } from '@hbc/models';
import type {
  IAdminRunEnvelope,
  IAdminStepResult,
  IAdminPostRunValidationSummary,
  IAdminPostRunValidationCheck,
} from '@hbc/models';
import { createSessionTokenFactory } from '../utils/resolveSessionToken.js';

/**
 * P6-09: Install run detail page — step progress, checkpoint handling,
 * and post-install verification review.
 *
 * Polls GET /api/admin/runs/{runId} to track progress.
 * Checkpoint actions call POST /api/admin/runs/{runId}/checkpoint.
 * Verification calls a backend verification endpoint.
 *
 * Props: runId passed via route search params.
 */

const POLL_INTERVAL_MS = 5_000;

const useStyles = makeStyles({
  section: { marginBottom: `${HBC_SPACE_LG}px` },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_MD}px`,
    marginBottom: `${HBC_SPACE_MD}px`,
  },
  stepRow: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
    paddingTop: `${HBC_SPACE_SM}px`,
    paddingBottom: `${HBC_SPACE_SM}px`,
  },
  stepLabel: { flex: '1' },
  actions: {
    display: 'flex',
    gap: `${HBC_SPACE_MD}px`,
    marginTop: `${HBC_SPACE_MD}px`,
    marginBottom: `${HBC_SPACE_MD}px`,
  },
  cardPad: {
    paddingLeft: `${HBC_SPACE_MD}px`,
    paddingRight: `${HBC_SPACE_MD}px`,
    paddingTop: `${HBC_SPACE_MD}px`,
    paddingBottom: `${HBC_SPACE_MD}px`,
  },
  commentInput: {
    marginTop: `${HBC_SPACE_SM}px`,
    marginBottom: `${HBC_SPACE_SM}px`,
  },
  verifyRow: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
    paddingTop: `${HBC_SPACE_SM}px`,
    paddingBottom: `${HBC_SPACE_SM}px`,
  },
});

function runStatusVariant(status: AdminRunStatus): StatusVariant {
  switch (status) {
    case AdminRunStatus.Completed: return 'success';
    case AdminRunStatus.Running:
    case AdminRunStatus.Validating: return 'inProgress';
    case AdminRunStatus.AwaitingApproval: return 'warning';
    case AdminRunStatus.Failed: return 'error';
    case AdminRunStatus.Cancelled: return 'neutral';
    case AdminRunStatus.Pending: return 'pending';
    default: return 'info';
  }
}

function stepStatusVariant(status: AdminStepStatus): StatusVariant {
  switch (status) {
    case AdminStepStatus.Completed: return 'success';
    case AdminStepStatus.Running: return 'inProgress';
    case AdminStepStatus.AwaitingApproval: return 'warning';
    case AdminStepStatus.Failed: return 'error';
    case AdminStepStatus.Skipped: return 'neutral';
    case AdminStepStatus.Pending: return 'pending';
    default: return 'info';
  }
}

function StepProgressList({ steps }: { readonly steps: readonly IAdminStepResult[] }): ReactNode {
  const styles = useStyles();
  return (
    <div className={styles.section}>
      <HbcTypography intent="heading3">Step Progress</HbcTypography>
      {steps.map((step) => (
        <div key={step.stepNumber} className={styles.stepRow}>
          <HbcStatusBadge
            variant={stepStatusVariant(step.status)}
            label={step.status}
            size="small"
          />
          <div className={styles.stepLabel}>
            <HbcTypography intent="body">
              {step.stepNumber}. {step.stepLabel}
            </HbcTypography>
            {step.errorMessage && (
              <HbcTypography intent="bodySmall">{step.errorMessage}</HbcTypography>
            )}
            {step.durationMs != null && (
              <HbcTypography intent="bodySmall">
                {step.durationMs < 1000 ? `${step.durationMs}ms` : `${(step.durationMs / 1000).toFixed(1)}s`}
              </HbcTypography>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function CheckpointPanel({
  run,
  onApprove,
  onReject,
  isSubmitting,
}: {
  readonly run: IAdminRunEnvelope;
  readonly onApprove: (comment: string) => void;
  readonly onReject: (comment: string) => void;
  readonly isSubmitting: boolean;
}): ReactNode {
  const styles = useStyles();
  const [comment, setComment] = useState('');

  const checkpointStep = run.steps.find((s) => s.status === AdminStepStatus.AwaitingApproval);
  if (!checkpointStep) return null;

  return (
    <HbcCard>
      <div className={styles.cardPad}>
        <HbcTypography intent="heading3">Checkpoint — Manual Action Required</HbcTypography>
        <HbcTypography intent="body">
          Step {checkpointStep.stepNumber}: {checkpointStep.stepLabel}
        </HbcTypography>
        <HbcTypography intent="bodySmall">
          Complete the required manual action in the external admin portal, then approve to continue
          or reject to stop the install.
        </HbcTypography>
        <HbcTextArea
          label="Comment"
          placeholder="Optional comment (required for reject)..."
          value={comment}
          onChange={(val) => setComment(val)}
          className={styles.commentInput}
        />
        <div className={styles.actions}>
          <HbcButton
            variant="primary"
            onClick={() => onApprove(comment)}
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            Approve & Resume
          </HbcButton>
          <HbcButton
            variant="danger"
            onClick={() => onReject(comment)}
            loading={isSubmitting}
            disabled={isSubmitting || !comment.trim()}
          >
            Reject
          </HbcButton>
        </div>
      </div>
    </HbcCard>
  );
}

function VerificationResults({
  summary,
}: {
  readonly summary: IAdminPostRunValidationSummary;
}): ReactNode {
  const styles = useStyles();
  return (
    <div className={styles.section}>
      <HbcTypography intent="heading3">Post-Install Verification</HbcTypography>
      <div className={styles.header}>
        <HbcStatusBadge
          variant={summary.outcomeAccepted ? 'success' : 'warning'}
          label={summary.outcomeAccepted ? 'All Passed' : 'Issues Detected'}
          size="medium"
        />
        <HbcTypography intent="body">{summary.comment}</HbcTypography>
      </div>
      {summary.checks.map((check: IAdminPostRunValidationCheck) => (
        <div key={check.checkId} className={styles.verifyRow}>
          <HbcStatusBadge
            variant={check.passed ? 'success' : 'error'}
            label={check.passed ? 'Pass' : 'Fail'}
            size="small"
          />
          <div>
            <HbcTypography intent="body">{check.label}</HbcTypography>
            <HbcTypography intent="bodySmall">{check.message}</HbcTypography>
          </div>
        </div>
      ))}
    </div>
  );
}

interface InstallRunDetailPageProps {
  readonly runId: string;
}

export function InstallRunDetailPage({ runId }: InstallRunDetailPageProps): ReactNode {
  const styles = useStyles();
  const session = useCurrentSession();
  const getToken = createSessionTokenFactory(() => session);

  const [run, setRun] = useState<IAdminRunEnvelope | null>(null);
  const [verification, setVerification] = useState<IAdminPostRunValidationSummary | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const backendUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BACKEND_URL) || '';

  // Poll run status
  const fetchRun = useCallback(async () => {
    if (!backendUrl || !runId) return;
    try {
      const token = await getToken();
      const res = await fetch(`${backendUrl}/api/admin/runs/${runId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRun(data.data ?? data);
      }
    } catch {
      // Silent polling failure — will retry
    }
  }, [backendUrl, runId, getToken]);

  useEffect(() => {
    fetchRun();
    const interval = setInterval(fetchRun, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchRun]);

  const submitCheckpointDecision = useCallback(async (decision: 'approve' | 'reject', comment: string) => {
    if (!backendUrl || !run) return;
    const checkpointStep = run.steps.find((s) => s.status === AdminStepStatus.AwaitingApproval);
    if (!checkpointStep) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch(`${backendUrl}/api/admin/runs/${runId}/checkpoint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          stepNumber: checkpointStep.stepNumber,
          decision,
          comment: comment || undefined,
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setError(`Checkpoint ${decision} failed: ${(errData as Record<string, string>).message ?? res.statusText}`);
      } else {
        await fetchRun();
      }
    } catch (err) {
      setError(`Checkpoint ${decision} failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [backendUrl, runId, run, getToken, fetchRun]);

  const runVerification = useCallback(async () => {
    if (!backendUrl) return;
    setError(null);
    try {
      const token = await getToken();
      // Verification uses the preflight endpoint with verify-only action key
      const res = await fetch(`${backendUrl}/api/admin/preflight`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          actionKey: 'setup-install:bootstrap:verify-only',
          commandInput: { runId },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const checks = (data.data?.checks ?? data.checks ?? []) as IAdminPostRunValidationCheck[];
        setVerification({
          runId,
          outcomeAccepted: checks.every((c: IAdminPostRunValidationCheck) => c.passed),
          checks,
          comment: checks.every((c: IAdminPostRunValidationCheck) => c.passed)
            ? 'All verification checks passed.'
            : `${checks.filter((c: IAdminPostRunValidationCheck) => !c.passed).length} checks failed.`,
          validatedAt: new Date().toISOString(),
          validatedBy: { upn: '', objectId: '', displayName: 'Current Operator', capturedAt: new Date().toISOString() },
        });
      }
    } catch (err) {
      setError(`Verification failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [backendUrl, runId, getToken]);

  if (!run) {
    return (
      <WorkspacePageShell layout="detail" title="Install Run">
        <HbcTypography intent="body">Loading run {runId}...</HbcTypography>
      </WorkspacePageShell>
    );
  }

  const isTerminal = [AdminRunStatus.Completed, AdminRunStatus.Failed, AdminRunStatus.Cancelled].includes(run.status);
  const isCheckpointed = run.status === AdminRunStatus.AwaitingApproval;
  const completedSteps = run.steps.filter((s) => s.status === AdminStepStatus.Completed).length;

  return (
    <WorkspacePageShell layout="detail" title={`Install Run — ${run.runId.slice(0, 8)}`}>
      <div className={styles.header}>
        <HbcStatusBadge variant={runStatusVariant(run.status)} label={run.status} size="medium" />
        <HbcTypography intent="body">
          {completedSteps} of {run.totalSteps} steps completed
        </HbcTypography>
      </div>

      {error && (
        <HbcCard>
          <div className={styles.cardPad}>
            <HbcStatusBadge variant="error" label="Error" size="small" />
            <HbcTypography intent="body">{error}</HbcTypography>
          </div>
        </HbcCard>
      )}

      {isCheckpointed && (
        <CheckpointPanel
          run={run}
          onApprove={(comment) => submitCheckpointDecision('approve', comment)}
          onReject={(comment) => submitCheckpointDecision('reject', comment)}
          isSubmitting={isSubmitting}
        />
      )}

      <StepProgressList steps={run.steps} />

      {run.failure && (
        <HbcCard>
          <div className={styles.cardPad}>
            <HbcTypography intent="heading3">Failure Details</HbcTypography>
            <HbcTypography intent="body">
              Failed at step {run.failure.failedAtStep}: {run.failure.failureMessage}
            </HbcTypography>
            <HbcTypography intent="bodySmall">
              Class: {run.failure.failureClass} | Retry eligible: {run.failure.retryEligible ? 'Yes' : 'No'}
            </HbcTypography>
          </div>
        </HbcCard>
      )}

      {isTerminal && run.status === AdminRunStatus.Completed && (
        <div className={styles.section}>
          <HbcButton variant="secondary" onClick={runVerification}>
            Run Post-Install Verification
          </HbcButton>
        </div>
      )}

      {verification && <VerificationResults summary={verification} />}
    </WorkspacePageShell>
  );
}
