import { projectionRunRowKey, type IProjectionRunEntity } from '../projection-state-entities.js';
import type { ProjectionRunStatus, ProjectionRunType, SourceListKind } from '../projection-types.js';
import { MY_PROJECTS_PROJECTION_STORAGE_LIST_TITLES } from '../storage-list-descriptor.js';
import { SharePointStateStore } from './sharepoint-state-store.js';
import { sanitizeProjectionRunNotes, type IProjectionRunFinalizeArgs, type IProjectionRunListArgs, type IProjectionRunStartArgs } from './run-repository.js';

function empty(v: unknown): string | undefined {
  return typeof v === 'string' && v.length > 0 ? v : undefined;
}
function num(v: unknown): number | undefined {
  return typeof v === 'number' && Number.isFinite(v) ? v : undefined;
}

function toEntity(fields: Record<string, unknown>): IProjectionRunEntity {
  return {
    partitionKey: 'MyProjectsProjection',
    rowKey: String(fields.RunId ?? ''),
    RunId: String(fields.RunId ?? ''),
    RunType: String(fields.RunType ?? 'incremental') as ProjectionRunType,
    StartedAtUtc: String(fields.StartedAtUtc ?? ''),
    CompletedAtUtc: empty(fields.CompletedAtUtc),
    Status: String(fields.Status ?? 'running') as ProjectionRunStatus,
    SourceListKind: empty(fields.SourceListKind) as SourceListKind | undefined,
    ProjectionBatchId: empty(fields.ProjectionBatchId),
    ChangedItemCount: num(fields.ChangedItemCount),
    DeletedItemCount: num(fields.DeletedItemCount),
    HelperRowsInserted: num(fields.HelperRowsInserted),
    HelperRowsUpdated: num(fields.HelperRowsUpdated),
    HelperRowsReactivated: num(fields.HelperRowsReactivated),
    HelperRowsDeactivated: num(fields.HelperRowsDeactivated),
    HelperRowsPurged: num(fields.HelperRowsPurged),
    DriftMissingCount: num(fields.DriftMissingCount),
    DriftExtraCount: num(fields.DriftExtraCount),
    DriftContentMismatchCount: num(fields.DriftContentMismatchCount),
    FailureCode: empty(fields.FailureCode),
    Notes: empty(fields.Notes),
  };
}

export class SharePointProjectionRunRepository {
  private readonly store: SharePointStateStore;
  private readonly listTitle = MY_PROJECTS_PROJECTION_STORAGE_LIST_TITLES.runs;

  constructor(store: SharePointStateStore) {
    this.store = store;
  }

  async start(args: IProjectionRunStartArgs): Promise<{ rowKey: string }> {
    const rowKey = projectionRunRowKey(args.startedAtUtc, args.runId);
    await this.store.add({
      listTitle: this.listTitle,
      fields: {
        Title: args.runId,
        RunId: args.runId,
        RunType: args.runType,
        StartedAtUtc: args.startedAtUtc,
        Status: 'running',
        SourceListKind: args.sourceListKind ?? null,
        ProjectionBatchId: args.projectionBatchId ?? null,
      },
    });
    return { rowKey };
  }

  async finalize(args: IProjectionRunFinalizeArgs): Promise<void> {
    const runId = args.rowKey.split(':').pop() ?? '';
    const row = await this.store.getByTextField({ listTitle: this.listTitle, field: 'RunId', value: runId, select: ['RunId'] });
    if (!row) return;
    await this.store.update({
      listTitle: this.listTitle,
      itemId: row.id,
      fields: {
        Status: args.status,
        CompletedAtUtc: args.completedAtUtc,
        FailureCode: args.failureCode ?? null,
        Notes: sanitizeProjectionRunNotes(args.notes) ?? null,
        ...(args.counts ?? {}),
      },
    });
  }

  async appendNotes(args: { rowKey: string; additionalNotes: string }): Promise<void> {
    const runId = args.rowKey.split(':').pop() ?? '';
    const row = await this.store.getByTextField({ listTitle: this.listTitle, field: 'RunId', value: runId, select: ['RunId','Notes'] });
    if (!row) return;
    const current = typeof row.fields.Notes === 'string' ? row.fields.Notes : '';
    const appended = `${current}${current ? '\n' : ''}${args.additionalNotes}`;
    await this.store.update({
      listTitle: this.listTitle,
      itemId: row.id,
      fields: { Notes: sanitizeProjectionRunNotes(appended) ?? null },
    });
  }

  async listRecent(args: IProjectionRunListArgs): Promise<IProjectionRunEntity[]> {
    if (args.limit <= 0 || !Number.isInteger(args.limit)) throw new RangeError('limit must be a positive integer');
    const rows = await this.store.listByFilter({
      listTitle: this.listTitle,
      filter: "fields/RunId ne ''",
      select: ['RunId','RunType','StartedAtUtc','CompletedAtUtc','Status','SourceListKind','ProjectionBatchId','ChangedItemCount','DeletedItemCount','HelperRowsInserted','HelperRowsUpdated','HelperRowsReactivated','HelperRowsDeactivated','HelperRowsPurged','DriftMissingCount','DriftExtraCount','DriftContentMismatchCount','FailureCode','Notes'],
      top: 500,
    });
    const out = rows.map((r) => toEntity(r.fields)).filter((r) => {
      if (args.runType && r.RunType !== args.runType) return false;
      if (args.sourceListKind && r.SourceListKind !== args.sourceListKind) return false;
      return true;
    });
    out.sort((a, b) => (a.StartedAtUtc < b.StartedAtUtc ? 1 : -1));
    return out.slice(0, args.limit);
  }
}
