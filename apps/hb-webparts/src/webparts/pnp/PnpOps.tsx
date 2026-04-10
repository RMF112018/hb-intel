import * as React from 'react';
import {
  HbcBanner,
  HbcButton,
  HbcCard,
  HbcStatusBadge,
} from '@hbc/ui-kit/homepage';
import type { HomepageIdentityInput } from '../../homepage/helpers/identity.js';
import {
  PNP_V1_ACTIONS,
  getDefaultPnpActionKey,
  resolvePnpActionCatalog,
  type PnpOpsActionDefinition,
  type PnpOpsActionKey,
} from './pnpOpsActionCatalog.js';
import {
  fetchPnpActionMetadata,
  fetchPnpRun,
  fetchPnpRunEvidence,
  launchPnpRun,
  runPnpPreflight,
  type PnpOpsClientConfig,
  type PnpOpsCommandInput,
  type PnpOpsEvidenceRef,
  type PnpOpsPreflightResponse,
  type PnpOpsRunEnvelope,
  type PnpOpsRunEvidenceResponse,
  type PnpOpsTokenProvider,
} from './pnpOpsClient.js';
import {
  PNP_OPS_LEGACY_MODE,
  resolvePnpOpsExecutionMode,
  type PnpOpsExecutionMode,
} from './pnpOpsExecutionModes.js';
import { parseCsvFilters, validatePnpOpsForm } from './pnpOpsValidation.js';

export interface PnpOpsProps {
  config?: Record<string, unknown>;
  identity?: HomepageIdentityInput;
  getApiToken?: PnpOpsTokenProvider;
}

interface PnpOpsRuntimeConfig {
  readonly executionMode: PnpOpsExecutionMode;
  readonly runnerBaseUrl: string;
  readonly legacyAdminApiBaseUrl: string;
  readonly defaultTargetSiteUrl: string;
}

const LAYOUT: Record<string, React.CSSProperties> = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    padding: 12,
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  cardPad: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    padding: 14,
  },
  actionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: 12,
  },
  actionsRow: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
  },
  filterRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
  },
  monospace: {
    fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
    wordBreak: 'break-word',
  },
  artifactList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
};

const POLL_INTERVAL_MS = 5_000;

function readRuntimeConfig(input: Record<string, unknown> | undefined): PnpOpsRuntimeConfig {
  const legacyBackendUrl = typeof input?.backendUrl === 'string'
    ? input.backendUrl.replace(/\/+$/, '')
    : '';
  const executionMode = resolvePnpOpsExecutionMode(input);
  const runnerBaseUrl = typeof input?.runnerBaseUrl === 'string'
    ? input.runnerBaseUrl.replace(/\/+$/, '')
    : '';
  const legacyAdminApiBaseUrl = typeof input?.legacyAdminApiBaseUrl === 'string'
    ? input.legacyAdminApiBaseUrl.replace(/\/+$/, '')
    : legacyBackendUrl;
  return {
    executionMode,
    runnerBaseUrl: runnerBaseUrl || (executionMode === PNP_OPS_LEGACY_MODE ? legacyBackendUrl : ''),
    legacyAdminApiBaseUrl,
    defaultTargetSiteUrl:
      typeof input?.defaultTargetSiteUrl === 'string'
        ? input.defaultTargetSiteUrl
        : '',
  };
}

function describeMode(mode: PnpOpsExecutionMode): string {
  switch (mode) {
    case 'local-runner':
      return 'local-runner (preferred live path)';
    case 'remote-runner':
      return 'remote-runner (self-hosted fallback)';
    case 'mock':
      return 'mock (no live execution)';
    case 'legacy-admin-api':
      return 'legacy-admin-api (deprecated compatibility)';
    default:
      return mode;
  }
}

function getEndpointLabel(runtime: PnpOpsRuntimeConfig): string {
  if (runtime.executionMode === 'legacy-admin-api') {
    return runtime.legacyAdminApiBaseUrl || runtime.runnerBaseUrl;
  }
  return runtime.runnerBaseUrl;
}

