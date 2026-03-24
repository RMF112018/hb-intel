/**
 * P3-E8-T01 Safety Module foundation constants.
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
import type {
  ICompositeScorecardSignal,
  IIncidentPrivacyRule,
  IPERSafetyProjection,
  ISafetyCrossContractRef,
  ISafetyLaneMapping,
  ISafetyLockedDecision,
  ISafetyManagerOnlyFieldDeclaration,
  ISafetyAuthorityRule,
  ISafetyOperatingPrinciple,
  ISafetySharedPackageRequirement,
  ISafetyVisibilityRule,
} from './types.js';

// -- Module Scope -----------------------------------------------------------

export const SAFETY_MODULE_SCOPE = 'safety' as const;
export const SAFETY_FOUNDATION_SCOPE = 'safety/foundation' as const;

// -- Enum Arrays ------------------------------------------------------------

export const SAFETY_RECORD_FAMILIES = [
  'SSSPBasePlan', 'SSSPAddendum', 'InspectionChecklistTemplate',
  'CompletedWeeklyInspection', 'SafetyCorrectiveAction', 'IncidentCase',
  'JobHazardAnalysis', 'DailyPreTaskPlan', 'ToolboxTalkPrompt',
  'WeeklyToolboxTalkRecord', 'WorkerOrientationRecord',
  'SubcontractorSafetySubmission', 'CertificationQualificationRecord',
  'HazComSdsRecord', 'CompetentPersonDesignation',
] as const satisfies ReadonlyArray<SafetyRecordFamily>;

export const SAFETY_AUTHORITY_ROLES = [
  'SafetyManager', 'SafetyOfficer', 'ProjectManager',
  'Superintendent', 'FieldEngineer', 'System',
] as const satisfies ReadonlyArray<SafetyAuthorityRole>;

export const SAFETY_AUTHORITY_ACTIONS = [
  'Create', 'Read', 'Update', 'Approve', 'Configure', 'Assign',
] as const satisfies ReadonlyArray<SafetyAuthorityAction>;

export const SAFETY_LANE_OWNERS = [
  'SafetyManagerLane', 'ProjectTeamLane',
] as const satisfies ReadonlyArray<SafetyLaneOwner>;

export const INCIDENT_PRIVACY_TIERS = [
  'STANDARD', 'SENSITIVE', 'RESTRICTED',
] as const satisfies ReadonlyArray<IncidentPrivacyTier>;

export const PER_VISIBILITY_TIERS = [
  'LeadershipOperationalSummary', 'PERSanitizedIndicators', 'IncidentSummary',
] as const satisfies ReadonlyArray<PERVisibilityTier>;

export const COMPOSITE_SCORECARD_DIMENSIONS = [
  'InspectionTrend', 'CorrectiveActionHealth', 'ReadinessPosture',
  'BlockerState', 'ComplianceCompletion',
] as const satisfies ReadonlyArray<CompositeScorecardDimension>;

// -- Lane Ownership Mapping (SS4.1-4.2) -------------------------------------

/** SS4.1: Record families owned by Safety Manager / Safety Officer. */
export const SAFETY_MANAGER_LANE_FAMILIES: readonly SafetyRecordFamily[] = [
  'SSSPBasePlan',
  'InspectionChecklistTemplate',
  'CompletedWeeklyInspection',
  'SafetyCorrectiveAction',
  'IncidentCase',
  'JobHazardAnalysis',
  'ToolboxTalkPrompt',
  'WeeklyToolboxTalkRecord',
  'WorkerOrientationRecord',
  'SubcontractorSafetySubmission',
  'CertificationQualificationRecord',
  'HazComSdsRecord',
  'CompetentPersonDesignation',
];

/** SS4.2: Record families with project-team-owned content (within governed structures). */
export const PROJECT_TEAM_LANE_FAMILIES: readonly SafetyRecordFamily[] = [
  'SSSPAddendum',
  'DailyPreTaskPlan',
];

