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
  ARTICLE_CONTENT_TYPE_VALUES,
  ARTICLE_SUBJECT_VALUES,
  SUPPORTED_DESTINATIONS,
  HERO_THEME_VARIANT_VALUES,
  PROJECT_STAGE_VALUES,
  SPOTLIGHT_TYPE_VALUES,
  WORKFLOW_STATE_VALUES,
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
  type ProjectStage,
  type PublishResolutionContext,
  type PublishOutcome,
  type PublisherPromotionRuleRow,
  type PublisherWorkflowHistoryRow,
  selectPromotionDefaults,
  type PromotionDefaults,
  resolveTemplate,
} from '../../homepage/data/publisherAdapter/index.js';
import { buildPublishResolutionContext } from '../../homepage/data/publisherAdapter/publishResolutionContext.js';
import {
  canTransition,
  validTransitionsFrom,
} from '../../homepage/data/publisherAdapter/workflowStateMachine.js';
import { buildPublisherPreview } from '../../homepage/data/publisherAdapter/preview/previewBuilder.js';
import type { PreviewOutcome } from '../../homepage/data/publisherAdapter/preview/previewBuilder.js';
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

/**
 * Build a blank authoring draft for a brand-new article.
 *
 * `TemplateKey` is intentionally blank on the IN-MEMORY draft —
 * the tenant `HB Articles.TemplateKey` column is required, so the
 * save path (`handleSave`) runs the deterministic template
 * resolver against the active registry and stamps a real key
 * before the first upsert. Blank is therefore a transient
 * authoring state only; persisted list rows always carry a
 * non-empty TemplateKey. Seeding a hard-coded key here would
 * short-circuit resolver selection and make the registry
 * performative (P1-2 closure). Operators who want a specific
 * template supply one via the authoring surface's TemplateKey
 * field, which the resolver honors as an explicit admin override.
 */
function emptyArticle(promotion: PromotionDefaults): PublisherArticleRow {
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
    // Promotion-rule effect (Phase-02 Prompt-08): a tenant rule
    // matching (Destination, ArticleContentType) seeds these
    // defaults; when the rule disallows manual override the
    // authoring surface locks the toggles below.
    IsFeatured: promotion.featured,
    IsPinned: promotion.pinned,
  };
}

