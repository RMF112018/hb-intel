/**
 * P3-E15-T10 Stage 2 Project QC Module governance TypeScript contracts.
 */

import type {
  GovernedStandardState,
  ProjectExtensionState,
  PromotionDecisionOutcome,
  QcKeyActor,
  UpdateNoticeAdoptionState,
} from '../foundation/enums.js';
import type {
  BasisConflictOutcome,
  CandidateContentType,
  CandidateSubmissionState,
  GovernedContentVersionField,
  GovernedStandardCategory,
  ProjectDecisionLatitude,
  QcGovernanceWriteAction,
  UpdateNoticeRequirement,
} from './enums.js';

// -- IGovernedQualityStandard (T02 §1-§2) ------------------------------------

/** Governed quality standard record per T02 §1-§2. */
export interface IGovernedQualityStandard {
  readonly governedQualityStandardId: string;
  readonly standardKey: string;
  readonly governedVersionId: string;
  readonly title: string;
  readonly discipline: string;
  readonly category: GovernedStandardCategory;
  readonly governedTaxonomyPath: string;
  readonly requirementText: string;
  readonly applicabilityScope: string;
  readonly minimumEvidenceRuleRefs: readonly string[];
  readonly sourceProvenance: string;
  readonly publishedByUserId: string;
  readonly publishedAt: string;
  readonly state: GovernedStandardState;
  readonly supersededByVersionId: string | null;
  readonly retiredAt: string | null;
}

// -- IProjectQualityExtension (T02 §2) ---------------------------------------

/** Project quality extension record per T02 §2. */
export interface IProjectQualityExtension {
  readonly projectQualityExtensionId: string;
  readonly projectId: string;
  readonly parentGovernedKey: string;
  readonly extensionVersionId: string;
  readonly projectRationale: string;
  readonly taxonomyParent: string;
  readonly constrainedScope: string;
  readonly approvalMetadata: string;
  readonly provenance: string;
  readonly promotionStatus: ProjectExtensionState;
  readonly promotedToGovernedVersionId: string | null;
  readonly createdAt: string;
  readonly createdByUserId: string;
  readonly retiredAt: string | null;
}

// -- IGovernanceCandidateSubmission (T02 §1.2, §3) ----------------------------

/** Governance candidate submission record per T02 §1.2, §3. */
export interface IGovernanceCandidateSubmission {
  readonly candidateId: string;
  readonly projectId: string | null;
  readonly submittedByUserId: string;
  readonly contentType: CandidateContentType;
  readonly title: string;
  readonly description: string;
  readonly taxonomyParentRef: string;
  readonly governedRuleRef: string | null;
  readonly attachedArtifactRefs: readonly string[];
  readonly submittedAt: string;
  readonly state: CandidateSubmissionState;
}

// -- IPromotionDecisionRecord (T02 §3) ----------------------------------------

/** Promotion decision record per T02 §3. */
export interface IPromotionDecisionRecord {
  readonly promotionDecisionId: string;
  readonly candidateId: string;
  readonly extensionId: string | null;
  readonly outcome: PromotionDecisionOutcome;
  readonly governanceOwnerUserId: string;
  readonly disciplineReviewerUserId: string;
  readonly rationale: string;
  readonly governedVersionIdIfPromoted: string | null;
  readonly decidedAt: string;
}

// -- IGovernedVersionReference (T02 §5.3) -------------------------------------

/** Governed version reference per T02 §5.3. */
export interface IGovernedVersionReference {
  readonly field: GovernedContentVersionField;
  readonly activeGovernedVersionId: string;
  readonly effectiveDate: string;
  readonly adoptedAt: string | null;
}

// -- IUpdateNoticeAdoption (T02 §6) ------------------------------------------

/** Update notice adoption record per T02 §6. */
export interface IUpdateNoticeAdoption {
  readonly adoptionId: string;
  readonly governedUpdateNoticeId: string;
  readonly projectId: string;
  readonly state: UpdateNoticeAdoptionState;
  readonly requirement: UpdateNoticeRequirement;
  readonly decidedByUserId: string | null;
  readonly decidedAt: string | null;
  readonly rationale: string | null;
  readonly recheckActions: readonly string[];
  readonly supersededByAdoptionId: string | null;
}

// -- IBasisConflictRecord (T02 §7) --------------------------------------------

/** Basis conflict record per T02 §7. */
export interface IBasisConflictRecord {
  readonly conflictId: string;
  readonly projectId: string;
  readonly submittalItemRecordId: string | null;
  readonly officialSourceChangeRef: string;
  readonly previousBasisVersionId: string;
  readonly newerOfficialVersionId: string;
  readonly outcome: BasisConflictOutcome | null;
  readonly outcomeDecidedByUserId: string | null;
  readonly outcomeDecidedAt: string | null;
  readonly recheckDueDate: string | null;
  readonly exceptionExpiryDate: string | null;
}

// -- IQcGovernanceAuthorityEntry (T02 §4) -------------------------------------

/** QC governance authority matrix entry per T02 §4. */
export interface IQcGovernanceAuthorityEntry {
  readonly action: QcGovernanceWriteAction;
  readonly allowedRoles: readonly QcKeyActor[];
  readonly conditionalNotes: string;
}

// -- IGovernanceConcernLatitude (T02 §8) --------------------------------------

/** Governance concern latitude entry per T02 §8. */
export interface IGovernanceConcernLatitude {
  readonly concern: string;
  readonly publisher: string;
  readonly projectLatitude: ProjectDecisionLatitude;
  readonly constraint: string;
}
