import { useEffect, useMemo, useState } from 'react';
import { HbcSearch, HbcButton } from '@hbc/ui-kit/homepage';
import type { FoleonContentRecord, FoleonContentType } from '../types/foleon-content.types.js';
import type { IFoleonRuntimeContract } from '../runtime/foleonRuntimeContract.js';
import { fetchFoleonContent } from '../services/FoleonContentService.js';
import { FoleonCard } from '../components/FoleonCard.js';
import { FoleonEmpty, FoleonError, FoleonLoadingState } from '../components/FoleonStates.js';

interface ContentHubPageProps {
  readonly contract: IFoleonRuntimeContract;
  readonly onOpenReader: (record: FoleonContentRecord) => void;
  readonly onOpenExternal: (record: FoleonContentRecord) => void;
  readonly onSearch: (query: string) => void;
  readonly onBack: () => void;
}

const CONTENT_TYPE_FILTERS: ReadonlyArray<FoleonContentType | 'All'> = [
  'All',
  'Project Highlight',
  'Newsletter',
  'Company News',
  'Market Update',
  'Leadership',
];

export function ContentHubPage(props: ContentHubPageProps): React.ReactNode {
  const { contract, onOpenReader, onOpenExternal, onSearch, onBack } = props;
  const [state, setState] = useState<HubState>({ kind: 'loading' });
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<FoleonContentType | 'All'>('All');

  useEffect(() => {
    if (!contract.siteUrl || !contract.listIds.contentRegistry) {
      setState({ kind: 'error', message: 'Foleon content hub configuration is incomplete.' });
      return;
    }
    const controller = new AbortController();
    void (async (): Promise<void> => {
      try {
        const records = await fetchFoleonContent({
          siteUrl: contract.siteUrl!,
          contentRegistryListId: contract.listIds.contentRegistry!,
          publishedOnly: true,
          top: 200,
          signal: controller.signal,
        });
        setState({ kind: 'ready', records });
      } catch (err) {
        if ((err as { name?: string }).name === 'AbortError') return;
        setState({ kind: 'error', message: (err as Error).message });
      }
    })();
    return (): void => controller.abort();
  }, [contract]);

  const filtered = useMemo(() => {
    if (state.kind !== 'ready') return [];
    const q = query.trim().toLowerCase();
    return state.records
      .filter((record) => {
        if (typeFilter !== 'All' && record.contentTypeKey !== typeFilter) return false;
        if (!q) return true;
        const haystack = [
          record.title,
          record.summary ?? '',
          record.relatedProjectName ?? '',
          record.relatedProjectNumber ?? '',
          record.foleonProjectName ?? '',
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(q);
      })
      .sort(comparePublishDateDesc);
  }, [state, query, typeFilter]);

  const body =
    state.kind === 'loading' ? (
      <FoleonLoadingState />
    ) : state.kind === 'error' ? (
      <FoleonError title="Unable to load Foleon archive" description={state.message} />
    ) : filtered.length === 0 ? (
      <FoleonEmpty
        title="No publications match your filters."
        description="Try clearing the search box or changing the content type."
      />
    ) : (
      <div
        style={{
          display: 'grid',
          gap: 16,
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        }}
      >
        {filtered.map((record) => (
          <FoleonCard
            key={record.id}
            record={record}
            variant="compact"
            onOpen={onOpenReader}
            onExternal={onOpenExternal}
          />
        ))}
      </div>
    );

  return (
    <section aria-label="Foleon content archive" style={{ padding: 16 }}>
      <header style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        <HbcButton variant="secondary" onClick={onBack}>
          Back
        </HbcButton>
        <h2 style={{ margin: 0 }}>All publications</h2>
        <div style={{ flex: 1, minWidth: 220 }}>
          <HbcSearch
            variant="local"
            value={query}
            onSearch={(next: string): void => {
              setQuery(next);
              onSearch(next);
            }}
            placeholder="Search title, summary, project"
          />
        </div>
      </header>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {CONTENT_TYPE_FILTERS.map((filter) => (
          <HbcButton
            key={filter}
            variant={typeFilter === filter ? 'primary' : 'secondary'}
            onClick={(): void => setTypeFilter(filter)}
          >
            {filter}
          </HbcButton>
        ))}
      </div>
      {body}
    </section>
  );
}

type HubState =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; records: ReadonlyArray<FoleonContentRecord> };

function comparePublishDateDesc(a: FoleonContentRecord, b: FoleonContentRecord): number {
  const aMs = a.publishedOn ? Date.parse(a.publishedOn) : 0;
  const bMs = b.publishedOn ? Date.parse(b.publishedOn) : 0;
  return bMs - aMs;
}
