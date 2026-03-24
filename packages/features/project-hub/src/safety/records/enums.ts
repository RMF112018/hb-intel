/**
 * P3-E8-T02 Safety Module record family enumerations.
 * Workspace architecture lifecycle states and governed taxonomies.
 */

// -- SSSP Lifecycle (§2.1) --------------------------------------------------

export type SSSPStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'SUPERSEDED';

export type SSSPAddendumStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'VOIDED';

export type SSSPAddendumChangeType =
  | 'SCOPE_CHANGE'
  | 'HAZARD_ADDITION'
  | 'PROCEDURE_UPDATE'
  | 'EMERGENCY_UPDATE'
  | 'OTHER';

export type SSSPSectionKey =
  | 'HAZARD_IDENTIFICATION'
  | 'EMERGENCY_RESPONSE'
  | 'SAFETY_PROGRAM_STANDARDS'
  | 'REGULATORY_CITATIONS'
  | 'COMPETENT_PERSON_REQUIREMENTS'
  | 'SUBCONTRACTOR_COMPLIANCE'
  | 'INCIDENT_REPORTING'
  | 'PROJECT_CONTACTS'
  | 'SUBCONTRACTOR_LIST'
  | 'PROJECT_LOCATION'
  | 'EMERGENCY_ASSEMBLY'
  | 'ORIENTATION_SCHEDULE';

// -- Inspection (§2.3–2.5) -------------------------------------------------

export type TemplateStatus = 'DRAFT' | 'ACTIVE' | 'RETIRED';

export type InspectionItemResponseType =
  | 'PASS_FAIL'
  | 'YES_NO'
  | 'N_A_ALLOWED'
  | 'NUMERIC_RATING';

export type InspectionStatus = 'IN_PROGRESS' | 'COMPLETED' | 'VOIDED';

// -- Corrective Action (§2.6) -----------------------------------------------

export type CorrectiveActionSourceType =
  | 'INSPECTION'
  | 'INCIDENT'
  | 'JHA'
  | 'OBSERVATION'
  | 'EXTERNAL';

export type CorrectiveActionSeverity = 'CRITICAL' | 'MAJOR' | 'MINOR';

export type CorrectiveActionCategory =
  | 'HOUSEKEEPING'
  | 'PPE'
  | 'FALL_PROTECTION'
  | 'ELECTRICAL'
  | 'EXCAVATION'
  | 'SCAFFOLDING'
  | 'CRANE_RIGGING'
  | 'FIRE_PREVENTION'
  | 'HAZMAT'
  | 'TRAFFIC_CONTROL'
  | 'CONFINED_SPACE'
  | 'DOCUMENTATION'
  | 'OTHER';

export type CorrectiveActionStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'PENDING_VERIFICATION'
  | 'CLOSED'
  | 'VOIDED';

// -- Incident (§2.7) --------------------------------------------------------

export type IncidentType =
  | 'NEAR_MISS'
  | 'FIRST_AID'
  | 'RECORDABLE'
  | 'LOST_TIME'
  | 'FATALITY'
  | 'PROPERTY_DAMAGE'
  | 'ENVIRONMENTAL';

export type IncidentStatus =
  | 'REPORTED'
  | 'UNDER_INVESTIGATION'
  | 'INVESTIGATION_COMPLETE'
  | 'CLOSED'
  | 'LITIGATED';

// -- JHA (§2.8) --------------------------------------------------------------

export type JhaStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'SUPERSEDED'
  | 'VOIDED';

export type HazardRiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export type PpeType =
  | 'HARD_HAT'
  | 'SAFETY_GLASSES'
  | 'GLOVES'
  | 'SAFETY_VEST'
  | 'STEEL_TOE_BOOTS'
  | 'FALL_HARNESS'
  | 'RESPIRATOR'
  | 'HEARING_PROTECTION'
  | 'FACE_SHIELD'
  | 'CUSTOM';

// -- Daily Pre-Task (§2.9) --------------------------------------------------

export type PreTaskStatus = 'OPEN' | 'COMPLETE' | 'VOIDED';

// -- Toolbox Talk (§2.10–2.11) -----------------------------------------------

export type ToolboxPromptStatus = 'ACTIVE' | 'RETIRED';

export type ToolboxTalkStatus = 'DRAFT' | 'COMPLETE' | 'VOIDED';

// -- Orientation (§2.12) ----------------------------------------------------

export type OrientationStatus = 'COMPLETE' | 'PENDING_ACKNOWLEDGMENT' | 'VOIDED';

export type AcknowledgmentMethod =
  | 'DIGITAL_SIGNATURE'
  | 'PHYSICAL_SIGNATURE'
  | 'VERBAL_CONFIRMED';

export type OrientationTopic =
  | 'SITE_HAZARDS'
  | 'EMERGENCY_PROCEDURES'
  | 'PPE_REQUIREMENTS'
  | 'INCIDENT_REPORTING'
  | 'SSSP_OVERVIEW'
  | 'SUBSTANCE_ABUSE_POLICY'
  | 'FALL_PROTECTION'
  | 'PROJECT_SPECIFIC_HAZARDS';

// -- Subcontractor Submission (§2.13) ----------------------------------------

export type SafetySubmissionType =
  | 'COMPANY_SAFETY_PLAN'
  | 'PROJECT_SPECIFIC_APP'
  | 'HAZARD_COMMUNICATION'
  | 'OTHER';

export type SubmissionReviewStatus =
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'REVISION_REQUESTED';

// -- Certification (§2.14) --------------------------------------------------

export type CertificationType =
  | 'OSHA_10'
  | 'OSHA_30'
  | 'FIRST_AID_CPR'
  | 'RIGGING'
  | 'SCAFFOLD'
  | 'CRANE_OPERATOR'
  | 'COMPETENT_PERSON'
  | 'CUSTOM';

export type CertificationStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'REVOKED';

// -- HazCom / SDS (§2.15) ---------------------------------------------------

export type SdsStatus = 'ACTIVE' | 'SUPERSEDED' | 'REMOVED_FROM_SITE';

// -- Competent Person (§2.16) ------------------------------------------------

export type CompetencyArea =
  | 'EXCAVATION'
  | 'SCAFFOLDING'
  | 'FALL_PROTECTION'
  | 'CONFINED_SPACE'
  | 'RIGGING'
  | 'ELECTRICAL'
  | 'CUSTOM';

export type DesignationStatus = 'ACTIVE' | 'EXPIRED' | 'REVOKED';

// -- Evidence (§2.17) -------------------------------------------------------

export type SafetyEvidenceSourceType =
  | 'INSPECTION'
  | 'INCIDENT'
  | 'JHA'
  | 'CORRECTIVE_ACTION'
  | 'TOOLBOX_TALK'
  | 'ORIENTATION'
  | 'SUBMISSION'
  | 'CERTIFICATION'
  | 'GENERAL';

export type EvidenceSensitivityTier = 'STANDARD' | 'SENSITIVE' | 'RESTRICTED';

export type RetentionCategory =
  | 'STANDARD_PROJECT'
  | 'EXTENDED_REGULATORY'
  | 'LITIGATION_HOLD';

export type EvidenceReviewStatus =
  | 'PENDING_REVIEW'
  | 'REVIEWED'
  | 'ACCEPTED'
  | 'REJECTED';
