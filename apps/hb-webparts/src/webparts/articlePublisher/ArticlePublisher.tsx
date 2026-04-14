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
import { resolveSlugForSave } from './slugGovernance.js';
import { StoryBodyEditor, bodyTextSnippet } from './storyBodyEditor/index.js';
import {
  defaultTeamHeading,
  intelligentDefaultsForSave,
} from './metadataDefaults.js';
import {
  articleContentTypeLabel,
  articleSubjectLabel,
  destinationLabel,
  draftGroupEmptyCopy,
  draftGroupLabel,
  heroThemeVariantLabel,
  mediaRoleLabel,
  projectStageLabel,
  spotlightTypeLabel,
  teamViewerGroupingModeLabel,
  teamViewerModeLabel,
  teamViewerSortModeLabel,
  transitionActionLabel,
  workflowOutcomeLabel,
} from './authorLabels.js';
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
    // Slug is system-managed: it is regenerated from the title on
    // save via `resolveSlugForSave`. Seeding empty here keeps the
    // pre-save authoring shape honest about the system-owned field.
    Slug: '',
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

const COLLAPSED_GROUPS_BY_DEFAULT: ReadonlySet<WorkflowState> = new Set([
  'archived',
  'withdrawn',
]);

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
  const outcome = workflowOutcomeLabel(draft.WorkflowState);
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
 * Editorial promotion summary. Renders promotion policy state in
 * author language, replacing the admin-worded
 * `promotionLockStatusText` output inside the workspace canvas.
 * The admin wording remains exported for operational traces.
 */