export const SAFETY_LANE_MAPPINGS: ReadonlyArray<ISafetyLaneMapping> = [
  // Safety Manager Lane (SS4.1)
  { recordFamily: 'SSSPBasePlan', lane: 'SafetyManagerLane', governedBy: 'Safety Manager / Safety Officer' },
  { recordFamily: 'InspectionChecklistTemplate', lane: 'SafetyManagerLane', governedBy: 'Safety Manager exclusively' },
  { recordFamily: 'CompletedWeeklyInspection', lane: 'SafetyManagerLane', governedBy: 'Safety Manager exclusively' },
  { recordFamily: 'SafetyCorrectiveAction', lane: 'SafetyManagerLane', governedBy: 'Centralized corrective action ledger' },
  { recordFamily: 'IncidentCase', lane: 'SafetyManagerLane', governedBy: 'Tiered privacy model' },
  { recordFamily: 'JobHazardAnalysis', lane: 'SafetyManagerLane', governedBy: 'Safety Manager approves' },
  { recordFamily: 'ToolboxTalkPrompt', lane: 'SafetyManagerLane', governedBy: 'Issuance governed; acknowledgment required' },
  { recordFamily: 'WeeklyToolboxTalkRecord', lane: 'SafetyManagerLane', governedBy: 'Governed record family; proof model required' },
  { recordFamily: 'WorkerOrientationRecord', lane: 'SafetyManagerLane', governedBy: 'Governed acknowledgment record' },
  { recordFamily: 'SubcontractorSafetySubmission', lane: 'SafetyManagerLane', governedBy: 'Governed submission record' },
  { recordFamily: 'CertificationQualificationRecord', lane: 'SafetyManagerLane', governedBy: 'Governed compliance record' },
  { recordFamily: 'HazComSdsRecord', lane: 'SafetyManagerLane', governedBy: 'Governed record family' },
  { recordFamily: 'CompetentPersonDesignation', lane: 'SafetyManagerLane', governedBy: 'Project-specific designation record' },
  // Project Team Lane (SS4.2) — within Safety-Manager-governed structures
  { recordFamily: 'SSSPAddendum', lane: 'ProjectTeamLane', governedBy: 'Joint per addendum approval matrix' },
  { recordFamily: 'DailyPreTaskPlan', lane: 'ProjectTeamLane', governedBy: 'JHA reference required' },
];

// -- Authority Matrix (SS4.1-4.3) -------------------------------------------

