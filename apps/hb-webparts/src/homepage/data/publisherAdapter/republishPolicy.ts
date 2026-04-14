/**
 * Republish decision policy — pure.
 *
 * Given the freshly composed page, the resolved template, and any
 * existing page-binding row, decide what action the publish orchestrator
 * should take:
 *
 *   - `create`        — no binding exists; create the destination page
 *                       and write a new binding row.
 *   - `inPlaceUpdate` — binding exists and is compatible; update the
 *                       existing page (preserve `PageId` / `PageUrl`)
 *                       and merge the binding row.
 *   - `regenerate`    — binding exists but shell or template drift
 *                       requires a new page; the orchestrator creates a
 *                       new page and archives the prior binding.
 *   - `blocked`       — binding is in a terminal state (archived /
 *                       withdrawn) and the caller must reactivate
 *                       deliberately before republishing.
 *   - `noOp`          — binding is already in sync with the current
 *                       shell + template versions and the caller
 *                       explicitly asked for idempotent-only.
 *
 * Authority:
 *   tenant `HB Article Template Registry` (no longer exposes
 *     AllowRepublishInPlace/ForceRegenerationOnShellChange; key drift
 *     alone forces regeneration).
 *   architecture doc 06 — shell/template version comparison drives
 *                         regeneration.
 *   operating-charter rule 6 — publish/republish mediated by bindings.
 *   operating-charter rule 7 — shell/template versioning explicit.
 *   prompt-05 — do not silently create duplicate live pages for the
 *               same post.
 */

import type { PublisherPageBindingRow, PublisherTemplateRegistryRow } from './publisherContracts';
import type { ComposedPage } from './pageGeneration/pageCompositor';

export type RepublishAction =
  | 'create'
  | 'inPlaceUpdate'
  | 'regenerate'
  | 'blocked'
  | 'noOp';

export type RepublishReason =
  | 'noExistingBinding'
  | 'shellVersionMatches'
  | 'shellVersionDrift'
  | 'templateVersionDrift'
  | 'shellKeyDrift'
  | 'templateKeyDrift'
  | 'bindingArchived'
  | 'bindingWithdrawn'
  | 'bindingError'
  | 'contentChanged'
  | 'alreadyInSync';

export interface RepublishDecision {
  readonly action: RepublishAction;
  readonly reason: RepublishReason;
  readonly regenerationCause?:
    | 'shellKeyDrift'
    | 'shellVersionDrift'
    | 'templateKeyDrift';
  readonly notes: readonly string[];
}

export interface RepublishPolicyInput {
  readonly composed: ComposedPage;
  readonly template: PublisherTemplateRegistryRow;
  readonly existingBinding: PublisherPageBindingRow | undefined;
  /** When true, unchanged-content + version-match produces `noOp`. */
  readonly idempotent?: boolean;
}

/**
 * Decide the republish action. Caller must pass the template separately
 * (the composed page identity only carries the key/version pair used at
 * compose time).
 */
export function decideRepublishAction(
  input: RepublishPolicyInput,
): RepublishDecision {
  const { composed, template, existingBinding, idempotent } = input;

  if (!existingBinding) {
    return {
      action: 'create',
      reason: 'noExistingBinding',
      notes: [
        'No HB Article Destination Pages row exists for this ArticleId — creating a new page.',
      ],
    };
  }

  // Terminal states — never reactivate implicitly.
  if (existingBinding.BindingStatus === 'archived') {
    return {
      action: 'blocked',
      reason: 'bindingArchived',
      notes: [
        'Existing binding is archived. Reactivation must be an explicit caller decision.',
      ],
    };
  }
  if (existingBinding.BindingStatus === 'withdrawn') {
    return {
      action: 'blocked',
      reason: 'bindingWithdrawn',
      notes: [
        'Existing binding is withdrawn. Reactivation must be an explicit caller decision.',
      ],
    };
  }

  const notes: string[] = [];

  const shellKeyDrift =
    existingBinding.PageShellKey !== composed.identity.shellKey;
  const shellVersionDrift =
    existingBinding.PageShellVersion !== composed.identity.shellVersion;
  const templateKeyDrift =
    existingBinding.TemplateKey !== composed.identity.templateKey;
  const templateVersionDrift =
    existingBinding.TemplateVersion !== composed.identity.templateVersion;

  // Hard regeneration triggers — they always force a new page even when
  // the template opts into in-place republish.
  if (shellKeyDrift) {
    return {
      action: 'regenerate',
      reason: 'shellKeyDrift',
      regenerationCause: 'shellKeyDrift',
      notes: [
        `Shell key changed (${existingBinding.PageShellKey} → ${composed.identity.shellKey}); a new destination page is required.`,
      ],
    };
  }
  if (templateKeyDrift) {
    return {
      action: 'regenerate',
      reason: 'templateKeyDrift',
      regenerationCause: 'templateKeyDrift',
      notes: [
        `Template key changed (${existingBinding.TemplateKey} → ${composed.identity.templateKey}); a new destination page is required.`,
      ],
    };
  }

  // Shell version drift — in-place update is the default for version drift.
  // The tenant registry no longer carries `ForceRegenerationOnShellChange`;
  // key drift (above) remains the sole hard-regenerate trigger for the shell.
  if (shellVersionDrift) {
    notes.push(
      `Shell version drift (${existingBinding.PageShellVersion} → ${composed.identity.shellVersion}); in-place update applied.`,
    );
  }

  // Template version drift — always permitted in place; the tenant registry
  // no longer carries `AllowRepublishInPlace`. Key drift (above) remains
  // the sole hard-regenerate trigger for the template.
  if (templateVersionDrift) {
    notes.push(
      `Template version drift (${existingBinding.TemplateVersion} → ${composed.identity.templateVersion}); in-place update applied.`,
    );
  }

  if (existingBinding.BindingStatus === 'error') {
    return {
      action: 'inPlaceUpdate',
      reason: 'bindingError',
      notes: [
        ...notes,
        'Previous binding was in error state; retrying in-place update.',
      ],
    };
  }

  if (idempotent && !shellVersionDrift && !templateVersionDrift) {
    return {
      action: 'noOp',
      reason: 'alreadyInSync',
      notes: [
        ...notes,
        'Binding already reflects current shell + template versions; idempotent caller took no action.',
      ],
    };
  }

  return {
    action: 'inPlaceUpdate',
    reason: shellVersionDrift
      ? 'shellVersionDrift'
      : templateVersionDrift
        ? 'templateVersionDrift'
        : 'contentChanged',
    notes: notes.length > 0 ? notes : ['In-place republish of an existing binding.'],
  };
}
