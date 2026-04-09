/**
 * PeopleCultureMerged — Thin consumer for the shared People & Culture surface.
 *
 * Wave 01 follow-on (named-consumer migration): all durable presentation
 * grammar moved into @hbc/ui-kit/homepage as `HbcPeopleCultureSurface` +
 * `HbcKudosComposer*`. This file is now responsible for:
 *
 *   1. Fetching SharePoint list data via `usePeopleCultureData`,
 *   2. Falling back to manifest prop config for local dev / packaging,
 *   3. Normalizing the merged config via `normalizePeopleCultureMergedConfig`,
 *   4. Adapting the normalized output into the surface's view-model,
 *   5. Wiring the kudos composer state hook to the shared flyout/form/preview,
 *   6. Submitting drafts via the SharePoint REST helper.
 *
 * Business logic, contracts, normalization, and submission stay local.
 * Visual grammar lives in the shared layer.
 */
import * as React from 'react';
import {
  HbcPeopleCultureSurface,
  HbcKudosComposerFlyout,
  HbcKudosComposerForm,
  HbcKudosComposerPreview,
  CheckCircle2,
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
  return Boolean(config?.announcements?.length || config?.kudos?.length || config?.celebrations?.length);
}

// ---------------------------------------------------------------------------
// Composer footer renderers (kept local — wire shared button styles or
// existing webpart button conventions; remain inline for the small footer)
// ---------------------------------------------------------------------------

const FOOTER_CANCEL_STYLE: React.CSSProperties = {
  padding: '9px 20px',
  fontSize: '0.8125rem',
  fontWeight: 700,
  borderRadius: 8,
  border: '1.5px solid rgba(229, 126, 70, 0.2)',
  background: '#ffffff',
  color: '#1a1a1a',
  cursor: 'pointer',
  fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
};

const FOOTER_PRIMARY_STYLE: React.CSSProperties = {
  padding: '9px 20px',
  fontSize: '0.8125rem',
  fontWeight: 700,
  borderRadius: 8,
  border: 'none',
  background: '#e57e46',
  color: '#ffffff',
  cursor: 'pointer',
  fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
  transition: 'background 150ms ease',
};

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

  const submittingStyle: React.CSSProperties = {
    ...FOOTER_PRIMARY_STYLE,
    background: composer.status === 'submitting' ? 'rgba(229, 126, 70, 0.5)' : '#e57e46',
    cursor: composer.status === 'submitting' ? 'not-allowed' : 'pointer',
  };

  const composerFooter =
    composer.status === 'success' ? (
      <>
        <button type="button" onClick={() => composerActions.reset()} style={FOOTER_CANCEL_STYLE}>
          Send Another
        </button>
        <button type="button" onClick={composerActions.close} style={FOOTER_PRIMARY_STYLE}>
          Done
        </button>
      </>
    ) : (
      <>
        <button type="button" onClick={handleComposerClose} style={FOOTER_CANCEL_STYLE}>
          Cancel
        </button>
        <button
          type="button"
          onClick={composerActions.submit}
          disabled={composer.status === 'submitting'}
          style={submittingStyle}
        >
          {composer.status === 'submitting' ? 'Sending…' : 'Send Kudos'}
        </button>
      </>
    );

  return (
    <>
      <HbcPeopleCultureSurface
        model={surfaceModel}
        onGiveKudos={composerActions.open}
        viewAllHref="#view-all-kudos"
        celebrateHref="#celebrate"
      />

      <HbcKudosComposerFlyout
        open={composer.isOpen}
        onClose={handleComposerClose}
        title="Give Kudos"
        footer={composerFooter}
      >
        {composer.status === 'success' ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px 16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 16,
              fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #e57e46, #d4693a)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={28} style={{ color: '#ffffff' }} />
            </div>
            <div
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: '#1a1a1a',
              }}
            >
              Kudos sent!
            </div>
            <p
              style={{
                margin: 0,
                fontSize: '0.8125rem',
                color: 'rgba(26, 26, 26, 0.48)',
                maxWidth: '32ch',
                lineHeight: 1.6,
              }}
            >
              Your recognition has been submitted for review. It will appear on the
              homepage once approved.
            </p>
          </div>
        ) : null}

        {composer.status === 'error' ? (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 10,
              marginBottom: 16,
              background: 'rgba(196, 49, 75, 0.06)',
              border: '1px solid rgba(196, 49, 75, 0.15)',
              fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
            }}
          >
            <div
              style={{
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: '#c4314b',
                marginBottom: 4,
              }}
            >
              Submission failed
            </div>
            <div
              style={{
                fontSize: '0.75rem',
                color: 'rgba(196, 49, 75, 0.8)',
                lineHeight: 1.5,
              }}
            >
              {composer.submitError || 'An unexpected error occurred. Please try again.'}
            </div>
          </div>
        ) : null}

        {composer.status === 'editing' ||
        composer.status === 'error' ||
        composer.status === 'submitting' ? (
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
