/**
 * useTeamViewerData — load article-linked team members from HBCentral.
 *
 * The pipeline honours the locked canonical resolution order emitted
 * by `useTeamViewerArticleBinding`:
 *
 *   binding.resolutionSource === 'direct-binding'
 *     → skip destination lookup, fetch team members directly.
 *
 *   binding.resolutionSource === 'property' (destinationKey supplied)
 *     → fetchArticleIdForDestinationKey(listHostUrl, destinationKey)
 *     → fetchArticleTeamMemberRows(listHostUrl, articleId)
 *
 *   binding.resolutionSource === 'host-context'
 *     → require renderSiteUrl + renderPageUrl; otherwise empty.
 *     → fetchArticleIdForRenderContext(listHostUrl, renderSiteUrl, renderPageUrl)
 *     → fetchArticleTeamMemberRows(listHostUrl, articleId)
 *
 * Every list read uses `binding.listHostUrl` (canonical HBCentral).
 * Render context is used only as filter keys. If any step fails to
 * produce a binding row the hook returns an empty person set so the
 * orchestrator can render the intentional article-unresolved empty
 * variant — there is no silent best-guess match.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { TeamViewerArticleBinding, TeamViewerPerson } from '../teamViewerContracts.js';
import {
  fetchArticleIdForDestinationKey,
  fetchArticleIdForRenderContext,
  fetchArticleTeamMemberRows,
} from '../data/teamViewerListSource.js';
import { normalizeArticleTeamMemberRows } from '../data/teamViewerNormalization.js';

export interface UseTeamViewerDataResult {
  people: TeamViewerPerson[];
  isLoading: boolean;
  error: Error | undefined;
  /** True when a binding was produced (article id known or resolvable). */
  hasBinding: boolean;
  /** True when the pipeline resolved a concrete article id. */
  bindingResolved: boolean;
  refresh: () => void;
}

async function resolveArticleId(
  binding: TeamViewerArticleBinding,
  signal: AbortSignal,
): Promise<string> {
  if (binding.articleId) return binding.articleId;

  if (binding.resolutionSource === 'property' && binding.destinationKey) {
    const result = await fetchArticleIdForDestinationKey(
      { listHostUrl: binding.listHostUrl, destinationKey: binding.destinationKey },
      { signal },
    );
    if (result.status === 'error') throw result.error;
    if (result.status === 'not-provisioned') return '';
    return result.value ?? '';
  }

  if (
    binding.resolutionSource === 'host-context'
    && binding.renderSiteUrl
    && binding.renderPageUrl
  ) {
    const result = await fetchArticleIdForRenderContext(
      {
        listHostUrl: binding.listHostUrl,
        renderSiteUrl: binding.renderSiteUrl,
        renderPageUrl: binding.renderPageUrl,
      },
      { signal },
    );
    if (result.status === 'error') throw result.error;
    if (result.status === 'not-provisioned') return '';
    return result.value ?? '';
  }

  return '';
}

async function resolvePeople(
  binding: TeamViewerArticleBinding,
  signal: AbortSignal,
): Promise<{ articleId: string; people: TeamViewerPerson[] }> {
  const articleId = await resolveArticleId(binding, signal);
  if (!articleId) return { articleId: '', people: [] };

  const rows = await fetchArticleTeamMemberRows(
    { listHostUrl: binding.listHostUrl, articleId },
    { signal },
  );
  if (rows.status === 'error') throw rows.error;
  if (rows.status === 'not-provisioned') return { articleId, people: [] };
  return { articleId, people: normalizeArticleTeamMemberRows(rows.value, articleId) };
}

export function useTeamViewerData(
  binding: TeamViewerArticleBinding | undefined,
): UseTeamViewerDataResult {
  const [people, setPeople] = useState<TeamViewerPerson[]>([]);
  const [resolvedArticleId, setResolvedArticleId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(binding));
  const [error, setError] = useState<Error | undefined>();
  const [nonce, setNonce] = useState(0);
  const abortRef = useRef<AbortController | undefined>(undefined);

  const refresh = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    abortRef.current?.abort();
    if (!binding) {
      setPeople([]);
      setResolvedArticleId('');
      setIsLoading(false);
      setError(undefined);
      return;
    }
    const controller = new AbortController();
    abortRef.current = controller;
    setIsLoading(true);
    setError(undefined);

    resolvePeople(binding, controller.signal)
      .then(({ articleId, people: resolved }) => {
        if (controller.signal.aborted) return;
        setResolvedArticleId(articleId);
        setPeople(resolved);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err : new Error(String(err)));
        setResolvedArticleId('');
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
    bindingResolved: Boolean(resolvedArticleId),
    refresh,
  };
}
