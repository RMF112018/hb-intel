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
 * and `republish`. It never duplicates a live page for the same
 * article: when the decision is `inPlaceUpdate`, the orchestrator
 * passes the bound `PageId` as `targetPageId` into the page-creation
 * service, which PATCHes canvas on that exact id so `PageId` /
 * `PageUrl` / `PageName` are preserved verbatim from the existing
 * binding row. When the decision is `regenerate` (template-key
 * drift or page-name drift), the single `HB Article Destination
 * Pages` row is MERGEd with the new identity in place — the
 * superseded identity is stamped into the workflow-history
 * ActionNote as the durable lineage record (the tenant list is
 * one-row authoritative per `ArticleId`).
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
import { resolveDestinationSiteUrl } from './destinationSiteUrls';

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
  /**
   * Actual operator identity performing the publish / republish.
   * Stamped onto the workflow-history row's `ActorEmail`. When
   * omitted the orchestrator falls back to `article.AuthorEmail`
   * for back-compat, but every UI caller is expected to pass the
   * current SPFx user's email so audit rows reflect the acting
   * user rather than the article author. Closes Phase-05 Prompt-04.
   */
  readonly actorEmail?: string;
}

export interface PublishOrchestratorDeps {
  readonly repositories: PublisherRepositories;
  readonly pageBindingWriter: PageBindingWriter;
  readonly pageShellService: PageShellService;
}

/**
 * Prior binding identity captured just before a regenerate write
 * supersedes the single `HB Article Destination Pages` row. Populated
 * only when the decision is `regenerate` and the article had a
 * pre-existing binding row; used to stamp the workflow-history note
 * and returned on the success outcome so callers can audit the
 * supersession without re-reading the list.
 */
export interface SupersededBindingIdentity {
  readonly bindingId: string;
  readonly pageId?: string;
  readonly pageName?: string;
  readonly pageUrl?: string;
}

export interface PublishRollbackResult {
  readonly attempted: boolean;
  readonly succeeded?: boolean;
  readonly message: string;
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
      /**
       * Populated only on `action: 'regenerate'` when a prior binding
       * row existed. Records the identity the single-row authoritative
       * binding carried before the MERGE — the durable record of the
       * supersession lives in `HB Article Workflow History`.
       */
      readonly supersededBinding?: SupersededBindingIdentity;
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
        | 'articleSync'
        | 'historyAppend';
      readonly message: string;
      readonly decision?: RepublishDecision;
      readonly page?: ComposedPage;
      readonly validation?: ValidationResult;
      readonly rollback?: PublishRollbackResult;
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
   * Internal failure-stage union used by the orchestrator's two
   * callers — `run` (publish / republish / preview) and
   * `runLifecycleTransition` (archive / withdraw). Lifecycle-only
   * stages are listed alongside publish stages so the error
   * recorder can classify both consistently.
   */
  type FailureStage =
    | 'resolution'
    | 'composition'
    | 'validation'
    | 'policy'
    | 'pagePublish'
    | 'pageUnpublish'
    | 'bindingLookup'
    | 'bindingWrite'
    | 'bindingUpdate'
    | 'articleSync'
    | 'articleUpdate'
    | 'historyAppend';

  /**
   * Map an internal failure stage + caller context to the coarse
   * tenant `Operation` Choice on `HB Article Publishing Errors`
   * (create / update / publish / sync). The tenant column is
   * intentionally narrow; the orchestrator's stage + lifecycle
   * action carry the real precision and surface in the Title /
   * ErrorSummary text.
   *
   * Mapping:
   *   - publish-side resolution/composition/validation/policy/
   *     pagePublish: `publish` for republish, `create` for create,
   *     `publish` otherwise.
   *   - lifecycle pageUnpublish: `publish` (it is a page-side
   *     action against `_api/sitepages/pages(...)`).
   *   - any *Sync / *Update / *Write / historyAppend stage: `sync`
   *     (these are list-row reconciliation failures).
   */
  function operationFor(
    stage: FailureStage,
    mode: PublishMode,
    lifecycleAction: 'archive' | 'withdraw' | 'manualTransition' | undefined,
  ): import('./publisherEnums').PublishingErrorOperation {
    if (stage === 'pageUnpublish') return 'publish';
    if (lifecycleAction !== undefined) {
      return 'sync';
    }
    if (
      stage === 'bindingWrite' ||
      stage === 'bindingUpdate' ||
      stage === 'articleSync' ||
      stage === 'articleUpdate' ||
      stage === 'historyAppend'
    ) {
      return 'sync';
    }
    if (mode === 'create') return 'create';
    return 'publish';
  }

