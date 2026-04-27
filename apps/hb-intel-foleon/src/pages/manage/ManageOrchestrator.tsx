import { useCallback, useEffect, useMemo, useState } from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { HbcButton } from '@hbc/ui-kit/homepage';
import type {
  FoleonReadinessIssueCode,
  IFoleonRuntimeContract,
} from '../../runtime/foleonRuntimeContract.js';
import { createFoleonManagementApi, FoleonManagementApiError } from '../../services/FoleonManagementApi.js';
import type {
  FoleonManagedContent,
  FoleonPlacement,
  FoleonSyncRun,
  FoleonSyncStatus,
} from '../../types/foleon-management.types.js';
import { FoleonError, FoleonLoadingState } from '../../components/FoleonStates.js';
import { FoleonConfigTab } from './FoleonConfigTab.js';
import { buildManagerStatusChips, resolveSafeFoleonOpenOrigin } from './manageHeaderStatusModel.js';
import { FoleonFeedManagerApp } from './FoleonFeedManagerApp.js';
import {
  buildFeedManagerHeaderModel,
  type FeedManagerWorkspaceKey,
} from './feedManagerViewModel.js';
import { runFoleonSync } from './manageWorkflows.js';
import { useManageBreakpoint } from './useManageBreakpoint.js';
import {
  tokenAcquisitionDegradedBannerNextStep,
  tokenAcquisitionDegradedBannerPrimary,
} from './manageDegradedCopy.js';
import './foleonManageTokens.css';
import shell from './manageShell.module.css';

export interface ManageOrchestratorProps {
  readonly contract: IFoleonRuntimeContract;
  readonly onBack: () => void;
}

type LoadState =
  | { readonly kind: 'loading' }
  | { readonly kind: 'blocked'; readonly code: FoleonReadinessIssueCode; readonly message: string }
  | { readonly kind: 'error'; readonly message: string; readonly requestId?: string }
  | {
      readonly kind: 'ready';
      readonly content: ReadonlyArray<FoleonManagedContent>;
      readonly placements: ReadonlyArray<FoleonPlacement>;
      readonly syncStatus: FoleonSyncStatus | null;
      readonly runs: ReadonlyArray<FoleonSyncRun>;
      readonly managerReadPathProven: boolean;
    };

