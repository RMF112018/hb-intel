/**
 * HbKudos — Employee-facing HB Kudos recognition webpart.
 *
 * Phase-14 kudos/ Prompt-02 — HB Kudos Employee Experience.
 *
 * This replaces the Phase-14 Prompt-01 structural scaffold with a real
 * runtime that delivers the signature HB Kudos experience:
 *
 *   - featured spotlight + recent recognition rail via
 *     `HbcPeopleCultureSurface` (kudos-only configuration — no
 *     announcements or celebrations; those live on the sibling
 *     People & Culture public webpart),
 *   - typed-recipient submission flow via the extended
 *     `HbcKudosComposer*` shared primitives (Prompt-02 extension),
 *   - archive / browse experience for previously-approved kudos,
 *   - role-aware detail panel for the full recognition content,
 *     recipients, and submitter.
 *
 * The SharePoint data access, typed-recipient resolution, and runtime
 * wiring remain local to this webpart. All durable visual grammar is
 * delivered through `@hbc/ui-kit/homepage` — the homepage-entry-point
 * rule is strictly enforced (no imports from `@hbc/ui-kit` bare,
 * `/primitives`, `/app-shell`, or `/fluent`).
 *
 * Visibility rules (Phase-14 Prompt-02):
 *
 *   - Homepage spotlight + rail surfaces only items that satisfy the
 *     `isPubliclyVisible` predicate from `kudosContracts.ts`
 *     (`workflowStatus === 'approved' && homepageEnabled === true`).
 *   - Archive browse surfaces items that satisfy `isArchiveEligible`
 *     (`wasEverPublished === true && !isRemovedFromPublicView`). This
 *     lets viewers find previously-live recognition even after it has
 *     cycled off the homepage.
 *   - The detail panel is role-safe: no moderation notes, rejection
 *     reasons, or internal-only governance data is exposed to
 *     ordinary viewers. When an item is no longer publicly visible,
 *     the detail panel renders a reduced "associated-only" view.
 *
 * Governing sources:
 *   - `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/kudos/Plan-Summary.md`
 *   - `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/kudos/Decision-Lock-Appendix.md`
 *   - `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/kudos/Schema-Reference-Appendix.md`
 *   - `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/kudos/Prompt-00-Authority-and-Scope-Lock-Report.md`
 *   - `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/kudos/Prompt-02-HB-Kudos-Employee-Experience.md`
 */
