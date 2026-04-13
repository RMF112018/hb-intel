/**
 * useTeamViewerData — data hook for article-linked team members.
 *
 * Resolves people for the current article binding via the TeamViewer
 * list source:
 *
 *   - when the binding has a concrete `articleId`, read team-member
 *     rows directly and normalize;
 *   - when the binding is `host-context` (no article id yet), resolve
 *     the bound articleId from `HB Article Destination Pages`, then
 *     continue as above;
 *   - when a required list is not yet provisioned, return an empty
 *     person set (the surface will render the empty state rather than
 *     an error).
 *
 * Refresh semantics: callers invoke `refresh()` to bump a nonce which
 * re-runs the effect and re-issues the fetch. The hook uses an
 * `AbortController` so re-binding mid-flight cancels in-flight reads.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { TeamViewerArticleBinding, TeamViewerPerson } from '../teamViewerContracts.js';
import {
  fetchArticleIdForHostContext,
  fetchArticleTeamMemberRows,
} from '../data/teamViewerListSource.js';
import { normalizeArticleTeamMemberRows } from '../data/teamViewerNormalization.js';

export interface UseTeamViewerDataResult {
  people: TeamViewerPerson[];
  isLoading: boolean;
  error: Error | undefined;
  hasBinding: boolean;
  refresh: () => void;
}

async function resolvePeople(
  binding: TeamViewerArticleBinding,
  signal: AbortSignal,
): Promise<TeamViewerPerson[]> {
  const siteUrl = binding.articleSiteUrl;
  if (!siteUrl) return [];

  let articleId = binding.articleId;
  if (!articleId && binding.resolutionSource === 'host-context' && binding.articlePageUrl) {
    const destination = await fetchArticleIdForHostContext(siteUrl, binding.articlePageUrl, {
      signal,
    });
    if (destination.status === 'error') throw destination.error;
    if (destination.status === 'not-provisioned') return [];
    articleId = destination.value ?? '';
  }
  if (!articleId) return [];

  const rows = await fetchArticleTeamMemberRows(siteUrl, articleId, { signal });
  if (rows.status === 'error') throw rows.error;
  if (rows.status === 'not-provisioned') return [];
  return normalizeArticleTeamMemberRows(rows.value, articleId);
}

export function useTeamViewerData(
  binding: TeamViewerArticleBinding | undefined,
): UseTeamViewerDataResult {
  const [people, setPeople] = useState<TeamViewerPerson[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(binding));
  const [error, setError] = useState<Error | undefined>();
  const [nonce, setNonce] = useState(0);
  const abortRef = useRef<AbortController | undefined>(undefined);

  const refresh = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    abortRef.current?.abort();
    if (!binding) {
      setPeople([]);
      setIsLoading(false);
      setError(undefined);
      return;
    }
    const controller = new AbortController();
    abortRef.current = controller;
    setIsLoading(true);
    setError(undefined);

    resolvePeople(binding, controller.signal)
      .then((resolved) => {
        if (controller.signal.aborted) return;
        setPeople(resolved);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err : new Error(String(err)));
        setPeople([]);
        setIsLoading(false);
      });

    return () => controller.abort();
  }, [binding, nonce]);

  return {
    people,
    isLoading,
    error,
    hasBinding: Boolean(binding),
    refresh,
  };
}
