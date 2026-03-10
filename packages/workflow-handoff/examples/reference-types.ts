// ─────────────────────────────────────────────────────────────────────────────
// Reference domain types for SF08-T07 canonical handoff config examples.
//
// These types carry a `Ref` suffix to distinguish them from the production
// types that will live in their respective consuming packages (Phase 4/5).
// They exist solely so that `bdToEstimatingHandoffConfig` and
// `estimatingToProjectHubConfig` can be fully type-checked today.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Reference stub for the BD Go/No-Go Scorecard.
 * Production type will live in `packages/business-development/`.
 */
export interface IGoNoGoScorecardRef {
  id: string;
  projectName: string;
  ownerName: string;
  projectLocation: string;
  estimatedProjectValue: number;
  bidDueDate: string;
  projectType: string;
  strategicIntelligenceSummary: string;
  keyOwnerContactName: string;
  keyOwnerContactEmail: string;
  estimatingCoordinatorId: string | null;
  estimatingCoordinatorName: string | null;
  workflowStage: string;
  incompleteDepartmentalSections: string[];
}

/**
 * Reference stub for the Estimating Pursuit record.
 * Production type will live in `packages/estimating/`.
 * This type is both the destination of BD→Estimating and the source of
 * Estimating→ProjectHub.
 */
export interface IEstimatingPursuitRef {
  id: string;
  projectName: string;
  clientName: string;
  location: string;
  estimatedGMP: number;
  bidDueDate: string;
  projectType: string;
  bdScorecardId: string;
  bdHeritageNotes: string;
  keyOwnerContactName: string;
  keyOwnerContactEmail: string;
  finalBidAmount: number;
  leadEstimatorId: string;
  contractTermsSummary: string;
  workflowStage: string;
  assignedProjectManagerId: string | null;
  assignedProjectManagerName: string | null;
}

/**
 * Reference stub for the Project Hub project record.
 * Production type will live in `packages/project-hub/`.
 */
export interface IProjectRecordRef {
  id: string;
  projectName: string;
  clientName: string;
  location: string;
  awardedGMP: number;
  projectType: string;
  estimatingPursuitId: string;
  bdScorecardId: string;
  estimatingLeadId: string;
  keyContractTerms: string;
}
