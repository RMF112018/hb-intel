/**
 * Project Spotlight Publisher — authoring surface (v1).
 *
 * Hosted on the HBCentral publisher page. Ownership:
 *   - Reads publisher lists from HBCentral through `createPublisherRepositories()`
 *   - Writes master / child records + workflow history through the same repository factory
 *   - Orchestrates publish / republish / preview through `createPublishOrchestrator`
 *
 * Scope (v1, prompt-06 discipline: "avoid over-designing"):
 *   - Post list (filter by workflow state) → select → load detail.
 *   - Post detail form: master fields the architecture marks MVP=Yes.
 *   - Team + media tabs: add / remove / reorder rows; save = replaceAllForPost.
 *   - Template + binding status panel: read-only, driven by the service layer.
 *   - Workflow action bar: transitions guarded by the pure state machine,
 *     publish / republish / preview delegated to the orchestrator.
 *
 * Deliberately out of v1:
 *   - Rich-text editors (plain <textarea> for body/subhead; authors can paste
 *     HTML knowing the compositor passes it through unchanged).
 *   - Inline scheduled-publish UI (blocking unknown #6).
 *   - Visual preview of the final rendered page (preview returns the composed
 *     control payloads; full page-canvas rendering is Wave 7).
 */
import * as React from 'react';
import { HbcEmptyState, HbcSpinner } from '@hbc/ui-kit/homepage';
import { fetchRequestDigest, storeSiteUrl } from '@hbc/sharepoint-platform';
import {
  ARTICLE_SUBJECT_VALUES,
  BANNER_THEME_VARIANT_VALUES,
  createPublisherRepositories,
  createDefaultPublishOrchestrator,
  createSharePointPageBindingWriter,
  POST_FAMILY_VALUES,
  PROJECT_STAGE_VALUES,
  SPOTLIGHT_TYPE_VALUES,
  TEAM_VIEWER_DENSITY_VALUES,
  TEAM_VIEWER_LAYOUT_VALUES,
  WORKFLOW_STATE_VALUES,
  createSharePointPageCreationService,
  type PublisherMediaRow,
  type PublisherPageBindingRow,
  type PublisherPostRow,
  type PublisherRepositories,
  type PublisherTeamMemberRow,
  type WorkflowHistoryAction,
  type WorkflowState,
  type MediaRole,
  type PostFamily,
  type SpotlightType,
  type ProjectStage,
  type ArticleSubject,
  type BannerThemeVariant,
  type TeamViewerLayout,
  type TeamViewerDensity,
  type PublishResolutionContext,
  type PublishOutcome,
  type PublisherWorkflowHistoryRow,
} from '../../homepage/data/publisherAdapter/index.js';
import { buildPublishResolutionContext } from '../../homepage/data/publisherAdapter/publishResolutionContext.js';
import {
  canTransition,
  historyActionFor,
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
import styles from './project-spotlight-publisher.module.css';

// Convenience aliases so the JSX stays compact.
const MEDIA_ROLES: readonly MediaRole[] = ['gallery', 'supporting', 'hero', 'secondary'];

/* ── Props ──────────────────────────────────────────────────── */

export interface ProjectSpotlightPublisherProps {
  /** HBCentral absolute URL. Platform `storeSiteUrl` is invoked with this. */
  siteUrl?: string;
  /** When set, overrides the default repository factory (tests only). */
  repositoriesOverride?: PublisherRepositories;
}

/* ── Helpers ────────────────────────────────────────────────── */

function nowIso(): string {
  return new Date().toISOString();
}

function emptyPost(templateKey: string, pageShellKey: string): PublisherPostRow {
  const id = `post-${Date.now()}-${Math.floor(Math.random() * 1e6)
    .toString(36)
    .padStart(4, '0')}`;
  return {
    PostId: id,
    Title: 'Untitled spotlight',
    Subhead: '',
    SummaryExcerpt: '',
    BodyRichText: '',
    PostFamily: 'monthlySpotlight',
    TemplateKey: templateKey,
    PageShellKey: pageShellKey,
    Slug: id,
    WorkflowState: 'draft',
    CreatedDateUtc: nowIso(),
    UpdatedDateUtc: nowIso(),
    ProjectId: '',
    ProjectName: '',
    BannerImageUrl: '',
    BannerImageAltText: '',
    TargetSiteUrl: 'https://hedrickbrotherscom.sharepoint.com/sites/ProjectSpotlight',
    TargetSiteKey: 'projectSpotlight',
    SourceTemplatePath: 'SitePages/Templates/Project-Spotlight---In-Progress.aspx',
  };
}

function newHistoryRow(
  postId: string,
  from: WorkflowState | undefined,
  to: WorkflowState,
  actor: string | undefined,
  note: string | undefined,
): PublisherWorkflowHistoryRow {
  const action: WorkflowHistoryAction = historyActionFor(from ?? to, to);
  return {
    HistoryId: `hst-${Date.now()}-${Math.floor(Math.random() * 1e6).toString(36)}`,
    PostId: postId,
    FromState: from,
    ToState: to,
    Action: action,
    ActorEmail: actor,
    ActionDateUtc: nowIso(),
    Note: note && note.trim().length > 0 ? note.trim() : undefined,
  };
}

/* ── Component ──────────────────────────────────────────────── */

type Tab = 'metadata' | 'banner' | 'content' | 'team' | 'gallery' | 'preview' | 'status';

export function ProjectSpotlightPublisher({
  siteUrl,
  repositoriesOverride,
}: ProjectSpotlightPublisherProps) {
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
  const [posts, setPosts] = React.useState<readonly PublisherPostRow[]>([]);
  const [postsLoading, setPostsLoading] = React.useState(false);
  const [selectedPostId, setSelectedPostId] = React.useState<string | undefined>();
  const [postDraft, setPostDraft] = React.useState<PublisherPostRow | undefined>();
  const [teamDraft, setTeamDraft] = React.useState<PublisherTeamMemberRow[]>([]);
  const [mediaDraft, setMediaDraft] = React.useState<PublisherMediaRow[]>([]);
  const [binding, setBinding] = React.useState<PublisherPageBindingRow | undefined>();
  const [resolutionContext, setResolutionContext] = React.useState<PublishResolutionContext | undefined>();
  const [tab, setTab] = React.useState<Tab>('metadata');
  const [status, setStatus] = React.useState<string | undefined>();
  const [busy, setBusy] = React.useState(false);
  const [preview, setPreview] = React.useState<PreviewOutcome | undefined>();
  const [previewLoading, setPreviewLoading] = React.useState(false);

  // Load the post list for the current filter.
  const reloadList = React.useCallback(async () => {
    setPostsLoading(true);
    try {
      const rows = await repositories.posts.listByWorkflowState(filter);
      setPosts(rows);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Failed to load posts.');
    } finally {
      setPostsLoading(false);
    }
  }, [repositories, filter]);

  React.useEffect(() => {
    void reloadList();
  }, [reloadList]);

  // Load the selected post + child rows + binding + resolution context.
  const reloadSelected = React.useCallback(
    async (postId: string) => {
      setBusy(true);
      try {
        const [post, team, media, bindingRow] = await Promise.all([
          repositories.posts.getByPostId(postId),
          repositories.teamMembers.listByPost(postId),
          repositories.media.listByPost(postId),
          repositories.pageBindings.getByPostId(postId),
        ]);
        if (post) {
          setPostDraft(post);
          setTeamDraft(team.slice());
          setMediaDraft(media.slice());
          setBinding(bindingRow);
          const ctx = await buildPublishResolutionContext(repositories, postId);
          setResolutionContext(ctx.ok ? ctx.context : undefined);
          setStatus(ctx.ok ? undefined : ctx.message);
        }
      } catch (err) {
        setStatus(err instanceof Error ? err.message : 'Failed to load post.');
      } finally {
        setBusy(false);
      }
    },
    [repositories],
  );

  React.useEffect(() => {
    if (selectedPostId) void reloadSelected(selectedPostId);
  }, [selectedPostId, reloadSelected]);

  const loadPreview = React.useCallback(
    async (postId: string) => {
      setPreviewLoading(true);
      try {
        const outcome = await buildPublisherPreview(repositories, postId);
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
    // Refresh the preview whenever the Preview tab opens or the selected
    // post changes. `loadPreview` reads the latest repository + post data,
    // so stale preview content after a Save is cleared on re-entry.
    if (tab === 'preview' && selectedPostId) {
      void loadPreview(selectedPostId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, selectedPostId]);

  const handleCreateNew = React.useCallback(() => {
    const draft = emptyPost('ps-inprogress-monthly-v1', 'ps-shell-inprogress-oob-banner-team-gallery-v1');
    setPostDraft(draft);
    setTeamDraft([]);
    setMediaDraft([]);
    setBinding(undefined);
    setResolutionContext(undefined);
    setSelectedPostId(draft.PostId);
    setTab('metadata');
  }, []);

  const handleSave = React.useCallback(async () => {
    if (!postDraft) return;
    setBusy(true);
    setStatus('Saving…');
    try {
      const updated = { ...postDraft, UpdatedDateUtc: nowIso() };
      await repositories.posts.upsert(updated);
      await repositories.teamMembers.replaceAllForPost(updated.PostId, teamDraft);
      await repositories.media.replaceAllForPost(updated.PostId, mediaDraft);
      setStatus('Saved.');
      await reloadList();
      await reloadSelected(updated.PostId);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setBusy(false);
    }
  }, [postDraft, teamDraft, mediaDraft, repositories, reloadList, reloadSelected]);

  const handleTransition = React.useCallback(
    async (to: WorkflowState) => {
      if (!postDraft) return;
      const from = postDraft.WorkflowState;
      if (!canTransition(from, to)) {
        setStatus(`Cannot transition from ${from} to ${to}.`);
        return;
      }
      setBusy(true);
      setStatus(`Transitioning to ${to}…`);
      try {
        const updated: PublisherPostRow = {
          ...postDraft,
          WorkflowState: to,
          UpdatedDateUtc: nowIso(),
          PublishedDateUtc: to === 'published' ? nowIso() : postDraft.PublishedDateUtc,
          ArchiveDateUtc: to === 'archived' ? nowIso() : postDraft.ArchiveDateUtc,
        };
        await repositories.posts.upsert(updated);
        await repositories.workflowHistory.append(
          newHistoryRow(updated.PostId, from, to, postDraft.AuthorEmail, undefined),
        );
        setStatus(`Now in ${to}.`);
        await reloadList();
        await reloadSelected(updated.PostId);
      } catch (err) {
        setStatus(err instanceof Error ? err.message : 'Transition failed.');
      } finally {
        setBusy(false);
      }
    },
    [postDraft, repositories, reloadList, reloadSelected],
  );

  const handlePublishAction = React.useCallback(
    async (mode: 'create' | 'republish' | 'preview') => {
      if (!postDraft) return;
      setBusy(true);
      setStatus(`${mode === 'preview' ? 'Composing preview' : mode === 'create' ? 'Publishing' : 'Republishing'}…`);
      try {
        const outcome: PublishOutcome = await orchestrator.run({
          postId: postDraft.PostId,
          mode,
        });
        if (outcome.ok) {
          setStatus(
            `${mode} ok — action=${outcome.action}, reason=${outcome.reason}${
              outcome.pageUrl ? ` · ${outcome.pageUrl}` : ''
            }`,
          );
          if (mode !== 'preview') await reloadSelected(postDraft.PostId);
        } else {
          setStatus(`${mode} failed at ${outcome.stage}: ${outcome.message}`);
        }
      } catch (err) {
        setStatus(err instanceof Error ? err.message : `${mode} failed.`);
      } finally {
        setBusy(false);
      }
    },
    [postDraft, orchestrator, reloadSelected],
  );

  const validNextStates = postDraft ? validTransitionsFrom(postDraft.WorkflowState) : [];

  const latestValidation =
    preview && preview.ok ? preview.validation : undefined;
  const publishBlockedByValidation =
    !!latestValidation && !latestValidation.ok;
  const firstBlockingError = latestValidation?.errors[0]?.message;
  const hasDrift =
    !!preview && preview.ok &&
    (preview.drift.shellKeyDrift ||
      preview.drift.shellVersionDrift ||
      preview.drift.templateKeyDrift ||
      preview.drift.templateVersionDrift);

  /* ── Rendering ──────────────────────────────────────────── */

  return (
    <div className={styles.shell}>
      <aside className={styles.listPane}>
        <header className={styles.listHeader}>
          <div className={styles.listTitle}>Project Spotlight posts</div>
          <button type="button" className={styles.primaryBtn} onClick={handleCreateNew}>
            New post
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
        {postsLoading ? (
          <HbcSpinner />
        ) : posts.length === 0 ? (
          <HbcEmptyState
            title="No posts"
            description={`No posts in state '${filter}' yet.`}
          />
        ) : (
          <ul className={styles.postList}>
            {posts.map((p) => (
              <li key={p.PostId}>
                <button
                  type="button"
                  className={`${styles.postRow} ${
                    p.PostId === selectedPostId ? styles.postRowActive : ''
                  }`}
                  onClick={() => setSelectedPostId(p.PostId)}
                >
                  <div className={styles.postRowTitle}>{p.Title}</div>
                  <div className={styles.postRowMeta}>
                    {p.PostFamily} · {p.ProjectName || '(no project)'}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>

      <main className={styles.editor}>
        {!postDraft ? (
          <HbcEmptyState
            title="Select or create a post"
            description="Choose a row from the left, or start a new draft."
          />
        ) : (
          <>
            <header className={styles.editorHeader}>
              <h2 className={styles.title}>{postDraft.Title || '(Untitled)'}</h2>
              <div className={styles.meta}>
                <span className={styles.stateBadge}>{postDraft.WorkflowState}</span>
                {binding && (
                  <span className={styles.bindingBadge}>binding {binding.BindingStatus}</span>
                )}
              </div>
            </header>

            <nav className={styles.tabs}>
              {(['metadata', 'banner', 'content', 'team', 'gallery', 'preview', 'status'] as Tab[]).map((t) => (
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
                  draft={postDraft}
                  onChange={setPostDraft}
                />
              )}
              {tab === 'banner' && (
                <BannerPanel draft={postDraft} onChange={setPostDraft} />
              )}
              {tab === 'content' && (
                <ContentPanel draft={postDraft} onChange={setPostDraft} />
              )}
              {tab === 'team' && (
                <TeamPanel
                  postId={postDraft.PostId}
                  rows={teamDraft}
                  onChange={setTeamDraft}
                />
              )}
              {tab === 'gallery' && (
                <GalleryPanel
                  postId={postDraft.PostId}
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
                  disabled={busy || postDraft.WorkflowState !== 'approved' || publishBlockedByValidation}
                  title={
                    publishBlockedByValidation && firstBlockingError
                      ? `Blocked by validation: ${firstBlockingError}`
                      : undefined
                  }
                  onClick={() => handlePublishAction('create')}
                >
                  Publish
                </button>
                {hasDrift && (
                  <span className={styles.driftChip} title="Shell or template drift detected">
                    ⚠ drift — will regenerate
                  </span>
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
  draft: PublisherPostRow;
  onChange: (next: PublisherPostRow) => void;
}

function update<T extends keyof PublisherPostRow>(
  draft: PublisherPostRow,
  key: T,
  value: PublisherPostRow[T],
): PublisherPostRow {
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
      <Field label="Post family">
        <select
          className={styles.select}
          value={draft.PostFamily}
          onChange={(e) =>
            onChange(update(draft, 'PostFamily', e.target.value as PostFamily))
          }
        >
          {POST_FAMILY_VALUES.map((v) => (
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
          value={draft.ProjectId}
          onChange={(e) => onChange(update(draft, 'ProjectId', e.target.value))}
        />
      </Field>
      <Field label="Project name">
        <input
          className={styles.input}
          value={draft.ProjectName}
          onChange={(e) => onChange(update(draft, 'ProjectName', e.target.value))}
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

function BannerPanel({ draft, onChange }: PanelProps) {
  return (
    <div className={styles.form}>
      <Field label="Banner image URL (required)">
        <input
          className={styles.input}
          value={draft.BannerImageUrl}
          onChange={(e) => onChange(update(draft, 'BannerImageUrl', e.target.value))}
        />
      </Field>
      <Field label="Banner alt text (required)">
        <textarea
          className={styles.textarea}
          value={draft.BannerImageAltText}
          onChange={(e) => onChange(update(draft, 'BannerImageAltText', e.target.value))}
        />
      </Field>
      <Field label="Banner title override">
        <input
          className={styles.input}
          value={draft.BannerTitleOverride ?? ''}
          onChange={(e) =>
            onChange(update(draft, 'BannerTitleOverride', e.target.value || undefined))
          }
        />
      </Field>
      <Field label="Eyebrow">
        <input
          className={styles.input}
          value={draft.BannerEyebrow ?? ''}
          onChange={(e) => onChange(update(draft, 'BannerEyebrow', e.target.value || undefined))}
        />
      </Field>
      <Field label="Theme variant">
        <select
          className={styles.select}
          value={draft.BannerThemeVariant ?? ''}
          onChange={(e) =>
            onChange(
              update(
                draft,
                'BannerThemeVariant',
                (e.target.value || undefined) as BannerThemeVariant | undefined,
              ),
            )
          }
        >
          <option value="">(default)</option>
          {BANNER_THEME_VARIANT_VALUES.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Show publish date">
        <input
          type="checkbox"
          checked={!!draft.BannerShowPublishDate}
          onChange={(e) => onChange(update(draft, 'BannerShowPublishDate', e.target.checked))}
        />
      </Field>
      <Field label="Show gradient">
        <input
          type="checkbox"
          checked={!!draft.BannerShowGradient}
          onChange={(e) => onChange(update(draft, 'BannerShowGradient', e.target.checked))}
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
      <Field label="Team section heading">
        <input
          className={styles.input}
          value={draft.TeamSectionHeading ?? ''}
          onChange={(e) =>
            onChange(update(draft, 'TeamSectionHeading', e.target.value || undefined))
          }
        />
      </Field>
      <Field label="Team layout">
        <select
          className={styles.select}
          value={draft.TeamViewerLayout ?? ''}
          onChange={(e) =>
            onChange(
              update(
                draft,
                'TeamViewerLayout',
                (e.target.value || undefined) as TeamViewerLayout | undefined,
              ),
            )
          }
        >
          <option value="">(default)</option>
          {TEAM_VIEWER_LAYOUT_VALUES.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Team density">
        <select
          className={styles.select}
          value={draft.TeamViewerDensity ?? ''}
          onChange={(e) =>
            onChange(
              update(
                draft,
                'TeamViewerDensity',
                (e.target.value || undefined) as TeamViewerDensity | undefined,
              ),
            )
          }
        >
          <option value="">(default)</option>
          {TEAM_VIEWER_DENSITY_VALUES.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Show gallery">
        <input
          type="checkbox"
          checked={draft.ShowGallery !== false}
          onChange={(e) => onChange(update(draft, 'ShowGallery', e.target.checked))}
        />
      </Field>
    </div>
  );
}

function TeamPanel({
  postId,
  rows,
  onChange,
}: {
  postId: string;
  rows: PublisherTeamMemberRow[];
  onChange: (next: PublisherTeamMemberRow[]) => void;
}) {
  const add = () =>
    onChange([
      ...rows,
      {
        PostId: postId,
        TeamMemberId: `tm-${Date.now()}-${rows.length}`,
        PersonPrincipal: '',
        DisplayName: '',
        SortOrder: rows.length + 1,
        IncludeInViewer: true,
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
                  onChange={(e) => replaceAt(i, { ...r, PersonPrincipal: e.target.value })}
                />
              </Field>
              <Field label="Job title">
                <input
                  className={styles.input}
                  value={r.JobTitle ?? ''}
                  onChange={(e) => replaceAt(i, { ...r, JobTitle: e.target.value || undefined })}
                />
              </Field>
              <Field label="Photo URL">
                <input
                  className={styles.input}
                  value={r.PhotoUrl ?? ''}
                  onChange={(e) => replaceAt(i, { ...r, PhotoUrl: e.target.value || undefined })}
                />
              </Field>
              <Field label="Include in viewer">
                <input
                  type="checkbox"
                  checked={r.IncludeInViewer !== false}
                  onChange={(e) => replaceAt(i, { ...r, IncludeInViewer: e.target.checked })}
                />
              </Field>
            </div>
            <div className={styles.rowActions}>
              <button type="button" className={styles.btn} onClick={() => move(i, -1)}>
                ↑
              </button>
              <button type="button" className={styles.btn} onClick={() => move(i, 1)}>
                ↓
              </button>
              <button type="button" className={styles.btn} onClick={() => removeAt(i)}>
                Remove
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function GalleryPanel({
  postId,
  rows,
  onChange,
}: {
  postId: string;
  rows: PublisherMediaRow[];
  onChange: (next: PublisherMediaRow[]) => void;
}) {
  const add = () =>
    onChange([
      ...rows,
      {
        PostId: postId,
        MediaId: `m-${Date.now()}-${rows.length}`,
        MediaRole: 'gallery',
        ImageAssetUrl: '',
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
              <Field label="Image URL">
                <input
                  className={styles.input}
                  value={r.ImageAssetUrl}
                  onChange={(e) => replaceAt(i, { ...r, ImageAssetUrl: e.target.value })}
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
            </div>
            <div className={styles.rowActions}>
              <button type="button" className={styles.btn} onClick={() => move(i, -1)}>
                ↑
              </button>
              <button type="button" className={styles.btn} onClick={() => move(i, 1)}>
                ↓
              </button>
              <button type="button" className={styles.btn} onClick={() => removeAt(i)}>
                Remove
              </button>
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
            description="Save the post so the template registry can resolve it."
          />
        ) : (
          <dl className={styles.dl}>
            <Dt label="Template" value={`${context.template.TemplateKey} @ ${context.template.TemplateVersion}`} />
            <Dt label="Shell" value={`${context.template.PageShellKey} @ ${context.template.PageShellVersion}`} />
            <Dt label="Selection rule" value={context.decisionTrace.selectionRule ?? '(unknown)'} />
            <Dt
              label="Allow in-place republish"
              value={context.template.AllowRepublishInPlace === false ? 'no' : 'yes'}
            />
            <Dt
              label="Force regeneration on shell change"
              value={context.template.ForceRegenerationOnShellChange ? 'yes' : 'no'}
            />
          </dl>
        )}
      </section>
      <section>
        <h3 className={styles.sectionHeading}>Page binding</h3>
        {!binding ? (
          <HbcEmptyState
            title="No binding yet"
            description="Publish this post to create a durable page binding."
          />
        ) : (
          <dl className={styles.dl}>
            <Dt label="Binding ID" value={binding.BindingId} />
            <Dt label="Status" value={binding.BindingStatus} />
            <Dt label="Page name" value={binding.PageName} />
            <Dt label="Page URL" value={binding.PageUrl ?? '(not yet set)'} />
            <Dt label="Shell" value={`${binding.PageShellKey} @ ${binding.PageShellVersion}`} />
            <Dt label="Template" value={`${binding.TemplateKey} @ ${binding.TemplateVersion}`} />
            <Dt label="Last operation" value={binding.LastOperation ?? '(none)'} />
            <Dt label="Last synced" value={binding.LastSuccessfulSyncDateUtc ?? '(none)'} />
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
  const driftLevel = drift.shellKeyDrift || drift.templateKeyDrift
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
            ? 'Shell / template identity has changed since the last publish. Publishing will regenerate the destination page.'
            : 'Shell or template version drift detected. Publishing will update the existing page in place (or regenerate if the template forces it).'}
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
