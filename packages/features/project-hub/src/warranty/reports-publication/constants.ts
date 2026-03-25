/**
 * P3-E14-T10 Stage 8 Project Warranty Module reports-publication constants.
 */

import type {
  WarrantyActivityEventKey,
  WarrantyHealthBand,
  WarrantyHealthMetricKey,
  WarrantyReportDesignationKey,
  WarrantyTelemetryEventKey,
  WarrantyWorkQueuePriority,
  WarrantyWorkQueueRuleId,
} from './enums.js';
import type {
  IWarrantyActivityEventDef,
  IWarrantyHealthBandDef,
  IWarrantyHealthMetricDef,
  IWarrantyReportDesignationDef,
  IWarrantyTelemetryEventDef,
  IWarrantyWorkQueueRuleDef,
} from './types.js';

// -- Enum Arrays ----------------------------------------------------------------

export const WARRANTY_ACTIVITY_EVENT_KEYS: ReadonlyArray<WarrantyActivityEventKey> = [
  'warranty.coverage.registered', 'warranty.coverage.voided', 'warranty.coverage.expired',
  'warranty.intake.logged', 'warranty.case.opened', 'warranty.case.coverage-decision-made',
  'warranty.case.assigned', 'warranty.case.reassigned',
  'warranty.acknowledgment.recorded', 'warranty.acknowledgment.disputed', 'warranty.acknowledgment.dispute-resolved',
  'warranty.case.awaiting-owner', 'warranty.case.awaiting-owner-resolved',
  'warranty.case.visit-scheduled', 'warranty.case.visit-completed',
  'warranty.case.corrected', 'warranty.case.verification-failed', 'warranty.case.verified',
  'warranty.case.resolved', 'warranty.case.closed', 'warranty.case.reopened', 'warranty.case.voided',
  'warranty.backcharge.advisory-published', 'warranty.communication.logged',
];

export const WARRANTY_WORK_QUEUE_RULE_IDS: ReadonlyArray<WarrantyWorkQueueRuleId> = [
  'WQ-WAR-01', 'WQ-WAR-02', 'WQ-WAR-03', 'WQ-WAR-04', 'WQ-WAR-05',
  'WQ-WAR-06', 'WQ-WAR-07', 'WQ-WAR-08', 'WQ-WAR-09', 'WQ-WAR-10',
  'WQ-WAR-11', 'WQ-WAR-12', 'WQ-WAR-13', 'WQ-WAR-14', 'WQ-WAR-15',
  'WQ-WAR-16', 'WQ-WAR-17', 'WQ-WAR-18', 'WQ-WAR-19', 'WQ-WAR-20',
];

export const WARRANTY_REPORT_DESIGNATION_KEYS: ReadonlyArray<WarrantyReportDesignationKey> = [
  'WarrantyPostureSummary', 'SlaComplianceReport', 'CoverageExpirationStatus',
  'OwnerExperienceRiskReport', 'SubcontractorWarrantyBurdenReport',
  'DenialNotCoveredTrendReport', 'BackChargeAdvisoryLog', 'VerificationQualityReport',
];

export const WARRANTY_HEALTH_BANDS: ReadonlyArray<WarrantyHealthBand> = ['Green', 'Yellow', 'Orange', 'Red'];
export const WARRANTY_WORK_QUEUE_PRIORITIES: ReadonlyArray<WarrantyWorkQueuePriority> = ['Advisory', 'Normal', 'Warning', 'Elevated', 'Critical'];

// -- Activity Event Definitions (T09 §3.2) — 24 --------------------------------

