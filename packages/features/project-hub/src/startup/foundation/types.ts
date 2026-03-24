/**
 * P3-E11-T10 Stage 1 Project Startup Module foundation TypeScript contracts.
 * Program core records, state machine, certifications, waivers, blockers.
 */

import type {
  StartupCertificationStatus,
  GateCriterionResult,
  GateOutcome,
  MobilizationAuthStatus,
  ProgramBlockerScope,
  ProgramBlockerStatus,
  ProgramBlockerType,
  StartupFunction,
  StartupReadinessStateCode,
  StartupSubSurface,
  StartupTier,
  StartupTransitionTriggerType,
  WaiverStatus,
} from './enums.js';

// -- Tier 1 Record Interfaces (T02 §3) ----------------------------------------

/** StartupProgram root record per T02 §3.1. One per project. */
export interface IStartupProgram {
  readonly programId: string;
  readonly projectId: string;
  readonly projectName: string;
  readonly projectNumber: string;
  readonly currentStateCode: StartupReadinessStateCode;
  readonly stabilizationWindowDays: number;
  readonly stabilizationWindowOpensAt: string | null;
  readonly stabilizationWindowClosesAt: string | null;
  readonly baselineLockedAt: string | null;
  readonly baselineLockedBy: string | null;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly lastModifiedAt: string;
  readonly lastModifiedBy: string | null;
}

/** Immutable audit log entry per T02 §3.2. One per state transition. */
export interface IStartupProgramVersion {
  readonly versionId: string;
  readonly programId: string;
  readonly projectId: string;
  readonly fromStateCode: StartupReadinessStateCode | null;
  readonly toStateCode: StartupReadinessStateCode;
  readonly transitionedAt: string;
  readonly transitionedBy: string;
  readonly transitionTrigger: string;
  readonly notes: string | null;
}

/** Current lifecycle state per T02 §3.3. One active record per project. */
export interface IStartupReadinessState {
  readonly stateId: string;
  readonly programId: string;
  readonly stateCode: StartupReadinessStateCode;
  readonly enteredAt: string;
  readonly enteredBy: string;
  readonly stateNotes: string | null;
}

/** Readiness certification per sub-surface per T02 §3.4. */
export interface IReadinessCertification {
  readonly certId: string;
  readonly programId: string;
  readonly projectId: string;
  readonly subSurface: StartupSubSurface;
  readonly certStatus: StartupCertificationStatus;
  readonly certVersion: number;
  readonly certifierRole: string;
  readonly certifiedBy: string[] | null;
  readonly submittedAt: string | null;
  readonly submittedBy: string | null;
  readonly openBlockerCount: number;
  readonly openRemediationCount: number;
  readonly approvedWaiverCount: number;
  readonly activeGateRecordId: string | null;
  readonly createdAt: string;
  readonly lastModifiedAt: string;
}

/** PE gate evaluation per T02 §3.5. */
export interface IReadinessGateRecord {
  readonly gateId: string;
  readonly certId: string;
  readonly programId: string;
  readonly subSurface: StartupSubSurface;
  readonly gateVersion: number;
  readonly evaluatedAt: string;
  readonly evaluatedBy: string;
  readonly gateOutcome: GateOutcome;
  readonly gateNotes: string | null;
  readonly criteria: readonly IReadinessGateCriterion[];
}

/** Gate criterion per T02 §3.6. */
export interface IReadinessGateCriterion {
  readonly criterionId: string;
  readonly gateId: string;
  readonly criterionCode: string;
  readonly criterionLabel: string;
  readonly result: GateCriterionResult;
  readonly peNote: string | null;
}

/** Exception waiver per T02 §3.9. */
export interface IExceptionWaiverRecord {
  readonly waiverId: string;
  readonly programId: string;
  readonly certId: string;
  readonly subSurface: StartupSubSurface;
  readonly blockerId: string | null;
  readonly waivedItemRef: string;
  readonly rationale: string;
  readonly riskAcknowledgment: string;
  readonly plannedResolutionDate: string;
  readonly waiverStatus: WaiverStatus;
  readonly requestedAt: string;
  readonly requestedBy: string;
  readonly peDecisionAt: string | null;
  readonly peDecisionBy: string | null;
  readonly peDecisionNotes: string | null;
  readonly resolvedAt: string | null;
  readonly resolvedBy: string | null;
  readonly lapsedAt: string | null;
}

