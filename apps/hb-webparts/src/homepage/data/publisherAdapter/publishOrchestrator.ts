/**
 * End-to-end publish orchestrator for the Article Publisher.
 *
 * Ties together:
 *   1. `buildPublishResolutionContext` — reads article + children + active
 *      templates, runs the deterministic resolver.
 *   2. `createPageShellService({ pageCreation }).composePage` /
 *      `.publishPage` — composes and (if needed) creates/updates the
 *      destination page.
 *   3. `decideRepublishAction` — interprets the existing binding to
 *      choose `create | inPlaceUpdate | regenerate | blocked | noOp`.
 *   4. `PageBindingWriter.upsert` — persists the binding row keyed by
 *      `ArticleId`.
 *
 * The orchestrator is the caller's single entry point for `publish`
 * and `republish`. It never duplicates a live page for the same article:
 * when a binding exists and shell/template identity is compatible,
 * the same `PageId` / `PageUrl` are preserved and the binding row is
 * merged in place.
 */

import {
  buildPublishResolutionContext,
  type PublishResolutionContext,
} from './publishResolutionContext';
import type { PublisherRepositories } from './publisherRepositories';
import type { PageBindingWriter } from './pageBindingWriter';
import {
  createPageShellService,
  type PageShellService,
} from './pageGeneration/pageShellService';
import {
  decideRepublishAction,
  type RepublishDecision,
} from './republishPolicy';
import type { ComposedPage } from './pageGeneration/pageCompositor';
import type { PublisherArticleRow, PublisherPageBindingRow } from './publisherContracts';
import { canTransition } from './workflowStateMachine';
import {
  validatePublishContext,
  type ValidationResult,
} from './validation/validationEngine';
import { PROJECT_SPOTLIGHT_V1_SHELL, type PageShellManifest } from './pageGeneration/xmlShellManifest';

export type PublishMode = 'create' | 'republish' | 'preview';

export interface PublishRequest {
  readonly articleId: string;
  readonly mode: PublishMode;
  /** Optional: when true, unchanged content + versions short-circuits to `noOp`. */
  readonly idempotent?: boolean;
  /** Caller-controlled clock; deterministic for tests. */
  readonly now?: () => string;
  /** Caller-supplied BindingId factory for new rows; default = `bnd-${ArticleId}-${timestamp}`. */
  readonly generateBindingId?: (articleId: string, nowIso: string) => string;
  /**
   * When `true` (default), the orchestrator runs `validatePublishContext`
   * between composition and the republish policy for create/republish
   * modes. Validation failures block the page-creation + binding writes
   * and return `{ ok: false, stage: 'validation', validation }`. Set
   * `false` only for automation / admin-bypass paths that accept the
   * governance risk explicitly.
   */
  readonly validateBeforePublish?: boolean;
  /** Override the shell manifest used for validation + drift checks. */
  readonly shell?: PageShellManifest;
}

export interface PublishOrchestratorDeps {
  readonly repositories: PublisherRepositories;
  readonly pageBindingWriter: PageBindingWriter;
  readonly pageShellService: PageShellService;
}

export type PublishOutcome =
  | {
      readonly ok: true;
      readonly mode: PublishMode;
      readonly action: RepublishDecision['action'];
      readonly reason: RepublishDecision['reason'];
      readonly context: PublishResolutionContext;
      readonly page: ComposedPage;
      readonly pageId?: string;
      readonly pageUrl?: string;
      readonly bindingId: string;
      readonly itemId?: number;
      readonly decision: RepublishDecision;
      readonly validation?: ValidationResult;
    }
  | {
      readonly ok: false;
      readonly stage:
        | 'resolution'
        | 'composition'
        | 'validation'
        | 'policy'
        | 'pagePublish'
        | 'bindingWrite'
        | 'articleSync';
      readonly message: string;
      readonly decision?: RepublishDecision;
      readonly page?: ComposedPage;
      readonly validation?: ValidationResult;
    };

