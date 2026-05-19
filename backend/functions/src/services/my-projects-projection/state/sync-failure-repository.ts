import type { SourceListKind } from '../projection-types.js';
import { MY_PROJECTS_PROJECTION_STORAGE_LIST_TITLES } from '../storage-list-descriptor.js';
import { SharePointStateStore } from './sharepoint-state-store.js';

export type FailureClass =
  | 'subscription'
  | 'delta'
  | 'projection-write'
  | 'pending-work'
  | 'reconciliation'
  | 'provisioning'
  | 'configuration';

export class SyncFailureRepository {
  private readonly store: SharePointStateStore;
  private readonly listTitle = MY_PROJECTS_PROJECTION_STORAGE_LIST_TITLES.syncFailures;

  constructor(store: SharePointStateStore) {
    this.store = store;
  }

  async upsertFailure(args: {
    failureId: string;
    failureClass: FailureClass;
    failureCode: string;
    sourceListKind?: SourceListKind;
    relatedRunId?: string;
    relatedWorkKey?: string;
    sanitizedMessage?: string;
    atUtc: string;
  }): Promise<void> {
    const row = await this.store.getByTextField({
      listTitle: this.listTitle,
      field: 'FailureId',
      value: args.failureId,
      select: ['FailureId', 'AttemptCount', 'FirstSeenAtUtc'],
    });
    if (!row) {
      await this.store.add({
        listTitle: this.listTitle,
        fields: {
          Title: args.failureId,
          FailureId: args.failureId,
          FailureClass: args.failureClass,
          SourceListKind: args.sourceListKind ?? null,
          RelatedRunId: args.relatedRunId ?? null,
          RelatedWorkKey: args.relatedWorkKey ?? null,
          FailureCode: args.failureCode,
          FirstSeenAtUtc: args.atUtc,
          LastSeenAtUtc: args.atUtc,
          AttemptCount: 1,
          ResolutionStatus: 'open',
          LastSanitizedMessage: args.sanitizedMessage ?? null,
        },
      });
      return;
    }
    await this.store.update({
      listTitle: this.listTitle,
      itemId: row.id,
      fields: {
        LastSeenAtUtc: args.atUtc,
        AttemptCount: (typeof row.fields.AttemptCount === 'number' ? row.fields.AttemptCount : 1) + 1,
        FailureCode: args.failureCode,
        LastSanitizedMessage: args.sanitizedMessage ?? null,
      },
    });
  }
}
