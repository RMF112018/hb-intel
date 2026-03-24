/**
 * P3-E7-T06 UX Surface TypeScript contracts.
 */

import type { PermitAnnotationType, PermitDetailSection, PermitReportType, PermitViewSurface } from './enums.js';
import type { PermitHealthTier } from '../records/enums.js';

export interface IPermitListColumn {
  readonly columnKey: string;
  readonly source: string;
  readonly defaultVisible: boolean;
  readonly sortable: boolean;
  readonly filterable: boolean;
  readonly filterType: string | null;
}

export interface IPermitHealthIndicator {
  readonly tier: PermitHealthTier;
  readonly color: string;
  readonly icon: string;
  readonly listRowTreatment: string;
}

export interface IPermitDetailViewSection {
  readonly section: PermitDetailSection;
  readonly content: string;
}

export interface IPermitEditConstraint {
  readonly fieldGroup: string;
  readonly whoMayEdit: string;
}

export interface IInspectionLogColumn {
  readonly columnKey: string;
  readonly source: string;
}

export interface IDeficiencySubtableColumn {
  readonly columnKey: string;
  readonly source: string;
}

export interface IComplianceDashboardTile {
  readonly tileName: string;
  readonly metric: string;
  readonly source: string;
}

export interface IPermitReportConfig {
  readonly reportType: PermitReportType;
  readonly audience: string;
  readonly cadence: string;
}

export interface IPermitExportField {
  readonly fieldName: string;
  readonly source: string;
}

export interface IPermitAnnotationUxConfig {
  readonly annotationType: PermitAnnotationType;
  readonly indicator: string;
  readonly color: string;
}

export interface IPermitQuickActionConfig {
  readonly action: string;
  readonly permission: string;
  readonly triggers: string;
}
