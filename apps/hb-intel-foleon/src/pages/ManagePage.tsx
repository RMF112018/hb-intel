import { useEffect, useMemo, useState } from 'react';
import { HbcButton, HbcSearch } from '@hbc/ui-kit/homepage';
import type { IFoleonRuntimeContract } from '../runtime/foleonRuntimeContract.js';
import {
  createFoleonManagementApi,
  FoleonManagementApiError,
  type FoleonManagementApi,
} from '../services/FoleonManagementApi.js';
import type {
  FoleonContentMutation,
  FoleonManagedContent,
  FoleonPlacement,
  FoleonPlacementMutation,
  FoleonSyncRun,
  FoleonSyncStatus,
} from '../types/foleon-management.types.js';
import { FoleonEmpty, FoleonError, FoleonLoadingState } from '../components/FoleonStates.js';

interface ManagePageProps {
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

const SHELL: React.CSSProperties = {
  minHeight: 680,
  padding: 18,
  color: '#17202a',
  background:
    'radial-gradient(circle at top left, rgba(3, 79, 91, 0.18), transparent 34%), linear-gradient(135deg, #f7f2e8 0%, #eef7f4 48%, #f9fbff 100%)',
};

const PANEL: React.CSSProperties = {
  border: '1px solid rgba(23, 32, 42, 0.12)',
  borderRadius: 22,
  background: 'rgba(255, 255, 255, 0.82)',
  boxShadow: '0 24px 70px rgba(20, 50, 62, 0.12)',
};

export function ManagePage(props: ManagePageProps): React.ReactNode {
  const api = useMemo(() => createFoleonManagementApi(props.contract), [props.contract]);
  const [state, setState] = useState<LoadState>({ kind: 'loading' });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const load = async (): Promise<void> => {
    if (props.contract.hostMode === 'sharepoint' && !props.contract.apiBaseUrl && !props.contract.getAccessToken) {
      setState({
        kind: 'blocked',
        message:
          'The connector needs a backend API URL or SPFx token provider configuration before writes are enabled.',
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
    return <section style={SHELL}><FoleonLoadingState /></section>;
  }
  if (state.kind === 'blocked') {
    return (
      <section style={SHELL}>
        <FoleonError title="Foleon Connector is blocked" description={state.message} onRetry={props.onBack} />
      </section>
    );
  }
  if (state.kind === 'error') {
    return (
      <section style={SHELL}>
        <FoleonError
          title="Unable to load the Foleon Connector"
          description={`${state.message}${state.requestId ? ` Correlation: ${state.requestId}` : ''}`}
          onRetry={(): void => void load()}
        />
      </section>
    );
  }

  return (
    <section aria-label="Foleon Connector management" style={SHELL}>
      <header
        style={{
          ...PANEL,
          padding: 24,
          marginBottom: 16,
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) auto',
          gap: 16,
          alignItems: 'center',
        }}
      >
        <div>
          <p style={{ margin: '0 0 8px', letterSpacing: 1.8, textTransform: 'uppercase', fontSize: 12 }}>
            Governed Marketing Operations
          </p>
          <h2 style={{ margin: 0, fontSize: 'clamp(28px, 5vw, 52px)', lineHeight: 0.92 }}>
            Foleon Connector
          </h2>
          <p style={{ margin: '12px 0 0', maxWidth: 720 }}>
            Manage registry metadata, reader validation, homepage placements, and backend sync proof without
            opening the SharePoint lists directly.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <HbcButton variant="secondary" onClick={props.onBack}>Back to highlights</HbcButton>
          <HbcButton variant="primary" onClick={(): void => void runSync(api, 'docs', load, setMessage)}>
            Sync Docs
          </HbcButton>
          <HbcButton variant="secondary" onClick={(): void => void runSync(api, 'projects', load, setMessage)}>
            Sync Projects
          </HbcButton>
        </div>
      </header>

      {message ? (
        <div role="status" style={{ ...PANEL, padding: 12, marginBottom: 16 }}>
          {message}
        </div>
      ) : null}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 0.9fr) minmax(0, 1.5fr)', gap: 16 }}>
        <aside style={{ ...PANEL, padding: 16 }}>
          <h3 style={{ marginTop: 0 }}>Registry</h3>
          <HbcSearch
            variant="local"
            value={query}
            onSearch={setQuery}
            placeholder="Search title, Doc ID, region"
          />
          <div style={{ display: 'grid', gap: 10, marginTop: 14, maxHeight: 560, overflow: 'auto' }}>
            {filteredContent.length === 0 ? (
              <FoleonEmpty title="No content matches." description="Clear search or sync Foleon Docs." />
            ) : filteredContent.map((record) => (
              <button
                key={record.id}
                type="button"
                onClick={(): void => setSelectedId(record.id)}
                style={contentButtonStyle(record.id === selected?.id, record.validationStatus)}
              >
                <strong>{record.title}</strong>
                <span>Doc {record.foleonDocId} • {record.publishStatus}</span>
                <small>{record.validationStatus}{record.blockingReasons.length ? ` — ${record.blockingReasons[0]}` : ''}</small>
              </button>
            ))}
          </div>
        </aside>

        <main style={{ display: 'grid', gap: 16 }}>
          <DashboardCards
            content={state.content}
            placements={state.placements}
            syncStatus={state.syncStatus}
          />
          {selected ? (
            <ContentEditor
              record={selected}
              api={api}
              onRefresh={load}
              setMessage={setMessage}
            />
          ) : (
            <FoleonEmpty title="No registry records yet." description="Create a draft or sync Foleon Docs." />
          )}
          <PlacementBoard
            content={state.content}
            placements={state.placements}
            api={api}
            onRefresh={load}
            setMessage={setMessage}
          />
          <SyncRuns runs={state.runs} />
        </main>
      </div>
    </section>
  );
}

function DashboardCards(props: {
  readonly content: ReadonlyArray<FoleonManagedContent>;
  readonly placements: ReadonlyArray<FoleonPlacement>;
  readonly syncStatus: FoleonSyncStatus | null;
}): React.ReactNode {
  const published = props.content.filter((record) => record.publishStatus === 'Published' && record.isVisible).length;
  const blocked = props.content.filter((record) => record.validationStatus === 'blocked').length;
  const activePlacements = props.placements.filter((placement) => placement.isActive).length;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
      <Metric label="Published" value={published} tone="green" />
      <Metric label="Blocked" value={blocked} tone="red" />
      <Metric label="Active placements" value={activePlacements} tone="blue" />
      <Metric label="Sync health" value={props.syncStatus?.health ?? 'unknown'} tone="gold" />
    </div>
  );
}

function Metric(props: { readonly label: string; readonly value: number | string; readonly tone: string }): React.ReactNode {
  return (
    <div style={{ ...PANEL, padding: 16, borderTop: `5px solid ${toneColor(props.tone)}` }}>
      <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.2 }}>{props.label}</div>
      <div style={{ fontSize: 28, fontWeight: 800 }}>{props.value}</div>
    </div>
  );
}

