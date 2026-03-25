export type ProjectHubSpfxModuleSlug =
  | 'financial'
  | 'schedule'
  | 'constraints'
  | 'permits'
  | 'safety'
  | 'reports'
  | 'qc'
  | 'closeout'
  | 'startup'
  | 'subcontract-readiness'
  | 'warranty';

export type ProjectHubPwaModuleSlug =
  | ProjectHubSpfxModuleSlug
  | 'review';

export type ProjectHubSpfxLaneDepth =
  | 'required'
  | 'broad'
  | 'baseline-visible'
  | 'read-only';

export type ProjectHubSpfxPageLayout =
  | 'dashboard'
  | 'list'
  | 'detail';

export type ProjectHubSpfxPrimaryDataSurfaceType =
  | 'card-list-view'
  | 'dense-analysis-table'
  | 'responsive-hybrid'
  | 'summary-strip-kpi';

export type ProjectHubSpfxDensityTier =
  | 'compact'
  | 'comfortable'
  | 'touch';

export type ProjectHubSpfxEscalationScenarioId =
  | 'cross-project-navigation'
  | 'schedule-file-ingestion'
  | 'schedule-upload-history'
  | 'report-run-ledger-history'
  | 'advanced-draft-recovery'
  | 'multi-project-portfolio'
  | 'full-work-queue-feed'
  | 'full-activity-timeline'
  | 'advanced-canvas-admin'
  | 'personal-work-hub'
  | 'executive-review-thread-management'
  | 'multi-run-review-comparison'
  | 'full-executive-review-history';

export type ProjectHubSpfxEscalationPlacement =
  | 'dashboard'
  | 'module'
  | 'reports-review';

export interface ProjectHubSpfxEscalationScenario {
  readonly id: ProjectHubSpfxEscalationScenarioId;
  readonly label: string;
  readonly description: string;
  readonly placement: ProjectHubSpfxEscalationPlacement;
  readonly target:
    | 'project-hub-root'
    | 'project-hub-control-center'
    | 'project-hub-module'
    | 'project-activity'
    | 'my-work';
  readonly module?: ProjectHubPwaModuleSlug;
  readonly action?: string;
  readonly view?: string;
  readonly requiresProjectId: boolean;
  readonly requiresReturnTo?: boolean;
  readonly requiresReviewArtifactId?: boolean;
}

export interface ProjectHubSpfxLaunchAction {
  readonly scenarioId?: ProjectHubSpfxEscalationScenarioId;
  readonly label: string;
  readonly description: string;
  readonly module: ProjectHubPwaModuleSlug;
  readonly action?: string;
  readonly view?: string;
  readonly requiresReviewArtifactId?: boolean;
}

export interface ProjectHubSpfxModuleDefinition {
  readonly slug: ProjectHubSpfxModuleSlug;
  readonly navLabel: string;
  readonly title: string;
  readonly depth: ProjectHubSpfxLaneDepth;
  readonly pageLayout: ProjectHubSpfxPageLayout;
  readonly primaryDataSurfaceType: ProjectHubSpfxPrimaryDataSurfaceType;
  readonly summary: string;
  readonly spfxCapabilities: readonly string[];
  readonly pwaEscalations: readonly ProjectHubSpfxLaunchAction[];
  readonly note?: string;
}

export interface ProjectHubSpfxDashboardSurfaceDefinition {
  readonly id: 'summary-strip' | 'escalation-hub' | 'module-launchers';
  readonly label: string;
  readonly primaryDataSurfaceType: ProjectHubSpfxPrimaryDataSurfaceType;
}
