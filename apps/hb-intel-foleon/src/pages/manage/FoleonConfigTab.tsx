import type { IFoleonRuntimeContract } from '../../runtime/foleonRuntimeContract.js';
import {
  buildConfigSourceRows,
  buildRuntimeReadinessCards,
  buildSafeDiagnostics,
} from './manageConfigViewModel.js';
import shell from './manageShell.module.css';
import f from './manageFields.module.css';

export function FoleonConfigTab(props: {
  readonly contract: IFoleonRuntimeContract;
  readonly managerReadPathProven?: boolean;
}): React.ReactNode {
  const readiness = props.contract.foleonReadiness && props.managerReadPathProven
    ? {
        ...props.contract.foleonReadiness,
        backendSafeConfigReady: true,
        readPathReady: true,
        writePathReady: props.contract.foleonReadiness.writePathReady,
      }
    : props.contract.foleonReadiness;
  const readinessCards = buildRuntimeReadinessCards(
    readiness,
    props.contract.foleonConfigDiagnostics,
  );
  const configRows = buildConfigSourceRows(props.contract.foleonConfigDiagnostics);
  const safeDiagnostics = buildSafeDiagnostics(props.contract);
  const consentRequired = hasConsentRequiredBlocker(props.contract);

  return (
    <div role="tabpanel" aria-label="Config" className={shell.tabPanel}>
      {consentRequired ? (
        <section className={f.editorSection} aria-label="API approval required">
          <p className={f.guidanceKicker}>API Consent Missing</p>
          <h3 className={f.sectionTitle}>Tenant API Approval Required</h3>
          <p className={f.metaMuted}>
            Token acquisition failed with consent_required. Backend read path, write path, and sync path are unavailable until a SharePoint admin approves HB SharePoint Creator / access_as_user in SharePoint Admin Center API access.
          </p>
        </section>
      ) : null}

      <section className={f.editorSection} aria-label="Runtime readiness summary">
        <p className={f.guidanceKicker}>Registry-Aware Config</p>
        <h3 className={f.sectionTitle}>Runtime Readiness Summary</h3>
        <div className={shell.readinessGrid}>
          {readinessCards.map((card) => (
            <article key={card.label} className={shell.readinessCard} data-readiness-status={card.status}>
              <span className={f.guidanceKicker}>{card.label}</span>
              <strong>{card.status}</strong>
              <p>{card.detail}</p>
              <small>{card.nextAction}</small>
            </article>
          ))}
        </div>
      </section>

      <section className={f.editorSection} aria-label="Registry source status">
        <h3 className={f.sectionTitle}>Registry Source Status</h3>
        <dl className={shell.definitionGrid}>
          <dt>Registry source</dt>
          <dd>{props.contract.foleonConfigDiagnostics?.registryFetchStatus ?? 'not-configured'}</dd>
          <dt>Registry validation</dt>
          <dd>{readiness?.registryReady ? 'Valid' : 'Blocked'}</dd>
          <dt>Duplicate active keys</dt>
          <dd>{props.contract.foleonConfigDiagnostics?.registryDuplicateActiveKeysDetected ? 'Blocked' : 'Clear'}</dd>
          <dt>Secret hygiene</dt>
          <dd>{props.contract.foleonConfigDiagnostics?.registrySecretHygieneStatus ?? 'unknown'}</dd>
        </dl>
      </section>

      <section className={f.editorSection} aria-label="Config source by value">
        <h3 className={f.sectionTitle}>Config Source by Value</h3>
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
      </section>

      <section className={f.editorSection} aria-label="SharePoint list bindings">
        <h3 className={f.sectionTitle}>SharePoint List Bindings</h3>
        <div className={shell.readinessGrid}>
          {['HB_FoleonContentRegistry', 'HB_FoleonHomepagePlacements', 'HB_FoleonInteractionEvents', 'HB_FoleonSyncRuns', 'HB Platform Configuration Registry'].map((label) => (
            <article key={label} className={shell.readinessCard}>
              <strong>{label}</strong>
              <span>{label === 'HB_FoleonSyncRuns' ? syncStatus(readiness) : bindingStatus(readiness)}</span>
              <small>Raw list identifiers are redacted in the Manager UI.</small>
            </article>
          ))}
        </div>
      </section>

      <section className={f.editorSection} aria-label="Backend API and auth readiness">
        <h3 className={f.sectionTitle}>Backend / API / Auth Readiness</h3>
        <dl className={shell.definitionGrid}>
          <dt>Backend URL</dt>
          <dd>{readiness?.backendUrlReady ? 'Configured (redacted)' : 'Missing'}</dd>
          <dt>Safe-config probe</dt>
          <dd>{readiness?.backendSafeConfigReady ? 'Valid' : 'Blocked'}</dd>
          <dt>API resource</dt>
          <dd>{readiness?.authResourceReady ? 'Configured (redacted)' : 'Missing'}</dd>
          <dt>Token provider</dt>
          <dd>{readiness?.tokenProviderReady ? 'Valid' : 'Blocked'}</dd>
          <dt>Token acquisition</dt>
          <dd>{readiness?.tokenAcquisitionReady ? 'Valid' : consentRequired ? 'Blocked: consent_required' : 'Blocked'}</dd>
          <dt>Route authorization</dt>
          <dd>{readiness?.backendRouteAuthorizationReady ? 'Valid' : 'Blocked'}</dd>
          <dt>Read readiness</dt>
          <dd>{readiness?.readPathReady ? 'Valid' : 'Proven by current Manager load only'}</dd>
          <dt>Write readiness</dt>
          <dd>{readiness?.writePathReady ? 'Valid' : 'Blocked until safe-config and route authorization are proven'}</dd>
          <dt>Sync readiness</dt>
          <dd>{readiness?.syncPathReady ? 'Valid' : 'Blocked until backend Foleon OAuth/API config is ready'}</dd>
        </dl>
      </section>

      <section className={f.editorSection} aria-label="Origin and production URL policy">
        <h3 className={f.sectionTitle}>Origin and Production URL Policy</h3>
        <dl className={shell.definitionGrid}>
          <dt>Accepted Foleon origins</dt>
          <dd>{props.contract.originPolicy.allowedOrigins.length} configured (values redacted)</dd>
          <dt>Production viewer URL policy</dt>
          <dd>{props.contract.originPolicy.requireHttps ? 'HTTPS required' : 'HTTPS not required'}</dd>
          <dt>Preview/admin review</dt>
          <dd>{props.contract.originPolicy.allowPreview ? 'Preview URLs allowed for review' : 'Preview URLs blocked for production'}</dd>
        </dl>
      </section>

      <section className={f.editorSection} aria-label="Package and manifest governance">
        <h3 className={f.sectionTitle}>Package / Manifest Governance</h3>
        <dl className={shell.definitionGrid}>
          <dt>Runtime manifest ID</dt>
          <dd>{props.contract.governed.manifestIdMatchesExpected ? 'Matches expected' : 'Mismatch'}</dd>
          <dt>Expected manifest ID</dt>
          <dd>Configured (redacted)</dd>
          <dt>Runtime package version</dt>
          <dd>{props.contract.governed.expectedPackageVersion ?? 'Missing'}</dd>
          <dt>Expected package version</dt>
          <dd>{props.contract.governed.packageVersionMatchesExpected ? 'Matches expected' : 'Mismatch'}</dd>
        </dl>
      </section>

      <section className={f.editorSection} aria-label="Admin diagnostics">
        <details>
          <summary className={shell.detailsSummary}>Admin Diagnostics (redacted)</summary>
          <pre className={shell.safeDiagnostics}>{JSON.stringify(safeDiagnostics, null, 2)}</pre>
        </details>
      </section>
    </div>
  );
}

function hasConsentRequiredBlocker(contract: IFoleonRuntimeContract): boolean {
  return contract.foleonConfigDiagnostics?.blockers.some((blocker) =>
    blocker.code === 'token-acquisition-failed' &&
    blocker.message.toLowerCase().includes('consent_required')
  ) ?? false;
}

function bindingStatus(readiness: IFoleonRuntimeContract['foleonReadiness']): string {
  return readiness?.listBindingsReady ? 'configured' : 'blocked';
}

function syncStatus(readiness: IFoleonRuntimeContract['foleonReadiness']): string {
  return readiness?.syncPathReady ? 'validated' : 'configured / sync readiness separate';
}
