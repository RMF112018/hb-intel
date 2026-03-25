/**
 * P3-E15-T10 Stage 1 Project QC Module foundation TypeScript contracts.
 * Operating model, SoT boundaries, adjacent modules, record families, governance.
 */

import type {
  GovernedCoreConcern,
  GovernedUpdateNoticeState,
  ProjectQcSnapshotState,
  QcAdjacentModule,
  QcAntiGoal,
  QcKeyActor,
  QcLaneCapability,
  QcOperationalOwnershipArea,
  QcOutOfScopeItem,
  QcRecordFamily,
  QcSoTAuthority,
  QcSoTRelationship,
  QcSupportingRefFamily,
} from './enums.js';

// -- Operating Model Interfaces (T01) -----------------------------------------

/** Source-of-truth boundary row per T03 §3. */
export interface IQcSoTBoundary {
  readonly dataConcern: string;
  readonly sotOwner: QcSoTAuthority;
  readonly qcRelationship: QcSoTRelationship;
  readonly notes: string;
}

/** Adjacent module boundary definition per T01 §6. */
export interface IQcAdjacentModuleBoundary {
  readonly adjacentModule: QcAdjacentModule;
  readonly whatAdjacentOwns: string;
  readonly whatQcDoes: string;
  readonly qcBoundary: string;
}

/** Anti-goal definition per T01 §1.2. */
export interface IQcAntiGoalDef {
  readonly antiGoal: QcAntiGoal;
  readonly correctBoundary: string;
}

/** Out-of-scope item definition per T01 §7.1. */
export interface IQcOutOfScopeDef {
  readonly item: QcOutOfScopeItem;
  readonly reasonDeferred: string;
}

/** Operational ownership definition per T01 §5. */
export interface IQcOperationalOwnershipDef {
  readonly area: QcOperationalOwnershipArea;
  readonly primaryOwner: QcKeyActor;
  readonly notes: string;
}

/** Lane capability definition per T01 §7. */
export interface IQcLaneCapabilityDef {
  readonly lane: QcLaneCapability;
  readonly description: string;
}

/** Locked invariant from governing docs. */
export interface IQcLockedInvariant {
  readonly invariant: string;
  readonly description: string;
}

/** Historical input boundary per T01 §7.2. */
export interface IQcHistoricalInputBoundary {
  readonly source: string;
  readonly constraint: string;
}

// -- Governance Interfaces (T02) -----------------------------------------------

/** Role action matrix row per T02 §4. */
export interface IQcRoleAction {
  readonly action: string;
  readonly pmPePa: boolean;
  readonly superintendent: boolean;
  readonly qcManager: boolean;
  readonly authorizedHbVerifier: boolean;
  readonly moeAdmin: boolean;
  readonly disciplineReviewer: boolean;
}

/** Governed core concern definition per T02 §2. */
export interface IQcGovernedCoreConcernDef {
  readonly concern: GovernedCoreConcern;
  readonly governedOwner: string;
  readonly projectExtensionAllowed: boolean;
  readonly extensionConstraint: string;
}

/** Project extension rule per T02 §2.1. */
export interface IQcProjectExtensionRule {
  readonly ruleNumber: number;
  readonly description: string;
}

/** Verifier designation rule per T02 §4.1. */
export interface IQcVerifierDesignationRule {
  readonly step: number;
  readonly description: string;
}

// -- Record Contract Interfaces (T03) ------------------------------------------

/** Record family definition per T03 §2. */
export interface IQcRecordFamilyDef {
  readonly family: QcRecordFamily;
  readonly sotOwner: QcSoTAuthority;
  readonly identifiers: readonly string[];
  readonly stateFoundation: string;
  readonly lineageRole: string;
}

/** ProjectQcSnapshot contract per T03 §2.5 / T02 §5.1. */
export interface IProjectQcSnapshot {
  readonly projectQcSnapshotId: string;
  readonly projectId: string;
  readonly snapshotVersionId: string;
  readonly state: ProjectQcSnapshotState;
  readonly governedVersionRefs: readonly string[];
  readonly activePlanRefs: readonly string[];
  readonly issuePosture: string;
  readonly deviationPosture: string;
  readonly approvalPosture: string;
  readonly advisoryPosture: string;
  readonly rollupPosture: string;
  readonly handoffRefs: readonly string[];
  readonly createdAt: string;
  readonly publishedAt: string | null;
}

/** GovernedUpdateNotice contract per T03 §2.5 / T02 §6.1. */
export interface IGovernedUpdateNotice {
  readonly governedUpdateNoticeId: string;
  readonly governedChangeKey: string;
  readonly publishedVersionId: string;
  readonly state: GovernedUpdateNoticeState;
  readonly changedFamily: string;
  readonly impactDescription: string;
  readonly adoptionRequirement: string;
  readonly effectiveDate: string;
  readonly recheckInstruction: string;
  readonly affectedRecords: readonly string[];
  readonly publishedAt: string;
}

/** Lineage chain step per T03 §5.2. */
export interface IQcLineageChainStep {
  readonly family: QcRecordFamily | QcSupportingRefFamily;
  readonly depth: number;
  readonly description: string;
}

/** Shared package requirement per T02 §9 / T03 §8. */
export interface IQcSharedPackageRequirement {
  readonly packageName: string;
  readonly requiredUse: string;
}

/** Downstream handoff per T03 §7. */
export interface IQcDownstreamHandoff {
  readonly target: QcAdjacentModule;
  readonly handoffContent: string;
}

/** Cross-contract reference per P3-E15 master index. */
export interface IQcCrossContractRef {
  readonly sourceDoc: string;
  readonly concern: string;
}
