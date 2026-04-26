import { useEffect, useMemo, useState } from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import type { IFoleonRuntimeContract } from '../../runtime/foleonRuntimeContract.js';
import { createFoleonManagementApi, FoleonManagementApiError } from '../../services/FoleonManagementApi.js';
import type {
  FoleonManagedContent,
  FoleonPlacement,
  FoleonSyncRun,
  FoleonSyncStatus,
} from '../../types/foleon-management.types.js';
import { FoleonEmpty, FoleonError, FoleonLoadingState } from '../../components/FoleonStates.js';
import { ManageContentEditorPanel } from './ManageContentEditorPanel.js';
import { ManageMetricCards } from './ManageMetricCards.js';
import { ManagePlacementPanel } from './ManagePlacementPanel.js';
import { ManagePreviewGuidancePanel } from './ManagePreviewGuidancePanel.js';
import { ManageRegistryPanel } from './ManageRegistryPanel.js';
import { ManageShellHeader } from './ManageShellHeader.js';
import { ManageSyncPanel } from './ManageSyncPanel.js';
import { buildReaderLaneWarnings, toContentMutation } from './manageMutationUtils.js';
import { runFoleonSync } from './manageWorkflows.js';
import { useManageBreakpoint } from './useManageBreakpoint.js';
import './foleonManageTokens.css';
import shell from './manageShell.module.css';

export interface ManageOrchestratorProps {
  readonly contract: IFoleonRuntimeContract;
  readonly onBack: () => void;
}

type LoadState =
  | { readonly kind: 'loading' }
  | { readonly kind: 'blocked'; readonly message: string }
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
  const breakpoint = useManageBreakpoint();

  const load = async (): Promise<void> => {
    if (props.contract.hostMode === 'sharepoint' && props.contract.foleonReadiness?.writePathReady !== true) {
      setState({
        kind: 'blocked',
        message:
          'The connector needs a backend API URL, Foleon API resource, SPFx token provider, and backend readiness proof before writes are enabled.',
      });
      return;
    }
    setState({ kind: 'loading' });
    try {
      const [content, placements, syncStatus, runs] = await Promise.all([
        api.listContent(),
        api.listPlacements(),
        api.getSyncStatus(),
        api.listSyncRuns().catch(() => []),
      ]);
      setState({ kind: 'ready', content, placements, syncStatus, runs });
      setSelectedId((current) => current ?? content[0]?.id ?? null);
    } catch (err) {
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
    if (!needle) return ready.content;
    return ready.content.filter((record) =>
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
        <FoleonError title="Foleon Connector is blocked" description={state.message} onRetry={props.onBack} />
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

  const published = state.content.filter((record) => record.publishStatus === 'Published' && record.isVisible).length;
  const homepageReady = state.content.filter(
    (record) => record.publishStatus === 'Published' && record.isVisible && record.isHomepageEligible,
  ).length;
  const blocked = state.content.filter((record) => record.validationStatus === 'blocked').length;
  const activePlacements = state.placements.filter((placement) => placement.isActive).length;
  const laneWarningCount = state.content.reduce((count, record) => count + buildReaderLaneWarnings({
    draft: toContentMutation(record),
    record,
    allContent: state.content,
    placements: state.placements,
  }).length, 0);
  const shouldShowPreviewGuidance = state.content.length === 0 || published === 0 || homepageReady === 0;

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
        />

        {message ? (
          <div role="status" className={shell.statusBanner}>
            {message}
          </div>
        ) : null}

        <div className={`${shell.layout} ${breakpoint.layoutGridClass}`}>
          <ManageRegistryPanel
            query={query}
            onQueryChange={setQuery}
            filteredContent={filteredContent}
            selectedId={selected?.id ?? null}
            onSelect={setSelectedId}
          />

          <main className={shell.main}>
            <ManageMetricCards
              published={published}
              blocked={blocked}
              activePlacements={activePlacements}
              laneWarnings={laneWarningCount}
              syncHealth={state.syncStatus?.health ?? 'unknown'}
            />
            {shouldShowPreviewGuidance ? (
              <ManagePreviewGuidancePanel
                publicReadyContentCount={published}
                homepageReadyContentCount={homepageReady}
              />
            ) : null}
            {selected ? (
              <ManageContentEditorPanel
                record={selected}
                allContent={state.content}
                placements={state.placements}
                api={api}
                onRefresh={load}
                setMessage={setMessage}
              />
            ) : (
              <FoleonEmpty title="No registry records yet." description="Create a draft or sync Foleon Docs." />
            )}
            <ManagePlacementPanel
              content={state.content}
              placements={state.placements}
              api={api}
              onRefresh={load}
              setMessage={setMessage}
            />
            <ManageSyncPanel runs={state.runs} />
          </main>
        </div>
      </section>
    </Tooltip.Provider>
  );
}
