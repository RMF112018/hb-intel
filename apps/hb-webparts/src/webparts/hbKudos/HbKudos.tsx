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
 * Governing sources:
 *   - `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/kudos/Decision-Lock-Appendix.md`
 */
import * as React from 'react';
import {
  HbcPeopleCultureSurface,
  HbcKudosComposerFlyout,
  HbcKudosComposerForm,
  HbcKudosComposerPreview,
  HbcKudosComposerSuccess,
  HbcKudosComposerError,
  HbcAvatarStack,
  HbcEmptyState,
  HbcSpinner,
  type PeopleCultureSurfaceModel,
  type KudosSpotlightItem,
  type KudosRailItem,
} from '@hbc/ui-kit/homepage';
import { usePeopleCultureData } from '../../homepage/data/usePeopleCultureData.js';
import { useKudosComposer } from '../../homepage/data/useKudosComposer.js';
import { submitKudosDraft } from '../../homepage/data/peopleCultureSubmissionSource.js';
import type { HomepageIdentityInput } from '../../homepage/helpers/identity.js';
import {
  buildKudosRecipientSummary,
  hasAgedOff,
  isArchiveEligible,
  isAssociatedVisible,
  isPubliclyVisible,
  type KudosEntry,
} from '../../homepage/webparts/kudosContracts.js';
import { KudosDetailPanelContent } from '../../homepage/shared/KudosDetailPanelContent.js';
import {
  KUDOS_GOV_TOKENS,
  KudosActionButton,
  KudosGovernanceInputDialog,
} from '../../homepage/shared/KudosGovernancePrimitives.js';
import { submitKudosGovernanceAction } from '../../homepage/data/kudosGovernanceWriter.js';
import { getKudosListHostUrl, resolveCurrentUserId } from '../../homepage/data/spContext.js';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface HbKudosProps {
  config?: Record<string, unknown>;
  identity?: HomepageIdentityInput;
  assetBaseUrl?: string;
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

function adaptSpotlight(entry: KudosEntry): KudosSpotlightItem {
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

function adaptRail(entries: KudosEntry[]): KudosRailItem[] {
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

function buildKudosSurfaceModel(
  heading: string,
  publicEntries: KudosEntry[],
): PeopleCultureSurfaceModel {
  const sorted = sortByRecency(publicEntries);
  const featured = sorted[0];
  const rest = sorted.slice(1, 7);
  return {
    heading,
    kudos: {
      isEmpty: sorted.length === 0,
      featured: featured ? adaptSpotlight(featured) : undefined,
      recent: adaptRail(rest),
    },
    // HB Kudos is recognition-only — announcements/celebrations live on
    // the sibling PeopleCulturePublic webpart. Pass empty arrays so the
    // shared surface renders only the kudos lane.
    announcements: [],
    celebrations: [],
  };
}

// ---------------------------------------------------------------------------
// Archive list (local composition of shared primitives)
// ---------------------------------------------------------------------------

interface ArchiveListProps {
  entries: KudosEntry[];
  searchText: string;
  onSearchChange: (value: string) => void;
  onOpenDetail: (entry: KudosEntry) => void;
}

function ArchiveList({
  entries,
  searchText,
  onSearchChange,
  onOpenDetail,
}: ArchiveListProps): React.JSX.Element {
  const filtered = React.useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((entry) =>
      [entry.headline, entry.excerpt, ...entry.recipients.map((r) => r.name)]
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  }, [entries, searchText]);

  return (
    <section id="hb-kudos-archive" aria-label="HB Kudos archive" data-hbc-webpart-section="hb-kudos-archive">
      {/* Scoped styles for archive rows — hover/focus-visible via CSS
          instead of JS handlers so keyboard focus is properly visible. */}
      {/* eslint-disable-next-line react/no-unknown-property */}
      <style>{`
        [data-hbc-webpart-section="hb-kudos-archive"] .hbk-archive-row {
          display: flex; align-items: center; gap: 12px; width: 100%;
          text-align: left; background: rgba(229,126,70,0.02);
          border: 1px solid rgba(229,126,70,0.06); border-radius: 10px;
          padding: 10px 12px; cursor: pointer; color: inherit; font: inherit;
          transition: background 160ms ease, border-color 160ms ease;
          outline: none;
        }
        [data-hbc-webpart-section="hb-kudos-archive"] .hbk-archive-row:hover {
          background: rgba(229,126,70,0.06);
          border-color: rgba(229,126,70,0.18);
        }
        [data-hbc-webpart-section="hb-kudos-archive"] .hbk-archive-row:focus-visible {
          outline: 2px solid #225391;
          outline-offset: 2px;
          background: rgba(229,126,70,0.06);
          border-color: rgba(229,126,70,0.18);
        }
        [data-hbc-webpart-section="hb-kudos-archive"] .hbk-archive-search:focus-visible {
          outline: 2px solid #225391;
          outline-offset: 1px;
          border-color: #e57e46;
        }
        @media (prefers-reduced-motion: reduce) {
          [data-hbc-webpart-section="hb-kudos-archive"] .hbk-archive-row {
            transition: none !important;
          }
        }
      `}</style>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '16px 0 10px',
        }}
      >
        <span
          style={{
            fontSize: '0.625rem',
            fontWeight: 800,
            letterSpacing: '0.14em',
            textTransform: 'uppercase' as const,
            color: '#c26434',
            flexShrink: 0,
          }}
        >
          Archive
        </span>
        <input
          type="search"
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search…"
          aria-label="Search recognition archive"
          className="hbk-archive-search"
          style={{
            padding: '5px 10px',
            fontSize: '0.75rem',
            borderRadius: 8,
            border: '1px solid rgba(229, 126, 70, 0.22)',
            background: 'rgba(229, 126, 70, 0.03)',
            maxWidth: 180,
            outline: 'none',
            fontFamily: 'inherit',
            color: '#1a1310',
          }}
        />
      </div>

      {filtered.length === 0 ? (
        <HbcEmptyState
          title="No archived recognition yet"
          description="Approved kudos that cycle off the homepage will appear here."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filtered.map((entry) => {
            const summary = buildKudosRecipientSummary(entry.recipients);
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => onOpenDetail(entry)}
                aria-label={`Open recognition: ${entry.headline}`}
                className="hbk-archive-row"
              >
                {entry.recipients.length > 0 ? (
                  <HbcAvatarStack
                    people={entry.recipients.slice(0, 1).map((r) => ({
                      id: r.id,
                      name: r.name,
                      src: r.media?.src,
                    }))}
                    size="sm"
                  />
                ) : null}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      lineHeight: 1.3,
                      color: '#1a1310',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {entry.headline}
                  </div>
                  <div
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 500,
                      color: 'rgba(26, 19, 16, 0.50)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {summary.label}
                    {' · '}
                    {new Date(entry.submittedDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Detail panel (shared content via KudosDetailPanelContent)
// ---------------------------------------------------------------------------

interface DetailPanelProps {
  entry: KudosEntry | undefined;
  onClose: () => void;
  onCelebrate?: () => void;
  onWithdraw?: () => void;
  onResubmit?: () => void;
  identity?: HomepageIdentityInput;
}

function DetailPanel({ entry, onClose, onCelebrate, onWithdraw, onResubmit, identity }: DetailPanelProps): React.JSX.Element {
  const isPublic = entry ? isPubliclyVisible(entry) : false;

  // Check if the current user is the submitter of this entry.
  const isSubmitter = Boolean(
    identity?.email && entry?.submittedBy?.email &&
    identity.email.toLowerCase() === entry.submittedBy.email.toLowerCase(),
  );
  const canWithdraw = isSubmitter &&
    (entry?.workflowStatus === 'pending' || entry?.workflowStatus === 'revisionRequested');
  const canResubmit = isSubmitter && entry?.workflowStatus === 'revisionRequested';

  // No timeline fetch for the employee surface — viewers must not
  // receive internal workflow history per Decision Lock §103-107.
  // The detail panel renders a reduced submission-info block instead.

  return (
    <HbcKudosComposerFlyout
      open={Boolean(entry)}
      onClose={onClose}
      title={entry?.headline ?? 'Recognition detail'}
      subtitle={entry ? `Nominated by ${entry.submittedBy.displayName}` : undefined}
      primaryAction={
        isPublic && onCelebrate
          ? { label: 'Celebrate', onClick: onCelebrate }
          : { label: 'Close', onClick: onClose }
      }
      secondaryAction={isPublic && onCelebrate ? { label: 'Close', onClick: onClose } : undefined}
    >
      {entry ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <KudosDetailPanelContent
            entry={entry}
            role="viewer"
          />

          {(canWithdraw || canResubmit) ? (
            <div
              role="group"
              aria-label="Submitter actions"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
                paddingTop: 6,
                borderTop: `1px dashed ${KUDOS_GOV_TOKENS.orangeSubtle22}`,
              }}
            >
              {canResubmit && onResubmit ? (
                <KudosActionButton label="Resubmit for review" onClick={onResubmit} disabled={false} tone="info" />
              ) : null}
              {canWithdraw && onWithdraw ? (
                <KudosActionButton label="Withdraw" onClick={onWithdraw} disabled={false} tone="danger" />
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </HbcKudosComposerFlyout>
  );
}

// ---------------------------------------------------------------------------
// Main webpart
// ---------------------------------------------------------------------------

const DEFAULT_AGE_OFF_DAYS = 14;

export function HbKudos({ config, identity }: HbKudosProps): React.JSX.Element {
  const heading =
    (typeof config?.heading === 'string' && config.heading) || 'HB Kudos';
  const showArchive = config?.showArchive !== false;
  const ageOffDays =
    typeof config?.homepageAgeOffDays === 'number' && config.homepageAgeOffDays > 0
      ? config.homepageAgeOffDays
      : DEFAULT_AGE_OFF_DAYS;

  const { listConfig, isLoading, error: listError, refresh: refreshData } = usePeopleCultureData();

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

  const allKudos: KudosEntry[] = React.useMemo(() => {
    const fromList = listConfig?.kudos ?? [];
    return [...fromList];
  }, [listConfig?.kudos]);

  const publicKudos = React.useMemo(
    () =>
      allKudos.filter((entry) => {
        // HB Kudos lists some entries that pre-date the workflowStatus
        // field. Treat them as public only when the read path set the
        // derived `status === 'approved'`.
        if (entry.workflowStatus) {
          if (!isPubliclyVisible(entry)) return false;
          // Age-off: standard approved items expire after the configured
          // window. Pinned and featured items are exempt.
          if (hasAgedOff(entry, ageOffDays)) return false;
          // Featured items with expired dates remain visible unless aged
          // off. Lazy demotion is handled by the companion governance
          // surface, not the public view.
          return true;
        }
        return entry.status === 'approved';
      }),
    [allKudos, ageOffDays],
  );

  const archiveKudos = React.useMemo(
    () =>
      sortByRecency(
        allKudos.filter((entry) => {
          // Standard archive: approved, ever-published, not removed.
          if (entry.workflowStatus) {
            if (isArchiveEligible(entry)) return true;
            // Associated-item access: submitter/recipients can see items
            // that are no longer public but were once published.
            return isAssociatedVisible(entry, currentUserId);
          }
          return entry.status === 'approved';
        }),
      ),
    [allKudos, currentUserId],
  );

  const [archiveSearch, setArchiveSearch] = React.useState('');

  // Dialog state for submitter actions (replaces window.prompt/confirm).
  const [submitterDialog, setSubmitterDialog] = React.useState<{
    action: 'withdraw' | 'resubmitHeadline' | 'resubmitExcerpt';
    title: string;
    description?: string;
    placeholder?: string;
    defaultValue?: string;
    confirmLabel?: string;
    allowEmpty?: boolean;
  } | null>(null);
  const [pendingResubmitHeadline, setPendingResubmitHeadline] = React.useState<string | undefined>();

  const handleSubmitterDialogConfirm = React.useCallback(
    (value: string) => {
      if (!detailEntry || !submitterDialog) return;
      const siteUrl = getKudosListHostUrl();
      if (!siteUrl) return;

      if (submitterDialog.action === 'withdraw') {
        setSubmitterDialog(null);
        void submitKudosGovernanceAction(
          siteUrl,
          { kind: 'withdraw', kudosId: detailEntry.id },
          { actorEmail: identity?.email },
        ).then((result) => { if (result.ok) { setDetailEntry(undefined); refreshData(); } });
        return;
      }

      if (submitterDialog.action === 'resubmitHeadline') {
        setPendingResubmitHeadline(value);
        setSubmitterDialog({
          action: 'resubmitExcerpt',
          title: 'Edit excerpt',
          description: 'Update the recognition excerpt before resubmitting.',
          placeholder: 'Enter updated excerpt…',
          defaultValue: detailEntry.excerpt ?? '',
          confirmLabel: 'Resubmit',
        });
        return;
      }

      if (submitterDialog.action === 'resubmitExcerpt') {
        setSubmitterDialog(null);
        const hl = (pendingResubmitHeadline ?? '').trim();
        const updatedHeadline = hl && hl !== (detailEntry.headline ?? '') ? hl : undefined;
        const ex = value.trim();
        const updatedExcerpt = ex && ex !== (detailEntry.excerpt ?? '') ? ex : undefined;
        setPendingResubmitHeadline(undefined);
        void submitKudosGovernanceAction(
          siteUrl,
          { kind: 'resubmit', kudosId: detailEntry.id, updatedHeadline, updatedExcerpt },
          { actorEmail: identity?.email },
        ).then((result) => { if (result.ok) { setDetailEntry(undefined); refreshData(); } });
      }
    },
    [detailEntry, submitterDialog, pendingResubmitHeadline, identity?.email, refreshData],
  );

  if (isLoading) {
    return (
      <div
        data-hbc-webpart="hb-kudos"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}
      >
        <HbcSpinner size="md" />
      </div>
    );
  }

  if (listError && !listConfig) {
    return (
      <section data-hbc-webpart="hb-kudos" data-hbc-state="error">
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

  const surfaceModel = buildKudosSurfaceModel(heading, publicKudos);

  return (
    <section
      data-hbc-webpart="hb-kudos"
      data-hbc-webpart-phase="phase-14-kudos-phase-05"
      aria-label="HB Kudos recognition"
    >
      <HbcPeopleCultureSurface
        model={surfaceModel}
        onGiveKudos={composerActions.open}
        viewAllHref="#hb-kudos-archive"
        celebrateHref={undefined}
        heroEyebrow="HB Kudos"
        heroSubcaption="Signature recognition across the company"
        variant="people-culture-homepage"
        footer={showArchive ? (
          <ArchiveList
            entries={archiveKudos}
            searchText={archiveSearch}
            onSearchChange={setArchiveSearch}
            onOpenDetail={setDetailEntry}
          />
        ) : undefined}
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
            body={composer.submitError || 'An unexpected error occurred. Please try again.'}
          />
        ) : null}

        {isEditing ? (
          <>
            <HbcKudosComposerForm
              draft={composer.draft}
              onDraftChange={composerActions.updateDraft}
              errors={composer.validationErrors}
              disabled={composer.status === 'submitting'}
              recipientsMode="typed"
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

      <DetailPanel
        entry={detailEntry}
        onClose={() => setDetailEntry(undefined)}
        identity={identity}
        onCelebrate={detailEntry && !celebrating ? () => {
          setCelebrating(true);
          const current = detailEntry.celebrateCount ?? 0;
          const siteUrl = getKudosListHostUrl();
          if (!siteUrl) { setCelebrating(false); return; }
          void submitKudosGovernanceAction(
            siteUrl,
            { kind: 'celebrate', kudosId: detailEntry.id, nextCount: current + 1 },
            { actorEmail: identity?.email },
          ).then(() => refreshData()).finally(() => setCelebrating(false));
        } : undefined}
        onWithdraw={detailEntry ? () => {
          setSubmitterDialog({
            action: 'withdraw',
            title: 'Withdraw recognition',
            description: 'This action is final and cannot be undone. The recognition will be permanently withdrawn from review.',
            confirmLabel: 'Withdraw',
            allowEmpty: true,
          });
        } : undefined}
        onResubmit={detailEntry ? () => {
          setSubmitterDialog({
            action: 'resubmitHeadline',
            title: 'Edit headline',
            description: 'Update the recognition headline before resubmitting for review.',
            placeholder: 'Enter updated headline…',
            defaultValue: detailEntry.headline ?? '',
            confirmLabel: 'Next: excerpt',
          });
        } : undefined}
      />

      <KudosGovernanceInputDialog
        open={submitterDialog !== null}
        onClose={() => { setSubmitterDialog(null); setPendingResubmitHeadline(undefined); }}
        onConfirm={handleSubmitterDialogConfirm}
        title={submitterDialog?.title ?? ''}
        description={submitterDialog?.description}
        placeholder={submitterDialog?.placeholder}
        defaultValue={submitterDialog?.defaultValue}
        confirmLabel={submitterDialog?.confirmLabel}
        allowEmpty={submitterDialog?.allowEmpty}
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
    </section>
  );
}
