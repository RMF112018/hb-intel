/**
 * PCC Permit & Inspection Control Center — shared model contracts.
 *
 * Phase 3 / Wave 10 / Prompt 02. Type-only contracts that unify the
 * legacy `permits` and `required-inspections` workflow families into a
 * single Permit & Inspection Control Center read-model. AHJ posture is
 * launcher-only; evidence is references-only; fee exposure is a
 * first-class read-model concern; reinspection lineage is preserved as
 * a first-class entity. No backend route, SPFx UI, HTTP client, write
 * route, or external runtime is implied.
 *
 * Authority:
 *   - docs/architecture/blueprint/sp-project-control-center/phase-3/wave-10/Permit_Inspection_Control_Center_Target_Architecture.md
 *   - docs/architecture/blueprint/sp-project-control-center/phase-3/wave-10/Wave_10_Resolved_Decisions_Register.md
 *   - docs/architecture/blueprint/sp-project-control-center/phase-3/wave-10/Wave_10_Workbook_Source_Mapping.md
 *
 * Locked decisions:
 *   - Internal source-family identifiers `permits` and `required-inspections`
 *     are preserved verbatim.
 *   - The Project Readiness source-module identifier `permit-log` is
 *     preserved; Wave 10 publishes a readiness signal that targets the
 *     existing `permit-log` framework slot.
 *   - The user-facing module title is "Permit & Inspection Control
 *     Center". The read-model key registered in `PccReadModelResponseMap`
 *     is `permit-inspection-control-center`.
 *
 * Guardrails:
 *   - No AHJ runtime (no scraping, API calls, scheduling, submission, or
 *     status polling).
 *   - No Procore writeback or runtime integration.
 *   - No Microsoft Graph, SharePoint REST, or PnP runtime.
 *   - No evidence upload, sync, mirror, or storage behavior.
 *   - No backend write routes, approval execution, or tenant mutation.
 *
 * @module pcc/PermitInspectionControlCenter
 */

import type { PccPersona } from './PccUserRoles.js';
import type { PriorityActionCategory } from './PriorityActions.js';
import type { SiteHealthSeverity } from './SiteHealth.js';

// ---------------------------------------------------------------------------
// Permit lifecycle status (11). Workbook-derived plus normalized
// transitional states (`pending-application`, `pending-revision`,
// `expiring`, `void`, `closed`).
// ---------------------------------------------------------------------------

export const PERMIT_STATUSES = [
  'not-started',
  'pending-application',
  'application-submitted',
  'pending-revision',
  'approved',
  'received',
  'active',
  'expiring',
  'expired',
  'void',
  'closed',
] as const;
export type PermitStatus = (typeof PERMIT_STATUSES)[number];

// ---------------------------------------------------------------------------
// Required-inspection lifecycle status (11). Distinct from
// `INSPECTION_RESULT_STATUSES`: lifecycle status describes where an
// inspection is in its readiness pipeline, while result status is the
// outcome captured on the workbook scoring sheet.
// ---------------------------------------------------------------------------

export const INSPECTION_STATUSES = [
  'not-ready',
  'ready-to-request',
  'requested',
  'scheduled',
  'partial',
  'passed',
  'failed',
  'reinspection-required',
  'reinspection-scheduled',
  'closed',
  'not-applicable',
] as const;
export type InspectionStatus = (typeof INSPECTION_STATUSES)[number];

// ---------------------------------------------------------------------------
// Inspection result status (4). Workbook validation list normalized to
// kebab-case.
// ---------------------------------------------------------------------------

export const INSPECTION_RESULT_STATUSES = ['pass', 'fail', 'partial', 'not-applicable'] as const;
export type InspectionResultStatus = (typeof INSPECTION_RESULT_STATUSES)[number];

// ---------------------------------------------------------------------------
// Fee posture (6). Permit-fee, application-value, and reinspection-fee
// records share a single status vocabulary.
// ---------------------------------------------------------------------------

export const FEE_STATUSES = [
  'not-applicable',
  'open',
  'pending-receipt',
  'paid',
  'waived',
  'disputed',
] as const;
export type FeeStatus = (typeof FEE_STATUSES)[number];

// ---------------------------------------------------------------------------
// Evidence reference posture (5). Evidence is a reference into HB
// Document Control — no upload, sync, or storage is performed.
// ---------------------------------------------------------------------------

