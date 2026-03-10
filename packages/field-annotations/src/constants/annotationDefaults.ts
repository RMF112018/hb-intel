// ─────────────────────────────────────────────────────────────────────────────
// SharePoint list and API constants (D-01)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * SharePoint list title for field annotations (D-01).
 * Must match the provisioned list title in all HB Intel SharePoint sites.
 */
export const ANNOTATION_LIST_TITLE = 'HBC_FieldAnnotations';

/**
 * Azure Functions base path for annotation operations (D-01).
 * All annotation CRUD routes under this prefix.
 */
export const ANNOTATION_API_BASE = '/api/field-annotations';

/**
 * Maximum number of replies returned per annotation (D-07).
 * Server enforces this cap. Older replies are preserved in storage.
 */
export const ANNOTATION_MAX_REPLIES = 50;

// ─────────────────────────────────────────────────────────────────────────────
// TanStack Query stale times
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Stale time for useFieldAnnotations (all annotations for a record).
 * 60 seconds — appropriate for collaborative review where changes happen infrequently.
 */
export const ANNOTATION_STALE_TIME_RECORD_MS = 60_000;

/**
 * Stale time for useFieldAnnotation (single field).
 * 30 seconds — shorter because field-level threads are viewed during active review.
 */
export const ANNOTATION_STALE_TIME_FIELD_MS = 30_000;

// ─────────────────────────────────────────────────────────────────────────────
// Default config values (applied when IFieldAnnotationConfig fields are absent)
// ─────────────────────────────────────────────────────────────────────────────

export const ANNOTATION_DEFAULT_BLOCKS_BIC = true;
export const ANNOTATION_DEFAULT_ALLOW_ASSIGNMENT = false;
export const ANNOTATION_DEFAULT_REQUIRE_RESOLUTION_NOTE = true;
export const ANNOTATION_DEFAULT_VISIBLE_TO_VIEWERS = true;
export const ANNOTATION_DEFAULT_VERSION_AWARE = false;

// ─────────────────────────────────────────────────────────────────────────────
// Intent color tokens (used by HbcAnnotationMarker and HbcAnnotationThread)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * CSS class suffix per intent (full class: `hbc-annotation-marker--${intentColorClass[intent]}`).
 * Follows the HB Intel Design System color token conventions.
 */
export const intentColorClass: Record<string, string> = {
  'clarification-request': 'red',
  'flag-for-revision': 'amber',
  'comment': 'blue',
  'resolved': 'grey',
};

/**
 * Human-readable badge labels for AnnotationIntent values.
 */
export const intentLabel: Record<string, string> = {
  'clarification-request': 'Clarification Request',
  'flag-for-revision': 'Flag for Revision',
  'comment': 'Comment',
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper: resolve effective config with defaults applied
// ─────────────────────────────────────────────────────────────────────────────

import type { IFieldAnnotationConfig } from '../types/IFieldAnnotation';

/**
 * Returns a fully-resolved IFieldAnnotationConfig with all optional fields
 * populated from defaults. Use this inside hooks and components to avoid
 * repeated null-checking.
 */
export function resolveAnnotationConfig(
  config: IFieldAnnotationConfig
): Required<IFieldAnnotationConfig> {
  return {
    recordType: config.recordType,
    blocksBicOnOpenAnnotations: config.blocksBicOnOpenAnnotations ?? ANNOTATION_DEFAULT_BLOCKS_BIC,
    allowAssignment: config.allowAssignment ?? ANNOTATION_DEFAULT_ALLOW_ASSIGNMENT,
    requireResolutionNote: config.requireResolutionNote ?? ANNOTATION_DEFAULT_REQUIRE_RESOLUTION_NOTE,
    visibleToViewers: config.visibleToViewers ?? ANNOTATION_DEFAULT_VISIBLE_TO_VIEWERS,
    versionAware: config.versionAware ?? ANNOTATION_DEFAULT_VERSION_AWARE,
  };
}
