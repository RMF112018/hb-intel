/**
 * Draft lifecycle controller — owns the authoring draft state (master
 * row, team, media, binding, resolution context, promotion policy) and
 * the save / transition / publish / republish / preview / archive /
 * withdraw handlers. The hook preserves the existing working lifecycle
 * verbatim; it does not change workflow semantics or adapter calls.
 */
import * as React from 'react';
import {
  createDefaultPublishOrchestrator,
  selectPromotionPolicy,
  type PromotionPolicyResult,
  type PublisherArticleRow,
  type PublisherMediaRow,
  type PublisherPageBindingRow,
  type PublisherPromotionRuleRow,
  type PublisherRepositories,
  type PublisherTeamMemberRow,
  type PublishOutcome,
  type PublishResolutionContext,
  type WorkflowState,
} from '../../../data/publisherAdapter/index.js';
import { buildPublishResolutionContext } from '../../../data/publisherAdapter/publishResolutionContext.js';
import { canTransition } from '../../../data/publisherAdapter/workflowStateMachine.js';
import {
  illegalTransitionMessage,
  inProgressMessage,
  lifecycleFailureMessage,
  lifecycleOutcomeMessage,
  publishFailureMessage,
  publishSuccessMessage,
  transitionInProgressMessage,
} from '../lifecycleMessaging.js';
import { intelligentDefaultsForSave } from '../metadataDefaults.js';
import { resolveSlugForSave } from '../slugGovernance.js';
import { resolveTemplateKeySystemManaged } from '../authoringPanels/index.js';
import type { StatusBannerTone } from '../sharedChrome/index.js';
import {
  DRAFT_GROUP_ORDER,
  type DraftGroupMap,
} from '../workspace/index.js';
import {
  applyPromotionPolicyToDraft,
  emptyArticle,
  nowIso,
  unsupportedDestinationNotice,
} from './draftPolicyHelpers.js';
import type { SetStatus } from './useStatusChannel.js';

export type PublishOrchestrator = ReturnType<typeof createDefaultPublishOrchestrator>;

export interface DraftLifecycleDeps {
  readonly repositories: PublisherRepositories;
  readonly orchestrator: PublishOrchestrator;
  readonly actorEmail: string | undefined;
  readonly promotionRules: readonly PublisherPromotionRuleRow[];
  readonly groups: DraftGroupMap;
  readonly reloadGroups: () => Promise<void>;
  readonly selectedArticleId: string | undefined;
  readonly setSelectedArticleId: React.Dispatch<
    React.SetStateAction<string | undefined>
  >;
  readonly setStatus: SetStatus;
}

export interface DraftLifecycleHandle {
  readonly articleDraft: PublisherArticleRow | undefined;
  readonly setArticleDraft: React.Dispatch<
    React.SetStateAction<PublisherArticleRow | undefined>
  >;
  readonly teamDraft: PublisherTeamMemberRow[];
  readonly setTeamDraft: React.Dispatch<
    React.SetStateAction<PublisherTeamMemberRow[]>
  >;
  readonly mediaDraft: PublisherMediaRow[];
  readonly setMediaDraft: React.Dispatch<
    React.SetStateAction<PublisherMediaRow[]>
  >;
  readonly binding: PublisherPageBindingRow | undefined;
  readonly resolutionContext: PublishResolutionContext | undefined;
  readonly promotionPolicy: PromotionPolicyResult | undefined;
  readonly busy: boolean;
  readonly reloadSelected: (articleId: string) => Promise<void>;
  readonly handleCreateNew: () => void;
  readonly handleSave: () => Promise<void>;
  readonly handleTransition: (to: WorkflowState) => Promise<void>;
  readonly handlePublishAction: (
    mode: 'create' | 'republish' | 'preview',
  ) => Promise<void>;
}

export function useDraftLifecycle({
  repositories,
  orchestrator,
  actorEmail,
  promotionRules,
  groups,
  reloadGroups,
  selectedArticleId,
  setSelectedArticleId,
  setStatus,
}: DraftLifecycleDeps): DraftLifecycleHandle {
  const [articleDraft, setArticleDraft] = React.useState<
    PublisherArticleRow | undefined
  >();
  const [teamDraft, setTeamDraft] = React.useState<PublisherTeamMemberRow[]>(
    [],
  );
  const [mediaDraft, setMediaDraft] = React.useState<PublisherMediaRow[]>([]);
  const [binding, setBinding] = React.useState<
    PublisherPageBindingRow | undefined
  >();
  const [resolutionContext, setResolutionContext] = React.useState<
    PublishResolutionContext | undefined
  >();
  const [promotionPolicy, setPromotionPolicy] = React.useState<
    PromotionPolicyResult | undefined
  >();
  const [busy, setBusy] = React.useState(false);

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
    [repositories, promotionRules, setStatus],
  );

  React.useEffect(() => {
    if (selectedArticleId) void reloadSelected(selectedArticleId);
  }, [selectedArticleId, reloadSelected]);

  const handleCreateNew = React.useCallback(() => {
    const seeded = applyPromotionPolicy(emptyArticle());
    setArticleDraft(seeded);
    setTeamDraft([]);
    setMediaDraft([]);
    setBinding(undefined);
    setResolutionContext(undefined);
    setSelectedArticleId(seeded.ArticleId);
  }, [applyPromotionPolicy, setSelectedArticleId]);

  // When the active draft's (Destination, ArticleContentType) changes,
  // re-resolve promotion policy. On the first time a context key is
  // seen, re-seed IsFeatured/IsPinned from policy; author-typed values
  // for other fields are preserved because we only write back when the
  // two flags actually change.
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
      const registry = await repositories.templateRegistry.listActive();
      const resolution = resolveTemplateKeySystemManaged(articleDraft, registry);
      if (!resolution.ok) {
        setStatus(
          `Save blocked — could not resolve a template for this article (${resolution.reason}). ${resolution.message}`,
          'error',
        );
        return;
      }
      // Slug is system-managed. Collect every other article's slug from
      // the draft-rail groups and resolve a collision-free slug for
      // this save. While the article is in `draft`, the slug tracks
      // the headline; once it leaves draft the persisted slug is
      // preserved so external links remain stable.
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
  }, [
    articleDraft,
    teamDraft,
    mediaDraft,
    repositories,
    reloadGroups,
    reloadSelected,
    applyPromotionPolicy,
    groups,
    setStatus,
  ]);

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
        if (to === 'archived' || to === 'withdrawn') {
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
    [articleDraft, actorEmail, orchestrator, reloadGroups, reloadSelected, setStatus],
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
    [articleDraft, actorEmail, orchestrator, reloadSelected, setStatus],
  );

  return {
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
    reloadSelected,
    handleCreateNew,
    handleSave,
    handleTransition,
    handlePublishAction,
  };
}
