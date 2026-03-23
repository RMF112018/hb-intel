/**
 * P3-E6-T06 Publication, Review, and Governance enumerations.
 */

// ── Review Package Status (§6.3) ────────────────────────────────────

export type ReviewPackageStatus =
  | 'Active'
  | 'Superseded'
  | 'Archived';

// ── Publication Roles (§6.4) ────────────────────────────────────────

export type ConstraintsPublicationRole =
  | 'PM'
  | 'ProjectControls'
  | 'DesignatedApprover'
  | 'PER'
  | 'ManagerOfOpEx'
  | 'Admin';

// ── Publication Actions (§6.4) ──────────────────────────────────────

export type ConstraintsPublicationAction =
  | 'CreateEditLive'
  | 'PublishSnapshot'
  | 'PublishReviewPackage'
  | 'ApproveGovernedAction'
  | 'AnnotatePublished'
  | 'ConfigureGovernance'
  | 'AccessLive'
  | 'AccessPublished';

// ── State Consumption Mode (§6.1) ───────────────────────────────────

export type StateConsumptionMode =
  | 'Live'
  | 'Published'
  | 'Configurable';

// ── Governed Taxonomy Area (§6.6) ───────────────────────────────────

export type GovernedTaxonomyArea =
  | 'RiskCategory'
  | 'RiskProbabilityImpact'
  | 'BicTeamRegistry'
  | 'ConstraintCategory'
  | 'ConstraintPriority'
  | 'DelayEventType'
  | 'DelayResponsibleParty'
  | 'DelayCriticalPathImpact'
  | 'DelayAnalysisMethod'
  | 'DelayEvidenceType'
  | 'ChangeEventOrigin'
  | 'ChangeLineItemType'
  | 'ProcoreStatusMapping';
