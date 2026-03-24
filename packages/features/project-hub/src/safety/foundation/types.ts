/**
 * P3-E8-T01 Safety Module foundation TypeScript contracts.
 * Operating model, authority, visibility, cross-contract positioning.
 */

import type {
  CompositeScorecardDimension,
  IncidentPrivacyTier,
  PERVisibilityTier,
  SafetyAuthorityAction,
  SafetyAuthorityRole,
  SafetyLaneOwner,
  SafetyRecordFamily,
} from './enums.js';

// -- Authority Model (SS4) --------------------------------------------------

/** Role-based access rule for a specific record family. */
export interface ISafetyAuthorityRule {
  readonly role: SafetyAuthorityRole;
  readonly recordFamily: SafetyRecordFamily;
  readonly allowedActions: readonly SafetyAuthorityAction[];
}

/** Fields restricted to Safety Manager editing per SS4.3. */
export interface ISafetyManagerOnlyFieldDeclaration {
  readonly recordFamily: SafetyRecordFamily;
  readonly fieldNames: readonly string[];
}

// -- Visibility Doctrine (SS5) -----------------------------------------------

/** Within-module visibility constraint per SS5.1. */
export interface ISafetyVisibilityRule {
  readonly role: SafetyAuthorityRole;
  readonly canViewWorkspace: boolean;
  readonly canEditSafetyManagerContent: boolean;
}

/** Tiered PER visibility surface definition per SS5.3. */
export interface IPERSafetyProjection {
  readonly tier: PERVisibilityTier;
  readonly description: string;
  readonly includedSignals: readonly string[];
  readonly excludedFromAnnotation: true;
  readonly pushToTeamAllowed: false;
}

/** Individual scorecard dimension signal per SS5.2. */
export interface ICompositeScorecardSignal {
  readonly dimension: CompositeScorecardDimension;
  readonly description: string;
  readonly sourceTaskFile: string;
}

// -- Incident Privacy (SS5.4) ------------------------------------------------

/** Incident privacy tier visibility rules. */
export interface IIncidentPrivacyRule {
  readonly tier: IncidentPrivacyTier;
  readonly visibleToRoles: readonly SafetyAuthorityRole[];
  readonly perVisibility: string;
}

// -- Cross-Contract Positioning (SS6) ----------------------------------------

/** Cross-contract reference from Safety to other Phase 3 deliverables. */
export interface ISafetyCrossContractRef {
  readonly contract: string;
  readonly section: string;
  readonly relationship: string;
}

/** Required shared package for Safety Module operation. */
export interface ISafetySharedPackageRequirement {
  readonly packageName: string;
  readonly role: string;
  readonly blockerId: string;
}

// -- Governance (SS7, SS8) ---------------------------------------------------

/** Operating model principle declaration per SS7. */
export interface ISafetyOperatingPrinciple {
  readonly principleNumber: number;
  readonly name: string;
  readonly description: string;
}

/** Locked architectural decision per SS8. */
export interface ISafetyLockedDecision {
  readonly decisionId: number;
  readonly description: string;
  readonly reinforcedInSection: string;
}

// -- Lane Ownership (SS4.1-4.2) ---------------------------------------------

/** Record family lane ownership mapping. */
export interface ISafetyLaneMapping {
  readonly recordFamily: SafetyRecordFamily;
  readonly lane: SafetyLaneOwner;
  readonly governedBy: string;
}
