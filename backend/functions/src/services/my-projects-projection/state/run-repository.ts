/**
 * My Projects projection — run ledger repository.
 *
 * Table: `MyProjectsProjectionRuns`. PartitionKey: `'MyProjectsProjection'`.
 * RowKey: `Run:{StartedAtUtc}:{RunId}` (lexicographic-descending by ISO time).
 *
 * Run lifecycle: `start` (create with Status='running') →
 * `finalize` (replace/merge with terminal Status + counts).
 *
 * Sanitization: `Notes` strings are scrubbed before persistence — Bearer
 * tokens, JWT-shaped runs, and long base64-url fragments are replaced with
 * `[REDACTED]`. Closed-set failure codes carry the diagnostic payload
 * separately. No raw token / clientState material ever lands in this table.
 */

import { type TableClient, type TableEntity } from '@azure/data-tables';
import {
  PROJECTION_STATE_PARTITION_KEY,
  projectionRunRowKey,
  type IProjectionRunEntity,
} from '../projection-state-entities.js';
import type {
  ProjectionRunStatus,
  ProjectionRunType,
  SourceListKind,
} from '../projection-types.js';
import {
  PROJECTION_DEFAULT_RUNS_TABLE,
  createProjectionTableClient,
  ensureProjectionTable,
} from './projection-table-client-factory.js';

const NOTES_MAX_LENGTH = 4000;

const TOKEN_SHAPED_PATTERNS: readonly RegExp[] = [
  /Bearer\s+[A-Za-z0-9._+/=-]+/gi,
  /eyJ[A-Za-z0-9._-]{20,}/g,
  /[A-Za-z0-9_-]{40,}/g,
];

export function sanitizeProjectionRunNotes(value: string | undefined): string | undefined {
  if (typeof value !== 'string' || value.length === 0) return undefined;
  let scrubbed = value;
  for (const pattern of TOKEN_SHAPED_PATTERNS) {
    scrubbed = scrubbed.replace(pattern, '[REDACTED]');
  }
  if (scrubbed.length > NOTES_MAX_LENGTH) {
    scrubbed = `${scrubbed.slice(0, NOTES_MAX_LENGTH)}…`;
  }
  return scrubbed;
}

interface IRunCounts {
  ChangedItemCount?: number;
  DeletedItemCount?: number;
  HelperRowsInserted?: number;
  HelperRowsUpdated?: number;
  HelperRowsReactivated?: number;
  HelperRowsDeactivated?: number;
  HelperRowsPurged?: number;
  DriftMissingCount?: number;
  DriftExtraCount?: number;
  DriftContentMismatchCount?: number;
}

interface IRunTableEntity {
  partitionKey: string;
  rowKey: string;
  RunId: string;
  RunType: ProjectionRunType;
  StartedAtUtc: string;
  CompletedAtUtc: string;
  Status: ProjectionRunStatus;
  SourceListKind: string;
  ProjectionBatchId: string;
  ChangedItemCount: number;
  DeletedItemCount: number;
  HelperRowsInserted: number;
  HelperRowsUpdated: number;
  HelperRowsReactivated: number;
  HelperRowsDeactivated: number;
  HelperRowsPurged: number;
  DriftMissingCount: number;
  DriftExtraCount: number;
  DriftContentMismatchCount: number;
  FailureCode: string;
  Notes: string;
}

function emptyToUndefined(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  return value.length === 0 ? undefined : value;
}

