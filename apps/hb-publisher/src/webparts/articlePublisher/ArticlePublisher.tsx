/**
 * Article Publisher — authoring surface for structured article publishing.
 *
 * Supports the Project Spotlight article workflow: HB Articles
 * master-record entries with `Destination='projectSpotlight'`,
 * page-bound to the ProjectSpotlight site. Additional destinations
 * (e.g. Company Pulse) are not wired in the current implementation;
 * the adapter and validation layers treat `projectSpotlight` as the
 * only supported destination until another one is explicitly added.
 *
 * Hosted on the HBCentral publisher page. Ownership is split between:
 *   - `useDraftWorkspace`   — queue / promotion-rules / selection identity
 *   - `useDraftLifecycle`   — draft state + save/transition/publish handlers
 *   - `usePreviewController`— preview composition state
 *   - `useReadinessController` — derived readiness / action gating
 *   - `useStatusChannel`    — status banner tone + messaging
 *   - authoring panels, QueueRail, and feature surfaces compose the render.
 */
import * as React from 'react';
import { HbcEmptyState, HbcSpinner } from '@hbc/ui-kit/homepage';
import { useUnsavedChangesBlocker } from '@hbc/ui-kit';
import { fetchRequestDigest, storeSiteUrl } from '@hbc/sharepoint-platform';
import {
  WORKFLOW_STATE_OPERATIONAL_VALUES,
  createPublisherRepositories,
  createDefaultPublishOrchestrator,
  createSharePointPageBindingWriter,
  createSharePointPageCreationService,
  type PromotionPolicyResult,
  type PublisherRepositories,
  type WorkflowState,
} from '../../data/publisherAdapter/index.js';
import { validTransitionsFrom } from '../../data/publisherAdapter/workflowStateMachine.js';
import {
  createProjectsLookupSearch,
  type ProjectLookupSearchFn,
} from '../../data/publisherAdapter/projectsLookupSource.js';
import { PUBLISHER_LIST_HOST_SITE_URL } from '../../data/publisherAdapter/publisherListDescriptors.js';
import { TeamPanel } from './teamComposer/index.js';
import { GalleryPanel } from './mediaComposer/index.js';
import { ArticlePreview } from './previewSurface/index.js';
import { PublishReadinessDiagnostics } from './readinessSurface/index.js';
import {
  DisclosureSection,
  EditorialChip,
  ExceptionalNotice,
  PublisherButton,
  StatusBanner,
  type AssetLibrarySearchFn,
} from './sharedChrome/index.js';
import {
  EditorialSpine,
  QueueRail,
  useDraftWorkspace,
  type SpineEntry,
  type SpineStatus,
} from './workspace/index.js';
import {
  DestinationBindingPanel,
  HeroPanel,
  MetadataPanel,
  SecondaryImagePanel,
  StoryPanel,
  TeamPresentationPanel,
} from './authoringPanels/index.js';
import {
  authoringHealthActionHint,
  authoringHealthHeadline,
  describePublishIntent,
  sectionAnchorForFindingField,
  useDraftLifecycle,
  useLocalDraftResilience,
  usePreviewController,
  useReadinessController,
  useSaveStateTrust,
  useStatusChannel,
  type LocalWorkingCopy,
  type SaveStatePhase,
  type SaveStateTrust,
} from './controllers/index.js';
import { publishDisabledReason } from './lifecycleMessaging.js';
import { useActiveSection } from './useActiveSection.js';
import { useSharePointPeopleSearch } from '../../data/useSharePointPeopleSearch.js';
import { useGraphPersonPhotoFn } from '../../data/useRecipientPhotoHydration.js';
import { transitionActionLabel } from './authorLabels.js';
import styles from './article-publisher.module.css';

// Re-exports for existing test-surface imports (`./ArticlePublisher`).
export {
  contentTypeOptionsForDraft,
  milestoneLegacyNotice,
  resolveTemplateKeySystemManaged,
  update,
} from './authoringPanels/index.js';
export {
  applyPromotionPolicyToDraft,
  unsupportedDestinationNotice,
} from './controllers/index.js';
export type { PromotionPolicyApplyResult } from './controllers/index.js';

/* ── Props ──────────────────────────────────────────────────── */

export interface ArticlePublisherProps {
  /** HBCentral absolute URL. Platform `storeSiteUrl` is invoked with this. */
  siteUrl?: string;
  /**
   * Current SPFx operator email, threaded in from `mount.tsx` via the
   * host's `identity.email`. Used as `ActorEmail` on every
   * workflow-history write so the audit trail reflects the acting user
   * rather than the article author.
   */
  actorEmail?: string;
  /** When set, overrides the default repository factory (tests only). */
  repositoriesOverride?: PublisherRepositories;
  /**
   * Graph token provider threaded from the SPFx mount boundary. Enables
   * Graph-backed directory photos in the teammate composer; when absent
   * the picker falls back to initials avatars.
   */
  getGraphToken?: () => Promise<string>;
  /**
   * Governed asset-library search function threaded from the SPFx
   * mount boundary. When supplied, hero + secondary image authoring
   * lead with a "Browse library" action and the modal AssetLibraryBrowser;
   * raw URL entry is demoted behind an Advanced disclosure. When
   * omitted, authoring falls back to URL-first entry so unwired hosts
   * still function.
   */
  searchAssets?: AssetLibrarySearchFn;
}

/* ── Pure public helpers (shell-owned, operational) ────────── */

export function promotionLockStatusText(policy: PromotionPolicyResult): string {
  return (
    `Promotion rule lock: IsFeatured=${String(policy.featured)} and ` +
    `IsPinned=${String(policy.pinned)} are enforced by the ` +
    `${policy.matchedScope} scope rule ${policy.sourceRuleId ?? '(unknown)'}. ` +
    'No direct IsFeatured/IsPinned toggle controls are exposed in this sprint UI; ' +
    'locked policy is enforced through policy re-application and save-time normalization.'
  );
}

