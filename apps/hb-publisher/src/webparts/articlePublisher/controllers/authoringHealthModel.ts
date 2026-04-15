/**
 * Phase-11 Prompt-02 — authoring-health preflight model.
 *
 * Models template-registry / bootstrap readiness as a first-class
 * typed state so the publisher shell can tell the operator *before*
 * they click Save or Publish that the environment is not usable.
 *
 * Two problem classes are kept distinct on purpose:
 *
 *   1. Global bootstrap failures ("the environment is unusable")
 *        - registryReadFailure: the `HB Article Template Registry`
 *          repository threw during `listActive()`.
 *        - emptyRegistry: the call succeeded but returned zero active
 *          templates. Nothing an author does can resolve this; it is
 *          strictly an environment / seed data problem.
 *
 *   2. Draft-specific resolution failures ("this draft does not
 *      currently match a template") — the registry is healthy but
 *      the active draft's discriminator set (Destination /
 *      ArticleContentType / SpotlightType / ProjectStage /
 *      ArticleSubject / TemplateKey override) does not resolve to
 *      an active entry. Authors *can* fix this by changing the
 *      discriminators; the shell must not phrase it as a global
 *      environment failure.
 *
 * Authority:
 *   - tenant schema:
 *       docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md
 *   - resolver contract:
 *       data/publisherAdapter/templateResolver.ts
 *
 * Pure. No React, no I/O.
 */
import type {
  PublisherArticleRow,
  PublisherTemplateRegistryRow,
  TemplateResolutionFailureReason,
  TemplateResolutionResult,
} from '../../../data/publisherAdapter/index.js';
import { resolveTemplateKeySystemManaged } from '../authoringPanels/draftHelpers.js';

export type AuthoringHealth =
  | { readonly kind: 'loading' }
  | { readonly kind: 'healthy' }
  | { readonly kind: 'emptyRegistry' }
  | { readonly kind: 'registryReadFailure'; readonly message: string }
  | {
      readonly kind: 'draftNoTemplateMatch';
      readonly reason: TemplateResolutionFailureReason;
      readonly message: string;
    };

export interface TemplateRegistryState {
  readonly loading: boolean;
  /**
   * The active-template rows returned by
   * `repositories.templateRegistry.listActive()`. Undefined while
   * loading or when the read failed.
   */
  readonly rows: readonly PublisherTemplateRegistryRow[] | undefined;
  /**
   * Message from a failed `listActive()` call, or undefined when the
   * last read succeeded (including an empty-but-successful result).
   */
  readonly error: string | undefined;
}

export interface DeriveAuthoringHealthInputs {
  readonly registry: TemplateRegistryState;
  readonly articleDraft: PublisherArticleRow | undefined;
}

/**
 * Derive the preflight authoring-health state.
 *
 * Priority order (first match wins):
 *   1. loading — registry read is still in flight
 *   2. registryReadFailure — global bootstrap failure (takes precedence
 *      over emptiness so an intermittent throw is not misreported as
 *      "no active templates")
 *   3. emptyRegistry — global environment problem
 *   4. draftNoTemplateMatch — draft-specific; only when a draft is
 *      loaded and its discriminators do not resolve
 *   5. healthy
 *
 * When no draft is loaded and the registry is healthy, the model
 * reports `healthy` so the preflight banner clears cleanly the moment
 * the environment becomes usable again.
 */
export function deriveAuthoringHealth(
  inputs: DeriveAuthoringHealthInputs,
): AuthoringHealth {
  const { registry, articleDraft } = inputs;

  if (registry.loading) return { kind: 'loading' };

  if (registry.error !== undefined) {
    return { kind: 'registryReadFailure', message: registry.error };
  }

  const rows = registry.rows ?? [];
  if (rows.length === 0) return { kind: 'emptyRegistry' };

  if (articleDraft) {
    const resolution: TemplateResolutionResult = resolveTemplateKeySystemManaged(
      articleDraft,
      rows,
    );
    if (!resolution.ok) {
      return {
        kind: 'draftNoTemplateMatch',
        reason: resolution.reason,
        message: resolution.message,
      };
    }
  }

  return { kind: 'healthy' };
}

export function isGlobalAuthoringFailure(health: AuthoringHealth): boolean {
  return (
    health.kind === 'emptyRegistry' || health.kind === 'registryReadFailure'
  );
}

export function isAuthoringHealthy(health: AuthoringHealth): boolean {
  return health.kind === 'healthy';
}

/**
 * Author-facing summary used by the preflight banner / right-rail
 * block. Intentionally short so the shell can render a single line.
 */
export function authoringHealthHeadline(health: AuthoringHealth): string {
  switch (health.kind) {
    case 'loading':
      return 'Checking authoring environment…';
    case 'healthy':
      return 'Authoring environment is ready.';
    case 'emptyRegistry':
      return 'No active article templates are available.';
    case 'registryReadFailure':
      return 'Couldn’t read the article template registry.';
    case 'draftNoTemplateMatch':
      return 'This draft doesn’t currently match an active template.';
  }
}

/**
 * Action-hint copy complementing the headline. Distinguishes
 * environment/seed work from author-actionable draft edits so the
 * operator knows whether to call the platform team or change the
 * draft's discriminators.
 */
export function authoringHealthActionHint(health: AuthoringHealth): string | undefined {
  switch (health.kind) {
    case 'loading':
      return undefined;
    case 'healthy':
      return undefined;
    case 'emptyRegistry':
      return (
        'Ask the platform team to seed active rows into the HB Article ' +
        'Template Registry before authoring continues.'
      );
    case 'registryReadFailure':
      return (
        'Reload the Publisher. If the error persists, ask the platform team ' +
        'to check access to the HB Article Template Registry list.'
      );
    case 'draftNoTemplateMatch':
      return (
        'Adjust the article’s content type, destination, or spotlight/stage ' +
        'discriminators in the Identity section to match an active template.'
      );
  }
}
