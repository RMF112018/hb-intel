/**
 * P3-E8-T02 Safety Module record family constants.
 * Enum arrays, terminal states, state transition maps, label maps.
 */

import type {
  AcknowledgmentMethod,
  CertificationStatus,
  CertificationType,
  CompetencyArea,
  CorrectiveActionCategory,
  CorrectiveActionSeverity,
  CorrectiveActionSourceType,
  CorrectiveActionStatus,
  DesignationStatus,
  EvidenceReviewStatus,
  EvidenceSensitivityTier,
  HazardRiskLevel,
  IncidentStatus,
  IncidentType,
  InspectionItemResponseType,
  InspectionStatus,
  JhaStatus,
  OrientationStatus,
  OrientationTopic,
  PpeType,
  PreTaskStatus,
  RetentionCategory,
  SafetyEvidenceSourceType,
  SafetySubmissionType,
  SdsStatus,
  SSSPAddendumChangeType,
  SSSPAddendumStatus,
  SSSPSectionKey,
  SSSPStatus,
  SubmissionReviewStatus,
  TemplateStatus,
  ToolboxPromptStatus,
  ToolboxTalkStatus,
} from './enums.js';

// -- Module Scope -----------------------------------------------------------

export const SAFETY_RECORDS_SCOPE = 'safety/records' as const;

// ============================================================================
// ENUM ARRAYS
// ============================================================================

export const SSSP_STATUSES = [
  'DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SUPERSEDED',
] as const satisfies ReadonlyArray<SSSPStatus>;

export const SSSP_ADDENDUM_STATUSES = [
  'DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'VOIDED',
] as const satisfies ReadonlyArray<SSSPAddendumStatus>;

export const SSSP_ADDENDUM_CHANGE_TYPES = [
  'SCOPE_CHANGE', 'HAZARD_ADDITION', 'PROCEDURE_UPDATE', 'EMERGENCY_UPDATE', 'OTHER',
] as const satisfies ReadonlyArray<SSSPAddendumChangeType>;

export const SSSP_SECTION_KEYS = [
  'HAZARD_IDENTIFICATION', 'EMERGENCY_RESPONSE', 'SAFETY_PROGRAM_STANDARDS',
  'REGULATORY_CITATIONS', 'COMPETENT_PERSON_REQUIREMENTS', 'SUBCONTRACTOR_COMPLIANCE',
  'INCIDENT_REPORTING', 'PROJECT_CONTACTS', 'SUBCONTRACTOR_LIST',
  'PROJECT_LOCATION', 'EMERGENCY_ASSEMBLY', 'ORIENTATION_SCHEDULE',
] as const satisfies ReadonlyArray<SSSPSectionKey>;

export const TEMPLATE_STATUSES = [
  'DRAFT', 'ACTIVE', 'RETIRED',
] as const satisfies ReadonlyArray<TemplateStatus>;

export const INSPECTION_ITEM_RESPONSE_TYPES = [
  'PASS_FAIL', 'YES_NO', 'N_A_ALLOWED', 'NUMERIC_RATING',
] as const satisfies ReadonlyArray<InspectionItemResponseType>;

export const INSPECTION_STATUSES = [
  'IN_PROGRESS', 'COMPLETED', 'VOIDED',
] as const satisfies ReadonlyArray<InspectionStatus>;

export const CORRECTIVE_ACTION_SOURCE_TYPES = [
  'INSPECTION', 'INCIDENT', 'JHA', 'OBSERVATION', 'EXTERNAL',
] as const satisfies ReadonlyArray<CorrectiveActionSourceType>;

export const CORRECTIVE_ACTION_SEVERITIES = [
  'CRITICAL', 'MAJOR', 'MINOR',
] as const satisfies ReadonlyArray<CorrectiveActionSeverity>;

export const CORRECTIVE_ACTION_CATEGORIES = [
  'HOUSEKEEPING', 'PPE', 'FALL_PROTECTION', 'ELECTRICAL', 'EXCAVATION',
  'SCAFFOLDING', 'CRANE_RIGGING', 'FIRE_PREVENTION', 'HAZMAT',
  'TRAFFIC_CONTROL', 'CONFINED_SPACE', 'DOCUMENTATION', 'OTHER',
] as const satisfies ReadonlyArray<CorrectiveActionCategory>;

export const CORRECTIVE_ACTION_STATUSES = [
  'OPEN', 'IN_PROGRESS', 'PENDING_VERIFICATION', 'CLOSED', 'VOIDED',
] as const satisfies ReadonlyArray<CorrectiveActionStatus>;

