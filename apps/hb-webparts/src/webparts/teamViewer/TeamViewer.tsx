/**
 * TeamViewer — article-bound team-member viewer homepage webpart.
 *
 * Thin orchestrator. Resolves config, resolves the article binding,
 * loads people, hydrates photos, selects density by team size, and
 * renders one of:
 *
 *   - loading spinner while the initial fetch is in-flight;
 *   - error state with a retry when a SharePoint read fails;
 *   - an "article-unresolved" empty variant when no article could be
 *     bound to the current host context (distinct from "bound article
 *     has zero team members");
 *   - the premium people-centric surface when the fetch succeeds.
 *
 * The flag-gated bio/resume drawer mounts only when
 * `flags.profileDetailDrawer === true`. When disabled, person tiles
 * render as static `<article>` elements with no open affordance.
 */
import * as React from 'react';
import type { HomepageIdentityInput } from '../../homepage/helpers/identity.js';
import type { TeamViewerPerson } from './teamViewerContracts.js';
import { resolveTeamViewerConfig } from './teamViewerConfig.js';
import { useTeamViewerArticleBinding } from './hooks/useTeamViewerArticleBinding.js';
import { useTeamViewerData } from './hooks/useTeamViewerData.js';
import { useTeamViewerPhotoHydration } from './hooks/useTeamViewerPhotoHydration.js';
import {
  TEAM_VIEWER_SAFE_ZONE_SIZE_PX,
  useTeamViewerHostSafeLayout,
} from './hooks/useTeamViewerHostSafeLayout.js';
import { groupPeople, selectDensityForSize, sortPeople } from './display/teamViewerSelectors.js';
import { teamViewerCSSVars } from './teamViewerVariants.js';
import { TeamViewerSurface } from './components/TeamViewerSurface.js';
import { TeamViewerEmptyState } from './components/TeamViewerEmptyState.js';
import { TeamViewerErrorState } from './components/TeamViewerErrorState.js';
import { TeamViewerLoadingState } from './components/TeamViewerLoadingState.js';
import { TeamViewerDetailDrawer } from './components/TeamViewerDetailDrawer.js';

export interface TeamViewerProps {
  config?: Record<string, unknown>;
  identity?: HomepageIdentityInput;
  assetBaseUrl?: string;
  /** Current SharePoint page URL; used by host-context article binding. */
  pageUrl?: string;
  /** Graph-scoped token provider for directory photo fetch. */
  getGraphToken?: () => Promise<string>;
}

export function TeamViewer({ config, pageUrl, getGraphToken }: TeamViewerProps): React.JSX.Element {
  const resolved = resolveTeamViewerConfig(config);
  const binding = useTeamViewerArticleBinding({
    config: { articleId: resolved.articleId, destinationKey: resolved.destinationKey },
    pageUrl,
  });
  const { people, isLoading, error, refresh } = useTeamViewerData(binding);
  const { hydrate } = useTeamViewerPhotoHydration(people, {
    siteUrl: binding?.articleSiteUrl,
    getGraphToken,
  });
  const { isHosted, safeZonePadding } = useTeamViewerHostSafeLayout();

  const [detailPerson, setDetailPerson] = React.useState<TeamViewerPerson | undefined>();
  const handleOpenDetail = React.useCallback((p: TeamViewerPerson) => setDetailPerson(p), []);
  const handleCloseDetail = React.useCallback(() => setDetailPerson(undefined), []);

  const sorted = React.useMemo(() => sortPeople(hydrate(people)), [hydrate, people]);
  const groups = React.useMemo(() => groupPeople(sorted), [sorted]);
  const density =
    resolved.density === 'standard' ? selectDensityForSize(sorted.length) : resolved.density;

  const drawerEnabled = resolved.flags.profileDetailDrawer;
  const onOpenDetail = drawerEnabled ? handleOpenDetail : undefined;

  const rootStyle: React.CSSProperties = {
    ...teamViewerCSSVars(),
    ...safeZonePadding,
    ['--team-viewer-safe-zone-size' as string]: `${TEAM_VIEWER_SAFE_ZONE_SIZE_PX}px`,
  };

  const bindingResolved = Boolean(binding?.articleId);
  const bindingAttempted = Boolean(binding);

  return (
    <section
      data-hbc-webpart="team-viewer"
      data-hbc-webpart-phase="phase-01-prompt-03"
      data-hbc-testid="team-viewer-public-root"
      data-hbc-hosted={isHosted ? 'true' : 'false'}
      data-hbc-profile-drawer={drawerEnabled ? 'enabled' : 'disabled'}
      data-hbc-binding={binding?.resolutionSource ?? 'none'}
      aria-label={resolved.heading}
      style={rootStyle}
    >
      {isLoading ? (
        <TeamViewerLoadingState />
      ) : error ? (
        <TeamViewerErrorState error={error} onRetry={refresh} />
      ) : !bindingAttempted ? (
        <TeamViewerEmptyState
          title="Team view not configured"
          description="Provide an article id, destination key, or host-context binding to populate this team view."
        />
      ) : !bindingResolved ? (
        <TeamViewerEmptyState
          title="No article bound to this page"
          description="No article destination is linked to this page yet, so there are no team members to display."
        />
      ) : sorted.length === 0 ? (
        <TeamViewerEmptyState />
      ) : (
        <TeamViewerSurface
          heading={resolved.heading}
          groups={groups}
          layout={resolved.layout}
          density={density}
          onOpenDetail={onOpenDetail}
        />
      )}

      {drawerEnabled ? (
        <TeamViewerDetailDrawer person={detailPerson} onClose={handleCloseDetail} />
      ) : null}
    </section>
  );
}