function ContentEditor(props: {
  readonly record: FoleonManagedContent;
  readonly api: FoleonManagementApi;
  readonly onRefresh: () => Promise<void>;
  readonly setMessage: (message: string | null) => void;
}): React.ReactNode {
  const [draft, setDraft] = useState(() => toContentMutation(props.record));
  useEffect(() => setDraft(toContentMutation(props.record)), [props.record]);
  const save = async (): Promise<void> => {
    await props.api.updateContent(props.record.id, draft);
    props.setMessage('Content metadata saved through the backend route.');
    await props.onRefresh();
  };
  return (
    <section style={{ ...PANEL, padding: 18 }} aria-label="Content detail editor">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <h3 style={{ marginTop: 0 }}>Content Detail</h3>
        <StatusPill status={props.record.validationStatus} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        <Field label="Title" value={draft.title} onChange={(title): void => setDraft({ ...draft, title })} />
        <Field
          label="Foleon Doc ID"
          value={String(draft.foleonDocId)}
          onChange={(value): void => setDraft({ ...draft, foleonDocId: Number.parseInt(value, 10) || 0 })}
        />
        <SelectField
          label="Status"
          value={draft.publishStatus}
          options={['Draft', 'Preview', 'Published', 'Archived', 'Offline', 'Suppressed']}
          onChange={(publishStatus): void => setDraft({ ...draft, publishStatus })}
        />
        <SelectField
          label="Open mode"
          value={draft.openMode}
          options={['Inline Reader', 'Fullscreen Reader', 'New Tab Only']}
          onChange={(openMode): void => setDraft({ ...draft, openMode: openMode as FoleonContentMutation['openMode'] })}
        />
        <Field label="Published URL" value={draft.publishedUrl ?? ''} onChange={(publishedUrl): void => setDraft({ ...draft, publishedUrl })} />
        <Field label="Embed URL" value={draft.embedUrl ?? ''} onChange={(embedUrl): void => setDraft({ ...draft, embedUrl })} />
        <Field label="Region" value={draft.region ?? ''} onChange={(region): void => setDraft({ ...draft, region })} />
        <Field label="Sector" value={draft.sector ?? ''} onChange={(sector): void => setDraft({ ...draft, sector })} />
      </div>
      <label style={{ display: 'block', marginTop: 12 }}>
        <span style={{ display: 'block', fontWeight: 700 }}>Summary</span>
        <textarea
          value={draft.summary ?? ''}
          onChange={(event): void => setDraft({ ...draft, summary: event.currentTarget.value })}
          rows={4}
          style={inputStyle}
        />
      </label>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '14px 0' }}>
        <Checkbox label="Visible" checked={draft.isVisible} onChange={(isVisible): void => setDraft({ ...draft, isVisible })} />
        <Checkbox label="Homepage eligible" checked={draft.isHomepageEligible} onChange={(isHomepageEligible): void => setDraft({ ...draft, isHomepageEligible })} />
        <Checkbox label="Allow embed" checked={draft.allowEmbed} onChange={(allowEmbed): void => setDraft({ ...draft, allowEmbed })} />
        <Checkbox label="Requires external open" checked={draft.requiresExternalOpen} onChange={(requiresExternalOpen): void => setDraft({ ...draft, requiresExternalOpen })} />
      </div>
      <ValidationList reasons={props.record.blockingReasons} />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
        <HbcButton variant="primary" onClick={(): void => void save()}>Save</HbcButton>
        <HbcButton variant="secondary" onClick={(): void => void validate(props, props.record.id)}>Validate</HbcButton>
        <HbcButton variant="secondary" onClick={(): void => void publish(props, props.record.id)}>Publish</HbcButton>
        <HbcButton variant="secondary" onClick={(): void => void suppress(props, props.record.id)}>Suppress</HbcButton>
      </div>
    </section>
  );
}

