/**
 * HbKudos — Employee-facing HB Kudos recognition webpart.
 *
 * Premium homepage-hosted recognition surface delivering:
 *
 *   - featured spotlight + recent recognition rail via
 *     `HbcPeopleCultureSurface`,
 *   - typed-recipient submission flow via `HbcKudosComposer*` shared
 *     primitives with any-bucket validation (individual, team,
 *     department, project group, or mixed),
 *   - archive browse with configurable age-off for previously-approved
 *     kudos,
 *   - role-safe detail panel (Decision Lock §99-107): viewers see
 *     recognition content, recipient detail, and high-level status
 *     only — no audit timeline, governance metadata, or prominence
 *     internals,
 *   - submitter withdraw and resubmit flows via dialog-driven
 *     interactions (no window.prompt).
 *
 * All visual grammar delivered through `@hbc/ui-kit/homepage` and
 * shared governance primitives from `KudosGovernancePrimitives.tsx`.
 *
 * Visibility rules:
 *   - Public: `isPubliclyVisible` + `hasAgedOff` predicate with
 *     configurable `homepageAgeOffDays` property.
 *   - Archive: `isArchiveEligible` + `isAssociatedVisible` for
 *     submitter/recipient access to no-longer-public items.
 *
 * Surface path: shared visual grammar via @hbc/ui-kit/homepage,
 * local data adaptation and state orchestration in this webpart.
 */
import * as React from 'react';
import {
  HbcKudosComposerFlyout,
  HbcKudosComposerForm,
  HbcKudosComposerPreview,
  HbcKudosComposerSuccess,
  HbcKudosComposerError,
  HbcEmptyState,
  HbcSpinner,
  createGraphPersonPhotoFn,
} from '@hbc/ui-kit/homepage';
import { usePeopleCultureData } from '../../homepage/data/usePeopleCultureData.js';
import { useSharePointPeopleSearch } from '../../homepage/data/useSharePointPeopleSearch.js';
import { useKudosComposer } from '../../homepage/data/useKudosComposer.js';
import { submitKudosDraft } from '../../homepage/data/peopleCultureSubmissionSource.js';
import type { HomepageIdentityInput } from '../../homepage/helpers/identity.js';
import {
  hasAgedOff,
  isArchiveEligible,
  isAssociatedVisible,
  isPubliclyVisible,
  type KudosEntry,
} from '../../homepage/webparts/kudosContracts.js';
import {
  KudosGovernanceInputDialog,
} from '../../homepage/shared/KudosGovernancePrimitives.js';
import { submitKudosGovernanceAction } from '../../homepage/data/kudosGovernanceWriter.js';
import { getKudosListHostUrl, resolveCurrentUserId } from '../../homepage/data/spContext.js';
import { ArchiveList } from './ArchiveList.js';
import { KudosFeedBody } from './KudosFeedBody.js';
import { PublicKudosSurface } from './PublicKudosSurface.js';
import { KudosArticleReader } from './KudosArticleReader.js';

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

// ---------------------------------------------------------------------------
// Adapters (local, thin)
// ---------------------------------------------------------------------------

/**
 * Sort approved kudos by most recent submission date so the spotlight
 * surfaces the freshest live recognition.
 */
function sortByRecency(entries: KudosEntry[]): KudosEntry[] {
  return [...entries].sort((a, b) => {
    const aTs = Date.parse(a.submittedDate) || 0;
    const bTs = Date.parse(b.submittedDate) || 0;
    return bTs - aTs;
  });
}

/**
 * Content-quality gate for the featured spotlight slot. An entry is
 * "featured-worthy" only when it carries enough content for the
 * premium spotlight card to render credibly — requires BOTH at least
 * one recipient (for the hero avatar ring) AND textual body content
 * from excerpt or details (for the content area). Without both
 * dimensions the card renders as a hollow shell. Entries that fail
 * this gate still flow to the recent rail where the simpler row
 * layout tolerates minimal content.
 */
function isFeaturedWorthy(entry: KudosEntry): boolean {
  const hasRecipients = (entry.recipients ?? []).length > 0;
  const hasText = !!(entry.excerpt?.trim() || entry.details?.trim());
  return hasRecipients && hasText;
}

