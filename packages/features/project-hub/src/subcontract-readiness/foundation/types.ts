/**
 * P3-E13-T08 Stage 1 Subcontract Execution Readiness Module foundation TypeScript contracts.
 * Operating model interfaces: surfaces, boundaries, SoT, ownership, activation, cross-contract.
 */

import type {
  AdjacentModuleCode,
  CaseActivationTrigger,
  CrossContractRole,
  ModuleIdentityExclusion,
  ReadinessAuthorityRule,
  ReadinessBusinessConcern,
  ReadinessOperatingLayer,
  ReadinessOwnerRole,
  ReadinessRecordClass,
  ReadinessSurfaceCode,
} from './enums.js';

// -- Surface Definition (T01 §4.1) --------------------------------------------

/** Primary operating surface per T01 §4.1. */
export interface IReadinessSurface {
  readonly surfaceCode: ReadinessSurfaceCode;
  readonly displayName: string;
  readonly primaryUsers: readonly ReadinessOwnerRole[];
  readonly purpose: string;
}

// -- Operating Layer Definition (T01 §4.2) ------------------------------------

/** Operating layer per T01 §4.2. */
export interface IReadinessOperatingLayerDef {
  readonly layer: ReadinessOperatingLayer;
  readonly description: string;
}

// -- Record Class Definition (P3-E13 Master Index) ----------------------------

/** Architecture record class per P3-E13 master index. */
export interface IReadinessRecordClassDef {
  readonly recordClass: ReadinessRecordClass;
  readonly records: readonly string[];
}

// -- Module Boundary Declaration (T01 §5) -------------------------------------

/** Boundary declaration against an adjacent module per T01 §5. */
export interface IModuleBoundaryDeclaration {
  readonly adjacentModule: AdjacentModuleCode;
  readonly adjacentModuleOwns: string;
  readonly readinessModuleOwns: string;
  readonly boundaryRule: string;
}

// -- Source-of-Truth Boundary Row (T01 §8) ------------------------------------

/** Source-of-truth boundary row per T01 §8. */
export interface ISourceOfTruthBoundary {
  readonly dataConcern: string;
  readonly authority: string;
  readonly authorityRule: ReadinessAuthorityRule;
}

// -- Operating Ownership Row (T01 §6) -----------------------------------------

/** Operating ownership row per T01 §6. */
export interface IOperatingOwnership {
  readonly concern: string;
  readonly primaryOwner: ReadinessOwnerRole;
  readonly notes: string;
}

// -- Case Activation Rule (T01 §7) --------------------------------------------

/** Case activation rule per T01 §7. */
export interface ICaseActivationRule {
  readonly trigger: CaseActivationTrigger;
  readonly description: string;
}

// -- Case Identity Constraint (T01 §7) ----------------------------------------

/** One-active-case identity constraint per T01 §7. */
export interface ICaseIdentityConstraint {
  readonly projectId: string;
  readonly subcontractorLegalEntityId: string;
  readonly awardBuyoutIntent: string;
}

// -- Cross-Contract Position (T01 §9) -----------------------------------------

/** Cross-contract positioning per T01 §9. */
export interface ICrossContractPosition {
  readonly relativeModule: string;
  readonly docRef: string;
  readonly thisModuleRole: CrossContractRole;
  readonly description: string;
}

// -- Locked Architecture Decision (P3-E13 Master Index) -----------------------

/** Locked architecture decision per P3-E13 master index. */
export interface ILockedArchitectureDecision {
  readonly decisionNumber: number;
  readonly decision: string;
}

// -- Module Identity Exclusion Definition (T01 §2) ----------------------------

/** What the module is NOT per T01 §2. */
export interface IModuleIdentityExclusionDef {
  readonly exclusionCode: ModuleIdentityExclusion;
  readonly description: string;
}

// -- Business Concern Definition (T01 §3) -------------------------------------

/** Business concern the module owns per T01 §3. */
export interface IBusinessConcernDef {
  readonly concern: ReadinessBusinessConcern;
  readonly whatModuleOwns: string;
}

// -- Cross-Contract Reference (P3-E13 Master Index) ---------------------------

/** Cross-reference to governing source per P3-E13 master index. */
export interface IReadinessCrossContractRef {
  readonly concern: string;
  readonly governingSource: string;
}