export const INCIDENT_TYPES = [
  'NEAR_MISS', 'FIRST_AID', 'RECORDABLE', 'LOST_TIME',
  'FATALITY', 'PROPERTY_DAMAGE', 'ENVIRONMENTAL',
] as const satisfies ReadonlyArray<IncidentType>;

export const INCIDENT_STATUSES = [
  'REPORTED', 'UNDER_INVESTIGATION', 'INVESTIGATION_COMPLETE', 'CLOSED', 'LITIGATED',
] as const satisfies ReadonlyArray<IncidentStatus>;

export const JHA_STATUSES = [
  'DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SUPERSEDED', 'VOIDED',
] as const satisfies ReadonlyArray<JhaStatus>;

export const HAZARD_RISK_LEVELS = [
  'HIGH', 'MEDIUM', 'LOW',
] as const satisfies ReadonlyArray<HazardRiskLevel>;

export const PPE_TYPES = [
  'HARD_HAT', 'SAFETY_GLASSES', 'GLOVES', 'SAFETY_VEST', 'STEEL_TOE_BOOTS',
  'FALL_HARNESS', 'RESPIRATOR', 'HEARING_PROTECTION', 'FACE_SHIELD', 'CUSTOM',
] as const satisfies ReadonlyArray<PpeType>;

export const PRE_TASK_STATUSES = [
  'OPEN', 'COMPLETE', 'VOIDED',
] as const satisfies ReadonlyArray<PreTaskStatus>;

export const TOOLBOX_PROMPT_STATUSES = [
  'ACTIVE', 'RETIRED',
] as const satisfies ReadonlyArray<ToolboxPromptStatus>;

export const TOOLBOX_TALK_STATUSES = [
  'DRAFT', 'COMPLETE', 'VOIDED',
] as const satisfies ReadonlyArray<ToolboxTalkStatus>;

export const ORIENTATION_STATUSES = [
  'COMPLETE', 'PENDING_ACKNOWLEDGMENT', 'VOIDED',
] as const satisfies ReadonlyArray<OrientationStatus>;

export const ACKNOWLEDGMENT_METHODS = [
  'DIGITAL_SIGNATURE', 'PHYSICAL_SIGNATURE', 'VERBAL_CONFIRMED',
] as const satisfies ReadonlyArray<AcknowledgmentMethod>;

export const ORIENTATION_TOPICS = [
  'SITE_HAZARDS', 'EMERGENCY_PROCEDURES', 'PPE_REQUIREMENTS', 'INCIDENT_REPORTING',
  'SSSP_OVERVIEW', 'SUBSTANCE_ABUSE_POLICY', 'FALL_PROTECTION', 'PROJECT_SPECIFIC_HAZARDS',
] as const satisfies ReadonlyArray<OrientationTopic>;

export const SAFETY_SUBMISSION_TYPES = [
  'COMPANY_SAFETY_PLAN', 'PROJECT_SPECIFIC_APP', 'HAZARD_COMMUNICATION', 'OTHER',
] as const satisfies ReadonlyArray<SafetySubmissionType>;

export const SUBMISSION_REVIEW_STATUSES = [
  'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'REVISION_REQUESTED',
] as const satisfies ReadonlyArray<SubmissionReviewStatus>;

export const CERTIFICATION_TYPES = [
  'OSHA_10', 'OSHA_30', 'FIRST_AID_CPR', 'RIGGING',
  'SCAFFOLD', 'CRANE_OPERATOR', 'COMPETENT_PERSON', 'CUSTOM',
] as const satisfies ReadonlyArray<CertificationType>;

export const CERTIFICATION_STATUSES = [
  'ACTIVE', 'EXPIRING_SOON', 'EXPIRED', 'REVOKED',
] as const satisfies ReadonlyArray<CertificationStatus>;

export const SDS_STATUSES = [
  'ACTIVE', 'SUPERSEDED', 'REMOVED_FROM_SITE',
] as const satisfies ReadonlyArray<SdsStatus>;

export const COMPETENCY_AREAS = [
  'EXCAVATION', 'SCAFFOLDING', 'FALL_PROTECTION',
  'CONFINED_SPACE', 'RIGGING', 'ELECTRICAL', 'CUSTOM',
] as const satisfies ReadonlyArray<CompetencyArea>;

export const DESIGNATION_STATUSES = [
  'ACTIVE', 'EXPIRED', 'REVOKED',
] as const satisfies ReadonlyArray<DesignationStatus>;

