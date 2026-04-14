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
  type Destination,
  type PublishResolutionContext,
  type PublishOutcome,
  type PublisherPromotionRuleRow,
  selectPromotionPolicy,
  type PromotionPolicyResult,
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
  type ProjectLookupSearchFn,
} from '../../homepage/data/publisherAdapter/projectsLookupSource.js';
import { TeamPanel } from './teamComposer/index.js';
import { GalleryPanel } from './mediaComposer/index.js';
import { ArticlePreview } from './previewSurface/index.js';
import { PublishReadinessDiagnostics } from './readinessSurface/index.js';
import { PublisherButton, StatusBanner, type StatusBannerTone } from './sharedChrome/index.js';
import {
  DRAFT_GROUP_ORDER,
  QueueRail,
  useDraftWorkspace,
} from './workspace/index.js';
import {
  DestinationBindingPanel,
  HeroPanel,
  MetadataPanel,
  SecondaryImagePanel,
  StoryPanel,
  TeamPresentationPanel,
  resolveTemplateKeySystemManaged,
} from './authoringPanels/index.js';
// Re-exported from `./authoringPanels` for test-surface compatibility.
export {
  contentTypeOptionsForDraft,
  milestoneLegacyNotice,
  resolveTemplateKeySystemManaged,
  update,
} from './authoringPanels/index.js';
import {
  illegalTransitionMessage,
  inProgressMessage,
  lifecycleFailureMessage,
  lifecycleOutcomeMessage,
  publishDisabledReason,
  publishFailureMessage,
  publishSuccessMessage,
  transitionInProgressMessage,
} from './lifecycleMessaging.js';
import { useSharePointPeopleSearch } from '../../homepage/data/useSharePointPeopleSearch.js';
import { useGraphPersonPhotoFn } from '../hbKudos/hooks/useRecipientPhotoHydration.js';
import { resolveSlugForSave } from './slugGovernance.js';
import { intelligentDefaultsForSave } from './metadataDefaults.js';
import {
  transitionActionLabel,
  workflowOutcomeLabel,
} from './authorLabels.js';
import styles from './article-publisher.module.css';