export const SAFETY_AUTHORITY_MATRIX: ReadonlyArray<ISafetyAuthorityRule> = [
  // Safety Manager: full governance authority across all record families
  { role: 'SafetyManager', recordFamily: 'SSSPBasePlan', allowedActions: ['Create', 'Read', 'Update', 'Approve', 'Configure'] },
  { role: 'SafetyManager', recordFamily: 'SSSPAddendum', allowedActions: ['Read', 'Update', 'Approve'] },
  { role: 'SafetyManager', recordFamily: 'InspectionChecklistTemplate', allowedActions: ['Create', 'Read', 'Update', 'Configure'] },
  { role: 'SafetyManager', recordFamily: 'CompletedWeeklyInspection', allowedActions: ['Create', 'Read', 'Update'] },
  { role: 'SafetyManager', recordFamily: 'SafetyCorrectiveAction', allowedActions: ['Create', 'Read', 'Update', 'Assign', 'Approve'] },
  { role: 'SafetyManager', recordFamily: 'IncidentCase', allowedActions: ['Create', 'Read', 'Update', 'Assign'] },
  { role: 'SafetyManager', recordFamily: 'JobHazardAnalysis', allowedActions: ['Create', 'Read', 'Update', 'Approve'] },
  { role: 'SafetyManager', recordFamily: 'DailyPreTaskPlan', allowedActions: ['Read'] },
  { role: 'SafetyManager', recordFamily: 'ToolboxTalkPrompt', allowedActions: ['Create', 'Read', 'Update', 'Configure'] },
  { role: 'SafetyManager', recordFamily: 'WeeklyToolboxTalkRecord', allowedActions: ['Create', 'Read', 'Update'] },
  { role: 'SafetyManager', recordFamily: 'WorkerOrientationRecord', allowedActions: ['Create', 'Read', 'Update'] },
  { role: 'SafetyManager', recordFamily: 'SubcontractorSafetySubmission', allowedActions: ['Read', 'Update', 'Approve'] },
  { role: 'SafetyManager', recordFamily: 'CertificationQualificationRecord', allowedActions: ['Create', 'Read', 'Update'] },
  { role: 'SafetyManager', recordFamily: 'HazComSdsRecord', allowedActions: ['Create', 'Read', 'Update'] },
  { role: 'SafetyManager', recordFamily: 'CompetentPersonDesignation', allowedActions: ['Create', 'Read', 'Update'] },

  // Safety Officer: same governance authority as Safety Manager
  { role: 'SafetyOfficer', recordFamily: 'SSSPBasePlan', allowedActions: ['Create', 'Read', 'Update', 'Approve', 'Configure'] },
  { role: 'SafetyOfficer', recordFamily: 'SSSPAddendum', allowedActions: ['Read', 'Update', 'Approve'] },
  { role: 'SafetyOfficer', recordFamily: 'InspectionChecklistTemplate', allowedActions: ['Create', 'Read', 'Update', 'Configure'] },
  { role: 'SafetyOfficer', recordFamily: 'CompletedWeeklyInspection', allowedActions: ['Create', 'Read', 'Update'] },
  { role: 'SafetyOfficer', recordFamily: 'SafetyCorrectiveAction', allowedActions: ['Create', 'Read', 'Update', 'Assign', 'Approve'] },
  { role: 'SafetyOfficer', recordFamily: 'IncidentCase', allowedActions: ['Create', 'Read', 'Update', 'Assign'] },
  { role: 'SafetyOfficer', recordFamily: 'JobHazardAnalysis', allowedActions: ['Create', 'Read', 'Update', 'Approve'] },
  { role: 'SafetyOfficer', recordFamily: 'DailyPreTaskPlan', allowedActions: ['Read'] },
  { role: 'SafetyOfficer', recordFamily: 'ToolboxTalkPrompt', allowedActions: ['Create', 'Read', 'Update', 'Configure'] },
  { role: 'SafetyOfficer', recordFamily: 'WeeklyToolboxTalkRecord', allowedActions: ['Create', 'Read', 'Update'] },
  { role: 'SafetyOfficer', recordFamily: 'WorkerOrientationRecord', allowedActions: ['Create', 'Read', 'Update'] },
  { role: 'SafetyOfficer', recordFamily: 'SubcontractorSafetySubmission', allowedActions: ['Read', 'Update', 'Approve'] },
  { role: 'SafetyOfficer', recordFamily: 'CertificationQualificationRecord', allowedActions: ['Create', 'Read', 'Update'] },
  { role: 'SafetyOfficer', recordFamily: 'HazComSdsRecord', allowedActions: ['Create', 'Read', 'Update'] },
  { role: 'SafetyOfficer', recordFamily: 'CompetentPersonDesignation', allowedActions: ['Create', 'Read', 'Update'] },

  // Project Manager: read all, create/update SSSP instance sections, approve SSSP
  { role: 'ProjectManager', recordFamily: 'SSSPBasePlan', allowedActions: ['Read', 'Approve'] },
  { role: 'ProjectManager', recordFamily: 'SSSPAddendum', allowedActions: ['Create', 'Read', 'Update'] },
  { role: 'ProjectManager', recordFamily: 'InspectionChecklistTemplate', allowedActions: ['Read'] },
  { role: 'ProjectManager', recordFamily: 'CompletedWeeklyInspection', allowedActions: ['Read'] },
  { role: 'ProjectManager', recordFamily: 'SafetyCorrectiveAction', allowedActions: ['Read'] },
  { role: 'ProjectManager', recordFamily: 'IncidentCase', allowedActions: ['Read'] },
  { role: 'ProjectManager', recordFamily: 'JobHazardAnalysis', allowedActions: ['Read'] },
  { role: 'ProjectManager', recordFamily: 'DailyPreTaskPlan', allowedActions: ['Read'] },
  { role: 'ProjectManager', recordFamily: 'ToolboxTalkPrompt', allowedActions: ['Read'] },
  { role: 'ProjectManager', recordFamily: 'WeeklyToolboxTalkRecord', allowedActions: ['Read'] },
  { role: 'ProjectManager', recordFamily: 'WorkerOrientationRecord', allowedActions: ['Read'] },
  { role: 'ProjectManager', recordFamily: 'SubcontractorSafetySubmission', allowedActions: ['Read'] },
  { role: 'ProjectManager', recordFamily: 'CertificationQualificationRecord', allowedActions: ['Read'] },
  { role: 'ProjectManager', recordFamily: 'HazComSdsRecord', allowedActions: ['Read'] },
  { role: 'ProjectManager', recordFamily: 'CompetentPersonDesignation', allowedActions: ['Read'] },

  // Superintendent: read all, create/update daily pre-task, approve SSSP, JHA contributor
  { role: 'Superintendent', recordFamily: 'SSSPBasePlan', allowedActions: ['Read', 'Approve'] },
  { role: 'Superintendent', recordFamily: 'SSSPAddendum', allowedActions: ['Create', 'Read', 'Update'] },
  { role: 'Superintendent', recordFamily: 'InspectionChecklistTemplate', allowedActions: ['Read'] },
  { role: 'Superintendent', recordFamily: 'CompletedWeeklyInspection', allowedActions: ['Read'] },
  { role: 'Superintendent', recordFamily: 'SafetyCorrectiveAction', allowedActions: ['Read'] },
  { role: 'Superintendent', recordFamily: 'IncidentCase', allowedActions: ['Read'] },
  { role: 'Superintendent', recordFamily: 'JobHazardAnalysis', allowedActions: ['Read', 'Update'] },
  { role: 'Superintendent', recordFamily: 'DailyPreTaskPlan', allowedActions: ['Create', 'Read', 'Update'] },
  { role: 'Superintendent', recordFamily: 'ToolboxTalkPrompt', allowedActions: ['Read'] },
  { role: 'Superintendent', recordFamily: 'WeeklyToolboxTalkRecord', allowedActions: ['Read'] },
  { role: 'Superintendent', recordFamily: 'WorkerOrientationRecord', allowedActions: ['Read'] },
  { role: 'Superintendent', recordFamily: 'SubcontractorSafetySubmission', allowedActions: ['Create', 'Read'] },
  { role: 'Superintendent', recordFamily: 'CertificationQualificationRecord', allowedActions: ['Read'] },
  { role: 'Superintendent', recordFamily: 'HazComSdsRecord', allowedActions: ['Read'] },
  { role: 'Superintendent', recordFamily: 'CompetentPersonDesignation', allowedActions: ['Read'] },

  // Field Engineer: read-only across workspace per SS5.1
  { role: 'FieldEngineer', recordFamily: 'SSSPBasePlan', allowedActions: ['Read'] },
  { role: 'FieldEngineer', recordFamily: 'SSSPAddendum', allowedActions: ['Read'] },
  { role: 'FieldEngineer', recordFamily: 'InspectionChecklistTemplate', allowedActions: ['Read'] },
  { role: 'FieldEngineer', recordFamily: 'CompletedWeeklyInspection', allowedActions: ['Read'] },
  { role: 'FieldEngineer', recordFamily: 'SafetyCorrectiveAction', allowedActions: ['Read'] },
  { role: 'FieldEngineer', recordFamily: 'IncidentCase', allowedActions: ['Read'] },
  { role: 'FieldEngineer', recordFamily: 'JobHazardAnalysis', allowedActions: ['Read'] },
  { role: 'FieldEngineer', recordFamily: 'DailyPreTaskPlan', allowedActions: ['Create', 'Read', 'Update'] },
  { role: 'FieldEngineer', recordFamily: 'ToolboxTalkPrompt', allowedActions: ['Read'] },
  { role: 'FieldEngineer', recordFamily: 'WeeklyToolboxTalkRecord', allowedActions: ['Read'] },
  { role: 'FieldEngineer', recordFamily: 'WorkerOrientationRecord', allowedActions: ['Read'] },
  { role: 'FieldEngineer', recordFamily: 'SubcontractorSafetySubmission', allowedActions: ['Read'] },
  { role: 'FieldEngineer', recordFamily: 'CertificationQualificationRecord', allowedActions: ['Read'] },
  { role: 'FieldEngineer', recordFamily: 'HazComSdsRecord', allowedActions: ['Read'] },
  { role: 'FieldEngineer', recordFamily: 'CompetentPersonDesignation', allowedActions: ['Read'] },
];

