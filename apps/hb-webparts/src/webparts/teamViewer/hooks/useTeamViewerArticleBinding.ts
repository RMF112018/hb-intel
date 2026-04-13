/**
 * useTeamViewerArticleBinding — canonical article-binding resolver.
 *
 * The resolver always returns a binding whose `listHostUrl` points at
 * the canonical HBCentral publisher control plane. The render site +
 * page URL are carried separately so the data layer can filter the
 * `HB Article Destination Pages` list **at HBCentral** using the
 * render host as the match key.
 *
 * Canonical resolution order (locked):
 *
 *   1. explicit `articleId` on config           → 'direct-binding'
 *   2. explicit `destinationKey` on config      → 'property'
 *   3. (renderSiteUrl + renderPageUrl) lookup   → 'host-context'
 *
 * When a render host or page URL is missing, the binding still returns
 * with `articleId = ''`, source = `'host-context'` and the data hook
 * will refuse to issue a destination-page lookup and render the
 * article-unresolved empty variant. There is no silent "best guess"
 * match anywhere in the pipeline.
 */
import { useMemo } from 'react';
import type { TeamViewerArticleBinding, TeamViewerConfig } from '../teamViewerContracts.js';
import { resolveTeamViewerListHostUrl } from '../data/teamViewerHostContext.js';
import { getSiteUrl } from '../../../homepage/data/spContext.js';

export interface UseTeamViewerArticleBindingInput {
  config: Pick<TeamViewerConfig, 'articleId' | 'destinationKey' | 'listHostOverride'>;
  /** Current SharePoint page URL (absolute or server-relative). */
  pageUrl?: string;
}

export function useTeamViewerArticleBinding(
  input: UseTeamViewerArticleBindingInput,
): TeamViewerArticleBinding {
  const { articleId, destinationKey, listHostOverride } = input.config;
  const pageUrl = input.pageUrl;

  return useMemo<TeamViewerArticleBinding>(() => {
    const listHostUrl = resolveTeamViewerListHostUrl(listHostOverride);
    const renderSiteUrl = getSiteUrl() ?? undefined;
    const renderPageUrl = pageUrl;

    if (articleId) {
      return {
        listHostUrl,
        renderSiteUrl,
        renderPageUrl,
        articleId,
        destinationKey,
        resolutionSource: 'direct-binding',
      };
    }

    if (destinationKey) {
      // A destinationKey property is declared intent to resolve via the
      // destination-page row with this stable key; the data layer
      // handles the lookup in Prompt-02's fetch layer. articleId stays
      // empty until the lookup lands.
      return {
        listHostUrl,
        renderSiteUrl,
        renderPageUrl,
        articleId: '',
        destinationKey,
        resolutionSource: 'property',
      };
    }

    // Host-context: the data layer will filter the destination-pages
    // list at HBCentral by (renderSiteUrl, renderPageUrl) to recover
    // the bound articleId. When either is missing we still return a
    // binding so the orchestrator can render the intentional
    // article-unresolved empty state.
    return {
      listHostUrl,
      renderSiteUrl,
      renderPageUrl,
      articleId: '',
      resolutionSource: 'host-context',
    };
  }, [articleId, destinationKey, listHostOverride, pageUrl]);
}
