import type { IMyWorkItem, IMyWorkSourceMeta } from '../types/index.js';

// ─────────────────────────────────────────────────────────────────────────────
// Push-to-Project-Team provenance helpers (Phase 3 Stage 0.3)
//
// These utilities support executive review Push-to-Project-Team work items
// as defined in P3-D3 §13. They create, identify, and extract provenance
// metadata for closure-loop traceability.
//
// Governing: P3-D3 §5, §13, P3-F1 §8.5
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a source meta entry for a Push-to-Project-Team work item.
 *
 * Sets `source: 'module'` and populates provenance fields for
 * executive review artifact traceability and closure-loop support.
 */
export function createPushToTeamSourceMeta(input: {
  originRole: string;
  originAnnotationId: string;
  originReviewRunId?: string;
  pushedAtIso: string;
  sourceItemId?: string;
}): IMyWorkSourceMeta {
  return {
    source: 'module',
    sourceEventType: 'push-to-project-team',
    sourceItemId: input.sourceItemId ?? input.originAnnotationId,
    sourceUpdatedAtIso: input.pushedAtIso,
    explanation: 'Pushed to project team by Portfolio Executive Reviewer.',
    originRole: input.originRole,
    originAnnotationId: input.originAnnotationId,
    originReviewRunId: input.originReviewRunId,
    pushTimestamp: input.pushedAtIso,
  };
}

/**
 * Check whether a work item was created via Push-to-Project-Team.
 *
 * Identifies items with `source: 'module'` and `sourceEventType: 'push-to-project-team'`
 * in their source meta array.
 */
export function isPushToTeamItem(item: IMyWorkItem): boolean {
  return item.sourceMeta.some(
    (meta) =>
      meta.source === 'module' &&
      meta.sourceEventType === 'push-to-project-team',
  );
}

/**
 * Extract the Push-to-Project-Team source meta entry from a work item.
 *
 * Returns the first matching source meta with push provenance, or
 * `undefined` if the item is not a push-to-team item.
 */
export function getPushProvenance(
  item: IMyWorkItem,
): IMyWorkSourceMeta | undefined {
  return item.sourceMeta.find(
    (meta) =>
      meta.source === 'module' &&
      meta.sourceEventType === 'push-to-project-team',
  );
}
