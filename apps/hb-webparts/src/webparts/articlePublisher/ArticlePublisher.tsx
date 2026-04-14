/**
 * Article Publisher — authoring surface for structured article publishing.
 *
 * The current sprint supports the Project Spotlight article workflow
 * (HB Articles master-record with Destination='projectSpotlight',
 * page-bound to the ProjectSpotlight site). Future sprints may extend
 * this app to additional article destinations such as Company Pulse;
 * no other destinations are wired today.
 *
 * Hosted on the HBCentral publisher page. Ownership:
 *   - Reads `HB Articles` through `createPublisherRepositories()`
 *   - Writes master / child records + workflow history through the same
 *     repository factory
 *   - Orchestrates publish / republish / preview through
 *     `createPublishOrchestrator`
 */
import * as React from 'react';
import { HbcEmptyState, HbcSpinner } from '@hbc/ui-kit/homepage';
import { fetchRequestDigest, storeSiteUrl } from '@hbc/sharepoint-platform';
import {
  ARTICLE_CONTENT_TYPE_OPERATIONAL_VALUES,
  ARTICLE_SUBJECT_VALUES,
  SUPPORTED_DESTINATIONS,
  HERO_THEME_VARIANT_VALUES,
  PROJECT_STAGE_VALUES,
  TEAM_VIEWER_GROUPING_MODE_VALUES,
  TEAM_VIEWER_MODE_VALUES,
  TEAM_VIEWER_SORT_MODE_VALUES,
  SPOTLIGHT_TYPE_VALUES,
  WORKFLOW_STATE_OPERATIONAL_VALUES,
  createPublisherRepositories,
  createDefaultPublishOrchestrator,
  createSharePointPageBindingWriter,
  createSharePointPageCreationService,
  type PublisherArticleRow,
  type PublisherMediaRow,
  type PublisherPageBindingRow,
  type PublisherRepositories,
  type PublisherTeamMemberRow,
  type WorkflowState,
  type MediaRole,
  type ArticleContentType,
  type ArticleSubject,
  type Destination,
  type HeroThemeVariant,
  type SpotlightType,
  type TeamViewerGroupingMode,
  type TeamViewerMode,
  type TeamViewerSortMode,
  type ProjectStage,
  type PublishResolutionContext,
  type PublishOutcome,
  type PublisherPromotionRuleRow,
  selectPromotionPolicy,
  type PromotionPolicyResult,
  resolveTemplateSystemManaged,
} from '../../homepage/data/publisherAdapter/index.js';
import { buildPublishResolutionContext } from '../../homepage/data/publisherAdapter/publishResolutionContext.js';
import {
  canTransition,
  validTransitionsFrom,
} from '../../homepage/data/publisherAdapter/workflowStateMachine.js';
import { buildPublisherPreview } from '../../homepage/data/publisherAdapter/preview/previewBuilder.js';
import type { PreviewOutcome } from '../../homepage/data/publisherAdapter/preview/previewBuilder.js';
import {
  createProjectsLookupSearch,
  type ProjectLookupEntry,
  type ProjectLookupSearchFn,
} from '../../homepage/data/publisherAdapter/projectsLookupSource.js';
import { ProjectPicker, type ProjectPickerValue } from './ProjectPicker.js';
import type {
  BannerControlPayload,
  ImageGalleryControlPayload,
  TeamViewerControlPayload,
  TextControlPayload,
} from '../../homepage/data/publisherAdapter/pageGeneration/pageCompositor.js';
import styles from './article-publisher.module.css';

// Convenience aliases so the JSX stays compact.
const MEDIA_ROLES: readonly MediaRole[] = ['gallery', 'supporting', 'hero', 'secondary'];

/* ── Props ──────────────────────────────────────────────────── */

export interface ArticlePublisherProps {
  /** HBCentral absolute URL. Platform `storeSiteUrl` is invoked with this. */
  siteUrl?: string;
  /**
   * Current SPFx operator email, threaded in from `mount.tsx` via
   * the host's `identity.email`. Used as `ActorEmail` on every
   * workflow-history write (publish / republish / archive /
   * withdraw / generic state transitions) so the audit trail
   * reflects the acting user rather than the article author.
   * Closes Phase-05 Prompt-04.
   */
  actorEmail?: string;
  /** When set, overrides the default repository factory (tests only). */
  repositoriesOverride?: PublisherRepositories;
}

/* ── Helpers ────────────────────────────────────────────────── */

function nowIso(): string {
  return new Date().toISOString();
}

export interface PromotionPolicyApplyResult {
  readonly draft: PublisherArticleRow;
  readonly policy: PromotionPolicyResult;
}

export function applyPromotionPolicyToDraft(
  draft: PublisherArticleRow,
  rules: readonly PublisherPromotionRuleRow[],
  options?: { readonly enforceLockOnly?: boolean },
): PromotionPolicyApplyResult {
  const policy = selectPromotionPolicy(
    rules,
    draft.Destination,
    draft.ArticleContentType,
  );
  if (options?.enforceLockOnly && !policy.isLocked) {
    return { draft, policy };
  }
  return {
    draft: {
      ...draft,
      IsFeatured: policy.featured,
      IsPinned: policy.pinned,
    },
    policy,
  };
}

export function promotionLockStatusText(policy: PromotionPolicyResult): string {
  return (
    `Promotion rule lock: IsFeatured=${String(policy.featured)} and ` +
    `IsPinned=${String(policy.pinned)} are enforced by the ` +
    `${policy.matchedScope} scope rule ${policy.sourceRuleId ?? '(unknown)'}. ` +
    'No direct IsFeatured/IsPinned toggle controls are exposed in this sprint UI; ' +
    'locked policy is enforced through policy re-application and save-time normalization.'
  );
}

/**
 * Build a blank authoring draft for a brand-new article.
 *
 * `TemplateKey` starts blank in-memory and is system-resolved on
 * save from current discriminators (destination/content type/etc).
 * Persisted rows still carry a non-empty key, but ordinary authoring
 * does not treat a prior key as sticky override.
 */
function emptyArticle(): PublisherArticleRow {
  const id = `art-${Date.now()}-${Math.floor(Math.random() * 1e6)
    .toString(36)
    .padStart(4, '0')}`;
  return {
    ArticleId: id,
    Title: 'Untitled article',
    ArticleContentType: 'monthlySpotlight',
    Destination: 'projectSpotlight',
    Slug: id,
    TemplateKey: '',
    WorkflowState: 'draft',
    Subhead: '',
    SummaryExcerpt: '',
    BodyRichText: '',
    HeroPrimaryImage: '',
    HeroPrimaryImageAltText: '',
    CreatedDateUtc: nowIso(),
    UpdatedDateUtc: nowIso(),
    // TargetSiteUrl is tenant-optional and derived from Destination
    // at publish time (`resolveDestinationSiteUrl`). We no longer
    // seed a hard-coded URL on new drafts — authors are not expected
    // to carry a per-destination constant (P2-2).
    TargetSiteUrl: undefined,
    // Promotion values are resolved from the current draft's
    // destination/content-type policy by the editor before save.
    IsFeatured: false,
    IsPinned: false,
  };
}

