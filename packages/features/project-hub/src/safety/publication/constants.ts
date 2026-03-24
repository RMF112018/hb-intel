/**
 * P3-E8-T09 Publication contract constants.
 * Scorecard posture triggers, 18 spine events, 25 WQ rules, 8 related items,
 * 7 reports, 6 handoffs, 7 next-move prompts.
 */

import type {
  SafetyPosture,
  SafetyActivityEventType,
  SafetyRelationshipType,
  SafetyReportType,
} from './enums.js';
import type {
  ISafetyActivityEvent,
  ISafetyWorkQueueRule,
  ISafetyRelatedItemDeclaration,
  ISafetyReportDefinition,
  ISafetyHandoffScenario,
  ISafetyNextMovePrompt,
} from './types.js';

// -- Enum Arrays ------------------------------------------------------------

export const SAFETY_POSTURES = [
  'CRITICAL', 'AT_RISK', 'ATTENTION', 'NORMAL', 'INSUFFICIENT_DATA',
] as const satisfies ReadonlyArray<SafetyPosture>;

export const SAFETY_ACTIVITY_EVENT_TYPES = [
  'SSSP_SUBMITTED_FOR_APPROVAL', 'SSSP_APPROVED', 'SSSP_ADDENDUM_APPROVED',
  'INSPECTION_COMPLETED', 'INSPECTION_TREND_DECLINING',
  'CRITICAL_CA_CREATED', 'CORRECTIVE_ACTION_CLOSED',
  'INCIDENT_REPORTED', 'JHA_APPROVED', 'TOOLBOX_TALK_COMPLETED',
  'SUBCONTRACTOR_SUBMISSION_APPROVED', 'SUBCONTRACTOR_SUBMISSION_REJECTED',
  'CREW_ORIENTATION_COMPLETED', 'CERTIFICATION_EXPIRED_BLOCKING',
  'ORIENTATION_GAP_DETECTED',
  'READINESS_DECISION_CHANGED', 'READINESS_OVERRIDE_ACKNOWLEDGED', 'READINESS_OVERRIDE_LAPSED',
] as const satisfies ReadonlyArray<SafetyActivityEventType>;

export const SAFETY_RELATIONSHIP_TYPES = [
  'ORIGINATED_FROM', 'GENERATED', 'GOVERNS', 'FULFILLS', 'QUALIFIES_FOR', 'AMENDS',
] as const satisfies ReadonlyArray<SafetyRelationshipType>;

export const SAFETY_REPORT_TYPES = [
  'WEEKLY_SUMMARY', 'INSPECTION_HISTORY', 'CA_AGING', 'INCIDENT_REGISTER',
  'SUBCONTRACTOR_COMPLIANCE', 'TREND_REPORT', 'SSSP_VERSION_HISTORY',
] as const satisfies ReadonlyArray<SafetyReportType>;

// -- Activity Spine Events (§3) — 18 events --------------------------------