function PlacementBoard(props: {
  readonly content: ReadonlyArray<FoleonManagedContent>;
  readonly placements: ReadonlyArray<FoleonPlacement>;
  readonly api: FoleonManagementApi;
  readonly onRefresh: () => Promise<void>;
  readonly setMessage: (message: string | null) => void;
}): React.ReactNode {
  const firstContent = props.content[0];
  const [draft, setDraft] = useState<FoleonPlacementMutation>({
    title: 'Homepage feature',
    placementKey: 'Hero',
    contentItemId: firstContent?.sharePointItemId ?? 0,
    isActive: true,
    sortRank: 1,
    layoutVariant: 'Large Feature',
  });
  useEffect(() => {
    if (firstContent && draft.contentItemId === 0) {
      setDraft((current) => ({ ...current, contentItemId: firstContent.sharePointItemId }));
    }
  }, [draft.contentItemId, firstContent]);
  const create = async (): Promise<void> => {
    await props.api.createPlacement(draft);
    props.setMessage('Homepage placement saved with backend ContentIdCache validation.');
    await props.onRefresh();
  };
  return (
    <section style={{ ...PANEL, padding: 18 }} aria-label="Placement manager">
      <h3 style={{ marginTop: 0 }}>Placement Manager</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12 }}>
        <Field label="Placement title" value={draft.title} onChange={(title): void => setDraft({ ...draft, title })} />
        <SelectField
          label="Placement"
          value={draft.placementKey}
          options={['Hero', 'Primary Card', 'Secondary Card', 'Carousel', 'Archive Rail']}
          onChange={(placementKey): void => setDraft({ ...draft, placementKey: placementKey as FoleonPlacementMutation['placementKey'] })}
        />
        <SelectField
          label="Content"
          value={String(draft.contentItemId)}
          options={props.content.map((record) => `${record.sharePointItemId}:${record.title}`)}
          onChange={(value): void => setDraft({ ...draft, contentItemId: Number.parseInt(value.split(':')[0] ?? '0', 10) })}
        />
        <Field label="Sort rank" value={String(draft.sortRank)} onChange={(value): void => setDraft({ ...draft, sortRank: Number.parseInt(value, 10) || 0 })} />
      </div>
      <div style={{ marginTop: 12 }}>
        <Checkbox label="Active placement" checked={draft.isActive} onChange={(isActive): void => setDraft({ ...draft, isActive })} />
      </div>
      <HbcButton variant="primary" onClick={(): void => void create()}>Create placement</HbcButton>
      <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
        {props.placements.map((placement) => (
          <article key={placement.id} style={{ padding: 12, borderRadius: 14, background: '#f7faf9' }}>
            <strong>{placement.title}</strong>
            <div>{placement.placementKey} • Doc {placement.foleonDocId} • Rank {placement.sortRank}</div>
            <ValidationList reasons={placement.blockingReasons} />
          </article>
        ))}
      </div>
    </section>
  );
}