  /**
   * Append a tenant `HB Article Publishing Errors` row for the failure.
   * Best-effort: a failing error-list write is logged to the console
   * but never re-thrown — the orchestrator's own typed failure result
   * is the authoritative caller signal.
   *
   * The persisted `Title` is prefixed with `${context}.${stage}` so
   * an operator scanning the error list can see at a glance whether
   * the failure was a publish, republish, archive, or withdraw, and
   * which step inside that lifecycle blew up. The tenant `Operation`
   * Choice still maps onto the four coarse buckets the column
   * accepts; precision lives in `Title` and `ErrorSummary`.
   */
  async function recordPublishingError(input: {
    readonly articleId: string;
    readonly title: string | undefined;
    readonly destination: import('./publisherEnums').Destination | undefined;
    readonly stage: FailureStage;
    readonly mode: PublishMode;
    /**
     * When set, the failure was raised by archive / withdraw rather
     * than by the publish/republish path. The recorder uses this to
     * tag the persisted Title so operators can distinguish lifecycle
     * failures from publish failures even though the tenant
     * `Operation` Choice cannot.
     */
    readonly lifecycleAction?: 'archive' | 'withdraw' | 'manualTransition';
    readonly message: string;
    readonly bindingId?: string;
    readonly nowIso: string;
  }): Promise<void> {
    const context = input.lifecycleAction ?? input.mode;
    const prefix = `${context}.${input.stage}`;
    try {
      await repositories.publishingErrors.append({
        ErrorId: `err-${input.nowIso.replace(/[^0-9]/g, '').slice(0, 14)}-${Math.floor(Math.random() * 1e6).toString(36)}`,
        ArticleId: input.articleId,
        Title:
          input.title && input.title.trim().length > 0
            ? `${prefix}: ${input.title}`
            : `${prefix} failure for ArticleId ${input.articleId}`,
        Destination: input.destination ?? 'projectSpotlight',
        Operation: operationFor(input.stage, input.mode, input.lifecycleAction),
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

    // Milestone legacy hard-block (phase-09 prompt-06). This runs BEFORE
    // resolution so the block is a typed `policy` rejection rather than
    // the noisy `resolution` failure the template resolver would raise
    // when it cannot find an operational template for milestone
    // content. Preview stays fully allowed so operators can still see
    // the article; only non-preview modes are blocked here. The
    // orchestrator reads the master row directly so the gate does not
    // depend on a successful resolution.
    if (req.mode !== 'preview') {
      const preArticle = await repositories.articles.getByArticleId(req.articleId);
      if (
        preArticle &&
        preArticle.ArticleContentType === 'milestoneSpotlight'
      ) {
        const decision: RepublishDecision = {
          action: 'blocked',
          reason: 'legacyContentType',
          notes: [
            "ArticleContentType 'milestoneSpotlight' is read-compatible only; publish and republish are blocked. Move to an operational content type before publishing.",
          ],
        };
        const message = `Publish blocked: ${decision.reason}. ${decision.notes.join(' ')}`;
        await recordPublishingError({
          articleId: preArticle.ArticleId,
          title: preArticle.Title,
          destination: preArticle.Destination,
          stage: 'policy',
          mode: req.mode,
          message,
          nowIso: now,
        });
        return {
          ok: false,
          stage: 'policy',
          message,
          decision,
        };
      }
    }

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

    // Republish approval gate — defense-in-depth with the UI. A republish
    // keeps the article stamped at `published`, so the only legitimate
    // source state for republish is `published`. Articles in draft /
    // review / approved must go through the ordinary Publish path so the
    // approval workflow is honored; this rejects any UI drift (or
    // automation) that would otherwise re-enter the publish pipeline
    // from an ineligible lifecycle state. `archived` / `withdrawn` are
    // already blocked by `decideRepublishAction`; those cases are kept
    // there for backward-compat test coverage.
    if (req.mode === 'republish' && context.article.WorkflowState !== 'published') {
      const decision: RepublishDecision = {
        action: 'blocked',
        reason: 'articleNotPublished',
        notes: [
          `Republish requires the article to be in 'published' state; current state is '${context.article.WorkflowState}'. Use the Publish action from 'approved' instead.`,
        ],
      };
      const message = `Republish blocked: ${decision.reason}. ${decision.notes.join(' ')}`;
      await recordPublishingError({
        articleId: context.article.ArticleId,
        title: context.article.Title,
        destination: context.article.Destination,
        stage: 'policy',
        mode: req.mode,
        message,
        bindingId: context.existingBinding?.BindingId,
        nowIso: (req.now ?? defaultNow)(),
      });
      return {
        ok: false,
        stage: 'policy',
        message,
        decision,
      };
    }

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

    // `inPlaceUpdate` is a true same-page write: we target the
    // already-bound SharePoint PageId instead of letting the
    // creation service resolve a page by filename. Without this,
    // slug / page-name drift could cause the filename-based lookup
    // to bind a new page or mutate an unrelated page — the exact
    // guarantee the policy layer advertises. The policy layer is
    // responsible for forcing `regenerate` when PageName actually
    // changed, so by the time we reach this branch the bound
    // PageId IS the authoritative target.
    const inPlaceTargetPageId =
      decision.action === 'inPlaceUpdate' &&
      typeof context.existingBinding?.PageId === 'string' &&
      context.existingBinding.PageId.length > 0
        ? context.existingBinding.PageId
        : undefined;
    const publishResult = await pageShellService.publishPage(context, {
      targetPageId: inPlaceTargetPageId,
    });
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
    const publishedPage = publishResult.page;
    const publishedCreation = publishResult.creation;

    async function rollbackPublishedPage(input: {
      readonly reasonStage: 'bindingWrite' | 'articleSync' | 'historyAppend';
      readonly reasonMessage: string;
      readonly bindingId?: string;
    }): Promise<PublishRollbackResult> {
      const siteUrl = publishedPage.identity.targetSiteUrl;
      const pageId = publishedCreation.pageId;
      if (!siteUrl || siteUrl.trim().length === 0 || !pageId || pageId.trim().length === 0) {
        return {
          attempted: false,
          message:
            `Compensating SavePageAsDraft skipped after ${input.reasonStage}: missing page identity ` +
            `(siteUrl='${siteUrl ?? ''}', pageId='${pageId ?? ''}').`,
        };
      }
      const rollback = await pageShellService.unpublishPage({
        pageId,
        siteUrl,
      });
      if (rollback.ok) {
        return {
          attempted: true,
          succeeded: true,
          message:
            `Compensating SavePageAsDraft succeeded after ${input.reasonStage} ` +
            `(pageId=${pageId}).`,
        };
      }
      const rollbackMessage =
        `Compensating SavePageAsDraft failed after ${input.reasonStage}: ${rollback.message}`;
      await recordPublishingError({
        articleId: context.article.ArticleId,
        title: context.article.Title,
        destination: context.article.Destination,
        stage: 'pageUnpublish',
        mode: req.mode,
        message:
          `${rollbackMessage}. Original failure: ${input.reasonMessage}`,
        bindingId: input.bindingId,
        nowIso: now,
      });
      return {
        attempted: true,
        succeeded: false,
        message: rollbackMessage,
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
      // HB Articles.TargetSiteUrl is tenant-optional; the binding
      // column is required (tenant schema). Fill from the article
      // when the author supplied one (validation has already
      // pinned it to the canonical URL), otherwise derive from the
      // destination — closes the P2-2 policy/schema mismatch so
      // authors aren't carrying a field that is effectively a
      // constant per destination.
      TargetSiteUrl:
        context.article.TargetSiteUrl ??
        resolveDestinationSiteUrl(context.article.Destination) ??
        '',
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
      const rollback = await rollbackPublishedPage({
        reasonStage: 'bindingWrite',
        reasonMessage: bindingOutcome.message,
        bindingId: bindingRow.BindingId,
      });
      const message = `${bindingOutcome.message} ${rollback.message}`;
      await recordPublishingError({
        articleId: context.article.ArticleId,
        title: context.article.Title,
        destination: context.article.Destination,
        stage: 'bindingWrite',
        mode: req.mode,
        message,
        bindingId: bindingRow.BindingId,
        nowIso: now,
      });
      return {
        ok: false,
        stage: 'bindingWrite',
        message,
        decision,
        page: publishResult.page,
        rollback,
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
      // Back-sync the authoritative destination site URL that the
      // publish path actually used. When the article column was
      // blank (tenant-optional), the orchestrator derived a
      // canonical URL from `Destination` and wrote it to the
      // binding row; stamp the same value on the master record so
      // `HB Articles.TargetSiteUrl` and
      // `HB Article Destination Pages.TargetSiteUrl` agree after
      // every successful publish / regenerate / in-place update.
      // Closes the Phase-05 Prompt-02 back-sync gap.
      TargetSiteUrl: bindingRow.TargetSiteUrl,
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
      const baseMessage =
        err instanceof Error
          ? `HB Articles back-sync failed after publish: ${err.message}`
          : 'HB Articles back-sync failed after publish.';
      const rollback = await rollbackPublishedPage({
        reasonStage: 'articleSync',
        reasonMessage: baseMessage,
        bindingId: bindingRow.BindingId,
      });
      const message = `${baseMessage} ${rollback.message}`;
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
        rollback,
      };
    }

    // Append a workflow-history row for every successful publish or
    // republish that actually wrote a page and binding. This closes
    // the control-plane lifecycle: first publish records the
    // `previous → published` transition, republish records a
    // `published → published` event tagged with the republish action
    // (inPlaceUpdate / regenerate) so the audit trail reflects page
    // identity changes. `noOp` returned earlier and never reaches
    // this code path. History append is a REQUIRED publish-closure
    // step: if this append fails, a compensating SavePageAsDraft
    // is attempted and the publish returns `ok: false`.
    // On `regenerate`, capture the identity of the single
    // authoritative binding row before it is superseded in place
    // (new BindingId + new PageId/PageUrl/PageName overwrite the
    // prior values on the same SharePoint item). The prior identity
    // is stamped into the workflow-history ActionNote as a
    // structured `supersededBinding=…` marker — that row IS the
    // durable lineage record for the one-row binding model, since
    // the tenant list itself does not preserve prior-binding rows.
    const supersededBinding: SupersededBindingIdentity | undefined =
      decision.action === 'regenerate' && context.existingBinding
        ? {
            bindingId: context.existingBinding.BindingId,
            pageId: context.existingBinding.PageId,
            pageName: context.existingBinding.PageName,
            pageUrl: context.existingBinding.PageUrl,
          }
        : undefined;
    const supersessionMarker = supersededBinding
      ? ` [supersededBinding=${JSON.stringify(supersededBinding)}; newBinding=${JSON.stringify(
          {
            bindingId: bindingRow.BindingId,
            pageId: bindingRow.PageId,
            pageName: bindingRow.PageName,
            pageUrl: bindingRow.PageUrl,
          },
        )}]`
      : '';
    const historyTitle = workflowStateChanged
      ? `${previousWorkflowState} → published`
      : `republish (${decision.action})`;
    const historyNote = workflowStateChanged
      ? `Article published via orchestrator (${decision.action}).${supersessionMarker}`
      : `Article republished via orchestrator (${decision.action}).${supersessionMarker}`;
    try {
      await repositories.workflowHistory.append({
        HistoryId: `hst-${now.replace(/[^0-9]/g, '').slice(0, 14)}-${Math.floor(Math.random() * 1e6).toString(36)}`,
        ArticleId: context.article.ArticleId,
        Title: historyTitle,
        NewState: 'published',
        PreviousState: previousWorkflowState,
        ActionDateUtc: now,
        // Prefer the acting operator's email (threaded in from the
        // UI's SPFx current-user context); fall back to the article
        // author only when the caller did not supply one. Prior to
        // Phase-05 Prompt-04 this path always wrote the author,
        // which misattributed publishes performed by editors who
        // didn't author the article.
        ActorEmail: req.actorEmail ?? context.article.AuthorEmail,
        ActionNote: historyNote,
      });
    } catch (err) {
      const baseMessage =
        err instanceof Error
          ? `HB Article Workflow History append failed after ${workflowStateChanged ? 'publish' : 'republish'}: ${err.message}`
          : `HB Article Workflow History append failed after ${workflowStateChanged ? 'publish' : 'republish'}.`;
      // The workflow-history append is the LAST step of the
      // publish path, and it has its own failing subsystem
      // (`HB Article Workflow History`, not `HB Articles`).
      // Classifying the error as `articleSync` (the prior failure
      // mode for the back-sync upsert) made publishing-error rows
      // indistinguishable between "article back-sync failed" and
      // "history append failed" — operators could not tell which
      // subsystem to inspect. Closes P1-4.
      const rollback = await rollbackPublishedPage({
        reasonStage: 'historyAppend',
        reasonMessage: baseMessage,
        bindingId: bindingRow.BindingId,
      });
      const message = `${baseMessage} ${rollback.message}`;
      await recordPublishingError({
        articleId: context.article.ArticleId,
        title: context.article.Title,
        destination: context.article.Destination,
        stage: 'historyAppend',
        mode: req.mode,
        message,
        bindingId: bindingRow.BindingId,
        nowIso: now,
      });
      return {
        ok: false,
        stage: 'historyAppend',
        message,
        decision,
        page: publishResult.page,
        rollback,
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
      supersededBinding,
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
    // Page-unpublish closes the public-visibility loop on archive /
    // withdraw. SharePoint's `SavePageAsDraft` demotes the live
    // page back to draft so the end-user-visible version goes away
    // while the page record (and its history) is preserved for a
    // potential future republish. If the binding has no PageId
    // there is nothing to unpublish, and we skip straight to the
    // binding / history writes.
    let bindingUpdated = false;
    let pageUnpublished = false;
    let historyAppended = false;
    // Fail-closed binding lookup. Previously this used
    // `.catch(() => undefined)`, which swallowed a failed read and
    // let the lifecycle continue as if no binding existed — so a
    // transient SharePoint failure could archive/withdraw the master
    // article while the live destination page remained visible. Treat
    // a throw as an explicit `bindingLookup` failure; only a positive
    // `undefined` return means "no binding exists" and is safe to
    // proceed past page-unpublish.
    let existingBinding: PublisherPageBindingRow | undefined;
    try {
      existingBinding = await repositories.pageBindings.getByArticleId(
        article.ArticleId,
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? `Binding lookup failed during ${target}: ${err.message}`
          : `Binding lookup failed during ${target}.`;
      await recordPublishingError({
        articleId: article.ArticleId,
        title: article.Title,
        destination: article.Destination,
        stage: 'bindingLookup',
        mode: 'create',
        lifecycleAction: target === 'archived' ? 'archive' : 'withdraw',
        message,
        nowIso: now,
      });
      return {
        ok: false,
        stage: 'bindingLookup',
        message,
        previousState,
        articleUpdated: false,
        bindingUpdated: false,
        pageUnpublished: false,
        historyAppended: false,
      };
    }
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
          stage: 'pageUnpublish',
          mode: 'create',
          lifecycleAction: target === 'archived' ? 'archive' : 'withdraw',
          message: `SavePageAsDraft failed during ${target}: ${unpublishOutcome.message}`,
          bindingId: existingBinding.BindingId,
          nowIso: now,
        });
        return {
          ok: false,
          stage: 'pageUnpublish',
          message: unpublishOutcome.message,
          previousState,
          articleUpdated: false,
          bindingUpdated: false,
          pageUnpublished: false,
          historyAppended: false,
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
          stage: 'bindingUpdate',
          mode: 'create',
          lifecycleAction: target === 'archived' ? 'archive' : 'withdraw',
          message,
          bindingId: existingBinding.BindingId,
          nowIso: now,
        });
        return {
          ok: false,
          stage: 'bindingUpdate',
          message,
          previousState,
          articleUpdated: false,
          bindingUpdated: false,
          pageUnpublished,
          historyAppended: false,
        };
      }
    }

    // Phase-09 Prompt-04: master-state closure BEFORE history append.
    // Previously the workflow-history row was written first, so an
    // articleUpdate failure left a false-forward "previous → target"
    // history trail while the master row was still in `previousState`.
    // Reorder so the authoritative master is moved first; only after a
    // successful master stamp do we append the durable audit row. If
    // the history append then fails, compensate by reverting the
    // master row back to `previousState` and surface the rollback
    // outcome on the typed failure result.
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
      // Mirror the demoted destination on the master's page-sync
      // metadata so the two rows tell the same lifecycle story.
      // `PageSyncStatus` flips to `'pending'` to match the binding
      // row's `SyncStatus: 'pending'` (set above) and
      // `LastPageSyncDateUtc` uses the same `now` the binding write
      // recorded. PageId / PageName / PageUrl are preserved — the
      // page record still exists as a draft and is needed for a
      // future republish. Closes the Phase-05 Prompt-03 drift.
      PageSyncStatus: 'pending',
      LastPageSyncDateUtc: now,
    };
    let articleUpdated = false;
    try {
      await repositories.articles.upsert(updatedArticle);
      articleUpdated = true;
    } catch (err) {
      const message =
        err instanceof Error
          ? `HB Articles ${target} update failed: ${err.message}`
          : `HB Articles ${target} update failed.`;
      await recordPublishingError({
        articleId: article.ArticleId,
        title: article.Title,
        destination: article.Destination,
        stage: 'articleUpdate',
        mode: 'create',
        lifecycleAction: target === 'archived' ? 'archive' : 'withdraw',
        message,
        nowIso: now,
      });
      return {
        ok: false,
        stage: 'articleUpdate',
        message,
        previousState,
        articleUpdated: false,
        bindingUpdated,
        pageUnpublished,
        historyAppended: false,
      };
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
      historyAppended = true;
    } catch (err) {
      // History append failed AFTER the master row was stamped.
      // Compensate by reverting the master back to `previousState` so
      // the lifecycle ends up fully rolled back rather than split.
      const baseMessage =
        err instanceof Error
          ? `HB Article Workflow History append failed for ${target}: ${err.message}`
          : `HB Article Workflow History append failed for ${target}.`;
      let rollback: { attempted: boolean; succeeded: boolean; message: string } = {
        attempted: false,
        succeeded: false,
        message: 'No rollback attempted — master was not stamped.',
      };
      try {
        await repositories.articles.upsert(article);
        rollback = {
          attempted: true,
          succeeded: true,
          message: `Master article reverted to '${previousState}'.`,
        };
        articleUpdated = false;
      } catch (rollbackErr) {
        rollback = {
          attempted: true,
          succeeded: false,
          message:
            rollbackErr instanceof Error
              ? `Master rollback to '${previousState}' failed: ${rollbackErr.message}`
              : `Master rollback to '${previousState}' failed.`,
        };
      }
      const message = rollback.attempted
        ? `${baseMessage} (${rollback.message})`
        : baseMessage;
      await recordPublishingError({
        articleId: article.ArticleId,
        title: article.Title,
        destination: article.Destination,
        stage: 'historyAppend',
        mode: 'create',
        lifecycleAction: target === 'archived' ? 'archive' : 'withdraw',
        message,
        nowIso: now,
      });
      return {
        ok: false,
        stage: 'historyAppend',
        message,
        previousState,
        articleUpdated,
        bindingUpdated,
        pageUnpublished,
        historyAppended: false,
        rollback,
      };
    }

    return {
      ok: true,
      previousState,
      newState: target,
      articleUpdated: true,
      bindingUpdated,
      pageUnpublished,
      historyAppended,
    };
  }

  async function transitionManual(
    req: ManualTransitionRequest,
  ): Promise<ManualTransitionOutcome> {
    const now = (req.now ?? defaultNow)();
    const article = await repositories.articles.getByArticleId(req.articleId);
    if (!article) {
      return {
        ok: false,
        stage: 'load',
        message: `No HB Articles record found for ArticleId '${req.articleId}'.`,
        articleUpdated: false,
        historyAppended: false,
      };
    }
    if (!canTransition(article.WorkflowState, req.to)) {
      return {
        ok: false,
        stage: 'transition',
        message: `Cannot transition from ${article.WorkflowState} to ${req.to}.`,
        previousState: article.WorkflowState,
        articleUpdated: false,
        historyAppended: false,
      };
    }

    const previousState = article.WorkflowState;
    const updatedArticle: PublisherArticleRow = {
      ...article,
      WorkflowState: req.to,
      UpdatedDateUtc: now,
    };
    try {
      await repositories.articles.upsert(updatedArticle);
    } catch (err) {
      const message =
        err instanceof Error
          ? `HB Articles manual transition update failed: ${err.message}`
          : 'HB Articles manual transition update failed.';
      await recordPublishingError({
        articleId: article.ArticleId,
        title: article.Title,
        destination: article.Destination,
        stage: 'articleUpdate',
        mode: 'create',
        lifecycleAction: 'manualTransition',
        message,
        nowIso: now,
      });
      return {
        ok: false,
        stage: 'articleUpdate',
        message,
        previousState,
        articleUpdated: false,
        historyAppended: false,
      };
    }

    try {
      await repositories.workflowHistory.append({
        HistoryId: `hst-${now.replace(/[^0-9]/g, '').slice(0, 14)}-${Math.floor(Math.random() * 1e6).toString(36)}`,
        ArticleId: article.ArticleId,
        Title: `${previousState} → ${req.to}`,
        NewState: req.to,
        PreviousState: previousState,
        ActionDateUtc: now,
        ActorEmail: req.actorEmail,
        ActionNote: req.note,
      });
      return {
        ok: true,
        previousState,
        newState: req.to,
        articleUpdated: true,
        historyAppended: true,
      };
    } catch (err) {
      const baseMessage =
        err instanceof Error
          ? `HB Article Workflow History append failed for ${req.to}: ${err.message}`
          : `HB Article Workflow History append failed for ${req.to}.`;
      await recordPublishingError({
        articleId: article.ArticleId,
        title: article.Title,
        destination: article.Destination,
        stage: 'historyAppend',
        mode: 'create',
        lifecycleAction: 'manualTransition',
        message: baseMessage,
        nowIso: now,
      });

      const rollbackArticle: PublisherArticleRow = {
        ...article,
        UpdatedDateUtc: now,
      };
      try {
        await repositories.articles.upsert(rollbackArticle);
        return {
          ok: false,
          stage: 'historyAppend',
          message: `${baseMessage} Rolled back article state to ${previousState}.`,
          previousState,
          articleUpdated: false,
          historyAppended: false,
          rollback: {
            attempted: true,
            succeeded: true,
            message: `Article state rollback succeeded (${req.to} -> ${previousState}).`,
          },
        };
      } catch (rollbackErr) {
        const rollbackMessage =
          rollbackErr instanceof Error
            ? `Article rollback after history failure failed: ${rollbackErr.message}`
            : 'Article rollback after history failure failed.';
        await recordPublishingError({
          articleId: article.ArticleId,
          title: article.Title,
          destination: article.Destination,
          stage: 'articleUpdate',
          mode: 'create',
          lifecycleAction: 'manualTransition',
          message: `${rollbackMessage}. Original failure: ${baseMessage}`,
          nowIso: now,
        });
        return {
          ok: false,
          stage: 'historyAppend',
          message: `${baseMessage} ${rollbackMessage}`,
          previousState,
          articleUpdated: true,
          historyAppended: false,
          rollback: {
            attempted: true,
            succeeded: false,
            message: rollbackMessage,
          },
        };
      }
    }
  }

  return {
    run,
    archive: (req: LifecycleRequest) => runLifecycleTransition(req, 'archived'),
    withdraw: (req: LifecycleRequest) => runLifecycleTransition(req, 'withdrawn'),
    transitionManual,
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

export interface ManualTransitionRequest {
  readonly articleId: string;
  readonly to: import('./publisherEnums').WorkflowState;
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
      readonly historyAppended: true;
    }
  | {
      readonly ok: false;
      readonly stage:
        | 'load'
        | 'transition'
        | 'articleUpdate'
        | 'bindingLookup'
        | 'pageUnpublish'
        | 'bindingUpdate'
        | 'historyAppend';
      readonly message: string;
      readonly previousState?: import('./publisherEnums').WorkflowState;
      readonly articleUpdated?: boolean;
      readonly bindingUpdated?: boolean;
      readonly pageUnpublished?: boolean;
      readonly historyAppended?: boolean;
      /**
       * Populated when a late-stage failure triggered compensating
       * master-state rollback (e.g. history-append failure after the
       * master article was already stamped). Makes it explicit whether
       * the orchestrator attempted to undo prior work and whether the
       * compensation succeeded, so callers never have to guess which
       * side of a split-state failure they are looking at.
       */
      readonly rollback?: {
        readonly attempted: boolean;
        readonly succeeded: boolean;
        readonly message: string;
      };
    };

export type ManualTransitionOutcome =
  | {
      readonly ok: true;
      readonly previousState: import('./publisherEnums').WorkflowState;
      readonly newState: import('./publisherEnums').WorkflowState;
      readonly articleUpdated: true;
      readonly historyAppended: true;
    }
  | {
      readonly ok: false;
      readonly stage: 'load' | 'transition' | 'articleUpdate' | 'historyAppend';
      readonly message: string;
      readonly previousState?: import('./publisherEnums').WorkflowState;
      readonly articleUpdated: boolean;
      readonly historyAppended: boolean;
      readonly rollback?: {
        readonly attempted: boolean;
        readonly succeeded: boolean;
        readonly message: string;
      };
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
