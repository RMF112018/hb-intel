# SF07-T02 — TypeScript Contracts: `@hbc/field-annotations`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-07-Shared-Feature-Field-Annotations.md`
**Decisions Applied:** D-01 (storage keys), D-02 (scope model), D-03 (BIC blocking opt-in), D-04 (versioned-record fields), D-07 (reply threading), D-08 (assignment model), D-09 (form integration)
**Estimated Effort:** 0.5 sprint-weeks
**Depends On:** T01 (scaffold)

> **Doc Classification:** Canonical Normative Plan — SF07-T02 TypeScript contracts task; sub-plan of `SF07-Field-Annotations.md`.

---

## Objective

Define and export every TypeScript interface, type alias, and constant that the rest of the package and all consumer modules depend on. No runtime logic in this task — only the contract layer.

---

## 3-Line Plan

1. Write all interfaces and type aliases in `src/types/IFieldAnnotation.ts`.
2. Write default constants and API identifiers in `src/constants/annotationDefaults.ts`.
3. Verify barrel exports resolve correctly and typecheck passes with zero errors.

---

## `src/types/IFieldAnnotation.ts`

```typescript
// ─────────────────────────────────────────────────────────────────────────────
// Re-export IBicOwner from @hbc/bic-next-move for annotation author identity.
// Annotation authors and assignees are IBicOwner instances, ensuring consistent
// user identity representation across the platform.
// ─────────────────────────────────────────────────────────────────────────────
export type { IBicOwner } from '@hbc/bic-next-move';
import type { IBicOwner } from '@hbc/bic-next-move';

// ─────────────────────────────────────────────────────────────────────────────
// Annotation intent — what type of feedback is this?
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The intent of the annotation determines:
 *  - Its indicator dot color (red / amber / blue)
 *  - Whether it blocks BIC advancement when open (clarification-request + flag-for-revision block by default)
 *  - The notification tier on creation (all Immediate; withdrawal Watch)
 *
 * comment             — Informational note; does not block BIC
 * clarification-request — Reviewer needs an answer before advancing; blocks BIC when config.blocksBicOnOpenAnnotations is true
 * flag-for-revision   — Specific change is required; blocks BIC when config.blocksBicOnOpenAnnotations is true
 */
export type AnnotationIntent =
  | 'comment'
  | 'clarification-request'
  | 'flag-for-revision';

// ─────────────────────────────────────────────────────────────────────────────
// Annotation lifecycle status
// ─────────────────────────────────────────────────────────────────────────────

/**
 * open      — Active annotation; requires attention from assignee or record owner
 * resolved  — Addressed; resolutionNote provided if required by config
 * withdrawn — Retracted by the original author before resolution
 */
export type AnnotationStatus = 'open' | 'resolved' | 'withdrawn';

// ─────────────────────────────────────────────────────────────────────────────
// Reply model (D-07: flat one-level replies; max 50 per annotation)
// ─────────────────────────────────────────────────────────────────────────────

export interface IAnnotationReply {
  replyId: string;
  /** Author of this reply */
  author: IBicOwner;
  body: string;
  /** ISO 8601 */
  createdAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Core annotation model (D-02: scoped to recordType + recordId + fieldKey)
// ─────────────────────────────────────────────────────────────────────────────

export interface IFieldAnnotation {
  annotationId: string;

  /**
   * Record type namespace — must be a stable slug, not a display name.
   * Examples: 'bd-scorecard', 'project-hub-pmp', 'estimating-pursuit', 'workflow-handoff'
   */
  recordType: string;

  /** Unique identifier of the parent record */
  recordId: string;

  /**
   * Stable field key this annotation is attached to.
   * Must match the form field's `name` attribute or a registered field key constant.
   * Examples: 'totalBuildableArea', 'estimatedGMP', 'projectConstraints'
   */
  fieldKey: string;

  /**
   * Human-readable field label captured at creation time.
   * Stored alongside the annotation so labels remain meaningful if the form field is renamed.
   */
  fieldLabel: string;

  intent: AnnotationIntent;
  status: AnnotationStatus;

  /** The user who created this annotation */
  author: IBicOwner;

  /**
   * The user responsible for resolving this annotation (D-08).
   * Null when not explicitly assigned — notification-intelligence sends to record owner.
   * Required when config.allowAssignment is true and a user is selected.
   */
  assignedTo: IBicOwner | null;

  /** The annotation body text */
  body: string;

  /** ISO 8601 creation timestamp */
  createdAt: string;

  /**
   * Version number of the parent record at creation time (D-04).
   * Null for record types that do not use @hbc/versioned-record.
   */
  createdAtVersion: number | null;

  /** ISO 8601 resolution or withdrawal timestamp */
  resolvedAt: string | null;

  /** The user who resolved or withdrew the annotation */
  resolvedBy: IBicOwner | null;

  /**
   * Required when config.requireResolutionNote is true AND intent is
   * 'clarification-request' or 'flag-for-revision'.
   * Optional for 'comment' intent regardless of config.
   */
  resolutionNote: string | null;

  /**
   * Version number of the parent record at resolution time (D-04).
   * Null if the annotation was resolved before versioning was enabled, or if the
   * parent record type does not use @hbc/versioned-record.
   */
  resolvedAtVersion: number | null;

  /**
   * Flat list of replies (D-07). Sorted ascending by createdAt.
   * Server enforces max 50 replies; older replies preserved in storage but not returned.
   */
  replies: IAnnotationReply[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Per-record-type configuration contract (D-02, D-03, D-08, D-09)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Configuration for a specific record type's annotation behavior.
 * One instance per record type (e.g., one for 'bd-scorecard', one for 'project-hub-pmp').
 * Pass to HbcAnnotationMarker, HbcAnnotationThread, and HbcAnnotationSummary.
 */
export interface IFieldAnnotationConfig {
  /**
   * Record type namespace — must match the `recordType` stored on IFieldAnnotation.
   * Example: 'bd-scorecard'
   */
  recordType: string;

  /**
   * When true, open clarification-request and flag-for-revision annotations
   * block BIC advancement on the parent record (D-03).
   * The consuming module's IBicNextMoveConfig.resolveIsBlocked reads open annotation
   * count from useFieldAnnotations to implement the actual blocking logic.
   * Defaults to true.
   */
  blocksBicOnOpenAnnotations?: boolean;

  /**
   * When true, annotation authors can assign annotations to a specific user (D-08).
   * Renders an assignee picker in HbcAnnotationThread "Add annotation" form.
   * Defaults to false.
   */
  allowAssignment?: boolean;

  /**
   * When true, clarification-request and flag-for-revision annotations require
   * a resolution note before they can be marked resolved.
   * comment intent annotations never require a note regardless of this setting.
   * Defaults to true.
   */
  requireResolutionNote?: boolean;

  /**
   * When true, read-only viewers (users without canAnnotate permission) can still
   * see annotation threads.
   * When false, annotation UI is completely hidden for read-only viewers.
   * Defaults to true.
   */
  visibleToViewers?: boolean;

  /**
   * Whether annotations on this record type integrate with @hbc/versioned-record (D-04).
   * When true, annotation creation and resolution store version numbers.
   * Defaults to false.
   */
  versionAware?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Aggregated counts used by HbcAnnotationSummary and BIC blocking resolvers (D-03)
// ─────────────────────────────────────────────────────────────────────────────

export interface IAnnotationCounts {
  /** Total open annotations across all fields for a record */
  totalOpen: number;
  /** Open clarification-request annotations */
  openClarificationRequests: number;
  /** Open flag-for-revision annotations */
  openRevisionFlags: number;
  /** Open comment annotations */
  openComments: number;
  /** Total resolved annotations */
  totalResolved: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook return types
// ─────────────────────────────────────────────────────────────────────────────

export interface IUseFieldAnnotationsResult {
  /** All annotations for the record (open + resolved by default) */
  annotations: IFieldAnnotation[];
  /** Aggregated counts for open annotations (useful for BIC blocking resolver) */
  counts: IAnnotationCounts;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

export interface IUseFieldAnnotationResult {
  /** All annotations for the specific fieldKey */
  annotations: IFieldAnnotation[];
  /** Count of open annotations on this field */
  openCount: number;
  isLoading: boolean;
  isError: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mutation input types for useAnnotationActions (D-07, D-08)
// ─────────────────────────────────────────────────────────────────────────────

export interface ICreateAnnotationInput {
  recordType: string;
  recordId: string;
  fieldKey: string;
  fieldLabel: string;
  intent: AnnotationIntent;
  body: string;
  /** Optional assignee (D-08); only allowed when config.allowAssignment is true */
  assignedTo?: IBicOwner | null;
  /** Version number of the record at creation time (D-04) */
  createdAtVersion?: number | null;
}

export interface IAddReplyInput {
  annotationId: string;
  body: string;
}

export interface IResolveAnnotationInput {
  annotationId: string;
  /** Required when config.requireResolutionNote is true */
  resolutionNote?: string | null;
  /** Version number of the record at resolution time (D-04) */
  resolvedAtVersion?: number | null;
}

export interface IWithdrawAnnotationInput {
  annotationId: string;
}

export interface IUseAnnotationActionsResult {
  createAnnotation: (input: ICreateAnnotationInput) => Promise<IFieldAnnotation>;
  addReply: (input: IAddReplyInput) => Promise<IAnnotationReply>;
  resolveAnnotation: (input: IResolveAnnotationInput) => Promise<IFieldAnnotation>;
  withdrawAnnotation: (input: IWithdrawAnnotationInput) => Promise<IFieldAnnotation>;
  isCreating: boolean;
  isReplying: boolean;
  isResolving: boolean;
  isWithdrawing: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// SharePoint list item shape returned by the API layer (D-01)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Raw SharePoint list item shape.
 * Mapped to IFieldAnnotation by AnnotationApi.mapListItemToAnnotation().
 * Consumers should never interact with this type directly.
 */
export interface IRawAnnotationListItem {
  Id: number;
  AnnotationId: string;
  RecordType: string;
  RecordId: string;
  FieldKey: string;
  FieldLabel: string;
  Intent: AnnotationIntent;
  Status: AnnotationStatus;
  AuthorId: string;
  AuthorName: string;
  AuthorRole: string;
  AssignedToId: string | null;
  AssignedToName: string | null;
  AssignedToRole: string | null;
  Body: string;
  CreatedAt: string;
  CreatedAtVersion: number | null;
  ResolvedAt: string | null;
  ResolvedById: string | null;
  ResolvedByName: string | null;
  ResolvedByRole: string | null;
  ResolutionNote: string | null;
  ResolvedAtVersion: number | null;
  /** JSON-serialized IAnnotationReply[] (D-07) */
  RepliesJson: string;
}
```

