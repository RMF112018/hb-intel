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
