/**
 * PeopleCultureMerged — LEGACY COMPATIBILITY runtime for the merged
 * People & Culture webpart.
 *
 * Phase-14 Prompt-01 introduced two new first-class webpart seams that
 * will replace this merged runtime over time:
 *
 *   - PeopleCulturePublic (manifest `e39d9662-34c4-43e6-9425-5770f62da626`)
 *     at `apps/hb-webparts/src/webparts/peopleCulturePublic/PeopleCulturePublic.tsx`
 *   - HbKudos            (manifest `f14e59a3-4d6b-43b2-952e-ba02dea11dad`)
 *     at `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
 *
 * This file and its manifest (`PeopleCultureWebPart.manifest.json`,
 * id `27ac10f4-4054-4dd2-bd53-3b4ef4379ab4`) are preserved intentionally
 * as the **backward-compatibility seam** for already-placed SharePoint
 * page instances that still reference the merged GUID. Do not delete,
 * retarget, or repoint this GUID until the Phase-14 split rollout is
 * complete and every page placement has been migrated off the merged
 * entry. See
 * `docs/architecture/reviews/people-culture-split-initiation-structure.md`
 * for the full structural decision history.
 *
 * W01r-P18 recognition rebuild:
 * All visual grammar now lives in `@hbc/ui-kit/homepage` —
 *   - `HbcPeopleCultureSurface` (hero, spotlight, rail, sparse invite)
 *   - `HbcKudosComposerFlyout` (typed primary/secondary footer actions)
 *   - `HbcKudosComposerForm` / `HbcKudosComposerPreview`
 *   - `HbcKudosComposerSuccess` / `HbcKudosComposerError`
 *
 * This file is now responsible purely for the non-visual concerns:
 *   1. Fetching SharePoint list data via `usePeopleCultureData`,
 *   2. Falling back to manifest prop config for local dev / packaging,
 *   3. Normalizing the merged config via `normalizePeopleCultureMergedConfig`,
 *   4. Adapting the normalized output into the surface view-model,
 *   5. Wiring the kudos composer state hook to the shared flyout/form/preview,
 *   6. Submitting drafts via the SharePoint REST helper.
 *
 * No inline styling. Business logic, contracts, normalization, and
 * submission stay local; the shared layer owns every visual decision.
 */
import * as React from 'react';
import {
  HbcPeopleCultureSurface,
  HbcKudosComposerFlyout,
  HbcKudosComposerForm,
  HbcKudosComposerPreview,
  HbcKudosComposerSuccess,
  HbcKudosComposerError,
  type PeopleCultureSurfaceModel,
  type KudosSpotlightItem,
  type KudosRailItem,
  type PeopleCultureAnnouncement,
  type PeopleCultureCelebration,
} from '@hbc/ui-kit/homepage';
import { resolveAuthoringMessage } from '../../homepage/helpers/authoringGovernance.js';
import { normalizePeopleCultureMergedConfig } from '../../homepage/helpers/communicationsConfig.js';
import { usePeopleCultureData } from '../../homepage/data/usePeopleCultureData.js';
import { useKudosComposer } from '../../homepage/data/useKudosComposer.js';
import { submitKudosDraft } from '../../homepage/data/peopleCultureSubmissionSource.js';
import { HomepageEmptyState } from '../../homepage/shared/HomepageEmptyState.js';
import { HomepageLoadingState } from '../../homepage/shared/HomepageLoadingState.js';
import type { HomepageIdentityInput } from '../../homepage/helpers/identity.js';
import type {
  PeopleCultureMergedConfig,
  PeopleCultureMergedOutput,
  KudosEntry,
  AnnouncementEntry,
  WeeklyCelebrationEntry,
} from '../../homepage/webparts/communicationsContracts.js';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface PeopleCultureMergedProps {
  config?: Partial<PeopleCultureMergedConfig>;
  activeAudience?: string;
  isLoading?: boolean;
  identity?: HomepageIdentityInput;
}

// ---------------------------------------------------------------------------
// Adapters: SharePoint-shaped output → ui-kit surface view-model
// ---------------------------------------------------------------------------

function adaptKudosFeatured(entry: KudosEntry | undefined): KudosSpotlightItem | undefined {
  if (!entry) return undefined;
  return {
    id: entry.id,
    headline: entry.headline,
    excerpt: entry.excerpt,
    recipients: entry.recipients.map((r) => ({
      id: r.id,
      name: r.name,
      src: r.media?.src,
    })),
    submittedByName: entry.submittedBy.displayName,
    celebrateCount: entry.celebrateCount,
  };
}

