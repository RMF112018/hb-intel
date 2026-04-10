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
  isArchiveEligible,
  isPubliclyVisible,
  type KudosEntry,
} from '../../homepage/webparts/kudosContracts.js';
import { KudosDetailPanelContent } from '../../homepage/shared/KudosDetailPanelContent.js';
import { fetchKudosAuditTimeline, type KudosAuditTimelineEntry } from '../../homepage/data/kudosGovernanceWriter.js';
import { getSiteUrl } from '../../homepage/data/spContext.js';

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
    <section aria-label="HB Kudos archive" data-hbc-webpart-section="hb-kudos-archive">
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
            color: 'rgba(26, 19, 16, 0.62)',
          }}
        >
          Recognition archive
        </h3>
        <label
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '0.75rem' }}
        >
          <span style={{ color: 'rgba(26, 19, 16, 0.55)', fontWeight: 600 }}>Search</span>
          <input
            type="search"
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search recognition…"
            style={{
              padding: '6px 10px',
              fontSize: '0.8125rem',
              borderRadius: 8,
              border: '1px solid rgba(229, 126, 70, 0.28)',
              outline: 'none',
              minWidth: 220,
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
        <div style={{ display: 'grid', gap: 12 }}>
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
                    padding: '16px 18px',
                    cursor: 'pointer',
                    color: 'inherit',
                    font: 'inherit',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      marginBottom: 8,
                    }}
                  >
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
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        color: 'rgba(26, 19, 16, 0.45)',
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
                      margin: '0 0 6px',
                      fontSize: '1rem',
                      fontWeight: 800,
                      letterSpacing: '-0.015em',
                      color: '#1a1310',
                    }}
                  >
                    {entry.headline}
                  </h4>
                  <p
                    style={{
                      margin: '0 0 10px',
                      fontSize: '0.8125rem',
                      lineHeight: 1.55,
                      color: 'rgba(26, 19, 16, 0.68)',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {entry.excerpt}
                  </p>
                  {entry.recipients.length > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <HbcAvatarStack
                        people={entry.recipients.slice(0, 4).map((r) => ({
                          id: r.id,
                          name: r.name,
                          src: r.media?.src,
                        }))}
                        size="sm"
                        max={4}
                      />
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: 'rgba(26, 19, 16, 0.58)',
                          fontWeight: 600,
                        }}
                      >
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
}

function DetailPanel({ entry, onClose, onCelebrate }: DetailPanelProps): React.JSX.Element {
  const isPublic = entry ? isPubliclyVisible(entry) : false;

  // Fetch audit timeline when the panel opens. Employee role = viewer.
  const [timeline, setTimeline] = React.useState<KudosAuditTimelineEntry[]>([]);
  const [timelineLoading, setTimelineLoading] = React.useState(false);
  React.useEffect(() => {
    if (!entry) { setTimeline([]); return; }
    const siteUrl = getSiteUrl();
    if (!siteUrl) return;
    let cancelled = false;
    setTimelineLoading(true);
    fetchKudosAuditTimeline(siteUrl, entry.id).then((events) => {
      if (!cancelled) { setTimeline(events); setTimelineLoading(false); }
    }).catch(() => { if (!cancelled) setTimelineLoading(false); });
    return () => { cancelled = true; };
  }, [entry?.id]);

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
        <KudosDetailPanelContent
          entry={entry}
          role="viewer"
          timeline={timeline}
          timelineLoading={timelineLoading}
        />
      ) : null}
    </HbcKudosComposerFlyout>
  );
}

// ---------------------------------------------------------------------------
// Main webpart
// ---------------------------------------------------------------------------

export function HbKudos({ config, identity }: HbKudosProps): React.JSX.Element {
  const heading =
    (typeof config?.heading === 'string' && config.heading) || 'HB Kudos';
  const showArchive = config?.showArchive !== false;

  const { listConfig, isLoading } = usePeopleCultureData();

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
          return isPubliclyVisible(entry);
        }
        return entry.status === 'approved';
      }),
    [allKudos],
  );

  const archiveKudos = React.useMemo(
    () =>
      sortByRecency(
        allKudos.filter((entry) => {
          if (entry.workflowStatus) return isArchiveEligible(entry);
          return entry.status === 'approved';
        }),
      ),
    [allKudos],
  );

  const [archiveSearch, setArchiveSearch] = React.useState('');

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
        celebrateHref="#hb-kudos-celebrate"
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

      <DetailPanel entry={detailEntry} onClose={() => setDetailEntry(undefined)} />
    </section>
  );
}