// (adaptSpotlight/adaptRail/buildKudosSurfaceModel retired — the new
// PublicKudosSurface consumes KudosEntry directly, no ui-kit model
// adapters are required.)

// ---------------------------------------------------------------------------
// Archive list + Feed body: extracted into sibling modules in phase-17
// (see ./ArchiveList.tsx and ./KudosFeedBody.tsx).
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Main webpart — DetailPanel retired in favor of KudosArticleReader.
// Submitter withdraw/resubmit flows will be reintroduced via a dedicated
// "My Submissions" affordance in a follow-up.
// ---------------------------------------------------------------------------

const DEFAULT_AGE_OFF_DAYS = 14;

export function HbKudos({ config, identity, getGraphToken }: HbKudosProps): React.JSX.Element {
  const heading =
    (typeof config?.heading === 'string' && config.heading) || 'HB Kudos';
  const showArchive = config?.showArchive !== false;
  const ageOffDays =
    typeof config?.homepageAgeOffDays === 'number' && config.homepageAgeOffDays > 0
      ? config.homepageAgeOffDays
      : DEFAULT_AGE_OFF_DAYS;

  const { listConfig, isLoading, error: listError, refresh: refreshData } = usePeopleCultureData();
  const searchPeople = useSharePointPeopleSearch();
  const fetchPersonPhoto = React.useMemo(
    () => getGraphToken ? createGraphPersonPhotoFn(getGraphToken) : undefined,
    [getGraphToken],
  );

  // Resolve current user ID for associated-item visibility.
  const [currentUserId, setCurrentUserId] = React.useState<number | undefined>();
  React.useEffect(() => {
    resolveCurrentUserId().then(setCurrentUserId).catch(() => {});
  }, []);

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

  const { state: composer, actions: composerActions } = useKudosComposer(handleSubmit, {
    recipientsMode: 'typed',
  });

  const [detailEntry, setDetailEntry] = React.useState<KudosEntry | undefined>();
  const [celebrating, setCelebrating] = React.useState(false);
  const [discardDialog, setDiscardDialog] = React.useState(false);
  const [feedOpen, setFeedOpen] = React.useState(false);

  const allKudos: KudosEntry[] = listConfig?.kudos ?? [];

  // Hydrate individual recipient photos from Graph. Maintains a
  // cache keyed by email so photos are fetched once per recipient
  // across featured/recent/archive surfaces.
  const [recipientPhotoCache, setRecipientPhotoCache] = React.useState<Record<string, string>>({});
  React.useEffect(() => {
    if (!fetchPersonPhoto || allKudos.length === 0) return;
    let cancelled = false;
    const emails = new Set<string>();
    for (const entry of allKudos) {
      for (const r of entry.recipients) {
        if (r.recipientType === 'individual' && r.email && !recipientPhotoCache[r.email]) {
          emails.add(r.email);
        }
      }
    }
    if (emails.size === 0) return;
    const fetchAll = async (): Promise<void> => {
      const results: Record<string, string> = {};
      for (const email of emails) {
        try {
          const url = await fetchPersonPhoto(email);
          if (url && !cancelled) results[email] = url;
        } catch { /* no photo available — initials fallback */ }
      }
      if (!cancelled && Object.keys(results).length > 0) {
        setRecipientPhotoCache((prev) => ({ ...prev, ...results }));
      }
    };
    void fetchAll();
    return () => { cancelled = true; };
  }, [fetchPersonPhoto, allKudos]); // eslint-disable-line react-hooks/exhaustive-deps

  // Inject hydrated photos into entries for the surface adapters.
  const hydrateRecipientPhotos = React.useCallback(
    (entries: KudosEntry[]): KudosEntry[] => {
      if (Object.keys(recipientPhotoCache).length === 0) return entries;
      return entries.map((entry) => ({
        ...entry,
        recipients: entry.recipients.map((r) => {
          if (r.recipientType !== 'individual' || !r.email) return r;
          const photoUrl = recipientPhotoCache[r.email];
          if (!photoUrl) return r;
          return { ...r, media: { src: photoUrl, alt: r.name } };
        }),
      }));
    },
    [recipientPhotoCache],
  );

  const publicKudos = React.useMemo(
    () =>
      allKudos.filter((entry) => {
        if (entry.workflowStatus) {
          if (!isPubliclyVisible(entry)) return false;
          if (hasAgedOff(entry, ageOffDays)) return false;
          return true;
        }
        // Legacy entries pre-dating the workflowStatus field: require
        // approved status AND homepageEnabled not explicitly disabled.
        // This prevents entries that were disabled via governance from
        // leaking through the legacy fallback path.
        if (entry.status !== 'approved') return false;
        if (entry.homepageEnabled === false) return false;
        return true;
      }),
    [allKudos, ageOffDays],
  );

  const archiveKudos = React.useMemo(
    () =>
      sortByRecency(
        allKudos.filter((entry) => {
          if (entry.workflowStatus) {
            if (isArchiveEligible(entry)) return true;
            return isAssociatedVisible(entry, currentUserId);
          }
          // Legacy fallback: require approved status and not explicitly
          // removed from public view.
          if (entry.status !== 'approved') return false;
          if ((entry as Partial<{ isRemovedFromPublicView: boolean }>).isRemovedFromPublicView === true) return false;
          return true;
        }),
      ),
    [allKudos, currentUserId],
  );

  const [archiveSearch, setArchiveSearch] = React.useState('');

  if (isLoading) {
    return (
      <div
        data-hbc-webpart="hb-kudos"
        data-hbc-testid="hb-kudos-public-root"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}
      >
        <HbcSpinner size="md" />
      </div>
    );
  }

  if (listError && !listConfig) {
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

  const handleComposerClose = (): void => {
    if (composer.isDirty && composer.status === 'editing') {
      setDiscardDialog(true);
      return;
    }
    composerActions.close();
  };

  const isEditing =
    composer.status === 'editing' ||
    composer.status === 'error' ||
    composer.status === 'submitting';

  const primaryAction =
    composer.status === 'success'
      ? { label: 'Done', onClick: composerActions.close }
      : {
          label: 'Send Kudos',
          onClick: composerActions.submit,
          loading: composer.status === 'submitting',
        };

  const secondaryAction =
    composer.status === 'success'
      ? { label: 'Send Another', onClick: () => composerActions.reset() }
      : { label: 'Cancel', onClick: handleComposerClose };

  // Featured selection: first entry that passes the content-quality gate
  // becomes featured; remaining approved entries (up to 7) flow to the
  // recent list. If nothing passes the gate the featured slot is empty
  // and PublicKudosSurface renders the invite empty-state.
  const hydratedPublic = hydrateRecipientPhotos(publicKudos);
  const sortedPublic = sortByRecency(hydratedPublic);
  const featuredIdx = sortedPublic.findIndex(isFeaturedWorthy);
  const featuredEntry = featuredIdx >= 0 ? sortedPublic[featuredIdx] : undefined;
  const recentEntries = sortedPublic.filter((_, i) => i !== featuredIdx).slice(0, 7);

  // Unified handler used by featured Read more, recent rows, and archive rows.
  const handleOpenArticle = (entry: KudosEntry): void => {
    setDetailEntry(entry);
  };

  const handleCelebrate = (kudosId: string): void => {
    const entry = publicKudos.find((e) => e.id === kudosId);
    if (!entry || celebrating) return;
    setCelebrating(true);
    const current = entry.celebrateCount ?? 0;
    const siteUrl = getKudosListHostUrl();
    if (!siteUrl) { setCelebrating(false); return; }
    void submitKudosGovernanceAction(
      siteUrl,
      { kind: 'celebrate', kudosId: entry.id, nextCount: current + 1 },
      { actorEmail: identity?.email },
    ).then(() => refreshData()).finally(() => setCelebrating(false));
  };

  // Hosted safe zone: when rendered inside the SharePoint iframe the
  // persistent bottom-right assistant overlay can conflict with the
  // archive/footer. Reserve a 72×72 no-conflict zone at the bottom-right
  // and expose a sentinel so the harness can assert non-overlap.
  const isHostedEnvironment =
    typeof window !== 'undefined' && window.self !== window.top;
  // Top safe spacing uses env(safe-area-inset-top) on devices that
  // report it (iOS notches, etc.) with a 12px minimum. Bottom-right
  // safe zone is always 72x72 plus any inset so the assistant overlay
  // cannot visually conflict with archive rows / footer content.
  const hostedSafeZonePadding: React.CSSProperties = isHostedEnvironment
    ? {
        paddingTop: 'max(12px, env(safe-area-inset-top, 0px))',
        paddingRight: 72,
        paddingBottom: 'max(72px, calc(env(safe-area-inset-bottom, 0px) + 64px))',
      }
    : {};

  return (
    <section
      data-hbc-webpart="hb-kudos"
      data-hbc-webpart-phase="phase-14-kudos-phase-05"
      data-hbc-testid="hb-kudos-public-root"
      data-hbc-hosted={isHostedEnvironment ? 'true' : 'false'}
      aria-label="HB Kudos recognition"
      style={{ position: 'relative', ...hostedSafeZonePadding }}
    >
      <PublicKudosSurface
        heading={heading}
        featured={featuredEntry}
        recent={recentEntries}
        onGiveKudos={composerActions.open}
        onCelebrate={handleCelebrate}
        celebrateLoading={celebrating}
        onOpenArticle={handleOpenArticle}
      />

      {showArchive ? (
        <ArchiveList
          entries={hydrateRecipientPhotos(archiveKudos)}
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

      <HbcKudosComposerFlyout
        open={composer.isOpen}
        onClose={handleComposerClose}
        title="Give Kudos"
        subtitle="Celebrate a teammate with a warm recognition note"
        primaryAction={primaryAction}
        secondaryAction={secondaryAction}
      >
        {composer.status === 'success' ? (
          <div data-hbc-testid="hb-kudos-composer-success">
            <HbcKudosComposerSuccess />
          </div>
        ) : null}

        {composer.status === 'error' ? (
          <div role="alert" data-hbc-testid="hb-kudos-composer-error">
            <HbcKudosComposerError
              body={composer.submitError || 'An unexpected error occurred. Please try again.'}
            />
          </div>
        ) : null}

        {isEditing ? (
          <>
            <div data-hbc-testid="hb-kudos-composer-form">
              <HbcKudosComposerForm
                draft={composer.draft}
                onDraftChange={composerActions.updateDraft}
                errors={composer.validationErrors}
                disabled={composer.status === 'submitting'}
                recipientsMode="typed"
                searchPeople={searchPeople}
                fetchPersonPhoto={fetchPersonPhoto}
              />
            </div>
            <div data-hbc-testid="hb-kudos-composer-preview">
              <HbcKudosComposerPreview
                draft={composer.draft}
                submitterName={identity?.displayName ?? ''}
              />
            </div>
          </>
        ) : null}
      </HbcKudosComposerFlyout>

      <HbcKudosComposerFlyout
        open={feedOpen}
        onClose={() => setFeedOpen(false)}
        title="HB Kudos"
        subtitle="All recognition across the company"
        primaryAction={{ label: 'Close', onClick: () => setFeedOpen(false) }}
      >
        <div data-hbc-testid="hb-kudos-view-all-panel">
        <KudosFeedBody
          entries={hydrateRecipientPhotos([...sortByRecency(publicKudos), ...archiveKudos.filter((a) => !publicKudos.some((p) => p.id === a.id))])}
          onOpenDetail={(entry) => { setFeedOpen(false); setDetailEntry(entry); }}
        />
        </div>
      </HbcKudosComposerFlyout>

      {/* DetailPanel + submitter withdraw/resubmit flows retired in the
          locked-decision reader pass. The article reader above is the
          viewer-only entry point for both featured Read more and recent
          row clicks. Submitter-side actions will be reintroduced via a
          dedicated My Submissions affordance in a follow-up. */}

      <KudosGovernanceInputDialog
        open={discardDialog}
        onClose={() => setDiscardDialog(false)}
        onConfirm={() => { setDiscardDialog(false); composerActions.close(); }}
        title="Discard draft?"
        description="You have unsaved changes. Your draft will be lost."
        confirmLabel="Discard"
        allowEmpty
      />

      {/* Hosted bottom-right safe-zone sentinel. Harness uses this to assert
          the persistent assistant overlay never intersects archive/footer. */}
      {isHostedEnvironment ? (
        <div
          data-hbc-testid="kudos-assistant-safezone"
          aria-hidden="true"
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: 72,
            height: 72,
            pointerEvents: 'none',
          }}
        />
      ) : null}
    </section>
  );
}