function SyncRuns(props: { readonly runs: ReadonlyArray<FoleonSyncRun> }): React.ReactNode {
  return (
    <section style={{ ...PANEL, padding: 18 }} aria-label="Sync run history">
      <h3 style={{ marginTop: 0 }}>Sync Runs</h3>
      {props.runs.length === 0 ? (
        <FoleonEmpty title="No sync runs yet." description="Run a Docs sync to create operational proof." />
      ) : props.runs.slice(0, 6).map((run) => (
        <article key={run.id} style={{ padding: '10px 0', borderTop: '1px solid rgba(23, 32, 42, 0.12)' }}>
          <strong>{run.runType} {run.status}</strong>
          <div>{run.itemsScanned} scanned • {run.itemsFailed} failed • {run.correlationId}</div>
          {run.message ? <small>{run.message}</small> : null}
        </article>
      ))}
    </section>
  );
}

function Field(props: {
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
}): React.ReactNode {
  return (
    <label style={{ display: 'block' }}>
      <span style={{ display: 'block', fontWeight: 700 }}>{props.label}</span>
      <input value={props.value} onChange={(event): void => props.onChange(event.currentTarget.value)} style={inputStyle} />
    </label>
  );
}

function SelectField(props: {
  readonly label: string;
  readonly value: string;
  readonly options: ReadonlyArray<string>;
  readonly onChange: (value: string) => void;
}): React.ReactNode {
  return (
    <label style={{ display: 'block' }}>
      <span style={{ display: 'block', fontWeight: 700 }}>{props.label}</span>
      <select value={props.value} onChange={(event): void => props.onChange(event.currentTarget.value)} style={inputStyle}>
        {props.options.map((option) => (
          <option key={option} value={option.split(':')[0]}>{option.includes(':') ? option.split(':').slice(1).join(':') : option}</option>
        ))}
      </select>
    </label>
  );
}

function Checkbox(props: {
  readonly label: string;
  readonly checked: boolean;
  readonly onChange: (checked: boolean) => void;
}): React.ReactNode {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
      <input type="checkbox" checked={props.checked} onChange={(event): void => props.onChange(event.currentTarget.checked)} />
      {props.label}
    </label>
  );
}

