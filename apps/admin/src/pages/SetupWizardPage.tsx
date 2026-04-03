import { useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import { useCurrentSession } from '@hbc/auth';
import {
  HbcButton,
  HbcCard,
  HbcStatusBadge,
  HbcTypography,
  HBC_SPACE_MD,
  HBC_SPACE_SM,
  HBC_SPACE_LG,
  WorkspacePageShell,
} from '@hbc/ui-kit';
import type {
  IAdminPreflightCheck,
  IAdminPreflightResponse,
  PreflightCategory,
} from '@hbc/models/admin-control-plane';
import { createSessionTokenFactory } from '../utils/resolveSessionToken.js';

/**
 * P6-08: Setup wizard — preflight review and install launch UX.
 *
 * This page replaces the SetupLanePage scaffold. It provides:
 * 1. A "Run Preflight" button that calls POST /api/admin/preflight
 * 2. Categorized preflight results with pass/fail/warning indicators
 * 3. An "Install" button gated on preflight readiness
 * 4. Clear visibility into what is automated vs checkpointed
 *
 * SPFx boundary: this page is a command-and-review surface only.
 * All validation and execution happens through backend APIs.
 */

const useStyles = makeStyles({
  section: {
    marginBottom: `${HBC_SPACE_LG}px`,
  },
  actions: {
    display: 'flex',
    gap: `${HBC_SPACE_MD}px`,
    marginBottom: `${HBC_SPACE_LG}px`,
  },
  categoryGroup: {
    marginBottom: `${HBC_SPACE_MD}px`,
  },
  categoryHeader: {
    marginBottom: `${HBC_SPACE_SM}px`,
  },
  checkRow: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
    paddingTop: `${HBC_SPACE_SM}px`,
    paddingBottom: `${HBC_SPACE_SM}px`,
  },
  checkDetail: {
    flex: '1',
  },
  recommendation: {
    paddingLeft: `${HBC_SPACE_LG}px`,
    paddingBottom: `${HBC_SPACE_SM}px`,
  },
  checkpointNotice: {
    marginTop: `${HBC_SPACE_MD}px`,
    marginBottom: `${HBC_SPACE_MD}px`,
  },
  cardPadding: {
    paddingLeft: `${HBC_SPACE_MD}px`,
    paddingRight: `${HBC_SPACE_MD}px`,
    paddingTop: `${HBC_SPACE_MD}px`,
    paddingBottom: `${HBC_SPACE_MD}px`,
  },
});

const CATEGORY_LABELS: Record<PreflightCategory, string> = {
  'backend-config': 'Backend Configuration',
  'auth-identity': 'Authentication & Identity',
  'sharepoint': 'SharePoint',
  'graph-entra': 'Graph & Entra',
  'persistence': 'Persistence',
  'install-compatibility': 'Install Compatibility',
};

function groupByCategory(checks: readonly IAdminPreflightCheck[]): Map<PreflightCategory, IAdminPreflightCheck[]> {
  const groups = new Map<PreflightCategory, IAdminPreflightCheck[]>();
  for (const check of checks) {
    const existing = groups.get(check.category) ?? [];
    existing.push(check);
    groups.set(check.category, existing);
  }
  return groups;
}

function CheckResultRow({ check }: { readonly check: IAdminPreflightCheck }): ReactNode {
  const styles = useStyles();
  const variant = check.passed ? 'success' : (check.blocking ? 'error' : 'warning');
  const label = check.passed ? 'Pass' : (check.blocking ? 'Fail' : 'Warning');

  return (
    <div>
      <div className={styles.checkRow}>
        <HbcStatusBadge variant={variant} label={label} size="small" />
        <div className={styles.checkDetail}>
          <HbcTypography intent="body">{check.label}</HbcTypography>
          <HbcTypography intent="bodySmall">{check.message}</HbcTypography>
        </div>
      </div>
      {!check.passed && check.recommendedAction && (
        <div className={styles.recommendation}>
          <HbcTypography intent="bodySmall">
            Recommended: {check.recommendedAction}
          </HbcTypography>
          {check.resolvableByCheckpoint && (
            <HbcTypography intent="bodySmall">
              This may be resolved during install via a manual checkpoint.
            </HbcTypography>
          )}
        </div>
      )}
    </div>
  );
}

