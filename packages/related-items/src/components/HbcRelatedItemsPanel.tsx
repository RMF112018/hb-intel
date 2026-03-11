/**
 * HbcRelatedItemsPanel — D-SF14-T05, D-05, D-07
 *
 * Grouped related-items panel renderer with complexity-aware progressive disclosure.
 *
 * Depends on:
 * - SF14-T02 contracts
 * - SF14-T03 registry/API metadata
 * - SF14-T04 useRelatedItems hook output
 */
import { useMemo, type FC } from 'react';
import { useCurrentUser } from '@hbc/auth';
import { useComplexity } from '@hbc/complexity';
import { HbcSmartEmptyState, type ISmartEmptyStateConfig, type IEmptyStateContext } from '@hbc/smart-empty-state';
import { DEFAULT_RELATIONSHIP_PRIORITY, RELATED_ITEMS_PANEL_TITLE } from '../constants/index.js';
import { useRelatedItems } from '../hooks/index.js';
import { RelationshipRegistry } from '../registry/index.js';
import { HbcRelatedItemCard } from './HbcRelatedItemCard.js';

export interface HbcRelatedItemsPanelProps {
  sourceRecordType: string;
  sourceRecordId: string;
  sourceRecord: unknown;
  showBicState?: boolean;
}

const RELATED_ITEMS_EMPTY_STATE_CONFIG: ISmartEmptyStateConfig = {
  resolve: (context: IEmptyStateContext) => {
    if (context.isLoadError) {
      return {
        module: context.module,
        view: context.view,
        classification: 'loading-failed',
        heading: 'Related Items Unavailable',
        description: 'Related item data is temporarily unavailable. Retry to restore connected context.',
        primaryAction: { label: 'Retry' },
        coachingTip: 'Continue with available context while related items are recovering.',
      };
    }

    return {
      module: context.module,
      view: context.view,
      classification: context.isFirstVisit ? 'first-use' : 'truly-empty',
      heading: 'No Related Items Yet',
      description: 'No connected records are available for this item and role context.',
      coachingTip: `Role-aware visibility is applied for ${context.currentUserRole}.`,
    };
  },
};

type GroupEntry = [label: string, items: ReturnType<typeof useRelatedItems>['items']];

function getPriorityByLabel(sourceRecordType: string): Map<string, number> {
  const map = new Map<string, number>();
  const definitions = RelationshipRegistry.getBySourceRecordType(sourceRecordType);

  for (const definition of definitions) {
    const priority = definition.governanceMetadata?.relationshipPriority ?? DEFAULT_RELATIONSHIP_PRIORITY;
    const existing = map.get(definition.label);
    if (existing === undefined || priority > existing) {
      map.set(definition.label, priority);
    }
  }

  return map;
}

function isAiLabel(label: string): boolean {
  return label.toLowerCase().includes('ai');
}

/** Collapsible related-items panel displaying deterministic grouped sections. */
export const HbcRelatedItemsPanel: FC<HbcRelatedItemsPanelProps> = ({
  sourceRecordType,
  sourceRecordId,
  sourceRecord,
  showBicState = true,
}) => {
  const user = useCurrentUser();
  const { tier } = useComplexity();
  const currentUserRole = user?.roles[0]?.name ?? 'Unknown';

  if (tier === 'essential') {
    return null;
  }

  const {
    items,
    groups,
    aiSuggestions,
    isLoading,
    error,
  } = useRelatedItems({
    sourceRecordType,
    sourceRecordId,
    sourceRecord,
    currentUserRole,
    showBicState,
  });

  const priorityByLabel = useMemo(
    () => getPriorityByLabel(sourceRecordType),
    [sourceRecordType],
  );

  const orderedGroups = useMemo(() => {
    const entries = Object.entries(groups) as GroupEntry[];
    return entries.sort((left, right) => {
      const leftPriority = priorityByLabel.get(left[0]) ?? DEFAULT_RELATIONSHIP_PRIORITY;
      const rightPriority = priorityByLabel.get(right[0]) ?? DEFAULT_RELATIONSHIP_PRIORITY;
      if (leftPriority !== rightPriority) {
        return rightPriority - leftPriority;
      }
      return left[0].localeCompare(right[0]);
    });
  }, [groups, priorityByLabel]);

  const visibleGroups = useMemo(() => {
    if (tier !== 'expert') {
      return orderedGroups;
    }

    return orderedGroups.filter(([label]) => !isAiLabel(label));
  }, [orderedGroups, tier]);

  const hasMissingSource = sourceRecordType.trim() === '' || sourceRecordId.trim() === '';
  const hasContent = items.length > 0;
  const shouldRenderEmpty = !isLoading && !hasContent;
  const shouldRenderDegradedBanner = Boolean(error) && hasContent;

  if (hasMissingSource) {
    return (
      <section data-testid="related-items-panel-missing-source">
        <h2>{RELATED_ITEMS_PANEL_TITLE}</h2>
        <p>Source record context is missing. Related items cannot be resolved.</p>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section data-testid="related-items-panel-loading">
        <h2>{RELATED_ITEMS_PANEL_TITLE}</h2>
        <p>Loading related items...</p>
      </section>
    );
  }

  if (shouldRenderEmpty) {
    return (
      <section data-testid="related-items-panel-empty">
        <h2>{RELATED_ITEMS_PANEL_TITLE}</h2>
        <HbcSmartEmptyState
          config={RELATED_ITEMS_EMPTY_STATE_CONFIG}
          context={{
            module: 'related-items',
            view: 'panel',
            hasActiveFilters: false,
            hasPermission: true,
            isFirstVisit: false,
            currentUserRole,
            isLoadError: Boolean(error),
          }}
          variant="inline"
        />
      </section>
    );
  }

  return (
    <section data-testid="related-items-panel">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>{RELATED_ITEMS_PANEL_TITLE}</h2>
        <span data-testid="related-items-total-count">{items.length}</span>
      </header>

      {shouldRenderDegradedBanner ? (
        <div data-testid="related-items-degraded-banner" role="status">
          Partial data available. Some related items could not be loaded.
        </div>
      ) : null}

      {visibleGroups.map(([label, groupItems], index) => (
        <details key={label} open={index === 0} data-testid="related-items-group">
          <summary>
            <span>{label}</span>{' '}
            <span data-testid="related-items-group-count">({groupItems.length})</span>
          </summary>
          <div style={{ display: 'grid', gap: 8, marginTop: 8 }}>
            {groupItems.map((item) => (
              <HbcRelatedItemCard
                key={`${item.recordType}:${item.recordId}:${item.relationshipLabel}`}
                item={item}
                showBicState={showBicState}
              />
            ))}
          </div>
        </details>
      ))}

      {tier === 'expert' && aiSuggestions && aiSuggestions.length > 0 ? (
        <section data-testid="related-items-ai-group">
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>AI Suggestions ({aiSuggestions.length})</h3>
            <button type="button" data-testid="related-items-ai-cta">Suggest new relationships</button>
          </header>
          <div style={{ display: 'grid', gap: 8 }}>
            {aiSuggestions.map((item) => (
              <HbcRelatedItemCard
                key={`ai:${item.recordType}:${item.recordId}:${item.relationshipLabel}`}
                item={item}
                showBicState={showBicState}
              />
            ))}
          </div>
        </section>
      ) : null}
    </section>
  );
};

HbcRelatedItemsPanel.displayName = 'HbcRelatedItemsPanel';
