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
import { milestoneLegacyNotice } from '../authoringPanels/draftHelpers.js';
import {
  deriveSaveHealth,
  isSaveReady,
  saveDisabledReason,
  type SaveHealth,
} from './saveHealthModel.js';
import {
  deriveAuthoringHealth,
  isAuthoringHealthy,
  isGlobalAuthoringFailure,
  type AuthoringHealth,
  type TemplateRegistryState,
} from './authoringHealthModel.js';
import {
  promotionRuleHealthHeadline,
  type PromotionRuleHealth,
} from './promotionRuleHealthModel.js';

export interface ReadinessControllerInputs {
  readonly articleDraft: PublisherArticleRow | undefined;
  readonly binding: PublisherPageBindingRow | undefined;
  readonly preview: PreviewOutcome | undefined;
  readonly promotionPolicy: PromotionPolicyResult | undefined;
  readonly busy: boolean;
  /**
   * Whether the master `HB Articles` row for the active draft has
   * committed to the list at least once. When false, the first-save
   * gate in the derived save-health model blocks Save draft until
   * tenant-required fields are satisfied.
   *
   * Defaults to `true` when undefined so existing callers keep
   * subsequent-save semantics until they opt in.
   */
  readonly isPersisted?: boolean;
  /**
   * Active-template registry state from `useDraftWorkspace`. Drives
   * the authoring-health preflight that gates save / preview /
   * publish / republish when the template environment is not usable.
   * Defaults to a healthy (non-loading, non-empty) placeholder when
   * omitted so existing callers / tests are not forced to rewire.
   */
  readonly templateRegistry?: TemplateRegistryState;
  /**
   * Typed health state for the promotion-rule repository read from
   * `useDraftWorkspace`. Optional so existing callers/tests continue
   * to work; when omitted the controller assumes a healthy load and
   * does not narrate a promotion-health headline.
   */
  readonly promotionRuleHealth?: PromotionRuleHealth;
  /**
   * Whether the in-memory working copy has drifted from the last
   * saved baseline. Publish / republish resolve from saved repository
   * state by `ArticleId`, so a dirty working copy must not publish —
   * doing so would ship stale saved content as if it were the visible
   * canvas. When true, Publish and Republish are gated closed and the
   * shell routes the author to Save first. Defaults to `false` when
   * omitted so existing callers / tests keep their current semantics.
   */
  readonly isDirty?: boolean;
}

export function useReadinessController(inputs: ReadinessControllerInputs) {
  const { articleDraft, binding, preview, promotionPolicy, busy } = inputs;
  const isPersisted = inputs.isPersisted ?? true;
  // When callers do not thread template-registry state, default to a
  // "registry is fine" shape so tests and legacy callers keep working
  // without forcing them to stub the preflight seam.
  const templateRegistry: TemplateRegistryState = inputs.templateRegistry ?? {
    loading: false,
    rows: undefined,
    error: undefined,
  };

  const unsupportedDestinationMessage = articleDraft
    ? unsupportedDestinationNotice(articleDraft.Destination)
    : undefined;
  const unsupportedDestinationLoaded = !!unsupportedDestinationMessage;

  // Phase-09 Prompt-06: milestone legacy hard-block. Mirrors the
  // destination gate above — `milestoneSpotlight` has no authoring
  // controls, no persistence, and no validation profile, so it must
  // not reach publish/republish. The orchestrator enforces the same
  // invariant server-side; this gate keeps the UI honest so the
  // action never becomes clickable from milestone drafts.
  const unsupportedContentTypeMessage = articleDraft
    ? milestoneLegacyNotice(articleDraft.ArticleContentType)
    : undefined;
  const unsupportedContentTypeLoaded = !!unsupportedContentTypeMessage;

  const latestValidation = preview && preview.ok ? preview.validation : undefined;
  const publishBlockedByValidation = !!latestValidation && !latestValidation.ok;
  const publishIntent = derivePublishIntent({
    articleDraft,
    binding,
    preview,
    publishBlockedByValidation,
  });

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

  // Compute authoring-health early so publish / republish / save
  // gating can all factor the preflight state consistently. Callers
  // that do not pass `templateRegistry` opt out of preflight-based
  // gating (authoringHealth stays `healthy` and acts as a no-op).
  const authoringHealthEarly: AuthoringHealth = inputs.templateRegistry
    ? deriveAuthoringHealth({ registry: templateRegistry, articleDraft })
    : { kind: 'healthy' };
  const preflightBlocksWrites =
    authoringHealthEarly.kind === 'emptyRegistry' ||
    authoringHealthEarly.kind === 'registryReadFailure' ||
    authoringHealthEarly.kind === 'loading';
  const preflightBlocksPublish =
    preflightBlocksWrites || authoringHealthEarly.kind === 'draftNoTemplateMatch';

  // Dirty-state publish gate (Wave-03 Prompt-01 closure). The orchestrator
  // always resolves from saved repository state by `ArticleId`. If the
  // in-memory working copy has drifted from the saved baseline, allowing
  // Publish or Republish would ship stale saved content while the author
  // sees the edited canvas. Gate closed instead and route through Save.
  // Preview is intentionally not gated — the save-and-refresh-preview
  // path already exists for authors to bring preview forward truthfully.
  const isDirty = !!inputs.isDirty;
  const publishBlockedByDirty = !!articleDraft && isDirty;

  const publishEnabled =
    !!articleDraft &&
    !busy &&
    !unsupportedDestinationLoaded &&
    !unsupportedContentTypeLoaded &&
    !preflightBlocksPublish &&
    !publishBlockedByDirty &&
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
    !unsupportedContentTypeLoaded &&
    !preflightBlocksPublish &&
    !publishBlockedByDirty &&
    !!binding &&
    articleDraft.WorkflowState === 'published' &&
    !publishBlockedByValidation;
  // Save readiness is modeled explicitly so the shell can both gate
  // the button truthfully and tell the author what is blocking a
  // first persistence. Subsequent saves short-circuit the
  // first-persistence field gate to preserve partial-persistence
  // recovery and normal editing.
  const saveHealth: SaveHealth = deriveSaveHealth({
    articleDraft,
    busy,
    unsupportedDestinationMessage,
    unsupportedContentTypeMessage,
    isPersisted,
  });
  // Save is additionally blocked by a global preflight failure —
  // attempting the master upsert cannot succeed when no active
  // template can resolve at save time. Draft-specific no-match is
  // left to `resolveTemplateKeySystemManaged` inside `handleSave`,
  // which already refuses to commit and surfaces a targeted message.
  const saveEnabled = isSaveReady(saveHealth) && !preflightBlocksWrites;
  const saveBlockedReason = preflightBlocksWrites
    ? (authoringHealthEarly.kind === 'registryReadFailure'
        ? `Authoring paused — ${authoringHealthEarly.message}`
        : authoringHealthEarly.kind === 'emptyRegistry'
          ? 'Authoring paused — no active article templates are available.'
          : 'Checking the authoring environment…')
    : saveDisabledReason(saveHealth);

  const authoringHealth: AuthoringHealth = authoringHealthEarly;
  const authoringHealthy = isAuthoringHealthy(authoringHealth);
  const authoringGlobalFailure = isGlobalAuthoringFailure(authoringHealth);

  return {
    readinessSummary,
    bindingSignal,
    promotionSummary,
    latestValidation,
    publishBlockedByValidation,
    publishBlockedByDirty,
    publishIntent,
    unsupportedDestinationMessage,
    unsupportedDestinationLoaded,
    unsupportedContentTypeMessage,
    unsupportedContentTypeLoaded,
    workflowOutcomeChipLabel,
    publishEnabled,
    republishEnabled,
    saveEnabled,
    saveHealth,
    saveBlockedReason,
    authoringHealth,
    authoringHealthy,
    authoringGlobalFailure,
    promotionRuleHealth: inputs.promotionRuleHealth,
    promotionRuleHealthHeadline: inputs.promotionRuleHealth
      ? promotionRuleHealthHeadline(inputs.promotionRuleHealth)
      : undefined,
  };
}

