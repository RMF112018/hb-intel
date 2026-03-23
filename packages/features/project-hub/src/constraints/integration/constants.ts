/**
 * P3-E6-T07 Platform Integration constants.
 */

import type {
  ConstraintsActivityEventType,
  ConstraintsHandoffType,
  ConstraintsHealthMetricName,
  ConstraintsNotificationType,
  ConstraintsReportType,
  ConstraintsWorkItemType,
  ConstraintsWorkQueueItemType,
} from './enums.js';
import type {
  IConstraintsActivityEventConfig,
  IConstraintsHandoffConfig,
  IConstraintsHealthMetricConfig,
  IConstraintsNotificationConfig,
  IConstraintsReportConfig,
  IConstraintsWorkItemConfig,
  IConstraintsWorkQueueConfig,
  ISharedPackageIntegration,
} from './types.js';

// ── Module Scope ────────────────────────────────────────────────────

export const INTEGRATION_SCOPE = 'constraints/integration' as const;

// ── Enum Arrays ─────────────────────────────────────────────────────

export const CONSTRAINTS_ACTIVITY_EVENT_TYPES = [
  'RiskCreated', 'RiskStatusChanged', 'RiskSpawnedConstraint',
  'ConstraintCreated', 'ConstraintStatusChanged', 'ConstraintSpawnedDelay', 'ConstraintSpawnedChange',
  'DelayCreated', 'DelayQuantified', 'DelayDispositioned',
  'ChangeEventCreated', 'ChangeEventApproved', 'ChangeEventPromotedToIntegrated',
  'ReviewPackagePublished',
] as const satisfies ReadonlyArray<ConstraintsActivityEventType>;

export const CONSTRAINTS_HANDOFF_TYPES = [
  'ConstraintEscalationHandoff', 'DelayDispositionRequest', 'ChangeEventApprovalRequest',
  'ReviewPackagePublicationHandoff', 'RiskMaterializationHandoff',
] as const satisfies ReadonlyArray<ConstraintsHandoffType>;

export const CONSTRAINTS_NOTIFICATION_TYPES = [
  'RiskOverdue', 'HighRiskAlert', 'ConstraintOverdue', 'ConstraintCriticalAlert',
  'DelayNotificationReminder', 'DelayQuantifiedAlert', 'ChangeEventApprovalPending', 'ReviewPackageReadyForReview',
] as const satisfies ReadonlyArray<ConstraintsNotificationType>;

export const CONSTRAINTS_WORK_ITEM_TYPES = [
  'RiskOverdueItem', 'RiskHighScoreItem', 'ConstraintOverdueItem', 'ConstraintCriticalPriorityItem',
  'DelayNotificationDueItem', 'DelayDispositionRequiredItem', 'ChangeEventApprovalItem',
  'ChangeEventClosureItem', 'ReviewPackageAnnotationResponseItem',
] as const satisfies ReadonlyArray<ConstraintsWorkItemType>;

export const CONSTRAINTS_WORK_QUEUE_ITEM_TYPES = [
  'RiskOverdue', 'ConstraintOverdue', 'ConstraintCritical', 'DelayNotificationDue',
  'DelayDispositionRequired', 'ChangeEventApprovalPending', 'ReviewPackageAnnotationResponse',
] as const satisfies ReadonlyArray<ConstraintsWorkQueueItemType>;

export const CONSTRAINTS_HEALTH_METRIC_NAMES = [
  'openRiskCount', 'highRiskCount', 'openConstraintCount', 'overdueConstraintCount',
  'criticalConstraintCount', 'openDelayCount', 'criticalPathDelayCount', 'totalQuantifiedDelayDays',
  'openChangeEventCount', 'pendingApprovalCostImpact', 'totalApprovedCostImpact',
] as const satisfies ReadonlyArray<ConstraintsHealthMetricName>;

export const CONSTRAINTS_REPORT_TYPES = [
  'RiskRegisterReport', 'ConstraintLogReport', 'DelayLogReport',
  'ChangeEventLogReport', 'CrossLedgerSummaryReport', 'ReviewPackageExport',
] as const satisfies ReadonlyArray<ConstraintsReportType>;

// ── Shared Package Integrations (§7.1) ──────────────────────────────

