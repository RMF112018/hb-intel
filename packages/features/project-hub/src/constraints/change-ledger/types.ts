/**
 * P3-E6-T04 Change Ledger TypeScript contracts.
 * All fields per §4.2–§4.6 of the Change Ledger specification.
 */

import type {
  ChangeEventOrigin,
  ChangeEventStatus,
  ChangeIntegrationMode,
  ChangeLineItemType,
  CostConfidence,
  ProcoreSyncState,
} from './enums.js';
import type { IAttachmentRef } from '../risk-ledger/types.js';
import type { ICommentEntry } from '../constraint-ledger/types.js';

// ── Change Line Item (§4.3) ─────────────────────────────────────────

/** Line item cost component mapping to Procore PCO line item model. */
export interface IChangeLineItem {
  /** UUID; stable per line item; survives mode promotion. */
  readonly lineItemId: string;
  /** Line item description; 10–500 characters. */
  readonly description: string;
  /** Governed cost type. */
  readonly type: ChangeLineItemType;
  /** Quantity for unit-based pricing. */
  readonly quantity: number | null;
  /** Unit of measure (e.g., "LF", "CY", "EA", "LS"). */
  readonly unit: string | null;
  /** Unit cost in USD. */
  readonly unitCost: number | null;
  /** Total cost for this line item in USD. */
  readonly totalCost: number;
  /** WBS or cost code for financial tracking. */
  readonly costCode: string | null;
  /** Procore line item ID; populated after integration sync; null in manual mode. */
  readonly procoreLineItemId: string | null;
  /** Optional line-level notes. */
  readonly notes: string | null;
}

// ── Procore Mapping Record (§4.6) ───────────────────────────────────

/** Full Procore integration state for a change event. Null in ManualNative mode. */
export interface IProcoreMappingRecord {
  /** Procore's internal change event ID. */
  readonly procoreChangeEventId: string;
  /** Procore's displayed change event number. */
  readonly procoreChangeEventNumber: string;
  /** Procore-native status string (stored raw). */
  readonly procoreStatus: string;
  /** HB Intel canonical status this Procore status maps to. */
  readonly procoreStatusMappedTo: ChangeEventStatus;
  /** Procore project ID for API routing. */
  readonly procoreProjectId: string;
  /** Sync lifecycle state. */
  readonly syncState: ProcoreSyncState;
  /** Timestamp of last successful sync. */
  readonly lastSyncedAt: string | null;
  /** If true, authoritative writes execute via Procore API. */
  readonly procoreWritePathEnabled: boolean;
  /** Narrative of conflict if syncState = ConflictRequiresReview. */
  readonly syncConflictDetails: string | null;
  /** Sync state for line items specifically. */
  readonly procoreLineItemSyncState: ProcoreSyncState;
  /** Timestamp when promoted from ManualNative. */
  readonly promotedFromManualAt: string;
  /** User who executed the promotion. */
  readonly promotedBy: string;
}

// ── Change Event Record (§4.2) ──────────────────────────────────────

/** Change event record — the fundamental unit of the Change Ledger. */
export interface IChangeEventRecord {
  // Identity (canonical — immutable)
  readonly changeEventId: string;
  readonly projectId: string;
  /** Canonical HB Intel number; format CE-[###]; immutable; survives mode promotion. */
  readonly changeEventNumber: string;

  // Description
  /** Short descriptive title; 10–150 characters. */
  readonly title: string;
  /** Narrative of the change event; 50–2000 characters. */
  readonly description: string;
  /** Governed origin type (§4.5); immutable after creation. */
  readonly origin: ChangeEventOrigin;

  // Identification (immutable)
  /** ISO 8601; date change event first identified. */
  readonly dateIdentified: string;
  /** Name or user ID; immutable. */
  readonly identifiedBy: string;
  /** If spawned from a constraint; null if direct; immutable. */
  readonly parentConstraintId: string | null;

  // Lifecycle
  /** Canonical HB Intel status (§4.4); never replaced by Procore status. */
  readonly status: ChangeEventStatus;
  /** Date of most recent status transition. */
  readonly statusDate: string;
  /** Date approved; required when status = Approved; immutable after set. */
  readonly approvedDate: string | null;
  /** Name or user ID of approver. */
  readonly approvedBy: string | null;
  /** Required for Void, Cancelled, Superseded; recommended for Closed. */
  readonly closureReason: string | null;
  /** ISO 8601; set when status reaches terminal; immutable after set. */
  readonly dateClosed: string | null;

  // Financial impact
  /** Line-item cost breakdown (§4.3). */
  readonly lineItems: readonly IChangeLineItem[];
  /** Net USD cost impact; positive = increase; negative = credit. */
  readonly totalCostImpact: number;
  /** True if totalCostImpact calculated from lineItems. */
  readonly totalCostCalculated: boolean;
  /** Confidence in cost estimate. */
  readonly costConfidence: CostConfidence | null;
  /** Schedule impact in calendar days; positive = delay; negative = acceleration. */
  readonly scheduleImpactDays: number | null;
  /** Narrative of schedule impact. */
  readonly scheduleImpactDescription: string | null;
  /** FKs to DelayRecord; peer links (not spawn). */
  readonly linkedDelayIds: readonly string[];

  // Integration
  /** ManualNative or IntegratedWithProcore. */
  readonly integrationMode: ChangeIntegrationMode;
  /** Null in ManualNative mode; populated in IntegratedWithProcore. */
  readonly procoreMapping: IProcoreMappingRecord | null;

  // Audit
  readonly attachments: readonly IAttachmentRef[];
  readonly comments: readonly ICommentEntry[];

  // Timestamps
  readonly createdAt: string;
  readonly createdBy: string;
  readonly lastEditedAt: string | null;
  readonly lastEditedBy: string | null;
}

// ── Health Spine Metrics (§4.10) ────────────────────────────────────

/** Change Ledger metrics published to the Health Spine. */
export interface IChangeEventHealthMetrics {
  readonly openChangeEventCount: number;
  readonly pendingApprovalCount: number;
  readonly totalPendingCostImpact: number;
  readonly totalApprovedCostImpact: number;
  readonly changeEventCountByOrigin: Readonly<Record<string, number>>;
}

// ── State Machine Support Types ─────────────────────────────────────

/** Context required for a change event status transition. */
export interface IChangeEventTransitionContext {
  readonly actor: string;
  readonly timestamp: string;
  readonly closureReason?: string;
  /** Required when transitioning to Approved (CE-03). */
  readonly approvedDate?: string;
  /** Required when transitioning to Approved (CE-03). */
  readonly approvedBy?: string;
  /** Required when transitioning to Superseded. */
  readonly successorChangeEventId?: string;
}

/** Result of a change event status transition validation. */
export interface IChangeEventTransitionResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
}

/** Result of an immutability validation check. */
export interface IChangeEventImmutabilityResult {
  readonly valid: boolean;
  readonly violations: readonly string[];
}
