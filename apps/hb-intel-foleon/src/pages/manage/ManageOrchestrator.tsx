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
import { HomepageFoleonContentTab } from './HomepageFoleonContentTab.js';
import { buildManagerStatusChips, resolveSafeFoleonOpenOrigin } from './manageHeaderStatusModel.js';
import { ManageShellHeader } from './ManageShellHeader.js';
import {
  buildFoleonLaneViewModels,
  pickDefaultLaneSelection,
  sortManagedContentForHomepage,
} from './manageLaneViewModel.js';
import { readerLaneForContent, type FoleonReaderLane } from './manageMutationUtils.js';
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
      readonly managerReadPathProven: boolean;
    };

export function ManageOrchestrator(props: ManageOrchestratorProps): React.ReactNode {
  const api = useMemo(() => createFoleonManagementApi(props.contract), [props.contract]);
  const [state, setState] = useState<LoadState>({ kind: 'loading' });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedLane, setSelectedLane] = useState<FoleonReaderLane | null>(null);
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<ManageTabKey>('content');
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);
  const breakpoint = useManageBreakpoint();

  const selectTab = useCallback((tab: ManageTabKey): void => {
    setSelectedTab(tab);
    if (tab === 'content') setDiagnosticsOpen(false);
  }, []);

  const openDiagnostics = useCallback((): void => {
    setSelectedTab('config');
    setDiagnosticsOpen(true);
  }, []);

  const load = async (): Promise<void> => {
    const preflightBlocker = getHostedPreflightBlocker(props.contract);
    if (preflightBlocker?.code === 'token-acquisition-failed') {
      setMessage(`${preflightBlocker.message} Approve HB SharePoint Creator / access_as_user in SharePoint Admin Center API access.`);
      setState({
        kind: 'ready',
        content: [],
        placements: [],
        syncStatus: null,
        runs: [],
        managerReadPathProven: false,
      });
      const initDegraded = resolveInitialSelection(props.contract, [], [], false);
      setSelectedId((current) => current ?? initDegraded.contentId);
      setSelectedLane((current) => current ?? initDegraded.lane);
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
      const init = resolveInitialSelection(props.contract, content, placements, true);
      setSelectedId((current) => current ?? init.contentId);
      setSelectedLane((current) => current ?? init.lane);
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
  const lanes = useMemo(
    () =>
      ready
        ? buildLanesForOrchestrator(props.contract, ready.content, ready.placements, ready.managerReadPathProven)
        : [],
    [ready, props.contract],
  );
  const defaultLanePick = useMemo(
    () => (lanes.length > 0 ? pickDefaultLaneSelection(lanes) : { lane: 'project-spotlight' as const, contentId: null }),
    [lanes],
  );
  const effectiveSelectedLane = selectedLane ?? defaultLanePick.lane;

  const selectLane = useCallback(
    (lane: FoleonReaderLane): void => {
      const vm = lanes.find((entry) => entry.lane === lane);
      setSelectedLane(lane);
      setSelectedId(vm?.activeContent?.id ?? vm?.stagedContent?.id ?? null);
    },
    [lanes],
  );

  const selectRegistryRecord = useCallback(
    (id: string): void => {
      if (state.kind !== 'ready') return;
      setSelectedId(id);
      const record = state.content.find((entry) => entry.id === id);
      const lane = record ? readerLaneForContent(record) : null;
      if (lane) setSelectedLane(lane);
    },
    [state],
  );

  const selected = useMemo(() => {
    if (!ready || !selectedId) return null;
    return ready.content.find((record) => record.id === selectedId) ?? null;
  }, [ready, selectedId]);
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
      <section className={`foleonManageRoot ${shell.shell}`}>
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

  return (
    <Tooltip.Provider delayDuration={280}>
      <section
        className={`foleonManageRoot ${shell.shell}`}
        aria-label="Foleon Manager"
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
          statusChips={statusChips}
          safeFoleonOpenUrl={safeFoleonOpenUrl}
          openFoleonUnavailableReason={openFoleonUnavailableReason}
          onViewDiagnostics={openDiagnostics}
        />

        {message ? (
          <div role="status" className={shell.statusBanner}>
            {message}
            {props.contract.foleonConfigDiagnostics?.blockers.some((blocker) => blocker.code === 'token-acquisition-failed') ? (
              <HbcButton variant="secondary" onClick={(): void => void load()}>
                Retry API readiness
              </HbcButton>
            ) : null}
          </div>
        ) : null}

        <ManageTabs selected={selectedTab} onSelect={selectTab} />
        {selectedTab === 'content' ? (
          <HomepageFoleonContentTab
            contract={props.contract}
            managerReadPathProven={state.managerReadPathProven}
            content={state.content}
            placements={state.placements}
            syncStatus={state.syncStatus}
            api={api}
            query={query}
            onQueryChange={setQuery}
            filteredContent={filteredContent}
            selected={selected}
            selectedId={selectedId}
            selectedLane={effectiveSelectedLane}
            onSelectLane={selectLane}
            onSelectRecord={selectRegistryRecord}
            onRefresh={load}
            setMessage={setMessage}
          />
        ) : (
          <FoleonConfigTab
            contract={props.contract}
            managerReadPathProven={state.managerReadPathProven}
            runs={state.runs}
            diagnosticsOpen={diagnosticsOpen}
            onDiagnosticsOpenChange={setDiagnosticsOpen}
          />
        )}
      </section>
    </Tooltip.Provider>
  );
}

function buildLanesForOrchestrator(
  contract: IFoleonRuntimeContract,
  content: ReadonlyArray<FoleonManagedContent>,
  placements: ReadonlyArray<FoleonPlacement>,
  managerReadPathProven: boolean,
): ReturnType<typeof buildFoleonLaneViewModels> {
  const readiness = contract.foleonReadiness;
  const effectiveReadiness = readiness
    ? { ...readiness, backendSafeConfigReady: true, readPathReady: true, writePathReady: readiness.writePathReady }
    : readiness;
  return buildFoleonLaneViewModels({
    content,
    placements,
    readiness: effectiveReadiness,
    hasLoadedReadPath: managerReadPathProven,
  });
}

/** Lane-priority default; if that lane has no record, fall back to first sorted record for library/orphan UX. */
function resolveInitialSelection(
  contract: IFoleonRuntimeContract,
  content: ReadonlyArray<FoleonManagedContent>,
  placements: ReadonlyArray<FoleonPlacement>,
  managerReadPathProven: boolean,
): { readonly contentId: string | null; readonly lane: FoleonReaderLane } {
  const lanes = buildLanesForOrchestrator(contract, content, placements, managerReadPathProven);
  const pick = pickDefaultLaneSelection(lanes);
  if (pick.contentId) return pick;
  if (content.length === 0) return pick;
  const first = sortManagedContentForHomepage(content)[0];
  const lane = readerLaneForContent(first) ?? pick.lane;
  return { contentId: first.id, lane };
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