export const SAFETY_EVIDENCE_SOURCE_TYPES = [
  'INSPECTION', 'INCIDENT', 'JHA', 'CORRECTIVE_ACTION', 'TOOLBOX_TALK',
  'ORIENTATION', 'SUBMISSION', 'CERTIFICATION', 'GENERAL',
] as const satisfies ReadonlyArray<SafetyEvidenceSourceType>;

export const EVIDENCE_SENSITIVITY_TIERS = [
  'STANDARD', 'SENSITIVE', 'RESTRICTED',
] as const satisfies ReadonlyArray<EvidenceSensitivityTier>;

export const RETENTION_CATEGORIES = [
  'STANDARD_PROJECT', 'EXTENDED_REGULATORY', 'LITIGATION_HOLD',
] as const satisfies ReadonlyArray<RetentionCategory>;

export const EVIDENCE_REVIEW_STATUSES = [
  'PENDING_REVIEW', 'REVIEWED', 'ACCEPTED', 'REJECTED',
] as const satisfies ReadonlyArray<EvidenceReviewStatus>;

// ============================================================================
// TERMINAL STATE SUBSETS
// ============================================================================

export const TERMINAL_SSSP_STATUSES: readonly SSSPStatus[] = ['SUPERSEDED'];
export const TERMINAL_SSSP_ADDENDUM_STATUSES: readonly SSSPAddendumStatus[] = ['APPROVED', 'VOIDED'];
export const TERMINAL_TEMPLATE_STATUSES: readonly TemplateStatus[] = ['RETIRED'];
export const TERMINAL_INSPECTION_STATUSES: readonly InspectionStatus[] = ['COMPLETED', 'VOIDED'];
export const TERMINAL_CA_STATUSES: readonly CorrectiveActionStatus[] = ['CLOSED', 'VOIDED'];
export const TERMINAL_INCIDENT_STATUSES: readonly IncidentStatus[] = ['CLOSED', 'LITIGATED'];
export const TERMINAL_JHA_STATUSES: readonly JhaStatus[] = ['SUPERSEDED', 'VOIDED'];
export const TERMINAL_PRE_TASK_STATUSES: readonly PreTaskStatus[] = ['COMPLETE', 'VOIDED'];
export const TERMINAL_TOOLBOX_TALK_STATUSES: readonly ToolboxTalkStatus[] = ['COMPLETE', 'VOIDED'];
export const TERMINAL_ORIENTATION_STATUSES: readonly OrientationStatus[] = ['COMPLETE', 'VOIDED'];

// ============================================================================
// STATE TRANSITION MAPS
// ============================================================================

export const VALID_SSSP_TRANSITIONS: Readonly<Record<SSSPStatus, readonly SSSPStatus[]>> = {
  DRAFT: ['PENDING_APPROVAL'],
  PENDING_APPROVAL: ['APPROVED', 'DRAFT'],
  APPROVED: ['SUPERSEDED'],
  SUPERSEDED: [],
};

export const VALID_SSSP_ADDENDUM_TRANSITIONS: Readonly<Record<SSSPAddendumStatus, readonly SSSPAddendumStatus[]>> = {
  DRAFT: ['PENDING_APPROVAL', 'VOIDED'],
  PENDING_APPROVAL: ['APPROVED', 'DRAFT', 'VOIDED'],
  APPROVED: [],
  VOIDED: [],
};

export const VALID_TEMPLATE_TRANSITIONS: Readonly<Record<TemplateStatus, readonly TemplateStatus[]>> = {
  DRAFT: ['ACTIVE'],
  ACTIVE: ['RETIRED'],
  RETIRED: [],
};

export const VALID_INSPECTION_TRANSITIONS: Readonly<Record<InspectionStatus, readonly InspectionStatus[]>> = {
  IN_PROGRESS: ['COMPLETED', 'VOIDED'],
  COMPLETED: [],
  VOIDED: [],
};

export const VALID_CA_TRANSITIONS: Readonly<Record<CorrectiveActionStatus, readonly CorrectiveActionStatus[]>> = {
  OPEN: ['IN_PROGRESS', 'VOIDED'],
  IN_PROGRESS: ['PENDING_VERIFICATION', 'VOIDED'],
  PENDING_VERIFICATION: ['CLOSED', 'IN_PROGRESS'],
  CLOSED: [],
  VOIDED: [],
};

