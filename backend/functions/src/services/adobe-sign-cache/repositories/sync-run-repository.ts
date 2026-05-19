/**
 * My Dashboard | Adobe Sign cache — sync run ledger repository (B05.15 Prompt 04).
 *
 * Append-only operational ledger for refresh / subscription / reconciliation
 * runs. Read-side callers come later (Prompts 10, 12) for operator diagnostics;
 * this prompt locks the `append` contract so the worker spine (Prompts 08-09)
 * can build against it without churning the shape.
 *
 * @module services/adobe-sign-cache/repositories/sync-run-repository
 */

import { GraphListClient } from '../../legacy-fallback/graph-list-client.js';
import {
  ADOBE_SIGN_CACHE_REFRESH_SCOPES,
  ADOBE_SIGN_CACHE_SYNC_OUTCOMES,
  ADOBE_SIGN_CACHE_SYNC_RUN_TYPES,
  MY_DASHBOARD_ADOBE_SIGN_SYNC_RUNS_LIST_TITLE,
  type AdobeSignCacheRefreshScope,
  type AdobeSignCacheSyncOutcome,
  type AdobeSignCacheSyncRunType,
} from '../cache-list-descriptors.js';

export interface AdobeSignCacheSyncRunRecord {
  readonly runId: string;
  readonly correlationId?: string;
  readonly workItemId?: string;
  readonly runType: AdobeSignCacheSyncRunType;
  readonly refreshScope?: AdobeSignCacheRefreshScope;
  readonly adobeActorKey?: string;
  readonly userPrincipalNameNormalized?: string;
  readonly agreementId?: string;
  readonly subscriptionKey?: string;
  readonly startedUtc: string;
  readonly completedUtc?: string;
  readonly outcome: AdobeSignCacheSyncOutcome;
  readonly resultStage?: string;
  readonly providerCallsMade?: number;
  readonly sharePointReadsMade?: number;
  readonly sharePointWritesMade?: number;
  readonly rowsInserted?: number;
  readonly rowsUpdated?: number;
  readonly rowsSoftDeactivated?: number;
  readonly failureCode?: string;
  readonly failureSummary?: string;
}

export interface IAdobeSignCacheSyncRunRepository {
  append(record: AdobeSignCacheSyncRunRecord): Promise<{ readonly listItemId: number }>;
}

export interface IGraphAdobeSignCacheSyncRunRepositoryDeps {
  readonly graph: GraphListClient;
  readonly listTitle?: string;
}

function buildFieldsForWrite(record: AdobeSignCacheSyncRunRecord): Record<string, unknown> {
  return {
    RunId: record.runId,
    CorrelationId: record.correlationId ?? '',
    WorkItemId: record.workItemId ?? '',
    RunType: record.runType,
    RefreshScope: record.refreshScope ?? '',
    AdobeActorKey: record.adobeActorKey ?? '',
    UserPrincipalNameNormalized: record.userPrincipalNameNormalized ?? '',
    AgreementId: record.agreementId ?? '',
    SubscriptionKey: record.subscriptionKey ?? '',
    StartedUtc: record.startedUtc,
    CompletedUtc: record.completedUtc ?? '',
    Outcome: record.outcome,
    ResultStage: record.resultStage ?? '',
    ProviderCallsMade: record.providerCallsMade ?? 0,
    SharePointReadsMade: record.sharePointReadsMade ?? 0,
    SharePointWritesMade: record.sharePointWritesMade ?? 0,
    RowsInserted: record.rowsInserted ?? 0,
    RowsUpdated: record.rowsUpdated ?? 0,
    RowsSoftDeactivated: record.rowsSoftDeactivated ?? 0,
    FailureCode: record.failureCode ?? '',
    FailureSummary: record.failureSummary ?? '',
  };
}

function validateRecord(record: AdobeSignCacheSyncRunRecord): void {
  if (record.runId.length === 0) {
    throw new RangeError('AdobeSignCacheSyncRunRepository.append: runId must be non-empty.');
  }
  if (record.startedUtc.length === 0) {
    throw new RangeError('AdobeSignCacheSyncRunRepository.append: startedUtc must be non-empty.');
  }
  if (!(ADOBE_SIGN_CACHE_SYNC_RUN_TYPES as readonly string[]).includes(record.runType)) {
    throw new RangeError(
      `AdobeSignCacheSyncRunRepository.append: runType must be one of ${ADOBE_SIGN_CACHE_SYNC_RUN_TYPES.join(' | ')} (got ${record.runType}).`,
    );
  }
  if (!(ADOBE_SIGN_CACHE_SYNC_OUTCOMES as readonly string[]).includes(record.outcome)) {
    throw new RangeError(
      `AdobeSignCacheSyncRunRepository.append: outcome must be one of ${ADOBE_SIGN_CACHE_SYNC_OUTCOMES.join(' | ')} (got ${record.outcome}).`,
    );
  }
  if (
    record.refreshScope !== undefined &&
    !(ADOBE_SIGN_CACHE_REFRESH_SCOPES as readonly string[]).includes(record.refreshScope)
  ) {
    throw new RangeError(
      `AdobeSignCacheSyncRunRepository.append: refreshScope must be one of ${ADOBE_SIGN_CACHE_REFRESH_SCOPES.join(' | ')} (got ${record.refreshScope}).`,
    );
  }
}

export function createGraphAdobeSignCacheSyncRunRepository(
  deps: IGraphAdobeSignCacheSyncRunRepositoryDeps,
): IAdobeSignCacheSyncRunRepository {
  const listTitle = deps.listTitle ?? MY_DASHBOARD_ADOBE_SIGN_SYNC_RUNS_LIST_TITLE;
  const graph = deps.graph;

  return {
    async append(
      record: AdobeSignCacheSyncRunRecord,
    ): Promise<{ readonly listItemId: number }> {
      validateRecord(record);
      const created = await graph.addItem(listTitle, buildFieldsForWrite(record));
      return { listItemId: Number(created.id) };
    },
  };
}
