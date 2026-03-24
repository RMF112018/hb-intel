/**
 * P3-E13-T08 Stage 3 Subcontract Execution Readiness Module requirement-profiles TypeScript contracts.
 * Governed profiles, dual-state items, artifact/evaluation models, SDI prequalification.
 */

import type {
  ArtifactState,
  BlockingSeverity,
  ComplianceEvaluationState,
  MetadataFieldType,
  ProfileInputDimension,
  RenewalStatus,
  SDIPrequalificationOutcome,
} from './enums.js';

// -- RequirementProfile (T03 §1) ----------------------------------------------

/** Governed requirement profile library record per T03 §1. */
export interface IRequirementProfile {
  readonly requirementProfileId: string;
  readonly profileVersion: number;
  readonly profileName: string;
  readonly profileDescription: string;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly publishedAt: string | null;
  readonly publishedBy: string | null;
}

// -- ProfileRequirementItem (T03 §1–§2) ---------------------------------------

/** Item definition within a governed profile per T03 §1–§2. */
export interface IProfileRequirementItem {
  readonly profileRequirementItemId: string;
  readonly requirementProfileId: string;
  readonly profileRequirementKey: string;
  readonly requirementFamily: string;
  readonly blockingSeverity: BlockingSeverity;
  readonly responsibleEvaluatorRole: string;
  readonly requiredMetadata: readonly IMetadataFieldSpec[];
  readonly expectedArtifactTypes: readonly string[];
  readonly minimumArtifactCount: number;
  readonly renewable: boolean;
  readonly renewalCycleDays: number | null;
  readonly applicabilityCondition: string | null;
}

// -- MetadataFieldSpec (T03 §3.2) ---------------------------------------------

/** Typed metadata field contract per T03 §3.2. */
export interface IMetadataFieldSpec {
  readonly fieldName: string;
  readonly fieldType: MetadataFieldType;
  readonly required: boolean;
  readonly description: string;
  readonly possibleValues: readonly string[] | null;
}

// -- ReadinessRequirementItem T03-enhanced (T03 §3) ----------------------------

/** T03-enhanced requirement item with dual-state scaffold per T03 §3. */
export interface IReadinessRequirementItemT03 {
  // Identity
  readonly requirementItemId: string;
  readonly readinessCaseId: string;
  readonly profileRequirementKey: string;
  readonly requirementFamilyCode: string;
  readonly profileProvenance: string;
  readonly profileVersion: number;
  // Dual-state (T03 §3.1 — artifact + evaluation are independent)
  readonly artifactState: ArtifactState;
  readonly complianceEvaluationState: ComplianceEvaluationState;
  // Governance
  readonly blockingSeverity: BlockingSeverity;
  readonly responsibleEvaluatorRole: string;
  // Renewal
  readonly renewalStatus: RenewalStatus;
  readonly expiresAt: string | null;
  // Typed metadata (governed by profile)
  readonly metadata: Record<string, unknown>;
  // Audit
  readonly createdAt: string;
  readonly createdBy: string;
  readonly lastModifiedAt: string;
  readonly lastModifiedBy: string | null;
}

// -- RequirementArtifact T03-enhanced (T03 §4) --------------------------------

/** T03-enhanced artifact model with receipt posture per T03 §4. */
export interface IRequirementArtifactT03 {
  readonly artifactId: string;
  readonly requirementItemId: string;
  readonly readinessCaseId: string;
  readonly artifactName: string;
  readonly artifactType: string;
  readonly artifactState: ArtifactState;
  readonly uploadedAt: string;
  readonly uploadedBy: string;
  readonly receivedAt: string | null;
  readonly receiptProvenance: string | null;
  readonly externalReferenceUrl: string | null;
  readonly replacedByArtifactId: string | null;
  readonly sourceSystemProvenance: string | null;
  readonly deficiencyNote: string | null;
}

// -- RequirementEvaluation T03-enhanced (T03 §5) ------------------------------

/** T03-enhanced specialist evaluation with ruling detail per T03 §5. */
export interface IRequirementEvaluationT03 {
  readonly evaluationId: string;
  readonly requirementItemId: string;
  readonly readinessCaseId: string;
  readonly complianceEvaluationState: ComplianceEvaluationState;
  readonly evaluatedAt: string;
  readonly evaluatedBy: string;
  readonly evaluatedByRole: string;
  readonly evaluationRationale: string;
  readonly conditionText: string | null;
  readonly deficiencyNote: string | null;
  readonly exceptionsLinked: readonly string[];
  readonly isPMRequestedApplicabilityReview: boolean;
}

// -- SDI Prequalification Record (T03 §7) -------------------------------------

/** SDI/prequalification governed family record per T03 §7. */
export interface ISDIPrequalificationRecord {
  readonly itemId: string;
  readonly readinessCaseId: string;
  readonly outcome: SDIPrequalificationOutcome;
  readonly qualificationReferenceId: string | null;
  readonly riskRating: string | null;
  readonly alternateRiskTreatmentApprovedAt: string | null;
  readonly alternateRiskTreatmentApprovedBy: string | null;
  readonly evaluatedAt: string;
  readonly evaluatedBy: string;
}

// -- Profile Input Dimension Definition (T03 §1.2) ----------------------------

/** Profile binding input dimension definition per T03 §1.2. */
export interface IProfileInputDimensionDef {
  readonly dimension: ProfileInputDimension;
  readonly description: string;
}

// -- Dual-State Independence Example (T03 §5.2) -------------------------------

/** Governed example of artifact/evaluation independence per T03 §5.2. */
export interface IDualStateExample {
  readonly artifactState: ArtifactState;
  readonly evaluationState: ComplianceEvaluationState;
  readonly explanation: string;
}
