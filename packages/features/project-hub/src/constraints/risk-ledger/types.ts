/**
 * P3-E6-T01 Risk Ledger TypeScript contracts.
 * All fields per §1.2 of the Risk Ledger specification.
 */

import type { RiskCategory, RiskImpact, RiskProbability, RiskStatus } from './enums.js';

// ── Shared Constraints Module Types ─────────────────────────────────

/** Attachment reference for supporting documents (shared across all Constraints module ledgers). */
export interface IAttachmentRef {
  readonly attachmentId: string;
  readonly uri: string;
  readonly description: string;
  readonly attachedAt: string;
  readonly attachedBy: string;
}

// ── Risk Record (§1.2) ─────────────────────────────────────────────

/** Risk record — the fundamental unit of the Risk Ledger. */
export interface IRiskRecord {
  // Identity (immutable after creation per R-01)
  readonly riskId: string;
  readonly projectId: string;
  /** System-generated; format RISK-[###]; auto-incrementing per project; immutable. */
  readonly riskNumber: string;

  // Description
  /** Short descriptive title; 10–120 characters. */
  readonly title: string;
  /** Full risk narrative; 50–1000 characters. */
  readonly description: string;
  /** Governed risk category (§1.4); immutable after creation. */
  readonly category: RiskCategory;

  // Assessment
  /** Governed probability scale (§1.5); drives riskScore. */
  readonly probability: RiskProbability;
  /** Governed impact scale (§1.5); drives riskScore. */
  readonly impact: RiskImpact;
  /** Calculated: probability × impact (range 1–25); recalculated on save. */
  readonly riskScore: number;

  // Identification (immutable after creation per R-01)
  /** ISO 8601; date risk was first recorded. */
  readonly dateIdentified: string;
  /** Name or user ID of person who identified the risk. */
  readonly identifiedBy: string;

  // Ownership
  /** Person responsible for monitoring and mitigating; may be reassigned. */
  readonly owner: string;
  /** Governed BIC team owning the risk area (§1.6); creates audit event on change. */
  readonly bic: string;

  // Mitigation
  /** Target date to implement mitigation; must be ≥ dateIdentified. */
  readonly targetMitigationDate: string;
  /** Planned mitigation actions; 0–2000 characters. */
  readonly mitigationStrategy: string | null;
  /** Contingency plan if risk materializes; 0–2000 characters. */
  readonly contingencyStrategy: string | null;
  /** Notes on residual risk after mitigation. */
  readonly residualRiskNotes: string | null;

  // Lifecycle
  /** Risk lifecycle status (§1.3); system enforces valid transitions. */
  readonly status: RiskStatus;
  /** Calculated: date of most recent status transition. */
  readonly statusDate: string;
  /** Required when status = Closed, Void, or Cancelled. */
  readonly closureReason: string | null;
  /** ISO 8601; populated only when status reaches a terminal state; immutable after set. */
  readonly dateClosed: string | null;

  // Relationships
  /** Calculated: array of ConstraintRecord IDs spawned from this risk; read-only. */
  readonly spawnedConstraintIds: readonly string[];
  /** Supporting documents, assessments, or evidence. */
  readonly attachments: readonly IAttachmentRef[];

  // Timestamps
  readonly createdAt: string;
  readonly createdBy: string;
  readonly lastEditedAt: string | null;
  readonly lastEditedBy: string | null;
}

// ── Health Spine Metrics (§1.8) ─────────────────────────────────────

/** Risk Ledger metrics published to the Health Spine. */
export interface IRiskHealthMetrics {
  readonly openRiskCount: number;
  readonly highRiskCount: number;
  readonly overdueRiskCount: number;
  readonly riskCountByCategory: Readonly<Record<string, number>>;
  readonly materializationRateThisPeriod: number;
}

// ── State Machine Support Types ─────────────────────────────────────

/** Context required for a risk status transition. */
export interface IRiskTransitionContext {
  readonly actor: string;
  readonly timestamp: string;
  readonly closureReason?: string;
}

/** Result of a risk status transition validation. */
export interface IRiskTransitionResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

/** Result of an immutability validation check. */
export interface IRiskImmutabilityResult {
  readonly valid: boolean;
  readonly violations: readonly string[];
}
