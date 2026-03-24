/**
 * P3-E8-T08 Readiness evaluation types.
 * Readiness decision, blockers, exceptions, overrides, summary projection.
 */

import type {
  ReadinessEvaluationLevel,
  ReadinessDecision,
  ReadinessBlockerType,
  ExceptionStatus,
  OverrideStatus,
} from './enums.js';

// -- Readiness Decision Record (§3) -----------------------------------------

export interface ISafetyReadinessDecision {
  readonly id: string;
  readonly projectId: string;
  readonly schemaVersion: number;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly updatedAt: string;
  readonly updatedBy: string;

  readonly evaluationLevel: ReadinessEvaluationLevel;
  readonly subjectId: string | null;
  readonly subjectDescription: string;

  readonly decision: ReadinessDecision;
  readonly decisionComputedAt: string;
  readonly decidedById: string;

  readonly activeBlockers: readonly IReadinessBlocker[];
  readonly resolvedBlockers: readonly IReadinessBlocker[];
  readonly acceptedExceptions: readonly IReadinessException[];
  readonly activeOverride: IReadinessOverride | null;
  readonly notes: string | null;
}

// -- Blocker Model (§4-6) --------------------------------------------------

export interface IReadinessBlocker {
  readonly blockerId: string;
  readonly blockerType: ReadinessBlockerType;
  readonly description: string;
  readonly isExcepted: boolean;
}

export interface IReadinessBlockerDefinition {
  readonly id: string;
  readonly evaluationLevel: ReadinessEvaluationLevel;
  readonly condition: string;
  readonly blockerType: ReadinessBlockerType;
  readonly excepable: boolean;
}

// -- Exception Model (§7) --------------------------------------------------

export interface IReadinessException {
  readonly id: string;
  readonly blockerId: string;
  readonly blockerDescription: string;

  readonly exceptionGrantedById: string;
  readonly exceptionGrantedAt: string;
  readonly exceptionRationale: string;

  readonly conditionsOfException: string | null;
  readonly exceptionExpiresAt: string | null;

  readonly status: ExceptionStatus;
  readonly lapsedAt: string | null;
  readonly revokedAt: string | null;
  readonly revokedById: string | null;
  readonly revocationNotes: string | null;
}

// -- Override Workflow (§8) -------------------------------------------------

export interface IOverrideSignature {
  readonly userId: string;
  readonly userName: string;
  readonly role: string;
  readonly acknowledgedAt: string;
  readonly comments: string | null;
}

export interface IReadinessOverride {
  readonly id: string;
  readonly readinessDecisionId: string;

  readonly requestedById: string;
  readonly requestedAt: string;
  readonly requestRationale: string;

  readonly safetyManagerAcknowledgment: IOverrideSignature | null;
  readonly pmAcknowledgment: IOverrideSignature | null;
  readonly superintendentAcknowledgment: IOverrideSignature | null;

  readonly status: OverrideStatus;
  readonly acknowledgedAt: string | null;
  readonly expiresAt: string | null;
  readonly notes: string | null;
}

// -- Summary Projection (§9.3) ---------------------------------------------

export interface IReadinessSummaryProjection {
  readonly projectId: string;
  readonly computedAt: string;

  readonly projectReadiness: ReadinessDecision;
  readonly activeProjectBlockers: number;
  readonly activeProjectExceptions: number;

  readonly subcontractorsTotal: number;
  readonly subcontractorsReady: number;
  readonly subcontractorsReadyWithException: number;
  readonly subcontractorsNotReady: number;

  readonly activitiesWithOpenBlockers: number;
}

// -- Work Queue (§10) -------------------------------------------------------

export interface IReadinessWorkQueueTrigger {
  readonly trigger: string;
  readonly workQueueItem: string;
  readonly priority: string;
  readonly assignee: string;
}

// -- Evaluation Result ------------------------------------------------------

export interface IReadinessEvaluationResult {
  readonly decision: ReadinessDecision;
  readonly hardBlockerCount: number;
  readonly softBlockerCount: number;
  readonly exceptedCount: number;
}
