import React, { useMemo, useState } from 'react';
import type {
  IStrategicIntelligenceEntry,
  ISuggestedIntelligenceMatch,
  ReliabilityTier,
} from '@hbc/strategic-intelligence';
import type {
  BdStrategicIntelligenceBicOwnerAvatarProjection,
} from '../hooks/index.js';
import {
  filterEntries,
  getDisplayDate,
  getEntryTags,
  getEntryTypeOptions,
  getEntryVisibility,
  getLifecycleLabel,
  getRedactionSummary,
  getReliabilityLabel,
  getTagOptions,
  type IStrategicIntelligenceFeedFilters,
} from './displayModel.js';
import {
  SuggestedIntelligenceCard,
  type SuggestedIntelligenceAction,
} from './SuggestedIntelligenceCard.js';

const DEFAULT_FILTERS: IStrategicIntelligenceFeedFilters = {
  lifecycle: 'all',
  entryType: 'all',
  tag: 'all',
  trustTier: 'all',
  stale: 'all',
};

export interface StrategicIntelligenceFeedProps {
  entries: IStrategicIntelligenceEntry[];
  suggestions: ISuggestedIntelligenceMatch[];
  bicOwnerAvatars?: BdStrategicIntelligenceBicOwnerAvatarProjection[];
  canViewNonApproved?: boolean;
  canViewSensitiveContent?: boolean;
  roleLabel?: string;
  syncBadge?: 'Saved locally' | 'Queued to sync' | 'Synced';
  defaultLifecycleFilter?: IStrategicIntelligenceFeedFilters['lifecycle'];
  onOpenRelatedItem?: (entryId: string) => string | undefined;
  onOpenResolutionNote?: (conflictId: string) => void;
  onSuggestionOutcome?: (suggestionId: string, action: SuggestedIntelligenceAction) => void;
  onOpenExplainability?: (suggestionId: string) => void;
  onFilterChange?: (filters: IStrategicIntelligenceFeedFilters) => void;
}

const findOwnerProjection = (
  entry: IStrategicIntelligenceEntry,
  bicOwnerAvatars: BdStrategicIntelligenceBicOwnerAvatarProjection[]
): BdStrategicIntelligenceBicOwnerAvatarProjection | null => {
  for (const commitmentId of entry.commitmentIds) {
    const projection = bicOwnerAvatars.find((item) => item.commitmentId === commitmentId);
    if (projection) {
      return projection;
    }
  }

  return null;
};

const sortByLatest = (entries: IStrategicIntelligenceEntry[]): IStrategicIntelligenceEntry[] =>
  [...entries].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

const isHeritageSuggestion = (suggestion: ISuggestedIntelligenceMatch): boolean => {
  const reason = suggestion.reason.toLowerCase();
  return reason.includes('heritage') || reason.includes('snapshot');
};

const TRUST_TIER_OPTIONS: Array<ReliabilityTier | 'all'> = [
  'all',
  'high',
  'moderate',
  'low',
  'review-required',
];

