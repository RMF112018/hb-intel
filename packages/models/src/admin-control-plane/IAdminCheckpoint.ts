/**
 * Admin Control Plane — checkpoint, approval, and external event contracts.
 *
 * These types define the generalized pause/resume model for admin runs.
 * They cover operator-approval checkpoints, destructive-action confirmations,
 * external-event waits, and post-execution validations.
 *
 * @module admin-control-plane
 */

import type { IAdminActorContext } from './IAdminRun.js';

// ─── Checkpoint Categories ──────────────────────────────────────────────────────

/**
 * Categories of checkpoints that can occur during an admin run.
 *
 * Each category has different UX expectations, timeout behavior,
 * and escalation semantics.
 */
export enum AdminCheckpointCategory {
  /**
   * Pre-execution approval gate. The run pauses before any steps execute.
   * Used by destructive-mode actions to show preview/impact summary
   * and require explicit operator confirmation.
   */
  PreExecutionApproval = 'pre-execution-approval',

  /**
   * Mid-execution review point. The run pauses between steps for
   * operator review of intermediate results before continuing.
   * Used by checkpointed-mode actions.
   */
  MidExecutionReview = 'mid-execution-review',

  /**
   * Destructive-action confirmation. A specialized pre-execution gate
   * that requires the operator to acknowledge the irreversible nature
   * of the action. Must display impact summary and explicit warnings.
   */
  DestructiveConfirmation = 'destructive-confirmation',

  /**
   * External-event wait. The run pauses waiting for an event from
   * an external system (e.g., IT approval in a ticketing system,
   * Azure deployment completion, manual infrastructure step).
   */
  ExternalEventWait = 'external-event-wait',

  /**
   * Post-execution validation. The run pauses after the primary steps
   * complete so the operator can verify results before the run is
   * marked as completed.
   */
  PostExecutionValidation = 'post-execution-validation',
}

// ─── Checkpoint Status ──────────────────────────────────────────────────────────

/**
 * Lifecycle states of a checkpoint instance.
 */
export enum AdminCheckpointStatus {
  /** Checkpoint is active and awaiting a decision */
  Pending = 'Pending',

  /** Operator approved — run may continue */
  Approved = 'Approved',

  /** Operator rejected — run should be cancelled or rolled back */
  Rejected = 'Rejected',

  /** Checkpoint expired without a decision */
  TimedOut = 'TimedOut',

  /** Checkpoint was escalated to a higher authority */
  Escalated = 'Escalated',

  /** Checkpoint was superseded by a newer checkpoint or run cancellation */
  Superseded = 'Superseded',
}

// ─── Checkpoint Definition (static) ─────────────────────────────────────────────

/**
 * Static descriptor of where a checkpoint occurs in an action's execution plan.
 *
 * Action definitions declare their checkpoints upfront. The runtime creates
 * checkpoint instances from these definitions when the run reaches the
 * designated point.
 */
export interface IAdminCheckpointDefinition {
  /** Unique checkpoint identifier within the action (e.g., 'pre-launch', 'after-step-3') */
  readonly checkpointId: string;

  /** Checkpoint category */
  readonly category: AdminCheckpointCategory;

  /** Human-readable label shown to the operator */
  readonly label: string;

  /** Description of what the operator should review at this checkpoint */
  readonly description: string;

  /** Step number after which this checkpoint triggers (0 = before any step) */
  readonly afterStep: number;

  /** Timeout in milliseconds before the checkpoint expires (null = no timeout) */
  readonly timeoutMs: number | null;

  /** Whether timeout auto-rejects (true) or auto-escalates (false) */
  readonly timeoutAction: 'reject' | 'escalate';

  /** Whether this checkpoint requires the operator to type a confirmation phrase */
  readonly requiresConfirmationPhrase: boolean;
}

// ─── Checkpoint Instance (runtime) ──────────────────────────────────────────────

/**
 * Runtime checkpoint instance created when a run reaches a checkpoint point.
 *
 * This is the state record for a specific checkpoint within a specific run.
 */
export interface IAdminCheckpoint {
  /** Unique instance ID (UUID v4) */
  readonly instanceId: string;

  /** Reference to the checkpoint definition */
  readonly checkpointId: string;

  /** Run ID this checkpoint belongs to */
  readonly runId: string;

  /** Checkpoint category (denormalized from definition for query convenience) */
  readonly category: AdminCheckpointCategory;

  /** Current checkpoint status */
  readonly status: AdminCheckpointStatus;

  /** Human-readable label */
  readonly label: string;

  /** Step number this checkpoint is positioned after */
  readonly afterStep: number;

  // ── Timing ────────────────────────────────────────────────────────────────

  /** ISO 8601 timestamp when this checkpoint was created */
  readonly createdAt: string;

  /** ISO 8601 timestamp when this checkpoint expires (null = no expiry) */
  readonly expiresAt: string | null;

  /** ISO 8601 timestamp when a decision was recorded (null if still pending) */
  readonly decidedAt: string | null;

  // ── Decision ──────────────────────────────────────────────────────────────

  /** The decision record (null if no decision yet) */
  readonly decision: IAdminCheckpointDecision | null;

  // ── External Event Correlation ────────────────────────────────────────────

  /** External event correlation (null if not an external-event-wait checkpoint) */
  readonly externalEvent: IAdminExternalEventCorrelation | null;
}

// ─── Checkpoint Decision ────────────────────────────────────────────────────────

/**
 * Auditable record of an operator's checkpoint decision.
 *
 * This is captured for every checkpoint resolution and linked to the
 * audit/evidence chain. It is separate from the broader audit record
 * to keep checkpoint metadata focused while remaining linkable.
 */
export interface IAdminCheckpointDecision {
  /** The operator who made the decision */
  readonly actor: IAdminActorContext;

  /** Decision outcome */
  readonly outcome: 'approve' | 'reject';

  /** Operator's comment explaining the decision (required for rejections) */
  readonly comment: string | null;

  /** Confirmation phrase if the checkpoint required one (null otherwise) */
  readonly confirmationPhrase: string | null;

  /** ISO 8601 timestamp when the decision was made */
  readonly decidedAt: string;

  /** Idempotency key to prevent duplicate decision processing */
  readonly idempotencyKey: string;
}

// ─── External Event Correlation ─────────────────────────────────────────────────

/**
 * Correlation fields for checkpoints that wait on external events.
 *
 * Used when a run pauses for an event from an external system
 * (e.g., IT ticket approval, Azure deployment callback, manual step).
 */
export interface IAdminExternalEventCorrelation {
  /** External system identifier (e.g., 'azure-deployment', 'service-now', 'manual') */
  readonly sourceSystem: string;

  /** Correlation key for matching incoming events to this checkpoint */
  readonly correlationKey: string;

  /** Expected event type (for validation on receipt) */
  readonly expectedEventType: string;

  /** Whether the event has been received */
  readonly eventReceived: boolean;

  /** ISO 8601 timestamp when the event was received (null if not yet received) */
  readonly eventReceivedAt: string | null;

  /**
   * Deduplication token for at-least-once delivery tolerance.
   * If a matching event arrives with the same deduplication token as
   * one already processed, it is safely ignored.
   */
  readonly lastProcessedDedupeToken: string | null;
}