function PreflightResults({ response }: { readonly response: IAdminPreflightResponse }): ReactNode {
  const styles = useStyles();
  const groups = groupByCategory(response.checks);
  const blockingFailures = response.checks.filter((c) => !c.passed && c.blocking).length;
  const warnings = response.checks.filter((c) => !c.passed && !c.blocking).length;

  return (
    <div className={styles.section}>
      <HbcCard>
        <div className={styles.cardPadding}>
          <div className={styles.checkRow}>
            <HbcStatusBadge
              variant={response.ready ? 'success' : 'error'}
              label={response.ready ? 'Ready to Install' : 'Not Ready'}
              size="medium"
            />
            <HbcTypography intent="body">
              {response.checks.filter((c) => c.passed).length} of {response.checks.length} checks passed
              {blockingFailures > 0 && ` — ${blockingFailures} blocking`}
              {warnings > 0 && ` — ${warnings} warnings`}
            </HbcTypography>
          </div>
        </div>
      </HbcCard>

      {Array.from(groups.entries()).map(([category, checks]) => (
        <div key={category} className={styles.categoryGroup}>
          <HbcTypography intent="heading4" className={styles.categoryHeader}>
            {CATEGORY_LABELS[category] ?? category}
          </HbcTypography>
          {checks.map((check) => (
            <CheckResultRow key={check.checkId} check={check} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SetupWizardPage(): ReactNode {
  const styles = useStyles();
  const session = useCurrentSession();
  const getToken = createSessionTokenFactory(() => session);

  const [preflightResult, setPreflightResult] = useState<IAdminPreflightResponse | null>(null);
  const [isRunningPreflight, setIsRunningPreflight] = useState(false);
  const [isLaunchingInstall, setIsLaunchingInstall] = useState(false);
  const [installRunId, setInstallRunId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const backendUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BACKEND_URL) || '';

  const runPreflight = useCallback(async () => {
    if (!backendUrl) return;
    setIsRunningPreflight(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch(`${backendUrl}/api/admin/preflight`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          actionKey: 'setup-install:bootstrap:full-install',
          commandInput: {},
        }),
      });
      if (!res.ok) {
        setError(`Preflight request failed: ${res.status} ${res.statusText}`);
        return;
      }
      const data = await res.json();
      setPreflightResult(data.data ?? data);
    } catch (err) {
      setError(`Preflight request failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsRunningPreflight(false);
    }
  }, [backendUrl, getToken]);

  const launchInstall = useCallback(async () => {
    if (!backendUrl || !preflightResult?.ready) return;
    setIsLaunchingInstall(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch(`${backendUrl}/api/admin/runs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          actionKey: 'setup-install:bootstrap:full-install',
          commandInput: {},
        }),
      });
      if (!res.ok) {
        setError(`Install launch failed: ${res.status} ${res.statusText}`);
        return;
      }
      const data = await res.json();
      const runId = data.data?.runId ?? data.runId;
      setInstallRunId(runId);
    } catch (err) {
      setError(`Install launch failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLaunchingInstall(false);
    }
  }, [backendUrl, getToken, preflightResult?.ready]);

  return (
    <WorkspacePageShell layout="form" title="Setup & Install">
      <HbcTypography intent="body">
        Bootstrap the HB Intel backend infrastructure. Run preflight checks to validate
        environment readiness, then launch the install when all critical prerequisites are met.
      </HbcTypography>

      <div className={styles.actions}>
        <HbcButton
          variant="secondary"
          onClick={runPreflight}
          loading={isRunningPreflight}
          disabled={!backendUrl}
        >
          Run Preflight Checks
        </HbcButton>

        <HbcButton
          variant="primary"
          onClick={launchInstall}
          loading={isLaunchingInstall}
          disabled={!preflightResult?.ready || isLaunchingInstall || !!installRunId}
        >
          Launch Install
        </HbcButton>
      </div>

      {error && (
        <HbcCard>
          <div className={styles.cardPadding}>
            <HbcStatusBadge variant="error" label="Error" size="small" />
            <HbcTypography intent="body">{error}</HbcTypography>
          </div>
        </HbcCard>
      )}

      {installRunId && (
        <HbcCard>
          <div className={styles.cardPadding}>
            <HbcStatusBadge variant="inProgress" label="Install Launched" size="small" />
            <HbcTypography intent="body">
              Install run {installRunId} has been launched. Track progress on the Runs lane.
            </HbcTypography>
          </div>
        </HbcCard>
      )}

      {preflightResult && <PreflightResults response={preflightResult} />}

      <div className={styles.checkpointNotice}>
        <HbcTypography intent="heading4">About checkpoints</HbcTypography>
        <HbcTypography intent="bodySmall">
          The install process includes two steps that require manual action in external admin portals:
          granting API permissions in Entra and approving SharePoint API access. The install will
          pause at these steps and prompt you with instructions. All other steps are fully automated.
        </HbcTypography>
      </div>
    </WorkspacePageShell>
  );
}