function formatServiceError(error: unknown, runtime: PnpOpsRuntimeConfig): string {
  const message = error instanceof Error ? error.message : String(error);
  const isRunnerMode = runtime.executionMode === 'local-runner' || runtime.executionMode === 'remote-runner';
  if (isRunnerMode && /fetch|network|certificate|tls|self[- ]signed/i.test(message)) {
    return `${message} Verify local runner HTTPS certificate trust and that runner origin is listed in PNP_RUNNER_ALLOWED_ORIGINS.`;
  }
  return message;
}

function isTerminal(status: string | null | undefined): boolean {
  return status === 'Completed' || status === 'Failed' || status === 'Cancelled';
}

function statusVariant(status: string | null | undefined): 'success' | 'error' | 'warning' | 'inProgress' | 'pending' | 'neutral' {
  if (!status) {
    return 'pending';
  }
  if (status === 'Completed') {
    return 'success';
  }
  if (status === 'Failed') {
    return 'error';
  }
  if (status === 'Cancelled' || status === 'PartiallyDeferred') {
    return 'warning';
  }
  if (status === 'Running' || status === 'Validating' || status === 'AwaitingApproval') {
    return 'inProgress';
  }
  if (status === 'Pending') {
    return 'pending';
  }
  return 'neutral';
}

function normalizeCommandInput(
  action: PnpOpsActionDefinition,
  targetSiteUrl: string,
  listFilterInput: string,
  pageFilterInput: string,
): PnpOpsCommandInput {
  const listFilters = parseCsvFilters(listFilterInput);
  const pageFilters = parseCsvFilters(pageFilterInput);

  return {
    targetSiteUrl: targetSiteUrl.trim(),
    ...(action.requiredFilter === 'list' ? { listFilters } : {}),
    ...(action.requiredFilter === 'page' ? { pageFilters } : {}),
    executionIntent: {
      mode: 'read-only-export',
      source: 'spfx-webpart',
      requestedAt: new Date().toISOString(),
    },
  };
}

function getEvidenceDownloadUrl(ref: PnpOpsEvidenceRef): string | null {
  const direct = typeof ref.downloadUrl === 'string'
    ? ref.downloadUrl
    : typeof ref.url === 'string'
      ? ref.url
      : typeof ref.href === 'string'
        ? ref.href
        : null;
  return direct ?? null;
}

function orderEvidenceRefs(evidenceRefs: readonly PnpOpsEvidenceRef[]): readonly PnpOpsEvidenceRef[] {
  const refs = [...evidenceRefs];
  refs.sort((a, b) => {
    if (a.isBundle && !b.isBundle) return -1;
    if (!a.isBundle && b.isBundle) return 1;
    return (a.label ?? a.fileName ?? '').localeCompare(b.label ?? b.fileName ?? '');
  });
  return refs;
}