export const SAFETY_ACTIVITY_EVENTS: ReadonlyArray<ISafetyActivityEvent> = [
  { eventType: 'SSSP_SUBMITTED_FOR_APPROVAL', projectId: '', actorId: null, timestamp: '', summary: 'SSSP base plan submitted for approval', visibility: 'Project team' },
  { eventType: 'SSSP_APPROVED', projectId: '', actorId: null, timestamp: '', summary: 'SSSP base plan approved', visibility: 'Project team' },
  { eventType: 'SSSP_ADDENDUM_APPROVED', projectId: '', actorId: null, timestamp: '', summary: 'SSSP addendum approved', visibility: 'Project team' },
  { eventType: 'INSPECTION_COMPLETED', projectId: '', actorId: null, timestamp: '', summary: 'Weekly safety inspection completed', visibility: 'Project team' },
  { eventType: 'INSPECTION_TREND_DECLINING', projectId: '', actorId: null, timestamp: '', summary: 'Inspection score trend declining', visibility: 'Safety Manager + PM' },
  { eventType: 'CRITICAL_CA_CREATED', projectId: '', actorId: null, timestamp: '', summary: 'Critical corrective action created', visibility: 'Project team + PM' },
  { eventType: 'CORRECTIVE_ACTION_CLOSED', projectId: '', actorId: null, timestamp: '', summary: 'Corrective action closed', visibility: 'Project team' },
  { eventType: 'INCIDENT_REPORTED', projectId: '', actorId: null, timestamp: '', summary: 'Safety incident reported', visibility: 'Tier-dependent' },
  { eventType: 'JHA_APPROVED', projectId: '', actorId: null, timestamp: '', summary: 'Job Hazard Analysis approved', visibility: 'Project team' },
  { eventType: 'TOOLBOX_TALK_COMPLETED', projectId: '', actorId: null, timestamp: '', summary: 'Weekly toolbox talk completed', visibility: 'Project team' },
  { eventType: 'SUBCONTRACTOR_SUBMISSION_APPROVED', projectId: '', actorId: null, timestamp: '', summary: 'Subcontractor safety submission approved', visibility: 'Project team' },
  { eventType: 'SUBCONTRACTOR_SUBMISSION_REJECTED', projectId: '', actorId: null, timestamp: '', summary: 'Subcontractor safety submission rejected', visibility: 'Project team' },
  { eventType: 'CREW_ORIENTATION_COMPLETED', projectId: '', actorId: null, timestamp: '', summary: 'Subcontractor crew orientation completed', visibility: 'Project team' },
  { eventType: 'CERTIFICATION_EXPIRED_BLOCKING', projectId: '', actorId: null, timestamp: '', summary: 'Certification expired — blocking active scope', visibility: 'Safety Manager + PM' },
  { eventType: 'ORIENTATION_GAP_DETECTED', projectId: '', actorId: null, timestamp: '', summary: 'Worker orientation gap detected', visibility: 'Safety Manager' },
  { eventType: 'READINESS_DECISION_CHANGED', projectId: '', actorId: null, timestamp: '', summary: 'Safety readiness decision changed', visibility: 'Project team + PM' },
  { eventType: 'READINESS_OVERRIDE_ACKNOWLEDGED', projectId: '', actorId: null, timestamp: '', summary: 'Readiness override acknowledged', visibility: 'Project team + PM' },
  { eventType: 'READINESS_OVERRIDE_LAPSED', projectId: '', actorId: null, timestamp: '', summary: 'Readiness override lapsed', visibility: 'Safety Manager + PM' },
];

// -- Work Queue Rules (§4) — 25 rules --------------------------------------

