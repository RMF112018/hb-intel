import { useEffect, useMemo, useState } from 'react';
import { HbcButton } from '@hbc/ui-kit/homepage';
import type { FoleonContentRecord } from '../types/foleon-content.types.js';
import type { FoleonPlacementRecord } from '../types/foleon-placement.types.js';
import type { IFoleonRuntimeContract } from '../runtime/foleonRuntimeContract.js';
import { fetchFoleonContent } from '../services/FoleonContentService.js';
import { fetchFoleonPlacements } from '../services/FoleonPlacementService.js';
import { FoleonCard } from '../components/FoleonCard.js';
import { FoleonError, FoleonLoadingState } from '../components/FoleonStates.js';
import { FoleonPreviewFallback } from '../components/FoleonPreviewFallback.js';
import { getFoleonHighlightsPreviewRecords } from '../preview/FoleonPreviewData.js';

interface HighlightsPageProps {
  readonly contract: IFoleonRuntimeContract;
  readonly onOpenReader: (record: FoleonContentRecord) => void;
  readonly onOpenExternal: (record: FoleonContentRecord) => void;
  readonly onCardImpression: (records: ReadonlyArray<FoleonContentRecord>) => void;
}

export function HighlightsPage(props: HighlightsPageProps): React.ReactNode {
  const { contract, onOpenReader, onOpenExternal, onCardImpression } = props;
  const [state, setState] = useState<HighlightsLoadState>({ kind: 'loading' });

  useEffect(() => {
    if (!contract.siteUrl || !contract.listIds.placements || !contract.listIds.contentRegistry) {
      setState({ kind: 'error', message: 'Foleon list configuration is incomplete.' });
      return;
    }
    const controller = new AbortController();
    void (async (): Promise<void> => {
      try {
        const [placements, content] = await Promise.all([
          fetchFoleonPlacements({
            siteUrl: contract.siteUrl!,
            placementsListId: contract.listIds.placements!,
            activeOnly: true,
            signal: controller.signal,
          }),
          fetchFoleonContent({
            siteUrl: contract.siteUrl!,
            contentRegistryListId: contract.listIds.contentRegistry!,
            publishedOnly: true,
            homepageEligibleOnly: true,
            top: 100,
            signal: controller.signal,
          }),
        ]);
        const records = materializeHighlights(placements, content);
        setState({ kind: 'ready', records });
        if (records.length > 0) {
          onCardImpression(records);
        }
      } catch (err) {
        if ((err as { name?: string }).name === 'AbortError') return;
        setState({ kind: 'error', message: (err as Error).message });
      }
    })();
    return (): void => controller.abort();
  }, [contract, onCardImpression]);

  const body = useMemo(() => {
    if (state.kind === 'loading') return <FoleonLoadingState />;
    if (state.kind === 'error') {
      return (
        <FoleonError
          title="Unable to load Foleon highlights"
          description={state.message}
          onRetry={(): void => setState({ kind: 'loading' })}
        />
      );
    }
    if (state.records.length === 0) {
      return <FoleonPreviewFallback route="highlights" records={getFoleonHighlightsPreviewRecords()} />;
    }
    const [feature, ...rest] = state.records;
    return (
      <div style={{ display: 'grid', gap: 16 }}>
        {feature ? (
          <FoleonCard
            record={feature}
            variant="feature"
            onOpen={onOpenReader}
            onExternal={onOpenExternal}
          />
        ) : null}
        {rest.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gap: 16,
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            }}
          >
            {rest.map((record) => (
              <FoleonCard
                key={record.id}
                record={record}
                variant="compact"
                onOpen={onOpenReader}
                onExternal={onOpenExternal}
              />
            ))}
          </div>
        ) : null}
      </div>
    );
  }, [state, onOpenReader, onOpenExternal]);

  return (
    <section aria-label="Foleon publication highlights" style={{ padding: 16 }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <h2 style={{ margin: 0 }}>Marketing highlights</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <HbcButton
            variant="secondary"
            onClick={(): void => navigateToRoute('manage')}
          >
            Manage
          </HbcButton>
          <HbcButton
            variant="secondary"
            onClick={(): void => navigateToRoute('hub')}
          >
            View all
          </HbcButton>
        </div>
      </header>
      {body}
    </section>
  );
}

function navigateToRoute(route: 'hub' | 'manage'): void {
  const url = new URL(window.location.href);
  url.searchParams.set('foleonRoute', route);
  window.history.pushState({}, '', url.toString());
  window.dispatchEvent(new PopStateEvent('popstate'));
}

type HighlightsLoadState =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; records: ReadonlyArray<FoleonContentRecord> };

/**
 * Resolve placements to content records, ordered by placement sort rank
 * then by publish date.
 */
function materializeHighlights(
  placements: ReadonlyArray<FoleonPlacementRecord>,
  content: ReadonlyArray<FoleonContentRecord>,
): ReadonlyArray<FoleonContentRecord> {
  const byDocId = new Map<number, FoleonContentRecord>();
  const byItemId = new Map<number, FoleonContentRecord>();
  for (const record of content) {
    byDocId.set(record.foleonDocId, record);
    byItemId.set(record.id, record);
  }
  const now = Date.now();
  const ordered = [...placements]
    .filter((placement) => {
      if (!placement.isActive) return false;
      if (placement.displayFrom) {
        const fromMs = Date.parse(placement.displayFrom);
        if (!Number.isNaN(fromMs) && fromMs > now) return false;
      }
      if (placement.displayThrough) {
        const throughMs = Date.parse(placement.displayThrough);
        if (!Number.isNaN(throughMs) && throughMs < now) return false;
      }
      return true;
    })
    .sort((a, b) => a.sortRank - b.sortRank);
  const resolved: FoleonContentRecord[] = [];
  const seen = new Set<number>();
  for (const placement of ordered) {
    const record =
      (typeof placement.contentIdCache === 'number' && byDocId.get(placement.contentIdCache)) ||
      (typeof placement.contentLookupId === 'number' && byItemId.get(placement.contentLookupId));
    if (record && !seen.has(record.id)) {
      resolved.push(record);
      seen.add(record.id);
    }
  }
  if (resolved.length === 0) {
    return [...content]
      .sort((a, b) => comparePublishDateDesc(a, b))
      .slice(0, 6);
  }
  return resolved;
}

function comparePublishDateDesc(a: FoleonContentRecord, b: FoleonContentRecord): number {
  const aMs = a.publishedOn ? Date.parse(a.publishedOn) : 0;
  const bMs = b.publishedOn ? Date.parse(b.publishedOn) : 0;
  return bMs - aMs;
}
