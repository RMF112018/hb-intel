/**
 * TeamViewer — article-bound team-member viewer homepage webpart.
 *
 * Phase-01 Prompt-01 scaffold. This orchestrator:
 *   - resolves the viewer configuration (heading, layout, density, flags);
 *   - resolves the active article binding from host site/page context;
 *   - loads (Prompt 02) article-linked team members;
 *   - hydrates person photos via Graph when a token provider is available;
 *   - renders the surface with loading / empty / error states;
 *   - renders a real bio/resume drawer only when the `profileDetailDrawer`
 *     feature flag is enabled (defaults off by product lock).
 *
 * Intentional anti-coupling: TeamViewer imports nothing from the Kudos
 * runtime. See `./teamViewerRuntimeContract.ts` for ownership semantics.
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
  const { people, isLoading, error, hasBinding, refresh } = useTeamViewerData(binding);
  const { hydrate } = useTeamViewerPhotoHydration(people, getGraphToken);
  const { isHosted, safeZonePadding } = useTeamViewerHostSafeLayout();

  const [detailPerson, setDetailPerson] = React.useState<TeamViewerPerson | undefined>();
  const handleOpenDetail = React.useCallback(
    (p: TeamViewerPerson) => setDetailPerson(p),
    [],
  );
  const handleCloseDetail = React.useCallback(() => setDetailPerson(undefined), []);

  const sorted = React.useMemo(() => sortPeople(hydrate(people)), [hydrate, people]);
  const groups = React.useMemo(() => groupPeople(sorted), [sorted]);
  const density = resolved.density === 'standard'
    ? selectDensityForSize(sorted.length)
    : resolved.density;

  const drawerEnabled = resolved.flags.profileDetailDrawer;
  const onOpenDetail = drawerEnabled ? handleOpenDetail : undefined;

  const rootStyle: React.CSSProperties = {
    ...safeZonePadding,
    // Exposed for any future CSS module consumption / hosted harness asserts.
    ['--team-viewer-safe-zone-size' as string]: `${TEAM_VIEWER_SAFE_ZONE_SIZE_PX}px`,
  };

  return (
    <section
      data-hbc-webpart="team-viewer"
      data-hbc-webpart-phase="phase-01-prompt-01"
      data-hbc-testid="team-viewer-public-root"
      data-hbc-hosted={isHosted ? 'true' : 'false'}
      data-hbc-profile-drawer={drawerEnabled ? 'enabled' : 'disabled'}
      aria-label={resolved.heading}
      style={rootStyle}
    >
      {isLoading ? (
        <TeamViewerLoadingState />
      ) : error ? (
        <TeamViewerErrorState error={error} onRetry={refresh} />
      ) : !hasBinding || sorted.length === 0 ? (
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