export const VALID_INCIDENT_TRANSITIONS: Readonly<Record<IncidentStatus, readonly IncidentStatus[]>> = {
  REPORTED: ['UNDER_INVESTIGATION', 'CLOSED'],
  UNDER_INVESTIGATION: ['INVESTIGATION_COMPLETE'],
  INVESTIGATION_COMPLETE: ['CLOSED', 'LITIGATED'],
  CLOSED: ['LITIGATED'],
  LITIGATED: [],
};

export const VALID_JHA_TRANSITIONS: Readonly<Record<JhaStatus, readonly JhaStatus[]>> = {
  DRAFT: ['PENDING_APPROVAL', 'VOIDED'],
  PENDING_APPROVAL: ['APPROVED', 'DRAFT', 'VOIDED'],
  APPROVED: ['SUPERSEDED'],
  SUPERSEDED: [],
  VOIDED: [],
};

export const VALID_PRE_TASK_TRANSITIONS: Readonly<Record<PreTaskStatus, readonly PreTaskStatus[]>> = {
  OPEN: ['COMPLETE', 'VOIDED'],
  COMPLETE: [],
  VOIDED: [],
};

export const VALID_TOOLBOX_TALK_TRANSITIONS: Readonly<Record<ToolboxTalkStatus, readonly ToolboxTalkStatus[]>> = {
  DRAFT: ['COMPLETE', 'VOIDED'],
  COMPLETE: [],
  VOIDED: [],
};

export const VALID_ORIENTATION_TRANSITIONS: Readonly<Record<OrientationStatus, readonly OrientationStatus[]>> = {
  PENDING_ACKNOWLEDGMENT: ['COMPLETE', 'VOIDED'],
  COMPLETE: [],
  VOIDED: [],
};

// ============================================================================
// LABEL MAPS
// ============================================================================

export const SSSP_STATUS_LABELS: Readonly<Record<SSSPStatus, string>> = {
  DRAFT: 'Draft',
  PENDING_APPROVAL: 'Pending Approval',
  APPROVED: 'Approved',
  SUPERSEDED: 'Superseded',
};

export const SSSP_ADDENDUM_STATUS_LABELS: Readonly<Record<SSSPAddendumStatus, string>> = {
  DRAFT: 'Draft',
  PENDING_APPROVAL: 'Pending Approval',
  APPROVED: 'Approved',
  VOIDED: 'Voided',
};

export const SSSP_ADDENDUM_CHANGE_TYPE_LABELS: Readonly<Record<SSSPAddendumChangeType, string>> = {
  SCOPE_CHANGE: 'Scope Change',
  HAZARD_ADDITION: 'Hazard Addition',
  PROCEDURE_UPDATE: 'Procedure Update',
  EMERGENCY_UPDATE: 'Emergency Update',
  OTHER: 'Other',
};

export const SSSP_SECTION_KEY_LABELS: Readonly<Record<SSSPSectionKey, string>> = {
  HAZARD_IDENTIFICATION: 'Hazard Identification and Control',
  EMERGENCY_RESPONSE: 'Emergency Response Procedures',
  SAFETY_PROGRAM_STANDARDS: 'Safety Program Standards',
  REGULATORY_CITATIONS: 'Regulatory and Code Citations',
  COMPETENT_PERSON_REQUIREMENTS: 'Competent Person Requirements',
  SUBCONTRACTOR_COMPLIANCE: 'Subcontractor Compliance Standards',
  INCIDENT_REPORTING: 'Incident Reporting Protocol',
  PROJECT_CONTACTS: 'Project Contacts',
  SUBCONTRACTOR_LIST: 'Subcontractor List',
  PROJECT_LOCATION: 'Project Location / Site Description',
  EMERGENCY_ASSEMBLY: 'Emergency Assembly and Site Layout',
  ORIENTATION_SCHEDULE: 'Orientation Schedule',
};

export const TEMPLATE_STATUS_LABELS: Readonly<Record<TemplateStatus, string>> = {
  DRAFT: 'Draft',
  ACTIVE: 'Active',
  RETIRED: 'Retired',
};

export const INSPECTION_STATUS_LABELS: Readonly<Record<InspectionStatus, string>> = {
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  VOIDED: 'Voided',
};

export const CA_SOURCE_TYPE_LABELS: Readonly<Record<CorrectiveActionSourceType, string>> = {
  INSPECTION: 'Inspection',
  INCIDENT: 'Incident',
  JHA: 'Job Hazard Analysis',
  OBSERVATION: 'Safety Observation',
  EXTERNAL: 'External',
};

