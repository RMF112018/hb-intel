/**
 * End-to-end publish orchestrator for the Project Spotlight publisher.
 *
 * Ties together:
 *   1. `buildPublishResolutionContext` — reads post + children + active
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
 * and `republish`. It never duplicates a live page for the same post:
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
import type { PublisherPageBindingRow } from './publisherContracts';
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
        | 'bindingWrite';
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
    stage: 'resolution' | 'composition' | 'validation' | 'policy' | 'pagePublish' | 'bindingWrite',
    mode: PublishMode,
  ): import('./publisherEnums').PublishingErrorOperation {
    if (stage === 'bindingWrite') return 'sync';
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
    readonly stage: 'resolution' | 'composition' | 'validation' | 'policy' | 'pagePublish' | 'bindingWrite';
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

  return { run };
}

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
