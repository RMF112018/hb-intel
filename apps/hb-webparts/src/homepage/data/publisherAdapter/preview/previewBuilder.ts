/**
 * Publisher preview builder.
 *
 * Orchestrates the **same** resolution + composition functions the
 * publish orchestrator uses, so preview and publish cannot diverge
 * (operating-charter rule 8). Adds a validation pass + drift flags
 * so the authoring UI can surface actionable guidance without
 * duplicating logic.
 *
 * No list writes. No page-creation calls. Pure read + compose +
 * validate. The orchestrator's `preview` mode is still the public
 * entry point for the UI; this builder is the shared implementation
 * the orchestrator delegates to when validation + drift flags are
 * needed.
 */

import { composeProjectSpotlightPage, validateComposedPageStructure } from '../pageGeneration/pageCompositor';
import type { ComposedPage } from '../pageGeneration/pageCompositor';
import { PROJECT_SPOTLIGHT_V1_SHELL } from '../pageGeneration/xmlShellManifest';
import type { PageShellManifest } from '../pageGeneration/xmlShellManifest';
import { buildPublishResolutionContext } from '../publishResolutionContext';
import type { PublishResolutionContext } from '../publishResolutionContext';
import type { PublisherRepositories } from '../publisherRepositories';
import { decideRepublishAction, type RepublishDecision } from '../republishPolicy';
import { validatePublishContext, type ValidationResult } from '../validation/validationEngine';

export interface DriftBanner {
  readonly shellKeyDrift: boolean;
  readonly shellVersionDrift: boolean;
  readonly templateKeyDrift: boolean;
  readonly templateVersionDrift: boolean;
}

export interface PreviewOutcomeOk {
  readonly ok: true;
  readonly resolution: PublishResolutionContext;
  readonly composedPage: ComposedPage;
  readonly structuralErrors: readonly string[];
  readonly validation: ValidationResult;
  readonly decision: RepublishDecision;
  readonly drift: DriftBanner;
}

export interface PreviewOutcomeFailure {
  readonly ok: false;
  readonly reason:
    | 'articleNotFound'
    | 'templateResolutionFailed'
    | 'compositionFailed';
  readonly message: string;
  readonly composedPage?: ComposedPage;
}

export type PreviewOutcome = PreviewOutcomeOk | PreviewOutcomeFailure;

export interface BuildPublisherPreviewOptions {
  readonly shell?: PageShellManifest;
}

function computeDrift(
  context: PublishResolutionContext,
  composed: ComposedPage,
): DriftBanner {
  const binding = context.existingBinding;
  if (!binding) {
    return {
      shellKeyDrift: false,
      shellVersionDrift: false,
      templateKeyDrift: false,
      templateVersionDrift: false,
    };
  }
  return {
    shellKeyDrift: binding.PageShellKey !== composed.identity.shellKey,
    shellVersionDrift:
      binding.PageShellVersion !== composed.identity.shellVersion,
    templateKeyDrift: binding.TemplateKey !== composed.identity.templateKey,
    templateVersionDrift:
      binding.TemplateVersion !== composed.identity.templateVersion,
  };
}

export async function buildPublisherPreview(
  repositories: PublisherRepositories,
  articleId: string,
  options: BuildPublisherPreviewOptions = {},
): Promise<PreviewOutcome> {
  const resolution = await buildPublishResolutionContext(repositories, articleId);
  if (!resolution.ok) {
    return {
      ok: false,
      reason: resolution.reason,
      message: resolution.message,
    };
  }
  const shell = options.shell ?? PROJECT_SPOTLIGHT_V1_SHELL;
  const composedPage = composeProjectSpotlightPage(resolution.context, shell);
  const structuralErrors = validateComposedPageStructure(composedPage);
  if (structuralErrors.length > 0) {
    return {
      ok: false,
      reason: 'compositionFailed',
      message: `Composed page failed structural validation: ${structuralErrors.join('; ')}`,
      composedPage,
    };
  }
  const validation = validatePublishContext(resolution.context, { shell });
  const decision = decideRepublishAction({
    composed: composedPage,
    template: resolution.context.template,
    existingBinding: resolution.context.existingBinding,
  });
  const drift = computeDrift(resolution.context, composedPage);
  return {
    ok: true,
    resolution: resolution.context,
    composedPage,
    structuralErrors,
    validation,
    decision,
    drift,
  };
}