function newHistoryRow(
  articleId: string,
  title: string,
  from: WorkflowState | undefined,
  to: WorkflowState,
  actor: string | undefined,
  note: string | undefined,
): PublisherWorkflowHistoryRow {
  return {
    HistoryId: `hst-${Date.now()}-${Math.floor(Math.random() * 1e6).toString(36)}`,
    ArticleId: articleId,
    Title: title,
    NewState: to,
    PreviousState: from,
    ActorEmail: actor,
    ActionDateUtc: nowIso(),
    ActionNote: note && note.trim().length > 0 ? note.trim() : undefined,
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
    [repositories],
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

  // Load active promotion rules once at mount; they seed authoring
  // defaults (FeaturedDefault / PinnedDefault) on new articles and
  // gate manual override of the IsFeatured / IsPinned toggles.
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
    const promotion = selectPromotionDefaults(
      promotionRules,
      'projectSpotlight',
      'monthlySpotlight',
    );
    // No hard-coded TemplateKey — the resolver selects based on the
    // article's Destination + ContentType + applicability when the
    // operator leaves the override blank. Closes P1-2.
    const draft = emptyArticle(promotion);
    setArticleDraft(draft);
    setTeamDraft([]);
    setMediaDraft([]);
    setBinding(undefined);
    setResolutionContext(undefined);
    setSelectedArticleId(draft.ArticleId);
    setTab('metadata');
  }, []);

  const handleSave = React.useCallback(async () => {
    if (!articleDraft) return;
    setBusy(true);
    setStatus('Saving…');
    try {
      // Contract: persisted `HB Articles` rows always carry a
      // non-empty TemplateKey. The editor lets a new draft start
      // with a blank TemplateKey as a transient authoring state,
      // and the save path runs the deterministic resolver against
      // the active template registry to stamp a real key before
      // upsert. Blank-means-auto-select stays a UI convenience;
      // the list row never stores blank. Closes the TemplateKey
      // contract contradiction (Phase-05 Prompt-01).
      let resolvedTemplateKey = articleDraft.TemplateKey;
      if (!resolvedTemplateKey || resolvedTemplateKey.trim().length === 0) {
        const registry = await repositories.templateRegistry.listActive();
        const resolution = resolveTemplate(
          {
            TemplateKey: undefined,
            ArticleContentType: articleDraft.ArticleContentType,
            Destination: articleDraft.Destination,
            SpotlightType: articleDraft.SpotlightType,
            ProjectStage: articleDraft.ProjectStage,
            ArticleSubject: articleDraft.ArticleSubject,
          },
          registry,
        );
        if (!resolution.ok) {
          setStatus(
            `Save blocked — could not resolve a template for this article (${resolution.reason}). ${resolution.message}`,
          );
          return;
        }
        resolvedTemplateKey = resolution.entry.TemplateKey;
      }
      const updated: PublisherArticleRow = {
        ...articleDraft,
        TemplateKey: resolvedTemplateKey,
        UpdatedDateUtc: nowIso(),
      };
      await repositories.articles.upsert(updated);
      await repositories.teamMembers.replaceAllForArticle(updated.ArticleId, teamDraft);
      await repositories.media.replaceAllForArticle(updated.ArticleId, mediaDraft);
      setArticleDraft(updated);
      setStatus('Saved.');
      await reloadList();
      await reloadSelected(updated.ArticleId);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setBusy(false);
    }
  }, [articleDraft, teamDraft, mediaDraft, repositories, reloadList, reloadSelected]);

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
          // `published` is intentionally unreachable here — it is
          // produced exclusively by the publish orchestrator after
          // page creation + binding closure. Generic transitions
          // never stamp `PublishedDateUtc` themselves.
          const updated: PublisherArticleRow = {
            ...articleDraft,
            WorkflowState: to,
            UpdatedDateUtc: nowIso(),
          };
          await repositories.articles.upsert(updated);
          await repositories.workflowHistory.append(
            newHistoryRow(
              updated.ArticleId,
              updated.Title,
              from,
              to,
              actorEmail ?? articleDraft.AuthorEmail,
              undefined,
            ),
          );
          setStatus(`Now in ${to}.`);
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
            {WORKFLOW_STATE_VALUES.map((s) => (
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
                <MetadataPanel draft={articleDraft} onChange={setArticleDraft} />
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

function update<T extends keyof PublisherArticleRow>(
  draft: PublisherArticleRow,
  key: T,
  value: PublisherArticleRow[T],
): PublisherArticleRow {
  return { ...draft, [key]: value };
}

function MetadataPanel({ draft, onChange }: PanelProps) {
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
      <Field label="Article content type">
        <select
          className={styles.select}
          value={draft.ArticleContentType}
          onChange={(e) =>
            onChange(update(draft, 'ArticleContentType', e.target.value as ArticleContentType))
          }
        >
          {ARTICLE_CONTENT_TYPE_VALUES.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </Field>
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
      <Field label="Project ID">
        <input
          className={styles.input}
          value={draft.ProjectId ?? ''}
          onChange={(e) => onChange(update(draft, 'ProjectId', e.target.value || undefined))}
        />
      </Field>
      <Field label="Project name">
        <input
          className={styles.input}
          value={draft.ProjectName ?? ''}
          onChange={(e) => onChange(update(draft, 'ProjectName', e.target.value || undefined))}
        />
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
                    replaceAt(i, {
                      ...r,
                      PersonPrincipal: e.target.value,
                      // Drop any previously-resolved user id — the
                      // principal has changed, so the writer must
                      // re-resolve via ensureUser before the next
                      // save instead of carrying a stale id forward.
                      PersonPrincipalId: undefined,
                    })
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
