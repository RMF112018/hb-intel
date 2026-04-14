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

import type {
  PublisherArticleRow,
  PublisherPageBindingRow,
  PublisherTemplateRegistryRow,
} from './publisherContracts';
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
  | 'templateKeyDrift'
  | 'pageNameDrift'
  | 'articleArchived'
  | 'articleWithdrawn'
  | 'bindingError'
  | 'contentChanged'
  | 'alreadyInSync';

export interface RepublishDecision {
  readonly action: RepublishAction;
  readonly reason: RepublishReason;
  readonly regenerationCause?:
    | 'shellVersionDrift'
    | 'templateKeyDrift'
    | 'pageNameDrift';
  readonly notes: readonly string[];
}

export interface RepublishPolicyInput {
  readonly composed: ComposedPage;
  readonly template: PublisherTemplateRegistryRow;
  readonly existingBinding: PublisherPageBindingRow | undefined;
  /** The master article; workflow-state gates archival / withdrawal. */
  readonly article?: PublisherArticleRow;
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
  const { composed, template, existingBinding, article, idempotent } = input;

  // Terminal article-level states — never reactivate implicitly.
  // The tenant binding row no longer carries `archived`/`withdrawn`
  // status values; those concerns live on the master article's
  // `WorkflowState`.
  if (article?.WorkflowState === 'archived') {
    return {
      action: 'blocked',
      reason: 'articleArchived',
      notes: [
        'Article is archived. Reactivation must be an explicit caller decision.',
      ],
    };
  }
  if (article?.WorkflowState === 'withdrawn') {
    return {
      action: 'blocked',
      reason: 'articleWithdrawn',
      notes: [
        'Article is withdrawn. Reactivation must be an explicit caller decision.',
      ],
    };
  }

  if (!existingBinding) {
    return {
      action: 'create',
      reason: 'noExistingBinding',
      notes: [
        'No HB Article Destination Pages row exists for this ArticleId — creating a new page.',
      ],
    };
  }

  const notes: string[] = [];

  const templateKeyDrift =
    existingBinding.PageTemplateKey !== composed.identity.templateKey;
  const shellVersionDrift =
    existingBinding.PageShellVersion !== composed.identity.shellVersion;
  const templateVersionDrift =
    existingBinding.RenderVersion !== composed.identity.templateVersion;

  // Hard regeneration trigger — a PageTemplateKey change means the
  // destination page was composed from a different template and
  // requires a new page.
  if (templateKeyDrift) {
    return {
      action: 'regenerate',
      reason: 'templateKeyDrift',
      regenerationCause: 'templateKeyDrift',
      notes: [
        `PageTemplateKey changed (${existingBinding.PageTemplateKey} → ${composed.identity.templateKey}); a new destination page is required.`,
      ],
    };
  }

  // Hard regeneration trigger — the composed page file name no
  // longer matches the bound page's filename. `inPlaceUpdate`
  // targets the bound PageId, but SharePoint does not rename a
  // page file as a side effect of a canvas patch; a real filename
  // change is therefore an explicit regeneration event, not a
  // silent rebind to whatever arbitrary page happens to share the
  // new filename. Closes the P0-2 "filename-based rebinding"
  // ambiguity for slug / PageName drift.
  const pageNameDrift =
    typeof existingBinding.PageName === 'string' &&
    existingBinding.PageName.length > 0 &&
    existingBinding.PageName !== composed.identity.pageName;
  if (pageNameDrift) {
    return {
      action: 'regenerate',
      reason: 'pageNameDrift',
      regenerationCause: 'pageNameDrift',
      notes: [
        `PageName changed (${existingBinding.PageName} → ${composed.identity.pageName}); a new destination page is required to preserve deterministic targeting.`,
      ],
    };
  }

  // Shell version drift — in-place update is the default for version drift.
  if (shellVersionDrift) {
    notes.push(
      `Shell version drift (${existingBinding.PageShellVersion ?? '(none)'} → ${composed.identity.shellVersion}); in-place update applied.`,
    );
  }

  // Render version drift — always permitted in place.
  if (templateVersionDrift) {
    notes.push(
      `Render version drift (${existingBinding.RenderVersion ?? '(none)'} → ${composed.identity.templateVersion}); in-place update applied.`,
    );
  }

  if (existingBinding.PublishStatus === 'error') {
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