export const EVIDENCE_STATUSES = [
  'not-required',
  'required-missing',
  'submitted',
  'verified',
  'override-approved',
] as const;
export type EvidenceStatus = (typeof EVIDENCE_STATUSES)[number];

// ---------------------------------------------------------------------------
// Jurisdiction type (5).
// ---------------------------------------------------------------------------

export const JURISDICTION_TYPES = [
  'city',
  'county',
  'state',
  'federal',
  'special-district',
] as const;
export type JurisdictionType = (typeof JURISDICTION_TYPES)[number];

// ---------------------------------------------------------------------------
// Source classification (5). Tracks how a record's data entered the
// Permit & Inspection Control Center read-model.
// ---------------------------------------------------------------------------

export const SOURCE_CLASSIFICATIONS = [
  'workbook-derived',
  'workbook-enhanced',
  'chat-required',
  'research-informed',
  'repo-alignment',
] as const;
export type SourceClassification = (typeof SOURCE_CLASSIFICATIONS)[number];

// ---------------------------------------------------------------------------
// Related record type (3). Used by fee exposure and audit cross-refs.
// ---------------------------------------------------------------------------

export const RELATED_RECORD_TYPES = ['permit', 'inspection', 'reinspection'] as const;
export type RelatedRecordType = (typeof RELATED_RECORD_TYPES)[number];

// ---------------------------------------------------------------------------
// Internal source family (2). Preserves the legacy WorkflowModules
// identifiers `permits` and `required-inspections` so downstream
// consumers can route by family without re-deriving.
// ---------------------------------------------------------------------------

export const PERMIT_INSPECTION_SOURCE_FAMILIES = ['permits', 'required-inspections'] as const;
export type PermitInspectionSourceFamily = (typeof PERMIT_INSPECTION_SOURCE_FAMILIES)[number];

// ---------------------------------------------------------------------------
// Approval/checkpoint signal kind (5). Wave 10 publishes these as
// read-only metadata; Wave 14 owns the canonical Approvals/Checkpoints
// vocabulary and will define the authoritative mapping when its work
// lands.
// ---------------------------------------------------------------------------

export const PERMIT_INSPECTION_CHECKPOINT_KINDS = [
  'closeout-authorization',
  'no-reinspection-exception',
  'override-by-reason',
  'evidence-override-by-reason',
  'transition-exception-override',
] as const;
export type PermitInspectionCheckpointKind = (typeof PERMIT_INSPECTION_CHECKPOINT_KINDS)[number];

// ---------------------------------------------------------------------------
// Readiness signal posture (4). Maps cleanly to the Wave 8
// ProjectReadinessFramework consumer.
// ---------------------------------------------------------------------------

export const PERMIT_INSPECTION_READINESS_POSTURES = [
  'on-track',
  'attention',
  'risk',
  'blocker',
] as const;
export type PermitInspectionReadinessPosture =
  (typeof PERMIT_INSPECTION_READINESS_POSTURES)[number];

// ---------------------------------------------------------------------------
// Workbook source lineage. Every read-model record carries a lineage
// reference back to the originating workbook + sheet + range so future
// audits can trace data provenance without ambiguity.
// ---------------------------------------------------------------------------

export interface IPermitInspectionSourceLineage {
  readonly workbookFile: string;
  readonly sheet: string;
  readonly range: string;
  readonly rowPointer?: string;
  readonly classification: SourceClassification;
}

// ---------------------------------------------------------------------------
// Evidence link (reference-only). HB Document Control remains the
// source of record. No upload, blob, sync, or storage field is exposed.
// ---------------------------------------------------------------------------

export interface IPermitInspectionEvidenceLink {
  readonly id: string;
  readonly label: string;
  readonly status: EvidenceStatus;
  readonly externalRef?: string;
  readonly ownedByDocumentControl: true;
}

// ---------------------------------------------------------------------------
// Audit event metadata. Records who/when/what for any state transition
// surfaced in the read-model. Consumed read-only by the SPFx surface.
// ---------------------------------------------------------------------------

export interface IPermitInspectionAuditEvent {
  readonly id: string;
  readonly occurredAtUtc: string;
  readonly actorPersona?: PccPersona;
  readonly action: string;
  readonly priorValue?: string;
  readonly newValue?: string;
  readonly reason?: string;
  readonly correlationId?: string;
}