function adaptKudosRail(entries: KudosEntry[]): KudosRailItem[] {
  return entries.map((entry) => ({
    id: entry.id,
    headline: entry.headline,
    recipients: entry.recipients.map((r) => ({
      id: r.id,
      name: r.name,
      src: r.media?.src,
    })),
    submittedByName: entry.submittedBy.displayName,
    celebrateCount: entry.celebrateCount,
  }));
}

function adaptAnnouncements(entries: AnnouncementEntry[]): PeopleCultureAnnouncement[] {
  return entries.map((entry) => ({
    id: entry.id,
    personName: entry.personName,
    headline: entry.headline,
    type: entry.announcementType,
  }));
}

function adaptCelebrations(entries: WeeklyCelebrationEntry[]): PeopleCultureCelebration[] {
  return entries.map((entry) => ({
    id: entry.id,
    personName: entry.personName,
    type: entry.celebrationType,
    celebrationDate: entry.celebrationDate,
    anniversaryYears: entry.anniversaryYears,
    avatarSrc: entry.media?.src,
  }));
}

function adaptOutput(output: PeopleCultureMergedOutput): PeopleCultureSurfaceModel {
  return {
    heading: output.heading,
    kudos: {
      isEmpty: output.kudos.isEmpty,
      featured: adaptKudosFeatured(output.kudos.featured),
      recent: adaptKudosRail(output.kudos.recentHeadlines),
    },
    announcements: adaptAnnouncements(output.bandA.items),
    celebrations: adaptCelebrations(output.bandB.items),
  };
}

function hasAnyInput(config: Partial<PeopleCultureMergedConfig> | undefined): boolean {
  return Boolean(
    config?.announcements?.length || config?.kudos?.length || config?.celebrations?.length,
  );
}

// ---------------------------------------------------------------------------
// Main consumer
// ---------------------------------------------------------------------------

export function PeopleCultureMerged({
  config,
  activeAudience,
  isLoading = false,
  identity,
}: PeopleCultureMergedProps): React.JSX.Element {
  const { listConfig, isLoading: listLoading } = usePeopleCultureData();

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

  const { state: composer, actions: composerActions } = useKudosComposer(handleSubmit);

  if (isLoading || listLoading) {
    return <HomepageLoadingState label="Loading People & Culture" />;
  }

  // List-sourced data is the primary operating model.
  // Manifest config (props) is the narrow fallback for local dev / demo / packaging.
  const effectiveConfig = listConfig ?? config;

  let output: PeopleCultureMergedOutput;
  try {
    output = normalizePeopleCultureMergedConfig(effectiveConfig, activeAudience);
  } catch {
    const m = resolveAuthoringMessage('peopleCulture', 'invalid');
    return <HomepageEmptyState title={m.title} description={m.description} />;
  }

  const allEmpty = output.bandA.isEmpty && output.kudos.isEmpty && output.bandB.isEmpty;
  if (allEmpty && !hasAnyInput(effectiveConfig)) {
    const m = resolveAuthoringMessage('peopleCulture', 'noData');
    return <HomepageEmptyState title={m.title} description={m.description} />;
  }
  if (allEmpty) {
    const m = resolveAuthoringMessage('peopleCulture', 'invalid');
    return <HomepageEmptyState title={m.title} description={m.description} />;
  }

  const surfaceModel = adaptOutput(output);

  // Unsaved-changes guard for closing the composer
  const handleComposerClose = (): void => {
    if (composer.isDirty && composer.status === 'editing') {
      // eslint-disable-next-line no-alert
      if (!window.confirm('You have unsaved changes. Discard your draft?')) return;
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

  return (
    <>
      <HbcPeopleCultureSurface
        model={surfaceModel}
        onGiveKudos={composerActions.open}
        viewAllHref="#view-all-kudos"
        celebrateHref="#celebrate"
        variant="people-culture-homepage"
      />

      <HbcKudosComposerFlyout
        open={composer.isOpen}
        onClose={handleComposerClose}
        title="Give Kudos"
        subtitle="Celebrate a teammate with a warm recognition note"
        primaryAction={primaryAction}
        secondaryAction={secondaryAction}
      >
        {composer.status === 'success' ? <HbcKudosComposerSuccess /> : null}

        {composer.status === 'error' ? (
          <HbcKudosComposerError
            body={
              composer.submitError || 'An unexpected error occurred. Please try again.'
            }
          />
        ) : null}

        {isEditing ? (
          <>
            <HbcKudosComposerForm
              draft={composer.draft}
              onDraftChange={composerActions.updateDraft}
              errors={composer.validationErrors}
              disabled={composer.status === 'submitting'}
            />
            <div style={{ marginTop: 24 }}>
              <HbcKudosComposerPreview
                draft={composer.draft}
                submitterName={identity?.displayName ?? ''}
              />
            </div>
          </>
        ) : null}
      </HbcKudosComposerFlyout>
    </>
  );
}