export const CA_SEVERITY_LABELS: Readonly<Record<CorrectiveActionSeverity, string>> = {
  CRITICAL: 'Critical',
  MAJOR: 'Major',
  MINOR: 'Minor',
};

export const CA_CATEGORY_LABELS: Readonly<Record<CorrectiveActionCategory, string>> = {
  HOUSEKEEPING: 'Housekeeping',
  PPE: 'Personal Protective Equipment',
  FALL_PROTECTION: 'Fall Protection',
  ELECTRICAL: 'Electrical',
  EXCAVATION: 'Excavation',
  SCAFFOLDING: 'Scaffolding',
  CRANE_RIGGING: 'Crane / Rigging',
  FIRE_PREVENTION: 'Fire Prevention',
  HAZMAT: 'Hazardous Materials',
  TRAFFIC_CONTROL: 'Traffic Control',
  CONFINED_SPACE: 'Confined Space',
  DOCUMENTATION: 'Documentation',
  OTHER: 'Other',
};

export const CA_STATUS_LABELS: Readonly<Record<CorrectiveActionStatus, string>> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  PENDING_VERIFICATION: 'Pending Verification',
  CLOSED: 'Closed',
  VOIDED: 'Voided',
};

export const INCIDENT_TYPE_LABELS: Readonly<Record<IncidentType, string>> = {
  NEAR_MISS: 'Near Miss',
  FIRST_AID: 'First Aid',
  RECORDABLE: 'OSHA Recordable',
  LOST_TIME: 'Lost Time',
  FATALITY: 'Fatality',
  PROPERTY_DAMAGE: 'Property Damage',
  ENVIRONMENTAL: 'Environmental',
};

export const INCIDENT_STATUS_LABELS: Readonly<Record<IncidentStatus, string>> = {
  REPORTED: 'Reported',
  UNDER_INVESTIGATION: 'Under Investigation',
  INVESTIGATION_COMPLETE: 'Investigation Complete',
  CLOSED: 'Closed',
  LITIGATED: 'Litigated',
};

export const JHA_STATUS_LABELS: Readonly<Record<JhaStatus, string>> = {
  DRAFT: 'Draft',
  PENDING_APPROVAL: 'Pending Approval',
  APPROVED: 'Approved',
  SUPERSEDED: 'Superseded',
  VOIDED: 'Voided',
};

export const HAZARD_RISK_LEVEL_LABELS: Readonly<Record<HazardRiskLevel, string>> = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
};

export const PPE_TYPE_LABELS: Readonly<Record<PpeType, string>> = {
  HARD_HAT: 'Hard Hat',
  SAFETY_GLASSES: 'Safety Glasses',
  GLOVES: 'Gloves',
  SAFETY_VEST: 'Safety Vest',
  STEEL_TOE_BOOTS: 'Steel Toe Boots',
  FALL_HARNESS: 'Fall Harness',
  RESPIRATOR: 'Respirator',
  HEARING_PROTECTION: 'Hearing Protection',
  FACE_SHIELD: 'Face Shield',
  CUSTOM: 'Custom',
};

export const PRE_TASK_STATUS_LABELS: Readonly<Record<PreTaskStatus, string>> = {
  OPEN: 'Open',
  COMPLETE: 'Complete',
  VOIDED: 'Voided',
};

export const TOOLBOX_PROMPT_STATUS_LABELS: Readonly<Record<ToolboxPromptStatus, string>> = {
  ACTIVE: 'Active',
  RETIRED: 'Retired',
};

export const TOOLBOX_TALK_STATUS_LABELS: Readonly<Record<ToolboxTalkStatus, string>> = {
  DRAFT: 'Draft',
  COMPLETE: 'Complete',
  VOIDED: 'Voided',
};

export const ORIENTATION_STATUS_LABELS: Readonly<Record<OrientationStatus, string>> = {
  COMPLETE: 'Complete',
  PENDING_ACKNOWLEDGMENT: 'Pending Acknowledgment',
  VOIDED: 'Voided',
};

export const ACKNOWLEDGMENT_METHOD_LABELS: Readonly<Record<AcknowledgmentMethod, string>> = {
  DIGITAL_SIGNATURE: 'Digital Signature',
  PHYSICAL_SIGNATURE: 'Physical Signature',
  VERBAL_CONFIRMED: 'Verbal (Confirmed)',
};