/** Program-level blocker per T02 §3.10. */
export interface IProgramBlocker {
  readonly blockerId: string;
  readonly programId: string;
  readonly projectId: string;
  readonly blockerScope: ProgramBlockerScope;
  readonly affectedSubSurfaces: readonly StartupSubSurface[] | null;
  readonly blockerType: ProgramBlockerType;
  readonly description: string;
  readonly raisedBy: string;
  readonly raisedAt: string;
  readonly blockerStatus: ProgramBlockerStatus;
  readonly responsibleParty: string | null;
  readonly targetResolutionDate: string | null;
  readonly escalatedToPE: boolean;
  readonly peResponse: string | null;
  readonly resolvedAt: string | null;
  readonly resolvedBy: string | null;
  readonly createdAt: string;
}

/** PE mobilization authorization per T02 §3.11. One per project. */
export interface IPEMobilizationAuthorization {
  readonly authId: string;
  readonly programId: string;
  readonly projectId: string;
  readonly authStatus: MobilizationAuthStatus;
  readonly authorizedAt: string;
  readonly authorizedBy: string;
  readonly stabilizationWindowDays: number;
  readonly authNotes: string | null;
  readonly certificationsSummaryAtAuth: Record<StartupSubSurface, StartupCertificationStatus>;
  readonly openWaiverCountAtAuth: number;
  readonly openBlockerCountAtAuth: number;
  readonly revokedAt: string | null;
  readonly revokedBy: string | null;
  readonly revocationRationale: string | null;
}

// -- Supporting Types ---------------------------------------------------------

/** Sub-surface definition per T01 §3.2. */
export interface IStartupSubSurfaceDefinition {
  readonly subSurface: StartupSubSurface;
  readonly architecturalRole: string;
  readonly description: string;
  readonly gateWeight: 'Required';
}

/** Valid state transition per T01 §4.2. */
export interface IStartupStateTransition {
  readonly from: StartupReadinessStateCode;
  readonly to: StartupReadinessStateCode;
  readonly triggerType: StartupTransitionTriggerType;
  readonly condition: string;
  readonly requiresPE: boolean;
}

/** Governed gate criterion definition per T02 §3.7. */
export interface IGovernedGateCriterionDef {
  readonly subSurface: StartupSubSurface;
  readonly criterionCode: string;
  readonly criterionLabel: string;
}

/** Role-scoped certification ownership per T02 §3.8. */
export interface IRoleScopedCertOwnership {
  readonly subSurface: StartupSubSurface;
  readonly requiredCertifiers: string;
  readonly peReviewer: string;
  readonly notes: string;
}

/** SoT boundary row per T01 §8.2. */
export interface IStartupSoTBoundary {
  readonly dataConcern: string;
  readonly sotOwner: string;
  readonly startupRelationship: string;
  readonly direction: string;
  readonly notes: string;
}

/** Record family definition per T02 §1. */
export interface IStartupRecordFamilyDefinition {
  readonly family: string;
  readonly tier: StartupTier;
  readonly key: string;
  readonly notes: string;
}

/** Locked architecture decision per P3-E11 master index. */
export interface IStartupLockedDecision {
  readonly decisionId: number;
  readonly description: string;
}

/** Cross-contract reference per T01 §9. */
export interface IStartupCrossContractRef {
  readonly contract: string;
  readonly relationship: string;
}

/** Operating principle per T01 §1. */
export interface IStartupOperatingPrinciple {
  readonly id: number;
  readonly function: StartupFunction;
  readonly description: string;
}

/** Shared package requirement per T10 §1. */
export interface IStartupSharedPackageRequirement {
  readonly packageName: string;
  readonly blockerLevel: 'Hard blocker';
  readonly verificationRequired: string;
}

/** Stage 1 Activity Spine event definition per T10 §2 Stage 1. */
export interface IStage1ActivityEventDef {
  readonly event: string;
  readonly description: string;
}

/** Stage 1 Health Spine metric definition per T10 §2 Stage 1. */
export interface IStage1HealthMetricDef {
  readonly metric: string;
  readonly description: string;
}
