/**
 * P3-E6-T02 Constraint Ledger TypeScript contracts.
 * All fields per §2.2 of the Constraint Ledger specification.
 */

import type { ConstraintCategory, ConstraintPriority, ConstraintStatus } from './enums.js';
import type { IAttachmentRef } from '../risk-ledger/types.js';

// ── Shared Constraints Module Types ─────────────────────────────────

/** Append-only comment entry (shared across all Constraints module ledgers). */
export interface ICommentEntry {
  readonly commentId: string;
  readonly text: string;
  readonly authorName: string;
  readonly authorId: string;
  readonly timestamp: string;
}

// ── Constraint Record (§2.2) ────────────────────────────────────────

/** Constraint record — the fundamental unit of the Constraint Ledger. */
export interface IConstraintRecord {
  // Identity (immutable after creation per C-01)
  readonly constraintId: string;
  readonly projectId: string;
  /** System-generated; format CON-[###]; auto-incrementing per project; immutable. */
  readonly constraintNumber: string;

  // Description
  /** Short descriptive title; 10–120 characters. */
  readonly title: string;
  /** Full constraint narrative; 50–1000 characters. */
  readonly description: string;
  /** Governed category (§2.4); immutable after creation. */
  readonly category: ConstraintCategory;
  /** Governed priority (§2.5); PM-set; may be updated. */
  readonly priority: ConstraintPriority;

  // Identification (immutable after creation per C-01)
  /** ISO 8601; date constraint was first identified. */
  readonly dateIdentified: string;
  /** Name or user ID of person who identified the constraint. */
  readonly identifiedBy: string;

  // Ownership
  /** Person accountable for resolution; may be reassigned; creates audit event. */
  readonly owner: string;
  /** Governed BIC team (§2.6); may be reassigned; creates audit event. */
  readonly bic: string;

  // Resolution tracking
  /** Target resolution date; must be ≥ dateIdentified; PM-editable. */
  readonly dueDate: string;
  /** Calculated: today − dateIdentified in calendar days; recalculated on load. */
  readonly daysOpen: number;

  // Lifecycle
  /** Constraint lifecycle status (§2.3); system enforces valid transitions. */
  readonly status: ConstraintStatus;
  /** Date of most recent status transition. */
  readonly statusDate: string;
  /** URI to supporting closure documentation; recommended before Resolved. */
  readonly closureDocumentUri: string | null;
  /** PM narrative on how constraint was resolved. */
  readonly closureNotes: string | null;
  /** ISO 8601; set when constraint reaches Resolved; immutable after set. */
  readonly dateClosed: string | null;
  /** Required for Void, Cancelled, Superseded; optional for Resolved. */
  readonly closureReason: string | null;

  // Lineage
  /** If spawned from a Risk record; null if created directly; immutable after creation. */
  readonly parentRiskId: string | null;
  /** Calculated: array of DelayRecord IDs spawned from this constraint; read-only. */
  readonly spawnedDelayIds: readonly string[];
  /** Calculated: array of ChangeEventRecord IDs spawned from this constraint; read-only. */
  readonly spawnedChangeEventIds: readonly string[];

  // Additional fields
  /** Optional human-readable external reference (drawing number, RFI, permit). */
  readonly reference: string | null;
  /** Append-only comment log; no editing or deletion of entries. */
  readonly comments: readonly ICommentEntry[];
  /** Supporting documents, evidence, or communications. */
  readonly attachments: readonly IAttachmentRef[];

  // Timestamps
  readonly createdAt: string;
  readonly createdBy: string;
  readonly lastEditedAt: string | null;
  readonly lastEditedBy: string | null;
}

// ── Health Spine Metrics (§2.8) ─────────────────────────────────────

/** Constraint Ledger metrics published to the Health Spine. */
export interface IConstraintHealthMetrics {
  readonly openConstraintCount: number;
  readonly overdueConstraintCount: number;
  readonly criticalConstraintCount: number;
  readonly constraintCountByCategory: Readonly<Record<string, number>>;
  readonly avgDaysOpen: number;
  readonly maxDaysOpen: number;
}

// ── State Machine Support Types ─────────────────────────────────────

/** Context required for a constraint status transition. */
export interface IConstraintTransitionContext {
  readonly actor: string;
  readonly timestamp: string;
  readonly closureReason?: string;
  /** Required when transitioning to Superseded. */
  readonly successorConstraintId?: string;
  /** ISO 8601 date; required when transitioning to Resolved. */
  readonly dateClosed?: string;
  /** URI of closure documentation; absence at Resolved generates a warning. */
  readonly closureDocumentUri?: string;
}

/** Result of a constraint status transition validation. */
export interface IConstraintTransitionResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
  /** Non-blocking advisories (e.g., missing closure documentation). */
  readonly warnings: readonly string[];
}

/** Result of an immutability validation check. */
export interface IConstraintImmutabilityResult {
  readonly valid: boolean;
  readonly violations: readonly string[];
}