export function workflowFilterOptions(): readonly WorkflowState[] {
  return WORKFLOW_STATE_OPERATIONAL_VALUES;
}

export function scheduledLegacyStateNotice(
  workflowState: WorkflowState,
): string | undefined {
  if (workflowState !== 'scheduled') {
    return undefined;
  }
  return (
    'Legacy state notice: `scheduled` is read-compatible only (no executor). Move to ' +
    '`approved` or `withdrawn`.'
  );
}

/* ── Canvas section model ──────────────────────────────────── */

type WorkspaceSectionId =
  | 'identity'
  | 'hero'
  | 'story'
  | 'media'
  | 'team'
  | 'promotion'
  | 'destination'
  | 'preview';

interface WorkspaceSectionDefinition {
  readonly id: WorkspaceSectionId;
  readonly label: string;
  readonly intent: string;
}

const WORKSPACE_SECTIONS: readonly WorkspaceSectionDefinition[] = [
  { id: 'identity', label: 'Identity', intent: 'Name the article and bind it to a project.' },
  { id: 'hero', label: 'Hero', intent: 'Set the hero visual and editorial framing.' },
  { id: 'story', label: 'Story', intent: 'Compose the body of the article.' },
  { id: 'media', label: 'Media', intent: 'Add supporting media beyond the hero.' },
  { id: 'team', label: 'Team', intent: 'Spotlight the people behind the work.' },
  { id: 'promotion', label: 'Promotion', intent: 'Review how promotion policy applies.' },
  { id: 'destination', label: 'Destination binding', intent: 'Confirm template and destination page binding.' },
  { id: 'preview', label: 'Preview', intent: 'See how the article will publish.' },
];

/* ── Component ──────────────────────────────────────────────── */

