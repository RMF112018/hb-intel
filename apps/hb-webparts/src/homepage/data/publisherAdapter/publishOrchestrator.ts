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
 *      `PostId`.
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
import type { LastOperation } from './publisherEnums';

export type PublishMode = 'create' | 'republish' | 'preview';

export interface PublishRequest {
  readonly postId: string;
  readonly mode: PublishMode;
  /** Optional: when true, unchanged content + versions short-circuits to `noOp`. */
  readonly idempotent?: boolean;
  /** Caller-controlled clock; deterministic for tests. */
  readonly now?: () => string;
  /** Caller-supplied BindingId factory for new rows; default = `bnd-${PostId}-${timestamp}`. */
  readonly generateBindingId?: (postId: string, nowIso: string) => string;
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
    }
  | {
      readonly ok: false;
      readonly stage:
        | 'resolution'
        | 'composition'
        | 'policy'
        | 'pagePublish'
        | 'bindingWrite';
      readonly message: string;
      readonly decision?: RepublishDecision;
      readonly page?: ComposedPage;
    };

export function createPublishOrchestrator(deps: PublishOrchestratorDeps) {
  const { repositories, pageBindingWriter, pageShellService } = deps;

  function defaultNow(): string {
    return new Date().toISOString();
  }

  function defaultBindingId(postId: string, nowIso: string): string {
    return `bnd-${postId}-${nowIso.replace(/[^0-9]/g, '').slice(0, 14)}`;
  }

  async function run(req: PublishRequest): Promise<PublishOutcome> {
    const now = (req.now ?? defaultNow)();
    const bindingIdFactory = req.generateBindingId ?? defaultBindingId;

    const resolution = await buildPublishResolutionContext(
      repositories,
      req.postId,
    );
    if (!resolution.ok) {
      return {
        ok: false,
        stage: 'resolution',
        message: resolution.message,
      };
    }

    const { context } = resolution;

    // Preview never writes.
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
      };
    }

    const { page, structuralErrors } = pageShellService.composePage(context);
    if (structuralErrors.length > 0) {
      return {
        ok: false,
        stage: 'composition',
        message: `Composed page failed structural validation: ${structuralErrors.join('; ')}`,
        page,
      };
    }

    const decision = decideRepublishAction({
      composed: page,
      template: context.template,
      existingBinding: context.existingBinding,
      idempotent: req.idempotent,
    });

    if (decision.action === 'blocked') {
      return {
        ok: false,
        stage: 'policy',
        message: `Republish blocked: ${decision.reason}. ${decision.notes.join(' ')}`,
        decision,
        page,
      };
    }

    if (decision.action === 'noOp') {
      const bindingId = context.existingBinding?.BindingId ?? bindingIdFactory(req.postId, now);
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
      return {
        ok: false,
        stage: 'pagePublish',
        message: publishResult.message,
        decision,
        page: publishResult.page ?? page,
      };
    }

    const lastOperation: LastOperation =
      decision.action === 'create'
        ? 'publish'
        : decision.action === 'regenerate'
          ? 'regenerate'
          : 'republish';

    const bindingRow: PublisherPageBindingRow = {
      BindingId:
        decision.action === 'inPlaceUpdate' && context.existingBinding
          ? context.existingBinding.BindingId
          : bindingIdFactory(req.postId, now),
      PostId: context.post.PostId,
      TargetSiteUrl: context.post.TargetSiteUrl,
      TargetSiteKey: context.post.TargetSiteKey,
      PageId: publishResult.creation.pageId,
      PageName: publishResult.page.identity.pageName,
      PageUrl: publishResult.creation.pageUrl,
      SourceTemplatePath: publishResult.page.identity.sourceTemplatePath,
      PageShellKey: publishResult.page.identity.shellKey,
      PageShellVersion: publishResult.page.identity.shellVersion,
      TemplateKey: publishResult.page.identity.templateKey,
      TemplateVersion: publishResult.page.identity.templateVersion,
      BindingStatus: 'published',
      LastOperation: lastOperation,
      LastOperationDateUtc: now,
      LastSuccessfulSyncDateUtc: now,
    };

    const bindingOutcome = await pageBindingWriter.upsert({ row: bindingRow });
    if (!bindingOutcome.ok) {
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
