export type ProjectHubBaselineReportKey =
  | 'px-review'
  | 'owner-report'
  | 'sub-scorecard'
  | 'lessons-learned';

export type ProjectHubReportsConsumability = 'yes' | 'partial' | 'no';

export interface IProjectHubBaselineReportFamily {
  readonly key: ProjectHubBaselineReportKey;
  readonly label: string;
  readonly purpose: string;
  readonly audience: string;
  readonly sourceModules: readonly string[];
  readonly currentStatus: string;
  readonly recommendedUsage: string;
  readonly blocker: string;
}

export interface IProjectHubReportModuleAuditRow {
  readonly module: string;
  readonly governingPlanFiles: readonly string[];
  readonly currentImplementationStatus: string;
  readonly reportSupportContract: string;
  readonly actualImplementationSeams: readonly string[];
  readonly canReportsConsumeToday: ProjectHubReportsConsumability;
  readonly gapOrBlocker: string;
  readonly recommendedBaselineUsage: string;
}

export interface IProjectHubReportsSummary {
  readonly baselineFamilyCount: number;
  readonly sourceModulesAudited: number;
  readonly partialSourceCount: number;
  readonly blockedSourceCount: number;
  readonly moduleLocalReportSurfaceCount: number;
  readonly closeoutArtifactFamilyCount: number;
  readonly qcFoundationRecordFamilyCount: number;
}