export const SAFETY_WORK_QUEUE_RULES: ReadonlyArray<ISafetyWorkQueueRule> = [
  { ruleId: 'WQ-SAF-01', trigger: 'No SSSP record on mobilized project', itemTitle: 'Create Site Specific Safety Plan', priority: 'CRITICAL', assignees: 'Safety Manager', resolutionTrigger: 'SSSP record created' },
  { ruleId: 'WQ-SAF-02', trigger: 'SSSP in PENDING_APPROVAL, approver not signed', itemTitle: 'Sign SSSP for [Project]', priority: 'HIGH', assignees: 'Unsigned approver', resolutionTrigger: 'Approver signs' },
  { ruleId: 'WQ-SAF-03', trigger: 'No weekly inspection in current ISO week', itemTitle: 'Conduct weekly safety inspection', priority: 'HIGH', assignees: 'Safety Manager', resolutionTrigger: 'Inspection COMPLETED' },
  { ruleId: 'WQ-SAF-04', trigger: 'Inspection IN_PROGRESS > 48 hours', itemTitle: 'Complete in-progress safety inspection', priority: 'MEDIUM', assignees: 'Safety Manager', resolutionTrigger: 'Inspection COMPLETED' },
  { ruleId: 'WQ-SAF-05', trigger: 'Inspection score < 70', itemTitle: 'Review low safety inspection score', priority: 'HIGH', assignees: 'Safety Manager + PM', resolutionTrigger: 'Review acknowledged' },
  { ruleId: 'WQ-SAF-06', trigger: 'Inspection with CRITICAL CA generated', itemTitle: 'Respond to critical safety finding', priority: 'CRITICAL', assignees: 'PM + Safety Manager', resolutionTrigger: 'CA moved to IN_PROGRESS' },
  { ruleId: 'WQ-SAF-07', trigger: 'CRITICAL CA OPEN > 4 hours', itemTitle: 'Address critical safety corrective action', priority: 'CRITICAL', assignees: 'Safety Manager + PM', resolutionTrigger: 'CA moved to IN_PROGRESS' },
  { ruleId: 'WQ-SAF-08', trigger: 'CRITICAL CA overdue', itemTitle: 'OVERDUE: critical safety corrective action', priority: 'CRITICAL', assignees: 'Safety Manager + PM', resolutionTrigger: 'CA CLOSED or VOIDED' },
  { ruleId: 'WQ-SAF-09', trigger: 'MAJOR CA overdue', itemTitle: 'OVERDUE: safety corrective action', priority: 'HIGH', assignees: 'Assigned party + Safety Manager', resolutionTrigger: 'CA CLOSED or VOIDED' },
  { ruleId: 'WQ-SAF-10', trigger: 'MINOR CA overdue', itemTitle: 'OVERDUE: safety corrective action', priority: 'MEDIUM', assignees: 'Assigned party', resolutionTrigger: 'CA CLOSED or VOIDED' },
  { ruleId: 'WQ-SAF-11', trigger: 'CA PENDING_VERIFICATION > 2 business days', itemTitle: 'Verify corrective action completion', priority: 'MEDIUM', assignees: 'Safety Manager', resolutionTrigger: 'CA CLOSED' },
  { ruleId: 'WQ-SAF-12', trigger: 'Incident UNDER_INVESTIGATION > 5 business days', itemTitle: 'Complete incident investigation', priority: 'HIGH', assignees: 'Safety Manager', resolutionTrigger: 'Incident INVESTIGATION_COMPLETE' },
  { ruleId: 'WQ-SAF-13', trigger: 'No toolbox talk in current ISO week', itemTitle: 'Conduct weekly toolbox talk', priority: 'MEDIUM', assignees: 'Safety Manager', resolutionTrigger: 'Toolbox talk COMPLETE' },
  { ruleId: 'WQ-SAF-14', trigger: 'High-risk prompt not closed within 7 days', itemTitle: 'Complete toolbox prompt closure', priority: 'HIGH', assignees: 'Safety Manager', resolutionTrigger: 'Prompt closure confirmed' },
  { ruleId: 'WQ-SAF-15', trigger: 'Subcontractor on site with no APPROVED submission', itemTitle: 'Obtain subcontractor safety submissions', priority: 'HIGH', assignees: 'Safety Manager', resolutionTrigger: 'Submission APPROVED' },
  { ruleId: 'WQ-SAF-16', trigger: 'Submission PENDING_REVIEW > 5 business days', itemTitle: 'Review subcontractor safety submission', priority: 'MEDIUM', assignees: 'Safety Manager', resolutionTrigger: 'Submission reviewed' },
  { ruleId: 'WQ-SAF-17', trigger: 'Worker on site without orientation', itemTitle: 'Complete worker orientation', priority: 'HIGH', assignees: 'Safety Manager', resolutionTrigger: 'Orientation COMPLETE' },
  { ruleId: 'WQ-SAF-18', trigger: 'Certification EXPIRING_SOON for active scope', itemTitle: 'Certification expiring — schedule renewal', priority: 'HIGH', assignees: 'Safety Manager', resolutionTrigger: 'Cert renewed to ACTIVE' },
  { ruleId: 'WQ-SAF-19', trigger: 'Certification EXPIRED for active scope', itemTitle: 'Certification expired — action required', priority: 'CRITICAL', assignees: 'Safety Manager', resolutionTrigger: 'Cert renewed to ACTIVE' },
  { ruleId: 'WQ-SAF-20', trigger: 'Designation EXPIRED with active JHA', itemTitle: 'Re-designate competent person', priority: 'CRITICAL', assignees: 'Safety Manager', resolutionTrigger: 'Designation re-evaluated' },
  { ruleId: 'WQ-SAF-21', trigger: 'Project HARD blocker active', itemTitle: 'Resolve safety readiness blocker', priority: 'CRITICAL', assignees: 'Safety Manager', resolutionTrigger: 'Blocker resolved or excepted' },
  { ruleId: 'WQ-SAF-22', trigger: 'Subcontractor HARD blocker with workers on site', itemTitle: 'Subcontractor safety clearance required', priority: 'CRITICAL', assignees: 'Safety Manager', resolutionTrigger: 'Blocker resolved' },
  { ruleId: 'WQ-SAF-23', trigger: 'Activity HARD blocker, work scheduled', itemTitle: 'Activity blocked: safety condition unresolved', priority: 'CRITICAL', assignees: 'Safety Manager + PM', resolutionTrigger: 'Blocker resolved' },
  { ruleId: 'WQ-SAF-24', trigger: 'Override expiring < 4 hours', itemTitle: 'Safety override expiring — review status', priority: 'HIGH', assignees: 'Safety Manager + PM', resolutionTrigger: 'Override renewed or revoked' },
  { ruleId: 'WQ-SAF-25', trigger: 'SSSP > 365 days without review', itemTitle: 'Review SSSP currency', priority: 'MEDIUM', assignees: 'Safety Manager', resolutionTrigger: 'Review action recorded' },
];