import * as React from 'react';
import {
  HbcPeopleCultureSurface,
  HbcKudosComposerFlyout,
  HbcKudosComposerForm,
  HbcKudosComposerPreview,
  HbcKudosComposerSuccess,
  HbcKudosComposerError,
  HbcCard,
  HbcAvatarStack,
  HbcStatusBadge,
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
  buildWorkflowChipDescriptor,
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
import { getSiteUrl, resolveCurrentUserId } from '../../homepage/data/spContext.js';

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
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 16,
          padding: '18px 2px 12px',
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: '0.875rem',
            fontWeight: 800,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: KUDOS_GOV_TOKENS.textTertiary,
          }}
        >
          Recognition archive
        </h3>
        <label
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '0.75rem' }}
        >
          <span style={{ color: KUDOS_GOV_TOKENS.textMuted, fontWeight: 600 }}>Search</span>
          <input
            type="search"
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search recognition…"
            aria-label="Search recognition archive"
            style={{
              padding: '6px 10px',
              fontSize: '0.8125rem',
              borderRadius: 8,
              border: `1px solid ${KUDOS_GOV_TOKENS.orangeSubtle28}`,
              outline: 'none',
              minWidth: 200,
            }}
          />
        </label>
      </div>

      {filtered.length === 0 ? (
        <HbcEmptyState
          title="No archived recognition yet"
          description="Approved kudos that cycle off the homepage will appear here."
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 10 }}>
          {filtered.map((entry) => {
            const summary = buildKudosRecipientSummary(entry.recipients);
            const workflowChip = entry.workflowStatus
              ? buildWorkflowChipDescriptor(entry.workflowStatus)
              : undefined;
            return (
              <HbcCard key={entry.id} weight="standard">
                <button
                  type="button"
                  onClick={() => onOpenDetail(entry)}
                  aria-label={`Open recognition: ${entry.headline}`}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    background: 'transparent',
                    border: 'none',
                    padding: '12px 14px',
                    cursor: 'pointer',
                    color: 'inherit',
                    font: 'inherit',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    {workflowChip ? (
                      <HbcStatusBadge
                        variant={
                          workflowChip.tone === 'success'
                            ? 'success'
                            : workflowChip.tone === 'warning'
                              ? 'warning'
                              : workflowChip.tone === 'danger'
                                ? 'critical'
                                : 'info'
                        }
                        size="small"
                        label={workflowChip.label}
                      />
                    ) : null}
                    <span
                      style={{
                        fontSize: '0.625rem',
                        fontWeight: 700,
                        color: KUDOS_GOV_TOKENS.textCaption,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                      }}
                    >
                      {new Date(entry.submittedDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <h4
                    style={{
                      margin: '0 0 4px',
                      fontSize: '0.9375rem',
                      fontWeight: 800,
                      letterSpacing: '-0.015em',
                      color: KUDOS_GOV_TOKENS.textPrimary,
                    }}
                  >
                    {entry.headline}
                  </h4>
                  <p
                    style={{
                      margin: '0 0 8px',
                      fontSize: '0.8125rem',
                      lineHeight: 1.5,
                      color: KUDOS_GOV_TOKENS.textSecondary,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {entry.excerpt}
                  </p>
                  {entry.recipients.length > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <HbcAvatarStack
                        people={entry.recipients.slice(0, 4).map((r) => ({
                          id: r.id,
                          name: r.name,
                          src: r.media?.src,
                        }))}
                        size="sm"
                        max={4}
                      />
                      <span style={{ fontSize: '0.6875rem', color: KUDOS_GOV_TOKENS.textFaint, fontWeight: 600 }}>
                        {summary.label}
                      </span>
                    </div>
                  ) : null}
                </button>
              </HbcCard>
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

  const { listConfig, isLoading } = usePeopleCultureData();

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
          // Featured expiration: treat expired featured items as standard
          // for public rendering. They remain visible unless also aged off.
          // (hasFeaturedExpired affects display styling, not visibility here.)
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
      const siteUrl = getSiteUrl();
      if (!siteUrl) return;

      if (submitterDialog.action === 'withdraw') {
        setSubmitterDialog(null);
        void submitKudosGovernanceAction(
          siteUrl,
          { kind: 'withdraw', kudosId: detailEntry.id },
          { actorEmail: identity?.email },
        ).then((result) => { if (result.ok) setDetailEntry(undefined); });
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
        ).then((result) => { if (result.ok) setDetailEntry(undefined); });
      }
    },
    [detailEntry, submitterDialog, pendingResubmitHeadline, identity?.email],
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

  const surfaceModel = buildKudosSurfaceModel(heading, publicKudos);

  return (
    <section
      data-hbc-webpart="hb-kudos"
      data-hbc-webpart-phase="phase-14-kudos-prompt-02"
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
      />

      {showArchive ? (
        <ArchiveList
          entries={archiveKudos}
          searchText={archiveSearch}
          onSearchChange={setArchiveSearch}
          onOpenDetail={setDetailEntry}
        />
      ) : null}

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
        onCelebrate={detailEntry ? () => {
          const current = detailEntry.celebrateCount ?? 0;
          const siteUrl = getSiteUrl();
          if (!siteUrl) return;
          void submitKudosGovernanceAction(
            siteUrl,
            { kind: 'celebrate', kudosId: detailEntry.id, nextCount: current + 1 },
            { actorEmail: identity?.email },
          );
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
    </section>
  );
}