export const SHARED_PACKAGE_INTEGRATIONS: ReadonlyArray<ISharedPackageIntegration> = [
  { packageName: '@hbc/field-annotations', integrationPoint: 'PER annotation layer on published snapshots and review packages only', stateMode: 'Published', notes: 'Annotations anchored to snapshotId or reviewPackageId; never on live ledger records' },
  { packageName: '@hbc/related-items', integrationPoint: 'Cross-module relationships for all four ledger record types', stateMode: 'Live', notes: 'All four record types registered; 9+ relationship types supported' },
  { packageName: '@hbc/acknowledgement', integrationPoint: 'Formal acknowledgement of escalations, dispositions, and publication receipt', stateMode: 'Live', notes: 'Escalation acknowledgement, disposition acknowledgement, review package receipt' },
  { packageName: '@hbc/workflow-handoff', integrationPoint: 'Structured handoffs across ledger lifecycle', stateMode: 'Live', notes: '5 handoff types' },
  { packageName: '@hbc/notification-intelligence', integrationPoint: 'Priority-tiered notifications for ledger events', stateMode: 'Live', notes: '8 notification types; governed routing and thresholds' },
  { packageName: '@hbc/bic-next-move', integrationPoint: 'BIC/owner tracking across all four ledgers', stateMode: 'Live', notes: 'BIC field on Risk, Constraint, Delay, Change records' },
  { packageName: '@hbc/versioned-record', integrationPoint: 'Record version history and audit trail', stateMode: 'Live', notes: 'Field-level change history for all four ledger records' },
  { packageName: '@hbc/my-work-feed', integrationPoint: 'Cross-module personal work aggregation', stateMode: 'Live', notes: '9 work item types via ConstraintsWorkAdapter' },
  { packageName: '@hbc/complexity', integrationPoint: '3-tier progressive disclosure', stateMode: 'Live', notes: 'Essential/Standard/Expert field density' },
  { packageName: '@hbc/export-runtime', integrationPoint: 'Data export lifecycle and artifact generation', stateMode: 'Async', notes: 'Risk register, constraint log CSV, delay log CSV, change event log CSV, review package PDF' },
  { packageName: '@hbc/session-state', integrationPoint: 'Offline-safe session persistence', stateMode: 'Offline', notes: 'Offline-first constraint and delay logging via IndexedDB' },
];

// ── Handoff Configs (§7.2) ──────────────────────────────────────────

export const CONSTRAINTS_HANDOFF_CONFIGS: ReadonlyArray<IConstraintsHandoffConfig> = [
  { handoffType: 'ConstraintEscalationHandoff', trigger: 'Constraint overdue > governed threshold', recipient: 'Designated Approver or manager' },
  { handoffType: 'DelayDispositionRequest', trigger: 'Delay reaches Quantified state; disposition decision needed', recipient: 'Designated Approver' },
  { handoffType: 'ChangeEventApprovalRequest', trigger: 'Change event transitions to PendingApproval', recipient: 'Designated Approver' },
  { handoffType: 'ReviewPackagePublicationHandoff', trigger: 'Review package published and ready for executive review', recipient: 'Portfolio Executive Reviewer' },
  { handoffType: 'RiskMaterializationHandoff', trigger: 'Risk transitions to MaterializationPending', recipient: 'PM / Risk Owner' },
];

// ── Notification Configs (§7.3) ─────────────────────────────────────

export const CONSTRAINTS_NOTIFICATION_CONFIGS: ReadonlyArray<IConstraintsNotificationConfig> = [
  { notificationType: 'RiskOverdue', trigger: 'Risk targetMitigationDate < today and status open', defaultRecipients: 'Risk owner, bic team' },
  { notificationType: 'HighRiskAlert', trigger: 'New risk created with riskScore ≥ governed threshold', defaultRecipients: 'PM, Risk owner' },
  { notificationType: 'ConstraintOverdue', trigger: 'Constraint dueDate < today and status open', defaultRecipients: 'Constraint owner, bic team' },
  { notificationType: 'ConstraintCriticalAlert', trigger: 'New constraint created with priority = Critical', defaultRecipients: 'PM, Constraint owner' },
  { notificationType: 'DelayNotificationReminder', trigger: 'Delay notificationDate not yet set and delayStartDate < today - governed threshold', defaultRecipients: 'PM' },
  { notificationType: 'DelayQuantifiedAlert', trigger: 'Delay transitions to Quantified with criticalPathImpact = CRITICAL', defaultRecipients: 'PM, PE' },
  { notificationType: 'ChangeEventApprovalPending', trigger: 'Change event in PendingApproval for > governed threshold days', defaultRecipients: 'Approver, PM' },
  { notificationType: 'ReviewPackageReadyForReview', trigger: 'Review package published', defaultRecipients: 'Portfolio Executive Reviewer' },
];