// -- Related Items (§5) — 8 relationships -----------------------------------

export const SAFETY_RELATED_ITEMS: ReadonlyArray<ISafetyRelatedItemDeclaration> = [
  { recordA: 'ISafetyCorrectiveAction', relationshipType: 'ORIGINATED_FROM', recordB: 'ICompletedInspection' },
  { recordA: 'ISafetyCorrectiveAction', relationshipType: 'ORIGINATED_FROM', recordB: 'IIncidentRecord' },
  { recordA: 'ISafetyCorrectiveAction', relationshipType: 'ORIGINATED_FROM', recordB: 'IJhaRecord' },
  { recordA: 'IIncidentRecord', relationshipType: 'GENERATED', recordB: 'ISafetyCorrectiveAction' },
  { recordA: 'IJhaRecord', relationshipType: 'GOVERNS', recordB: 'IDailyPreTaskPlan' },
  { recordA: 'IWeeklyToolboxTalkRecord', relationshipType: 'FULFILLS', recordB: 'IToolboxTalkPrompt' },
  { recordA: 'ICompetentPersonDesignation', relationshipType: 'QUALIFIES_FOR', recordB: 'IJhaRecord' },
  { recordA: 'ISSSPAddendum', relationshipType: 'AMENDS', recordB: 'ISiteSpecificSafetyPlan' },
];

// -- Reports (§6) — 7 reports -----------------------------------------------

export const SAFETY_REPORTS: ReadonlyArray<ISafetyReportDefinition> = [
  { reportType: 'WEEKLY_SUMMARY', description: 'Inspection score, CAs opened/closed, readiness posture, toolbox talk completion', audience: 'Safety Manager, PM, Superintendent', privacyEnforced: false },
  { reportType: 'INSPECTION_HISTORY', description: 'All completed inspections with scores, section breakdowns, CA counts', audience: 'Safety Manager', privacyEnforced: false },
  { reportType: 'CA_AGING', description: 'All open CAs by severity, age, assignee, subcontractor', audience: 'Safety Manager, PM', privacyEnforced: false },
  { reportType: 'INCIDENT_REGISTER', description: 'All incidents by type, date, status, CA count — privacy tier enforced', audience: 'Safety Manager; limited for PM', privacyEnforced: true },
  { reportType: 'SUBCONTRACTOR_COMPLIANCE', description: 'Submission status, certification status, orientation completion per subcontractor', audience: 'Safety Manager', privacyEnforced: false },
  { reportType: 'TREND_REPORT', description: '4-week or 12-week inspection score trend with corrective action overlay', audience: 'Safety Manager, PM', privacyEnforced: false },
  { reportType: 'SSSP_VERSION_HISTORY', description: 'Base plan versions, addendum history, approval records', audience: 'Safety Manager', privacyEnforced: false },
];

