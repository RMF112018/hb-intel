/**
 * W0-G3-T03: Clarification loop domain types and API seam types.
 *
 * Defines the stored clarification item model, controller input shape,
 * and requester response input shape for the project setup clarification
 * lifecycle.
 *
 * @see docs/architecture/plans/MVP/G3/W0-G3-T03-Clarification-Loop-and-Return-to-Flow-Behavior.md
 */

/** Domain-specific clarification item status (distinct from @hbc/field-annotations AnnotationStatus). */
export type ClarificationStatus = 'open' | 'responded';

/**
 * Stored clarification item — represents a single field-level annotation
 * raised by a controller during project setup review.
 */
export interface IRequestClarification {
  /** Unique ID for this clarification annotation. */
  clarificationId: string;
  /** Identifies the form field (e.g., 'projectName', 'department'). */
  fieldId: string;
  /** Identifies the wizard step that owns this field (from T01 step definitions). */
  stepId: string;
  /** Controller's note explaining what needs to change. */
  message: string;
  /** userId of the controller who raised this clarification. */
  raisedBy: string;
  /** ISO 8601 timestamp when the clarification was raised. */
  raisedAt: string;
  /** Current status: open = pending requester action; responded = addressed. */
  status: ClarificationStatus;
  /** Optional requester response note. */
  responseNote?: string;
  /** ISO 8601 timestamp when the requester marked this as responded. */
  respondedAt?: string;
}

/**
 * API seam: input shape for a controller raising clarification on a field.
 * Used by ProjectSetupApi.requestClarification(requestId, clarifications[]).
 */
export interface IRequestClarificationInput {
  /** Identifies the form field requiring clarification. */
  fieldId: string;
  /** Identifies the wizard step that owns this field. */
  stepId: string;
  /** Controller's note explaining what needs to change. */
  message: string;
}

/**
 * API seam: input shape for a requester responding to a clarification item.
 * Used by ProjectSetupApi.submitClarificationResponse().
 */
export interface IClarificationResponseInput {
  /** The clarificationId being responded to. */
  clarificationId: string;
  /** Optional requester response note. */
  responseNote?: string;
}