// -- Safety Manager-Only Field Declarations (SS4.3) -------------------------

export const SAFETY_MANAGER_ONLY_FIELDS: ReadonlyArray<ISafetyManagerOnlyFieldDeclaration> = [
  {
    recordFamily: 'SSSPBasePlan',
    fieldNames: [
      'hazardIdentification', 'emergencyProcedures', 'safetyProgramStandards',
      'regulatoryCitationBlocks', 'competentPersonRequirements', 'subcontractorComplianceStandards',
    ],
  },
  {
    recordFamily: 'InspectionChecklistTemplate',
    fieldNames: ['sections', 'scoringWeights', 'templateVersion', 'templateStatus'],
  },
  {
    recordFamily: 'CompletedWeeklyInspection',
    fieldNames: ['sectionResponses', 'itemResponses', 'normalizedScore', 'inspectorId'],
  },
  {
    recordFamily: 'IncidentCase',
    fieldNames: ['personsInvolved', 'privacyTier', 'investigationNotes', 'litigationStatus'],
  },
  {
    recordFamily: 'ToolboxTalkPrompt',
    fieldNames: ['promptContent', 'issuanceDecision', 'scheduleRiskMappings', 'closureModel'],
  },
  {
    recordFamily: 'CertificationQualificationRecord',
    fieldNames: ['complianceStatus', 'expirationOverride'],
  },
  {
    recordFamily: 'CompetentPersonDesignation',
    fieldNames: ['competencyArea', 'designationStatus', 'certificationLinkage'],
  },
];