// -- Handoff Scenarios (§7) — 6 scenarios -----------------------------------

export const SAFETY_HANDOFF_SCENARIOS: ReadonlyArray<ISafetyHandoffScenario> = [
  { scenario: 'SSSP submitted for PM signature', fromRole: 'Safety Manager', toRole: 'PM', reason: 'Approval required' },
  { scenario: 'SSSP submitted for Superintendent signature', fromRole: 'Safety Manager', toRole: 'Superintendent', reason: 'Approval required' },
  { scenario: 'CA submitted for verification', fromRole: 'Assigned party', toRole: 'Safety Manager', reason: 'Verification required' },
  { scenario: 'Subcontractor submission uploaded', fromRole: 'System', toRole: 'Safety Manager', reason: 'Review required' },
  { scenario: 'Readiness override request', fromRole: 'PM', toRole: 'Safety Manager', reason: 'Acknowledgment required' },
  { scenario: 'JHA submitted for approval', fromRole: 'Contributor', toRole: 'Safety Manager', reason: 'Approval required' },
];

// -- Next-Move Prompts (§8) — 7 prompts ------------------------------------

export const SAFETY_NEXT_MOVE_PROMPTS: ReadonlyArray<ISafetyNextMovePrompt> = [
  { context: 'Safety workspace opened, no SSSP', promptText: 'Create your Site Specific Safety Plan to establish the project safety foundation', condition: 'No SSSP record' },
  { context: 'Safety workspace opened, inspection overdue', promptText: 'Weekly inspection for [project] is overdue — conduct inspection now', condition: 'No inspection in current week' },
  { context: 'Safety workspace opened, CRITICAL CA open', promptText: 'Critical corrective action requires immediate attention', condition: 'CRITICAL CA in OPEN state' },
  { context: 'Safety workspace opened, READY_WITH_EXCEPTION', promptText: 'Review active safety exceptions for [project]', condition: 'Active exceptions exist' },
  { context: 'Safety workspace opened, subcontractor NOT_READY', promptText: 'Subcontractor [name] has unresolved safety compliance issues', condition: 'Subcontractor HARD blocker' },
  { context: 'Inspection just completed', promptText: 'Review generated corrective actions from today\'s inspection', condition: 'CAs generated from most recent inspection' },
  { context: 'After SSSP approval', promptText: 'Issue toolbox talk topic for project mobilization', condition: 'First toolbox talk not yet created' },
];

// -- Label Maps -------------------------------------------------------------

export const SAFETY_POSTURE_LABELS: Readonly<Record<SafetyPosture, string>> = {
  CRITICAL: 'Critical — immediate action required',
  AT_RISK: 'At Risk — conditions require attention',
  ATTENTION: 'Attention — monitor closely',
  NORMAL: 'Normal — compliant',
  INSUFFICIENT_DATA: 'Insufficient Data',
};

export const SAFETY_REPORT_TYPE_LABELS: Readonly<Record<SafetyReportType, string>> = {
  WEEKLY_SUMMARY: 'Weekly Safety Summary',
  INSPECTION_HISTORY: 'Inspection History',
  CA_AGING: 'Corrective Action Aging Report',
  INCIDENT_REGISTER: 'Incident Register',
  SUBCONTRACTOR_COMPLIANCE: 'Subcontractor Compliance Summary',
  TREND_REPORT: 'Safety Trend Report',
  SSSP_VERSION_HISTORY: 'SSSP Version History',
};
