import type { IProjectionDeltaStateEntity } from '../projection-state-entities.js';
import type { SourceListKind } from '../projection-types.js';
import { MY_PROJECTS_PROJECTION_STORAGE_LIST_TITLES } from '../storage-list-descriptor.js';
import { SharePointStateStore } from './sharepoint-state-store.js';
import {
  DeltaStateAlreadyInitializedError,
  DeltaStateConcurrencyError,
} from './delta-state-repository.js';

function readString(v: unknown): string | undefined {
  return typeof v === 'string' && v.length > 0 ? v : undefined;
}

function readNumber(v: unknown): number | undefined {
  return typeof v === 'number' && Number.isFinite(v) ? v : undefined;
}

function readBool(v: unknown): boolean {
  return v === true || v === 1 || v === '1' || v === 'true';
}

function toEntity(fields: Record<string, unknown>): IProjectionDeltaStateEntity {
  const sourceListKind = String(fields.SourceListKind) as SourceListKind;
  return {
    partitionKey: 'MyProjectsProjection',
    rowKey: `DeltaState:${sourceListKind}`,
    SourceListKind: sourceListKind,
    DeltaLink: readString(fields.DeltaLink),
    NeedsResync: readBool(fields.NeedsResync),
    LastDeltaPullStartedUtc: readString(fields.LastDeltaPullStartedUtc),
    LastDeltaPullSucceededUtc: readString(fields.LastDeltaPullSucceededUtc),
    LastDeltaPullFailedUtc: readString(fields.LastDeltaPullFailedUtc),
    LastFailureCode: readString(fields.LastFailureCode),
    LastChangedItemCount: readNumber(fields.LastChangedItemCount),
    LastDeletedItemCount: readNumber(fields.LastDeletedItemCount),
    LastProjectionBatchId: readString(fields.LastProjectionBatchId),
  };
}

export class ProjectionSourceSyncStateRepository {
  private readonly store: SharePointStateStore;
  private readonly listTitle = MY_PROJECTS_PROJECTION_STORAGE_LIST_TITLES.sourceSyncState;

  constructor(store: SharePointStateStore) {
    this.store = store;
  }

  async get(sourceListKind: SourceListKind): Promise<IProjectionDeltaStateEntity | null> {
    const row = await this.store.getByTextField({
      listTitle: this.listTitle,
      field: 'SourceListKind',
      value: sourceListKind,
      select: [
        'SourceListKind','DeltaLink','NeedsResync','LastDeltaPullStartedUtc','LastDeltaPullSucceededUtc',
        'LastDeltaPullFailedUtc','LastFailureCode','LastChangedItemCount','LastDeletedItemCount','LastProjectionBatchId','UpdatedAtUtc',
      ],
    });
    return row ? toEntity(row.fields) : null;
  }

  async getWithEtag(sourceListKind: SourceListKind): Promise<{ entity: IProjectionDeltaStateEntity; etag: string } | null> {
    const row = await this.store.getByTextField({
      listTitle: this.listTitle,
      field: 'SourceListKind',
      value: sourceListKind,
      select: [
        'SourceListKind','DeltaLink','NeedsResync','LastDeltaPullStartedUtc','LastDeltaPullSucceededUtc',
        'LastDeltaPullFailedUtc','LastFailureCode','LastChangedItemCount','LastDeletedItemCount','LastProjectionBatchId','UpdatedAtUtc',
      ],
    });
    if (!row) return null;
    const entity = toEntity(row.fields);
    return { entity, etag: String(row.fields.UpdatedAtUtc ?? '') };
  }

  async initializeBaseline(args: { sourceListKind: SourceListKind; deltaLink: string; batchId: string; atUtc: string }): Promise<void> {
    const existing = await this.get(args.sourceListKind);
    if (existing) throw new DeltaStateAlreadyInitializedError(args.sourceListKind);
    await this.store.add({
      listTitle: this.listTitle,
      fields: {
        Title: args.sourceListKind,
        SourceListKind: args.sourceListKind,
        DeltaLink: args.deltaLink,
        NeedsResync: false,
        LastDeltaPullSucceededUtc: args.atUtc,
        LastProjectionBatchId: args.batchId,
        LastChangedItemCount: 0,
        LastDeletedItemCount: 0,
        UpdatedAtUtc: args.atUtc,
      },
    });
  }

  private async guardedUpdate(
    sourceListKind: SourceListKind,
    expectedEtag: string,
    patch: Record<string, unknown>,
  ): Promise<void> {
    const row = await this.store.getByTextField({
      listTitle: this.listTitle,
      field: 'SourceListKind',
      value: sourceListKind,
      select: ['SourceListKind', 'UpdatedAtUtc'],
    });
    if (!row) throw new Error(`Delta state for source list '${sourceListKind}' is not initialized.`);
    const currentEtag = String(row.fields.UpdatedAtUtc ?? '');
    if (expectedEtag !== currentEtag) {
      const latest = await this.get(sourceListKind);
      throw new DeltaStateConcurrencyError(sourceListKind, latest as any);
    }
    await this.store.update({ listTitle: this.listTitle, itemId: row.id, fields: patch });
  }

  async advanceCheckpoint(args: { sourceListKind: SourceListKind; deltaLink: string; changedCount: number; deletedCount: number; batchId: string; atUtc: string; expectedEtag: string; }): Promise<void> {
    await this.guardedUpdate(args.sourceListKind, args.expectedEtag, {
      DeltaLink: args.deltaLink,
      NeedsResync: false,
      LastDeltaPullSucceededUtc: args.atUtc,
      LastChangedItemCount: args.changedCount,
      LastDeletedItemCount: args.deletedCount,
      LastProjectionBatchId: args.batchId,
      LastFailureCode: null,
      LastDeltaPullFailedUtc: null,
      UpdatedAtUtc: args.atUtc,
    });
  }

  async markFailure(args: { sourceListKind: SourceListKind; failureCode: string; atUtc: string; expectedEtag: string; }): Promise<void> {
    await this.guardedUpdate(args.sourceListKind, args.expectedEtag, {
      LastDeltaPullFailedUtc: args.atUtc,
      LastFailureCode: args.failureCode,
      UpdatedAtUtc: args.atUtc,
    });
  }

  async markNeedsResync(args: { sourceListKind: SourceListKind; failureCode: string; atUtc: string; expectedEtag: string; }): Promise<void> {
    await this.guardedUpdate(args.sourceListKind, args.expectedEtag, {
      NeedsResync: true,
      LastDeltaPullFailedUtc: args.atUtc,
      LastFailureCode: args.failureCode,
      UpdatedAtUtc: args.atUtc,
    });
  }

  async clearNeedsResync(args: { sourceListKind: SourceListKind; deltaLink: string; batchId: string; atUtc: string; expectedEtag: string; }): Promise<void> {
    await this.guardedUpdate(args.sourceListKind, args.expectedEtag, {
      NeedsResync: false,
      DeltaLink: args.deltaLink,
      LastProjectionBatchId: args.batchId,
      LastDeltaPullSucceededUtc: args.atUtc,
      LastFailureCode: null,
      LastDeltaPullFailedUtc: null,
      UpdatedAtUtc: args.atUtc,
    });
  }
}