export function PnpOps({ config, identity, getApiToken }: PnpOpsProps): React.JSX.Element {
  const runtime = React.useMemo(() => readRuntimeConfig(config), [config]);
  const clientConfig = React.useMemo<PnpOpsClientConfig>(() => ({
    executionMode: runtime.executionMode,
    runnerBaseUrl: runtime.runnerBaseUrl,
    legacyAdminApiBaseUrl: runtime.legacyAdminApiBaseUrl || undefined,
  }), [runtime.executionMode, runtime.runnerBaseUrl, runtime.legacyAdminApiBaseUrl]);
  const [actionCatalog, setActionCatalog] = React.useState<readonly PnpOpsActionDefinition[]>(PNP_V1_ACTIONS);
  const [catalogWarning, setCatalogWarning] = React.useState<string | null>(null);
  const [selectedActionKey, setSelectedActionKey] = React.useState<PnpOpsActionKey>(getDefaultPnpActionKey());
  const [targetSiteUrl, setTargetSiteUrl] = React.useState(runtime.defaultTargetSiteUrl);
  const [listFilterInput, setListFilterInput] = React.useState('');
  const [pageFilterInput, setPageFilterInput] = React.useState('');
  const [formErrors, setFormErrors] = React.useState<readonly string[]>([]);
  const [busyState, setBusyState] = React.useState<'idle' | 'preflight' | 'launch' | 'refresh'>('idle');
  const [preflightResult, setPreflightResult] = React.useState<PnpOpsPreflightResponse | null>(null);
  const [runStatus, setRunStatus] = React.useState<PnpOpsRunEnvelope | null>(null);
  const [evidenceManifest, setEvidenceManifest] = React.useState<PnpOpsRunEvidenceResponse | null>(null);
  const [serviceError, setServiceError] = React.useState<string | null>(null);

  const selectedAction = React.useMemo(
    () => actionCatalog.find((action) => action.key === selectedActionKey) ?? null,
    [actionCatalog, selectedActionKey],
  );

  const loadCatalog = React.useCallback(async (): Promise<void> => {
    if (runtime.executionMode === 'mock') {
      const fallback = resolvePnpActionCatalog(null);
      setActionCatalog(fallback.actions);
      setCatalogWarning('Mock mode is active. Using locked Prompt-01 action catalog without runner calls.');
      return;
    }
    const needsLegacyToken = runtime.executionMode === PNP_OPS_LEGACY_MODE;
    const endpoint = getEndpointLabel(runtime);
    if (!endpoint) {
      const fallback = resolvePnpActionCatalog(null);
      setActionCatalog(fallback.actions);
      setCatalogWarning(
        runtime.executionMode === PNP_OPS_LEGACY_MODE
          ? 'Legacy mode is selected but no legacy API endpoint is configured; using locked catalog.'
          : `${runtime.executionMode} mode is selected but runner endpoint is not configured; using locked catalog.`,
      );
      return;
    }
    if (needsLegacyToken && !getApiToken) {
      const fallback = resolvePnpActionCatalog(null);
      setActionCatalog(fallback.actions);
      setCatalogWarning('Legacy admin API mode requires token acquisition (`backendAudience`). Using locked catalog.');
      return;
    }

    try {
      const metadata = await fetchPnpActionMetadata(clientConfig, getApiToken);
      const resolved = resolvePnpActionCatalog(metadata);
      setActionCatalog(resolved.actions);
      setCatalogWarning(resolved.warning);
    } catch (error) {
      const resolved = resolvePnpActionCatalog(null);
      setActionCatalog(resolved.actions);
      setCatalogWarning(`Action catalog request failed (${formatServiceError(error, runtime)}). Locked Prompt-01 catalog defaults are shown.`);
    }
  }, [runtime, getApiToken, clientConfig]);

  React.useEffect(() => {
    loadCatalog().catch(() => undefined);
  }, [loadCatalog]);

  const refreshRun = React.useCallback(async (): Promise<void> => {
    if (!runStatus?.runId || runtime.executionMode === 'mock') {
      return;
    }
    const endpoint = getEndpointLabel(runtime);
    if (!endpoint) {
      return;
    }

    setBusyState('refresh');
    try {
      const latestRun = await fetchPnpRun(clientConfig, runStatus.runId, getApiToken);
      setRunStatus(latestRun);
      if (isTerminal(latestRun.status)) {
        const evidence = await fetchPnpRunEvidence(clientConfig, latestRun.runId, getApiToken);
        setEvidenceManifest(evidence);
      }
    } catch (error) {
      setServiceError(formatServiceError(error, runtime));
    } finally {
      setBusyState('idle');
    }
  }, [runtime, runStatus?.runId, getApiToken, clientConfig]);

  React.useEffect(() => {
    if (!runStatus?.runId || isTerminal(runStatus.status) || runtime.executionMode === 'mock') {
      return undefined;
    }
    const handle = window.setInterval(() => {
      refreshRun().catch(() => undefined);
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(handle);
  }, [refreshRun, runStatus?.runId, runStatus?.status, runtime.executionMode]);

  const submitPreflight = React.useCallback(async (): Promise<void> => {
    const validation = validatePnpOpsForm(
      selectedAction,
      { targetSiteUrl, listFilterInput, pageFilterInput },
      {
        executionMode: runtime.executionMode,
        runnerBaseUrl: runtime.runnerBaseUrl,
        legacyAdminApiBaseUrl: runtime.legacyAdminApiBaseUrl,
      },
    );
    setFormErrors(validation.errors);
    setServiceError(null);
    if (!validation.isValid || !selectedAction) {
      return;
    }

    const commandInput = normalizeCommandInput(
      selectedAction,
      targetSiteUrl,
      listFilterInput,
      pageFilterInput,
    );

    setBusyState('preflight');
    try {
      if (runtime.executionMode === 'mock') {
        setPreflightResult({
          ready: true,
          checks: [
            { checkId: 'mock-01', label: 'Mock runner available', passed: true, message: 'Mock mode bypassed live runner checks.', blocking: false },
            { checkId: 'mock-02', label: 'Action payload normalized', passed: true, message: `${selectedAction.key} payload accepted.`, blocking: false },
          ],
        });
      } else {
        const result = await runPnpPreflight(clientConfig, selectedAction.key, commandInput, getApiToken);
        setPreflightResult(result);
      }
    } catch (error) {
      setServiceError(formatServiceError(error, runtime));
    } finally {
      setBusyState('idle');
    }
  }, [selectedAction, targetSiteUrl, listFilterInput, pageFilterInput, runtime.executionMode, runtime.runnerBaseUrl, runtime.legacyAdminApiBaseUrl, getApiToken, clientConfig]);

  const launchRun = React.useCallback(async (): Promise<void> => {
    const validation = validatePnpOpsForm(
      selectedAction,
      { targetSiteUrl, listFilterInput, pageFilterInput },
      {
        executionMode: runtime.executionMode,
        runnerBaseUrl: runtime.runnerBaseUrl,
        legacyAdminApiBaseUrl: runtime.legacyAdminApiBaseUrl,
      },
    );
    setFormErrors(validation.errors);
    setServiceError(null);
    if (!validation.isValid || !selectedAction) {
      return;
    }

    const commandInput = normalizeCommandInput(
      selectedAction,
      targetSiteUrl,
      listFilterInput,
      pageFilterInput,
    );

    setBusyState('launch');
    try {
      if (runtime.executionMode === 'mock') {
        const runId = `mock-${Date.now()}`;
        setRunStatus({
          runId,
          actionKey: selectedAction.key,
          status: 'Running',
          totalSteps: 3,
          currentStep: 2,
          startedAt: new Date().toISOString(),
          completedAt: null,
          steps: [
            { stepNumber: 1, stepLabel: 'Resolve action descriptor', status: 'Completed', errorMessage: null },
            { stepNumber: 2, stepLabel: 'Execute read-only extraction', status: 'Running', errorMessage: null },
            { stepNumber: 3, stepLabel: 'Publish artifact manifest', status: 'Pending', errorMessage: null },
          ],
        });

        window.setTimeout(() => {
          setRunStatus({
            runId,
            actionKey: selectedAction.key,
            status: 'Completed',
            totalSteps: 3,
            currentStep: 3,
            startedAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
            steps: [
              { stepNumber: 1, stepLabel: 'Resolve action descriptor', status: 'Completed', errorMessage: null },
              { stepNumber: 2, stepLabel: 'Execute read-only extraction', status: 'Completed', errorMessage: null },
              { stepNumber: 3, stepLabel: 'Publish artifact manifest', status: 'Completed', errorMessage: null },
            ],
          });
          setEvidenceManifest({
            runId,
            total: 2,
            evidenceRefs: [
              { label: 'raw.json', downloadUrl: '#', note: 'Mock artifact placeholder' },
              { label: 'summary.md', downloadUrl: '#', note: 'Mock artifact placeholder' },
            ],
          });
        }, 1_300);
      } else {
        const launched = await launchPnpRun(clientConfig, selectedAction.key, commandInput, getApiToken);
        const latestRun = await fetchPnpRun(clientConfig, launched.runId, getApiToken);
        setRunStatus(latestRun);
        if (isTerminal(latestRun.status)) {
          const evidence = await fetchPnpRunEvidence(clientConfig, latestRun.runId, getApiToken);
          setEvidenceManifest(evidence);
        } else {
          setEvidenceManifest(null);
        }
      }
    } catch (error) {
      setServiceError(formatServiceError(error, runtime));
    } finally {
      setBusyState('idle');
    }
  }, [selectedAction, targetSiteUrl, listFilterInput, pageFilterInput, runtime.executionMode, runtime.runnerBaseUrl, runtime.legacyAdminApiBaseUrl, getApiToken, clientConfig]);

  return (
    <section aria-label="PnP Operations webpart shell" data-hbc-webpart="pnp-ops" style={LAYOUT.root}>
      <HbcCard>
        <div style={LAYOUT.cardPad}>
          <h2>PnP Operations</h2>
          <p>
            Read-only SharePoint extraction shell. Execution is routed by configured mode.
          </p>
          <p>
            Operator: {identity?.displayName ?? 'Unknown'}{identity?.email ? ` (${identity.email})` : ''}
          </p>
          <p>
            <span style={LAYOUT.monospace}>
              Execution mode: {describeMode(runtime.executionMode)}
            </span>
          </p>
          <p>
            <span style={LAYOUT.monospace}>
              Endpoint: {getEndpointLabel(runtime) || 'Not configured'}
            </span>
          </p>
          <HbcBanner variant="warning">
            Browser execution is intentionally not supported. Privileged PnP operations must run through a runner service with audit/evidence controls.
          </HbcBanner>
        </div>
      </HbcCard>

      {catalogWarning && <HbcBanner variant="info">{catalogWarning}</HbcBanner>}
      {runtime.executionMode === PNP_OPS_LEGACY_MODE && getEndpointLabel(runtime) && !getApiToken && (
        <HbcBanner variant="warning">
          Legacy mode is configured but no API token provider is available. Set `backendAudience`
          so SPFx can acquire a bearer token for legacy `/api/admin/*` calls.
        </HbcBanner>
      )}
      {(runtime.executionMode === 'local-runner' || runtime.executionMode === 'remote-runner') && !runtime.runnerBaseUrl && (
        <HbcBanner variant="warning">
          {runtime.executionMode} is selected but `runnerBaseUrl` is not configured.
        </HbcBanner>
      )}
      {runtime.executionMode === 'mock' && (
        <HbcBanner variant="info">
          Mock mode is active. No network calls are made.
        </HbcBanner>
      )}
      {serviceError && <HbcBanner variant="error">{serviceError}</HbcBanner>}
      {formErrors.length > 0 && (
        <HbcBanner variant="error">
          {formErrors.join(' ')}
        </HbcBanner>
      )}

      <div style={LAYOUT.section}>
        <h3>1. Action Catalog</h3>
        <div style={LAYOUT.actionGrid}>
          {actionCatalog.map((action) => {
            const selected = action.key === selectedActionKey;
            return (
              <HbcCard key={action.key}>
                <div style={LAYOUT.cardPad}>
                  <div style={LAYOUT.actionsRow}>
                    <HbcStatusBadge variant={selected ? 'inProgress' : 'neutral'} label={selected ? 'Selected' : 'Available'} size="small" />
                    <HbcStatusBadge variant="info" label={action.riskLevel} size="small" />
                    <HbcStatusBadge variant="neutral" label={action.executionMode} size="small" />
                  </div>
                  <h4>{action.label}</h4>
                  <p>{action.description}</p>
                  <p>Outputs: {action.expectedOutputs.join(', ')}</p>
                  <p>{action.warning}</p>
                  <div>
                    <HbcButton
                      variant={selected ? 'secondary' : 'primary'}
                      onClick={() => setSelectedActionKey(action.key)}
                    >
                      {selected ? 'Selected' : 'Select Action'}
                    </HbcButton>
                  </div>
                </div>
              </HbcCard>
            );
          })}
        </div>
      </div>

      <HbcCard>
        <div style={LAYOUT.cardPad}>
          <h3>2. Target and Options</h3>
          <label htmlFor="pnp-target-site-url">Target SharePoint Site URL</label>
          <input
            id="pnp-target-site-url"
            type="url"
            value={targetSiteUrl}
            placeholder="https://<tenant>.sharepoint.com/sites/<site>"
            onChange={(event) => setTargetSiteUrl(event.target.value)}
          />
          <div style={LAYOUT.filterRow}>
            <div style={LAYOUT.section}>
              <label htmlFor="pnp-list-filters">List Filters (comma-separated)</label>
              <input
                id="pnp-list-filters"
                type="text"
                value={listFilterInput}
                placeholder="People Culture Announcements, People Culture Kudos"
                onChange={(event) => setListFilterInput(event.target.value)}
                disabled={selectedAction?.requiredFilter !== 'list'}
              />
            </div>
            <div style={LAYOUT.section}>
              <label htmlFor="pnp-page-filters">Page Filters (comma-separated)</label>
              <input
                id="pnp-page-filters"
                type="text"
                value={pageFilterInput}
                placeholder="Home.aspx, Culture.aspx"
                onChange={(event) => setPageFilterInput(event.target.value)}
                disabled={selectedAction?.requiredFilter !== 'page'}
              />
            </div>
          </div>
          <div style={LAYOUT.actionsRow}>
            <HbcButton
              variant="secondary"
              onClick={() => {
                submitPreflight().catch(() => undefined);
              }}
              loading={busyState === 'preflight'}
              disabled={busyState !== 'idle' && busyState !== 'refresh'}
            >
              Run Preflight
            </HbcButton>
            <HbcButton
              variant="primary"
              onClick={() => {
                launchRun().catch(() => undefined);
              }}
              loading={busyState === 'launch'}
              disabled={busyState !== 'idle' && busyState !== 'refresh'}
            >
              Launch Extraction Run
            </HbcButton>
            <HbcButton
              variant="secondary"
              onClick={() => {
                refreshRun().catch(() => undefined);
              }}
              loading={busyState === 'refresh'}
              disabled={!runStatus || runtime.executionMode === 'mock'}
            >
              Refresh Run
            </HbcButton>
          </div>
        </div>
      </HbcCard>

      <HbcCard>
        <div style={LAYOUT.cardPad}>
          <h3>3. Run and Results</h3>
          {preflightResult ? (
            <div style={LAYOUT.section}>
              <HbcStatusBadge
                variant={preflightResult.ready ? 'success' : 'warning'}
                label={preflightResult.ready ? 'Preflight ready' : 'Preflight issues'}
              />
              {preflightResult.checks.map((check) => (
                <p key={check.checkId}>
                  {check.passed ? 'PASS' : check.blocking ? 'FAIL' : 'WARN'}: {check.label} — {check.message}
                </p>
              ))}
            </div>
          ) : (
            <p>No preflight results yet.</p>
          )}

          {runStatus ? (
            <div style={LAYOUT.section}>
              <div style={LAYOUT.actionsRow}>
                <HbcStatusBadge variant={statusVariant(runStatus.status)} label={runStatus.status} size="medium" />
                <p>Run ID: <span style={LAYOUT.monospace}>{runStatus.runId}</span></p>
                <p>
                  Step: {runStatus.currentStep ?? 0}/{runStatus.totalSteps}
                </p>
              </div>
              {runStatus.steps.map((step) => (
                <p key={`${step.stepNumber}-${step.stepLabel}`}>
                  {step.stepNumber}. {step.stepLabel} — {step.status}
                  {step.errorMessage ? ` (${step.errorMessage})` : ''}
                </p>
              ))}
            </div>
          ) : (
            <p>No run launched yet.</p>
          )}

          <div style={LAYOUT.section}>
            <h4>Artifact Manifest</h4>
            {evidenceManifest && evidenceManifest.total > 0 ? (
              <div style={LAYOUT.artifactList}>
                {orderEvidenceRefs(evidenceManifest.evidenceRefs).map((ref, index) => {
                  const downloadUrl = getEvidenceDownloadUrl(ref);
                  const label = ref.label ?? ref.fileName ?? `artifact-${index + 1}`;
                  const contentType = typeof ref.contentType === 'string' ? ref.contentType : 'unknown-type';
                  const sizeLabel = typeof ref.sizeBytes === 'number' ? ` (${ref.sizeBytes} bytes)` : '';
                  const availability = ref.availability ?? 'available';
                  const bundleSuffix = ref.isBundle ? ` [bundle${ref.bundleFormat ? `:${ref.bundleFormat}` : ''}]` : '';
                  return (
                    <div key={`${label}-${index}`}>
                      <p>
                        {label}{bundleSuffix}{sizeLabel} — {contentType} — {availability}
                        {downloadUrl ? ' — ' : ' — reference captured (download URL pending) '}
                        {downloadUrl ? <a href={downloadUrl} target="_blank" rel="noreferrer">Download</a> : null}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p>
                Artifact links will appear after backend execution publishes run evidence.
              </p>
            )}
          </div>
        </div>
      </HbcCard>
    </section>
  );
}
