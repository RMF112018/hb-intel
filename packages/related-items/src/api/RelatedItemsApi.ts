/**
 * RelatedItemsApi — D-SF14-T03, D-01, D-03, D-04
 *
 * Batched API surface for fetching related item summaries with BIC enrichment.
 * Routes through Azure Functions in SPFx mode.
 *
 * Depends on:
 * - SF14-T01 package scaffold
 * - SF14-T02 contracts
 * - SF14-T03 relationship registry
 */
import {
  DEFAULT_RELATIONSHIP_PRIORITY,
} from '../constants/index.js';
import { RelationshipRegistry } from '../registry/index.js';
import type {
  IBicNextMoveState,
  IRelatedItem,
  IRelationshipDefinition,
} from '../types/index.js';

const RELATED_ITEMS_BASE_URL = '/api/related-items';
const SUMMARIES_ROUTE = `${RELATED_ITEMS_BASE_URL}/summaries`;
const BIC_ENRICHMENT_ROUTE = `${RELATED_ITEMS_BASE_URL}/bic-enrichment`;

type ResolverStrategy = 'sharepoint' | 'graph' | 'hybrid' | 'ai-suggested';

interface IRelatedSummaryRequest {
  sourceRecordType: string;
  sourceRecordId: string;
  requests: Array<{
    sourceRecordType: string;
    targetRecordType: string;
    resolverStrategy: ResolverStrategy;
    targetModule: string;
    relationshipLabel: string;
    relationshipDirection: string;
    recordIds: string[];
  }>;
}

interface IRelatedSummaryRecord {
  recordType: string;
  recordId: string;
  label?: string;
  status?: string;
  moduleIcon?: string;
  bicState?: IBicNextMoveState;
  versionChip?: { lastChanged: string; author: string };
  aiConfidence?: number;
}

interface IRelatedSummaryResponse {
  summaries: IRelatedSummaryRecord[];
}

function normalizeStringArray(values: string[]): string[] {
  const deduped = new Set<string>();

  for (const value of values) {
    if (typeof value !== 'string') {
      continue;
    }

    const normalized = value.trim();
    if (normalized !== '') {
      deduped.add(normalized);
    }
  }

  return Array.from(deduped).sort((left, right) => left.localeCompare(right));
}

function getResolverStrategy(definition: IRelationshipDefinition): ResolverStrategy {
  return definition.governanceMetadata?.resolverStrategy ?? 'sharepoint';
}

function isVisibleForRole(
  definition: IRelationshipDefinition,
  role?: string,
): boolean {
  if (definition.visibleToRoles && role && !definition.visibleToRoles.includes(role)) {
    return false;
  }

  const relevance = definition.governanceMetadata?.roleRelevanceMap;
  if (!relevance || !role) {
    return true;
  }

  const allowedDirections = relevance[role];
  if (!allowedDirections) {
    return true;
  }

  return allowedDirections.includes(definition.direction);
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`[related-items] API request failed (${response.status}) at "${path}": ${body}`);
  }

  return (await response.json()) as T;
}

function normalizeSummaryResponse(raw: unknown): IRelatedSummaryRecord[] {
  if (Array.isArray(raw)) {
    return raw as IRelatedSummaryRecord[];
  }

  if (raw && typeof raw === 'object' && Array.isArray((raw as IRelatedSummaryResponse).summaries)) {
    return (raw as IRelatedSummaryResponse).summaries;
  }

  return [];
}

function compareRelatedItems(left: IRelatedItem, right: IRelatedItem): number {
  if (left.relationshipLabel !== right.relationshipLabel) {
    return left.relationshipLabel.localeCompare(right.relationshipLabel);
  }

  if (left.label !== right.label) {
    return left.label.localeCompare(right.label);
  }

  return left.recordId.localeCompare(right.recordId);
}