export function createPublishOrchestrator(deps: PublishOrchestratorDeps) {
  const { repositories, pageBindingWriter, pageShellService } = deps;

  function defaultNow(): string {
    return new Date().toISOString();
  }

  function defaultBindingId(articleId: string, nowIso: string): string {
    return `bnd-${articleId}-${nowIso.replace(/[^0-9]/g, '').slice(0, 14)}`;
  }

  /**
   * Map an internal failure stage + caller mode to the coarse tenant
   * `Operation` Choice on `HB Article Publishing Errors`. Stages
   * collapse onto the four tenant choices: create / update / publish /
   * sync.
   */
  function operationFor(
    stage: 'resolution' | 'composition' | 'validation' | 'policy' | 'pagePublish' | 'bindingWrite' | 'articleSync',
    mode: PublishMode,
  ): import('./publisherEnums').PublishingErrorOperation {
    if (stage === 'bindingWrite' || stage === 'articleSync') return 'sync';
    if (mode === 'create') return 'create';
    return 'publish';
  }

  /**
   * Append a tenant `HB Article Publishing Errors` row for the failure.
   * Best-effort: a failing error-list write is logged to the console
   * but never re-thrown — the orchestrator's own typed failure result
   * is the authoritative caller signal.
   */
  async function recordPublishingError(input: {
    readonly articleId: string;
    readonly title: string | undefined;
    readonly destination: import('./publisherEnums').Destination | undefined;
    readonly stage: 'resolution' | 'composition' | 'validation' | 'policy' | 'pagePublish' | 'bindingWrite' | 'articleSync';
    readonly mode: PublishMode;
    readonly message: string;
    readonly bindingId?: string;
    readonly nowIso: string;
  }): Promise<void> {
    try {
      await repositories.publishingErrors.append({
        ErrorId: `err-${input.nowIso.replace(/[^0-9]/g, '').slice(0, 14)}-${Math.floor(Math.random() * 1e6).toString(36)}`,
        ArticleId: input.articleId,
        Title: input.title && input.title.trim().length > 0
          ? `${input.stage}: ${input.title}`
          : `${input.stage} failure for ArticleId ${input.articleId}`,
        Destination: input.destination ?? 'projectSpotlight',
        Operation: operationFor(input.stage, input.mode),
        ErrorSummary: input.message,
        BindingId: input.bindingId,
        LastAttemptDateUtc: input.nowIso,
        RetryStatus: 'pending',
      });
    } catch (err) {
      // Swallow — never let error-log persistence mask the real
      // failure that the caller is already receiving.
      // eslint-disable-next-line no-console
      console.warn('[publishOrchestrator] publishingErrors.append failed', err);
    }
  }

  async function run(req: PublishRequest): Promise<PublishOutcome> {
    const now = (req.now ?? defaultNow)();
    const bindingIdFactory = req.generateBindingId ?? defaultBindingId;

    const resolution = await buildPublishResolutionContext(
      repositories,
      req.articleId,
    );
    if (!resolution.ok) {
      if (req.mode !== 'preview') {
        await recordPublishingError({
          articleId: req.articleId,
          title: undefined,
          destination: undefined,
          stage: 'resolution',
          mode: req.mode,
          message: resolution.message,
          nowIso: now,
        });
      }
      return {
        ok: false,
        stage: 'resolution',
        message: resolution.message,
      };
    }

    const { context } = resolution;

    const shell = req.shell ?? PROJECT_SPOTLIGHT_V1_SHELL;

    // Preview never writes; always runs validation for UI surfacing.
    if (req.mode === 'preview') {
      const { page, structuralErrors } = pageShellService.composePage(context);
      if (structuralErrors.length > 0) {
        return {
          ok: false,
          stage: 'composition',
          message: `Preview composition failed: ${structuralErrors.join('; ')}`,
          page,
        };
      }
      const validation = validatePublishContext(context, { shell });
      return {
        ok: true,
        mode: 'preview',
        action: 'noOp',
        reason: 'alreadyInSync',
        context,
        page,
        bindingId: context.existingBinding?.BindingId ?? '(preview)',
        decision: {
          action: 'noOp',
          reason: 'alreadyInSync',
          notes: ['Preview mode — no page or binding writes performed.'],
        },
        validation,
      };
    }

    const { page, structuralErrors } = pageShellService.composePage(context);
    if (structuralErrors.length > 0) {
      const message = `Composed page failed structural validation: ${structuralErrors.join('; ')}`;
      await recordPublishingError({
        articleId: context.article.ArticleId,
        title: context.article.Title,
        destination: context.article.Destination,
        stage: 'composition',
        mode: req.mode,
        message,
        nowIso: now,
      });
      return {
        ok: false,
        stage: 'composition',
        message,
        page,
      };
    }

    const shouldValidate = req.validateBeforePublish !== false;
    let validation: ValidationResult | undefined;
    if (shouldValidate) {
      validation = validatePublishContext(context, { shell });
      if (!validation.ok) {
        const first = validation.errors[0];
        const message = first
          ? `Validation blocked ${req.mode}: ${first.message}`
          : `Validation blocked ${req.mode}.`;
        await recordPublishingError({
          articleId: context.article.ArticleId,
          title: context.article.Title,
          destination: context.article.Destination,
          stage: 'validation',
          mode: req.mode,
          message,
          nowIso: now,
        });
        return {
          ok: false,
          stage: 'validation',
          message,
          page,
          validation,
        };
      }
    }

    const decision = decideRepublishAction({
      composed: page,
      template: context.template,
      existingBinding: context.existingBinding,
      article: context.article,
      idempotent: req.idempotent,
    });

    if (decision.action === 'blocked') {
      const message = `Republish blocked: ${decision.reason}. ${decision.notes.join(' ')}`;
      await recordPublishingError({
        articleId: context.article.ArticleId,
        title: context.article.Title,
        destination: context.article.Destination,
        stage: 'policy',
        mode: req.mode,
        message,
        bindingId: context.existingBinding?.BindingId,
        nowIso: now,
      });
      return {
        ok: false,
        stage: 'policy',
        message,
        decision,
        page,
      };
    }

    if (decision.action === 'noOp') {
      const bindingId = context.existingBinding?.BindingId ?? bindingIdFactory(req.articleId, now);
      return {
        ok: true,
        mode: req.mode,
        action: decision.action,
        reason: decision.reason,
        context,
        page,
        pageId: context.existingBinding?.PageId,
        pageUrl: context.existingBinding?.PageUrl,
        bindingId,
        decision,
      };
    }

    const publishResult = await pageShellService.publishPage(context);
    if (!publishResult.ok) {
      await recordPublishingError({
        articleId: context.article.ArticleId,
        title: context.article.Title,
        destination: context.article.Destination,
        stage: 'pagePublish',
        mode: req.mode,
        message: publishResult.message,
        bindingId: context.existingBinding?.BindingId,
        nowIso: now,
      });
      return {
        ok: false,
        stage: 'pagePublish',
        message: publishResult.message,
        decision,
        page: publishResult.page ?? page,
      };
    }

    // PageBindingRow follows the tenant `HB Article Destination Pages`
    // schema. The article-key is the foreign key; PageTemplateKey /
    // RenderVersion carry the resolved template identity; PublishStatus
    // and SyncStatus are set to the tenant choice values on successful
    // publish.
    const bindingRow: PublisherPageBindingRow = {
      BindingId:
        decision.action === 'inPlaceUpdate' && context.existingBinding
          ? context.existingBinding.BindingId
          : bindingIdFactory(req.articleId, now),
      ArticleId: context.article.ArticleId,
      Title: context.article.Title,
      TargetSiteUrl: context.article.TargetSiteUrl ?? '',
      PageTemplateKey: publishResult.page.identity.templateKey,
      PublishStatus: 'published',
      PageId: publishResult.creation.pageId,
      PageName: publishResult.page.identity.pageName,
      PageUrl: publishResult.creation.pageUrl,
      PageShellVersion: publishResult.page.identity.shellVersion,
      RenderVersion: publishResult.page.identity.templateVersion,
      SyncStatus: 'in-sync',
      LastSyncDateUtc: now,
      PublishedDateUtc: now,
    };

    const bindingOutcome = await pageBindingWriter.upsert({ row: bindingRow });
    if (!bindingOutcome.ok) {
      await recordPublishingError({
        articleId: context.article.ArticleId,
        title: context.article.Title,
        destination: context.article.Destination,
        stage: 'bindingWrite',
        mode: req.mode,
        message: bindingOutcome.message,
        bindingId: bindingRow.BindingId,
        nowIso: now,
      });
      return {
        ok: false,
        stage: 'bindingWrite',
        message: bindingOutcome.message,
        decision,
        page: publishResult.page,
      };
    }

    // Back-sync the master `HB Articles` row with authoritative
    // post-publish destination metadata. Only runs after a verified
    // success path (composition + validation + page lifecycle +
    // binding upsert all green). PublishedDateUtc is stamped on
    // first publish and on regenerate (a new destination page); on
    // in-place republish we preserve the existing first-publish
    // timestamp so callers can still tell when the page first went
    // live.
    //
    // `WorkflowState` is stamped to `'published'` here. The publish
    // orchestrator is the single producer of `WorkflowState='published'`;
    // the generic state machine intentionally excludes it from any
    // manual transition path so no UI button can bypass page
    // creation + binding closure.
    const stampPublished =
      decision.action === 'create' || decision.action === 'regenerate';
    const previousWorkflowState = context.article.WorkflowState;
    const workflowStateChanged = previousWorkflowState !== 'published';
    const updatedArticle: PublisherArticleRow = {
      ...context.article,
      WorkflowState: 'published',
      PageId: publishResult.creation.pageId,
      PageName:
        publishResult.creation.pageName ?? publishResult.page.identity.pageName,
      PageUrl: publishResult.creation.pageUrl,
      PageTemplateKey: publishResult.page.identity.templateKey,
      PageShellVersion: publishResult.page.identity.shellVersion,
      RenderVersion: publishResult.page.identity.templateVersion,
      PageSyncStatus: 'in-sync',
      LastPageSyncDateUtc: now,
      UpdatedDateUtc: now,
      PublishedDateUtc: stampPublished
        ? publishResult.publish.publishedAtUtc ?? now
        : context.article.PublishedDateUtc,
    };
    try {
      await repositories.articles.upsert(updatedArticle);
    } catch (err) {
      const message =
        err instanceof Error
          ? `HB Articles back-sync failed after publish: ${err.message}`
          : 'HB Articles back-sync failed after publish.';
      await recordPublishingError({
        articleId: context.article.ArticleId,
        title: context.article.Title,
        destination: context.article.Destination,
        stage: 'articleSync',
        mode: req.mode,
        message,
        bindingId: bindingRow.BindingId,
        nowIso: now,
      });
      return {
        ok: false,
        stage: 'articleSync',
        message,
        decision,
        page: publishResult.page,
      };
    }

    // Append a workflow-history row for every successful publish or
    // republish that actually wrote a page and binding. This closes
    // the control-plane lifecycle: first publish records the
    // `previous → published` transition, republish records a
    // `published → published` event tagged with the republish action
    // (inPlaceUpdate / regenerate) so the audit trail reflects page
    // identity changes. `noOp` returned earlier and never reaches
    // this code path. Best-effort: a history-append failure is
    // logged through recordPublishingError but does not roll back
    // the successful publish.
    const historyTitle = workflowStateChanged
      ? `${previousWorkflowState} → published`
      : `republish (${decision.action})`;
    const historyNote = workflowStateChanged
      ? `Article published via orchestrator (${decision.action}).`
      : `Article republished via orchestrator (${decision.action}).`;
    try {
      await repositories.workflowHistory.append({
        HistoryId: `hst-${now.replace(/[^0-9]/g, '').slice(0, 14)}-${Math.floor(Math.random() * 1e6).toString(36)}`,
        ArticleId: context.article.ArticleId,
        Title: historyTitle,
        NewState: 'published',
        PreviousState: previousWorkflowState,
        ActionDateUtc: now,
        ActorEmail: context.article.AuthorEmail,
        ActionNote: historyNote,
      });
    } catch (err) {
      const message =
        err instanceof Error
          ? `HB Article Workflow History append failed after ${workflowStateChanged ? 'publish' : 'republish'}: ${err.message}`
          : `HB Article Workflow History append failed after ${workflowStateChanged ? 'publish' : 'republish'}.`;
      await recordPublishingError({
        articleId: context.article.ArticleId,
        title: context.article.Title,
        destination: context.article.Destination,
        stage: 'articleSync',
        mode: req.mode,
        message,
        bindingId: bindingRow.BindingId,
        nowIso: now,
      });
    }

    return {
      ok: true,
      mode: req.mode,
      action: decision.action,
      reason: decision.reason,
      context,
      page: publishResult.page,
      pageId: publishResult.creation.pageId,
      pageUrl: publishResult.creation.pageUrl,
      bindingId: bindingRow.BindingId,
      itemId: bindingOutcome.itemId,
      decision,
      validation,
    };
  }

  /**
   * Lifecycle helper shared by `archive` and `withdraw`. Encapsulates
   * the orchestration of:
   *   1. master article state + rollup-suppression flags + audit dates
   *   2. existing destination-binding state (if any)
   *   3. workflow-history append
   *
   * Returns a typed LifecycleOutcome so callers can render the exact
   * stage that failed without losing the partial-success surface
   * (e.g. master row updated but binding update failed).
   */
  async function runLifecycleTransition(
    req: LifecycleRequest,
    target: 'archived' | 'withdrawn',
  ): Promise<LifecycleOutcome> {
    const now = (req.now ?? defaultNow)();

    const article = await repositories.articles.getByArticleId(req.articleId);
    if (!article) {
      return {
        ok: false,
        stage: 'load',
        message: `No HB Articles record found for ArticleId '${req.articleId}'.`,
      };
    }
    if (!canTransition(article.WorkflowState, target)) {
      return {
        ok: false,
        stage: 'transition',
        message: `Cannot transition from ${article.WorkflowState} to ${target}.`,
      };
    }

    const previousState = article.WorkflowState;
    const updatedArticle: PublisherArticleRow = {
      ...article,
      WorkflowState: target,
      UpdatedDateUtc: now,
      ArchiveDateUtc: target === 'archived' ? now : article.ArchiveDateUtc,
      // Both archive and withdraw remove the article from rollups /
      // homepage feed / destination landing surfaces. Operators can
      // manually re-enable individual flags later if they explicitly
      // reactivate the article (out of bounded scope today).
      IncludeInDestinationLanding: false,
      IncludeInHomepageFeed: false,
      IncludeInArchive: target === 'archived' ? true : article.IncludeInArchive,
      SuppressFromRollups: true,
    };
    try {
      await repositories.articles.upsert(updatedArticle);
    } catch (err) {
      const message =
        err instanceof Error
          ? `HB Articles ${target} update failed: ${err.message}`
          : `HB Articles ${target} update failed.`;
      await recordPublishingError({
        articleId: article.ArticleId,
        title: article.Title,
        destination: article.Destination,
        stage: 'articleSync',
        mode: target === 'archived' ? 'create' : 'create',
        message,
        nowIso: now,
      });
      return {
        ok: false,
        stage: 'articleUpdate',
        message,
        previousState,
      };
    }

    // Page-unpublish closes the public-visibility loop on archive /
    // withdraw. SharePoint's `SavePageAsDraft` demotes the live
    // page back to draft so the end-user-visible version goes away
    // while the page record (and its history) is preserved for a
    // potential future republish. If the binding has no PageId
    // there is nothing to unpublish, and we skip straight to the
    // binding / history writes.
    let bindingUpdated = false;
    let pageUnpublished = false;
    const existingBinding = await repositories.pageBindings
      .getByArticleId(article.ArticleId)
      .catch(() => undefined);
    if (existingBinding && existingBinding.PageId) {
      const unpublishOutcome = await pageShellService.unpublishPage({
        pageId: existingBinding.PageId,
        siteUrl:
          existingBinding.TargetSiteUrl ??
          article.TargetSiteUrl ??
          '',
      });
      if (!unpublishOutcome.ok) {
        await recordPublishingError({
          articleId: article.ArticleId,
          title: article.Title,
          destination: article.Destination,
          stage: 'pagePublish',
          mode: 'create',
          message: `SavePageAsDraft failed during ${target}: ${unpublishOutcome.message}`,
          bindingId: existingBinding.BindingId,
          nowIso: now,
        });
        return {
          ok: false,
          stage: 'pageUnpublish',
          message: unpublishOutcome.message,
          previousState,
          articleUpdated: true,
        };
      }
      pageUnpublished = true;
    }

    // Binding update mirrors the now-unpublished page: PublishStatus
    // moves to 'draft', SyncStatus to 'pending', and the sync
    // message records the lifecycle action so operators can audit
    // why the binding flipped state. When there is no existing
    // binding we skip cleanly — there is nothing to update.
    if (existingBinding) {
      const updatedBinding: PublisherPageBindingRow = {
        ...existingBinding,
        PublishStatus: 'draft',
        SyncStatus: 'pending',
        LastSyncDateUtc: now,
        LastSyncMessage:
          target === 'archived'
            ? `Article archived; destination page reverted to draft via SavePageAsDraft.`
            : `Article withdrawn; destination page reverted to draft via SavePageAsDraft.`,
      };
      try {
        await repositories.pageBindings.upsert(updatedBinding);
        bindingUpdated = true;
      } catch (err) {
        const message =
          err instanceof Error
            ? `HB Article Destination Pages ${target} update failed: ${err.message}`
            : `HB Article Destination Pages ${target} update failed.`;
        await recordPublishingError({
          articleId: article.ArticleId,
          title: article.Title,
          destination: article.Destination,
          stage: 'bindingWrite',
          mode: 'create',
          message,
          bindingId: existingBinding.BindingId,
          nowIso: now,
        });
        return {
          ok: false,
          stage: 'bindingUpdate',
          message,
          previousState,
          articleUpdated: true,
        };
      }
    }

    try {
      await repositories.workflowHistory.append({
        HistoryId: `hst-${now.replace(/[^0-9]/g, '').slice(0, 14)}-${Math.floor(Math.random() * 1e6).toString(36)}`,
        ArticleId: article.ArticleId,
        Title: `${previousState} → ${target}`,
        NewState: target,
        PreviousState: previousState,
        ActionDateUtc: now,
        ActorEmail: req.actorEmail,
        ActionNote: req.note,
      });
    } catch (err) {
      const message =
        err instanceof Error
          ? `HB Article Workflow History append failed for ${target}: ${err.message}`
          : `HB Article Workflow History append failed for ${target}.`;
      await recordPublishingError({
        articleId: article.ArticleId,
        title: article.Title,
        destination: article.Destination,
        stage: 'articleSync',
        mode: 'create',
        message,
        nowIso: now,
      });
      return {
        ok: false,
        stage: 'historyAppend',
        message,
        previousState,
        articleUpdated: true,
        bindingUpdated,
      };
    }

    return {
      ok: true,
      previousState,
      newState: target,
      articleUpdated: true,
      bindingUpdated,
      pageUnpublished,
    };
  }

  return {
    run,
    archive: (req: LifecycleRequest) => runLifecycleTransition(req, 'archived'),
    withdraw: (req: LifecycleRequest) => runLifecycleTransition(req, 'withdrawn'),
  };
}

