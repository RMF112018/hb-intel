import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import { useCurrentSession } from '@hbc/auth';
import {
  HbcButton,
  HbcCard,
  HbcStatusBadge,
  HbcTypography,
  HbcTextField,
  HBC_SPACE_MD,
  HBC_SPACE_SM,
  HBC_SPACE_LG,
  HBC_STATUS_COLORS,
  WorkspacePageShell,
} from '@hbc/ui-kit';
import type {
  IAppBindingRecord,
  IAppBindingVerificationResult,
} from '@hbc/models';
import { AppBindingStatus } from '@hbc/models';
import { createSessionTokenFactory } from '../utils/resolveSessionToken.js';

/**
 * P6A-08: App-binding status and repair UX.
 *
 * Displays current binding posture for all managed apps, allows
 * operator-initiated verification and repair through backend APIs.
 * The backend remains the source of truth — this page is a
 * command-and-review surface only.
 */

const useStyles = makeStyles({
  section: {
    marginBottom: `${HBC_SPACE_LG}px`,
  },
  cardPadding: {
    paddingLeft: `${HBC_SPACE_MD}px`,
    paddingRight: `${HBC_SPACE_MD}px`,
    paddingTop: `${HBC_SPACE_MD}px`,
    paddingBottom: `${HBC_SPACE_MD}px`,
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_MD}px`,
    marginBottom: `${HBC_SPACE_SM}px`,
  },
  fieldRow: {
    display: 'flex',
    gap: `${HBC_SPACE_SM}px`,
    marginBottom: `${HBC_SPACE_SM}px`,
  },
  fieldLabel: {
    minWidth: `${HBC_SPACE_LG * 5}px`,
    fontWeight: 600,
  },
  actions: {
    display: 'flex',
    gap: `${HBC_SPACE_SM}px`,
    marginTop: `${HBC_SPACE_MD}px`,
  },
  repairForm: {
    marginTop: `${HBC_SPACE_MD}px`,
    display: 'flex',
    flexDirection: 'column',
    gap: `${HBC_SPACE_SM}px`,
  },
  findingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
    paddingTop: `${HBC_SPACE_SM}px`,
  },
  errorText: {
    color: HBC_STATUS_COLORS.error,
  },
});

type StatusVariant = 'success' | 'error' | 'warning' | 'inProgress' | 'neutral';

function bindingStatusVariant(status: AppBindingStatus): StatusVariant {
  switch (status) {
    case AppBindingStatus.Active: return 'success';
    case AppBindingStatus.Drifted: return 'error';
    case AppBindingStatus.Error: return 'error';
    case AppBindingStatus.PendingPublication: return 'inProgress';
    case AppBindingStatus.Superseded: return 'warning';
    case AppBindingStatus.NotConfigured: return 'neutral';
    default: return 'neutral';
  }
}

function formatTimestamp(iso: string | null): string {
  if (!iso) return 'Never';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

interface RepairFormState {
  readonly appId: string;
  readonly functionAppUrl: string;
  readonly apiAudience: string;
  readonly rationale: string;
}

function BindingCard({
  binding,
  onVerify,
  onRepair,
  isVerifying,
  isRepairing,
  verificationResult,
}: {
  readonly binding: IAppBindingRecord;
  readonly onVerify: (appId: string) => void;
  readonly onRepair: (appId: string) => void;
  readonly isVerifying: boolean;
  readonly isRepairing: boolean;
  readonly verificationResult: IAppBindingVerificationResult | null;
}): ReactNode {
  const styles = useStyles();

  return (
    <HbcCard>
      <div className={styles.cardPadding}>
        <div className={styles.cardHeader}>
          <HbcStatusBadge
            variant={bindingStatusVariant(binding.status)}
            label={binding.status}
            size="medium"
          />
          <HbcTypography intent="heading4">{binding.appId}</HbcTypography>
        </div>

        <div className={styles.fieldRow}>
          <span className={styles.fieldLabel}>Function App URL</span>
          <HbcTypography intent="body">{binding.functionAppUrl || '(empty)'}</HbcTypography>
        </div>
        <div className={styles.fieldRow}>
          <span className={styles.fieldLabel}>API Audience</span>
          <HbcTypography intent="body">{binding.apiAudience || '(empty)'}</HbcTypography>
        </div>
        <div className={styles.fieldRow}>
          <span className={styles.fieldLabel}>Backend Mode</span>
          <HbcTypography intent="body">{binding.backendMode}</HbcTypography>
        </div>
        <div className={styles.fieldRow}>
          <span className={styles.fieldLabel}>Version</span>
          <HbcTypography intent="body">v{binding.version}</HbcTypography>
        </div>
        <div className={styles.fieldRow}>
          <span className={styles.fieldLabel}>Published</span>
          <HbcTypography intent="bodySmall">
            {formatTimestamp(binding.publishedAt)} by {binding.publishedBy?.upn ?? 'unknown'}
          </HbcTypography>
        </div>
        <div className={styles.fieldRow}>
          <span className={styles.fieldLabel}>Last Verified</span>
          <HbcTypography intent="bodySmall">
            {formatTimestamp(binding.lastVerifiedAt)}
            {binding.lastVerificationResult && ` — ${binding.lastVerificationResult}`}
          </HbcTypography>
        </div>
        <div className={styles.fieldRow}>
          <span className={styles.fieldLabel}>Source</span>
          <HbcTypography intent="bodySmall">{binding.publishSource}</HbcTypography>
        </div>

        {verificationResult && verificationResult.findings.length > 0 && (
          <div className={styles.section}>
            <HbcTypography intent="heading4">
              Verification Findings ({verificationResult.findings.length})
            </HbcTypography>
            {verificationResult.findings.map((finding, i) => (
              <div key={i} className={styles.findingRow}>
                <HbcStatusBadge
                  variant={finding.severity === 'critical' ? 'error' : finding.severity === 'warning' ? 'warning' : 'neutral'}
                  label={finding.severity}
                  size="small"
                />
                <div>
                  <HbcTypography intent="body">{finding.field}: {finding.message}</HbcTypography>
                  <HbcTypography intent="bodySmall">
                    Expected: {finding.expected} | Observed: {finding.observed}
                  </HbcTypography>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className={styles.actions}>
          <HbcButton
            variant="secondary"
            onClick={() => onVerify(binding.appId)}
            disabled={isVerifying}
          >
            {isVerifying ? 'Verifying...' : 'Verify'}
          </HbcButton>
          <HbcButton
            variant="secondary"
            onClick={() => onRepair(binding.appId)}
            disabled={isRepairing}
          >
            Repair
          </HbcButton>
        </div>
      </div>
    </HbcCard>
  );
}

export function BindingStatusPage(): ReactNode {
  const styles = useStyles();
  const session = useCurrentSession();
  const getToken = createSessionTokenFactory(() => session);

  const [bindings, setBindings] = useState<IAppBindingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verifyingApp, setVerifyingApp] = useState<string | null>(null);
  const [repairingApp, setRepairingApp] = useState<string | null>(null);
  const [repairForm, setRepairForm] = useState<RepairFormState | null>(null);
  const [verificationResults, setVerificationResults] = useState<Record<string, IAppBindingVerificationResult>>({});

  const backendUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BACKEND_URL) || '';

  const loadBindings = useCallback(async () => {
    if (!backendUrl) return;
    setIsLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch(`${backendUrl}/api/admin/apps/bindings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setError(`Failed to load bindings: ${res.status} ${res.statusText}`);
        return;
      }
      const data = await res.json();
      setBindings(data.data ?? data ?? []);
    } catch (err) {
      setError(`Failed to load bindings: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  }, [backendUrl, getToken]);

  useEffect(() => {
    void loadBindings();
  }, [loadBindings]);

  const handleVerify = useCallback(async (appId: string) => {
    if (!backendUrl) return;
    setVerifyingApp(appId);
    try {
      const token = await getToken();
      const res = await fetch(`${backendUrl}/api/admin/apps/${appId}/binding/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        const result = data.data ?? data;
        setVerificationResults((prev) => ({ ...prev, [appId]: result }));
      }
      await loadBindings();
    } catch {
      // Non-critical — refresh bindings anyway
    } finally {
      setVerifyingApp(null);
    }
  }, [backendUrl, getToken, loadBindings]);

  const handleRepairOpen = useCallback((appId: string) => {
    const existing = bindings.find((b) => b.appId === appId);
    setRepairForm({
      appId,
      functionAppUrl: existing?.functionAppUrl ?? '',
      apiAudience: existing?.apiAudience ?? '',
      rationale: '',
    });
  }, [bindings]);

  const handleRepairSubmit = useCallback(async () => {
    if (!repairForm || !backendUrl) return;
    setRepairingApp(repairForm.appId);
    try {
      const token = await getToken();
      const res = await fetch(`${backendUrl}/api/admin/apps/${repairForm.appId}/binding/repair`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          functionAppUrl: repairForm.functionAppUrl || null,
          apiAudience: repairForm.apiAudience || null,
          rationale: repairForm.rationale || 'Manual repair from Admin UX',
        }),
      });
      if (!res.ok) {
        setError(`Repair failed: ${res.status} ${res.statusText}`);
      }
      setRepairForm(null);
      await loadBindings();
    } catch (err) {
      setError(`Repair failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setRepairingApp(null);
    }
  }, [repairForm, backendUrl, getToken, loadBindings]);

  return (
    <WorkspacePageShell layout="list" title="App Bindings" isLoading={isLoading}>
      <div className={styles.section}>
        <HbcTypography intent="body">
          Managed-app backend bindings published by the install/setup flow.
          Each target app resolves these values before making backend-dependent calls.
        </HbcTypography>
      </div>

      {error && (
        <div className={styles.section}>
          <HbcTypography intent="body" className={styles.errorText}>{error}</HbcTypography>
        </div>
      )}

      <div className={styles.actions}>
        <HbcButton variant="secondary" onClick={() => void loadBindings()} disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Refresh'}
        </HbcButton>
      </div>

      {!isLoading && bindings.length === 0 && !error && (
        <div className={styles.section}>
          <HbcCard>
            <div className={styles.cardPadding}>
              <HbcTypography intent="body">
                No bindings configured. Bindings are published automatically when an install/setup run completes.
              </HbcTypography>
            </div>
          </HbcCard>
        </div>
      )}

      {!isLoading && bindings.map((binding) => (
        <div key={binding.appId} className={styles.section}>
          <BindingCard
            binding={binding}
            onVerify={handleVerify}
            onRepair={handleRepairOpen}
            isVerifying={verifyingApp === binding.appId}
            isRepairing={repairingApp === binding.appId}
            verificationResult={verificationResults[binding.appId] ?? null}
          />
        </div>
      ))}

      {repairForm && (
        <div className={styles.section}>
          <HbcCard>
            <div className={styles.cardPadding}>
              <HbcTypography intent="heading4">Repair: {repairForm.appId}</HbcTypography>
              <div className={styles.repairForm}>
                <HbcTextField
                  label="Function App URL"
                  value={repairForm.functionAppUrl}
                  onChange={(value) => setRepairForm({ ...repairForm, functionAppUrl: value })}
                />
                <HbcTextField
                  label="API Audience"
                  value={repairForm.apiAudience}
                  onChange={(value) => setRepairForm({ ...repairForm, apiAudience: value })}
                />
                <HbcTextField
                  label="Rationale"
                  value={repairForm.rationale}
                  onChange={(value) => setRepairForm({ ...repairForm, rationale: value })}
                />
                <div className={styles.actions}>
                  <HbcButton
                    variant="primary"
                    onClick={() => void handleRepairSubmit()}
                    disabled={repairingApp === repairForm.appId}
                  >
                    {repairingApp === repairForm.appId ? 'Repairing...' : 'Submit Repair'}
                  </HbcButton>
                  <HbcButton variant="secondary" onClick={() => setRepairForm(null)}>
                    Cancel
                  </HbcButton>
                </div>
              </div>
            </div>
          </HbcCard>
        </div>
      )}
    </WorkspacePageShell>
  );
}