// -- Within-Module Visibility Rules (SS5.1) ---------------------------------

export const SAFETY_VISIBILITY_RULES: ReadonlyArray<ISafetyVisibilityRule> = [
  { role: 'SafetyManager', canViewWorkspace: true, canEditSafetyManagerContent: true },
  { role: 'SafetyOfficer', canViewWorkspace: true, canEditSafetyManagerContent: true },
  { role: 'ProjectManager', canViewWorkspace: true, canEditSafetyManagerContent: false },
  { role: 'Superintendent', canViewWorkspace: true, canEditSafetyManagerContent: false },
  { role: 'FieldEngineer', canViewWorkspace: true, canEditSafetyManagerContent: false },
  { role: 'System', canViewWorkspace: true, canEditSafetyManagerContent: false },
];

// -- Composite Scorecard Signals (SS5.2) ------------------------------------

export const COMPOSITE_SCORECARD_SIGNALS: ReadonlyArray<ICompositeScorecardSignal> = [
  { dimension: 'InspectionTrend', description: 'Inspection score trend (rolling window)', sourceTaskFile: 'T04' },
  { dimension: 'CorrectiveActionHealth', description: 'Open and overdue corrective actions', sourceTaskFile: 'T05' },
  { dimension: 'ReadinessPosture', description: 'Current readiness posture', sourceTaskFile: 'T08' },
  { dimension: 'BlockerState', description: 'Active blocker or exception state', sourceTaskFile: 'T08' },
  { dimension: 'ComplianceCompletion', description: 'Required compliance completion indicators', sourceTaskFile: 'T07' },
];

// -- PER Visibility Projections (SS5.3) -------------------------------------

export const PER_SAFETY_PROJECTIONS: ReadonlyArray<IPERSafetyProjection> = [
  {
    tier: 'LeadershipOperationalSummary',
    description: 'Composite scorecard indicators, current readiness posture, count of open blockers, open corrective action aging',
    includedSignals: ['compositeScorecard', 'readinessPosture', 'openBlockerCount', 'correctiveActionAging'],
    excludedFromAnnotation: true,
    pushToTeamAllowed: false,
  },
  {
    tier: 'PERSanitizedIndicators',
    description: 'Inspection score trend band (HIGH / MED / LOW — not raw score), corrective action count, compliance completion %',
    includedSignals: ['inspectionTrendBand', 'correctiveActionCount', 'complianceCompletionPct'],
    excludedFromAnnotation: true,
    pushToTeamAllowed: false,
  },
  {
    tier: 'IncidentSummary',
    description: 'Incident counts by type, anonymized — no individual identifying details, no injury specifics',
    includedSignals: ['incidentCountByType'],
    excludedFromAnnotation: true,
    pushToTeamAllowed: false,
  },
];

// -- Incident Privacy Rules (SS5.4) -----------------------------------------

