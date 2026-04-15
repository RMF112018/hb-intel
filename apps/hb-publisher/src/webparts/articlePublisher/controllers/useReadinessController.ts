/**
 * Readiness controller — pure derivations over the current draft,
 * binding, and preview outcome. Produces the author-facing readiness
 * summary, binding signal, promotion summary, blocking/warning tallies,
 * and the enabled/disabled state for primary rail actions.
 */
import type {
  PromotionPolicyResult,
  PublisherArticleRow,
  PublisherPageBindingRow,
} from '../../../data/publisherAdapter/index.js';
import type { PreviewOutcome } from '../../../data/publisherAdapter/preview/previewBuilder.js';
import { workflowOutcomeLabel } from '../authorLabels.js';
import { unsupportedDestinationNotice } from './draftPolicyHelpers.js';

export interface ReadinessControllerInputs {
  readonly articleDraft: PublisherArticleRow | undefined;
  readonly binding: PublisherPageBindingRow | undefined;
  readonly preview: PreviewOutcome | undefined;
  readonly promotionPolicy: PromotionPolicyResult | undefined;
  readonly busy: boolean;
}

export function useReadinessController(inputs: ReadinessControllerInputs) {
  const { articleDraft, binding, preview, promotionPolicy, busy } = inputs;

  const unsupportedDestinationMessage = articleDraft
    ? unsupportedDestinationNotice(articleDraft.Destination)
    : undefined;
  const unsupportedDestinationLoaded = !!unsupportedDestinationMessage;

  const latestValidation = preview && preview.ok ? preview.validation : undefined;
  const publishBlockedByValidation = !!latestValidation && !latestValidation.ok;

  const readinessSummary = composeReadinessSummary(
    articleDraft,
    binding,
    preview,
    latestValidation,
  );
  const bindingSignal = articleDraft ? composeBindingSignal(binding, preview) : undefined;
  const promotionSummary = composePromotionSummary(promotionPolicy);
  const workflowOutcomeChipLabel = articleDraft
    ? workflowOutcomeLabel(articleDraft.WorkflowState)
    : undefined;

  const publishEnabled =
    !!articleDraft &&
    !busy &&
    !unsupportedDestinationLoaded &&
    articleDraft.WorkflowState === 'approved' &&
    !publishBlockedByValidation;
  // Republish is the in-place update path for content that is already
  // live. Enabling it from any non-`published` state (draft / review /
  // approved) would bypass the approval gate and re-stamp the article
  // back to `published` without the intended control flow. Keep the
  // Publish action as the single route for `approved` content; the
  // orchestrator enforces the same invariant server-side.
  const republishEnabled =
    !!articleDraft &&
    !busy &&
    !unsupportedDestinationLoaded &&
    !!binding &&
    articleDraft.WorkflowState === 'published' &&
    !publishBlockedByValidation;
  const saveEnabled = !!articleDraft && !busy && !unsupportedDestinationLoaded;

  return {
    readinessSummary,
    bindingSignal,
    promotionSummary,
    latestValidation,
    publishBlockedByValidation,
    unsupportedDestinationMessage,
    unsupportedDestinationLoaded,
    workflowOutcomeChipLabel,
    publishEnabled,
    republishEnabled,
    saveEnabled,
  };
}

/**
 * Compose a single author-facing readiness sentence from repo-truth
 * signals. Never exposes raw enum tokens.
 */
export function composeReadinessSummary(
  draft: PublisherArticleRow | undefined,
  binding: PublisherPageBindingRow | undefined,
  preview: PreviewOutcome | undefined,
  validation:
    | {
        readonly ok: boolean;
        readonly errors: readonly { readonly message: string }[];
        readonly warnings: readonly { readonly message: string }[];
      }
    | undefined,
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
    preview &&
    preview.ok &&
    (preview.drift.shellVersionDrift || preview.drift.templateVersionDrift)
  ) {
    return `${outcome} — republishing will update the existing page in place.`;
  }
  return `${outcome} — binding is healthy.`;
}

/**
 * Editorial promotion summary. Renders promotion policy state in
 * author language.
 */
export function composePromotionSummary(
  policy: PromotionPolicyResult | undefined,
): readonly string[] {
  if (!policy) {
    return [
      'Promotion placement will be set automatically when the article type and destination are chosen.',
    ];
  }
  const feature = policy.featured ? 'be featured' : 'not be featured';
  const pin = policy.pinned
    ? 'pinned to the top of listings'
    : 'surface in the normal listing order';
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
 * Author-facing binding signal. Single editorial sentence; no raw
 * `PublishStatus` token.
 */
export function composeBindingSignal(
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
    preview &&
    preview.ok &&
    (preview.drift.shellVersionDrift || preview.drift.templateVersionDrift)
  ) {
    return 'Republishing will update the existing page in place.';
  }
  return 'Destination page is bound and healthy.';
}
