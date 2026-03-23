/**
 * P3-E6-T07 Platform Integration enumerations.
 */

// ── Activity Spine Event Types (§7.5) ───────────────────────────────

export type ConstraintsActivityEventType =
  | 'RiskCreated'
  | 'RiskStatusChanged'
  | 'RiskSpawnedConstraint'
  | 'ConstraintCreated'
  | 'ConstraintStatusChanged'
  | 'ConstraintSpawnedDelay'
  | 'ConstraintSpawnedChange'
  | 'DelayCreated'
  | 'DelayQuantified'
  | 'DelayDispositioned'
  | 'ChangeEventCreated'
  | 'ChangeEventApproved'
  | 'ChangeEventPromotedToIntegrated'
  | 'ReviewPackagePublished';

// ── Workflow Handoff Types (§7.2) ───────────────────────────────────

export type ConstraintsHandoffType =
  | 'ConstraintEscalationHandoff'
  | 'DelayDispositionRequest'
  | 'ChangeEventApprovalRequest'
  | 'ReviewPackagePublicationHandoff'
  | 'RiskMaterializationHandoff';

// ── Notification Types (§7.3) ───────────────────────────────────────

export type ConstraintsNotificationType =
  | 'RiskOverdue'
  | 'HighRiskAlert'
  | 'ConstraintOverdue'
  | 'ConstraintCriticalAlert'
  | 'DelayNotificationReminder'
  | 'DelayQuantifiedAlert'
  | 'ChangeEventApprovalPending'
  | 'ReviewPackageReadyForReview';

// ── Work Item Types (§7.4) ──────────────────────────────────────────

export type ConstraintsWorkItemType =
  | 'RiskOverdueItem'
  | 'RiskHighScoreItem'
  | 'ConstraintOverdueItem'
  | 'ConstraintCriticalPriorityItem'
  | 'DelayNotificationDueItem'
  | 'DelayDispositionRequiredItem'
  | 'ChangeEventApprovalItem'
  | 'ChangeEventClosureItem'
  | 'ReviewPackageAnnotationResponseItem';

// ── Work Queue Items (§7.5) ─────────────────────────────────────────

export type ConstraintsWorkQueueItemType =
  | 'RiskOverdue'
  | 'ConstraintOverdue'
  | 'ConstraintCritical'
  | 'DelayNotificationDue'
  | 'DelayDispositionRequired'
  | 'ChangeEventApprovalPending'
  | 'ReviewPackageAnnotationResponse';

// ── Health Spine Metrics (§7.5) ─────────────────────────────────────

export type ConstraintsHealthMetricName =
  | 'openRiskCount'
  | 'highRiskCount'
  | 'openConstraintCount'
  | 'overdueConstraintCount'
  | 'criticalConstraintCount'
  | 'openDelayCount'
  | 'criticalPathDelayCount'
  | 'totalQuantifiedDelayDays'
  | 'openChangeEventCount'
  | 'pendingApprovalCostImpact'
  | 'totalApprovedCostImpact';

// ── Report Types (§7.6) ─────────────────────────────────────────────

export type ConstraintsReportType =
  | 'RiskRegisterReport'
  | 'ConstraintLogReport'
  | 'DelayLogReport'
  | 'ChangeEventLogReport'
  | 'CrossLedgerSummaryReport'
  | 'ReviewPackageExport';

// ── State Source ─────────────────────────────────────────────────────

export type IntegrationStateSource =
  | 'Live'
  | 'Published'
  | 'Async'
  | 'Offline';
