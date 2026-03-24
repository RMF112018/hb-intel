/**
 * P3-E10-T01 Project Closeout Module foundation TypeScript contracts.
 * Operating model, scope, surface map, SoT boundaries, cross-contract positioning.
 */

import type {
  CloseoutCrossModuleSource,
  CloseoutLifecyclePhase,
  CloseoutOperationalSurface,
  CloseoutSurfaceClass,
} from './enums.js';

// -- Surface Definitions (§2.2) -----------------------------------------------

/** Operational surface definition per T01 §2.2. */
export interface ICloseoutSurfaceDefinition {
  readonly surface: CloseoutOperationalSurface;
  readonly class: CloseoutSurfaceClass;
  readonly description: string;
  readonly primaryOperator: string;
  readonly peInvolvement: string;
}

// -- Record Families (§3.1) ---------------------------------------------------

/** Record family definition per T01 §3.1. */
export interface ICloseoutRecordFamilyDefinition {
  readonly family: string;
  readonly key: string;
  readonly notes: string;
}

// -- SoT Boundary Matrix (§5) ------------------------------------------------

/** SoT boundary row per T01 §5. */
export interface ICloseoutSoTBoundary {
  readonly dataConcern: string;
  readonly sotOwner: string;
  readonly whoWrites: string;
  readonly whoReads: string;
}

// -- Cross-Contract Positioning (§6) ------------------------------------------

/** Cross-contract reference per T01 §6. */
export interface ICloseoutCrossContractRef {
  readonly contract: string;
  readonly relationship: string;
}

// -- Activation Model (§4) ---------------------------------------------------

/** Lifecycle activation phase per T01 §4. */
export interface ICloseoutActivationPhase {
  readonly phase: CloseoutLifecyclePhase;
  readonly activity: string;
}

// -- Locked Architecture Decisions (Master Index) -----------------------------

/** Locked architecture decision per master index. */
export interface ICloseoutLockedDecision {
  readonly decisionId: number;
  readonly description: string;
}

// -- Cross-Module Reads (§3.2) ------------------------------------------------

/** Read-only cross-module data source per T01 §3.2. */
export interface ICloseoutCrossModuleRead {
  readonly source: CloseoutCrossModuleSource;
  readonly consumedData: string;
  readonly purpose: string;
  readonly mutationPermitted: false;
}

// -- Exclusions (§3.3) -------------------------------------------------------

/** Out-of-scope item per T01 §3.3. */
export interface ICloseoutExclusion {
  readonly item: string;
  readonly correctOwner: string;
}

// -- Shared Package Requirements (T10) ----------------------------------------

/** Required shared package for Closeout Module operation. */
export interface ICloseoutSharedPackageRequirement {
  readonly packageName: string;
  readonly role: string;
  readonly blockerId: string;
}

// -- Operating Principles -----------------------------------------------------

/** Operating principle for the Closeout Module. */
export interface ICloseoutOperatingPrinciple {
  readonly id: number;
  readonly description: string;
}
