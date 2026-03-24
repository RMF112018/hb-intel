/**
 * P3-E7-T06 UX Surface constants.
 */

import type {
  InlineDeficiencyAction, PermitAnnotationType, PermitDetailSection,
  PermitQuickAction, PermitReportType, PermitViewSurface,
} from './enums.js';
import type {
  IComplianceDashboardTile, IDeficiencySubtableColumn, IInspectionLogColumn,
  IPermitAnnotationUxConfig, IPermitDetailViewSection, IPermitEditConstraint,
  IPermitExportField, IPermitHealthIndicator, IPermitListColumn,
  IPermitQuickActionConfig, IPermitReportConfig,
} from './types.js';

export const VIEWS_SCOPE = 'permits/views' as const;

// ── Enum Arrays ─────────────────────────────────────────────────────

export const PERMIT_VIEW_SURFACES = [
  'PermitListView', 'PermitDetailView', 'InspectionLog', 'ComplianceDashboard', 'ExecutiveReview',
] as const satisfies ReadonlyArray<PermitViewSurface>;

export const PERMIT_ANNOTATION_TYPES = [
  'Note', 'Flag', 'Recommendation',
] as const satisfies ReadonlyArray<PermitAnnotationType>;

export const PERMIT_REPORT_TYPES = [
  'PermitStatusSummary', 'ExpiringPermits', 'OpenDeficiencyReport',
  'ClosedPermits', 'StopWorkHistory', 'InspectionOutcomesByType',
] as const satisfies ReadonlyArray<PermitReportType>;

export const PERMIT_QUICK_ACTIONS = [
  'ViewDetail', 'MarkInspectionResult', 'LogDeficiency', 'StartRenewal', 'ExportPermitList',
] as const satisfies ReadonlyArray<PermitQuickAction>;

export const PERMIT_DETAIL_SECTIONS = [
  'Header', 'IdentityAndDates', 'JurisdictionContact', 'PermitDetails', 'Responsibility',
  'Thread', 'RequiredInspections', 'InspectionLog', 'LifecycleHistory', 'Evidence', 'Annotations',
] as const satisfies ReadonlyArray<PermitDetailSection>;

export const INLINE_DEFICIENCY_ACTIONS = [
  'Acknowledge', 'StartRemediation', 'MarkResolved', 'Dispute', 'AttachEvidence',
] as const satisfies ReadonlyArray<InlineDeficiencyAction>;

// ── List View Columns (§2.1) ────────────────────────────────────────

export const PERMIT_LIST_COLUMNS: ReadonlyArray<IPermitListColumn> = [
  { columnKey: 'permitNumber', source: 'IssuedPermit.permitNumber', defaultVisible: true, sortable: true, filterable: true, filterType: null },
  { columnKey: 'type', source: 'IssuedPermit.permitType', defaultVisible: true, sortable: true, filterable: true, filterType: 'multi-select' },
  { columnKey: 'jurisdiction', source: 'IssuedPermit.jurisdictionName', defaultVisible: true, sortable: true, filterable: true, filterType: null },
  { columnKey: 'status', source: 'IssuedPermit.currentStatus', defaultVisible: true, sortable: true, filterable: true, filterType: 'multi-select' },
  { columnKey: 'health', source: 'IssuedPermit.derivedHealthTier', defaultVisible: true, sortable: true, filterable: true, filterType: null },
  { columnKey: 'expirationDate', source: 'IssuedPermit.expirationDate', defaultVisible: true, sortable: true, filterable: true, filterType: 'range' },
  { columnKey: 'daysToExpiration', source: 'IssuedPermit.daysToExpiration (calculated)', defaultVisible: true, sortable: true, filterable: false, filterType: null },
  { columnKey: 'expirationRisk', source: 'IssuedPermit.expirationRiskTier', defaultVisible: true, sortable: true, filterable: true, filterType: null },
  { columnKey: 'openDeficiencies', source: 'Derived from InspectionDeficiency', defaultVisible: true, sortable: true, filterable: false, filterType: null },
  { columnKey: 'thread', source: 'IssuedPermit.threadRelationshipType', defaultVisible: false, sortable: false, filterable: true, filterType: null },
  { columnKey: 'responsibleParty', source: 'IssuedPermit.currentResponsiblePartyId', defaultVisible: false, sortable: false, filterable: true, filterType: null },
  { columnKey: 'tags', source: 'IssuedPermit.tags', defaultVisible: false, sortable: false, filterable: true, filterType: 'multi-tag' },
];

