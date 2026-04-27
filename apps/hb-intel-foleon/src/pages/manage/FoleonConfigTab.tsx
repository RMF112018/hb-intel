import { useCallback, useMemo, useState } from 'react';
import type { IFoleonRuntimeContract } from '../../runtime/foleonRuntimeContract.js';
import type { FoleonSyncRun } from '../../types/foleon-management.types.js';
import {
  buildConfigSourceRows,
  buildRequiredAdminActions,
  buildSafeDiagnostics,
  buildSystemHealthGroups,
  formatRedactedDiagnosticsJson,
} from './manageConfigViewModel.js';
import { hasConsentRequiredBlocker } from './manageDegradedCopy.js';
import { ManageSyncPanel } from './ManageSyncPanel.js';
import shell from './manageShell.module.css';
import f from './manageFields.module.css';

const LIST_ROLE_DIAGNOSTIC_LABELS: ReadonlyArray<{ readonly internal: string; readonly title: string }> = [
  { internal: 'HB_FoleonContentRegistry', title: 'Foleon content registry list' },
  { internal: 'HB_FoleonHomepagePlacements', title: 'Homepage placements list' },
  { internal: 'HB_FoleonInteractionEvents', title: 'Interaction events list' },
  { internal: 'HB_FoleonSyncRuns', title: 'Sync run history list' },
  { internal: 'HB Platform Configuration Registry', title: 'Platform configuration registry' },
];

