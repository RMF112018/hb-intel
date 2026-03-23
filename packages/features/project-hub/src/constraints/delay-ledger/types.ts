/**
 * P3-E6-T03 Delay Ledger TypeScript contracts.
 * All fields per §3.2 of the Delay Ledger specification.
 */

import type {
  AnalysisMethod,
  CriticalPathImpact,
  DelayEventType,
  DelayStatus,
  DispositionOutcome,
  EvidenceType,
  QuantificationConfidence,
  ResponsibleParty,
  ScheduleReferenceMode,
} from './enums.js';
import type { IAttachmentRef } from '../risk-ledger/types.js';
import type { ICommentEntry } from '../constraint-ledger/types.js';

// ── Nested Record Types ─────────────────────────────────────────────

/** Optional line-level cost breakdown item. */
export interface ICostBreakdownItem {
  readonly description: string;
  readonly amount: number;
  readonly costCode: string | null;
}

/**
 * Time impact record (§3.8).
 * Tracks schedule impact separately from cost/commercial impact.
 */
export interface ITimeImpactRecord {
  /** Positive; estimated excusable delay calendar days. */
  readonly estimatedCalendarDays: number;
  /** Working days equivalent; may differ from calendar days. */
  readonly estimatedWorkingDays: number | null;
  /** Governed analysis method (§3.8). */
  readonly analysisMethod: AnalysisMethod;
  /** Narrative of how the estimate was derived; min 100 chars. */
  readonly analysisBasis: string;
  /** Whether a fragnet has been prepared. */
  readonly fragnetAvailable: boolean;
  /** URI or reference to fragnet document. */
  readonly fragnetReference: string | null;
  /** Whether a formal TIA has been performed. */
  readonly tiaAvailable: boolean;
  /** URI or reference to TIA document. */
  readonly tiaReference: string | null;
  /** Start of impact window (P-window for impact analysis). */
  readonly pwindowStart: string | null;
  /** End of impact window. */
  readonly pwindowEnd: string | null;
  /** Governs evidence gate requirements. */
  readonly quantificationConfidence: QuantificationConfidence;
}

/**
 * Commercial/cost impact record (§3.10).
 * Tracked separately from time impact; separation must be explicitly confirmed.
 */
export interface ICommercialImpactRecord {
  /** Explicit flag; governs whether cost fields are required. */
  readonly hasCostImpact: boolean;
  /** USD estimate; positive = cost increase. Required if hasCostImpact. */
  readonly costImpactEstimate: number | null;
  /** Required if hasCostImpact. */
  readonly costImpactConfidence: QuantificationConfidence | null;
  /** Narrative of cost exposure; min 50 chars. Required if hasCostImpact. */
  readonly costImpactDescription: string | null;
  /** Optional line-level breakdown. */
  readonly costImpactBreakdown: readonly ICostBreakdownItem[];
  /** FK to ChangeEventRecord if cost impact flows to a change event. */
  readonly linkedChangeEventId: string | null;
  /** Must be true before Quantified state; confirms time/cost analysis separation. */
  readonly separationConfirmed: boolean;
}

/** Evidence attachment with governed evidence type for claims packaging. */
export interface IDelayEvidenceAttachment extends IAttachmentRef {
  /** Governed evidence type (§3.9). */
  readonly evidenceType: EvidenceType;
}

// ── Delay Record (§3.2) ─────────────────────────────────────────────

/** Delay record — the fundamental unit of the Delay Ledger. */
export interface IDelayRecord {
  // Identity (immutable after creation)
  readonly delayId: string;
  readonly projectId: string;
  /** System-generated; format DEL-[###]; auto-incrementing per project; immutable. */
  readonly delayNumber: string;

  // Description
  /** Short descriptive title; 10–150 characters. */
  readonly title: string;
  /** Contemporaneous narrative; 100–3000 characters. */
  readonly eventDescription: string;
  /** Governed delay event type (§3.5); immutable after creation. */
  readonly delayEventType: DelayEventType;
  /** Governed responsible party (§3.6); may be updated during analysis. */
  readonly responsibleParty: ResponsibleParty;