// Convenience aliases so the JSX stays compact.

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
  /**
   * Graph token provider threaded from the SPFx mount boundary.
   * When present, the teammate composer renders Graph-backed
   * directory photos through `createGraphPersonPhotoFn`; when
   * absent, the picker falls back to initials avatars. The people
   * search itself uses the tenant SharePoint `/_api/SP.UI.ApplicationPages.ClientPeoplePickerWebServiceInterface.ClientPeoplePickerSearchUser`
   * endpoint via `useSharePointPeopleSearch`, which does not need a
   * Graph token.
   */
  getGraphToken?: () => Promise<string>;
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
  getGraphToken,
}: ArticlePublisherProps) {
  // Teammate composer runtime seams. `searchPeople` uses the tenant
  // SharePoint people picker endpoint (no Graph token required);
  // `fetchPersonPhoto` binds to Graph when a token is available and
  // falls through to the picker's initials fallback when not.
  const searchPeople = useSharePointPeopleSearch();
  const fetchPersonPhoto = useGraphPersonPhotoFn(getGraphToken);
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

  const workspace = useDraftWorkspace(repositories);
  const {
    groups,
    groupsLoading,
    groupsError,
    hasAnyArticles,
    promotionRules,
    selectedArticleId,
    setSelectedArticleId,
    reloadGroups,
  } = workspace;
  const [promotionPolicy, setPromotionPolicy] = React.useState<PromotionPolicyResult | undefined>();
  const [articleDraft, setArticleDraft] = React.useState<PublisherArticleRow | undefined>();
  const [teamDraft, setTeamDraft] = React.useState<PublisherTeamMemberRow[]>([]);
  const [mediaDraft, setMediaDraft] = React.useState<PublisherMediaRow[]>([]);
  const [binding, setBinding] = React.useState<PublisherPageBindingRow | undefined>();
  const [resolutionContext, setResolutionContext] = React.useState<PublishResolutionContext | undefined>();
  const [status, setStatusRaw] = React.useState<string | undefined>();
  const [statusTone, setStatusTone] = React.useState<StatusBannerTone>('info');
  const setStatus = React.useCallback(
    (message: string | undefined, tone: StatusBannerTone = 'info') => {
      setStatusRaw(message);
      setStatusTone(message ? tone : 'info');
    },
    [],
  );
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
            unsupportedDestinationMessage || (ctx.ok ? undefined : ctx.message)
              ? 'error'
              : 'info',
          );
        }
      } catch (err) {
        setStatus(
          err instanceof Error ? err.message : 'Failed to load article.',
          'error',
        );
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
        setStatus(
          err instanceof Error ? err.message : 'Preview failed.',
          'error',
        );
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

  // Promotion rules are loaded once per repositories identity inside
  // `useDraftWorkspace`. Current behavior in this shell:
  //   - resolve policy from the draft's actual
  //     (Destination, ArticleContentType),
  //   - seed/re-seed IsFeatured/IsPinned on draft creation and
  //     destination/content-type changes,
  //   - enforce lock semantics on save when
  //     ManualOverrideAllowed=false.
  // The editor still has no explicit IsFeatured/IsPinned toggles;
  // policy closure is enforced without inventing controls.

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
    setStatus('Saving the draft…');
    try {
      // Ordinary authoring treats TemplateKey as system-managed.
      // Always resolve from current discriminators so stale keys
      // cannot survive Destination/ContentType/etc changes.
      const registry = await repositories.templateRegistry.listActive();
      const resolution = resolveTemplateKeySystemManaged(articleDraft, registry);
      if (!resolution.ok) {
        setStatus(
          `Save blocked — could not resolve a template for this article (${resolution.reason}). ${resolution.message}`,
          'error',
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
      setStatus('Draft saved.', 'success');
      await reloadGroups();
      await reloadSelected(policyApplied.ArticleId);
    } catch (err) {
      setStatus(
        err instanceof Error
          ? `Couldn\u2019t save — ${err.message}`
          : 'Couldn\u2019t save the draft.',
        'error',
      );
    } finally {
      setBusy(false);
    }
  }, [articleDraft, teamDraft, mediaDraft, repositories, reloadGroups, reloadSelected, applyPromotionPolicy, groups]);

  const handleTransition = React.useCallback(
    async (to: WorkflowState) => {
      if (!articleDraft) return;
      const from = articleDraft.WorkflowState;
      if (!canTransition(from, to)) {
        setStatus(illegalTransitionMessage(from, to), 'error');
        return;
      }
      setBusy(true);
      setStatus(transitionInProgressMessage(to));
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
              lifecycleOutcomeMessage({ to, bindingUpdated: outcome.bindingUpdated }),
              'success',
            );
          } else {
            setStatus(
              lifecycleFailureMessage({ to, stage: outcome.stage, message: outcome.message }),
              'error',
            );
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
            setStatus(lifecycleOutcomeMessage({ to, bindingUpdated: false }), 'success');
          } else {
            setStatus(
              lifecycleFailureMessage({ to, stage: outcome.stage, message: outcome.message }),
              'error',
            );
          }
        }
        await reloadGroups();
        await reloadSelected(articleDraft.ArticleId);
      } catch (err) {
        setStatus(
          err instanceof Error ? err.message : 'Transition failed.',
          'error',
        );
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
      setStatus(inProgressMessage(mode));
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
          const actionTone: StatusBannerTone =
            outcome.action === 'blocked' ? 'error' : 'success';
          setStatus(
            publishSuccessMessage({
              mode,
              action: outcome.action,
              pageUrl: outcome.pageUrl,
            }),
            actionTone,
          );
          if (mode !== 'preview') await reloadSelected(articleDraft.ArticleId);
        } else {
          setStatus(
            publishFailureMessage({
              mode,
              stage: outcome.stage,
              message: outcome.message,
            }),
            'error',
          );
        }
      } catch (err) {
        setStatus(
          err instanceof Error
            ? publishFailureMessage({ mode, stage: 'runtime', message: err.message })
            : publishFailureMessage({ mode, stage: 'runtime', message: 'unknown error' }),
          'error',
        );
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
      <QueueRail
        groups={groups}
        groupsLoading={groupsLoading}
        groupsError={groupsError}
        hasAnyArticles={hasAnyArticles}
        selectedArticleId={selectedArticleId}
        onSelect={setSelectedArticleId}
        onReload={() => void reloadGroups()}
        onCreateNew={handleCreateNew}
        actorEmail={actorEmail}
      />

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
                    destinationSupported: !unsupportedDestinationLoaded,
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
                    destinationSupported: !unsupportedDestinationLoaded,
                    validationBlocked: publishBlockedByValidation,
                    busy,
                  })}
                  onClick={() => handlePublishAction('republish')}
                >
                  Republish
                </PublisherButton>
                <PublisherButton disabled={!saveEnabled} onClick={handleSave}>
                  Save draft
                </PublisherButton>
                <PublisherButton
                  disabled={!saveEnabled}
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