export const ORIENTATION_TOPIC_LABELS: Readonly<Record<OrientationTopic, string>> = {
  SITE_HAZARDS: 'Site Hazards',
  EMERGENCY_PROCEDURES: 'Emergency Procedures',
  PPE_REQUIREMENTS: 'PPE Requirements',
  INCIDENT_REPORTING: 'Incident Reporting',
  SSSP_OVERVIEW: 'SSSP Overview',
  SUBSTANCE_ABUSE_POLICY: 'Substance Abuse Policy',
  FALL_PROTECTION: 'Fall Protection',
  PROJECT_SPECIFIC_HAZARDS: 'Project-Specific Hazards',
};

export const SAFETY_SUBMISSION_TYPE_LABELS: Readonly<Record<SafetySubmissionType, string>> = {
  COMPANY_SAFETY_PLAN: 'Company Safety Plan',
  PROJECT_SPECIFIC_APP: 'Project-Specific Application',
  HAZARD_COMMUNICATION: 'Hazard Communication',
  OTHER: 'Other',
};

export const SUBMISSION_REVIEW_STATUS_LABELS: Readonly<Record<SubmissionReviewStatus, string>> = {
  PENDING_REVIEW: 'Pending Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  REVISION_REQUESTED: 'Revision Requested',
};

export const CERTIFICATION_TYPE_LABELS: Readonly<Record<CertificationType, string>> = {
  OSHA_10: 'OSHA 10-Hour',
  OSHA_30: 'OSHA 30-Hour',
  FIRST_AID_CPR: 'First Aid / CPR',
  RIGGING: 'Rigging',
  SCAFFOLD: 'Scaffold',
  CRANE_OPERATOR: 'Crane Operator',
  COMPETENT_PERSON: 'Competent Person',
  CUSTOM: 'Custom',
};

export const CERTIFICATION_STATUS_LABELS: Readonly<Record<CertificationStatus, string>> = {
  ACTIVE: 'Active',
  EXPIRING_SOON: 'Expiring Soon',
  EXPIRED: 'Expired',
  REVOKED: 'Revoked',
};

export const SDS_STATUS_LABELS: Readonly<Record<SdsStatus, string>> = {
  ACTIVE: 'Active',
  SUPERSEDED: 'Superseded',
  REMOVED_FROM_SITE: 'Removed from Site',
};

export const COMPETENCY_AREA_LABELS: Readonly<Record<CompetencyArea, string>> = {
  EXCAVATION: 'Excavation',
  SCAFFOLDING: 'Scaffolding',
  FALL_PROTECTION: 'Fall Protection',
  CONFINED_SPACE: 'Confined Space',
  RIGGING: 'Rigging',
  ELECTRICAL: 'Electrical',
  CUSTOM: 'Custom',
};

export const DESIGNATION_STATUS_LABELS: Readonly<Record<DesignationStatus, string>> = {
  ACTIVE: 'Active',
  EXPIRED: 'Expired',
  REVOKED: 'Revoked',
};

export const SAFETY_EVIDENCE_SOURCE_TYPE_LABELS: Readonly<Record<SafetyEvidenceSourceType, string>> = {
  INSPECTION: 'Inspection',
  INCIDENT: 'Incident',
  JHA: 'Job Hazard Analysis',
  CORRECTIVE_ACTION: 'Corrective Action',
  TOOLBOX_TALK: 'Toolbox Talk',
  ORIENTATION: 'Orientation',
  SUBMISSION: 'Subcontractor Submission',
  CERTIFICATION: 'Certification',
  GENERAL: 'General',
};

export const EVIDENCE_SENSITIVITY_TIER_LABELS: Readonly<Record<EvidenceSensitivityTier, string>> = {
  STANDARD: 'Standard',
  SENSITIVE: 'Sensitive',
  RESTRICTED: 'Restricted',
};

export const RETENTION_CATEGORY_LABELS: Readonly<Record<RetentionCategory, string>> = {
  STANDARD_PROJECT: 'Standard Project Retention',
  EXTENDED_REGULATORY: 'Extended Regulatory Retention',
  LITIGATION_HOLD: 'Litigation Hold',
};

export const EVIDENCE_REVIEW_STATUS_LABELS: Readonly<Record<EvidenceReviewStatus, string>> = {
  PENDING_REVIEW: 'Pending Review',
  REVIEWED: 'Reviewed',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
};

export const INSPECTION_ITEM_RESPONSE_TYPE_LABELS: Readonly<Record<InspectionItemResponseType, string>> = {
  PASS_FAIL: 'Pass / Fail',
  YES_NO: 'Yes / No',
  N_A_ALLOWED: 'N/A Allowed',
  NUMERIC_RATING: 'Numeric Rating',
};