// ── Health Indicators (§2.2) ────────────────────────────────────────

export const PERMIT_HEALTH_INDICATORS: ReadonlyArray<IPermitHealthIndicator> = [
  { tier: 'CRITICAL', color: 'Red', icon: 'stop', listRowTreatment: 'Bold row; pinned to top of sort' },
  { tier: 'AT_RISK', color: 'Amber', icon: 'warning', listRowTreatment: 'Standard row; secondary sort after CRITICAL' },
  { tier: 'NORMAL', color: 'Green', icon: 'check', listRowTreatment: 'Standard row' },
  { tier: 'CLOSED', color: 'Gray', icon: 'check', listRowTreatment: 'Muted row; collapsed by default' },
];

// ── Detail View Sections (§3.1) ─────────────────────────────────────

export const PERMIT_DETAIL_VIEW_SECTIONS: ReadonlyArray<IPermitDetailViewSection> = [
  { section: 'Header', content: 'Permit number, type, jurisdiction, status badge, health tier, next-move prompt' },
  { section: 'IdentityAndDates', content: 'Application date, issuance date, expiration date, renewal date, days to expiration' },
  { section: 'JurisdictionContact', content: 'Contact name, title, phone, email, address, office hours, portal URL' },
  { section: 'PermitDetails', content: 'Description, conditions, tags, fee amount, bond amount' },
  { section: 'Responsibility', content: 'Accountable role, responsible party, next action owner, escalation owner, watchers' },
  { section: 'Thread', content: 'Parent permit link, child permits list, thread relationship type' },
  { section: 'RequiredInspections', content: 'All checkpoint records; status, result, sequence; progress bar' },
  { section: 'InspectionLog', content: 'All visit records; chronological; expandable to show deficiencies' },
  { section: 'LifecycleHistory', content: 'All lifecycle action records; chronological audit trail' },
  { section: 'Evidence', content: 'All evidence records; upload new; view/download' },
  { section: 'Annotations', content: 'PER-surface only; all annotations; creation available to executives' },
];

// ── Edit Constraints (§3.4) ─────────────────────────────────────────

export const PERMIT_EDIT_CONSTRAINTS: ReadonlyArray<IPermitEditConstraint> = [
  { fieldGroup: 'Description, conditions, tags', whoMayEdit: 'Project Manager' },
  { fieldGroup: 'Jurisdiction contact', whoMayEdit: 'Project Manager' },
  { fieldGroup: 'Fee amount, bond amount', whoMayEdit: 'Project Manager' },
  { fieldGroup: 'Responsible party assignment', whoMayEdit: 'Project Manager' },
  { fieldGroup: 'Watcher list', whoMayEdit: 'PM, Site Supervisor' },
  { fieldGroup: 'Status', whoMayEdit: 'Via lifecycle action only (no direct edit)' },
  { fieldGroup: 'Thread relationships', whoMayEdit: 'Read-only after issuance' },
  { fieldGroup: 'Evidence', whoMayEdit: 'PM, Site Supervisor (upload); all roles (view)' },
];

// ── Quick Actions (§2.4) ────────────────────────────────────────────