function composePromotionSummary(
  policy: PromotionPolicyResult | undefined,
): readonly string[] {
  if (!policy) {
    return [
      'Promotion placement will be set automatically when the article type and destination are chosen.',
    ];
  }
  const feature = policy.featured
    ? 'be featured'
    : 'not be featured';
  const pin = policy.pinned ? 'pinned to the top of listings' : 'surface in the normal listing order';
  const lead = `This article will ${feature} and will ${pin}.`;
  if (policy.isLocked) {
    return [
      lead,
      'Promotion is locked by the current policy and applies automatically on save.',
    ];
  }
  return [
    lead,
    'Promotion defaults come from the current policy; they can be re-applied on save.',
  ];
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
      // Slug is system-managed. Collect every other article's slug
      // from the draft-rail groups (which are loaded on mount and
      // refreshed after every save / transition) and resolve a
      // collision-free slug for this save. While the article is in
      // `draft`, the slug tracks the headline; once it leaves draft
      // the persisted slug is preserved so external links remain
      // stable. Closes workstream-b step-03.
      const takenSlugs = new Set<string>();
      for (const state of DRAFT_GROUP_ORDER) {
        for (const row of groups[state]) {
          if (row.ArticleId === articleDraft.ArticleId) continue;
          if (row.Slug && row.Slug.trim().length > 0) takenSlugs.add(row.Slug);
        }
      }
      const resolvedSlug = resolveSlugForSave(
        {
          ArticleId: articleDraft.ArticleId,
          Title: articleDraft.Title,
          Slug: articleDraft.Slug,
          WorkflowState: articleDraft.WorkflowState,
        },
        takenSlugs,
      );
      // Intelligent metadata defaults: fill empty fields like
      // `TeamViewerTitle` and `HeroCategoryLabel` from current
      // article context. Author-typed values are preserved.
      // Closes workstream-b step-04.
      const { draft: defaulted } = intelligentDefaultsForSave(articleDraft);
      const updated: PublisherArticleRow = {
        ...defaulted,
        TemplateKey: resolution.entry.TemplateKey,
        Slug: resolvedSlug,
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
  }, [articleDraft, teamDraft, mediaDraft, repositories, reloadGroups, reloadSelected, applyPromotionPolicy, groups]);

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
  const workflowOutcomeChipLabel = articleDraft
    ? workflowOutcomeLabel(articleDraft.WorkflowState)
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
                      {draftGroupLabel(state)}
                    </span>
                    <span className={styles.draftGroupCount}>{rows.length}</span>
                  </button>
                  {!collapsed && (
                    rows.length === 0 ? (
                      <p className={styles.draftGroupEmpty}>
                        {draftGroupEmptyCopy(state)}
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
              {workflowOutcomeChipLabel && (
                <span className={styles.outcomeChip}>{workflowOutcomeChipLabel}</span>
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
                />
              </div>
            </section>

            <section id="section-promotion" className={styles.section}>
              <header className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Promotion</h3>
                <p className={styles.sectionIntent}>Review how promotion policy applies.</p>
              </header>
              <div className={styles.sectionBody}>
                {composePromotionSummary(promotionPolicy).map((line, i) => (
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

/* ── Chooser primitive ────────────────────────────────────── */

interface ChooserGroupProps<T extends string> {
  readonly label: string;
  readonly value: T | undefined;
  readonly options: readonly T[];
  readonly onChange: (next: T | undefined) => void;
  /**
   * Author-facing label resolver. Required: every chooser must
   * route through a governed label function from `authorLabels.ts`
   * so no raw enum token reaches the author.
   */
  readonly getLabel: (value: T) => string;
  readonly allowClear?: boolean;
  readonly clearLabel?: string;
  readonly helpText?: string;
  readonly ariaLabel?: string;
}

/**
 * Editorial chooser group. Renders a labeled set of radio-style
 * buttons over an enum. Authors see governed labels (via
 * `getLabel`) while the underlying enum values remain the source
 * of truth carried to the adapter.
 */
function ChooserGroup<T extends string>({
  label,
  value,
  options,
  onChange,
  getLabel,
  allowClear,
  clearLabel,
  helpText,
  ariaLabel,
}: ChooserGroupProps<T>) {
  const resolveLabel = (v: T): string => getLabel(v);
  const showCleared = allowClear && value === undefined;
  return (
    <div className={styles.chooser}>
      <span className={styles.chooserLabel}>{label}</span>
      <div
        className={styles.chooserGroup}
        role="radiogroup"
        aria-label={ariaLabel ?? label}
      >
        {allowClear && (
          <button
            type="button"
            role="radio"
            aria-checked={showCleared}
            className={`${styles.chooserChip} ${showCleared ? styles.chooserChipActive : ''}`}
            onClick={() => onChange(undefined)}
          >
            {clearLabel ?? 'Default'}
          </button>
        )}
        {options.map((opt) => {
          const active = value === opt;
          return (
            <button
              key={opt}
              type="button"
              role="radio"
              aria-checked={active}
              className={`${styles.chooserChip} ${active ? styles.chooserChipActive : ''}`}
              onClick={() => onChange(opt)}
            >
              {resolveLabel(opt)}
            </button>
          );
        })}
      </div>
      {helpText && <span className={styles.chooserHelp}>{helpText}</span>}
    </div>
  );
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

function MetadataPanel({ draft, onChange, searchProjects }: MetadataPanelProps) {
  const contentTypeOptions = contentTypeOptionsForDraft(draft.ArticleContentType);
  const legacyMilestoneMessage = milestoneLegacyNotice(draft.ArticleContentType);
  const destinationReadout = destinationLabel(draft.Destination);
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
      // Opportunistically fill the team heading default the moment a
      // project is picked, so the author sees the resolved heading
      // immediately. Only fills when the heading is currently blank
      // — author-typed values are preserved.
      const headingIsBlank =
        !draft.TeamViewerTitle || draft.TeamViewerTitle.trim().length === 0;
      const nextTeamViewerTitle = headingIsBlank
        ? defaultTeamHeading(entry.projectName)
        : draft.TeamViewerTitle;
      onChange({
        ...draft,
        ProjectId: entry.projectId,
        ProjectName: entry.projectName,
        ProjectLocation: entry.projectLocation ?? draft.ProjectLocation,
        TeamViewerTitle: nextTeamViewerTitle,
      });
    },
    [draft, onChange],
  );

  // Slug, TemplateKey, TargetSiteUrl are intentionally hidden from
  // the author. Slug is system-managed at save via `resolveSlugForSave`
  // (workstream-b step-03); TemplateKey is system-resolved on save via
  // `resolveTemplateKeySystemManaged`; TargetSiteUrl is derived from
  // Destination at publish time.
  return (
    <div className={styles.editorialForm}>
      <Field label="Headline">
        <input
          className={styles.input}
          value={draft.Title}
          placeholder="Give this article a headline"
          onChange={(e) => onChange(update(draft, 'Title', e.target.value))}
        />
      </Field>
      <Field
        label="Summary excerpt"
        helper="Shown in homepage cards, listings, and social previews. Lead with the outcome — one to two crisp sentences."
        counter={{ value: draft.SummaryExcerpt.length, soft: 200, hard: 280 }}
      >
        <textarea
          className={styles.textarea}
          value={draft.SummaryExcerpt}
          placeholder="One or two sentences readers will see before they open the article."
          onChange={(e) => onChange(update(draft, 'SummaryExcerpt', e.target.value))}
          maxLength={320}
        />
      </Field>

      <ChooserGroup
        label="Article type"
        value={draft.ArticleContentType}
        options={contentTypeOptions}
        getLabel={articleContentTypeLabel}
        onChange={(next) => {
          if (!next) return;
          onChange(update(draft, 'ArticleContentType', next));
        }}
      />
      {legacyMilestoneMessage && (
        <p className={styles.editorialNotice}>{legacyMilestoneMessage}</p>
      )}

      <div className={styles.editorialReadout}>
        <span className={styles.editorialReadoutLabel}>Publishes to</span>
        <span className={styles.editorialReadoutValue}>{destinationReadout}</span>
      </div>

      <ChooserGroup
        label="Spotlight type"
        value={draft.SpotlightType}
        options={SPOTLIGHT_TYPE_VALUES}
        getLabel={spotlightTypeLabel}
        onChange={(next) =>
          onChange(update(draft, 'SpotlightType', next as SpotlightType | undefined))
        }
        allowClear
        clearLabel="No spotlight"
      />
      <ChooserGroup
        label="Project stage"
        value={draft.ProjectStage}
        options={PROJECT_STAGE_VALUES}
        getLabel={projectStageLabel}
        onChange={(next) =>
          onChange(update(draft, 'ProjectStage', next as ProjectStage | undefined))
        }
        allowClear
        clearLabel="Unspecified"
      />
      <ChooserGroup
        label="Subject"
        value={draft.ArticleSubject}
        options={ARTICLE_SUBJECT_VALUES}
        getLabel={articleSubjectLabel}
        onChange={(next) =>
          onChange(update(draft, 'ArticleSubject', next as ArticleSubject | undefined))
        }
        allowClear
        clearLabel="Unspecified"
      />

      <Field label="Project">
        {searchProjects ? (
          <ProjectPicker
            value={projectValue}
            onChange={handleProjectChange}
            searchProjects={searchProjects}
          />
        ) : projectValue ? (
          // The picker is unavailable in this runtime context, but a
          // prior selection is on the row — render it read-only so
          // the author can still see what is bound. Manual ProjectId /
          // ProjectName text entry is intentionally not offered:
          // authoritative project identity belongs to the picker.
          <div className={styles.projectPickerChip} data-testid="project-picker-readonly">
            <div className={styles.projectPickerChipMain}>
              <span className={styles.projectPickerChipName}>{projectValue.projectName}</span>
              <span className={styles.projectPickerChipMeta}>
                ID {projectValue.projectId}
                {projectValue.projectLocation ? ` · ${projectValue.projectLocation}` : ''}
              </span>
            </div>
            <span className={styles.projectPickerHint}>Lookup unavailable</span>
          </div>
        ) : (
          <p className={styles.editorialNotice} role="status">
            Project lookup is unavailable in this context. Reload the Publisher in its hosted
            page so the HBCentral Projects list can be searched.
          </p>
        )}
      </Field>
    </div>
  );
}

function HeroPanel({ draft, onChange }: PanelProps) {
  return (
    <div className={styles.editorialForm}>
      <Field label="Hero image URL">
        <input
          className={styles.input}
          value={draft.HeroPrimaryImage}
          placeholder="https://…"
          onChange={(e) => onChange(update(draft, 'HeroPrimaryImage', e.target.value))}
        />
      </Field>
      <Field
        label="Alt text (for screen readers)"
        helper="Describe what is visible and why it matters — not that it is an image. Skip if the hero is purely decorative."
        counter={{ value: draft.HeroPrimaryImageAltText.length, soft: 125 }}
      >
        <textarea
          className={styles.textarea}
          value={draft.HeroPrimaryImageAltText}
          placeholder="e.g. Crew raising the final steel beam at the West Palm Beach jobsite."
          onChange={(e) => onChange(update(draft, 'HeroPrimaryImageAltText', e.target.value))}
        />
      </Field>
      <Field label="Hero headline (optional override)">
        <input
          className={styles.input}
          value={draft.HeroTitle ?? ''}
          placeholder="Falls back to the article headline when blank"
          onChange={(e) =>
            onChange(update(draft, 'HeroTitle', e.target.value || undefined))
          }
        />
      </Field>
      <Field label="Eyebrow">
        <input
          className={styles.input}
          value={draft.HeroEyebrow ?? ''}
          placeholder="Short label above the headline"
          onChange={(e) => onChange(update(draft, 'HeroEyebrow', e.target.value || undefined))}
        />
      </Field>
      <Field label="Category label">
        <input
          className={styles.input}
          value={draft.HeroCategoryLabel ?? ''}
          placeholder="Category displayed on the hero"
          onChange={(e) =>
            onChange(update(draft, 'HeroCategoryLabel', e.target.value || undefined))
          }
        />
      </Field>
      <ChooserGroup
        label="Hero theme"
        value={draft.HeroThemeVariant}
        options={HERO_THEME_VARIANT_VALUES}
        getLabel={heroThemeVariantLabel}
        onChange={(next) =>
          onChange(update(draft, 'HeroThemeVariant', next as HeroThemeVariant | undefined))
        }
        allowClear
        clearLabel="Default"
      />
      <label className={styles.toggleRow}>
        <input
          type="checkbox"
          checked={!!draft.HeroShowMetadata}
          onChange={(e) => onChange(update(draft, 'HeroShowMetadata', e.target.checked))}
        />
        <span>Show article metadata on the hero</span>
      </label>
    </div>
  );
}

function StoryPanel({ draft, onChange }: PanelProps) {
  return (
    <div className={styles.editorialForm}>
      <Field
        label="Subhead"
        helper="A beat under the headline that frames the story. Concrete, human, and free of jargon."
        counter={{ value: draft.Subhead.length, soft: 140, hard: 200 }}
      >
        <textarea
          className={styles.textarea}
          value={draft.Subhead}
          placeholder="e.g. How the Atlantic Center team delivered a 120-day schedule pull-in without slowing safety."
          onChange={(e) => onChange(update(draft, 'Subhead', e.target.value))}
          maxLength={240}
        />
      </Field>
      <Field label="Article body">
        <StoryBodyEditor
          value={draft.BodyRichText}
          onChange={(next) => onChange(update(draft, 'BodyRichText', next))}
          placeholder="Compose the article."
          ariaLabel="Article body"
        />
      </Field>
      <Field
        label="Intro"
        helper="Optional. A short lead paragraph rendered above the body — use it when the story needs a stronger runway than the subhead."
        counter={{ value: (draft.BodyIntro ?? '').length, soft: 300 }}
      >
        <textarea
          className={styles.textarea}
          value={draft.BodyIntro ?? ''}
          placeholder="Set the scene in a sentence or two. Leave blank if the subhead already carries this weight."
          onChange={(e) => onChange(update(draft, 'BodyIntro', e.target.value || undefined))}
        />
      </Field>
      <Field
        label="Closing"
        helper="Optional. A final thought shown after the body — usually a forward-looking line or a call to action."
        counter={{ value: (draft.BodyClosing ?? '').length, soft: 300 }}
      >
        <textarea
          className={styles.textarea}
          value={draft.BodyClosing ?? ''}
          placeholder="How should readers leave the story? A closing note, next step, or thank-you."
          onChange={(e) => onChange(update(draft, 'BodyClosing', e.target.value || undefined))}
        />
      </Field>
      <Field
        label="Callout"
        helper="Optional. A short highlight rendered as a pull-out card — use it to surface a single standout fact."
        counter={{ value: (draft.CalloutText ?? '').length, soft: 140 }}
      >
        <textarea
          className={styles.textarea}
          value={draft.CalloutText ?? ''}
          placeholder="e.g. 38,000 field hours. Zero recordables."
          onChange={(e) => onChange(update(draft, 'CalloutText', e.target.value || undefined))}
        />
      </Field>
      <Field
        label="Pull quote"
        helper="Optional. A quote emphasised in the layout. Attribute-less — use the body for speaker context."
        counter={{ value: (draft.PullQuote ?? '').length, soft: 200 }}
      >
        <textarea
          className={styles.textarea}
          value={draft.PullQuote ?? ''}
          placeholder="e.g. “We did not slow down to deliver this — we rebuilt how the team works.”"
          onChange={(e) => onChange(update(draft, 'PullQuote', e.target.value || undefined))}
        />
      </Field>
    </div>
  );
}

function SecondaryImagePanel({ draft, onChange }: PanelProps) {
  return (
    <div className={styles.editorialForm}>
      <label className={styles.toggleRow}>
        <input
          type="checkbox"
          checked={draft.ShowSecondaryImage === true}
          onChange={(e) => onChange(update(draft, 'ShowSecondaryImage', e.target.checked))}
        />
        <span>Show a secondary image alongside the body</span>
      </label>
      <Field label="Secondary image URL">
        <input
          className={styles.input}
          value={draft.SecondaryImage ?? ''}
          placeholder="https://…"
          onChange={(e) => onChange(update(draft, 'SecondaryImage', e.target.value || undefined))}
        />
      </Field>
      <Field label="Alt text">
        <textarea
          className={styles.textarea}
          value={draft.SecondaryImageAltText ?? ''}
          placeholder="Describe the image"
          onChange={(e) =>
            onChange(update(draft, 'SecondaryImageAltText', e.target.value || undefined))
          }
        />
      </Field>
      <Field label="Caption">
        <textarea
          className={styles.textarea}
          value={draft.SecondaryImageCaption ?? ''}
          placeholder="Optional caption shown under the image"
          onChange={(e) =>
            onChange(update(draft, 'SecondaryImageCaption', e.target.value || undefined))
          }
        />
      </Field>
    </div>
  );
}

function TeamPresentationPanel({ draft, onChange }: PanelProps) {
  return (
    <div className={styles.editorialForm}>
      <label className={styles.toggleRow}>
        <input
          type="checkbox"
          checked={draft.ShowTeamViewer !== false}
          onChange={(e) => onChange(update(draft, 'ShowTeamViewer', e.target.checked))}
        />
        <span>Include a team section on the published page</span>
      </label>
      <Field label="Team heading">
        <input
          className={styles.input}
          value={draft.TeamViewerTitle ?? ''}
          placeholder={defaultTeamHeading(draft.ProjectName)}
          onChange={(e) =>
            onChange(update(draft, 'TeamViewerTitle', e.target.value || undefined))
          }
        />
      </Field>
      <Field label="Team intro (optional)">
        <textarea
          className={styles.textarea}
          value={draft.TeamViewerIntro ?? ''}
          placeholder="A short intro shown above the team"
          onChange={(e) =>
            onChange(update(draft, 'TeamViewerIntro', e.target.value || undefined))
          }
        />
      </Field>
      <ChooserGroup
        label="Team layout"
        value={draft.TeamViewerMode}
        options={TEAM_VIEWER_MODE_VALUES}
        getLabel={teamViewerModeLabel}
        onChange={(next) =>
          onChange(update(draft, 'TeamViewerMode', next as TeamViewerMode | undefined))
        }
        allowClear
        clearLabel="Default"
      />
      <ChooserGroup
        label="Grouping"
        value={draft.TeamViewerGroupingMode}
        options={TEAM_VIEWER_GROUPING_MODE_VALUES}
        getLabel={teamViewerGroupingModeLabel}
        onChange={(next) =>
          onChange(
            update(draft, 'TeamViewerGroupingMode', next as TeamViewerGroupingMode | undefined),
          )
        }
        allowClear
        clearLabel="No grouping"
      />
      <ChooserGroup
        label="Sort order"
        value={draft.TeamViewerSortMode}
        options={TEAM_VIEWER_SORT_MODE_VALUES}
        getLabel={teamViewerSortModeLabel}
        onChange={(next) =>
          onChange(update(draft, 'TeamViewerSortMode', next as TeamViewerSortMode | undefined))
        }
        allowClear
        clearLabel="Default"
      />
      <Field label="How many members visible before expanding">
        <input
          className={styles.input}
          value={draft.TeamViewerMaxInitialVisible ?? ''}
          placeholder="e.g. 6"
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
      <label className={styles.toggleRow}>
        <input
          type="checkbox"
          checked={draft.TeamViewerAllowExpand === true}
          onChange={(e) => onChange(update(draft, 'TeamViewerAllowExpand', e.target.checked))}
        />
        <span>Allow readers to expand the full team list</span>
      </label>
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
        <HbcEmptyState
          title="No team members yet"
          description="Add a colleague to spotlight them on the published article."
        />
      ) : (
        rows.map((r, i) => (
          <div key={r.TeamMemberId} className={styles.rowCard}>
            <div className={styles.rowCardHeader}>
              <span className={styles.rowCardIndex}>Member {i + 1}</span>
              {r.IsFeaturedMember && <span className={styles.rowCardBadge}>Featured</span>}
            </div>
            <div className={styles.rowGrid}>
              <Field label="Display name">
                <input
                  className={styles.input}
                  value={r.DisplayName}
                  placeholder="Name shown on the card"
                  onChange={(e) => replaceAt(i, { ...r, DisplayName: e.target.value })}
                />
              </Field>
              <Field label="Role title">
                <input
                  className={styles.input}
                  value={r.Title}
                  placeholder="e.g. Project Executive"
                  onChange={(e) => replaceAt(i, { ...r, Title: e.target.value })}
                />
              </Field>
              <Field label="Email">
                <input
                  className={styles.input}
                  value={r.PersonPrincipal}
                  placeholder="name@hedrickbrothers.com"
                  onChange={(e) =>
                    replaceAt(i, applyTeamMemberPrincipalChange(r, e.target.value))
                  }
                />
              </Field>
              <Field label="Role detail">
                <input
                  className={styles.input}
                  value={r.Role ?? ''}
                  placeholder="Secondary role description, if any"
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
              <Field label="Group">
                <input
                  className={styles.input}
                  value={r.GroupKey ?? ''}
                  placeholder="Group this member into e.g. 'leadership'"
                  onChange={(e) => replaceAt(i, { ...r, GroupKey: e.target.value || undefined })}
                />
              </Field>
              <Field label="Reports to (member)">
                <input
                  className={styles.input}
                  value={r.ParentMemberId ?? ''}
                  placeholder="Optional parent member id"
                  onChange={(e) =>
                    replaceAt(i, { ...r, ParentMemberId: e.target.value || undefined })
                  }
                />
              </Field>
              <Field label="Bio">
                <textarea
                  className={styles.textarea}
                  value={r.BioSnippet ?? ''}
                  placeholder="One- or two-sentence bio"
                  onChange={(e) =>
                    replaceAt(i, { ...r, BioSnippet: e.target.value || undefined })
                  }
                />
              </Field>
              <Field label="Contact link">
                <input
                  className={styles.input}
                  value={r.ContactLink ?? ''}
                  placeholder="Profile or contact URL"
                  onChange={(e) =>
                    replaceAt(i, { ...r, ContactLink: e.target.value || undefined })
                  }
                />
              </Field>
            </div>
            <label className={styles.toggleRow}>
              <input
                type="checkbox"
                checked={r.IsFeaturedMember === true}
                onChange={(e) => replaceAt(i, { ...r, IsFeaturedMember: e.target.checked })}
              />
              <span>Feature this member in the team section</span>
            </label>
            <div className={styles.rowActions}>
              <button
                type="button"
                className={styles.btn}
                aria-label={`Move member ${i + 1} up`}
                onClick={() => move(i, -1)}
              >
                Move up
              </button>
              <button
                type="button"
                className={styles.btn}
                aria-label={`Move member ${i + 1} down`}
                onClick={() => move(i, 1)}
              >
                Move down
              </button>
              <button
                type="button"
                className={styles.dangerBtn}
                aria-label={`Remove member ${i + 1}`}
                onClick={() => removeAt(i)}
              >
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
        Add image
      </button>
      {rows.length === 0 ? (
        <HbcEmptyState
          title="No supporting media yet"
          description="Add images to show alongside the article."
        />
      ) : (
        rows.map((r, i) => (
          <div key={r.MediaId} className={styles.rowCard}>
            <div className={styles.rowCardHeader}>
              <span className={styles.rowCardIndex}>Image {i + 1}</span>
              {r.FeaturedInGallery && <span className={styles.rowCardBadge}>Featured</span>}
            </div>
            <div className={styles.rowGrid}>
              <Field label="Image title">
                <input
                  className={styles.input}
                  value={r.Title}
                  placeholder="Internal title for this image"
                  onChange={(e) => replaceAt(i, { ...r, Title: e.target.value })}
                />
              </Field>
              <Field label="Image URL">
                <input
                  className={styles.input}
                  value={r.ImageAsset}
                  placeholder="https://…"
                  onChange={(e) => replaceAt(i, { ...r, ImageAsset: e.target.value })}
                />
              </Field>
              <Field label="Alt text">
                <textarea
                  className={styles.textarea}
                  value={r.AltText}
                  placeholder="Describe the image in a sentence"
                  onChange={(e) => replaceAt(i, { ...r, AltText: e.target.value })}
                />
              </Field>
              <Field label="Caption">
                <input
                  className={styles.input}
                  value={r.Caption ?? ''}
                  placeholder="Optional caption shown under the image"
                  onChange={(e) => replaceAt(i, { ...r, Caption: e.target.value || undefined })}
                />
              </Field>
              <Field label="Group">
                <input
                  className={styles.input}
                  value={r.GalleryGroup ?? ''}
                  placeholder="Group name (optional)"
                  onChange={(e) => replaceAt(i, { ...r, GalleryGroup: e.target.value || undefined })}
                />
              </Field>
            </div>
            <ChooserGroup
              label="Used as"
              value={r.MediaRole}
              options={MEDIA_ROLES}
              getLabel={mediaRoleLabel}
              onChange={(next) => {
                if (!next) return;
                replaceAt(i, { ...r, MediaRole: next });
              }}
            />
            <label className={styles.toggleRow}>
              <input
                type="checkbox"
                checked={r.FeaturedInGallery === true}
                onChange={(e) => replaceAt(i, { ...r, FeaturedInGallery: e.target.checked })}
              />
              <span>Feature this image in the gallery</span>
            </label>
            <div className={styles.rowActions}>
              <button
                type="button"
                className={styles.btn}
                aria-label={`Move image ${i + 1} up`}
                onClick={() => move(i, -1)}
              >
                Move up
              </button>
              <button
                type="button"
                className={styles.btn}
                aria-label={`Move image ${i + 1} down`}
                onClick={() => move(i, 1)}
              >
                Move down
              </button>
              <button
                type="button"
                className={styles.dangerBtn}
                aria-label={`Remove image ${i + 1}`}
                onClick={() => removeAt(i)}
              >
                Remove
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function DestinationBindingPanel({
  binding,
  context,
}: {
  binding: PublisherPageBindingRow | undefined;
  context: PublishResolutionContext | undefined;
}) {
  return (
    <div className={styles.bindingPanel}>
      <div className={styles.bindingBlock}>
        <p className={styles.bindingHeading}>Template</p>
        {!context ? (
          <p className={styles.bindingSentence}>
            Save the article so the publishing template can be resolved.
          </p>
        ) : (
          <p className={styles.bindingSentence}>
            This article will publish with the{' '}
            <strong>{context.template.TemplateName ?? context.template.TemplateKey}</strong>{' '}
            template
            {context.template.VersionLabel
              ? ` (version ${context.template.VersionLabel})`
              : ''}
            .
          </p>
        )}
      </div>
      <div className={styles.bindingBlock}>
        <p className={styles.bindingHeading}>Destination page</p>
        {!binding ? (
          <p className={styles.bindingSentence}>
            No destination page is bound yet. Publishing this article will create the Project
            Spotlight page.
          </p>
        ) : (
          <>
            <p className={styles.bindingSentence}>
              The destination page <strong>{binding.PageName ?? 'is named on publish'}</strong>{' '}
              is bound to this article
              {binding.PublishedDateUtc
                ? ` and was last published ${binding.PublishedDateUtc}.`
                : ' and has not been published yet.'}
            </p>
            {binding.PageUrl && (
              <p className={styles.bindingSentence}>
                <a
                  className={styles.bindingLink}
                  href={binding.PageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open the destination page
                </a>
              </p>
            )}
            {binding.LastSyncMessage && (
              <p className={styles.bindingDetail}>
                Last sync: {binding.LastSyncMessage}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

interface FieldCounter {
  value: number;
  soft?: number;
  hard?: number;
}

function Field({
  label,
  helper,
  counter,
  children,
}: {
  label: string;
  helper?: string;
  counter?: FieldCounter;
  children: React.ReactNode;
}) {
  const counterState = counter ? resolveCounterState(counter) : undefined;
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabelRow}>
        <span className={styles.fieldLabel}>{label}</span>
        {counterState && (
          <span
            className={`${styles.fieldCount} ${counterState.className}`}
            aria-live="polite"
          >
            {counterState.text}
          </span>
        )}
      </span>
      {helper && <span className={styles.fieldHelper}>{helper}</span>}
      {children}
    </label>
  );
}

function resolveCounterState(counter: FieldCounter): { text: string; className: string } {
  const { value, soft, hard } = counter;
  const limit = hard ?? soft;
  const text = limit ? `${value} / ${limit}` : `${value}`;
  let className = styles.fieldCountOk;
  if (hard !== undefined && value > hard) {
    className = styles.fieldCountOver;
  } else if (soft !== undefined && value > soft) {
    className = styles.fieldCountWarn;
  }
  return { text, className };
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
                // Body emits sanitised HTML through the rich editor;
                // the preview shows a plain-text projection so the
                // snippet reads as editorial prose rather than markup.
                // Subhead remains a plain string, but routing it
                // through the same projection is harmless (no tags).
                const snippet = bodyTextSnippet(t.text, 200);
                return (
                  <div key={c.slot} className={styles.previewControl}>
                    <strong>{c.slot}</strong>
                    <div className={styles.previewSnippet}>{snippet}</div>
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

