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

/**
 * Map a KudosEntry to the ui-kit KudosSpotlightItem contract.
 * Only employee-facing fields are projected — no governance metadata,
 * no prominence internals, no audit history. When `excerpt` is empty,
 * falls back to `details` (truncated to ~200 chars) so the spotlight
 * card always carries body content.
 */
function adaptSpotlight(entry: KudosEntry): KudosSpotlightItem {
  const excerpt =
    entry.excerpt?.trim() ||
    (entry.details?.trim()
      ? entry.details.trim().slice(0, 200) +
        (entry.details.trim().length > 200 ? '\u2026' : '')
      : undefined);

  return {
    id: entry.id,
    headline: entry.headline || 'Recognition',
    excerpt,
    recipients: (entry.recipients ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      src: r.media?.src,
    })),
    submittedByName: entry.submittedBy?.displayName,
    celebrateCount: entry.celebrateCount,
  };
}

/**
 * Map KudosEntry[] to the ui-kit KudosRailItem[] contract.
 * Same boundary rules as adaptSpotlight — employee-facing fields only.
 */
function adaptRail(entries: KudosEntry[]): KudosRailItem[] {
  return entries.map((entry) => ({
    id: entry.id,
    headline: entry.headline || 'Recognition',
    recipients: (entry.recipients ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      src: r.media?.src,
    })),
    submittedByName: entry.submittedBy?.displayName,
    celebrateCount: entry.celebrateCount,
  }));
}

/**
 * Build the surface model with featured-quality selection. The first
 * entry that meets the content-quality threshold becomes featured;
 * remaining entries (including sparse ones) flow to the recent rail
 * where their simpler row layout tolerates minimal content. If no
 * entry meets the threshold, the surface gracefully falls back to
 * the SparseInvite state rather than rendering a hollow spotlight.
 */
function buildKudosSurfaceModel(
  heading: string,
  publicEntries: KudosEntry[],
): PeopleCultureSurfaceModel {
  const sorted = sortByRecency(publicEntries);

  // Find the best featured candidate — first entry that passes
  // the content-quality gate.
  const featuredIdx = sorted.findIndex(isFeaturedWorthy);
  const featured = featuredIdx >= 0 ? sorted[featuredIdx] : undefined;
  const rest = sorted.filter((_, i) => i !== featuredIdx).slice(0, 7);

  return {
    heading,
    kudos: {
      isEmpty: !featured,
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

  // Bridge governance tokens into CSS custom properties so the scoped
  // style block can reference governed values instead of magic strings.
  const archiveCssVars = {
    '--hbk-orange-02': KUDOS_GOV_TOKENS.orangeSubtle02,
    '--hbk-orange-06': KUDOS_GOV_TOKENS.orangeSubtle06,
    '--hbk-orange-18': KUDOS_GOV_TOKENS.orangeSubtle18,
    '--hbk-brand-blue': KUDOS_GOV_TOKENS.brandBlue,
    '--hbk-brand-orange': KUDOS_GOV_TOKENS.brandOrange,
  } as React.CSSProperties;

  return (
    <section
      id="hb-kudos-archive"
      aria-label="HB Kudos archive"
      data-hbc-webpart-section="hb-kudos-archive"
      style={archiveCssVars}
    >
      {/* Scoped styles for archive rows — hover/focus-visible via CSS
          instead of JS handlers so keyboard focus is properly visible.
          Color values use CSS custom properties bridged from KUDOS_GOV_TOKENS. */}
      {/* eslint-disable-next-line react/no-unknown-property */}
      <style>{`
        [data-hbc-webpart-section="hb-kudos-archive"] .hbk-archive-row {
          display: flex; align-items: center; gap: 12px; width: 100%;
          text-align: left; background: var(--hbk-orange-02);
          border: 1px solid var(--hbk-orange-06); border-radius: 10px;
          padding: 10px 12px; cursor: pointer; color: inherit; font: inherit;
          transition: background 160ms ease, border-color 160ms ease;
          outline: none;
        }
        [data-hbc-webpart-section="hb-kudos-archive"] .hbk-archive-row:hover {
          background: var(--hbk-orange-06);
          border-color: var(--hbk-orange-18);
        }
        [data-hbc-webpart-section="hb-kudos-archive"] .hbk-archive-row:focus-visible {
          outline: 2px solid var(--hbk-brand-blue);
          outline-offset: 2px;
          background: var(--hbk-orange-06);
          border-color: var(--hbk-orange-18);
        }
        [data-hbc-webpart-section="hb-kudos-archive"] .hbk-archive-search:focus-visible {
          outline: 2px solid var(--hbk-brand-blue);
          outline-offset: 1px;
          border-color: var(--hbk-brand-orange);
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
            color: KUDOS_GOV_TOKENS.warningOrange,
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
            border: `1px solid ${KUDOS_GOV_TOKENS.orangeSubtle22}`,
            background: KUDOS_GOV_TOKENS.orangeSubtle03,
            maxWidth: 180,
            outline: 'none',
            fontFamily: 'inherit',
            color: KUDOS_GOV_TOKENS.textPrimary,
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
                      color: KUDOS_GOV_TOKENS.textPrimary,
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
                      color: KUDOS_GOV_TOKENS.textFaint,
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
      subtitle={entry ? `Nominated by ${entry.submittedBy?.displayName ?? 'Unknown'}` : undefined}
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

  const allKudos: KudosEntry[] = listConfig?.kudos ?? [];

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