// ── Work Item Configs (§7.4) ────────────────────────────────────────

export const CONSTRAINTS_WORK_ITEM_CONFIGS: ReadonlyArray<IConstraintsWorkItemConfig> = [
  { workItemType: 'RiskOverdueItem', condition: 'Risk targetMitigationDate < today and open', actor: 'Risk owner' },
  { workItemType: 'RiskHighScoreItem', condition: 'New high-risk record above governed threshold', actor: 'PM' },
  { workItemType: 'ConstraintOverdueItem', condition: 'Constraint dueDate < today and open', actor: 'Constraint owner' },
  { workItemType: 'ConstraintCriticalPriorityItem', condition: 'New Critical-priority constraint', actor: 'PM' },
  { workItemType: 'DelayNotificationDueItem', condition: 'Delay notification not yet sent; approaching or past threshold', actor: 'PM' },
  { workItemType: 'DelayDispositionRequiredItem', condition: 'Delay at Quantified status; disposition needed', actor: 'PM, Approver' },
  { workItemType: 'ChangeEventApprovalItem', condition: 'Change event in PendingApproval', actor: 'Designated Approver' },
  { workItemType: 'ChangeEventClosureItem', condition: 'Change event approved; closure action needed', actor: 'PM' },
  { workItemType: 'ReviewPackageAnnotationResponseItem', condition: 'PER annotation requires PM response or acknowledgement', actor: 'PM' },
];

// ── Activity Event Configs (§7.5) ───────────────────────────────────

export const CONSTRAINTS_ACTIVITY_EVENT_CONFIGS: ReadonlyArray<IConstraintsActivityEventConfig> = [
  { eventType: 'RiskCreated', trigger: 'PM creates risk', payloadFields: ['riskId', 'riskNumber', 'projectId', 'category', 'riskScore', 'createdAt', 'createdBy'] },
  { eventType: 'RiskStatusChanged', trigger: 'Status transition', payloadFields: ['riskId', 'riskNumber', 'projectId', 'priorStatus', 'newStatus', 'changedAt', 'changedBy'] },
  { eventType: 'RiskSpawnedConstraint', trigger: 'Constraint spawned from risk', payloadFields: ['riskId', 'riskNumber', 'projectId', 'constraintId', 'constraintNumber', 'spawnedAt', 'spawnedBy'] },
  { eventType: 'ConstraintCreated', trigger: 'PM creates constraint', payloadFields: ['constraintId', 'constraintNumber', 'projectId', 'category', 'priority', 'createdAt', 'createdBy'] },
  { eventType: 'ConstraintStatusChanged', trigger: 'Status transition', payloadFields: ['constraintId', 'constraintNumber', 'projectId', 'priorStatus', 'newStatus', 'changedAt', 'changedBy'] },
  { eventType: 'ConstraintSpawnedDelay', trigger: 'Delay spawned', payloadFields: ['constraintId', 'constraintNumber', 'projectId', 'delayId', 'delayNumber', 'spawnedAt'] },
  { eventType: 'ConstraintSpawnedChange', trigger: 'Change event spawned', payloadFields: ['constraintId', 'constraintNumber', 'projectId', 'changeEventId', 'changeEventNumber', 'spawnedAt'] },
  { eventType: 'DelayCreated', trigger: 'PM creates delay', payloadFields: ['delayId', 'delayNumber', 'projectId', 'delayEventType', 'criticalPathImpact', 'createdAt', 'createdBy'] },
  { eventType: 'DelayQuantified', trigger: 'Delay transitions to Quantified', payloadFields: ['delayId', 'delayNumber', 'projectId', 'estimatedCalendarDays', 'criticalPathImpact', 'quantifiedAt', 'quantifiedBy'] },
  { eventType: 'DelayDispositioned', trigger: 'Delay dispositioned', payloadFields: ['delayId', 'delayNumber', 'projectId', 'dispositionOutcome', 'dispositionedAt', 'dispositionedBy'] },
  { eventType: 'ChangeEventCreated', trigger: 'PM creates change event', payloadFields: ['changeEventId', 'changeEventNumber', 'projectId', 'origin', 'totalCostImpact', 'createdAt', 'createdBy'] },
  { eventType: 'ChangeEventApproved', trigger: 'Change event approved', payloadFields: ['changeEventId', 'changeEventNumber', 'projectId', 'totalCostImpact', 'approvedDate', 'approvedBy'] },
  { eventType: 'ChangeEventPromotedToIntegrated', trigger: 'Manual-to-integrated promotion', payloadFields: ['changeEventId', 'changeEventNumber', 'projectId', 'procoreChangeEventId', 'promotedAt', 'promotedBy'] },
  { eventType: 'ReviewPackagePublished', trigger: 'Review package published', payloadFields: ['reviewPackageId', 'packageNumber', 'projectId', 'ledgersIncluded', 'publishedAt', 'publishedBy'] },
];