export const PERMIT_QUICK_ACTION_CONFIGS: ReadonlyArray<IPermitQuickActionConfig> = [
  { action: 'View detail', permission: 'All roles', triggers: 'Navigate to Permit Detail View' },
  { action: 'Mark inspection result', permission: 'PM, Site Supervisor', triggers: 'Opens inspection result modal' },
  { action: 'Log deficiency', permission: 'PM, Site Supervisor', triggers: 'Opens deficiency creation modal' },
  { action: 'Start renewal', permission: 'PM', triggers: 'Creates RENEWAL_INITIATED lifecycle action' },
  { action: 'Export permit list', permission: 'All roles', triggers: 'CSV export of visible columns' },
];

// ── Compliance Dashboard Tiles (§5.1) ───────────────────────────────

export const COMPLIANCE_DASHBOARD_TILES: ReadonlyArray<IComplianceDashboardTile> = [
  { tileName: 'Active Permits', metric: 'activePermitCount', source: 'Health spine aggregate' },
  { tileName: 'Critical Permits', metric: 'criticalPermitCount', source: 'Health spine aggregate' },
  { tileName: 'Expiring ≤ 30 Days', metric: 'expiringWithin30DaysCount', source: 'Health spine aggregate' },
  { tileName: 'Stop Work Orders', metric: 'stopWorkPermitCount', source: 'Health spine aggregate' },
  { tileName: 'Open Deficiencies', metric: 'openDeficiencyCount', source: 'Live query' },
  { tileName: 'Closed This Month', metric: 'closedThisMonthCount', source: 'Live query' },
];

// ── Report Configs (§7.1) ───────────────────────────────────────────

export const PERMIT_REPORT_CONFIGS: ReadonlyArray<IPermitReportConfig> = [
  { reportType: 'PermitStatusSummary', audience: 'PM, Leadership', cadence: 'On-demand + weekly' },
  { reportType: 'ExpiringPermits', audience: 'PM', cadence: 'On-demand + weekly' },
  { reportType: 'OpenDeficiencyReport', audience: 'PM, Site Supervisor', cadence: 'On-demand + daily' },
  { reportType: 'ClosedPermits', audience: 'PM, Leadership', cadence: 'On-demand + monthly' },
  { reportType: 'StopWorkHistory', audience: 'PM, Leadership, Legal', cadence: 'On-demand' },
  { reportType: 'InspectionOutcomesByType', audience: 'PM, Leadership', cadence: 'On-demand + monthly' },
];

// ── Export Fields (§7.2) ────────────────────────────────────────────

export const PERMIT_EXPORT_FIELDS: ReadonlyArray<IPermitExportField> = [
  { fieldName: 'Permit Number', source: 'IssuedPermit.permitNumber' },
  { fieldName: 'Type', source: 'IssuedPermit.permitType' },
  { fieldName: 'Jurisdiction', source: 'IssuedPermit.jurisdictionName' },
  { fieldName: 'Current Status', source: 'IssuedPermit.currentStatus' },
  { fieldName: 'Health Tier', source: 'IssuedPermit.derivedHealthTier' },
  { fieldName: 'Expiration Date', source: 'IssuedPermit.expirationDate' },
  { fieldName: 'Days to Expiration', source: 'Calculated' },
  { fieldName: 'Expiration Risk', source: 'IssuedPermit.expirationRiskTier' },
  { fieldName: 'Open Deficiency Count', source: 'Derived' },
  { fieldName: 'Inspection Progress', source: 'passedCheckpointCount / totalBlockingCheckpointCount' },
  { fieldName: 'Responsible Party', source: 'Resolved from currentResponsiblePartyId' },
];

// ── Annotation UX (§6.2) ────────────────────────────────────────────

export const PERMIT_ANNOTATION_UX_CONFIGS: ReadonlyArray<IPermitAnnotationUxConfig> = [
  { annotationType: 'Note', indicator: 'info', color: 'blue' },
  { annotationType: 'Flag', indicator: 'flag', color: 'amber' },
  { annotationType: 'Recommendation', indicator: 'lightbulb', color: 'green' },
];
