import { useEffect, useMemo, useState } from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
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
import { HomepageFoleonContentTab } from './HomepageFoleonContentTab.js';
import { ManageShellHeader } from './ManageShellHeader.js';
import { ManageSyncPanel } from './ManageSyncPanel.js';
import { sortManagedContentForHomepage } from './manageLaneViewModel.js';
import { runFoleonSync } from './manageWorkflows.js';
import { ManageTabs, type ManageTabKey } from './ManageTabs.js';
import { useManageBreakpoint } from './useManageBreakpoint.js';
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
    };

export function ManageOrchestrator(props: ManageOrchestratorProps): React.ReactNode {
  const api = useMemo(() => createFoleonManagementApi(props.contract), [props.contract]);
  const [state, setState] = useState<LoadState>({ kind: 'loading' });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<ManageTabKey>('content');
  const breakpoint = useManageBreakpoint();

  const load = async (): Promise<void> => {
    const preflightBlocker = getHostedPreflightBlocker(props.contract);
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
      setState({ kind: 'ready', content, placements, syncStatus, runs });
      setSelectedId((current) => current ?? content[0]?.id ?? null);
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

  const ready = state.kind === 'ready' ? state : null;
  const selected = ready?.content.find((record) => record.id === selectedId) ?? ready?.content[0] ?? null;
  const filteredContent = useMemo(() => {
    if (!ready) return [];
    const needle = query.trim().toLowerCase();
    const ordered = sortManagedContentForHomepage(ready.content);
    if (!needle) return ordered;
    return ordered.filter((record) =>
      [record.title, record.summary, record.region, record.sector, String(record.foleonDocId)]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(needle),
    );
  }, [ready, query]);

  if (state.kind === 'loading') {
    return (
      <section className={`foleonManageRoot ${shell.shell}`} aria-busy="true">
        <FoleonLoadingState />
      </section>
    );
  }
  if (state.kind === 'blocked') {
    return (
      <section className={`foleonManageRoot ${shell.shell}`}>
        <FoleonError title="Foleon Connector is blocked" description={`${state.code}: ${state.message}`} onRetry={props.onBack} />
      </section>
    );
  }
  if (state.kind === 'error') {
    return (
      <section className={`foleonManageRoot ${shell.shell}`}>
        <FoleonError
          title="Unable to load the Foleon Connector"
          description={`${state.message}${state.requestId ? ` Correlation: ${state.requestId}` : ''}`}
          onRetry={(): void => void load()}
        />
      </section>
    );
  }

  const canSync = props.contract.hostMode !== 'sharepoint' || props.contract.foleonReadiness?.syncPathReady === true;

  return (
    <Tooltip.Provider delayDuration={280}>
      <section
        className={`foleonManageRoot ${shell.shell}`}
        aria-label="Foleon Connector management"
        data-breakpoint-width={breakpoint.widthBand}
        data-breakpoint-short-height={breakpoint.shortHeight ? 'true' : 'false'}
        data-breakpoint-narrow-stable={breakpoint.narrowestStable ? 'true' : 'false'}
        data-breakpoint-row-sharing={breakpoint.rowSharingEligible ? 'true' : 'false'}
      >
        <ManageShellHeader
          onBack={props.onBack}
          onSyncDocs={(): void => void runFoleonSync(api, 'docs', load, setMessage)}
          onSyncProjects={(): void => void runFoleonSync(api, 'projects', load, setMessage)}
          canSync={canSync}
          syncBlockReason={canSync ? undefined : 'sync path is not ready'}
        />

        {message ? (
          <div role="status" className={shell.statusBanner}>
            {message}
          </div>
        ) : null}

        <ManageTabs selected={selectedTab} onSelect={setSelectedTab} />
        {selectedTab === 'content' ? (
          <HomepageFoleonContentTab
            contract={props.contract}
            content={state.content}
            placements={state.placements}
            syncStatus={state.syncStatus}
            api={api}
            query={query}
            onQueryChange={setQuery}
            filteredContent={filteredContent}
            selected={selected}
            selectedId={selected?.id ?? null}
            onSelect={setSelectedId}
            onRefresh={load}
            setMessage={setMessage}
          />
        ) : (
          <FoleonConfigTab contract={props.contract} managerReadPathProven />
        )}
        <ManageSyncPanel runs={state.runs} />
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
      message: 'SPFx token acquisition failed for the resolved Foleon API resource.',
    };
  }
  return null;
}
