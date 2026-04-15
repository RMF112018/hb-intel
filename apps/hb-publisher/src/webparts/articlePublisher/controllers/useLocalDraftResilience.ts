/**
 * useLocalDraftResilience — bounded local resilience layer for the
 * Publisher's active authoring session.
 *
 * Intentional two-layer truth model:
 *
 *   - **Local working cache** — this hook. Debounced IndexedDB writes
 *     through `@hbc/session-state`'s `useAutoSaveDraft`. Recovers an
 *     in-flight draft when the browser tab is closed or the SPFx
 *     host reloads. Never claims "saved" — only "working copy
 *     cached".
 *   - **Durable SharePoint persistence** — `useDraftLifecycle` +
 *     `draftSaveOrchestrator`. The sole source of truth for what is
 *     saved to the list. This hook never substitutes for it.
 *
 * The local cache is keyed on the active articleId
 * (`publisher-article-working-draft-{articleId}`). On successful
 * durable save or publish, the caller must `clear()` so stale local
 * state is not later offered as a recovery candidate. The caller is
 * also responsible for resolving the recovery decision (resume vs
 * discard) — this hook exposes the candidate and the clear action
 * but does not prompt on its own.
 *
 * TTL is 48 hours. Saves debounce at 1.5s (the shared
 * `AUTO_SAVE_DEBOUNCE_MS` constant) so rapid field edits coalesce.
 * If IndexedDB is unavailable in the host (old browsers, certain
 * SPFx contexts, unit-test environments), `@hbc/session-state`
 * degrades silently — this hook simply returns a no-op interface
 * and the Publisher continues to function with durable save as the
 * only resilience layer.
 */

import * as React from 'react';
import { useAutoSaveDraft } from '@hbc/session-state';
import type {
  PublisherArticleRow,
  PublisherMediaRow,
  PublisherTeamMemberRow,
} from '../../../data/publisherAdapter/index.js';

const TTL_HOURS = 48;

export interface LocalWorkingCopy {
  readonly cachedAtIso: string;
  readonly articleDraft: PublisherArticleRow;
  readonly teamDraft: PublisherTeamMemberRow[];
  readonly mediaDraft: PublisherMediaRow[];
}

export interface LocalDraftResilienceHandle {
  /** The cached working copy the hook holds, or null when none exists. */
  readonly workingCopy: LocalWorkingCopy | null;
  /** Writes the current in-memory draft snapshot to the local cache. */
  readonly queueCache: (snapshot: LocalWorkingCopy) => void;
  /** Removes the local cache (e.g. after a successful durable save). */
  readonly clear: () => void;
  /** ISO timestamp of the last successful local cache write, or null. */
  readonly lastCachedAtIso: string | null;
  /** True while a debounce timer is active. */
  readonly isCachePending: boolean;
  /** Stable draft-key used for the current articleId (diagnostic). */
  readonly draftKey: string;
}

function draftKeyFor(articleId: string | undefined): string {
  return `publisher-article-working-draft-${articleId ?? 'none'}`;
}

export function useLocalDraftResilience(
  articleId: string | undefined,
): LocalDraftResilienceHandle {
  const draftKey = React.useMemo(() => draftKeyFor(articleId), [articleId]);
  const auto = useAutoSaveDraft<LocalWorkingCopy>(draftKey, TTL_HOURS);

  const queueCache = React.useCallback<
    LocalDraftResilienceHandle['queueCache']
  >(
    (snapshot) => {
      if (!articleId) return;
      auto.queueSave(snapshot);
    },
    [auto, articleId],
  );

  return {
    workingCopy: auto.value,
    queueCache,
    clear: auto.clear,
    lastCachedAtIso: auto.lastSavedAt,
    isCachePending: auto.isSavePending,
    draftKey,
  };
}
