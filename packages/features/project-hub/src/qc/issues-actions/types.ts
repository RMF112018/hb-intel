/**
 * P3-E15-T10 Stage 5 Project QC Module issues-actions TypeScript contracts.
 */

import type { QcIssueSeverity, ControlGateType, QcSlaClass, QcIssueReadinessImpact } from '../record-families/enums.js';
import type { ControlGateStatus } from '../plans-reviews/enums.js';
import type {
  IssueOriginationMode,
  ClosureAuthorityType,
  WorkQueuePublicationState,
  WorkQueueSourceType,
  RootCauseQualification,
  RootCauseRequiredReason,
  EscalationTrigger,
  IssuePriorityBand,
  IssueActionRelationship,
} from './enums.js';

// -- Finding Origin Context (T05 §2.1) ---------------------------------------

export interface IFindingOriginContext {
  readonly reviewPackageId: string;
  readonly findingId: string;
  readonly affectedRequirementRefs: readonly string[];
  readonly findingSeverity: QcIssueSeverity;
  readonly originResponsiblePartyContext: string;
  readonly governedRequirementRefs: readonly string[];
}

// -- Gate Origin Context (T05 §2.2) ------------------------------------------

export interface IGateOriginContext {
  readonly workPackageQualityPlanId: string;
  readonly controlGateRequirementId: string;
  readonly gateType: ControlGateType;
  readonly failedCriterion: string;
  readonly gateStatusAtSpawn: ControlGateStatus;
}

// -- Ad Hoc Origin Context (T05 §2.3) ----------------------------------------

export interface IAdHocOriginContext {
  readonly observerUserId: string;
  readonly workPackageRef: string | null;
  readonly observationRationale: string;
  readonly projectProvenance: string;
  readonly observedAt: string;
}

// -- Issue Origination Record (T05 §2) ---------------------------------------

export interface IIssueOriginationRecord {
  readonly originationRecordId: string;
  readonly qcIssueId: string;
  readonly mode: IssueOriginationMode;
  readonly findingContext: IFindingOriginContext | null;
  readonly gateContext: IGateOriginContext | null;
  readonly adHocContext: IAdHocOriginContext | null;
}

// -- Closure Authority Record (T05 §3.3) -------------------------------------

export interface IClosureAuthorityRecord {
  readonly closureRecordId: string;
  readonly recordId: string;
  readonly closureType: ClosureAuthorityType;
  readonly verifierUserId: string;
  readonly verifierDesignationRef: string;
  readonly closedAt: string;
  readonly verificationNotes: string;
  readonly evidenceRefs: readonly string[];
}

// -- Work Queue Publication Item (T05 §8) ------------------------------------

export interface IWorkQueuePublicationItem {
  readonly workItemId: string;
  readonly sourceType: WorkQueueSourceType;
  readonly sourceRecordId: string;
  readonly projectId: string;
  readonly workPackageRef: string | null;
  readonly title: string;
  readonly dueDate: string | null;
  readonly priorityBand: IssuePriorityBand;
  readonly slaClass: QcSlaClass;
  readonly readinessImpact: QcIssueReadinessImpact;
  readonly ownerOrganization: string;
  readonly reviewerNeededFlag: boolean;
  readonly deepLinkRef: string;
  readonly publicationState: WorkQueuePublicationState;
  readonly publishedAt: string;
}

// -- Root Cause Qualification Record (T05 §7.1) ------------------------------

export interface IRootCauseQualificationRecord {
  readonly qualificationRecordId: string;
  readonly qcIssueId: string;
  readonly qualification: RootCauseQualification;
  readonly requiredReason: RootCauseRequiredReason | null;
  readonly notRequiredRationale: string | null;
  readonly qualifiedByUserId: string;
  readonly qualifiedAt: string;
}

// -- Escalation Event (T05 §6) -----------------------------------------------

export interface IEscalationEvent {
  readonly escalationEventId: string;
  readonly sourceRecordId: string;
  readonly sourceType: WorkQueueSourceType;
  readonly trigger: EscalationTrigger;
  readonly previousPriorityBand: IssuePriorityBand;
  readonly newPriorityBand: IssuePriorityBand;
  readonly escalatedAt: string;
  readonly escalatedBySystem: boolean;
}

// -- Issue Action Coupling (T05 §4.2) ----------------------------------------

export interface IIssueActionCoupling {
  readonly couplingId: string;
  readonly parentIssueId: string;
  readonly childActionId: string;
  readonly relationship: IssueActionRelationship;
  readonly isChildClosureRequiredForParentClosure: boolean;
  readonly childReopenTriggersParentReopen: boolean;
}