export const StrategicIntelligenceFeed = ({
  entries,
  suggestions,
  bicOwnerAvatars = [],
  canViewNonApproved = false,
  canViewSensitiveContent = false,
  roleLabel = 'Contributor',
  syncBadge,
  defaultLifecycleFilter,
  onOpenRelatedItem,
  onOpenResolutionNote,
  onSuggestionOutcome,
  onOpenExplainability,
  onFilterChange,
}: StrategicIntelligenceFeedProps) => {
  const [filters, setFilters] = useState<IStrategicIntelligenceFeedFilters>({
    ...DEFAULT_FILTERS,
    lifecycle: defaultLifecycleFilter ?? 'all',
  });

  const entryTypes = useMemo(() => getEntryTypeOptions(entries), [entries]);
  const tags = useMemo(() => getTagOptions(entries), [entries]);

  const filteredEntries = useMemo(() => {
    const next = sortByLatest(filterEntries(entries, filters));
    return next;
  }, [entries, filters]);

  const onFilterUpdate = (next: Partial<IStrategicIntelligenceFeedFilters>) => {
    const merged = { ...filters, ...next };
    setFilters(merged);
    onFilterChange?.(merged);
  };

  const actionableEntries = filteredEntries.filter((entry) =>
    getEntryVisibility(entry, {
      canViewNonApproved,
      canViewSensitiveContent,
    }).isVisible
  );

  const heritageSuggestions = suggestions.filter(isHeritageSuggestion);
  const intelligenceSuggestions = suggestions.filter((item) => !isHeritageSuggestion(item));

  return (
    <section aria-label="Strategic intelligence feed" data-testid="strategic-intelligence-feed">
      <header>
        <h3>Living Strategic Intelligence</h3>
        {syncBadge && syncBadge !== 'Synced' ? (
          <p data-testid="strategic-intelligence-sync-badge">{syncBadge}</p>
        ) : null}
      </header>

      <fieldset aria-label="Strategic intelligence filters">
        <legend>Filters</legend>
        <label>
          Lifecycle
          <select
            aria-label="Filter by lifecycle state"
            value={filters.lifecycle}
            onChange={(event) =>
              onFilterUpdate({
                lifecycle: event.target.value as IStrategicIntelligenceFeedFilters['lifecycle'],
              })
            }
          >
            <option value="all">All</option>
            <option value="approved">Approved</option>
            <option value="pending-approval">Pending approval</option>
            <option value="submitted">Submitted</option>
            <option value="rejected">Rejected</option>
            <option value="revision-requested">Revision requested</option>
            <option value="superseded">Superseded</option>
          </select>
        </label>

        <label>
          Entry type
          <select
            aria-label="Filter by intelligence type"
            value={filters.entryType}
            onChange={(event) => onFilterUpdate({ entryType: event.target.value })}
          >
            <option value="all">All</option>
            {entryTypes.map((entryType) => (
              <option key={entryType} value={entryType}>
                {entryType}
              </option>
            ))}
          </select>
        </label>

        <label>
          Tag
          <select
            aria-label="Filter by tag"
            value={filters.tag}
            onChange={(event) => onFilterUpdate({ tag: event.target.value })}
          >
            <option value="all">All</option>
            {tags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </label>

        <label>
          Trust tier
          <select
            aria-label="Filter by trust tier"
            value={filters.trustTier}
            onChange={(event) =>
              onFilterUpdate({ trustTier: event.target.value as IStrategicIntelligenceFeedFilters['trustTier'] })
            }
          >
            {TRUST_TIER_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option === 'all' ? 'All' : getReliabilityLabel(option)}
              </option>
            ))}
          </select>
        </label>

        <label>
          Stale status
          <select
            aria-label="Filter by stale status"
            value={filters.stale}
            onChange={(event) =>
              onFilterUpdate({ stale: event.target.value as IStrategicIntelligenceFeedFilters['stale'] })
            }
          >
            <option value="all">All</option>
            <option value="stale">Stale only</option>
            <option value="fresh">Fresh only</option>
          </select>
        </label>
      </fieldset>

      <section aria-label="Suggested heritage intelligence" data-testid="suggested-heritage-section">
        <h4>Suggested Heritage</h4>
        {heritageSuggestions.length === 0 ? (
          <p>No heritage suggestions available.</p>
        ) : (
          heritageSuggestions.map((suggestion) => (
            <SuggestedIntelligenceCard
              key={suggestion.suggestionId}
              suggestion={suggestion}
              onOutcome={onSuggestionOutcome}
              onOpenExplainability={onOpenExplainability}
            />
          ))
        )}
      </section>

      <section
        aria-label="Suggested living intelligence"
        data-testid="suggested-intelligence-section"
      >
        <h4>Suggested Intelligence</h4>
        {intelligenceSuggestions.length === 0 ? (
          <p>No intelligence suggestions available.</p>
        ) : (
          intelligenceSuggestions.map((suggestion) => (
            <SuggestedIntelligenceCard
              key={suggestion.suggestionId}
              suggestion={suggestion}
              onOutcome={onSuggestionOutcome}
              onOpenExplainability={onOpenExplainability}
            />
          ))
        )}
      </section>

      {filteredEntries.length === 0 || actionableEntries.length === 0 ? (
        <section data-testid="strategic-intelligence-feed-empty-state">
          <h4>No matching strategic intelligence</h4>
          <p>{roleLabel}: add a contribution to keep living intelligence current.</p>
          <button type="button" aria-label="Add strategic intelligence contribution">
            Add contribution
          </button>
        </section>
      ) : (
        <ol aria-label="Strategic intelligence entries" data-testid="strategic-intelligence-entry-list">
          {filteredEntries.map((entry) => {
            const visibility = getEntryVisibility(entry, {
              canViewNonApproved,
              canViewSensitiveContent,
            });
            const ownerProjection = findOwnerProjection(entry, bicOwnerAvatars);
            const entryTags = getEntryTags(entry);
            const relatedHref = onOpenRelatedItem?.(entry.entryId);

            return (
              <li key={`${entry.entryId}-${entry.version.version}`}>
                <article data-testid={`strategic-intelligence-entry-${entry.entryId}`}>
                  <header>
                    <h4>{visibility.isRedacted ? `${entry.title} (Redacted)` : entry.title}</h4>
                    <p>{getLifecycleLabel(entry.lifecycleState)}</p>
                  </header>

                  {visibility.isRedacted ? (
                    <p data-testid={`strategic-intelligence-redacted-${entry.entryId}`}>
                      {getRedactionSummary(entry, visibility.hiddenReason)}
                    </p>
                  ) : (
                    <p>{entry.body}</p>
                  )}

                  <dl>
                    <div>
                      <dt>Trust</dt>
                      <dd>{getReliabilityLabel(entry.trust.reliabilityTier)}</dd>
                    </div>
                    <div>
                      <dt>Provenance</dt>
                      <dd>{entry.trust.provenanceClass}</dd>
                    </div>
                    <div>
                      <dt>Last validated</dt>
                      <dd>{getDisplayDate(entry.trust.lastValidatedAt)}</dd>
                    </div>
                    <div>
                      <dt>Review by</dt>
                      <dd>{getDisplayDate(entry.trust.reviewBy)}</dd>
                    </div>
                    <div>
                      <dt>Contributor</dt>
                      <dd>{entry.createdBy}</dd>
                    </div>
                    <div>
                      <dt>Created</dt>
                      <dd>{getDisplayDate(entry.createdAt)}</dd>
                    </div>
                  </dl>

                  {entry.trust.isStale ? <p>Stale intelligence</p> : null}
                  {entry.conflicts.length > 0 ? (
                    <div>
                      <p>Conflicts: {entry.conflicts.length}</p>
                      {entry.conflicts.map((conflict) => (
                        <button
                          key={conflict.conflictId}
                          type="button"
                          onClick={() => onOpenResolutionNote?.(conflict.conflictId)}
                          aria-label={`Open resolution note ${conflict.conflictId}`}
                        >
                          {conflict.type} ({conflict.resolutionStatus})
                        </button>
                      ))}
                    </div>
                  ) : null}

                  {ownerProjection ? (
                    <p data-testid={`strategic-intelligence-owner-${entry.entryId}`}>
                      Owner: {ownerProjection.owner.displayName}
                    </p>
                  ) : null}

                  {relatedHref ? (
                    <a href={relatedHref}>Open related item</a>
                  ) : null}

                  {entryTags.length > 0 ? <p>Tags: {entryTags.join(', ')}</p> : null}
                </article>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
};