---

## `src/constants/annotationDefaults.ts`

```typescript
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

import type { IFieldAnnotationConfig } from './IFieldAnnotation';

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
```

---

## Verification Commands

```bash
# Type-check contracts with zero errors
pnpm --filter @hbc/field-annotations check-types

# Build and confirm exports resolve
pnpm --filter @hbc/field-annotations build

# After build, confirm key types are exported from dist
node -e "
  import('./packages/field-annotations/dist/index.js').then(m => {
    console.log('annotationDefaults exported:', typeof m.ANNOTATION_LIST_TITLE === 'string');
    console.log('resolveAnnotationConfig exported:', typeof m.resolveAnnotationConfig === 'function');
    console.log('intentLabel exported:', typeof m.intentLabel === 'object');
  });
"
```

Expected exports include: `ANNOTATION_LIST_TITLE`, `ANNOTATION_API_BASE`, `ANNOTATION_MAX_REPLIES`, `ANNOTATION_STALE_TIME_RECORD_MS`, `ANNOTATION_STALE_TIME_FIELD_MS`, `intentColorClass`, `intentLabel`, `resolveAnnotationConfig` — plus all interfaces as type-only exports.

<!-- IMPLEMENTATION PROGRESS & NOTES
SF07-T02 completed: 2026-03-10
- Populated src/types/IFieldAnnotation.ts with full contract layer (IBicOwner re-export, AnnotationIntent, AnnotationStatus, IAnnotationReply, IFieldAnnotation, IFieldAnnotationConfig, IAnnotationCounts, IUseFieldAnnotationsResult, IUseFieldAnnotationResult, ICreateAnnotationInput, IAddReplyInput, IResolveAnnotationInput, IWithdrawAnnotationInput, IUseAnnotationActionsResult, IRawAnnotationListItem)
- Populated src/constants/annotationDefaults.ts with SharePoint/API constants, stale times, default config values, intent mappings, and resolveAnnotationConfig() helper
- Correction applied: import path in annotationDefaults.ts changed from './IFieldAnnotation' to '../types/IFieldAnnotation'
- Barrel exports verified: types/index.ts, constants/index.ts, src/index.ts all resolve correctly
- Gates passed: check-types (zero errors), build (zero errors), lint (zero errors)
Next: SF07-T03 (Storage and API Layer)
-->