function StatusPill(props: { readonly status: FoleonManagedContent['validationStatus'] }): React.ReactNode {
  return (
    <span style={{
      borderRadius: 999,
      padding: '6px 10px',
      background: toneColor(props.status),
      color: props.status === 'warning' ? '#17202a' : '#fff',
      fontWeight: 800,
    }}>
      {props.status}
    </span>
  );
}

function ValidationList(props: { readonly reasons: ReadonlyArray<string> }): React.ReactNode {
  if (props.reasons.length === 0) return <p style={{ margin: '8px 0', color: '#286f45' }}>Validation clear.</p>;
  return (
    <ul style={{ margin: '8px 0', color: '#8f2f20' }}>
      {props.reasons.map((reason) => <li key={reason}>{reason}</li>)}
    </ul>
  );
}

async function validate(
  props: { readonly api: FoleonManagementApi; readonly onRefresh: () => Promise<void>; readonly setMessage: (message: string | null) => void },
  id: string,
): Promise<void> {
  const result = await props.api.validateContent(id);
  props.setMessage(`Validation ${result.status}; correlation ${result.correlationId}.`);
  await props.onRefresh();
}

async function publish(
  props: { readonly api: FoleonManagementApi; readonly onRefresh: () => Promise<void>; readonly setMessage: (message: string | null) => void },
  id: string,
): Promise<void> {
  await props.api.publishContent(id);
  props.setMessage('Content published through backend validation.');
  await props.onRefresh();
}

async function suppress(
  props: { readonly api: FoleonManagementApi; readonly onRefresh: () => Promise<void>; readonly setMessage: (message: string | null) => void },
  id: string,
): Promise<void> {
  await props.api.suppressContent(id);
  props.setMessage('Content suppressed through backend validation.');
  await props.onRefresh();
}

async function runSync(
  api: FoleonManagementApi,
  type: 'docs' | 'projects',
  onRefresh: () => Promise<void>,
  setMessage: (message: string | null) => void,
): Promise<void> {
  const run = type === 'docs' ? await api.syncDocs() : await api.syncProjects();
  setMessage(`${run.runType} sync ${run.status}; correlation ${run.correlationId}.`);
  await onRefresh();
}

function toContentMutation(record: FoleonManagedContent): FoleonContentMutation {
  return {
    etag: record.etag,
    title: record.title,
    foleonDocId: record.foleonDocId,
    contentTypeKey: record.contentTypeKey,
    publishStatus: record.publishStatus,
    isVisible: record.isVisible,
    isHomepageEligible: record.isHomepageEligible,
    publishedUrl: record.publishedUrl,
    embedUrl: record.embedUrl,
    thumbnailUrl: record.thumbnailUrl,
    summary: record.summary,
    region: record.region,
    sector: record.sector,
    openMode: record.openMode ?? 'Inline Reader',
    allowEmbed: record.allowEmbed ?? true,
    requiresExternalOpen: record.requiresExternalOpen ?? false,
    adminNotes: record.adminNotes,
  };
}

function contentButtonStyle(selected: boolean, status: FoleonManagedContent['validationStatus']): React.CSSProperties {
  return {
    textAlign: 'left',
    border: `1px solid ${selected ? '#034f5b' : 'rgba(23, 32, 42, 0.12)'}`,
    borderLeft: `6px solid ${toneColor(status)}`,
    background: selected ? '#e7f4f1' : '#fff',
    borderRadius: 16,
    padding: 12,
    display: 'grid',
    gap: 4,
    cursor: 'pointer',
  };
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  border: '1px solid rgba(23, 32, 42, 0.16)',
  borderRadius: 12,
  padding: '10px 12px',
  background: '#fff',
};

function toneColor(tone: string): string {
  if (tone === 'valid' || tone === 'green') return '#286f45';
  if (tone === 'blocked' || tone === 'red') return '#a33a2a';
  if (tone === 'warning' || tone === 'gold') return '#d6a333';
  if (tone === 'blue') return '#034f5b';
  return '#64727a';
}