/* ── Component ──────────────────────────────────────────────── */

type Tab = 'metadata' | 'hero' | 'content' | 'team' | 'gallery' | 'preview' | 'status';

export function ArticlePublisher({
  siteUrl,
  actorEmail,
  repositoriesOverride,
}: ArticlePublisherProps) {
  React.useEffect(() => {
    if (siteUrl) storeSiteUrl(siteUrl);
  }, [siteUrl]);

  const repositories = React.useMemo<PublisherRepositories>(
    () => repositoriesOverride ?? createPublisherRepositories(),
    [repositoriesOverride],
  );

  // Project lookup is bound to the HBCentral site URL threaded in from
  // `mount.tsx`. Creating the adapter at this scope keeps the search
  // function identity stable across draft mutations so the picker's
  // debounced effect does not re-fire on every keystroke.
  const searchProjects = React.useMemo<ProjectLookupSearchFn | undefined>(
    () => (siteUrl ? createProjectsLookupSearch({ hostSiteUrl: siteUrl }) : undefined),
    [siteUrl],
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

  const [filter, setFilter] = React.useState<WorkflowState>('draft');
  const [articles, setArticles] = React.useState<readonly PublisherArticleRow[]>([]);
  const [articlesLoading, setArticlesLoading] = React.useState(false);
  const [promotionRules, setPromotionRules] = React.useState<readonly PublisherPromotionRuleRow[]>([]);
  const [promotionPolicy, setPromotionPolicy] = React.useState<PromotionPolicyResult | undefined>();
  const [selectedArticleId, setSelectedArticleId] = React.useState<string | undefined>();
  const [articleDraft, setArticleDraft] = React.useState<PublisherArticleRow | undefined>();
  const [teamDraft, setTeamDraft] = React.useState<PublisherTeamMemberRow[]>([]);
  const [mediaDraft, setMediaDraft] = React.useState<PublisherMediaRow[]>([]);
  const [binding, setBinding] = React.useState<PublisherPageBindingRow | undefined>();
  const [resolutionContext, setResolutionContext] = React.useState<PublishResolutionContext | undefined>();
  const [tab, setTab] = React.useState<Tab>('metadata');
  const [status, setStatus] = React.useState<string | undefined>();
  const [busy, setBusy] = React.useState(false);
  const [preview, setPreview] = React.useState<PreviewOutcome | undefined>();
  const [previewLoading, setPreviewLoading] = React.useState(false);

  const applyPromotionPolicy = React.useCallback(
    (
      draft: PublisherArticleRow,
      options?: { readonly enforceLockOnly?: boolean },
    ): PublisherArticleRow => {
      const resolved = applyPromotionPolicyToDraft(draft, promotionRules, options);
      setPromotionPolicy(resolved.policy);
      return resolved.draft;
    },
    [promotionRules],
  );

  const reloadList = React.useCallback(async () => {
    setArticlesLoading(true);
    try {
      const rows = await repositories.articles.listByWorkflowState(filter);
      setArticles(rows);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Failed to load articles.');
    } finally {
      setArticlesLoading(false);
    }
  }, [repositories, filter]);

  React.useEffect(() => {
    void reloadList();
  }, [reloadList]);

  const reloadSelected = React.useCallback(
    async (articleId: string) => {
      setBusy(true);
      try {
        const [article, team, media, bindingRow] = await Promise.all([
          repositories.articles.getByArticleId(articleId),
          repositories.teamMembers.listByArticle(articleId),
          repositories.media.listByArticle(articleId),
          repositories.pageBindings.getByArticleId(articleId),
        ]);
        if (article) {
          setArticleDraft(article);
          setPromotionPolicy(
            selectPromotionPolicy(
              promotionRules,
              article.Destination,
              article.ArticleContentType,
            ),
          );
          setTeamDraft(team.slice());
          setMediaDraft(media.slice());
          setBinding(bindingRow);
          const ctx = await buildPublishResolutionContext(repositories, articleId);
          setResolutionContext(ctx.ok ? ctx.context : undefined);
          setStatus(ctx.ok ? undefined : ctx.message);
        }
      } catch (err) {
        setStatus(err instanceof Error ? err.message : 'Failed to load article.');
      } finally {
        setBusy(false);
      }
    },
    [repositories, promotionRules],
  );

  React.useEffect(() => {
    if (selectedArticleId) void reloadSelected(selectedArticleId);
  }, [selectedArticleId, reloadSelected]);

  const loadPreview = React.useCallback(
    async (articleId: string) => {
      setPreviewLoading(true);
      try {
        const outcome = await buildPublisherPreview(repositories, articleId);
        setPreview(outcome);
      } catch (err) {
        setPreview(undefined);
        setStatus(err instanceof Error ? err.message : 'Preview failed.');
      } finally {
        setPreviewLoading(false);
      }
    },
    [repositories],
  );

  React.useEffect(() => {
    if (tab === 'preview' && selectedArticleId) {
      void loadPreview(selectedArticleId);
    }
  }, [tab, selectedArticleId, loadPreview]);

  // Load active promotion rules once at mount.
  //
  // Current behavior:
  //   - resolve policy from the draft's actual
  //     (Destination, ArticleContentType),
  //   - seed/re-seed IsFeatured/IsPinned on draft creation and
  //     destination/content-type changes,
  //   - enforce lock semantics on save when
  //     ManualOverrideAllowed=false.
  //
  // The editor still has no explicit IsFeatured/IsPinned toggles;
  // this prompt enforces policy closure without inventing controls.
  React.useEffect(() => {
    void (async () => {
      try {
        const rules = await repositories.promotionRules.listActive();
        setPromotionRules(rules);
      } catch {
        // Best-effort — fall back to publisher defaults.
        setPromotionRules([]);
      }
    })();
  }, [repositories]);

  const handleCreateNew = React.useCallback(() => {
    // No hard-coded TemplateKey — the resolver selects based on the
    // article's Destination + ContentType + applicability when the
    // operator leaves the override blank. Closes P1-2.
    const seeded = applyPromotionPolicy(emptyArticle());
    setArticleDraft(seeded);
    setTeamDraft([]);
    setMediaDraft([]);
    setBinding(undefined);
    setResolutionContext(undefined);
    setSelectedArticleId(seeded.ArticleId);
    setTab('metadata');
  }, [applyPromotionPolicy]);

  const promotionContextRef = React.useRef<string | undefined>(undefined);

  React.useEffect(() => {
    if (!articleDraft) {
      promotionContextRef.current = undefined;
      setPromotionPolicy(undefined);
      return;
    }
    const contextKey = `${articleDraft.Destination}::${articleDraft.ArticleContentType}`;
    if (promotionContextRef.current === contextKey) {
      setPromotionPolicy(
        selectPromotionPolicy(
          promotionRules,
          articleDraft.Destination,
          articleDraft.ArticleContentType,
        ),
      );
      return;
    }
    promotionContextRef.current = contextKey;
    const next = applyPromotionPolicy(articleDraft);
    if (
      next.IsFeatured !== articleDraft.IsFeatured ||
      next.IsPinned !== articleDraft.IsPinned
    ) {
      setArticleDraft(next);
    }
  }, [articleDraft, promotionRules, applyPromotionPolicy]);

  const handleSave = React.useCallback(async () => {
    if (!articleDraft) return;
    setBusy(true);
    setStatus('Saving…');
    try {
      // Ordinary authoring treats TemplateKey as system-managed.
      // Always resolve from current discriminators so stale keys
      // cannot survive Destination/ContentType/etc changes.
      const registry = await repositories.templateRegistry.listActive();
      const resolution = resolveTemplateKeySystemManaged(articleDraft, registry);
      if (!resolution.ok) {
        setStatus(
          `Save blocked — could not resolve a template for this article (${resolution.reason}). ${resolution.message}`,
        );
        return;
      }
      const updated: PublisherArticleRow = {
        ...articleDraft,
        TemplateKey: resolution.entry.TemplateKey,
        UpdatedDateUtc: nowIso(),
      };
      const policyApplied = applyPromotionPolicy(updated, { enforceLockOnly: true });
      await repositories.articles.upsert(policyApplied);
      await repositories.teamMembers.replaceAllForArticle(updated.ArticleId, teamDraft);
      await repositories.media.replaceAllForArticle(updated.ArticleId, mediaDraft);
      setArticleDraft(policyApplied);
      setStatus('Saved.');
      await reloadList();
      await reloadSelected(policyApplied.ArticleId);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setBusy(false);
    }
  }, [articleDraft, teamDraft, mediaDraft, repositories, reloadList, reloadSelected, applyPromotionPolicy]);

  const handleTransition = React.useCallback(
    async (to: WorkflowState) => {
      if (!articleDraft) return;
      const from = articleDraft.WorkflowState;
      if (!canTransition(from, to)) {
        setStatus(`Cannot transition from ${from} to ${to}.`);
        return;
      }
      setBusy(true);
      setStatus(`Transitioning to ${to}…`);
      try {
        // Archive and withdraw are first-class operational flows
        // that orchestrate master-row + binding + history side
        // effects atomically. All other transitions remain a simple
        // state flip with a history row, since the publish/preview
        // orchestrator covers the publish-side mutations.
        if (to === 'archived' || to === 'withdrawn') {
          // Acting operator's email (SPFx current user) drives the
          // audit row, not the article author. Closes Phase-05
          // Prompt-04.
          const resolvedActor = actorEmail ?? articleDraft.AuthorEmail;
          const outcome =
            to === 'archived'
              ? await orchestrator.archive({
                  articleId: articleDraft.ArticleId,
                  actorEmail: resolvedActor,
                })
              : await orchestrator.withdraw({
                  articleId: articleDraft.ArticleId,
                  actorEmail: resolvedActor,
                });
          if (outcome.ok) {
            setStatus(
              `Now in ${to} (binding ${outcome.bindingUpdated ? 'updated' : 'unchanged'}).`,
            );
          } else {
            setStatus(`${to} failed at ${outcome.stage}: ${outcome.message}`);
          }
        } else {
          // Generic transitions are now orchestrated to prevent
          // silent article-state changes without auditable history
          // closure. On history failure the orchestrator attempts
          // a compensating rollback of the article state.
          const outcome = await orchestrator.transitionManual({
            articleId: articleDraft.ArticleId,
            to,
            actorEmail: actorEmail ?? articleDraft.AuthorEmail,
          });
          if (outcome.ok) {
            setStatus(`Now in ${to}.`);
          } else {
            setStatus(`Transition to ${to} failed at ${outcome.stage}: ${outcome.message}`);
          }
        }
        await reloadList();
        await reloadSelected(articleDraft.ArticleId);
      } catch (err) {
        setStatus(err instanceof Error ? err.message : 'Transition failed.');
      } finally {
        setBusy(false);
      }
    },
    [articleDraft, actorEmail, orchestrator, repositories, reloadList, reloadSelected],
  );

  const handlePublishAction = React.useCallback(
    async (mode: 'create' | 'republish' | 'preview') => {
      if (!articleDraft) return;
      setBusy(true);
      setStatus(`${mode === 'preview' ? 'Composing preview' : mode === 'create' ? 'Publishing' : 'Republishing'}…`);
      try {
        const outcome: PublishOutcome = await orchestrator.run({
          articleId: articleDraft.ArticleId,
          mode,
          // Acting operator identity — the orchestrator stamps this
          // onto the workflow-history row's ActorEmail so audit
          // rows reflect who actually clicked Publish / Republish,
          // not the article author. Closes Phase-05 Prompt-04.
          actorEmail,
        });
        if (outcome.ok) {
          // When the orchestrator actually wrote a page + binding
          // (create / inPlaceUpdate / regenerate) it also stamped
          // WorkflowState='published' and appended a workflow-history
          // row. Reflect that in the status line so the operator
          // sees the closed lifecycle and not just the page-side
          // action. `noOp` and `preview` never mutate state, so we
          // keep the original description for those.
          const lifecycleClosed =
            mode !== 'preview' && outcome.action !== 'noOp';
          const suffix = outcome.pageUrl ? ` · ${outcome.pageUrl}` : '';
          setStatus(
            lifecycleClosed
              ? `${mode} ok — action=${outcome.action}, state=published${suffix}`
              : `${mode} ok — action=${outcome.action}, reason=${outcome.reason}${suffix}`,
          );
          if (mode !== 'preview') await reloadSelected(articleDraft.ArticleId);
        } else {
          setStatus(`${mode} failed at ${outcome.stage}: ${outcome.message}`);
        }
      } catch (err) {
        setStatus(err instanceof Error ? err.message : `${mode} failed.`);
      } finally {
        setBusy(false);
      }
    },
    [articleDraft, actorEmail, orchestrator, reloadSelected],
  );

  const validNextStates = articleDraft ? validTransitionsFrom(articleDraft.WorkflowState) : [];

  const latestValidation =
    preview && preview.ok ? preview.validation : undefined;
  const publishBlockedByValidation =
    !!latestValidation && !latestValidation.ok;
  const firstBlockingError = latestValidation?.errors[0]?.message;
  const hasDrift =
    !!preview && preview.ok &&
    (preview.drift.shellVersionDrift ||
      preview.drift.templateKeyDrift ||
      preview.drift.templateVersionDrift);

  return (
    <div className={styles.shell}>
      <aside className={styles.listPane}>
        <header className={styles.listHeader}>
          <div className={styles.listTitle}>HB Articles</div>
          <button type="button" className={styles.primaryBtn} onClick={handleCreateNew}>
            New article
          </button>
        </header>
        <label className={styles.filterLabel}>
          Filter:
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as WorkflowState)}
            className={styles.select}
          >
            {WORKFLOW_STATE_OPERATIONAL_VALUES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        {articlesLoading ? (
          <HbcSpinner />
        ) : articles.length === 0 ? (
          <HbcEmptyState
            title="No articles"
            description={`No articles in state '${filter}' yet.`}
          />
        ) : (
          <ul className={styles.postList}>
            {articles.map((a) => (
              <li key={a.ArticleId}>
                <button
                  type="button"
                  className={`${styles.postRow} ${
                    a.ArticleId === selectedArticleId ? styles.postRowActive : ''
                  }`}
                  onClick={() => setSelectedArticleId(a.ArticleId)}
                >
                  <div className={styles.postRowTitle}>{a.Title}</div>
                  <div className={styles.postRowMeta}>
                    {a.ArticleContentType} · {a.ProjectName || '(no project)'}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>

      <main className={styles.editor}>
        {!articleDraft ? (
          <HbcEmptyState
            title="Select or create an article"
            description="Choose a row from the left, or start a new draft."
          />
        ) : (
          <>
            <header className={styles.editorHeader}>
              <h2 className={styles.title}>{articleDraft.Title || '(Untitled)'}</h2>
              <div className={styles.meta}>
                <span className={styles.stateBadge}>{articleDraft.WorkflowState}</span>
                {binding && (
                  <span className={styles.bindingBadge}>binding {binding.PublishStatus}</span>
                )}
              </div>
            </header>
            {articleDraft.WorkflowState === 'scheduled' && (
              <div className={styles.statusLine}>
                Legacy state notice: `scheduled` is read-compatible only (no executor). Move to
                `approved` or `withdrawn`.
              </div>
            )}

            <nav className={styles.tabs}>
              {(['metadata', 'hero', 'content', 'team', 'gallery', 'preview', 'status'] as Tab[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
                  onClick={() => setTab(t)}
                >
                  {t}
                </button>
              ))}
            </nav>

            <div className={styles.panel}>
              {tab === 'metadata' && (
                <MetadataPanel
                  draft={articleDraft}
                  onChange={setArticleDraft}
                  searchProjects={searchProjects}
                  promotionPolicy={promotionPolicy}
                />
              )}
              {tab === 'hero' && (
                <HeroPanel draft={articleDraft} onChange={setArticleDraft} />
              )}
              {tab === 'content' && (
                <ContentPanel draft={articleDraft} onChange={setArticleDraft} />
              )}
              {tab === 'team' && (
                <TeamPanel
                  articleId={articleDraft.ArticleId}
                  rows={teamDraft}
                  onChange={setTeamDraft}
                />
              )}
              {tab === 'gallery' && (
                <GalleryPanel
                  articleId={articleDraft.ArticleId}
                  rows={mediaDraft}
                  onChange={setMediaDraft}
                />
              )}
              {tab === 'preview' && (
                <PreviewPanel outcome={preview} loading={previewLoading} />
              )}
              {tab === 'status' && (
                <StatusPanel binding={binding} context={resolutionContext} />
              )}
            </div>

            <footer className={styles.actionBar}>
              <div className={styles.actionRow}>
                <button type="button" className={styles.primaryBtn} disabled={busy} onClick={handleSave}>
                  Save draft
                </button>
                <button type="button" className={styles.btn} disabled={busy} onClick={() => handlePublishAction('preview')}>
                  Preview
                </button>
                <button
                  type="button"
                  className={styles.btn}
                  disabled={busy || !binding || publishBlockedByValidation}
                  title={
                    publishBlockedByValidation && firstBlockingError
                      ? `Blocked by validation: ${firstBlockingError}`
                      : undefined
                  }
                  onClick={() => handlePublishAction('republish')}
                >
                  Republish
                </button>
                <button
                  type="button"
                  className={styles.btn}
                  disabled={busy || articleDraft.WorkflowState !== 'approved' || publishBlockedByValidation}
                  title={
                    publishBlockedByValidation && firstBlockingError
                      ? `Blocked by validation: ${firstBlockingError}`
                      : undefined
                  }
                  onClick={() => handlePublishAction('create')}
                >
                  Publish
                </button>
                {hasDrift && preview?.ok && (
                  preview.drift.templateKeyDrift ? (
                    <span
                      className={styles.driftChip}
                      title="PageTemplateKey differs from the existing binding; publishing will regenerate the destination page."
                    >
                      ⚠ drift — will regenerate
                    </span>
                  ) : (
                    <span
                      className={styles.driftChip}
                      title="Shell or template version drift; publishing will update the existing page in place."
                    >
                      ⚠ drift — will update in place
                    </span>
                  )
                )}
                {publishBlockedByValidation && (
                  <span className={styles.validationChip}>
                    🛑 {latestValidation?.errors.length} blocking error
                    {latestValidation!.errors.length === 1 ? '' : 's'}
                  </span>
                )}
              </div>
              <div className={styles.actionRow}>
                {validNextStates.map((to) => (
                  <button
                    key={to}
                    type="button"
                    className={styles.btn}
                    disabled={busy}
                    onClick={() => handleTransition(to)}
                  >
                    → {to}
                  </button>
                ))}
              </div>
              {status && <div className={styles.statusLine}>{status}</div>}
              {busy && <HbcSpinner />}
            </footer>
          </>
        )}
      </main>
    </div>
  );
}

/* ── Sub-panels ──────────────────────────────────────────── */

interface PanelProps {
  draft: PublisherArticleRow;
  onChange: (next: PublisherArticleRow) => void;
}

export function update<T extends keyof PublisherArticleRow>(
  draft: PublisherArticleRow,
  key: T,
  value: PublisherArticleRow[T],
): PublisherArticleRow {
  return { ...draft, [key]: value };
}

export function applyTeamMemberPrincipalChange(
  row: PublisherTeamMemberRow,
  principal: string,
): PublisherTeamMemberRow {
  return {
    ...row,
    PersonPrincipal: principal,
    // Principal changed: force re-resolution of the SharePoint User id.
    PersonPrincipalId: undefined,
  };
}

export function resolveTemplateKeySystemManaged(
  article: Pick<
    PublisherArticleRow,
    | 'ArticleContentType'
    | 'Destination'
    | 'SpotlightType'
    | 'ProjectStage'
    | 'ArticleSubject'
  >,
  registry: Parameters<typeof resolveTemplateSystemManaged>[1],
) {
  return resolveTemplateSystemManaged(
    {
      ArticleContentType: article.ArticleContentType,
      Destination: article.Destination,
      SpotlightType: article.SpotlightType,
      ProjectStage: article.ProjectStage,
      ArticleSubject: article.ArticleSubject,
    },
    registry,
  );
}

export function contentTypeOptionsForDraft(
  articleContentType: ArticleContentType,
): readonly ArticleContentType[] {
  return articleContentType === 'milestoneSpotlight'
    ? [...ARTICLE_CONTENT_TYPE_OPERATIONAL_VALUES, 'milestoneSpotlight']
    : ARTICLE_CONTENT_TYPE_OPERATIONAL_VALUES;
}

export function milestoneLegacyNotice(
  articleContentType: ArticleContentType,
): string | undefined {
  if (articleContentType !== 'milestoneSpotlight') {
    return undefined;
  }
  return (
    'Legacy content-type notice: `milestoneSpotlight` is read-compatible only ' +
    '(no live milestone executor). Move to an operational content type before publish.'
  );
}

interface MetadataPanelProps extends PanelProps {
  searchProjects?: ProjectLookupSearchFn;
  promotionPolicy?: PromotionPolicyResult;
}

function MetadataPanel({ draft, onChange, searchProjects, promotionPolicy }: MetadataPanelProps) {
  const contentTypeOptions = contentTypeOptionsForDraft(draft.ArticleContentType);
  const legacyMilestoneMessage = milestoneLegacyNotice(draft.ArticleContentType);
  const projectValue: ProjectPickerValue | null =
    draft.ProjectId && draft.ProjectName
      ? {
          projectId: draft.ProjectId,
          projectName: draft.ProjectName,
          projectLocation: draft.ProjectLocation,
        }
      : null;

  const handleProjectChange = React.useCallback(
    (entry: ProjectLookupEntry | null) => {
      if (!entry) {
        onChange({
          ...draft,
          ProjectId: undefined,
          ProjectName: undefined,
          ProjectLocation: undefined,
        });
        return;
      }
      onChange({
        ...draft,
        ProjectId: entry.projectId,
        ProjectName: entry.projectName,
        ProjectLocation: entry.projectLocation ?? draft.ProjectLocation,
      });
    },
    [draft, onChange],
  );

  return (
    <div className={styles.form}>
      <Field label="Title">
        <input
          className={styles.input}
          value={draft.Title}
          onChange={(e) => onChange(update(draft, 'Title', e.target.value))}
        />
      </Field>
      <Field label="Slug">
        <input
          className={styles.input}
          value={draft.Slug}
          onChange={(e) => onChange(update(draft, 'Slug', e.target.value))}
        />
      </Field>
      <Field label="Resolved template key">
        <input
          className={styles.input}
          value={draft.TemplateKey}
          disabled={true}
          readOnly
          placeholder="Resolved on save from current metadata"
        />
      </Field>
      <div className={styles.statusLine}>
        Template is system-managed in ordinary authoring. Save re-resolves from destination,
        content type, and applicability metadata.
      </div>
      <Field label="Article content type">
        <select
          className={styles.select}
          value={draft.ArticleContentType}
          onChange={(e) =>
            onChange(update(draft, 'ArticleContentType', e.target.value as ArticleContentType))
          }
        >
          {contentTypeOptions.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </Field>
      {legacyMilestoneMessage && <div className={styles.statusLine}>{legacyMilestoneMessage}</div>}
      <Field label="Destination">
        <select
          className={styles.select}
          value={draft.Destination}
          onChange={(e) =>
            onChange(update(draft, 'Destination', e.target.value as Destination))
          }
        >
          {/*
           * Only destinations whose publish pipeline is wired end to
           * end appear in the authoring surface. Current sprint:
           * `projectSpotlight` only. `companyPulse` remains on the
           * tenant Choice column + enum (schema-complete) for read
           * compatibility, but is intentionally hidden from new-
           * article authoring until its publish path lands. Closes
           * P2-3.
           */}
          {SUPPORTED_DESTINATIONS.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </Field>
      {promotionPolicy?.isLocked && (
        <div className={styles.statusLine}>{promotionLockStatusText(promotionPolicy)}</div>
      )}
      <Field label="Spotlight type">
        <select
          className={styles.select}
          value={draft.SpotlightType ?? ''}
          onChange={(e) =>
            onChange(
              update(
                draft,
                'SpotlightType',
                (e.target.value || undefined) as SpotlightType | undefined,
              ),
            )
          }
        >
          <option value="">(none)</option>
          {SPOTLIGHT_TYPE_VALUES.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Project stage">
        <select
          className={styles.select}
          value={draft.ProjectStage ?? ''}
          onChange={(e) =>
            onChange(
              update(
                draft,
                'ProjectStage',
                (e.target.value || undefined) as ProjectStage | undefined,
              ),
            )
          }
        >
          <option value="">(none)</option>
          {PROJECT_STAGE_VALUES.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Article subject">
        <select
          className={styles.select}
          value={draft.ArticleSubject ?? ''}
          onChange={(e) =>
            onChange(
              update(
                draft,
                'ArticleSubject',
                (e.target.value || undefined) as ArticleSubject | undefined,
              ),
            )
          }
        >
          <option value="">(none)</option>
          {ARTICLE_SUBJECT_VALUES.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Project">
        {searchProjects ? (
          <ProjectPicker
            value={projectValue}
            onChange={handleProjectChange}
            searchProjects={searchProjects}
          />
        ) : (
          // Fallback for test / offline contexts where `siteUrl` has
          // not been threaded through. Preserves manual entry so
          // existing unit tests that render MetadataPanel without a
          // live SharePoint host continue to work; this branch is
          // never hit on the hosted authoring surface.
          <>
            <input
              className={styles.input}
              value={draft.ProjectId ?? ''}
              placeholder="Project ID"
              onChange={(e) =>
                onChange(update(draft, 'ProjectId', e.target.value || undefined))
              }
            />
            <input
              className={styles.input}
              value={draft.ProjectName ?? ''}
              placeholder="Project name"
              onChange={(e) =>
                onChange(update(draft, 'ProjectName', e.target.value || undefined))
              }
            />
          </>
        )}
      </Field>
      <Field label="Summary excerpt">
        <textarea
          className={styles.textarea}
          value={draft.SummaryExcerpt}
          onChange={(e) => onChange(update(draft, 'SummaryExcerpt', e.target.value))}
        />
      </Field>
    </div>
  );
}

function HeroPanel({ draft, onChange }: PanelProps) {
  return (
    <div className={styles.form}>
      <Field label="Hero primary image URL (required)">
        <input
          className={styles.input}
          value={draft.HeroPrimaryImage}
          onChange={(e) => onChange(update(draft, 'HeroPrimaryImage', e.target.value))}
        />
      </Field>
      <Field label="Hero primary image alt text (required)">
        <textarea
          className={styles.textarea}
          value={draft.HeroPrimaryImageAltText}
          onChange={(e) => onChange(update(draft, 'HeroPrimaryImageAltText', e.target.value))}
        />
      </Field>
      <Field label="Hero title override">
        <input
          className={styles.input}
          value={draft.HeroTitle ?? ''}
          onChange={(e) =>
            onChange(update(draft, 'HeroTitle', e.target.value || undefined))
          }
        />
      </Field>
      <Field label="Hero eyebrow">
        <input
          className={styles.input}
          value={draft.HeroEyebrow ?? ''}
          onChange={(e) => onChange(update(draft, 'HeroEyebrow', e.target.value || undefined))}
        />
      </Field>
      <Field label="Hero category label">
        <input
          className={styles.input}
          value={draft.HeroCategoryLabel ?? ''}
          onChange={(e) =>
            onChange(update(draft, 'HeroCategoryLabel', e.target.value || undefined))
          }
        />
      </Field>
      <Field label="Hero theme variant">
        <select
          className={styles.select}
          value={draft.HeroThemeVariant ?? ''}
          onChange={(e) =>
            onChange(
              update(
                draft,
                'HeroThemeVariant',
                (e.target.value || undefined) as HeroThemeVariant | undefined,
              ),
            )
          }
        >
          <option value="">(default)</option>
          {HERO_THEME_VARIANT_VALUES.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Show hero metadata">
        <input
          type="checkbox"
          checked={!!draft.HeroShowMetadata}
          onChange={(e) => onChange(update(draft, 'HeroShowMetadata', e.target.checked))}
        />
      </Field>
    </div>
  );
}

function ContentPanel({ draft, onChange }: PanelProps) {
  return (
    <div className={styles.form}>
      <Field label="Subhead">
        <textarea
          className={styles.textarea}
          value={draft.Subhead}
          onChange={(e) => onChange(update(draft, 'Subhead', e.target.value))}
        />
      </Field>
      <Field label="Body (HTML accepted)">
        <textarea
          className={`${styles.textarea} ${styles.textareaLg}`}
          value={draft.BodyRichText}
          onChange={(e) => onChange(update(draft, 'BodyRichText', e.target.value))}
        />
      </Field>
      <Field label="Body intro">
        <textarea
          className={styles.textarea}
          value={draft.BodyIntro ?? ''}
          onChange={(e) => onChange(update(draft, 'BodyIntro', e.target.value || undefined))}
        />
      </Field>
      <Field label="Body closing">
        <textarea
          className={styles.textarea}
          value={draft.BodyClosing ?? ''}
          onChange={(e) => onChange(update(draft, 'BodyClosing', e.target.value || undefined))}
        />
      </Field>
      <Field label="Callout text">
        <textarea
          className={styles.textarea}
          value={draft.CalloutText ?? ''}
          onChange={(e) => onChange(update(draft, 'CalloutText', e.target.value || undefined))}
        />
      </Field>
      <Field label="Pull quote">
        <textarea
          className={styles.textarea}
          value={draft.PullQuote ?? ''}
          onChange={(e) => onChange(update(draft, 'PullQuote', e.target.value || undefined))}
        />
      </Field>
      <Field label="Show secondary image">
        <input
          type="checkbox"
          checked={draft.ShowSecondaryImage === true}
          onChange={(e) => onChange(update(draft, 'ShowSecondaryImage', e.target.checked))}
        />
      </Field>
      <Field label="Secondary image URL">
        <input
          className={styles.input}
          value={draft.SecondaryImage ?? ''}
          onChange={(e) => onChange(update(draft, 'SecondaryImage', e.target.value || undefined))}
        />
      </Field>
      <Field label="Secondary image alt text">
        <textarea
          className={styles.textarea}
          value={draft.SecondaryImageAltText ?? ''}
          onChange={(e) =>
            onChange(update(draft, 'SecondaryImageAltText', e.target.value || undefined))
          }
        />
      </Field>
      <Field label="Secondary image caption">
        <textarea
          className={styles.textarea}
          value={draft.SecondaryImageCaption ?? ''}
          onChange={(e) =>
            onChange(update(draft, 'SecondaryImageCaption', e.target.value || undefined))
          }
        />
      </Field>
      <div className={styles.statusLine}>
        Secondary image fields are persisted on HB Articles; page composition support is deferred
        until a dedicated secondary-image slot exists.
      </div>
      <Field label="Team viewer title">
        <input
          className={styles.input}
          value={draft.TeamViewerTitle ?? ''}
          onChange={(e) =>
            onChange(update(draft, 'TeamViewerTitle', e.target.value || undefined))
          }
        />
      </Field>
      <Field label="Team viewer intro">
        <textarea
          className={styles.textarea}
          value={draft.TeamViewerIntro ?? ''}
          onChange={(e) =>
            onChange(update(draft, 'TeamViewerIntro', e.target.value || undefined))
          }
        />
      </Field>
      <Field label="Show team viewer">
        <input
          type="checkbox"
          checked={draft.ShowTeamViewer !== false}
          onChange={(e) => onChange(update(draft, 'ShowTeamViewer', e.target.checked))}
        />
      </Field>
      <Field label="Team viewer mode">
        <select
          className={styles.select}
          value={draft.TeamViewerMode ?? ''}
          onChange={(e) =>
            onChange(
              update(
                draft,
                'TeamViewerMode',
                (e.target.value || undefined) as TeamViewerMode | undefined,
              ),
            )
          }
        >
          <option value="">(default)</option>
          {TEAM_VIEWER_MODE_VALUES.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Team viewer grouping mode">
        <select
          className={styles.select}
          value={draft.TeamViewerGroupingMode ?? ''}
          onChange={(e) =>
            onChange(
              update(
                draft,
                'TeamViewerGroupingMode',
                (e.target.value || undefined) as TeamViewerGroupingMode | undefined,
              ),
            )
          }
        >
          <option value="">(default)</option>
          {TEAM_VIEWER_GROUPING_MODE_VALUES.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Team viewer sort mode">
        <select
          className={styles.select}
          value={draft.TeamViewerSortMode ?? ''}
          onChange={(e) =>
            onChange(
              update(
                draft,
                'TeamViewerSortMode',
                (e.target.value || undefined) as TeamViewerSortMode | undefined,
              ),
            )
          }
        >
          <option value="">(default)</option>
          {TEAM_VIEWER_SORT_MODE_VALUES.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Team viewer max initial visible">
        <input
          className={styles.input}
          value={draft.TeamViewerMaxInitialVisible ?? ''}
          onChange={(e) =>
            onChange(update(draft, 'TeamViewerMaxInitialVisible', (() => {
              const raw = e.target.value.trim();
              if (raw.length === 0) return undefined;
              const parsed = Number(raw);
              return Number.isFinite(parsed) ? parsed : undefined;
            })()))
          }
        />
      </Field>
      <Field label="Team viewer allow expand">
        <input
          type="checkbox"
          checked={draft.TeamViewerAllowExpand === true}
          onChange={(e) => onChange(update(draft, 'TeamViewerAllowExpand', e.target.checked))}
        />
      </Field>
    </div>
  );
}

function TeamPanel({
  articleId,
  rows,
  onChange,
}: {
  articleId: string;
  rows: PublisherTeamMemberRow[];
  onChange: (next: PublisherTeamMemberRow[]) => void;
}) {
  const add = () =>
    onChange([
      ...rows,
      {
        ArticleId: articleId,
        TeamMemberId: `tm-${Date.now()}-${rows.length}`,
        Title: '',
        PersonPrincipal: '',
        DisplayName: '',
        SortOrder: rows.length + 1,
      },
    ]);
  const replaceAt = (idx: number, next: PublisherTeamMemberRow) =>
    onChange(rows.map((r, i) => (i === idx ? next : r)));
  const removeAt = (idx: number) => onChange(rows.filter((_, i) => i !== idx));
  const move = (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= rows.length) return;
    const next = rows.slice();
    [next[idx]!, next[j]!] = [next[j]!, next[idx]!];
    onChange(next.map((r, i) => ({ ...r, SortOrder: i + 1 })));
  };
  return (
    <div className={styles.rowList}>
      <button type="button" className={styles.primaryBtn} onClick={add}>
        Add team member
      </button>
      {rows.length === 0 ? (
        <HbcEmptyState title="No team members" description="Add a member to show in the Team Viewer." />
      ) : (
        rows.map((r, i) => (
          <div key={r.TeamMemberId} className={styles.rowCard}>
            <div className={styles.rowGrid}>
              <Field label="Title">
                <input
                  className={styles.input}
                  value={r.Title}
                  onChange={(e) => replaceAt(i, { ...r, Title: e.target.value })}
                />
              </Field>
              <Field label="Display name">
                <input
                  className={styles.input}
                  value={r.DisplayName}
                  onChange={(e) => replaceAt(i, { ...r, DisplayName: e.target.value })}
                />
              </Field>
              <Field label="Email / principal">
                <input
                  className={styles.input}
                  value={r.PersonPrincipal}
                  onChange={(e) =>
                    replaceAt(
                      i,
                      applyTeamMemberPrincipalChange(
                        r,
                        e.target.value,
                      ),
                    )
                  }
                />
              </Field>
              <Field label="Role">
                <input
                  className={styles.input}
                  value={r.Role ?? ''}
                  onChange={(e) => replaceAt(i, { ...r, Role: e.target.value || undefined })}
                />
              </Field>
              <Field label="Company">
                <input
                  className={styles.input}
                  value={r.Company ?? ''}
                  onChange={(e) => replaceAt(i, { ...r, Company: e.target.value || undefined })}
                />
              </Field>
              <Field label="Department">
                <input
                  className={styles.input}
                  value={r.Department ?? ''}
                  onChange={(e) => replaceAt(i, { ...r, Department: e.target.value || undefined })}
                />
              </Field>
              <Field label="Group key">
                <input
                  className={styles.input}
                  value={r.GroupKey ?? ''}
                  onChange={(e) => replaceAt(i, { ...r, GroupKey: e.target.value || undefined })}
                />
              </Field>
              <Field label="Parent member id">
                <input
                  className={styles.input}
                  value={r.ParentMemberId ?? ''}
                  onChange={(e) =>
                    replaceAt(i, { ...r, ParentMemberId: e.target.value || undefined })
                  }
                />
              </Field>
              <Field label="Bio snippet">
                <textarea
                  className={styles.textarea}
                  value={r.BioSnippet ?? ''}
                  onChange={(e) =>
                    replaceAt(i, { ...r, BioSnippet: e.target.value || undefined })
                  }
                />
              </Field>
              <Field label="Contact link">
                <input
                  className={styles.input}
                  value={r.ContactLink ?? ''}
                  onChange={(e) =>
                    replaceAt(i, { ...r, ContactLink: e.target.value || undefined })
                  }
                />
              </Field>
              <Field label="Featured member">
                <input
                  type="checkbox"
                  checked={r.IsFeaturedMember === true}
                  onChange={(e) => replaceAt(i, { ...r, IsFeaturedMember: e.target.checked })}
                />
              </Field>
            </div>
            <div className={styles.rowActions}>
              <button type="button" className={styles.btn} onClick={() => move(i, -1)}>↑</button>
              <button type="button" className={styles.btn} onClick={() => move(i, 1)}>↓</button>
              <button type="button" className={styles.btn} onClick={() => removeAt(i)}>Remove</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function GalleryPanel({
  articleId,
  rows,
  onChange,
}: {
  articleId: string;
  rows: PublisherMediaRow[];
  onChange: (next: PublisherMediaRow[]) => void;
}) {
  const add = () =>
    onChange([
      ...rows,
      {
        ArticleId: articleId,
        MediaId: `m-${Date.now()}-${rows.length}`,
        Title: '',
        MediaRole: 'gallery',
        ImageAsset: '',
        AltText: '',
        SortOrder: rows.length + 1,
      },
    ]);
  const replaceAt = (idx: number, next: PublisherMediaRow) =>
    onChange(rows.map((r, i) => (i === idx ? next : r)));
  const removeAt = (idx: number) => onChange(rows.filter((_, i) => i !== idx));
  const move = (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= rows.length) return;
    const next = rows.slice();
    [next[idx]!, next[j]!] = [next[j]!, next[idx]!];
    onChange(next.map((r, i) => ({ ...r, SortOrder: i + 1 })));
  };
  return (
    <div className={styles.rowList}>
      <button type="button" className={styles.primaryBtn} onClick={add}>
        Add gallery image
      </button>
      {rows.length === 0 ? (
        <HbcEmptyState title="No media" description="Add an image to populate the gallery." />
      ) : (
        rows.map((r, i) => (
          <div key={r.MediaId} className={styles.rowCard}>
            <div className={styles.rowGrid}>
              <Field label="Title">
                <input
                  className={styles.input}
                  value={r.Title}
                  onChange={(e) => replaceAt(i, { ...r, Title: e.target.value })}
                />
              </Field>
              <Field label="Role">
                <select
                  className={styles.select}
                  value={r.MediaRole}
                  onChange={(e) => replaceAt(i, { ...r, MediaRole: e.target.value as MediaRole })}
                >
                  {MEDIA_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Image asset URL">
                <input
                  className={styles.input}
                  value={r.ImageAsset}
                  onChange={(e) => replaceAt(i, { ...r, ImageAsset: e.target.value })}
                />
              </Field>
              <Field label="Alt text">
                <textarea
                  className={styles.textarea}
                  value={r.AltText}
                  onChange={(e) => replaceAt(i, { ...r, AltText: e.target.value })}
                />
              </Field>
              <Field label="Caption">
                <input
                  className={styles.input}
                  value={r.Caption ?? ''}
                  onChange={(e) => replaceAt(i, { ...r, Caption: e.target.value || undefined })}
                />
              </Field>
              <Field label="Gallery group">
                <input
                  className={styles.input}
                  value={r.GalleryGroup ?? ''}
                  onChange={(e) => replaceAt(i, { ...r, GalleryGroup: e.target.value || undefined })}
                />
              </Field>
              <Field label="Featured in gallery">
                <input
                  type="checkbox"
                  checked={r.FeaturedInGallery === true}
                  onChange={(e) => replaceAt(i, { ...r, FeaturedInGallery: e.target.checked })}
                />
              </Field>
            </div>
            <div className={styles.rowActions}>
              <button type="button" className={styles.btn} onClick={() => move(i, -1)}>↑</button>
              <button type="button" className={styles.btn} onClick={() => move(i, 1)}>↓</button>
              <button type="button" className={styles.btn} onClick={() => removeAt(i)}>Remove</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function StatusPanel({
  binding,
  context,
}: {
  binding: PublisherPageBindingRow | undefined;
  context: PublishResolutionContext | undefined;
}) {
  return (
    <div className={styles.statusPanel}>
      <section>
        <h3 className={styles.sectionHeading}>Template resolution</h3>
        {!context ? (
          <HbcEmptyState
            title="Not yet resolved"
            description="Save the article so the template registry can resolve it."
          />
        ) : (
          <dl className={styles.dl}>
            <Dt label="Template" value={`${context.template.TemplateKey} @ ${context.template.VersionLabel ?? '(no version label)'}`} />
            <Dt label="Page shell template" value={context.template.PageShellTemplateKey} />
            <Dt label="Destination" value={context.template.Destination} />
            <Dt label="Priority" value={String(context.template.TemplatePriority)} />
            <Dt label="Selection rule" value={context.decisionTrace.selectionRule ?? '(unknown)'} />
          </dl>
        )}
      </section>
      <section>
        <h3 className={styles.sectionHeading}>Page binding</h3>
        {!binding ? (
          <HbcEmptyState
            title="No binding yet"
            description="Publish this article to create a durable page binding."
          />
        ) : (
          <dl className={styles.dl}>
            <Dt label="Binding ID" value={binding.BindingId} />
            <Dt label="Publish status" value={binding.PublishStatus} />
            <Dt label="Sync status" value={binding.SyncStatus ?? '(none)'} />
            <Dt label="Page name" value={binding.PageName ?? '(none)'} />
            <Dt label="Page URL" value={binding.PageUrl ?? '(not yet set)'} />
            <Dt
              label="Page template"
              value={`${binding.PageTemplateKey} @ ${binding.RenderVersion ?? '(no render version)'}`}
            />
            <Dt label="Page shell version" value={binding.PageShellVersion ?? '(none)'} />
            <Dt label="Last synced" value={binding.LastSyncDateUtc ?? '(none)'} />
            <Dt label="Last sync message" value={binding.LastSyncMessage ?? '(none)'} />
            <Dt label="Published" value={binding.PublishedDateUtc ?? '(not yet published)'} />
          </dl>
        )}
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      {children}
    </label>
  );
}

function PreviewPanel({
  outcome,
  loading,
}: {
  outcome: PreviewOutcome | undefined;
  loading: boolean;
}) {
  if (loading && !outcome) return <HbcSpinner />;
  if (!outcome) {
    return (
      <HbcEmptyState
        title="Preview not yet built"
        description="Switch to the Preview tab to generate a structural preview."
      />
    );
  }
  if (!outcome.ok) {
    return (
      <HbcEmptyState
        title="Preview failed"
        description={`${outcome.reason}: ${outcome.message}`}
      />
    );
  }
  const { validation, drift, decision, composedPage } = outcome;
  const driftLevel = drift.templateKeyDrift
    ? 'hard'
    : drift.shellVersionDrift || drift.templateVersionDrift
      ? 'soft'
      : 'none';
  return (
    <div className={styles.previewRoot}>
      {driftLevel !== 'none' && (
        <div
          className={
            driftLevel === 'hard' ? styles.driftBannerHard : styles.driftBannerSoft
          }
        >
          {driftLevel === 'hard'
            ? 'PageTemplateKey has changed since the last publish. Publishing will regenerate the destination page (new PageId, new PageUrl); the prior binding is superseded.'
            : 'Shell or template version drift detected. Publishing will update the existing page in place — the same PageId and PageUrl are preserved.'}
        </div>
      )}

      <section>
        <h3 className={styles.sectionHeading}>
          Validation {validation.ok ? '· ok' : `· ${validation.errors.length} error${validation.errors.length === 1 ? '' : 's'}`}
        </h3>
        {validation.errors.length === 0 && validation.warnings.length === 0 ? (
          <div className={styles.findingItemOk}>No findings.</div>
        ) : (
          <ul className={styles.findingList}>
            {validation.errors.map((f, i) => (
              <li key={`e-${i}`} className={styles.findingItemError}>
                <div className={styles.findingCategory}>{f.category}</div>
                <div className={styles.findingMessage}>
                  {f.field ? <code>{f.field}</code> : null} {f.message}
                </div>
                {f.actionHint && <div className={styles.findingHint}>{f.actionHint}</div>}
              </li>
            ))}
            {validation.warnings.map((f, i) => (
              <li key={`w-${i}`} className={styles.findingItemWarn}>
                <div className={styles.findingCategory}>{f.category}</div>
                <div className={styles.findingMessage}>
                  {f.field ? <code>{f.field}</code> : null} {f.message}
                </div>
                {f.actionHint && <div className={styles.findingHint}>{f.actionHint}</div>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 className={styles.sectionHeading}>Decision on publish</h3>
        <div className={styles.findingItemOk}>
          <strong>action:</strong> {decision.action} · <strong>reason:</strong> {decision.reason}
          {decision.regenerationCause ? ` · cause: ${decision.regenerationCause}` : ''}
        </div>
        {decision.notes.length > 0 && (
          <ul className={styles.decisionNotes}>
            {decision.notes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 className={styles.sectionHeading}>Structured page preview</h3>
        <div className={styles.previewControls}>
          {composedPage.controls.map((c) => {
            if (!c.visible) {
              return (
                <div key={c.slot} className={styles.previewControlHidden}>
                  <strong>{c.slot}</strong> · hidden ({(c as { reason?: string }).reason ?? 'suppressed'})
                </div>
              );
            }
            switch (c.slot) {
              case 'banner': {
                const b = c as BannerControlPayload;
                return (
                  <div key={c.slot} className={styles.previewControl}>
                    <strong>banner</strong>
                    <div>title: {b.title}</div>
                    <div>image: <code>{b.imageUrl}</code></div>
                    <div>alt: {b.imageAltText}</div>
                  </div>
                );
              }
              case 'subhead':
              case 'body': {
                const t = c as TextControlPayload;
                return (
                  <div key={c.slot} className={styles.previewControl}>
                    <strong>{c.slot}</strong>
                    <div className={styles.previewSnippet}>{t.text.slice(0, 200)}{t.text.length > 200 ? '…' : ''}</div>
                  </div>
                );
              }
              case 'team': {
                const t = c as TeamViewerControlPayload;
                return (
                  <div key={c.slot} className={styles.previewControl}>
                    <strong>team</strong>
                    <div>heading: {t.properties.heading}</div>
                    <div>layout: {t.properties.layout} · density: {t.properties.density}</div>
                    <div>articleId: <code>{t.properties.articleId}</code></div>
                  </div>
                );
              }
              case 'gallery': {
                const g = c as ImageGalleryControlPayload;
                return (
                  <div key={c.slot} className={styles.previewControl}>
                    <strong>gallery</strong>
                    <div>layout: {g.layoutProfile}</div>
                    <div>{g.images.length} image{g.images.length === 1 ? '' : 's'}</div>
                  </div>
                );
              }
            }
            return null;
          })}
        </div>
      </section>
    </div>
  );
}

function Dt({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.dtRow}>
      <dt className={styles.dtLabel}>{label}</dt>
      <dd className={styles.dtValue}>{value}</dd>
    </div>
  );
}
