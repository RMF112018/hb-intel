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
  isDestinationSupported,
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

export function unsupportedDestinationNotice(
  destination: Destination,
): string | undefined {
  if (isDestinationSupported(destination)) {
    return undefined;
  }
  return (
    `Unsupported destination notice: '${destination}' is read-compatible only in this surface. ` +
    'Editing and publish actions are disabled here until that destination pipeline is implemented.'
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

/**
 * Order the left draft rail surfaces groups in. The editorial rail
 * presents drafts first, then in-review, then approved, then published;
 * archived and withdrawn follow as collapsed-by-default residual groups.
 *
 * Legacy `scheduled` is intentionally omitted from rail groups — no
 * scheduled executor exists today; legacy rows remain read-compatible
 * only and surface through `scheduledLegacyStateNotice` on the canvas
 * when an author opens one.
 */
const DRAFT_GROUP_ORDER: readonly WorkflowState[] = [
  'draft',
  'review',
  'approved',
  'published',
  'archived',
  'withdrawn',
];

/**
 * Author-facing outcome labels for workflow states. Authors never see
 * raw enum tokens; these labels carry the same meaning expressed as
 * editorial outcomes.
 */
const WORKFLOW_OUTCOME_LABELS: Record<WorkflowState, string> = {
  draft: 'Draft',
  review: 'Awaiting review',
  approved: 'Approved',
  scheduled: 'Scheduled (legacy)',
  published: 'Published',
  archived: 'Archived',
  withdrawn: 'Withdrawn',
};

const DRAFT_GROUP_LABELS: Record<WorkflowState, string> = {
  draft: 'Drafts',
  review: 'In review',
  approved: 'Approved',
  scheduled: 'Scheduled (legacy)',
  published: 'Recently published',
  archived: 'Archived',
  withdrawn: 'Withdrawn',
};

const DRAFT_GROUP_EMPTY_COPY: Record<WorkflowState, string> = {
  draft: 'No drafts yet. Start a new Project Spotlight to see it here.',
  review: 'No articles are awaiting review.',
  approved: 'No approved articles waiting to publish.',
  scheduled: 'No scheduled articles.',
  published: 'Published articles will appear here as you ship them.',
  archived: 'No archived articles.',
  withdrawn: 'No withdrawn articles.',
};

const COLLAPSED_GROUPS_BY_DEFAULT: ReadonlySet<WorkflowState> = new Set([
  'archived',
  'withdrawn',
]);

/**
 * Author-facing labels for workflow transitions. The state machine
 * still authorises transitions by enum identity; the rail simply
 * presents them as editorial outcomes instead of `→ approved` tokens.
 */
export function transitionActionLabel(to: WorkflowState): string {
  switch (to) {
    case 'draft':
      return 'Return to draft';
    case 'review':
      return 'Send for review';
    case 'approved':
      return 'Mark approved';
    case 'scheduled':
      return 'Mark scheduled (legacy)';
    case 'published':
      return 'Mark published';
    case 'archived':
      return 'Archive';
    case 'withdrawn':
      return 'Withdraw';
  }
}

interface DraftGroupMap {
  readonly draft: readonly PublisherArticleRow[];
  readonly review: readonly PublisherArticleRow[];
  readonly approved: readonly PublisherArticleRow[];
  readonly scheduled: readonly PublisherArticleRow[];
  readonly published: readonly PublisherArticleRow[];
  readonly archived: readonly PublisherArticleRow[];
  readonly withdrawn: readonly PublisherArticleRow[];
}

const EMPTY_DRAFT_GROUPS: DraftGroupMap = {
  draft: [],
  review: [],
  approved: [],
  scheduled: [],
  published: [],
  archived: [],
  withdrawn: [],
};

/**
 * Workspace section model — canonical order the center canvas renders.
 * The shell renders these as vertical, in-page-anchored sections, not
 * as tabs. The step-01 lock + step-02 layout are the source of truth.
 */
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

/**
 * Compose a single author-facing readiness sentence from repo-truth
 * signals. Never exposes raw enum tokens.
 */
function composeReadinessSummary(
  draft: PublisherArticleRow | undefined,
  binding: PublisherPageBindingRow | undefined,
  preview: PreviewOutcome | undefined,
  validation: { readonly ok: boolean; readonly errors: readonly { readonly message: string }[]; readonly warnings: readonly { readonly message: string }[] } | undefined,
): string {
  if (!draft) return 'Pick a draft to see readiness.';
  const outcome = WORKFLOW_OUTCOME_LABELS[draft.WorkflowState];
  if (validation && !validation.ok) {
    const n = validation.errors.length;
    return `${outcome} — ${n} blocking issue${n === 1 ? '' : 's'} to resolve before publishing.`;
  }
  if (!binding) {
    return `${outcome} — publishing will create the Project Spotlight page.`;
  }
  if (preview && preview.ok && preview.drift.templateKeyDrift) {
    return `${outcome} — republishing will regenerate the destination page.`;
  }
  if (
    preview && preview.ok &&
    (preview.drift.shellVersionDrift || preview.drift.templateVersionDrift)
  ) {
    return `${outcome} — republishing will update the existing page in place.`;
  }
  return `${outcome} — binding is healthy.`;
}

/**
 * Author-facing binding signal. Replaces the raw `binding <PublishStatus>`
 * badge with a single editorial sentence.
 */
function composeBindingSignal(
  binding: PublisherPageBindingRow | undefined,
  preview: PreviewOutcome | undefined,
): string {
  if (!binding) {
    return 'No destination page bound yet. Publishing will create the Project Spotlight page.';
  }
  if (preview && preview.ok && preview.drift.templateKeyDrift) {
    return 'Republishing will regenerate the destination page.';
  }
  if (
    preview && preview.ok &&
    (preview.drift.shellVersionDrift || preview.drift.templateVersionDrift)
  ) {
    return 'Republishing will update the existing page in place.';
  }
  return 'Destination page is bound and healthy.';
}

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

  const [groups, setGroups] = React.useState<DraftGroupMap>(EMPTY_DRAFT_GROUPS);
  const [groupsLoading, setGroupsLoading] = React.useState(false);
  const [groupsError, setGroupsError] = React.useState<string | undefined>();
  const [collapsedGroups, setCollapsedGroups] = React.useState<ReadonlySet<WorkflowState>>(
    () => new Set(COLLAPSED_GROUPS_BY_DEFAULT),
  );
  const [promotionRules, setPromotionRules] = React.useState<readonly PublisherPromotionRuleRow[]>([]);
  const [promotionPolicy, setPromotionPolicy] = React.useState<PromotionPolicyResult | undefined>();
  const [selectedArticleId, setSelectedArticleId] = React.useState<string | undefined>();
  const [articleDraft, setArticleDraft] = React.useState<PublisherArticleRow | undefined>();
  const [teamDraft, setTeamDraft] = React.useState<PublisherTeamMemberRow[]>([]);
  const [mediaDraft, setMediaDraft] = React.useState<PublisherMediaRow[]>([]);
  const [binding, setBinding] = React.useState<PublisherPageBindingRow | undefined>();
  const [resolutionContext, setResolutionContext] = React.useState<PublishResolutionContext | undefined>();
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

  const reloadGroups = React.useCallback(async () => {
    setGroupsLoading(true);
    setGroupsError(undefined);
    try {
      const results = await Promise.all(
        DRAFT_GROUP_ORDER.map((state) =>
          repositories.articles.listByWorkflowState(state, {
            destinations: SUPPORTED_DESTINATIONS,
          }),
        ),
      );
      // Defense-in-depth: this surface is project-spotlight scoped.
      const next: DraftGroupMap = { ...EMPTY_DRAFT_GROUPS };
      DRAFT_GROUP_ORDER.forEach((state, i) => {
        const rows = results[i]!.filter((row) => isDestinationSupported(row.Destination));
        (next as Record<WorkflowState, readonly PublisherArticleRow[]>)[state] = rows;
      });
      setGroups(next);
    } catch (err) {
      setGroupsError(err instanceof Error ? err.message : 'Failed to load articles.');
    } finally {
      setGroupsLoading(false);
    }
  }, [repositories]);

  React.useEffect(() => {
    void reloadGroups();
  }, [reloadGroups]);

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
          const unsupportedDestinationMessage = unsupportedDestinationNotice(
            article.Destination,
          );
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
          setStatus(
            unsupportedDestinationMessage ??
              (ctx.ok ? undefined : ctx.message),
          );
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

  // Preview composition is part of continuous readiness now, not a
  // tab activation. Recompose whenever the selected article changes
  // so the preview section and readiness rail stay in sync with the
  // canvas without the author having to click through.
  React.useEffect(() => {
    if (selectedArticleId) {
      void loadPreview(selectedArticleId);
    } else {
      setPreview(undefined);
    }
  }, [selectedArticleId, loadPreview]);

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
      await reloadGroups();
      await reloadSelected(policyApplied.ArticleId);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setBusy(false);
    }
  }, [articleDraft, teamDraft, mediaDraft, repositories, reloadGroups, reloadSelected, applyPromotionPolicy]);

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
        await reloadGroups();
        await reloadSelected(articleDraft.ArticleId);
      } catch (err) {
        setStatus(err instanceof Error ? err.message : 'Transition failed.');
      } finally {
        setBusy(false);
      }
    },
    [articleDraft, actorEmail, orchestrator, repositories, reloadGroups, reloadSelected],
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
  const unsupportedDestinationMessage = articleDraft
    ? unsupportedDestinationNotice(articleDraft.Destination)
    : undefined;
  const unsupportedDestinationLoaded = !!unsupportedDestinationMessage;

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

  const toggleGroupCollapsed = (state: WorkflowState) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(state)) next.delete(state);
      else next.add(state);
      return next;
    });
  };

  const readinessSummary = composeReadinessSummary(
    articleDraft,
    binding,
    preview,
    latestValidation,
  );
  const bindingSignal = articleDraft ? composeBindingSignal(binding, preview) : undefined;
  const workflowOutcomeLabel = articleDraft
    ? WORKFLOW_OUTCOME_LABELS[articleDraft.WorkflowState]
    : undefined;
  const hasAnyArticles = DRAFT_GROUP_ORDER.some((state) => groups[state].length > 0);

  const publishEnabled =
    !!articleDraft &&
    !busy &&
    !unsupportedDestinationLoaded &&
    articleDraft.WorkflowState === 'approved' &&
    !publishBlockedByValidation;
  const republishEnabled =
    !!articleDraft &&
    !busy &&
    !unsupportedDestinationLoaded &&
    !!binding &&
    !publishBlockedByValidation;
  const saveEnabled = !!articleDraft && !busy && !unsupportedDestinationLoaded;

  return (
    <div className={styles.workspace} aria-label="Article Publisher workspace">
      {/* ── Left draft rail ──────────────────────────────────── */}
      <aside className={styles.draftRail} aria-label="Drafts and recent articles">
        <header className={styles.draftRailHeader}>
          <div className={styles.draftRailTitle}>Your articles</div>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={handleCreateNew}
          >
            Start new draft
          </button>
        </header>

        {groupsError ? (
          <div className={styles.railError} role="alert">
            <div>{groupsError}</div>
            <button type="button" className={styles.linkBtn} onClick={() => void reloadGroups()}>
              Try again
            </button>
          </div>
        ) : groupsLoading && !hasAnyArticles ? (
          <div className={styles.railLoading}>
            <HbcSpinner />
          </div>
        ) : !hasAnyArticles ? (
          <HbcEmptyState
            title="No articles yet"
            description="Start your first Project Spotlight to see it here."
          />
        ) : (
          <div className={styles.draftGroups}>
            {DRAFT_GROUP_ORDER.map((state) => {
              const rows = groups[state];
              const collapsed = collapsedGroups.has(state);
              const groupId = `draft-group-${state}`;
              return (
                <section key={state} className={styles.draftGroup} aria-labelledby={groupId}>
                  <button
                    type="button"
                    id={groupId}
                    className={styles.draftGroupHeader}
                    aria-expanded={!collapsed}
                    onClick={() => toggleGroupCollapsed(state)}
                  >
                    <span className={styles.draftGroupLabel}>
                      {DRAFT_GROUP_LABELS[state]}
                    </span>
                    <span className={styles.draftGroupCount}>{rows.length}</span>
                  </button>
                  {!collapsed && (
                    rows.length === 0 ? (
                      <p className={styles.draftGroupEmpty}>
                        {DRAFT_GROUP_EMPTY_COPY[state]}
                      </p>
                    ) : (
                      <ul className={styles.draftList}>
                        {rows.map((a) => {
                          const isActive = a.ArticleId === selectedArticleId;
                          const displayTitle = a.Title?.trim() || 'Untitled draft';
                          const displayProject = a.ProjectName?.trim() || 'No project linked yet';
                          return (
                            <li key={a.ArticleId}>
                              <button
                                type="button"
                                className={`${styles.draftRow} ${isActive ? styles.draftRowActive : ''}`}
                                aria-current={isActive ? 'true' : undefined}
                                onClick={() => setSelectedArticleId(a.ArticleId)}
                              >
                                <div className={styles.draftRowTitle}>{displayTitle}</div>
                                <div className={styles.draftRowMeta}>{displayProject}</div>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )
                  )}
                </section>
              );
            })}
          </div>
        )}
      </aside>

      {/* ── Center authoring canvas ─────────────────────────── */}
      <main className={styles.canvas} aria-label="Article authoring canvas">
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
              {workflowOutcomeLabel && (
                <span className={styles.outcomeChip}>{workflowOutcomeLabel}</span>
              )}
            </header>

            {scheduledLegacyStateNotice(articleDraft.WorkflowState) && (
              <p className={styles.canvasNotice}>
                {scheduledLegacyStateNotice(articleDraft.WorkflowState)}
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
                <ContentPanel draft={articleDraft} onChange={setArticleDraft} />
              </div>
            </section>

            <section id="section-media" className={styles.section}>
              <header className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Media</h3>
                <p className={styles.sectionIntent}>Add supporting media beyond the hero.</p>
              </header>
              <div className={styles.sectionBody}>
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
                <TeamPanel
                  articleId={articleDraft.ArticleId}
                  rows={teamDraft}
                  onChange={setTeamDraft}
                />
              </div>
            </section>

            <section id="section-promotion" className={styles.section}>
              <header className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Promotion</h3>
                <p className={styles.sectionIntent}>Review how promotion policy applies.</p>
              </header>
              <div className={styles.sectionBody}>
                {promotionPolicy ? (
                  <p className={styles.sectionCopy}>
                    {promotionLockStatusText(promotionPolicy)}
                  </p>
                ) : (
                  <p className={styles.sectionCopy}>
                    Promotion policy will be resolved from the article's destination and content type.
                  </p>
                )}
              </div>
            </section>

            <section id="section-destination" className={styles.section}>
              <header className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Destination binding</h3>
                <p className={styles.sectionIntent}>Confirm template and destination page binding.</p>
              </header>
              <div className={styles.sectionBody}>
                <StatusPanel binding={binding} context={resolutionContext} />
              </div>
            </section>

            <section id="section-preview" className={styles.section}>
              <header className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Preview</h3>
                <p className={styles.sectionIntent}>See how the article will publish.</p>
              </header>
              <div className={styles.sectionBody}>
                <PreviewPanel outcome={preview} loading={previewLoading} />
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

            <section className={styles.readinessBlock} aria-label="Primary actions">
              <p className={styles.readinessHeading}>Actions</p>
              <div className={styles.readinessActionGroup}>
                <button
                  type="button"
                  className={styles.primaryBtn}
                  disabled={!publishEnabled}
                  title={
                    publishBlockedByValidation && firstBlockingError
                      ? `Blocked: ${firstBlockingError}`
                      : undefined
                  }
                  onClick={() => handlePublishAction('create')}
                >
                  Publish
                </button>
                <button
                  type="button"
                  className={styles.btn}
                  disabled={!republishEnabled}
                  title={
                    publishBlockedByValidation && firstBlockingError
                      ? `Blocked: ${firstBlockingError}`
                      : undefined
                  }
                  onClick={() => handlePublishAction('republish')}
                >
                  Republish
                </button>
                <button
                  type="button"
                  className={styles.btn}
                  disabled={!saveEnabled}
                  onClick={handleSave}
                >
                  Save draft
                </button>
                <button
                  type="button"
                  className={styles.btn}
                  disabled={!saveEnabled}
                  onClick={() => handlePublishAction('preview')}
                >
                  Recompose preview
                </button>
              </div>
            </section>

            {validNextStates.length > 0 && (
              <section className={styles.readinessBlock} aria-label="Workflow transitions">
                <p className={styles.readinessHeading}>Move this article</p>
                <div className={styles.readinessActionGroup}>
                  {validNextStates
                    .filter((to) => to !== 'archived' && to !== 'withdrawn')
                    .map((to) => (
                      <button
                        key={to}
                        type="button"
                        className={styles.btn}
                        disabled={busy || unsupportedDestinationLoaded}
                        onClick={() => handleTransition(to)}
                      >
                        {transitionActionLabel(to)}
                      </button>
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
                      <button
                        key={to}
                        type="button"
                        className={styles.dangerBtn}
                        disabled={busy || unsupportedDestinationLoaded}
                        onClick={() => handleTransition(to)}
                      >
                        {transitionActionLabel(to)}
                      </button>
                    ))}
                  {validNextStates
                    .filter((to) => to === 'archived')
                    .map((to) => (
                      <button
                        key={to}
                        type="button"
                        className={styles.dangerBtn}
                        disabled={busy || unsupportedDestinationLoaded}
                        onClick={() => handleTransition(to)}
                      >
                        {transitionActionLabel(to)}
                      </button>
                    ))}
                </div>
              </section>
            )}

            {(status || busy) && (
              <section className={styles.readinessBlock} aria-label="Last action status" aria-live="polite">
                {busy && <HbcSpinner />}
                {status && <p className={styles.readinessStatus}>{status}</p>}
              </section>
            )}
          </>
        )}
      </aside>
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
        description="Add content above to compose a structural preview of the article."
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