// ---------------------------------------------------------------------------
// Transition descriptor. Surface authoring uses this to render allowed
// next-step pickers without re-deriving rules client-side.
// ---------------------------------------------------------------------------

export interface IPermitInspectionTransition {
  readonly from: string;
  readonly to: string;
  readonly decisionAuthorityPersona?: PccPersona;
  readonly requiresApproval: boolean;
  readonly requiresReason: boolean;
}

// ---------------------------------------------------------------------------
// AHJ jurisdiction profile. `launcherOnly` is locked to literal `true`
// so any consumer that drops it (or invents a write field) fails type
// checking — compile-time enforcement of W10-D03.
// ---------------------------------------------------------------------------

export interface IAhjJurisdictionProfile {
  readonly ahjId: string;
  readonly ahjDisplayName: string;
  readonly jurisdictionType: JurisdictionType;
  readonly portalUrl?: string;
  readonly inspectionPortalUrl?: string;
  readonly contactName?: string;
  readonly contactPhone?: string;
  readonly contactEmail?: string;
  readonly cutoffNotes?: string;
  readonly launcherOnly: true;
  readonly sourceLineage: IPermitInspectionSourceLineage;
}

// ---------------------------------------------------------------------------
// Permit record. Workbook-derived fields plus three Wave 10 target-added
// fields (`revision`, `applicationValue`, `permitFee`). `sourceFamily`
// is locked to the literal `'permits'` to prevent silent drift.
// ---------------------------------------------------------------------------

export interface IPermitRecord {
  readonly permitId: string;
  readonly permitNumber: string;
  readonly permitType: string;
  readonly status: PermitStatus;
  readonly location: string;
  readonly description: string;
  readonly responsibleParty?: PccPersona;
  readonly ahjId: string;
  readonly dateRequired?: string;
  readonly dateSubmitted?: string;
  readonly dateReceived?: string;
  readonly dateExpires?: string;
  readonly revision: number;
  readonly applicationValue?: number;
  readonly permitFee?: number;
  readonly comments?: string;
  readonly evidenceLinks: readonly IPermitInspectionEvidenceLink[];
  readonly auditEvents: readonly IPermitInspectionAuditEvent[];
  readonly sourceLineage: IPermitInspectionSourceLineage;
  readonly sourceFamily: 'permits';
}

// ---------------------------------------------------------------------------
// Required-inspection record. Workbook-derived fields plus the
// `reInspectionFee` target-added field. `sourceFamily` is locked to
// `'required-inspections'`.
// ---------------------------------------------------------------------------

export interface IInspectionRecord {
  readonly inspectionId: string;
  readonly inspectionNumber: string;
  readonly inspectionType: string;
  readonly inspectionCode?: string;
  readonly relatedPermitId: string;
  readonly status: InspectionStatus;
  readonly resultStatus?: InspectionResultStatus;
  readonly dateCalledIn?: string;
  readonly scheduledWindow?: string;
  readonly comment?: string;
  readonly verifiedOnline: boolean;
  readonly reinspectionRequired: boolean;
  readonly reInspectionFee?: number;
  readonly evidenceLinks: readonly IPermitInspectionEvidenceLink[];
  readonly auditEvents: readonly IPermitInspectionAuditEvent[];
  readonly sourceLineage: IPermitInspectionSourceLineage;
  readonly sourceFamily: 'required-inspections';
}

// ---------------------------------------------------------------------------
// Reinspection lineage. First-class entity that captures parent/child
// pairing, corrective-action ownership, scheduling cadence, and audit
// continuity for any failed-then-reinspected workflow.
// ---------------------------------------------------------------------------

export interface IReinspectionLineage {
  readonly lineageId: string;
  readonly parentInspectionId: string;
  readonly childReinspectionId?: string;
  readonly failedItemSummary: string;
  readonly correctiveActionOwner?: PccPersona;
  readonly correctiveActionDueDate?: string;
  readonly reinspectionRequired: boolean;
  readonly reinspectionRequestedDate?: string;
  readonly reinspectionScheduledWindow?: string;
  readonly reInspectionFee?: number;
  readonly reinspectionResult?: InspectionResultStatus;
  readonly evidenceLinks: readonly IPermitInspectionEvidenceLink[];
  readonly auditEvents: readonly IPermitInspectionAuditEvent[];
}

