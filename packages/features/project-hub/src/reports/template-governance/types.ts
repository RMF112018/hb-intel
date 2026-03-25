/**
 * P3-E9-T05 reports template-governance TypeScript contracts.
 * Corporate template records, locked enforcement, config boundaries, promotion requests, policy hierarchy, version records.
 */

import type { TemplatePromotionStatus } from '../contracts/enums.js';
import type {
  GovernancePolicyLayer,
  LockedTemplateConstraint,
  ProjectConfigPermission,
  TemplateVersionTransition,
} from './enums.js';

// -- Corporate Template Record ------------------------------------------------

export interface ICorporateTemplateRecord {
  readonly templateId: string;
  readonly familyKey: string;
  readonly familyType: string;
  readonly version: number;
  readonly effectiveFrom: string;
  readonly deprecatedAt: string | null;
  readonly isLocked: boolean;
  readonly governedBy: string;
  readonly sectionSchema: readonly string[];
  readonly approvalClassConfig: string;
}

// -- Locked Template Enforcement Result ---------------------------------------

export interface ILockedTemplateEnforcementResult {
  readonly familyKey: string;
  readonly isLocked: boolean;
  readonly attemptedAction: string;
  readonly isBlocked: boolean;
}

// -- Project Config Boundary --------------------------------------------------

export interface IProjectConfigBoundary {
  readonly familyKey: string;
  readonly permission: ProjectConfigPermission;
  readonly isAllowed: boolean;
  readonly requiresPeApproval: boolean;
  readonly constraint: string;
}

// -- Post-Activation Change Request -------------------------------------------

export interface IPostActivationChangeRequest {
  readonly changeRequestId: string;
  readonly configVersionId: string;
  readonly familyKey: string;
  readonly isStructural: boolean;
  readonly changeDescription: string;
  readonly requiresPeReApproval: boolean;
  readonly newDraftVersionCreated: boolean;
}

// -- Template Promotion Request -----------------------------------------------

export interface ITemplatePromotionRequest {
  readonly promotionRequestId: string;
  readonly projectFamilyKey: string;
  readonly projectId: string;
  readonly submittedByUPN: string;
  readonly submittedAt: string;
  readonly promotionStatus: TemplatePromotionStatus;
  readonly moeReviewerUPN: string | null;
  readonly decidedAt: string | null;
}

// -- Governance Policy Hierarchy ----------------------------------------------

export interface IGovernancePolicyHierarchy {
  readonly projectId: string;
  readonly layer: GovernancePolicyLayer;
  readonly globalFloorRules: readonly string[];
  readonly projectOverlayRules: readonly string[];
  readonly effectiveMergedRules: readonly string[];
}

// -- Template Version Record --------------------------------------------------

export interface ITemplateVersionRecord {
  readonly versionRecordId: string;
  readonly familyKey: string;
  readonly version: number;
  readonly effectiveFrom: string;
  readonly transition: TemplateVersionTransition;
  readonly previousVersion: number | null;
}
