/**
 * useRelatedItems — D-SF14-T04, D-05, D-06, D-07
 *
 * Canonical Related Items orchestration hook for SF14-T04.
 *
 * Depends on:
 * - SF14-T02 contracts
 * - SF14-T03 registry/API layer
 * - @hbc/session-state DraftStore for stale-safe offline fallback
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { loadDraft, saveDraft } from '@hbc/session-state';
import { RelatedItemsApi } from '../api/index.js';
import type { IRelatedItem } from '../types/index.js';

interface IUseRelatedItemsParams {
  sourceRecordType: string;
  sourceRecordId: string;
  sourceRecord: unknown;
  currentUserRole: string;
  showBicState?: boolean;
}

export interface UseRelatedItemsResult {
  items: IRelatedItem[];
  groups: Record<string, IRelatedItem[]>;
  aiSuggestions?: IRelatedItem[];
  isLoading: boolean;
  error: string | null;
}

interface ICachedRelatedItemsSnapshot {
  items: IRelatedItem[];
  cachedAt: string;
}

function compareItems(left: IRelatedItem, right: IRelatedItem): number {
  if (left.relationshipLabel !== right.relationshipLabel) {
    return left.relationshipLabel.localeCompare(right.relationshipLabel);
  }

  if (left.label !== right.label) {
    return left.label.localeCompare(right.label);
  }

  return left.recordId.localeCompare(right.recordId);
}

function normalizeAndSortItems(items: IRelatedItem[], showBicState: boolean): IRelatedItem[] {
  const normalized = items.map((item) => {
    if (showBicState) {
      return item;
    }

    // Derived-state guard: hide BIC metadata only in hook output, not source data.
    const { bicState: _bicState, ...withoutBic } = item;
    return withoutBic;
  });

  return [...normalized].sort(compareItems);
}

function deriveGroups(items: IRelatedItem[]): Record<string, IRelatedItem[]> {
  const grouped = new Map<string, IRelatedItem[]>();
  for (const item of items) {
    const relationshipKey = item.relationshipLabel;
    const existing = grouped.get(relationshipKey) ?? [];
    existing.push(item);
    grouped.set(relationshipKey, existing);
  }

  return Object.fromEntries(grouped.entries());
}

function deriveAiSuggestions(items: IRelatedItem[]): IRelatedItem[] {
  return items.filter((item) =>
    typeof item.aiConfidence === 'number' ||
    item.relationshipLabel.toLowerCase().includes('ai suggestion'));
}

function createCacheKey(
  sourceRecordType: string,
  sourceRecordId: string,
  currentUserRole: string,
): string {
  return `related-items:${sourceRecordType}:${sourceRecordId}:${currentUserRole}`;
}

function mapErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return String(error);
}

export function useRelatedItems({
  sourceRecordType,
  sourceRecordId,
  sourceRecord,
  currentUserRole,
  showBicState = true,
}: IUseRelatedItemsParams): UseRelatedItemsResult {
  const [items, setItems] = useState<IRelatedItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sourceRecordRef = useRef(sourceRecord);

  sourceRecordRef.current = sourceRecord;

  useEffect(() => {
    let cancelled = false;

    const normalizedSourceType = sourceRecordType.trim();
    const normalizedSourceId = sourceRecordId.trim();
    const normalizedRole = currentUserRole.trim();

    if (!normalizedSourceType || !normalizedSourceId) {
      setItems([]);
      setError(null);
      setIsLoading(false);
      return () => {
        cancelled = true;
      };
    }

    const cacheKey = createCacheKey(normalizedSourceType, normalizedSourceId, normalizedRole);

    async function load(): Promise<void> {
      setIsLoading(true);
      setError(null);

      try {
        const apiItems = await RelatedItemsApi.getRelatedItems(
          normalizedSourceType,
          normalizedSourceId,
          sourceRecordRef.current,
          normalizedRole,
        );

        if (cancelled) {
          return;
        }

        const normalized = normalizeAndSortItems(apiItems, showBicState);
        setItems(normalized);

        await saveDraft(cacheKey, {
          items: normalized,
          cachedAt: new Date().toISOString(),
        } satisfies ICachedRelatedItemsSnapshot);
      } catch (requestError) {
        const message = mapErrorMessage(requestError);

        let cachedItems: IRelatedItem[] = [];
        try {
          const snapshot = await loadDraft<ICachedRelatedItemsSnapshot>(cacheKey);
          cachedItems = Array.isArray(snapshot?.items) ? snapshot.items : [];
        } catch {
          cachedItems = [];
        }

        if (!cancelled) {
          const normalizedCachedItems = normalizeAndSortItems(cachedItems, showBicState);
          setItems(normalizedCachedItems);
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [sourceRecordType, sourceRecordId, currentUserRole, showBicState]);

  const groups = useMemo(() => deriveGroups(items), [items]);
  const aiSuggestions = useMemo(() => {
    const suggestions = deriveAiSuggestions(items);
    return suggestions.length > 0 ? suggestions : undefined;
  }, [items]);

  return {
    items,
    groups,
    aiSuggestions,
    isLoading,
    error,
  };
}
