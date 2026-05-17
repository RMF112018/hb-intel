import type { ProjectionRunStatus, ProjectionRunType, SourceListKind } from './projection-types.js';

export type ProjectionAdminRebuildKind = 'seed' | 'full-rebuild' | 'source-rebuild';

export interface IProjectionAdminRebuildRequest {
  readonly rebuildKind: ProjectionAdminRebuildKind;
  readonly sourceListKind?: SourceListKind;
  readonly dryRun?: boolean;
  readonly notes?: string;
}

export interface IProjectionAdminRebuildResponse {
  readonly runId: string;
  readonly runType: ProjectionRunType;
  readonly status: ProjectionRunStatus;
  readonly startedAtUtc: string;
  readonly sourceListKind?: SourceListKind;
  readonly dryRun: boolean;
}