function deserialize(record: Record<string, unknown>): IProjectionRunEntity {
  const rowKey = String(record.rowKey);
  return {
    partitionKey: PROJECTION_STATE_PARTITION_KEY,
    rowKey,
    RunId: String(record.RunId ?? ''),
    RunType: String(record.RunType) as ProjectionRunType,
    StartedAtUtc: String(record.StartedAtUtc ?? ''),
    CompletedAtUtc: emptyToUndefined(record.CompletedAtUtc),
    Status: String(record.Status) as ProjectionRunStatus,
    SourceListKind: emptyToUndefined(record.SourceListKind) as SourceListKind | undefined,
    ProjectionBatchId: emptyToUndefined(record.ProjectionBatchId),
    ChangedItemCount: numberOrUndefined(record.ChangedItemCount),
    DeletedItemCount: numberOrUndefined(record.DeletedItemCount),
    HelperRowsInserted: numberOrUndefined(record.HelperRowsInserted),
    HelperRowsUpdated: numberOrUndefined(record.HelperRowsUpdated),
    HelperRowsReactivated: numberOrUndefined(record.HelperRowsReactivated),
    HelperRowsDeactivated: numberOrUndefined(record.HelperRowsDeactivated),
    HelperRowsPurged: numberOrUndefined(record.HelperRowsPurged),
    DriftMissingCount: numberOrUndefined(record.DriftMissingCount),
    DriftExtraCount: numberOrUndefined(record.DriftExtraCount),
    DriftContentMismatchCount: numberOrUndefined(record.DriftContentMismatchCount),
    FailureCode: emptyToUndefined(record.FailureCode),
    Notes: emptyToUndefined(record.Notes),
  };
}

function numberOrUndefined(value: unknown): number | undefined {
  if (typeof value !== 'number' || Number.isNaN(value)) return undefined;
  return value;
}

function serializeStart(args: {
  rowKey: string;
  runId: string;
  runType: ProjectionRunType;
  startedAtUtc: string;
  sourceListKind?: SourceListKind;
  projectionBatchId?: string;
}): IRunTableEntity {
  return {
    partitionKey: PROJECTION_STATE_PARTITION_KEY,
    rowKey: args.rowKey,
    RunId: args.runId,
    RunType: args.runType,
    StartedAtUtc: args.startedAtUtc,
    CompletedAtUtc: '',
    Status: 'running',
    SourceListKind: args.sourceListKind ?? '',
    ProjectionBatchId: args.projectionBatchId ?? '',
    ChangedItemCount: 0,
    DeletedItemCount: 0,
    HelperRowsInserted: 0,
    HelperRowsUpdated: 0,
    HelperRowsReactivated: 0,
    HelperRowsDeactivated: 0,
    HelperRowsPurged: 0,
    DriftMissingCount: 0,
    DriftExtraCount: 0,
    DriftContentMismatchCount: 0,
    FailureCode: '',
    Notes: '',
  };
}

export interface IProjectionRunStartArgs {
  readonly runId: string;
  readonly runType: ProjectionRunType;
  readonly startedAtUtc: string;
  readonly sourceListKind?: SourceListKind;
  readonly projectionBatchId?: string;
}

export interface IProjectionRunFinalizeArgs {
  readonly rowKey: string;
  readonly status: ProjectionRunStatus;
  readonly completedAtUtc: string;
  readonly counts?: IRunCounts;
  readonly failureCode?: string;
  readonly notes?: string;
}

export interface IProjectionRunListArgs {
  readonly runType?: ProjectionRunType;
  readonly sourceListKind?: SourceListKind;
  readonly limit: number;
}

export class ProjectionRunRepository {
  private readonly client: TableClient;
  private tableEnsured = false;

  constructor(opts: { client?: TableClient; tableName?: string } = {}) {
    this.client =
      opts.client ?? createProjectionTableClient(opts.tableName ?? PROJECTION_DEFAULT_RUNS_TABLE);
  }

  private async ensureTable(): Promise<void> {
    if (this.tableEnsured) return;
    await ensureProjectionTable(this.client);
    this.tableEnsured = true;
  }

  async start(args: IProjectionRunStartArgs): Promise<{ rowKey: string }> {
    await this.ensureTable();
    const rowKey = projectionRunRowKey(args.startedAtUtc, args.runId);
    const entity = serializeStart({ ...args, rowKey });
    await this.client.createEntity(entity as TableEntity<IRunTableEntity>);
    return { rowKey };
  }