  // Identification (immutable after creation)
  /** ISO 8601; date delay was first formally recognized. */
  readonly dateIdentified: string;
  /** Name or user ID; immutable. */
  readonly identifiedBy: string;
  /** If spawned from a constraint; null if created directly; immutable. */
  readonly parentConstraintId: string | null;

  // Lifecycle
  /** Delay lifecycle status (§3.4); evidence gate rules enforced. */
  readonly status: DelayStatus;
  /** Date of most recent status transition. */
  readonly statusDate: string;

  // Event timing
  /** ISO 8601; date delay event commenced; must be ≤ dateIdentified; immutable. */
  readonly delayStartDate: string;
  /** ISO 8601; date delay concluded or projected; null if ongoing. */
  readonly delayEndDate: string | null;
  /** ISO 8601; date formal written notice was provided to owner. */
  readonly notificationDate: string | null;
  /** Reference to notification document. */
  readonly notificationReference: string | null;

  // Schedule reference (governed model)
  /** Determines which schedule fields are active. */
  readonly scheduleReferenceMode: ScheduleReferenceMode;
  /** FK to ScheduleVersionRecord; required if Integrated mode. */
  readonly scheduleVersionId: string | null;
  /** Human-readable name of control schedule; required in both modes. */
  readonly controlScheduleName: string;
  /** Date of control schedule update. */
  readonly controlScheduleDate: string;
  /** FKs to ImportedActivitySnapshot; used in Integrated mode. */
  readonly impactedActivityIds: readonly string[];
  /** Free-text activity names for ManualFallback mode. */
  readonly impactedActivityFreeText: readonly string[];
  /** Narrative of impacted schedule path; min 50 chars; required. */
  readonly impactedPathDescription: string;
  /** Governed critical path impact assessment (§3.7). */
  readonly criticalPathImpact: CriticalPathImpact;

  // Time impact (separate from cost)
  /** Time impact record; required at Quantified state gate. */
  readonly timeImpact: ITimeImpactRecord | null;

  // Commercial/cost impact (separate from time)
  /** Commercial impact record; required at Quantified gate if cost impact exists. */
  readonly commercialImpact: ICommercialImpactRecord | null;

  // Closure and disposition
  /** Required at Dispositioned gate. */
  readonly dispositionOutcome: DispositionOutcome | null;
  /** Required at Dispositioned gate. */
  readonly dispositionNotes: string | null;
  /** Set when status = Closed; immutable after set. */
  readonly dateClosed: string | null;
  /** Required for Void, Cancelled; recommended for Closed. */
  readonly closureReason: string | null;

  // Evidence and comments
  /** Evidence attachments with typed categories. */
  readonly evidenceAttachments: readonly IDelayEvidenceAttachment[];
  /** Append-only comment log. */
  readonly comments: readonly ICommentEntry[];
  /** FKs to ChangeEventRecord; peer links. */
  readonly linkedChangeEventIds: readonly string[];

  // Timestamps
  readonly createdAt: string;
  readonly createdBy: string;
  readonly lastEditedAt: string | null;
  readonly lastEditedBy: string | null;
}

// ── Health Spine Metrics (§3.11) ────────────────────────────────────

/** Delay Ledger metrics published to the Health Spine. */
export interface IDelayHealthMetrics {
  readonly openDelayCount: number;
  readonly criticalPathDelayCount: number;
  readonly totalQuantifiedDelayDays: number;
  readonly pendingNotificationCount: number;
  readonly delayCountByEventType: Readonly<Record<string, number>>;
}

// ── State Machine Support Types ─────────────────────────────────────

/** Context required for a delay status transition. */
export interface IDelayTransitionContext {
  readonly actor: string;
  readonly timestamp: string;
  readonly closureReason?: string;
}

/** Result of a delay status transition validation. */
export interface IDelayTransitionResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
}

/** Result of an immutability validation check. */
export interface IDelayImmutabilityResult {
  readonly valid: boolean;
  readonly violations: readonly string[];
}

/** Result of an evidence gate check. */
export interface IGateCheckResult {
  readonly met: boolean;
  readonly unmetConditions: readonly string[];
}

/** Result of a schedule reference consistency check. */
export interface IScheduleReferenceValidation {
  readonly valid: boolean;
  readonly errors: readonly string[];
}