export const WARRANTY_ACTIVITY_EVENT_DEFINITIONS: ReadonlyArray<IWarrantyActivityEventDef> = [
  { eventKey: 'warranty.coverage.registered', trigger: 'WarrantyCoverageItem created and activated', actor: 'PM / WARRANTY_MANAGER' },
  { eventKey: 'warranty.coverage.voided', trigger: 'Coverage item voided', actor: 'PM / WARRANTY_MANAGER' },
  { eventKey: 'warranty.coverage.expired', trigger: 'Daily sweep transitions item to Expired', actor: 'System' },
  { eventKey: 'warranty.intake.logged', trigger: 'OwnerIntakeLog created', actor: 'PM / WARRANTY_MANAGER' },
  { eventKey: 'warranty.case.opened', trigger: 'WarrantyCase created', actor: 'PM / WARRANTY_MANAGER' },
  { eventKey: 'warranty.case.coverage-decision-made', trigger: 'WarrantyCoverageDecision created', actor: 'PM / WARRANTY_MANAGER' },
  { eventKey: 'warranty.case.assigned', trigger: 'Case transitions to Assigned', actor: 'PM / WARRANTY_MANAGER' },
  { eventKey: 'warranty.case.reassigned', trigger: 'Prior assignment superseded; new assignment created', actor: 'PM / WARRANTY_MANAGER' },
  { eventKey: 'warranty.acknowledgment.recorded', trigger: 'SubcontractorAcknowledgment status updated from Pending', actor: 'PM / WARRANTY_MANAGER' },
  { eventKey: 'warranty.acknowledgment.disputed', trigger: 'Acknowledgment transitions to ScopeDisputed', actor: 'PM / WARRANTY_MANAGER' },
  { eventKey: 'warranty.acknowledgment.dispute-resolved', trigger: 'Acknowledgment transitions to DisputeResolved', actor: 'PX / PM' },
  { eventKey: 'warranty.case.awaiting-owner', trigger: 'Case transitions to AwaitingOwner', actor: 'PM / WARRANTY_MANAGER' },
  { eventKey: 'warranty.case.awaiting-owner-resolved', trigger: 'Case exits AwaitingOwner', actor: 'PM / WARRANTY_MANAGER' },
  { eventKey: 'warranty.case.visit-scheduled', trigger: 'WarrantyVisit created in Scheduled state', actor: 'PM / WARRANTY_MANAGER' },
  { eventKey: 'warranty.case.visit-completed', trigger: 'Visit transitions to Completed', actor: 'PM / WARRANTY_MANAGER' },
  { eventKey: 'warranty.case.corrected', trigger: 'Case transitions to Corrected', actor: 'PM / WARRANTY_MANAGER' },
  { eventKey: 'warranty.case.verification-failed', trigger: 'PendingVerification → InProgress (failed gate)', actor: 'PM / WARRANTY_MANAGER' },
  { eventKey: 'warranty.case.verified', trigger: 'Case transitions to Verified', actor: 'PM / WARRANTY_MANAGER' },
  { eventKey: 'warranty.case.resolved', trigger: 'WarrantyCaseResolutionRecord created', actor: 'PM / WARRANTY_MANAGER' },
  { eventKey: 'warranty.case.closed', trigger: 'Case transitions to Closed', actor: 'PM / WARRANTY_MANAGER' },
  { eventKey: 'warranty.case.reopened', trigger: 'Case transitions to Reopened', actor: 'PX' },
  { eventKey: 'warranty.case.voided', trigger: 'Case voided', actor: 'PM / PX' },
  { eventKey: 'warranty.backcharge.advisory-published', trigger: 'Back-charge advisory published to Financial', actor: 'PM / WARRANTY_MANAGER' },
  { eventKey: 'warranty.communication.logged', trigger: 'WarrantyCommunicationEvent created', actor: 'PM / WARRANTY_MANAGER' },
];

// -- Health Metric Definitions (T09 §4) — 16 -----------------------------------