  async finalize(args: IProjectionRunFinalizeArgs): Promise<void> {
    await this.ensureTable();
    const merge: Partial<IRunTableEntity> & { partitionKey: string; rowKey: string } = {
      partitionKey: PROJECTION_STATE_PARTITION_KEY,
      rowKey: args.rowKey,
      Status: args.status,
      CompletedAtUtc: args.completedAtUtc,
      FailureCode: args.failureCode ?? '',
      Notes: sanitizeProjectionRunNotes(args.notes) ?? '',
    };
    if (args.counts !== undefined) {
      if (args.counts.ChangedItemCount !== undefined) {
        merge.ChangedItemCount = args.counts.ChangedItemCount;
      }
      if (args.counts.DeletedItemCount !== undefined) {
        merge.DeletedItemCount = args.counts.DeletedItemCount;
      }
      if (args.counts.HelperRowsInserted !== undefined) {
        merge.HelperRowsInserted = args.counts.HelperRowsInserted;
      }
      if (args.counts.HelperRowsUpdated !== undefined) {
        merge.HelperRowsUpdated = args.counts.HelperRowsUpdated;
      }
      if (args.counts.HelperRowsReactivated !== undefined) {
        merge.HelperRowsReactivated = args.counts.HelperRowsReactivated;
      }
      if (args.counts.HelperRowsDeactivated !== undefined) {
        merge.HelperRowsDeactivated = args.counts.HelperRowsDeactivated;
      }
      if (args.counts.HelperRowsPurged !== undefined) {
        merge.HelperRowsPurged = args.counts.HelperRowsPurged;
      }
      if (args.counts.DriftMissingCount !== undefined) {
        merge.DriftMissingCount = args.counts.DriftMissingCount;
      }
      if (args.counts.DriftExtraCount !== undefined) {
        merge.DriftExtraCount = args.counts.DriftExtraCount;
      }
      if (args.counts.DriftContentMismatchCount !== undefined) {
        merge.DriftContentMismatchCount = args.counts.DriftContentMismatchCount;
      }
    }
    await this.client.updateEntity<TableEntity<IRunTableEntity>>(
      merge as TableEntity<IRunTableEntity>,
      'Merge',
    );
  }

  async appendNotes(args: { rowKey: string; additionalNotes: string }): Promise<void> {
    await this.ensureTable();
    let record: Record<string, unknown>;
    try {
      record = await this.client.getEntity<Record<string, unknown>>(
        PROJECTION_STATE_PARTITION_KEY,
        args.rowKey,
      );
    } catch (err: unknown) {
      if ((err as { statusCode?: number }).statusCode === 404) return;
      throw err;
    }
    const existingNotes = emptyToUndefined(record.Notes) ?? '';
    const appended = `${existingNotes}${existingNotes.length === 0 ? '' : '\n'}${args.additionalNotes}`;
    const sanitized = sanitizeProjectionRunNotes(appended) ?? '';
    const merge: Partial<IRunTableEntity> & { partitionKey: string; rowKey: string } = {
      partitionKey: PROJECTION_STATE_PARTITION_KEY,
      rowKey: args.rowKey,
      Notes: sanitized,
    };
    await this.client.updateEntity<TableEntity<IRunTableEntity>>(
      merge as TableEntity<IRunTableEntity>,
      'Merge',
    );
  }

  async listRecent(args: IProjectionRunListArgs): Promise<IProjectionRunEntity[]> {
    if (args.limit <= 0 || !Number.isInteger(args.limit)) {
      throw new RangeError(
        `ProjectionRunRepository.listRecent: limit must be a positive integer (got ${args.limit}).`,
      );
    }
    await this.ensureTable();
    const collected: IProjectionRunEntity[] = [];
    const iterator = this.client.listEntities<Record<string, unknown>>({
      queryOptions: { filter: `PartitionKey eq '${PROJECTION_STATE_PARTITION_KEY}'` },
    });
    for await (const record of iterator) {
      const rowKey = String(record.rowKey);
      if (!rowKey.startsWith('Run:')) continue;
      const entity = deserialize(record);
      if (args.runType !== undefined && entity.RunType !== args.runType) continue;
      if (args.sourceListKind !== undefined && entity.SourceListKind !== args.sourceListKind) {
        continue;
      }
      collected.push(entity);
    }
    collected.sort((a, b) => (a.rowKey < b.rowKey ? 1 : a.rowKey > b.rowKey ? -1 : 0));
    return collected.slice(0, args.limit);
  }
}