/**
 * Lifecycle request for archive / withdraw. Carries the article id +
 * optional actor identity and an operator note that lands on the
 * tenant `HB Article Workflow History.ActionNote`.
 */
export interface LifecycleRequest {
  readonly articleId: string;
  readonly actorEmail?: string;
  readonly note?: string;
  readonly now?: () => string;
}

export type LifecycleOutcome =
  | {
      readonly ok: true;
      readonly previousState: import('./publisherEnums').WorkflowState;
      readonly newState: 'archived' | 'withdrawn';
      readonly articleUpdated: true;
      readonly bindingUpdated: boolean;
      /**
       * True when the destination page existed and was successfully
       * reverted to draft via `SavePageAsDraft`. False when the
       * article had no existing binding / PageId (nothing to
       * unpublish) — this is a legitimate success shape, not a
       * silent failure.
       */
      readonly pageUnpublished: boolean;
    }
  | {
      readonly ok: false;
      readonly stage:
        | 'load'
        | 'transition'
        | 'articleUpdate'
        | 'pageUnpublish'
        | 'bindingUpdate'
        | 'historyAppend';
      readonly message: string;
      readonly previousState?: import('./publisherEnums').WorkflowState;
      readonly articleUpdated?: boolean;
      readonly bindingUpdated?: boolean;
    };

/**
 * Convenience factory: wire an orchestrator from repositories + a page-
 * creation service + a binding writer, using the default v1 shell.
 */
export function createDefaultPublishOrchestrator(deps: {
  repositories: PublisherRepositories;
  pageBindingWriter: PageBindingWriter;
  pageCreation: Parameters<typeof createPageShellService>[0]['pageCreation'];
}) {
  return createPublishOrchestrator({
    repositories: deps.repositories,
    pageBindingWriter: deps.pageBindingWriter,
    pageShellService: createPageShellService({
      pageCreation: deps.pageCreation,
    }),
  });
}