export const RelatedItemsApi = {
  /**
   * Fetch related items for a given source record and optional role context.
   *
   * SF14-T03 behavior:
   * - resolves relationship IDs via registered definitions
   * - batches summary lookup through `/api/related-items/summaries`
   * - applies visibility filters and deterministic ordering
   * - enriches BIC state via non-fatal pass
   * - adds AI suggestions when configured via registered hooks
   */
  async getRelatedItems(
    sourceRecordType: string,
    sourceRecordId: string,
    sourceRecord: unknown,
    role?: string,
  ): Promise<IRelatedItem[]> {
    const relationshipDefinitions = RelationshipRegistry
      .getBySourceRecordType(sourceRecordType)
      .filter((definition) => isVisibleForRole(definition, role));

    if (relationshipDefinitions.length === 0) {
      return [];
    }

    const relationshipRequests = relationshipDefinitions
      .map((definition) => {
        let resolvedIds: string[] = [];
        try {
          const candidateIds = definition.resolveRelatedIds(sourceRecord);
          resolvedIds = normalizeStringArray(Array.isArray(candidateIds) ? candidateIds : []);
        } catch {
          resolvedIds = [];
        }

        if (resolvedIds.length === 0) {
          return null;
        }

        return {
          definition,
          strategy: getResolverStrategy(definition),
          recordIds: resolvedIds,
        };
      })
      .filter((entry): entry is {
        definition: IRelationshipDefinition;
        strategy: ResolverStrategy;
        recordIds: string[];
      } => entry !== null);

    const summaryByCompositeKey = new Map<string, IRelatedSummaryRecord>();
    const requestsByStrategy = new Map<ResolverStrategy, Array<{
      definition: IRelationshipDefinition;
      recordIds: string[];
    }>>();

    for (const request of relationshipRequests) {
      const existing = requestsByStrategy.get(request.strategy) ?? [];
      existing.push({
        definition: request.definition,
        recordIds: request.recordIds,
      });
      requestsByStrategy.set(request.strategy, existing);
    }

    const strategyList = Array.from(requestsByStrategy.keys()).sort((left, right) => left.localeCompare(right));
    await Promise.allSettled(
      strategyList.map(async (strategy) => {
        const strategyRequests = requestsByStrategy.get(strategy) ?? [];
        if (strategyRequests.length === 0) {
          return;
        }

        const payload: IRelatedSummaryRequest = {
          sourceRecordType,
          sourceRecordId,
          requests: strategyRequests.map((request) => ({
            sourceRecordType: request.definition.sourceRecordType,
            targetRecordType: request.definition.targetRecordType,
            resolverStrategy: strategy,
            targetModule: request.definition.targetModule,
            relationshipLabel: request.definition.label,
            relationshipDirection: request.definition.direction,
            recordIds: request.recordIds,
          })),
        };

        const response = await apiFetch<IRelatedSummaryResponse | IRelatedSummaryRecord[]>(
          SUMMARIES_ROUTE,
          {
            method: 'POST',
            body: JSON.stringify(payload),
          },
        );

        for (const summary of normalizeSummaryResponse(response)) {
          if (!summary || typeof summary.recordType !== 'string' || typeof summary.recordId !== 'string') {
            continue;
          }

          summaryByCompositeKey.set(
            `${summary.recordType}::${summary.recordId}`,
            summary,
          );
        }
      }),
    );

    const relatedItems: IRelatedItem[] = [];
    for (const request of relationshipRequests) {
      for (const recordId of request.recordIds) {
        const summary = summaryByCompositeKey.get(`${request.definition.targetRecordType}::${recordId}`);
        if (!summary) {
          continue;
        }

        const label = summary.label?.trim() || `${request.definition.targetRecordType} ${recordId}`;

        relatedItems.push({
          recordType: request.definition.targetRecordType,
          recordId,
          label,
          status: summary?.status,
          href: request.definition.buildTargetUrl(recordId),
          moduleIcon: summary?.moduleIcon ?? request.definition.targetModule,
          relationship: request.definition.direction,
          relationshipLabel: request.definition.label,
          bicState: summary?.bicState,
          versionChip: summary?.versionChip,
          aiConfidence: summary?.aiConfidence,
        });
      }
    }

    const bicMissing = relatedItems.filter((item) => !item.bicState);
    if (bicMissing.length > 0) {
      try {
        const bicResponse = await apiFetch<{ states?: Array<{ recordType: string; recordId: string; bicState: IBicNextMoveState }> }>(
          BIC_ENRICHMENT_ROUTE,
          {
            method: 'POST',
            body: JSON.stringify({
              sourceRecordType,
              sourceRecordId,
              items: bicMissing.map((item) => ({
                recordType: item.recordType,
                recordId: item.recordId,
              })),
            }),
          },
        );

        const bicByKey = new Map<string, IBicNextMoveState>();
        for (const state of bicResponse.states ?? []) {
          bicByKey.set(`${state.recordType}::${state.recordId}`, state.bicState);
        }

        for (const item of relatedItems) {
          if (!item.bicState) {
            item.bicState = bicByKey.get(`${item.recordType}::${item.recordId}`);
          }
        }
      } catch {
        // Non-fatal by design; summaries still return without BIC enrichment.
      }
    }

    const aiHookIds = Array.from(
      new Set(
        relationshipDefinitions
          .map((definition) => definition.governanceMetadata?.aiSuggestionHook?.trim())
          .filter((hookId): hookId is string => Boolean(hookId)),
      ),
    ).sort((left, right) => left.localeCompare(right));

    for (const hookId of aiHookIds) {
      const resolver = RelationshipRegistry.getAISuggestionHook(hookId);
      if (!resolver) {
        continue;
      }

      try {
        const suggestions = await resolver({
          sourceRecordType,
          sourceRecordId,
          sourceRecord,
          role,
        });

        for (const suggestion of suggestions ?? []) {
          if (!suggestion || typeof suggestion.recordType !== 'string' || typeof suggestion.recordId !== 'string') {
            continue;
          }

          relatedItems.push({
            ...suggestion,
            relationshipLabel: suggestion.relationshipLabel || 'AI Suggestion',
            relationship: suggestion.relationship || 'references',
            moduleIcon: suggestion.moduleIcon || 'ai-assist',
            href: suggestion.href || '',
          });
        }
      } catch {
        // AI hooks are advisory; failures should not fail related-item retrieval.
      }
    }

    const priorityByDefinitionKey = new Map<string, number>();
    for (const definition of relationshipDefinitions) {
      priorityByDefinitionKey.set(
        `${definition.targetRecordType}::${definition.direction}::${definition.label}`,
        definition.governanceMetadata?.relationshipPriority ?? DEFAULT_RELATIONSHIP_PRIORITY,
      );
    }

    const deduped = new Map<string, IRelatedItem>();
    for (const item of relatedItems) {
      const dedupeKey = `${item.recordType}::${item.recordId}::${item.relationship}::${item.relationshipLabel}`;
      if (!deduped.has(dedupeKey)) {
        deduped.set(dedupeKey, item);
      }
    }

    return Array.from(deduped.values()).sort((left, right) => {
      const leftPriority = priorityByDefinitionKey.get(
        `${left.recordType}::${left.relationship}::${left.relationshipLabel}`,
      ) ?? DEFAULT_RELATIONSHIP_PRIORITY;
      const rightPriority = priorityByDefinitionKey.get(
        `${right.recordType}::${right.relationship}::${right.relationshipLabel}`,
      ) ?? DEFAULT_RELATIONSHIP_PRIORITY;

      if (leftPriority !== rightPriority) {
        return rightPriority - leftPriority;
      }

      return compareRelatedItems(left, right);
    });
  },
} as const;

export type IRelatedItemsApi = typeof RelatedItemsApi;