export const WARRANTY_HEALTH_METRIC_DEFINITIONS: ReadonlyArray<IWarrantyHealthMetricDef> = [
  // Leading (6)
  { metricKey: 'warranty.coverage.expiringSoon30d', definition: 'Active coverage items with warrantyEndDate ≤ today + 30d', category: 'Leading' },
  { metricKey: 'warranty.coverage.expiringSoon7d', definition: 'Active coverage items with warrantyEndDate ≤ today + 7d', category: 'Leading' },
  { metricKey: 'warranty.case.acknowledgmentPendingRate', definition: '% of Assigned cases where ack is Pending beyond 5 BD', category: 'Leading' },
  { metricKey: 'warranty.case.ownerUpdateOverdue', definition: 'Owner-originated cases with no communication within cadence threshold', category: 'Leading' },
  { metricKey: 'warranty.case.slaWarningCount', definition: 'Open cases where SLA is within warning window', category: 'Leading' },
  { metricKey: 'warranty.case.disputeOpenCount', definition: 'Cases with acknowledgmentStatus = ScopeDisputed', category: 'Leading' },
  // Lagging (5)
  { metricKey: 'warranty.case.slaComplianceRate', definition: '% of Closed cases where repair SLA was not breached', category: 'Lagging' },
  { metricKey: 'warranty.case.avgDaysToClose', definition: 'Mean calendar days from opened to closed', category: 'Lagging' },
  { metricKey: 'warranty.case.reopenRate', definition: '% of closed cases subsequently reopened', category: 'Lagging' },
  { metricKey: 'warranty.case.verificationFailureRate', definition: '% of PendingVerification entries that returned to InProgress', category: 'Lagging' },
  { metricKey: 'warranty.case.backChargeAdvisoryRate', definition: '% of closed cases that flagged back-charge advisory', category: 'Lagging' },
  // Recurring failure (5)
  { metricKey: 'warranty.signal.coverageExpiredWithOpenCases', definition: 'Coverage item Expired while ≥1 case against it remains open', category: 'RecurringFailure' },
  { metricKey: 'warranty.signal.subcontractorRepeatFailure', definition: 'Same sub has ≥2 verification failures across cases', category: 'RecurringFailure' },
  { metricKey: 'warranty.signal.slaBreachAcceleration', definition: '≥3 SLA breaches within rolling 30-day window', category: 'RecurringFailure' },
  { metricKey: 'warranty.signal.ownerEscalationRisk', definition: 'Owner-originated case ≥14 days with no communication', category: 'RecurringFailure' },
  { metricKey: 'warranty.signal.disputeCluster', definition: '≥3 cases with ScopeDisputed open simultaneously', category: 'RecurringFailure' },
];

// -- Work Queue Rule Definitions (T09 §5.2) — 20 --------------------------------