export function FoleonConfigTab(props: {
  readonly contract: IFoleonRuntimeContract;
  readonly managerReadPathProven?: boolean;
  readonly runs: ReadonlyArray<FoleonSyncRun>;
  readonly diagnosticsOpen: boolean;
  readonly onDiagnosticsOpenChange: (open: boolean) => void;
}): React.ReactNode {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  const readiness = props.contract.foleonReadiness && props.managerReadPathProven
    ? {
        ...props.contract.foleonReadiness,
        backendSafeConfigReady: true,
        readPathReady: true,
        writePathReady: props.contract.foleonReadiness.writePathReady,
      }
    : props.contract.foleonReadiness;
  const consentRequired = hasConsentRequiredBlocker(props.contract);
  const diagnostics = props.contract.foleonConfigDiagnostics;
  const healthGroups = useMemo(
    () => buildSystemHealthGroups({ readiness, diagnostics, contract: props.contract }),
    [readiness, diagnostics, props.contract],
  );
  const adminActions = useMemo(
    () => buildRequiredAdminActions({ readiness, diagnostics, consentRequired }),
    [readiness, diagnostics, consentRequired],
  );
  const configRows = useMemo(() => buildConfigSourceRows(diagnostics), [diagnostics]);
  const proofJson = useMemo(() => formatRedactedDiagnosticsJson(props.contract), [props.contract]);
  const diagnosticBlockerCodes = useMemo(() => {
    const codes = buildSafeDiagnostics(props.contract).blockerCodes;
    return Array.isArray(codes) ? codes : [];
  }, [props.contract]);

  const copyProof = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(proofJson);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 2000);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 3000);
    }
  }, [proofJson]);

  return (
    <div
      role="tabpanel"
      id="foleon-manage-panel-admin-config"
      aria-labelledby="foleon-manage-nav-admin-config"
      aria-label="Admin / Config"
      className={shell.tabPanel}
    >
      {consentRequired ? (
        <section className={shell.configConsentBanner} aria-label="API approval required">
          <p className={f.guidanceKicker}>API approval required</p>
          <h3 className={f.sectionTitle}>Tenant approval needed for the Foleon API</h3>
          <p className={f.metaMuted}>SharePoint cannot acquire a token until an administrator completes API access approval.</p>
        </section>
      ) : null}

      <section className={shell.configAdminConsole} aria-label="Config admin console overview">
        <article className={shell.configSummaryCard}>
          <p className={f.guidanceKicker}>API approval and token state</p>
          <strong>{readiness?.tokenAcquisitionReady ? 'Token path approved' : 'Approval or token readiness needed'}</strong>
          <span>{consentRequired ? 'Tenant API approval is required before Manager reads, writes, or sync can run.' : 'Token readiness is tracked separately from route and write readiness.'}</span>
        </article>
        <article className={shell.configSummaryCard}>
          <p className={f.guidanceKicker}>SharePoint list bindings</p>
          <strong>{readiness?.listBindingsReady ? 'Required lists are bound' : 'List bindings need attention'}</strong>
          <span>Content registry, placements, interaction events, and sync runs stay governed by the package feature assets.</span>
        </article>
        <article className={shell.configSummaryCard}>
          <p className={f.guidanceKicker}>Package and manifest governance</p>
          <strong>{props.contract.governed.packageVersionMatchesExpected ? 'Package version matches expected' : 'Package version mismatch'}</strong>
          <span>Manifest identity and package version proof are summarized here; raw IDs remain in expanded diagnostics only.</span>
        </article>
      </section>

      <section className={f.editorSection} role="region" aria-label="Required admin actions">
        <h2 className={f.sectionTitle}>Required admin actions</h2>
        {adminActions.length === 0 ? (
          <p className={f.metaMuted}>No administrator actions are required for the checks we monitor.</p>
        ) : (
          <ol className={shell.adminActionList}>
            {adminActions.map((action) => (
              <li key={action.id} className={shell.adminActionItem}>
                <strong>{action.title}</strong>
                <p className={f.metaMuted}>{action.body}</p>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className={shell.configHealthStack} role="region" aria-label="System health summary">
        <h2 className={f.sectionTitle}>System health</h2>
        {healthGroups.map((group) => (
          <section
            key={group.id}
            role="region"
            className={shell.healthGroup}
            aria-label={group.title}
            aria-labelledby={`config-health-${group.id}`}
          >
            <h3 className={shell.healthGroupTitle} id={`config-health-${group.id}`}>
              {group.title}
            </h3>
            <p className={f.metaMuted}>{group.description}</p>
            <div className={shell.healthLines}>
              {group.lines.map((ln) => (
                <article
                  key={ln.id}
                  className={shell.healthLineCard}
                  data-readiness-status={ln.status}
                >
                  <div className={shell.readinessCardTitle}>
                    <span className={f.guidanceKicker}>{ln.label}</span>
                    <strong className={shell.readinessStatus}>{ln.status}</strong>
                  </div>
                  <p className={shell.healthLineDetail}>{ln.detail}</p>
                </article>
              ))}
            </div>
          </section>
        ))}
      </section>

      <section className={f.editorSection} aria-label="Diagnostics">
        <h2 className={f.sectionTitle}>Diagnostics</h2>
        <button
          type="button"
          className={shell.diagnosticsToggle}
          aria-expanded={props.diagnosticsOpen}
          onClick={(): void => props.onDiagnosticsOpenChange(!props.diagnosticsOpen)}
        >
          {props.diagnosticsOpen
            ? 'Hide redacted diagnostics, sync history, and technical proof'
            : 'Show redacted diagnostics, sync history, and technical proof'}
        </button>
        {props.diagnosticsOpen ? (
          <div className={shell.diagnosticsBody}>
              <ManageSyncPanel runs={props.runs} />
              {diagnosticBlockerCodes.length > 0 ? (
                <p className={f.metaMuted} role="note">
                  This redacted export aligns with readiness codes on record for support: {diagnosticBlockerCodes.join(', ')}.
                </p>
              ) : null}
              <div className={shell.diagnosticsToolbar}>
                <button type="button" className={shell.copyProofButton} onClick={(): void => void copyProof()}>
                  Copy redacted proof
                </button>
                {copyState === 'copied' ? (
                  <span role="status" className={shell.copyProofStatus}>
                    Copied to clipboard
                  </span>
                ) : null}
                {copyState === 'failed' ? (
                  <span role="status" className={shell.copyProofStatus}>
                    Clipboard unavailable in this browser context
                  </span>
                ) : null}
              </div>

              <details className={shell.nestedDiagnostics}>
                <summary className={shell.nestedDiagnosticsSummary}>Config source by setting (technical names)</summary>
                <div className={shell.tableWrap}>
                  <table className={shell.configTable}>
                    <thead>
                      <tr>
                        <th>Config key</th>
                        <th>Value</th>
                        <th>Source</th>
                        <th>Status</th>
                        <th>Required</th>
                        <th>Action needed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {configRows.map((row) => (
                        <tr key={row.key}>
                          <td>{row.key}</td>
                          <td>{row.displayValue}</td>
                          <td>{row.source}</td>
                          <td>{row.validationStatus}</td>
                          <td>{row.required ? 'Required' : 'Optional'}</td>
                          <td>{row.actionNeeded}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>

              <details className={shell.nestedDiagnostics}>
                <summary className={shell.nestedDiagnosticsSummary}>Registry technical status</summary>
                <dl className={shell.definitionGrid}>
                  <dt>Registry source</dt>
                  <dd>{diagnostics?.registryFetchStatus ?? 'not-configured'}</dd>
                  <dt>Registry validation</dt>
                  <dd>{readiness?.registryReady ? 'Valid' : 'Blocked'}</dd>
                  <dt>Duplicate active keys</dt>
                  <dd>{diagnostics?.registryDuplicateActiveKeysDetected ? 'Blocked' : 'Clear'}</dd>
                  <dt>Secret hygiene</dt>
                  <dd>{diagnostics?.registrySecretHygieneStatus ?? 'unknown'}</dd>
                </dl>
              </details>

              <details className={shell.nestedDiagnostics}>
                <summary className={shell.nestedDiagnosticsSummary}>SharePoint list roles (internal names)</summary>
                <div className={shell.readinessGrid}>
                  {LIST_ROLE_DIAGNOSTIC_LABELS.map((entry) => (
                    <article key={entry.internal} className={shell.readinessCard}>
                      <strong>{entry.internal}</strong>
                      <span>{entry.internal === 'HB_FoleonSyncRuns' ? syncStatus(readiness) : bindingStatus(readiness)}</span>
                      <small>{entry.title}</small>
                    </article>
                  ))}
                </div>
              </details>

              <details className={shell.nestedDiagnostics}>
                <summary className={shell.nestedDiagnosticsSummary}>Origin, packaging, and redacted JSON</summary>
                <dl className={shell.definitionGrid}>
                  <dt>Accepted Foleon origins</dt>
                  <dd>{props.contract.originPolicy.allowedOrigins.length} configured (values redacted)</dd>
                  <dt>Production viewer URL policy</dt>
                  <dd>{props.contract.originPolicy.requireHttps ? 'HTTPS required' : 'HTTPS not required'}</dd>
                  <dt>Preview/admin review</dt>
                  <dd>{props.contract.originPolicy.allowPreview ? 'Preview URLs allowed for review' : 'Preview URLs blocked for production'}</dd>
                  <dt>Runtime manifest ID</dt>
                  <dd>{props.contract.governed.manifestIdMatchesExpected ? 'Matches expected' : 'Mismatch'}</dd>
                  <dt>Expected manifest ID</dt>
                  <dd>Configured (redacted)</dd>
                  <dt>Runtime package version</dt>
                  <dd>{props.contract.governed.expectedPackageVersion ?? 'Missing'}</dd>
                  <dt>Expected package version</dt>
                  <dd>{props.contract.governed.packageVersionMatchesExpected ? 'Matches expected' : 'Mismatch'}</dd>
                </dl>
                <pre className={shell.safeDiagnostics}>{proofJson}</pre>
              </details>
            </div>
        ) : null}
      </section>
    </div>
  );
}

function bindingStatus(readiness: IFoleonRuntimeContract['foleonReadiness']): string {
  return readiness?.listBindingsReady ? 'configured' : 'blocked';
}

function syncStatus(readiness: IFoleonRuntimeContract['foleonReadiness']): string {
  return readiness?.syncPathReady ? 'validated' : 'configured / sync readiness separate';
}