export function ManageOrchestrator(props: ManageOrchestratorProps): React.ReactNode {
  const api = useMemo(() => createFoleonManagementApi(props.contract), [props.contract]);
  const [state, setState] = useState<LoadState>({ kind: 'loading' });
  const [message, setMessage] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState<FeedManagerWorkspaceKey>('feed-desk');
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);
  const breakpoint = useManageBreakpoint();

  const onSelectKey = useCallback((key: FeedManagerWorkspaceKey): void => {
    setSelectedKey(key);
    if (key !== 'admin') setDiagnosticsOpen(false);
  }, []);

  const openAdminDiagnostics = useCallback((): void => {
    setSelectedKey('admin');
    setDiagnosticsOpen(true);
  }, []);

  const load = async (): Promise<void> => {
    const preflightBlocker = getHostedPreflightBlocker(props.contract);
    if (preflightBlocker?.code === 'token-acquisition-failed') {
      setMessage(null);
      setState({
        kind: 'ready',
        content: [],
        placements: [],
        syncStatus: null,
        runs: [],
        managerReadPathProven: false,
      });
      return;
    }
    if (preflightBlocker) {
      setState({ kind: 'blocked', ...preflightBlocker });
      return;
    }
    setState({ kind: 'loading' });
    try {
      const safeConfig = await api.getSafeConfig().catch((err: unknown) => {
        throw asReadinessError('backend-safe-config-unavailable', err);
      });
      if (!safeConfig.sharePointSiteConfigured || !safeConfig.graphConfigured) {
        setState({
          kind: 'blocked',
          code: 'backend-graph-config-missing',
          message:
            'The Foleon backend is reachable, but its SharePoint Graph/list configuration is incomplete. Reads remain blocked until backend list settings are configured.',
        });
        return;
      }
      const content = await api.listContent().catch((err: unknown) => {
        throw asReadinessError('backend-route-authorization-failed', err);
      });
      const placements = await api.listPlacements().catch((err: unknown) => {
        throw asReadinessError('backend-route-authorization-failed', err);
      });
      const syncStatus = await api.getSyncStatus().catch(() => null);
      const runs = await api.listSyncRuns().catch(() => []);
      if (!safeConfig.foleonApiConfigured) {
        setMessage('Foleon sync is not ready because backend Foleon OAuth configuration is incomplete. Content and placement reads remain available.');
      }
      setState({ kind: 'ready', content, placements, syncStatus, runs, managerReadPathProven: true });
    } catch (err) {
      if (err instanceof FoleonReadinessError) {
        setState({ kind: 'blocked', code: err.code, message: err.message });
        return;
      }
      setState({
        kind: 'error',
        message: err instanceof Error ? err.message : String(err),
        requestId: err instanceof FoleonManagementApiError ? err.requestId : undefined,
      });
    }
  };

  useEffect(() => {
    void load();
  }, [api]);

  const statusChips = useMemo(() => {
    if (state.kind !== 'ready') {
      return buildManagerStatusChips({
        contract: props.contract,
        content: [],
        placements: [],
        syncStatus: null,
        runs: [],
        managerReadPathProven: false,
      });
    }
    return buildManagerStatusChips({
      contract: props.contract,
      content: state.content,
      placements: state.placements,
      syncStatus: state.syncStatus,
      runs: state.runs,
      managerReadPathProven: state.managerReadPathProven,
    });
  }, [state, props.contract]);

  const safeFoleonOpenUrl = useMemo(
    () => resolveSafeFoleonOpenOrigin(props.contract.originPolicy.allowedOrigins),
    [props.contract.originPolicy.allowedOrigins],
  );
  const openFoleonUnavailableReason = safeFoleonOpenUrl
    ? undefined
    : 'Open Foleon needs an approved HTTPS viewer origin (none is configured).';

  const onOpenFoleon = useCallback((): void => {
    if (!safeFoleonOpenUrl) return;
    window.open(safeFoleonOpenUrl, '_blank', 'noopener,noreferrer');
  }, [safeFoleonOpenUrl]);

  if (state.kind === 'loading') {
    return (
      <section
        className={`foleonManageRoot ${shell.shell}`}
        data-foleon-manager-canvas="wide"
        aria-busy="true"
      >
        <FoleonLoadingState />
      </section>
    );
  }
  if (state.kind === 'blocked') {
    return (
      <section className={`foleonManageRoot ${shell.shell}`} data-foleon-manager-canvas="wide">
        <FoleonError
          title="Foleon Manager cannot load yet"
          description={state.message}
          technicalDetails={state.code}
          onRetry={props.onBack}
        />
      </section>
    );
  }
  if (state.kind === 'error') {
    return (
      <section className={`foleonManageRoot ${shell.shell}`} data-foleon-manager-canvas="wide">
        <FoleonError
          title="Unable to load Foleon Manager"
          description={state.message}
          technicalDetails={state.requestId ? `Request ID: ${state.requestId}` : undefined}
          onRetry={(): void => void load()}
        />
      </section>
    );
  }

  const canSync = props.contract.hostMode !== 'sharepoint' || props.contract.foleonReadiness?.syncPathReady === true;
  const tokenAcquisitionDegraded = Boolean(
    state.kind === 'ready' &&
      !state.managerReadPathProven &&
      props.contract.foleonConfigDiagnostics?.blockers.some((b) => b.code === 'token-acquisition-failed'),
  );

  const headerModel = buildFeedManagerHeaderModel({
    canSync,
    tokenAcquisitionDegraded,
    safeFoleonOpenUrl,
    openFoleonUnavailableReason,
    statusChips,
    onSyncDocs: (): void => void runFoleonSync(api, 'docs', load, setMessage),
    onOpenAdminDiagnostics: openAdminDiagnostics,
    onOpenFoleon,
    onBack: props.onBack,
  });

  const tokenDegradedBanner = tokenAcquisitionDegraded ? (
    <div role="status" className={shell.statusBanner} aria-label="API access required">
      <p className={shell.bannerPrimary}>{tokenAcquisitionDegradedBannerPrimary()}</p>
      <p className={shell.bannerNextStep}>{tokenAcquisitionDegradedBannerNextStep()}</p>
      <details className={shell.bannerTechnical}>
        <summary className={shell.bannerTechnicalSummary}>Technical reference</summary>
        <p className={shell.bannerTechnicalBody}>
          Recorded readiness code: token-acquisition-failed. Raw service messages are omitted from this banner.
        </p>
      </details>
      <div className={shell.bannerActions}>
        <HbcButton variant="secondary" onClick={(): void => void load()}>
          Retry API readiness
        </HbcButton>
      </div>
    </div>
  ) : null;

  const statusBanner = message ? (
    <div role="status" className={shell.statusBanner}>
      {message}
    </div>
  ) : null;

  const adminPanel = (
    <FoleonConfigTab
      contract={props.contract}
      managerReadPathProven={state.managerReadPathProven}
      runs={state.runs}
      diagnosticsOpen={diagnosticsOpen}
      onDiagnosticsOpenChange={setDiagnosticsOpen}
    />
  );

  return (
    <Tooltip.Provider delayDuration={280}>
      <section
        className={`foleonManageRoot ${shell.shell}`}
        aria-label="Foleon Feed Manager"
        data-foleon-manager-canvas="wide"
        data-breakpoint-width={breakpoint.widthBand}
        data-breakpoint-short-height={breakpoint.shortHeight ? 'true' : 'false'}
        data-breakpoint-narrow-stable={breakpoint.narrowestStable ? 'true' : 'false'}
        data-breakpoint-row-sharing={breakpoint.rowSharingEligible ? 'true' : 'false'}
        data-manager-layout={breakpoint.rowSharingEligible ? 'three-zone' : breakpoint.widthBand}
      >
        <FoleonFeedManagerApp
          selectedKey={selectedKey}
          onSelectKey={onSelectKey}
          headerModel={headerModel}
          tokenDegradedBanner={tokenDegradedBanner}
          statusBanner={statusBanner}
          adminPanel={adminPanel}
        />
      </section>
    </Tooltip.Provider>
  );
}

