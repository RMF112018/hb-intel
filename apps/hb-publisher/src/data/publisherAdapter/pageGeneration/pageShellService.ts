/**
 * Page-shell service — glue between the resolution context, the shell
 * manifest, the compositor, and the page-creation service.
 *
 * The service has two public entry points:
 *
 *   - `composePage(context)` — pure; returns the `ComposedPage` plus a
 *     structural-validation result. Used by the Wave 7 preview surface
 *     to render without touching the tenant.
 *   - `publishPage(context)` — async; composes, validates, and then
 *     calls the injected `PageCreationService.createOrUpdate`. Returns
 *     the creation outcome augmented with the composed identity so
 *     Wave 5 binding writes have the data they need.
 *
 * The publish path intentionally does **not** write the page-binding
 * row — binding writes are Wave 5 / Prompt-05 responsibility. This
 * service stops at the point the destination page has been created or
 * updated.
 */

import type { PublishResolutionContext } from '../publishResolutionContext';
import {
  composeProjectSpotlightPage,
  validateComposedPageStructure,
  type ComposedPage,
} from './pageCompositor';
import type {
  PageCreationOutcome,
  PageCreationService,
  PagePublishOutcome,
  PageUnpublishOutcome,
} from './pageCreationService';
import {
  PROJECT_SPOTLIGHT_V1_SHELL,
  type PageShellManifest,
} from './xmlShellManifest';

export interface PageShellServiceDeps {
  readonly pageCreation: PageCreationService;
  readonly shell?: PageShellManifest;
}

export interface ComposePageResult {
  readonly page: ComposedPage;
  readonly structuralErrors: readonly string[];
}

export interface PublishPageFailure {
  readonly ok: false;
  readonly reason:
    | 'structuralValidationFailed'
    | 'pageCreationFailed'
    | 'pagePublishLifecycleFailed';
  readonly message: string;
  readonly structuralErrors?: readonly string[];
  readonly creationFailure?: Extract<PageCreationOutcome, { ok: false }>;
  readonly publishFailure?: Extract<PagePublishOutcome, { ok: false }>;
  readonly page?: ComposedPage;
  readonly creation?: Extract<PageCreationOutcome, { ok: true }>;
}

export interface PublishPageSuccess {
  readonly ok: true;
  readonly page: ComposedPage;
  readonly creation: Extract<PageCreationOutcome, { ok: true }>;
  /**
   * Outcome of the explicit final modern-page publish lifecycle
   * step (`_api/sitepages/pages({pageId})/Publish`). Always
   * populated on `ok: true` — the orchestrator never reports
   * success while skipping this step.
   */
  readonly publish: Extract<PagePublishOutcome, { ok: true }>;
}

export type PublishPageOutcome = PublishPageSuccess | PublishPageFailure;

export interface UnpublishPageInput {
  readonly pageId: string;
  readonly siteUrl: string;
}

export type UnpublishPageOutcome = PageUnpublishOutcome;

export interface PublishPageOptions {
  /**
   * When set, the composed page is written to this existing
   * SharePoint Pages `Id` instead of being created/looked-up by
   * filename. Used by the `inPlaceUpdate` republish path so the
   * bound PageId is the authoritative target — slug/page-name
   * drift cannot silently retarget a different page.
   */
  readonly targetPageId?: string;
}

export interface PageShellService {
  composePage(context: PublishResolutionContext): ComposePageResult;
  publishPage(
    context: PublishResolutionContext,
    options?: PublishPageOptions,
  ): Promise<PublishPageOutcome>;
  /**
   * Thin passthrough to `pageCreation.unpublishLive` — reverts the
   * live destination page to draft without touching the composed
   * canvas. Used by archive / withdraw lifecycles to close the
   * public-visibility loop on the page record itself.
   */
  unpublishPage(input: UnpublishPageInput): Promise<UnpublishPageOutcome>;
}

export function createPageShellService(
  deps: PageShellServiceDeps,
): PageShellService {
  const shell = deps.shell ?? PROJECT_SPOTLIGHT_V1_SHELL;

  return {
    composePage(context) {
      const page = composeProjectSpotlightPage(context, shell);
      const structuralErrors = validateComposedPageStructure(page);
      return { page, structuralErrors };
    },

    async publishPage(context, options) {
      const { page, structuralErrors } = this.composePage(context);
      if (structuralErrors.length > 0) {
        return {
          ok: false,
          reason: 'structuralValidationFailed',
          message: `Composed page failed structural validation: ${structuralErrors.join('; ')}`,
          structuralErrors,
          page,
        };
      }
      const creation = await deps.pageCreation.createOrUpdate({
        page,
        targetPageId: options?.targetPageId,
      });
      if (!creation.ok) {
        return {
          ok: false,
          reason: 'pageCreationFailed',
          message: creation.message,
          creationFailure: creation,
          page,
        };
      }

      // Final modern-page publish lifecycle step. SharePoint Pages
      // leaves `createOrUpdate` results in draft state; without this
      // explicit Publish call the destination page never becomes the
      // live, end-user-visible version. The publish-pipeline must
      // never report success while skipping this step.
      const publish = await deps.pageCreation.publishLive({
        pageId: creation.pageId,
        siteUrl: page.identity.targetSiteUrl,
      });
      if (!publish.ok) {
        return {
          ok: false,
          reason: 'pagePublishLifecycleFailed',
          message: publish.message,
          publishFailure: publish,
          creation,
          page,
        };
      }
      return { ok: true, page, creation, publish };
    },

    async unpublishPage(input) {
      return deps.pageCreation.unpublishLive(input);
    },
  };
}