/**
 * Publish-intent classification used by the readiness rail for a
 * short, scannable chip next to the primary actions. Mirrors the
 * orchestrator decision without exposing raw enum tokens to UI.
 */
export type PublishIntent =
  | { readonly kind: 'noDraft' }
  | { readonly kind: 'blocked'; readonly count: number }
  | { readonly kind: 'createPage' }
  | { readonly kind: 'updateInPlace' }
  | { readonly kind: 'regeneratePage'; readonly cause?: string }
  | { readonly kind: 'noChange' }
  | { readonly kind: 'pending' };

export function derivePublishIntent(args: {
  readonly articleDraft: PublisherArticleRow | undefined;
  readonly binding: PublisherPageBindingRow | undefined;
  readonly preview: PreviewOutcome | undefined;
  readonly publishBlockedByValidation: boolean;
}): PublishIntent {
  const { articleDraft, binding, preview, publishBlockedByValidation } = args;
  if (!articleDraft) return { kind: 'noDraft' };
  if (publishBlockedByValidation && preview && preview.ok) {
    return { kind: 'blocked', count: preview.validation.errors.length };
  }
  if (!preview) return { kind: 'pending' };
  if (!preview.ok) return { kind: 'pending' };
  switch (preview.decision.action) {
    case 'create':
      return { kind: 'createPage' };
    case 'regenerate':
      return {
        kind: 'regeneratePage',
        cause: preview.decision.regenerationCause,
      };
    case 'inPlaceUpdate':
      return { kind: 'updateInPlace' };
    case 'noOp':
      return { kind: 'noChange' };
    case 'blocked':
      return {
        kind: 'blocked',
        count: preview.validation.errors.length,
      };
    default:
      return binding ? { kind: 'updateInPlace' } : { kind: 'createPage' };
  }
}

/**
 * Author-facing headline + short detail for a `PublishIntent`. Keeps
 * the intent-to-language mapping in one place so the readiness rail
 * and diagnostics block agree.
 */
export function describePublishIntent(intent: PublishIntent): {
  readonly tone: 'info' | 'success' | 'warn' | 'danger' | 'neutral';
  readonly label: string;
  readonly detail?: string;
} {
  switch (intent.kind) {
    case 'noDraft':
      return { tone: 'neutral', label: 'No draft selected' };
    case 'pending':
      return {
        tone: 'neutral',
        label: 'Composing preview…',
        detail: 'Publish intent will resolve once the preview is ready.',
      };
    case 'blocked':
      return {
        tone: 'danger',
        label: `Publish blocked — ${intent.count} issue${intent.count === 1 ? '' : 's'}`,
        detail: 'Resolve the blocking issues below to unblock publish.',
      };
    case 'createPage':
      return {
        tone: 'info',
        label: 'Will create a new page',
        detail: 'Publishing creates a new destination page and binds it to this article.',
      };
    case 'updateInPlace':
      return {
        tone: 'success',
        label: 'Will update in place',
        detail: 'PageId and URL are preserved.',
      };
    case 'regeneratePage':
      return {
        tone: 'warn',
        label: 'Will regenerate the page',
        detail: intent.cause
          ? `Cause: ${intent.cause}. A new PageId and URL will replace the current binding.`
          : 'A new PageId and URL will replace the current binding.',
      };
    case 'noChange':
      return {
        tone: 'neutral',
        label: 'No change on publish',
        detail: 'The destination page already matches this draft.',
      };
  }
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