export const WARRANTY_WORK_QUEUE_RULE_DEFINITIONS: ReadonlyArray<IWarrantyWorkQueueRuleDef> = [
  { ruleId: 'WQ-WAR-01', triggerCondition: 'Case transitions to Assigned; acknowledgment Pending', recipient: 'PM', priority: 'Normal', dismissible: false },
  { ruleId: 'WQ-WAR-02', triggerCondition: 'Ack Pending Standard: 5 BD elapsed', recipient: 'PM', priority: 'Warning', dismissible: true },
  { ruleId: 'WQ-WAR-03', triggerCondition: 'Ack Pending Expedited: 2 BD elapsed', recipient: 'PM', priority: 'Warning', dismissible: true },
  { ruleId: 'WQ-WAR-04', triggerCondition: 'Ack Pending Standard: 10 BD (escalation)', recipient: 'PX', priority: 'Elevated', dismissible: false },
  { ruleId: 'WQ-WAR-05', triggerCondition: 'Ack Pending Expedited: 4 BD (escalation)', recipient: 'PX', priority: 'Elevated', dismissible: false },
  { ruleId: 'WQ-WAR-06', triggerCondition: 'SLA warning: Standard repair ≤ 5 BD remaining', recipient: 'PM', priority: 'Warning', dismissible: true },
  { ruleId: 'WQ-WAR-07', triggerCondition: 'SLA warning: Expedited repair ≤ 2 BD remaining', recipient: 'PM', priority: 'Warning', dismissible: true },
  { ruleId: 'WQ-WAR-08', triggerCondition: 'SLA breached: repair deadline exceeded', recipient: 'PM', priority: 'Critical', dismissible: false },
  { ruleId: 'WQ-WAR-09', triggerCondition: 'SLA breached Standard: ≥ 10 BD past deadline', recipient: 'PX', priority: 'Elevated', dismissible: false },
  { ruleId: 'WQ-WAR-10', triggerCondition: 'Scope dispute lodged', recipient: 'PM', priority: 'Warning', dismissible: false },
  { ruleId: 'WQ-WAR-11', triggerCondition: 'Scope dispute unresolved: Standard ≥ 10 BD; Expedited ≥ 4 BD', recipient: 'PX', priority: 'Elevated', dismissible: false },
  { ruleId: 'WQ-WAR-12', triggerCondition: 'Coverage item entering 30-day expiration window with ≥1 open case', recipient: 'PM', priority: 'Warning', dismissible: true },
  { ruleId: 'WQ-WAR-13', triggerCondition: 'Coverage item entering 7-day expiration window', recipient: 'PM', priority: 'Elevated', dismissible: false },
  { ruleId: 'WQ-WAR-14', triggerCondition: 'Coverage item expired while open cases remain', recipient: 'PX', priority: 'Critical', dismissible: false },
  { ruleId: 'WQ-WAR-15', triggerCondition: 'Back-charge advisory published to Financial', recipient: 'PM', priority: 'Advisory', dismissible: true },
  { ruleId: 'WQ-WAR-16', triggerCondition: 'Case in Corrected state ≥3 BD without verification', recipient: 'PM', priority: 'Warning', dismissible: true },
  { ruleId: 'WQ-WAR-17', triggerCondition: 'Verification failed (PendingVerification → InProgress)', recipient: 'PM', priority: 'Warning', dismissible: false },
  { ruleId: 'WQ-WAR-18', triggerCondition: 'Owner-originated case: no communication within cadence', recipient: 'PM', priority: 'Advisory', dismissible: true },
  { ruleId: 'WQ-WAR-19', triggerCondition: 'Owner experience risk signal active', recipient: 'PM', priority: 'Warning', dismissible: true },
  { ruleId: 'WQ-WAR-20', triggerCondition: 'AwaitingOwner ≥7 BD Standard / ≥3 BD Expedited with no follow-up', recipient: 'PM', priority: 'Advisory', dismissible: true },
];

// -- Report Designation Definitions (T09 §6.2) — 8 ------------------------------

export const WARRANTY_REPORT_DESIGNATION_DEFINITIONS: ReadonlyArray<IWarrantyReportDesignationDef> = [
  { reportKey: 'WarrantyPostureSummary', classification: 'Lagging indicator snapshot', refresh: 'Per period / on demand' },
  { reportKey: 'SlaComplianceReport', classification: 'Lagging indicator', refresh: 'Per period' },
  { reportKey: 'CoverageExpirationStatus', classification: 'Leading indicator', refresh: 'Daily' },
  { reportKey: 'OwnerExperienceRiskReport', classification: 'Leading indicator', refresh: 'Weekly / on demand' },
  { reportKey: 'SubcontractorWarrantyBurdenReport', classification: 'Leading + lagging', refresh: 'Per period / on demand' },
  { reportKey: 'DenialNotCoveredTrendReport', classification: 'Lagging indicator', refresh: 'Per period' },
  { reportKey: 'BackChargeAdvisoryLog', classification: 'Lagging indicator', refresh: 'On demand / per period' },
  { reportKey: 'VerificationQualityReport', classification: 'Lagging indicator', refresh: 'Per period' },
];

// -- Health Band Definitions (T09 §4.5) — 4 ------------------------------------

export const WARRANTY_HEALTH_BAND_DEFINITIONS: ReadonlyArray<IWarrantyHealthBandDef> = [
  { band: 'Green', condition: 'No Warning, Critical, or Elevated signals active' },
  { band: 'Yellow', condition: '≥1 Warning signal active; no Critical signals' },
  { band: 'Orange', condition: '≥1 Elevated signal active' },
  { band: 'Red', condition: '≥1 Critical signal active' },
];