class FoleonReadinessError extends Error {
  constructor(
    readonly code: FoleonReadinessIssueCode,
    message: string,
  ) {
    super(message);
    this.name = 'FoleonReadinessError';
  }
}

function asReadinessError(code: FoleonReadinessIssueCode, err: unknown): FoleonReadinessError {
  const suffix = err instanceof FoleonManagementApiError && err.requestId
    ? ` Correlation: ${err.requestId}`
    : '';
  if (code === 'backend-safe-config-unavailable') {
    return new FoleonReadinessError(
      code,
      `Unable to verify backend safe configuration before loading Manager reads.${suffix}`,
    );
  }
  return new FoleonReadinessError(
    code,
    `The backend rejected a Foleon read-route readiness probe. Confirm token audience acceptance and route authorization before enabling Manager reads.${suffix}`,
  );
}

function getHostedPreflightBlocker(
  contract: IFoleonRuntimeContract,
): { readonly code: FoleonReadinessIssueCode; readonly message: string } | null {
  if (contract.hostMode !== 'sharepoint') return null;
  const readiness = contract.foleonReadiness;
  if (contract.foleonConfigDiagnostics?.registryDuplicateActiveKeysDetected) {
    return {
      code: 'registry-duplicate-active-key',
      message: 'Duplicate active Foleon registry keys were detected. Resolve the registry conflict before loading the Manager.',
    };
  }
  if (!readiness?.listBindingsReady) {
    return {
      code: 'list-bindings-missing',
      message: 'Foleon SharePoint list bindings are missing. Confirm the registry list GUID records are active and valid.',
    };
  }
  if (!readiness.backendUrlReady) {
    return {
      code: 'backend-url-missing',
      message: 'Foleon backend API base URL is missing. Confirm FoleonApiBaseUrl is resolved from the registry or explicit webpart properties.',
    };
  }
  if (!readiness.authResourceReady) {
    return {
      code: 'auth-resource-missing',
      message: 'Foleon API resource is missing. Confirm FoleonApiResource is resolved from the registry or explicit webpart properties.',
    };
  }
  if (!readiness.tokenProviderReady) {
    return {
      code: 'token-provider-unavailable',
      message: 'SPFx could not create an AAD token provider for the Foleon API resource.',
    };
  }
  if (!readiness.tokenAcquisitionReady) {
    return {
      code: 'token-acquisition-failed',
      message: consentRequired(propsBlockerMessage(contract))
        ? 'API consent missing; token acquisition failed with consent_required.'
        : 'SPFx token acquisition failed for the resolved Foleon API resource.',
    };
  }
  return null;
}

function propsBlockerMessage(contract: IFoleonRuntimeContract): string {
  return contract.foleonConfigDiagnostics?.blockers
    .filter((blocker) => blocker.code === 'token-acquisition-failed')
    .map((blocker) => blocker.message)
    .join(' ') ?? '';
}

function consentRequired(message: string): boolean {
  const normalized = message.toLowerCase();
  return normalized.includes('consent_required') || normalized.includes('aadsts65001');
}
