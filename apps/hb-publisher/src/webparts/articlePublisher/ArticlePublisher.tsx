/**
 * Article Publisher — authoring surface for structured article publishing.
 *
 * The current sprint supports the Project Spotlight article workflow
 * (HB Articles master-record with Destination='projectSpotlight',
 * page-bound to the ProjectSpotlight site). Future sprints may extend
 * this app to additional article destinations such as Company Pulse;
 * no other destinations are wired today.
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
import { PublisherButton, StatusBanner } from './sharedChrome/index.js';
import { QueueRail, useDraftWorkspace } from './workspace/index.js';
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
  useDraftLifecycle,
  usePreviewController,
  useReadinessController,
  useStatusChannel,
} from './controllers/index.js';
import { publishDisabledReason } from './lifecycleMessaging.js';
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

  const previewController = usePreviewController({
    repositories,
    selectedArticleId: workspace.selectedArticleId,
    setStatus,
  });
  const { preview, previewLoading } = previewController;

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

  return (
    <div className={styles.workspace} aria-label="Article Publisher workspace">
      {/* ── Left draft rail ──────────────────────────────────── */}
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
      />

      {/* ── Center authoring canvas ─────────────────────────── */}
      <main className={styles.canvas} aria-label="Article authoring canvas">
        {authoringHealth.kind !== 'healthy' &&
          authoringHealth.kind !== 'loading' && (
            <section
              className={styles.canvasNoticeBlocking}
              role="status"
              aria-live="polite"
              aria-label="Authoring environment health"
            >
              <strong>{authoringHealthHeadline(authoringHealth)}</strong>
              {authoringHealth.kind === 'registryReadFailure' && (
                <> {' '}<span>({authoringHealth.message})</span></>
              )}
              {authoringHealth.kind === 'draftNoTemplateMatch' && (
                <> {' '}<span>({authoringHealth.message})</span></>
              )}
              {authoringHealthActionHint(authoringHealth) && (
                <>
                  {' '}
                  <span>{authoringHealthActionHint(authoringHealth)}</span>
                </>
              )}
            </section>
          )}
        {!articleDraft ? (
          <div className={styles.canvasEmpty}>
            <HbcEmptyState
              title="Start composing"
              description="Pick a draft from the left, or start a new Project Spotlight article."
            />
          </div>
        ) : (
          <>
            <header className={styles.canvasHeader}>
              <div className={styles.canvasHeaderMain}>
                <p className={styles.canvasKicker}>Project Spotlight article</p>
                <h2 className={styles.canvasTitle}>
                  {articleDraft.Title?.trim() || 'Untitled draft'}
                </h2>
              </div>
              {workflowOutcomeChipLabel && (
                <span className={styles.outcomeChip}>{workflowOutcomeChipLabel}</span>
              )}
            </header>

            {scheduledLegacyStateNotice(articleDraft.WorkflowState) && (
              <p className={styles.canvasNotice}>
                {scheduledLegacyStateNotice(articleDraft.WorkflowState)}
              </p>
            )}
            {unsupportedContentTypeMessage && (
              <p className={styles.canvasNoticeBlocking}>
                {unsupportedContentTypeMessage}
              </p>
            )}
            {unsupportedDestinationMessage && (
              <p className={styles.canvasNoticeBlocking}>
                {unsupportedDestinationMessage}
              </p>
            )}

            <nav className={styles.sectionIndex} aria-label="Workspace sections">
              {WORKSPACE_SECTIONS.map((s) => (
                <a key={s.id} href={`#section-${s.id}`} className={styles.sectionIndexLink}>
                  {s.label}
                </a>
              ))}
            </nav>

            <section id="section-identity" className={styles.section}>
              <header className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Identity</h3>
                <p className={styles.sectionIntent}>Name the article and bind it to a project.</p>
              </header>
              <div className={styles.sectionBody}>
                <MetadataPanel
                  draft={articleDraft}
                  onChange={setArticleDraft}
                  searchProjects={searchProjects}
                  promotionPolicy={promotionPolicy}
                />
              </div>
            </section>

            <section id="section-hero" className={styles.section}>
              <header className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Hero</h3>
                <p className={styles.sectionIntent}>Set the hero visual and editorial framing.</p>
              </header>
              <div className={styles.sectionBody}>
                <HeroPanel draft={articleDraft} onChange={setArticleDraft} />
              </div>
            </section>

            <section id="section-story" className={styles.section}>
              <header className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Story</h3>
                <p className={styles.sectionIntent}>Compose the body of the article.</p>
              </header>
              <div className={styles.sectionBody}>
                <StoryPanel draft={articleDraft} onChange={setArticleDraft} />
              </div>
            </section>

            <section id="section-media" className={styles.section}>
              <header className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Media</h3>
                <p className={styles.sectionIntent}>Add supporting media beyond the hero.</p>
              </header>
              <div className={styles.sectionBody}>
                <div className={styles.sectionSubheading}>Secondary hero image</div>
                <SecondaryImagePanel draft={articleDraft} onChange={setArticleDraft} />
                <div className={styles.sectionSubheading}>Supporting images</div>
                <GalleryPanel
                  articleId={articleDraft.ArticleId}
                  rows={mediaDraft}
                  onChange={setMediaDraft}
                />
              </div>
            </section>

            <section id="section-team" className={styles.section}>
              <header className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Team</h3>
                <p className={styles.sectionIntent}>Spotlight the people behind the work.</p>
              </header>
              <div className={styles.sectionBody}>
                <div className={styles.sectionSubheading}>How the team section is presented</div>
                <TeamPresentationPanel draft={articleDraft} onChange={setArticleDraft} />
                <div className={styles.sectionSubheading}>Members</div>
                <TeamPanel
                  articleId={articleDraft.ArticleId}
                  rows={teamDraft}
                  onChange={setTeamDraft}
                  searchPeople={searchPeople}
                  fetchPersonPhoto={fetchPersonPhoto}
                />
              </div>
            </section>

            <section id="section-promotion" className={styles.section}>
              <header className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Promotion</h3>
                <p className={styles.sectionIntent}>Review how promotion policy applies.</p>
              </header>
              <div className={styles.sectionBody}>
                {promotionRuleHealth &&
                  promotionRuleHealth.kind !== 'ready' &&
                  promotionRuleHealthHeadline && (
                    <p
                      className={
                        promotionRuleHealth.kind === 'loadFailure'
                          ? styles.canvasNoticeBlocking
                          : styles.canvasNotice
                      }
                      role="status"
                      aria-live="polite"
                    >
                      {promotionRuleHealthHeadline}
                    </p>
                  )}
                {promotionSummary.map((line, i) => (
                  <p key={i} className={styles.sectionCopy}>{line}</p>
                ))}
              </div>
            </section>

            <section id="section-destination" className={styles.section}>
              <header className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Destination binding</h3>
                <p className={styles.sectionIntent}>Confirm template and destination page binding.</p>
              </header>
              <div className={styles.sectionBody}>
                <DestinationBindingPanel binding={binding} context={resolutionContext} />
              </div>
            </section>

            <section id="section-preview" className={styles.section}>
              <header className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Preview</h3>
                <p className={styles.sectionIntent}>See how the article will publish.</p>
              </header>
              <div className={styles.sectionBody}>
                <ArticlePreview outcome={preview} loading={previewLoading} />
              </div>
            </section>
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
            <section className={styles.readinessBlock} aria-label="Readiness summary">
              <p className={styles.readinessHeading}>Readiness</p>
              <p className={styles.readinessSummary}>{readinessSummary}</p>
              {bindingSignal && (
                <p className={styles.readinessBindingSignal}>{bindingSignal}</p>
              )}
            </section>

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
                  {latestValidation.errors.length === 1 ? '' : 's'}
                </p>
                <ul className={styles.readinessList}>
                  {latestValidation.errors.map((err, idx) => (
                    <li key={idx} className={styles.readinessIssueError}>{err.message}</li>
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
                    <li key={idx} className={styles.readinessIssueWarn}>{w.message}</li>
                  ))}
                </ul>
              </section>
            )}

            <PublishReadinessDiagnostics outcome={preview} binding={binding} />

            <section className={styles.readinessBlock} aria-label="Primary actions">
              <p className={styles.readinessHeading}>Actions</p>
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
                  onClick={() => handlePublishAction('create')}
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
                  onClick={() => handlePublishAction('republish')}
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
                  onClick={handleSave}
                >
                  Save draft
                </PublisherButton>
                <PublisherButton
                  disabled={!saveEnabled}
                  title={saveBlockedReason}
                  onClick={() => handlePublishAction('preview')}
                >
                  Recompose preview
                </PublisherButton>
              </div>
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
