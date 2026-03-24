/**
 * P3-E11-T10 Stage 3 Project Startup Safety Readiness TypeScript contracts.
 * Jobsite safety checklist, sections, items, remediation records.
 */

import type {
  EscalationLevel,
  RemediationStatus,
  SafetyReadinessResult,
  SafetyReadinessSectionTitle,
} from './enums.js';
import type { StartupCertificationStatus } from '../foundation/enums.js';

// -- JobsiteSafetyChecklist (T07 §3) — Header record -----------------------

/** Jobsite safety checklist header per T07 §3. One per project. */
export interface IJobsiteSafetyChecklist {
  readonly safetyChecklistId: string;
  readonly programId: string;
  readonly projectId: string;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly lastModifiedAt: string;
  readonly lastModifiedBy: string | null;
  readonly passCount: number;
  readonly failCount: number;
  readonly naCount: number;
  readonly openRemediationCount: number;
  readonly escalatedRemediationCount: number;
  readonly certificationStatus: StartupCertificationStatus;
  readonly notes: string | null;
}

// -- SafetyReadinessSection (T07 §3) ----------------------------------------

/** Safety readiness section per T07 §3. Two per checklist. */
export interface ISafetyReadinessSection {
  readonly sectionId: string;
  readonly safetyChecklistId: string;
  readonly sectionNumber: number;
  readonly sectionTitle: SafetyReadinessSectionTitle;
  readonly itemCount: number;
}

// -- SafetyReadinessItem (T07 §4) -------------------------------------------

/** Safety readiness item per T07 §4. 32 per checklist. */
export interface ISafetyReadinessItem {
  readonly itemId: string;
  readonly sectionId: string;
  readonly itemNumber: string;
  readonly description: string;
  readonly result: SafetyReadinessResult | null;
  readonly assessedBy: string | null;
  readonly assessedAt: string | null;
  readonly lastModifiedAt: string | null;
  readonly lastModifiedBy: string | null;
  readonly hasOpenRemediation: boolean;
}

// -- SafetyRemediationRecord (T07 §5) --------------------------------------

/** Safety remediation record per T07 §5. Auto-created on Fail result. */
export interface ISafetyRemediationRecord {
  readonly remediationId: string;
  readonly itemId: string;
  readonly safetyChecklistId: string;
  readonly programId: string;
  readonly remediationNote: string | null;
  readonly remediationStatus: RemediationStatus;
  readonly assignedRoleCode: string | null;
  readonly assignedPersonName: string | null;
  readonly assignedUserId: string | null;
  readonly dueDate: string | null;
  readonly evidenceAttachmentIds: readonly string[];
  readonly escalationLevel: EscalationLevel;
  readonly escalatedAt: string | null;
  readonly escalatedBy: string | null;
  readonly escalationNote: string | null;
  readonly programBlockerRef: string | null;
  readonly resolvedAt: string | null;
  readonly resolvedBy: string | null;
  readonly createdAt: string;
  readonly createdBy: string;
}

// -- Supporting Types -------------------------------------------------------

/** Section definition metadata per T07 §3. */
export interface ISafetyReadinessSectionDefinition {
  readonly sectionNumber: number;
  readonly sectionTitle: SafetyReadinessSectionTitle;
  readonly label: string;
  readonly itemCount: number;
}

/** Governed item template entry per T07 §6. */
export interface ISafetyReadinessItemTemplate {
  readonly itemNumber: string;
  readonly description: string;
  readonly sectionTitle: SafetyReadinessSectionTitle;
}

/** Valid remediation state transition per T07 §5.0. */
export interface IRemediationStateTransition {
  readonly from: RemediationStatus;
  readonly to: RemediationStatus;
  readonly description: string;
}

/** Escalation threshold rule per T07 §5.2. */
export interface IEscalationThreshold {
  readonly condition: string;
  readonly escalateTo: EscalationLevel;
  readonly createsProgramBlocker: boolean;
  readonly workQueueItemType: string;
}

/** Stage 3 Activity Spine event definition per T10 §2 Stage 3. */
export interface IStage3ActivityEventDef {
  readonly event: string;
  readonly description: string;
}

/** Stage 3 Health Spine metric definition per T10 §2 Stage 3. */
export interface IStage3HealthMetricDef {
  readonly metric: string;
  readonly description: string;
}

/** Stage 3 Work Queue item definition. */
export interface IStage3WorkQueueItemDef {
  readonly item: string;
  readonly description: string;
  readonly assignedTo: string;
}