// ── Health Spine Metric Configs (§7.5) ──────────────────────────────

export const CONSTRAINTS_HEALTH_METRIC_CONFIGS: ReadonlyArray<IConstraintsHealthMetricConfig> = [
  { metricName: 'openRiskCount', ledger: 'Risk', updateFrequency: 'On risk create/close' },
  { metricName: 'highRiskCount', ledger: 'Risk', updateFrequency: 'On risk create/score change/close' },
  { metricName: 'openConstraintCount', ledger: 'Constraint', updateFrequency: 'On constraint create/close' },
  { metricName: 'overdueConstraintCount', ledger: 'Constraint', updateFrequency: 'Daily + on constraint edit' },
  { metricName: 'criticalConstraintCount', ledger: 'Constraint', updateFrequency: 'On create/priority change/close' },
  { metricName: 'openDelayCount', ledger: 'Delay', updateFrequency: 'On delay create/close' },
  { metricName: 'criticalPathDelayCount', ledger: 'Delay', updateFrequency: 'On delay create/criticalPathImpact change/close' },
  { metricName: 'totalQuantifiedDelayDays', ledger: 'Delay', updateFrequency: 'On quantification' },
  { metricName: 'openChangeEventCount', ledger: 'Change', updateFrequency: 'On create/close' },
  { metricName: 'pendingApprovalCostImpact', ledger: 'Change', updateFrequency: 'On status change/cost change' },
  { metricName: 'totalApprovedCostImpact', ledger: 'Change', updateFrequency: 'On approval/close' },
];

// ── Work Queue Configs (§7.5) ───────────────────────────────────────

export const CONSTRAINTS_WORK_QUEUE_CONFIGS: ReadonlyArray<IConstraintsWorkQueueConfig> = [
  { itemType: 'RiskOverdue', trigger: 'Risk overdue', priority: 'Governed' },
  { itemType: 'ConstraintOverdue', trigger: 'Constraint overdue', priority: 'Governed' },
  { itemType: 'ConstraintCritical', trigger: 'Critical priority constraint', priority: 'High' },
  { itemType: 'DelayNotificationDue', trigger: 'Notification reminder triggered', priority: 'High' },
  { itemType: 'DelayDispositionRequired', trigger: 'Delay quantified; disposition needed', priority: 'Medium' },
  { itemType: 'ChangeEventApprovalPending', trigger: 'Change event pending approval', priority: 'Medium' },
  { itemType: 'ReviewPackageAnnotationResponse', trigger: 'PER annotation requires response', priority: 'Medium' },
];

// ── Report Configs (§7.6) ───────────────────────────────────────────

export const CONSTRAINTS_REPORT_CONFIGS: ReadonlyArray<IConstraintsReportConfig> = [
  { reportType: 'RiskRegisterReport', description: 'All open risks with score, owner, mitigation status', stateSource: 'Live' },
  { reportType: 'ConstraintLogReport', description: 'All constraints with status, owner, BIC, overdue flag', stateSource: 'Live' },
  { reportType: 'DelayLogReport', description: 'All delays with event type, critical path impact, quantified days, notification status', stateSource: 'Live' },
  { reportType: 'ChangeEventLogReport', description: 'All change events with status, cost impact, Procore sync state', stateSource: 'Live' },
  { reportType: 'CrossLedgerSummaryReport', description: 'Lineage summary: risk-to-constraint materialization rate, constraint-to-delay/change spawn counts', stateSource: 'Live' },
  { reportType: 'ReviewPackageExport', description: 'PDF export of published review packages for distribution', stateSource: 'Published' },
];