export function ArticlePublisher({
  siteUrl,
  actorEmail,
  repositoriesOverride,
  getGraphToken,
  searchAssets,
}: ArticlePublisherProps) {
  const searchPeople = useSharePointPeopleSearch();
  const fetchPersonPhoto = useGraphPersonPhotoFn(getGraphToken);

  React.useEffect(() => {
    if (siteUrl) storeSiteUrl(siteUrl);
  }, [siteUrl]);

  const repositories = React.useMemo<PublisherRepositories>(
    () => repositoriesOverride ?? createPublisherRepositories(),
    [repositoriesOverride],
  );

  // Projects lookup is authoritatively owned by HBCentral (control-plane),
  // independent of the mounted page host. Binding to the canonical constant
  // here keeps hosted pages (e.g. Marketing-New) pointed at the correct
  // Projects list instead of querying the current page site.
  const searchProjects = React.useMemo<ProjectLookupSearchFn>(
    () => createProjectsLookupSearch({ hostSiteUrl: PUBLISHER_LIST_HOST_SITE_URL }),
    [],
  );

  const orchestrator = React.useMemo(
    () =>
      createDefaultPublishOrchestrator({
        repositories,
        pageBindingWriter: createSharePointPageBindingWriter(),
        pageCreation: createSharePointPageCreationService({
          fetchRequestDigest,
        }),
      }),
    [repositories],
  );

  const workspace = useDraftWorkspace(repositories);
  const { setStatus, status, statusTone } = useStatusChannel();

  const lifecycle = useDraftLifecycle({
    repositories,
    orchestrator,
    actorEmail,
    promotionRules: workspace.promotionRules,
    groups: workspace.groups,
    reloadGroups: workspace.reloadGroups,
    selectedArticleId: workspace.selectedArticleId,
    setSelectedArticleId: workspace.setSelectedArticleId,
    setStatus,
  });
  const {
    articleDraft,
    setArticleDraft,
    teamDraft,
    setTeamDraft,
    mediaDraft,
    setMediaDraft,
    binding,
    resolutionContext,
    promotionPolicy,
    busy,
    isPersisted,
    handleCreateNew,
    handleSave,
    handleTransition,
    handlePublishAction,
  } = lifecycle;

  /* ── Dirty-state detection ─────────────────────────────────────
   * Baseline snapshots the last known-clean in-memory state:
   *   - captured when a draft first loads (articleId + first truthy
   *     articleDraft pair)
   *   - reset after every successful durable save/publish
   * `isDirty` is a shallow JSON compare against the baseline. This
   * is the single source of truth for tab-close protection and the
   * save-state trust chip. */
  const baselineRef = React.useRef<string | null>(null);
  const currentSignature = React.useMemo(
    () => JSON.stringify({ articleDraft, teamDraft, mediaDraft }),
    [articleDraft, teamDraft, mediaDraft],
  );
  React.useEffect(() => {
    // Reset baseline whenever the selected draft changes so switching
    // between queue items does not falsely report the new row dirty.
    baselineRef.current = articleDraft ? currentSignature : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: reset only on identity change
  }, [workspace.selectedArticleId, articleDraft?.ArticleId]);
  const isDirty =
    !!articleDraft &&
    baselineRef.current !== null &&
    currentSignature !== baselineRef.current;
  const markBaselineClean = React.useCallback(() => {
    baselineRef.current = currentSignature;
  }, [currentSignature]);

  /* ── Local draft resilience ────────────────────────────────────
   * Layer 1 of a deliberate two-layer truth model: a debounced
   * IndexedDB cache of the in-memory working copy, keyed on the
   * selected articleId. Never substitutes for the durable save
   * orchestrator — only protects against tab-close / reload during
   * active composition. Cleared on every successful durable save
   * and on every successful publish so stale caches are not later
   * offered as recovery candidates. */
  const resilience = useLocalDraftResilience(workspace.selectedArticleId);
  const [recoveryDismissed, setRecoveryDismissed] = React.useState(false);
  const draftServerUpdatedAt = articleDraft?.UpdatedDateUtc;
  const resilienceSnapshot = React.useMemo<LocalWorkingCopy | null>(
    () =>
      articleDraft
        ? {
            cachedAtIso: new Date().toISOString(),
            articleDraft,
            teamDraft,
            mediaDraft,
          }
        : null,
    [articleDraft, teamDraft, mediaDraft],
  );
  React.useEffect(() => {
    if (!resilienceSnapshot || !workspace.selectedArticleId) return;
    resilience.queueCache(resilienceSnapshot);
  }, [resilienceSnapshot, resilience, workspace.selectedArticleId]);
  React.useEffect(() => {
    setRecoveryDismissed(false);
  }, [workspace.selectedArticleId]);

  const hasNewerLocalCopy = React.useMemo(() => {
    if (!resilience.workingCopy || !articleDraft) return false;
    if (recoveryDismissed) return false;
    if (resilience.workingCopy.articleDraft.ArticleId !== articleDraft.ArticleId) {
      return false;
    }
    if (!draftServerUpdatedAt) return true;
    return resilience.workingCopy.cachedAtIso > draftServerUpdatedAt;
  }, [resilience.workingCopy, articleDraft, draftServerUpdatedAt, recoveryDismissed]);

  const acceptRecovery = React.useCallback(() => {
    const cached = resilience.workingCopy;
    if (!cached) return;
    setArticleDraft(cached.articleDraft);
    setTeamDraft(cached.teamDraft);
    setMediaDraft(cached.mediaDraft);
    setRecoveryDismissed(true);
    setStatus(
      'Working copy restored from local cache. Save to commit.',
      'info',
    );
  }, [resilience.workingCopy, setArticleDraft, setTeamDraft, setMediaDraft, setStatus]);

  const discardRecovery = React.useCallback(() => {
    resilience.clear();
    setRecoveryDismissed(true);
  }, [resilience]);

  const handleSaveWithCacheClear = React.useCallback(async () => {
    await handleSave();
    resilience.clear();
    markBaselineClean();
  }, [handleSave, resilience, markBaselineClean]);

  const handlePublishWithCacheClear = React.useCallback<typeof handlePublishAction>(
    async (kind) => {
      await handlePublishAction(kind);
      if (kind !== 'preview') {
        resilience.clear();
        markBaselineClean();
      }
    },
    [handlePublishAction, resilience, markBaselineClean],
  );

  // Browser tab close / refresh protection when the in-memory draft
  // diverges from the last committed baseline. The hook attaches a
  // beforeunload listener only while `isDirty` is true. In-app router
  // blocking is NOT wired: SPFx hosts own routing and the Publisher
  // does not own a router surface to integrate with.
  useUnsavedChangesBlocker({ isDirty });

  const trust = useSaveStateTrust({
    hasDraft: !!articleDraft,
    isDirty,
    hasLocalCache: !!resilience.workingCopy,
    isCachePending: resilience.isCachePending,
    busy,
    lastStatusTone: statusTone,
    lastCachedAtIso: resilience.lastCachedAtIso,
  });

  const previewController = usePreviewController({
    repositories,
    selectedArticleId: workspace.selectedArticleId,
    setStatus,
  });
  const { preview, previewLoading, loadPreview } = previewController;

  // "Save and refresh preview" — single-action bridge that closes
  // the saved-vs-working-copy ambiguity on the preview surface.
  // Persists the working copy through the standard save path, then
  // recomposes preview from the now-current saved draft through the
  // shared publish/preview contract (no forked composition rules).
  const handleSaveAndRefreshPreview = React.useCallback(async () => {
    await handleSaveWithCacheClear();
    if (workspace.selectedArticleId) {
      await loadPreview(workspace.selectedArticleId);
    }
  }, [handleSaveWithCacheClear, loadPreview, workspace.selectedArticleId]);

  const readiness = useReadinessController({
    articleDraft,
    binding,
    preview,
    promotionPolicy,
    busy,
    isPersisted,
    templateRegistry: workspace.templateRegistry,
    promotionRuleHealth: workspace.promotionRuleHealth,
  });
  const {
    readinessSummary,
    bindingSignal,
    promotionSummary,
    latestValidation,
    publishBlockedByValidation,
    publishIntent,
    unsupportedDestinationMessage,
    unsupportedDestinationLoaded,
    unsupportedContentTypeMessage,
    unsupportedContentTypeLoaded,
    workflowOutcomeChipLabel,
    publishEnabled,
    republishEnabled,
    saveEnabled,
    saveHealth,
    saveBlockedReason,
    authoringHealth,
    promotionRuleHealth,
    promotionRuleHealthHeadline,
  } = readiness;

  const validNextStates = articleDraft ? validTransitionsFrom(articleDraft.WorkflowState) : [];

  const spineEntries = React.useMemo<readonly SpineEntry[]>(
    () =>
      WORKSPACE_SECTIONS.map((s) => ({
        id: s.id,
        label: s.label,
        status: computeSpineStatus(s.id, {
          draft: articleDraft,
          teamCount: teamDraft.length,
          mediaCount: mediaDraft.length,
          bindingOk: !unsupportedContentTypeLoaded && !unsupportedDestinationLoaded,
          previewReady: !!preview && !previewLoading,
        }),
      })),
    [
      articleDraft,
      teamDraft.length,
      mediaDraft.length,
      unsupportedContentTypeLoaded,
      unsupportedDestinationLoaded,
      preview,
      previewLoading,
    ],
  );

  const sectionIds = React.useMemo(
    () => WORKSPACE_SECTIONS.map((s) => s.id),
    [],
  );
  const activeSectionId = useActiveSection(articleDraft ? sectionIds : []);

  return (
    <div className={styles.workspace} aria-label="Article Publisher workspace">
      {/* ── Left draft apron ─────────────────────────────────── */}
      <QueueRail
        groups={workspace.groups}
        groupsLoading={workspace.groupsLoading}
        groupsError={workspace.groupsError}
        hasAnyArticles={workspace.hasAnyArticles}
        selectedArticleId={workspace.selectedArticleId}
        onSelect={workspace.setSelectedArticleId}
        onReload={() => void workspace.reloadGroups()}
        onCreateNew={handleCreateNew}
        actorEmail={actorEmail}
        spineSlot={
          articleDraft ? (
            <EditorialSpine
              entries={spineEntries}
              activeId={activeSectionId}
            />
          ) : null
        }
      />

      {/* ── Center editorial canvas ─────────────────────────── */}
      <main className={styles.canvas} aria-label="Article authoring canvas">
        {authoringHealth.kind !== 'healthy' &&
          authoringHealth.kind !== 'loading' && (
            <ExceptionalNotice
              tone="danger"
              blocking
              headline={authoringHealthHeadline(authoringHealth)}
              hint={authoringHealthActionHint(authoringHealth)}
              detailsLabel="Environment details"
              details={
                authoringHealth.kind === 'registryReadFailure' ||
                authoringHealth.kind === 'draftNoTemplateMatch'
                  ? authoringHealth.message
                  : undefined
              }
            />
          )}
        {!articleDraft ? (
          <div className={styles.canvasEmpty}>
            <HbcEmptyState
              title="Start composing"
              description="Pick a draft from the apron on the left, or start a new Project Spotlight article."
            />
          </div>
        ) : (
          <>
            <header className={styles.canvasHeader}>
              <div className={styles.canvasHeaderMain}>
                <p className={styles.canvasKicker}>Project Spotlight</p>
                <h1 className={styles.canvasTitle}>
                  {articleDraft.Title?.trim() || 'Untitled draft'}
                </h1>
              </div>
              {workflowOutcomeChipLabel && (
                <span className={styles.outcomeChip}>{workflowOutcomeChipLabel}</span>
              )}
            </header>

            {scheduledLegacyStateNotice(articleDraft.WorkflowState) && (
              <ExceptionalNotice
                tone="warn"
                headline="Legacy scheduled state"
                hint="Move this article to approved or withdrawn when you're ready."
                detailsLabel="Legacy-state details"
                details={scheduledLegacyStateNotice(articleDraft.WorkflowState)}
              />
            )}
            {unsupportedContentTypeMessage && (
              <ExceptionalNotice
                tone="danger"
                blocking
                headline="Unsupported content type"
                hint="Editing and publish actions are disabled on this article."
                detailsLabel="Support details"
                details={unsupportedContentTypeMessage}
              />
            )}
            {unsupportedDestinationMessage && (
              <ExceptionalNotice
                tone="danger"
                blocking
                headline="Unsupported destination"
                hint="Editing and publish actions are disabled on this article."
                detailsLabel="Support details"
                details={unsupportedDestinationMessage}
              />
            )}

            <CanvasLane
              id="compose"
              label="Compose"
              hint="Project, headline, hero, story — the fields every draft needs first."
              collapsible={false}
            >
              <EditorialSection id="identity" index={1} label="Identity">
                <MetadataPanel
                  draft={articleDraft}
                  onChange={setArticleDraft}
                  searchProjects={searchProjects}
                  promotionPolicy={promotionPolicy}
                />
              </EditorialSection>

              <EditorialSection id="hero" index={2} label="Hero">
                <HeroPanel
                  draft={articleDraft}
                  onChange={setArticleDraft}
                  searchAssets={searchAssets}
                />
              </EditorialSection>

              <EditorialSection id="story" index={3} label="Story">
                <StoryPanel draft={articleDraft} onChange={setArticleDraft} />
              </EditorialSection>
            </CanvasLane>

            <CanvasLane
              id="depth"
              label="Editorial depth"
              hint="Optional media and team spotlighting. Reveal when ready."
              sectionIds={['media', 'team']}
            >
              <EditorialSection id="media" index={4} label="Media">
                <SecondaryImagePanel
                  draft={articleDraft}
                  onChange={setArticleDraft}
                  searchAssets={searchAssets}
                />
                <GalleryPanel
                  articleId={articleDraft.ArticleId}
                  rows={mediaDraft}
                  onChange={setMediaDraft}
                  searchAssets={searchAssets}
                />
              </EditorialSection>

              <EditorialSection id="team" index={5} label="Team">
                <TeamPresentationPanel draft={articleDraft} onChange={setArticleDraft} />
                <TeamPanel
                  articleId={articleDraft.ArticleId}
                  rows={teamDraft}
                  onChange={setTeamDraft}
                  searchPeople={searchPeople}
                  fetchPersonPhoto={fetchPersonPhoto}
                />
              </EditorialSection>
            </CanvasLane>

            <CanvasLane
              id="governance"
              label="Governance & preview"
              hint="Promotion, destination binding, and preview. Readiness jump links will open these automatically."
              sectionIds={['promotion', 'destination', 'preview']}
            >
              <EditorialSection id="promotion" index={6} label="Promotion">
                {promotionRuleHealth &&
                  promotionRuleHealth.kind !== 'ready' &&
                  promotionRuleHealthHeadline && (
                    <ExceptionalNotice
                      tone={
                        promotionRuleHealth.kind === 'loadFailure'
                          ? 'danger'
                          : 'warn'
                      }
                      headline={
                        promotionRuleHealth.kind === 'loadFailure'
                          ? 'Promotion rules unavailable'
                          : 'Promotion rule guidance'
                      }
                      details={promotionRuleHealthHeadline}
                      detailsLabel="Rule details"
                    />
                  )}
                {promotionSummary.length > 0 && (
                  <>
                    <p className={styles.sectionCopy}>
                      Promotion is governed by the destination's rule set. Save
                      to re-apply; lock semantics are enforced automatically.
                    </p>
                    <DisclosureSection
                      label="Promotion policy details"
                      summaryHint="Rule identifiers, scope, and lock semantics used at save time."
                      testId="promotion-operator-details"
                    >
                      {promotionSummary.map((line, i) => (
                        <p key={i} className={styles.sectionCopy}>
                          {line}
                        </p>
                      ))}
                    </DisclosureSection>
                  </>
                )}
              </EditorialSection>

              <EditorialSection
                id="destination"
                index={7}
                label="Destination binding"
                governance
              >
                <DestinationBindingPanel binding={binding} context={resolutionContext} />
              </EditorialSection>

              <EditorialSection id="preview" index={8} label="Preview" governance>
                <ArticlePreview
                  outcome={preview}
                  loading={previewLoading}
                  isDirty={isDirty}
                  onSaveAndRefresh={handleSaveAndRefreshPreview}
                  saveAndRefreshDisabled={!saveEnabled}
                />
              </EditorialSection>
            </CanvasLane>
          </>
        )}
      </main>

      {/* ── Right readiness rail ─────────────────────────────── */}
      <aside className={styles.readinessRail} aria-label="Publish readiness and lifecycle actions">
        {!articleDraft ? (
          <div className={styles.readinessEmpty}>
            <p>Pick a draft to see readiness.</p>
          </div>
        ) : (
          <>
            <NextActionCue
              next={deriveNextAction({
                busy,
                saveHealth,
                isDirty,
                publishBlockedByValidation,
                publishEnabled,
                latestValidation,
                trust,
              })}
              onSave={handleSaveWithCacheClear}
              onSaveAndRefreshPreview={handleSaveAndRefreshPreview}
              onPublish={() => handlePublishWithCacheClear('create')}
            />
            <section className={styles.readinessBlock} aria-label="Readiness summary">
              <p className={styles.readinessHeading}>Readiness</p>
              <p className={styles.readinessSummary}>{readinessSummary}</p>
              {bindingSignal && (
                <p className={styles.readinessBindingSignal}>{bindingSignal}</p>
              )}
              <PublishIntentCue intent={publishIntent} />
              <SaveStateChip trust={trust} />
            </section>

            {hasNewerLocalCopy && (
              <ExceptionalNotice
                tone="info"
                headline="Unsaved working copy found"
                hint="A more recent working copy is cached locally for this draft. Nothing has been saved yet."
                detailsLabel="Cache details"
                details={`Cache key: ${resilience.draftKey}`}
              />
            )}
            {hasNewerLocalCopy && (
              <section className={styles.readinessBlock} aria-label="Recovery actions">
                <p className={styles.readinessHeading}>Recovery</p>
                <div className={styles.readinessActionGroup}>
                  <PublisherButton variant="primary" size="sm" onClick={acceptRecovery}>
                    Restore working copy
                  </PublisherButton>
                  <PublisherButton variant="danger" size="sm" onClick={discardRecovery}>
                    Discard cached copy
                  </PublisherButton>
                </div>
              </section>
            )}

            {saveHealth.kind === 'missingFirstPersistenceFields' && (
              <section
                id="save-readiness-block"
                className={styles.readinessBlock}
                aria-label="Save readiness"
                aria-live="polite"
              >
                <p className={styles.readinessHeading}>
                  Finish these before saving
                </p>
                <ul className={styles.readinessList}>
                  {saveHealth.missing.map((m) => (
                    <li key={m.field} className={styles.readinessIssueError}>
                      <strong>{m.label}:</strong> {m.message}{' '}
                      <span>{m.actionHint}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {publishBlockedByValidation && latestValidation && (
              <section className={styles.readinessBlock} aria-label="Blocking issues">
                <p className={styles.readinessHeading}>
                  {latestValidation.errors.length} blocking issue
                  {latestValidation.errors.length === 1 ? '' : 's'} — fix next
                </p>
                <ul className={styles.readinessList}>
                  {latestValidation.errors.map((err, idx) => (
                    <ValidationIssueItem
                      key={idx}
                      finding={err}
                      tone="error"
                    />
                  ))}
                </ul>
              </section>
            )}

            {latestValidation && latestValidation.warnings.length > 0 && (
              <section className={styles.readinessBlock} aria-label="Warnings">
                <p className={styles.readinessHeading}>
                  {latestValidation.warnings.length} warning
                  {latestValidation.warnings.length === 1 ? '' : 's'}
                </p>
                <ul className={styles.readinessList}>
                  {latestValidation.warnings.map((w, idx) => (
                    <ValidationIssueItem
                      key={idx}
                      finding={w}
                      tone="warn"
                    />
                  ))}
                </ul>
              </section>
            )}

            <PublishReadinessDiagnostics outcome={preview} binding={binding} />

            <section
              className={`${styles.readinessBlock} ${styles.readinessActions}`}
              aria-label="Primary actions"
            >
              <p className={styles.readinessHeading}>Ship</p>
              <div className={styles.readinessActionGroup}>
                <PublisherButton
                  variant="primary"
                  disabled={!publishEnabled}
                  title={publishDisabledReason({
                    hasDraft: !!articleDraft,
                    destinationSupported:
                      !unsupportedDestinationLoaded && !unsupportedContentTypeLoaded,
                    validationBlocked: publishBlockedByValidation,
                    busy,
                  })}
                  onClick={() => handlePublishWithCacheClear('create')}
                >
                  Publish
                </PublisherButton>
                <PublisherButton
                  disabled={!republishEnabled}
                  title={publishDisabledReason({
                    hasDraft: !!articleDraft,
                    destinationSupported:
                      !unsupportedDestinationLoaded && !unsupportedContentTypeLoaded,
                    validationBlocked: publishBlockedByValidation,
                    busy,
                  })}
                  onClick={() => handlePublishWithCacheClear('republish')}
                >
                  Republish
                </PublisherButton>
                <PublisherButton
                  disabled={!saveEnabled}
                  title={saveBlockedReason}
                  aria-describedby={
                    saveHealth.kind === 'missingFirstPersistenceFields'
                      ? 'save-readiness-block'
                      : undefined
                  }
                  onClick={handleSaveWithCacheClear}
                >
                  Save draft
                </PublisherButton>
              </div>
              <PublisherButton
                className={styles.readinessSecondaryAction}
                size="sm"
                disabled={!saveEnabled}
                title={saveBlockedReason}
                onClick={() =>
                  isDirty
                    ? void handleSaveAndRefreshPreview()
                    : void handlePublishAction('preview')
                }
              >
                {isDirty ? 'Save and refresh preview' : 'Refresh preview from saved draft'}
              </PublisherButton>
            </section>

            {validNextStates.length > 0 && (
              <section className={styles.readinessBlock} aria-label="Workflow transitions">
                <p className={styles.readinessHeading}>Move this article</p>
                <div className={styles.readinessActionGroup}>
                  {validNextStates
                    .filter((to) => to !== 'archived' && to !== 'withdrawn')
                    .map((to) => (
                      <PublisherButton
                        key={to}
                        disabled={busy || unsupportedDestinationLoaded}
                        onClick={() => handleTransition(to)}
                      >
                        {transitionActionLabel(to)}
                      </PublisherButton>
                    ))}
                </div>
              </section>
            )}

            {validNextStates.some((to) => to === 'archived' || to === 'withdrawn') && (
              <section className={styles.readinessBlockDanger} aria-label="Destructive actions">
                <p className={styles.readinessHeading}>Remove from circulation</p>
                <div className={styles.readinessActionGroup}>
                  {validNextStates
                    .filter((to) => to === 'withdrawn')
                    .map((to) => (
                      <PublisherButton
                        key={to}
                        variant="danger"
                        disabled={busy || unsupportedDestinationLoaded}
                        onClick={() => handleTransition(to)}
                      >
                        {transitionActionLabel(to)}
                      </PublisherButton>
                    ))}
                  {validNextStates
                    .filter((to) => to === 'archived')
                    .map((to) => (
                      <PublisherButton
                        key={to}
                        variant="danger"
                        disabled={busy || unsupportedDestinationLoaded}
                        onClick={() => handleTransition(to)}
                      >
                        {transitionActionLabel(to)}
                      </PublisherButton>
                    ))}
                </div>
              </section>
            )}

            {(status || busy) && (
              <StatusBanner
                tone={statusTone}
                busy={busy}
                aria-label="Last action status"
              >
                {busy && <HbcSpinner />}
                {status && <span>{status}</span>}
              </StatusBanner>
            )}
          </>
        )}
      </aside>
    </div>
  );
}

/* ── Canvas lane primitive ───────────────────────────────────────
 * Groups editorial sections into lanes that demote secondary work
 * behind a single user-controlled toggle while keeping every
 * `<section id="section-X">` element mounted in the DOM so anchor
 * navigation from the readiness rail (and `sectionAnchorForFindingField`
 * findings) still scrolls correctly. When a lane is collapsed, each
 * section's header row remains visible; only the section body hides.
 *
 * The lane auto-expands when the URL hash (or a click on an in-page
 * anchor) targets any section id it owns, so validation jump-to-fix
 * behavior is preserved even when the author has not yet revealed the
 * lane manually.
 */
function CanvasLane({
  id,
  label,
  hint,
  sectionIds,
  collapsible = true,
  children,
}: {
  id: string;
  label: string;
  hint: string;
  sectionIds?: readonly string[];
  collapsible?: boolean;
  children: React.ReactNode;
}): React.JSX.Element {
  const ownedIds = React.useMemo(
    () => new Set(sectionIds ?? []),
    [sectionIds],
  );
  const [open, setOpen] = React.useState(!collapsible);

  React.useEffect(() => {
    if (!collapsible) return undefined;
    const syncFromHash = () => {
      const hash = typeof window !== 'undefined' ? window.location.hash : '';
      const target = hash.startsWith('#section-') ? hash.slice('#section-'.length) : '';
      if (target && ownedIds.has(target)) setOpen(true);
    };
    syncFromHash();
    const onAnchorClick = (ev: MouseEvent) => {
      const el = ev.target instanceof Element ? ev.target.closest('a[href^="#section-"]') : null;
      if (!el) return;
      const href = el.getAttribute('href') ?? '';
      const target = href.slice('#section-'.length);
      if (ownedIds.has(target)) setOpen(true);
    };
    window.addEventListener('hashchange', syncFromHash);
    document.addEventListener('click', onAnchorClick, true);
    return () => {
      window.removeEventListener('hashchange', syncFromHash);
      document.removeEventListener('click', onAnchorClick, true);
    };
  }, [collapsible, ownedIds]);

  const headerId = `lane-${id}-header`;
  const bodyId = `lane-${id}-body`;
  const collapsed = collapsible && !open;
  const className = collapsed
    ? `${styles.canvasLane} ${styles.canvasLaneCollapsed}`
    : styles.canvasLane;

  return (
    <section className={className} aria-labelledby={headerId}>
      <header className={styles.canvasLaneHeader}>
        {collapsible ? (
          <button
            type="button"
            id={headerId}
            className={styles.canvasLaneToggle}
            aria-expanded={open}
            aria-controls={bodyId}
            onClick={() => setOpen((v) => !v)}
          >
            <span className={styles.canvasLaneChevron} aria-hidden="true">
              {open ? '▾' : '▸'}
            </span>
            <span className={styles.canvasLaneLabel}>{label}</span>
            <span className={styles.canvasLaneHint}>{hint}</span>
          </button>
        ) : (
          <div id={headerId} className={styles.canvasLaneStatic}>
            <span className={styles.canvasLaneLabel}>{label}</span>
            <span className={styles.canvasLaneHint}>{hint}</span>
          </div>
        )}
      </header>
      <div id={bodyId} className={styles.canvasLaneBody}>
        {children}
      </div>
    </section>
  );
}

/* ── Editorial section primitive ─────────────────────────────────
 * Numbered editorial marker + body. Demotes the old always-visible
 * per-section intent prose into a subordinate role (hidden at shell
 * level; still owned by each panel for inline guidance).
 */

function EditorialSection({
  id,
  index,
  label,
  governance = false,
  children,
}: {
  id: string;
  index: number;
  label: string;
  governance?: boolean;
  children: React.ReactNode;
}): React.JSX.Element {
  const className = governance
    ? `${styles.section} ${styles.sectionGovernance}`
    : styles.section;
  return (
    <section id={`section-${id}`} className={className} tabIndex={-1}>
      <header className={styles.sectionHeader}>
        <div className={styles.sectionHeaderRow}>
          <span className={styles.sectionNumeral}>
            {String(index).padStart(2, '0')}
          </span>
          <h2 className={styles.sectionTitle}>{label}</h2>
        </div>
      </header>
      <div className={styles.sectionBody}>{children}</div>
    </section>
  );
}

/* ── Spine status derivation ────────────────────────────────── */

const OPTIONAL_SECTIONS: ReadonlySet<WorkspaceSectionId> = new Set([
  'media',
  'team',
  'promotion',
]);

function computeSpineStatus(
  id: WorkspaceSectionId,
  ctx: {
    draft: ReturnType<typeof useDraftLifecycle>['articleDraft'];
    teamCount: number;
    mediaCount: number;
    bindingOk: boolean;
    previewReady: boolean;
  },
): SpineStatus {
  const { draft } = ctx;
  if (!draft) return 'empty';
  const isOptional = OPTIONAL_SECTIONS.has(id);
  switch (id) {
    case 'identity': {
      const titled = !!draft.Title?.trim();
      const projectBound = !!draft.ProjectId?.trim();
      if (titled && projectBound) return 'complete';
      if (titled || projectBound) return 'partial';
      return 'empty';
    }
    case 'hero': {
      const hasImage = !!draft.HeroPrimaryImage?.trim();
      const hasAlt = !!draft.HeroPrimaryImageAltText?.trim();
      if (hasImage && hasAlt) return 'complete';
      if (hasImage || hasAlt) return 'partial';
      return 'empty';
    }
    case 'story': {
      const hasSummary = !!draft.SummaryExcerpt?.trim();
      const hasBody = !!draft.BodyRichText?.trim();
      if (hasSummary && hasBody) return 'complete';
      if (hasSummary || hasBody) return 'partial';
      return 'empty';
    }
    case 'media': {
      if (ctx.mediaCount > 0 || draft.SecondaryImage?.trim()) return 'complete';
      return isOptional ? 'optional' : 'empty';
    }
    case 'team': {
      if (ctx.teamCount > 0) return 'complete';
      return isOptional ? 'optional' : 'empty';
    }
    case 'promotion': {
      return isOptional ? 'optional' : 'empty';
    }
    case 'destination': {
      return ctx.bindingOk ? 'complete' : 'partial';
    }
    case 'preview': {
      return ctx.previewReady ? 'complete' : 'partial';
    }
    default:
      return 'empty';
  }
}

/* ── Readiness helpers (local compositions) ───────────────────────
 * Kept inline because they compose shell-owned classes plus controller
 * outputs that already flow through `ArticlePublisher`. Moving them
 * into `sharedChrome/` would require passing the class map in, which
 * is more coupling than it saves. */

/* ── Next-action cue ─────────────────────────────────────────────
 * Coalesces the separate readiness signals (save health, blocking
 * issues, warnings, preview freshness, publish intent) into a single
 * explicit recommendation at the top of the rail. Subordinate
 * signals (the existing readiness summary, blocking list, warnings,
 * diagnostics) remain below so technical truth is preserved; this
 * cue just answers "what should I do next?" so the author does not
 * have to reconcile several mostly-good cues to decide.
 */
type NextActionKind =
  | 'working'
  | 'completeRequired'
  | 'fixBlocking'
  | 'saveAndRefreshPreview'
  | 'save'
  | 'publish'
  | 'reviewWarnings'
  | 'ready';

interface NextAction {
  readonly kind: NextActionKind;
  readonly tone: 'neutral' | 'info' | 'warn' | 'danger' | 'success';
  readonly headline: string;
  readonly detail?: string;
  readonly primaryLabel?: string;
  readonly primaryAnchor?: string;
}

function deriveNextAction(input: {
  busy: boolean;
  saveHealth: ReturnType<typeof useReadinessController>['saveHealth'];
  isDirty: boolean;
  publishBlockedByValidation: boolean;
  publishEnabled: boolean;
  latestValidation: ReturnType<typeof useReadinessController>['latestValidation'];
  trust: SaveStateTrust;
}): NextAction {
  const {
    busy,
    saveHealth,
    isDirty,
    publishBlockedByValidation,
    publishEnabled,
    latestValidation,
    trust,
  } = input;
  if (busy) {
    return {
      kind: 'working',
      tone: 'info',
      headline: 'Working…',
      detail: 'The last action is still running.',
    };
  }
  if (saveHealth.kind === 'missingFirstPersistenceFields') {
    return {
      kind: 'completeRequired',
      tone: 'warn',
      headline: `Complete ${saveHealth.missing.length} required field${
        saveHealth.missing.length === 1 ? '' : 's'
      } to save.`,
      detail: 'The first save writes to the HB Articles list — required columns must be filled.',
      primaryAnchor: 'save-readiness-block',
    };
  }
  if (publishBlockedByValidation && latestValidation) {
    const count = latestValidation.errors.length;
    const first = latestValidation.errors[0];
    const anchor = first ? sectionAnchorForFindingField(first.field) : undefined;
    return {
      kind: 'fixBlocking',
      tone: 'danger',
      headline: `Fix ${count} blocking issue${count === 1 ? '' : 's'} before publish.`,
      detail: first ? first.message : undefined,
      primaryLabel: anchor ? `Go to ${anchor.label}` : undefined,
      primaryAnchor: anchor?.sectionId,
    };
  }
  if (isDirty) {
    const failed = trust.phase === 'failed';
    return {
      kind: 'saveAndRefreshPreview',
      tone: failed ? 'danger' : 'warn',
      headline: failed
        ? 'Last save failed — save again to bring preview current.'
        : 'Save your edits to bring preview current.',
      detail: 'Preview always composes from the last saved draft, so saving brings preview forward in one step.',
      primaryLabel: 'Save and refresh preview',
    };
  }
  if (publishEnabled) {
    const warnCount = latestValidation?.warnings.length ?? 0;
    return {
      kind: 'publish',
      tone: 'success',
      headline: 'Ready to publish.',
      detail:
        warnCount > 0
          ? `${warnCount} warning${warnCount === 1 ? '' : 's'} will ride with publish — review below if needed.`
          : 'Publish will create the destination page and record history.',
      primaryLabel: 'Publish',
    };
  }
  if (latestValidation && latestValidation.warnings.length > 0) {
    return {
      kind: 'reviewWarnings',
      tone: 'warn',
      headline: `${latestValidation.warnings.length} warning${
        latestValidation.warnings.length === 1 ? '' : 's'
      } to review.`,
      detail: 'Warnings do not block publish, but review each before shipping.',
    };
  }
  return {
    kind: 'ready',
    tone: 'neutral',
    headline: 'No action needed right now.',
    detail: 'Preview is current and there are no blocking issues.',
  };
}

function NextActionCue({
  next,
  onSave,
  onSaveAndRefreshPreview,
  onPublish,
}: {
  next: NextAction;
  onSave: () => void | Promise<void>;
  onSaveAndRefreshPreview: () => void | Promise<void>;
  onPublish: () => void | Promise<void>;
}): React.JSX.Element {
  const toneClass = (() => {
    switch (next.tone) {
      case 'danger':
        return styles.nextActionToneDanger;
      case 'warn':
        return styles.nextActionToneWarn;
      case 'info':
        return styles.nextActionToneInfo;
      case 'success':
        return styles.nextActionToneSuccess;
      case 'neutral':
      default:
        return styles.nextActionToneNeutral;
    }
  })();
  const onPrimary = (() => {
    switch (next.kind) {
      case 'saveAndRefreshPreview':
        return () => void onSaveAndRefreshPreview();
      case 'publish':
        return () => void onPublish();
      case 'save':
        return () => void onSave();
      default:
        return undefined;
    }
  })();
  return (
    <section
      className={`${styles.nextActionBlock} ${toneClass}`}
      role="status"
      aria-live="polite"
      aria-label="Recommended next action"
    >
      <p className={styles.nextActionKicker}>Next action</p>
      <p className={styles.nextActionHeadline}>{next.headline}</p>
      {next.detail && <p className={styles.nextActionDetail}>{next.detail}</p>}
      {(onPrimary || next.primaryAnchor) && (
        <div className={styles.nextActionRow}>
          {onPrimary && next.primaryLabel && (
            <PublisherButton variant="primary" size="sm" onClick={onPrimary}>
              {next.primaryLabel}
            </PublisherButton>
          )}
          {!onPrimary && next.primaryAnchor && next.primaryLabel && (
            <a
              href={`#${next.primaryAnchor}`}
              className={styles.nextActionAnchor}
            >
              {next.primaryLabel} →
            </a>
          )}
        </div>
      )}
    </section>
  );
}

function PublishIntentCue({
  intent,
}: {
  intent: import('./controllers/index.js').PublishIntent;
}): React.JSX.Element | null {
  const described = describePublishIntent(intent);
  if (intent.kind === 'noDraft') return null;
  const variant =
    described.tone === 'danger'
      ? 'danger'
      : described.tone === 'warn'
        ? 'warn'
        : described.tone === 'success'
          ? 'success'
          : described.tone === 'info'
            ? 'info'
            : 'neutral';
  return (
    <div className={styles.publishIntentCue} role="status" aria-live="polite">
      <EditorialChip variant={variant} size="sm">
        {described.label}
      </EditorialChip>
      {described.detail && (
        <span className={styles.publishIntentDetail}>{described.detail}</span>
      )}
    </div>
  );
}

function SaveStateChip({ trust }: { trust: SaveStateTrust }): React.JSX.Element {
  const toneClass = phaseToneClass(trust.phase);
  return (
    <div
      className={`${styles.saveStateChip} ${toneClass}`}
      role="status"
      aria-live="polite"
      data-phase={trust.phase}
    >
      <span className={styles.saveStateDot} aria-hidden="true" />
      <span className={styles.saveStateHeadline}>{trust.headline}</span>
      {trust.detail && (
        <span className={styles.saveStateDetail}>{trust.detail}</span>
      )}
    </div>
  );
}

function phaseToneClass(phase: SaveStatePhase): string {
  switch (phase) {
    case 'saving':
      return styles.saveStateToneInfo;
    case 'saved':
      return styles.saveStateToneSuccess;
    case 'cached':
    case 'caching':
    case 'dirty':
      return styles.saveStateToneWarn;
    case 'failed':
      return styles.saveStateToneDanger;
    case 'clean':
    default:
      return styles.saveStateToneNeutral;
  }
}

function ValidationIssueItem({
  finding,
  tone,
}: {
  finding: {
    readonly message: string;
    readonly field?: string;
    readonly actionHint?: string;
  };
  tone: 'error' | 'warn';
}): React.JSX.Element {
  const anchor = sectionAnchorForFindingField(finding.field);
  const className =
    tone === 'error' ? styles.readinessIssueError : styles.readinessIssueWarn;
  return (
    <li className={className}>
      <span>{finding.message}</span>
      {finding.actionHint && (
        <>
          {' '}
          <span className={styles.readinessIssueHint}>
            {finding.actionHint}
          </span>
        </>
      )}
      {anchor && (
        <>
          {' '}
          <a
            href={`#${anchor.sectionId}`}
            className={styles.readinessIssueAnchor}
          >
            Go to {anchor.label} →
          </a>
        </>
      )}
    </li>
  );
}
