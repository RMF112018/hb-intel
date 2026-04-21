/**
 * HbKudos — Employee-facing HB Kudos recognition webpart.
 *
 * Split-runtime adjacency (Phase-21 Wave 4 containment contract):
 *   - Sibling runtime: `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`.
 *   - Ownership map: `./kudosRuntimeContract.ts` (authoritative).
 *   - Shared local product layer: `./kudosSurfaceFamily.ts` (tokens,
 *     icons, variants, style modules). Do NOT reach across runtimes;
 *     compose from the family index only.
 *   - Webpart id: `HB_KUDOS_WEBPART_ID` in `./kudosRuntimeContract.ts`;
 *     mirrored in `HbKudosWebPart.manifest.json` and `mount.tsx`.
 *   - This runtime OWNS the viewer experience (featured, recent,
 *     archive, article reader, composer, celebrate, host-safe zone)
 *     and MUST NOT own governance queue state, patch planning, or
 *     audit dispatch — those are the companion's responsibilities.
 *
 * Premium homepage-hosted recognition surface delivering:
 *
 *   - featured spotlight + recent recognition rail via
 *     `PublicKudosSurface`,
 *   - typed-recipient submission flow via the composer flyout,
 *   - archive browse with configurable age-off for previously-approved
 *     kudos,
 *   - role-safe article reader (Decision Lock §99-107): viewers see
 *     recognition content, recipient detail, and high-level status
 *     only — no audit timeline, governance metadata, or prominence
 *     internals,
 *   - discard-draft confirmation dialog for the composer.
 *
 * Visibility rules:
 *   - Public: `isPubliclyVisible` + `!hasAgedOff` with configurable
 *     `homepageAgeOffDays` property (default 14).
 *   - Archive: `isArchiveEligible` + `isAssociatedVisible` for
 *     submitter/recipient access to no-longer-public items.
 *
 * Phase-19 Wave 2 orchestration refactor:
 *   The data-read, current-user resolution, photo hydration, celebrate
 *   mutation, and host-safe layout concerns have been extracted into
 *   focused hooks under `./hooks`. The composer and feed flyouts are
 *   their own composition components. This file is now a thin
 *   orchestrator: it assembles derived data, wires event handlers,
 *   and renders the product-level composition.
 */
import * as React from 'react';
import { HbcEmptyState, HbcSpinner } from '@hbc/ui-kit/homepage';
import { useSharePointPeopleSearch } from '../../homepage/data/useSharePointPeopleSearch.js';
import { useKudosComposer } from '../../homepage/data/useKudosComposer.js';
import { submitKudosDraft } from '../../homepage/data/kudosAdapter/index.js';
import type { HomepageIdentityInput } from '../../homepage/helpers/identity.js';
import type { KudosEntry } from '../../homepage/webparts/kudosContracts.js';
import {
  KudosGovernanceInputDialog,
  kudosCSSVars,
} from '../../homepage/shared/KudosGovernancePrimitives.js';
import kudosSurfaceStyles from './kudosSurface.module.css';
import { ArchiveList } from './ArchiveList.js';
import { PublicKudosSurface } from './PublicKudosSurface.js';
import { KudosArticleReader } from './KudosArticleReader.js';
import { KudosComposerPanel } from './KudosComposerPanel.js';
import { KudosFeedPanel } from './KudosFeedPanel.js';
import { useCurrentUserId } from './hooks/useCurrentUserId.js';
import { usePublicKudosData } from './hooks/usePublicKudosData.js';
import {
  useRecipientPhotoHydration,
  useGraphPersonPhotoFn,
} from './hooks/useRecipientPhotoHydration.js';
import { useCelebrateAction } from './hooks/useCelebrateAction.js';
import { useHostSafeLayout, SAFE_ZONE_SIZE_PX } from './hooks/useHostSafeLayout.js';
import { selectFeaturedAndRecent, sortByRecency } from './hooks/kudosFeatured.js';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface HbKudosProps {
  config?: Record<string, unknown>;
  identity?: HomepageIdentityInput;
  assetBaseUrl?: string;
  /** Graph-scoped token provider for directory photo fetch. */
  getGraphToken?: () => Promise<string>;
}

const DEFAULT_AGE_OFF_DAYS = 14;

function resolveConfig(config: HbKudosProps['config']): {
  heading: string;
  showArchive: boolean;
  ageOffDays: number;
} {
  const heading =
    (typeof config?.heading === 'string' && config.heading) || 'HB Kudos';
  const showArchive = config?.showArchive !== false;
  const ageOffDays =
    typeof config?.homepageAgeOffDays === 'number' && config.homepageAgeOffDays > 0
      ? config.homepageAgeOffDays
      : DEFAULT_AGE_OFF_DAYS;
  return { heading, showArchive, ageOffDays };
}

