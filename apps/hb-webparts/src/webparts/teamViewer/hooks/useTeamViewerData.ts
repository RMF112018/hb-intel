/**
 * useTeamViewerData — data hook for article-linked team members.
 *
 * Prompt 01 scaffold. The real SharePoint list reads for
 * `HB Articles` / `HB Article Team Members` / `HB Article Destination Pages`
 * land in Prompt 02. This scaffold exposes the final hook shape so the
 * orchestrator can render loading / empty / error states today and only
 * the internals change when bindings go live.
 */
import { useCallback, useState } from 'react';
import type { TeamViewerArticleBinding, TeamViewerPerson } from '../teamViewerContracts.js';

export interface UseTeamViewerDataResult {
  people: TeamViewerPerson[];
  isLoading: boolean;
  error: Error | undefined;
  hasBinding: boolean;
  refresh: () => void;
}

export function useTeamViewerData(
  binding: TeamViewerArticleBinding | undefined,
): UseTeamViewerDataResult {
  // Placeholder state; Prompt 02 adds real fetch logic keyed off binding.
  const [nonce, setNonce] = useState(0);
  const refresh = useCallback(() => setNonce((n) => n + 1), []);

  // Note the `nonce` read is intentional so future memoization / SWR
  // integrations can key off the current refresh counter.
  void nonce;

  return {
    people: [],
    isLoading: false,
    error: undefined,
    hasBinding: Boolean(binding && binding.articleId),
    refresh,
  };
}