export const INCIDENT_PRIVACY_RULES: ReadonlyArray<IIncidentPrivacyRule> = [
  {
    tier: 'STANDARD',
    visibleToRoles: ['SafetyManager', 'SafetyOfficer', 'ProjectManager', 'Superintendent', 'FieldEngineer'],
    perVisibility: 'Anonymized incident counts by type only',
  },
  {
    tier: 'SENSITIVE',
    visibleToRoles: ['SafetyManager', 'SafetyOfficer', 'ProjectManager'],
    perVisibility: 'Anonymized incident counts by type only',
  },
  {
    tier: 'RESTRICTED',
    visibleToRoles: ['SafetyManager', 'SafetyOfficer'],
    perVisibility: 'Anonymized incident counts by type only',
  },
];

// -- Shared Package Requirements (SS6) --------------------------------------

export const SAFETY_SHARED_PACKAGE_REQUIREMENTS: ReadonlyArray<ISafetySharedPackageRequirement> = [
  { packageName: '@hbc/acknowledgment', role: 'Toolbox talk acknowledgment, orientation acknowledgment, SSSP section acknowledgment', blockerId: 'B-SAF-01' },
  { packageName: '@hbc/workflow-handoff', role: 'SSSP approval routing, corrective action verification, override workflow, JHA approval routing', blockerId: 'B-SAF-02' },
  { packageName: '@hbc/bic-next-move', role: 'Safety workspace next-move prompt registration', blockerId: 'B-SAF-03' },
  { packageName: '@hbc/my-work-feed', role: 'Safety as a registered work-feed source module; 25 work queue item types', blockerId: 'B-SAF-04' },
  { packageName: '@hbc/related-items', role: 'Safety record relationship registry registration', blockerId: 'B-SAF-05' },
  { packageName: '@hbc/versioned-record', role: 'Inspection record, SSSP version, toolbox talk, evidence audit trail', blockerId: 'B-SAF-06' },
];

// -- Cross-Contract References (SS6) ----------------------------------------

export const SAFETY_CROSS_CONTRACT_REFS: ReadonlyArray<ISafetyCrossContractRef> = [
  { contract: 'Project Hub', section: '—', relationship: 'Consumes composite safety scorecard projection and readiness posture indicator' },
  { contract: 'Schedule', section: '—', relationship: 'Safety reads schedule activity data to drive toolbox prompt intelligence' },
  { contract: 'Subcontractors', section: '—', relationship: 'Safety owns subcontractor safety compliance records; Subcontractor module owns trade scope' },
  { contract: 'Documents', section: '—', relationship: 'Safety manages SSSP as hybrid record; Documents module is not SoR for SSSP' },
  { contract: 'Permits', section: '—', relationship: 'No direct cross-module dependency; both publish to Project Hub' },
  { contract: 'PER', section: '—', relationship: 'Read-only tiered summaries; no annotation; no push-to-team' },
  { contract: '@hbc/acknowledgment', section: 'B-SAF-01', relationship: 'Toolbox talk, orientation, SSSP section acknowledgment' },
  { contract: '@hbc/workflow-handoff', section: 'B-SAF-02', relationship: 'Corrective action escalation, SSSP approval routing, override workflows' },
  { contract: '@hbc/bic-next-move', section: 'B-SAF-03', relationship: 'Safety workspace next-move prompts' },
  { contract: '@hbc/my-work-feed', section: 'B-SAF-04', relationship: 'Safety is a registered source module for work queue items' },
  { contract: '@hbc/related-items', section: 'B-SAF-05', relationship: 'Corrective actions, incidents, JHAs linked via relationship registry' },
  { contract: '@hbc/versioned-record', section: 'B-SAF-06', relationship: 'Inspection records, SSSP versions, toolbox records use versioned record pattern' },
  { contract: 'P3-E1', section: '§9.3', relationship: 'Safety excluded from Phase 3 Executive Review annotation layer' },
  { contract: 'P3-E2', section: '§7', relationship: 'Safety source-of-truth and action-boundary rules' },
];

// -- Operating Model Principles (SS7) ----------------------------------------