export function HbKudos({ config, identity, getGraphToken }: HbKudosProps): React.JSX.Element {
  const { heading, showArchive, ageOffDays } = resolveConfig(config);

  const currentUserId = useCurrentUserId();
  const {
    allKudos,
    publicKudos,
    archiveKudos,
    isLoading,
    error,
    hasListConfig,
    refresh,
  } = usePublicKudosData(ageOffDays, currentUserId);

  const searchPeople = useSharePointPeopleSearch();
  const fetchPersonPhoto = useGraphPersonPhotoFn(getGraphToken);
  const { hydrate } = useRecipientPhotoHydration(allKudos, getGraphToken);

  const handleSubmit = React.useCallback(
    async (draft: Parameters<typeof submitKudosDraft>[0]) => {
      const result = await submitKudosDraft(draft, {
        submitterDisplayName: identity?.displayName,
        submitterEmail: identity?.email,
      });
      if (!result.ok) throw new Error(result.error);
    },
    [identity?.displayName, identity?.email],
  );

  const composer = useKudosComposer(handleSubmit, { recipientsMode: 'typed' });
  const { state: composerState, actions: composerActions } = composer;

  const { celebrating, celebrate } = useCelebrateAction({
    actorEmail: identity?.email,
    onRefresh: refresh,
  });
  const handleCelebrate = React.useCallback(
    (kudosId: string) => celebrate(kudosId, publicKudos),
    [celebrate, publicKudos],
  );

  const [detailEntry, setDetailEntry] = React.useState<KudosEntry | undefined>();
  const [discardDialog, setDiscardDialog] = React.useState(false);
  const [feedOpen, setFeedOpen] = React.useState(false);
  const [archiveSearch, setArchiveSearch] = React.useState('');

  const handleComposerClose = (): void => {
    if (composerState.isDirty && composerState.status === 'editing') {
      setDiscardDialog(true);
      return;
    }
    composerActions.close();
  };

  const { isHosted, safeZonePadding } = useHostSafeLayout();

  if (isLoading) {
    return (
      <div
        data-hbc-webpart="hb-kudos"
        data-hbc-testid="hb-kudos-public-root"
        className={kudosSurfaceStyles.shellLoading}
      >
        <HbcSpinner size="md" />
      </div>
    );
  }

  if (error && !hasListConfig) {
    return (
      <section
        data-hbc-webpart="hb-kudos"
        data-hbc-state="error"
        data-hbc-testid="hb-kudos-public-root"
      >
        <HbcEmptyState
          title="Recognition data unavailable"
          description="Unable to load HB Kudos data. Please try refreshing the page."
        />
      </section>
    );
  }

  // Featured selection: first quality-gated entry in recency-sorted
  // public list is featured; remaining (up to 7) flow to the recent rail.
  const sortedPublic = sortByRecency(hydrate(publicKudos));
  const { featured: featuredEntry, recent: recentEntries } = selectFeaturedAndRecent(sortedPublic);
  const hydratedArchive = hydrate(archiveKudos);

  const handleOpenArticle = (entry: KudosEntry): void => {
    setDetailEntry(entry);
  };

  return (
    <section
      data-hbc-webpart="hb-kudos"
      data-hbc-webpart-phase="phase-14-kudos-phase-05"
      data-hbc-testid="hb-kudos-public-root"
      data-hbc-hosted={isHosted ? 'true' : 'false'}
      aria-label="HB Kudos recognition"
      className={kudosSurfaceStyles.shellRoot}
      style={{
        ...kudosCSSVars(),
        ...safeZonePadding,
        '--hbk-safe-zone-size': `${SAFE_ZONE_SIZE_PX}px`,
      } as React.CSSProperties}
    >
      <PublicKudosSurface
        heading={heading}
        featured={featuredEntry}
        recent={recentEntries}
        archiveCount={hydratedArchive.length}
        onGiveKudos={composerActions.open}
        onCelebrate={handleCelebrate}
        celebrateLoading={celebrating}
        onOpenArticle={handleOpenArticle}
      />

      {showArchive ? (
        <ArchiveList
          entries={hydratedArchive}
          searchText={archiveSearch}
          onSearchChange={setArchiveSearch}
          onOpenEntry={handleOpenArticle}
          onViewAll={() => setFeedOpen(true)}
        />
      ) : null}

      <KudosArticleReader
        entry={detailEntry}
        onClose={() => setDetailEntry(undefined)}
      />

      <KudosComposerPanel
        composer={composer}
        submitterName={identity?.displayName}
        searchPeople={searchPeople}
        fetchPersonPhoto={fetchPersonPhoto}
        onRequestClose={handleComposerClose}
      />

      <KudosFeedPanel
        open={feedOpen}
        publicKudos={publicKudos}
        archiveKudos={archiveKudos}
        hydrate={hydrate}
        onClose={() => setFeedOpen(false)}
        onOpenDetail={(entry) => { setFeedOpen(false); setDetailEntry(entry); }}
      />

      <KudosGovernanceInputDialog
        open={discardDialog}
        onClose={() => setDiscardDialog(false)}
        onConfirm={() => { setDiscardDialog(false); composerActions.close(); }}
        title="Discard draft?"
        description="You have unsaved changes. Your draft will be lost."
        confirmLabel="Discard"
        allowEmpty
      />

      {/* Hosted bottom-right safe-zone sentinel. Harness uses this to
          assert the persistent assistant overlay never intersects
          archive/footer. */}
      {isHosted ? (
        <div
          data-hbc-testid="kudos-assistant-safezone"
          aria-hidden="true"
          className={kudosSurfaceStyles.shellSafeZoneSentinel}
        />
      ) : null}
    </section>
  );
}
