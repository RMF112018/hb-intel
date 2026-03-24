/**
 * P3-E7-T06 UX Surface enumerations.
 */

export type PermitViewSurface =
  | 'PermitListView'
  | 'PermitDetailView'
  | 'InspectionLog'
  | 'ComplianceDashboard'
  | 'ExecutiveReview';

export type PermitAnnotationType =
  | 'Note'
  | 'Flag'
  | 'Recommendation';

export type PermitReportType =
  | 'PermitStatusSummary'
  | 'ExpiringPermits'
  | 'OpenDeficiencyReport'
  | 'ClosedPermits'
  | 'StopWorkHistory'
  | 'InspectionOutcomesByType';

export type PermitQuickAction =
  | 'ViewDetail'
  | 'MarkInspectionResult'
  | 'LogDeficiency'
  | 'StartRenewal'
  | 'ExportPermitList';

export type PermitDetailSection =
  | 'Header'
  | 'IdentityAndDates'
  | 'JurisdictionContact'
  | 'PermitDetails'
  | 'Responsibility'
  | 'Thread'
  | 'RequiredInspections'
  | 'InspectionLog'
  | 'LifecycleHistory'
  | 'Evidence'
  | 'Annotations';

export type InlineDeficiencyAction =
  | 'Acknowledge'
  | 'StartRemediation'
  | 'MarkResolved'
  | 'Dispute'
  | 'AttachEvidence';