// ---------------------------------------------------------------------------
// Fee exposure record. Cross-references back to the originating
// permit/inspection/reinspection. Receipts are evidence links — no fee
// payment runtime is implied.
// ---------------------------------------------------------------------------

export interface IFeeExposureRecord {
  readonly feeRecordId: string;
  readonly relatedRecordType: RelatedRecordType;
  readonly relatedRecordId: string;
  readonly applicationValue?: number;
  readonly permitFee?: number;
  readonly reInspectionFee?: number;
  readonly feeStatus: FeeStatus;
  readonly invoiceReference?: string;
  readonly receiptEvidenceLinks: readonly IPermitInspectionEvidenceLink[];
  readonly notes?: string;
}

// ---------------------------------------------------------------------------
// Priority-action signal. Wave 10 publishes read-only signal metadata
// referencing existing PriorityActionCategory vocabulary; no new
// priority-action category is introduced (PriorityActions.ts is out of
// scope for this prompt).
// ---------------------------------------------------------------------------

export interface IPermitInspectionPriorityActionSignal {
  readonly signalId: string;
  readonly sourceFamily: PermitInspectionSourceFamily;
  readonly sourceRecordId: string;
  readonly priorityActionCategory: PriorityActionCategory;
  readonly severity?: SiteHealthSeverity;
  readonly summary: string;
  readonly dueDate?: string;
}

// ---------------------------------------------------------------------------
// Project Readiness signal. The `readinessSourceModuleId` literal is
// pinned to `'permit-log'` — the contract bridge to the preserved
// PROJECT_READINESS_SOURCE_MODULES vocabulary. Renaming requires a
// cross-package migration outside this prompt's scope.
// ---------------------------------------------------------------------------

export interface IPermitInspectionReadinessSignal {
  readonly signalId: string;
  readonly readinessSourceModuleId: 'permit-log';
  readonly sourceFamily: PermitInspectionSourceFamily;
  readonly sourceRecordId: string;
  readonly posture: PermitInspectionReadinessPosture;
  readonly summary: string;
}

// ---------------------------------------------------------------------------
// Approvals / Checkpoints signal. Local kind vocabulary; Wave 14 owns
// the canonical Approvals model and will publish a mapping later.
// ---------------------------------------------------------------------------

export interface IPermitInspectionApprovalSignal {
  readonly signalId: string;
  readonly sourceFamily: PermitInspectionSourceFamily;
  readonly sourceRecordId: string;
  readonly checkpointKind: PermitInspectionCheckpointKind;
  readonly summary: string;
}

// ---------------------------------------------------------------------------
// Top-level read-model summary. Counts are deterministic snapshots of
// the read-model body; SPFx renders them without re-aggregating.
// ---------------------------------------------------------------------------

export interface IPermitInspectionControlCenterSummary {
  readonly permitCount: number;
  readonly expiringCount: number;
  readonly expiredCount: number;
  readonly pendingRevisionCount: number;
  readonly inspectionCount: number;
  readonly failedInspectionCount: number;
  readonly openReinspectionCount: number;
  readonly openFeeExposureCount: number;
  readonly evidenceMissingCount: number;
  readonly ahjLauncherCount: number;
}

// ---------------------------------------------------------------------------
// Read-model snapshot. Prompt 03 will register
// `'permit-inspection-control-center'` in `PccReadModelResponseMap`
// during this same model patch (PccReadModels.ts is touched in this
// prompt to preserve cascade truth across @hbc/models).
// ---------------------------------------------------------------------------

export interface IPermitInspectionControlCenterReadModel {
  readonly summary: IPermitInspectionControlCenterSummary;
  readonly permits: readonly IPermitRecord[];
  readonly inspections: readonly IInspectionRecord[];
  readonly reinspectionLineages: readonly IReinspectionLineage[];
  readonly ahjProfiles: readonly IAhjJurisdictionProfile[];
  readonly feeExposure: readonly IFeeExposureRecord[];
  readonly priorityActionSignals: readonly IPermitInspectionPriorityActionSignal[];
  readonly readinessSignals: readonly IPermitInspectionReadinessSignal[];
  readonly approvalSignals: readonly IPermitInspectionApprovalSignal[];
  readonly permitTransitions: readonly IPermitInspectionTransition[];
  readonly inspectionTransitions: readonly IPermitInspectionTransition[];
}

export type PccPermitInspectionControlCenterReadModel = IPermitInspectionControlCenterReadModel;