export const SAFETY_OPERATING_PRINCIPLES: ReadonlyArray<ISafetyOperatingPrinciple> = [
  {
    principleNumber: 1,
    name: 'Governance before execution',
    description: 'The Safety Manager configures the governed layer (templates, rules, thresholds, prompt library, readiness rules) before project teams generate operational records.',
  },
  {
    principleNumber: 2,
    name: 'Composite health, not single-metric score',
    description: 'No single field represents "the safety score." The health signal is always derived from multiple record families.',
  },
  {
    principleNumber: 3,
    name: 'Centralized corrective action ledger',
    description: 'A corrective action from any source lands in the same centralized ledger. The source is recorded but does not change lifecycle or ownership rules.',
  },
  {
    principleNumber: 4,
    name: 'Readiness is a formal governed decision, not a gate',
    description: 'In Phase 3 v1, readiness is not a hard technical stop. It is a formal governed decision surface that expresses current compliance posture.',
  },
  {
    principleNumber: 5,
    name: 'Evidence is governed',
    description: 'Safety evidence records are governed records with metadata, review state, sensitivity tier, and retention category.',
  },
  {
    principleNumber: 6,
    name: 'Inspection program is the Safety Manager\'s program',
    description: 'Weekly inspections are completed by the Safety Manager, not by the project team. The project team sees results and is responsible for corrective actions.',
  },
];

// -- Locked Decisions Reinforced in T01 (SS8) --------------------------------

export const SAFETY_T01_LOCKED_DECISIONS: ReadonlyArray<ISafetyLockedDecision> = [
  { decisionId: 1, description: 'Safety is a governed multi-record workspace', reinforcedInSection: '§3' },
  { decisionId: 3, description: 'Weekly inspections completed by Safety Manager, not project team', reinforcedInSection: '§4.1, §7 (Principle 6)' },
  { decisionId: 7, description: 'Safety Manager-only fields restricted to Safety editing', reinforcedInSection: '§4.3' },
  { decisionId: 16, description: 'Incident/case visibility uses tiered privacy model', reinforcedInSection: '§5.4' },
  { decisionId: 22, description: 'Readiness is a formal governed decision surface', reinforcedInSection: '§7 (Principle 4)' },
  { decisionId: 37, description: 'PER/executive visibility tiered and excluded from annotation', reinforcedInSection: '§5.3' },
  { decisionId: 39, description: 'Composite scorecard published to Project Hub / PER (derived, never stored as raw score)', reinforcedInSection: '§5.2' },
];

// -- Label Maps -------------------------------------------------------------

export const SAFETY_RECORD_FAMILY_LABELS: Readonly<Record<SafetyRecordFamily, string>> = {
  SSSPBasePlan: 'SSSP Base Plan',
  SSSPAddendum: 'SSSP Addendum',
  InspectionChecklistTemplate: 'Inspection Checklist Template',
  CompletedWeeklyInspection: 'Completed Weekly Inspection',
  SafetyCorrectiveAction: 'Safety Corrective Action',
  IncidentCase: 'Incident / Case',
  JobHazardAnalysis: 'Job Hazard Analysis (JHA)',
  DailyPreTaskPlan: 'Daily Pre-Task Plan',
  ToolboxTalkPrompt: 'Toolbox Talk Prompt',
  WeeklyToolboxTalkRecord: 'Weekly Toolbox Talk Record',
  WorkerOrientationRecord: 'Worker Orientation Record',
  SubcontractorSafetySubmission: 'Subcontractor Safety-Plan Submission',
  CertificationQualificationRecord: 'Certification / Qualification Record',
  HazComSdsRecord: 'HazCom / SDS Record',
  CompetentPersonDesignation: 'Competent-Person Designation',
};

export const SAFETY_AUTHORITY_ROLE_LABELS: Readonly<Record<SafetyAuthorityRole, string>> = {
  SafetyManager: 'Safety Manager',
  SafetyOfficer: 'Safety Officer',
  ProjectManager: 'Project Manager',
  Superintendent: 'Superintendent',
  FieldEngineer: 'Field Engineer',
  System: 'System',
};

export const INCIDENT_PRIVACY_TIER_LABELS: Readonly<Record<IncidentPrivacyTier, string>> = {
  STANDARD: 'Standard — visible to project team',
  SENSITIVE: 'Sensitive — visible to PM and Safety only',
  RESTRICTED: 'Restricted — visible to Safety Manager / Officer only',
};

export const COMPOSITE_SCORECARD_DIMENSION_LABELS: Readonly<Record<CompositeScorecardDimension, string>> = {
  InspectionTrend: 'Inspection Score Trend',
  CorrectiveActionHealth: 'Corrective Action Health',
  ReadinessPosture: 'Readiness Posture',
  BlockerState: 'Blocker / Exception State',
  ComplianceCompletion: 'Compliance Completion',
};
