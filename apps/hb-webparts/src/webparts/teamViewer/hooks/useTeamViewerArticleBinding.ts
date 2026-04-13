/**
 * useTeamViewerArticleBinding — resolve the active article for TeamViewer.
 *
 * Resolution order (Prompt 01 scaffold):
 *   1. explicit `articleId` from config    -> resolutionSource: 'direct-binding'
 *   2. explicit `destinationKey` override  -> resolutionSource: 'property'
 *   3. host site/page context               -> resolutionSource: 'host-context'
 *      (Prompt 02 lands the real `HB Article Destination Pages` lookup.)
 *
 * Returns `undefined` when no binding can be resolved. The data hook
 * treats missing binding as an empty-state, not an error — the viewer
 * should degrade cleanly on pages with no article mapping.
 */
import { useMemo } from 'react';
import type { TeamViewerArticleBinding, TeamViewerConfig } from '../teamViewerContracts.js';
import { getSiteUrl } from '../../../homepage/data/spContext.js';

export interface UseTeamViewerArticleBindingInput {
  config: Pick<TeamViewerConfig, 'articleId' | 'destinationKey'>;
  /** Current page URL when available (SPFx page context). */
  pageUrl?: string;
}

export function useTeamViewerArticleBinding(
  input: UseTeamViewerArticleBindingInput,
): TeamViewerArticleBinding | undefined {
  const { articleId, destinationKey } = input.config;
  const pageUrl = input.pageUrl;

  return useMemo<TeamViewerArticleBinding | undefined>(() => {
    const articleSiteUrl = getSiteUrl() ?? undefined;

    if (articleId) {
      return {
        articleId,
        articleSiteUrl,
        articlePageUrl: pageUrl,
        destinationKey,
        resolutionSource: 'direct-binding',
      };
    }

    if (destinationKey) {
      // Scaffold-only: a property-supplied destinationKey is surfaced as
      // the binding intent. Prompt 02 resolves this key to a real
      // articleId via `HB Article Destination Pages`.
      return {
        articleId: '',
        articleSiteUrl,
        articlePageUrl: pageUrl,
        destinationKey,
        resolutionSource: 'property',
      };
    }

    if (articleSiteUrl && pageUrl) {
      // Scaffold-only: declare intent to resolve via host context.
      // Prompt 02 replaces this with a real destination-page list read.
      return {
        articleId: '',
        articleSiteUrl,
        articlePageUrl: pageUrl,
        resolutionSource: 'host-context',
      };
    }

    return undefined;
  }, [articleId, destinationKey, pageUrl]);
}
