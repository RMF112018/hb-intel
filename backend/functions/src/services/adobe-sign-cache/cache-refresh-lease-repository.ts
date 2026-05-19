/**
 * My Dashboard | Adobe Sign cache — refresh-lease repository (B05.15 Prompt 03).
 *
 * Table: `AdobeSignCacheRefreshLeases`.
 *   PartitionKey = adobeActorKey (high cardinality)
 *   RowKey       = `agreementId | "__USER_WIDE__" | "__WEBHOOK_SUBSCRIPTION__"`
 *
 * Prevents overlapping refresh operations from corrupting cache state per
 * package §5.5.2. Optimistic concurrency mirrors
 * `services/my-projects-projection/state/lease-repository.ts:107–276`:
 *
 *   - cold (entity absent)        → createEntity (409 → conflict)
 *   - expired or same-owner       → updateEntity('Replace', { etag })
 *   - active and other-owner      → conflict
 *
 * TTL (10 minutes per package §5.5.2) is supplied by the caller via
 * `ttlMs`. The repository never reads config — keeping it pure and
 * test-friendly.
 *
 * @module services/adobe-sign-cache/cache-refresh-lease-repository
 */

import type { TableClient, TableEntity } from '@azure/data-tables';

export const ADOBE_SIGN_CACHE_LEASE_SCOPES = [
  'AgreementTargeted',
  'UserWide',
  'WebhookSubscription',
] as const;

export type AdobeSignCacheLeaseScope = (typeof ADOBE_SIGN_CACHE_LEASE_SCOPES)[number];

export const ADOBE_SIGN_CACHE_LEASE_USER_WIDE_ROW_KEY = '__USER_WIDE__';
export const ADOBE_SIGN_CACHE_LEASE_WEBHOOK_SUBSCRIPTION_ROW_KEY = '__WEBHOOK_SUBSCRIPTION__';

export interface AdobeSignCacheLeaseRecord {
  readonly adobeActorKey: string;
  readonly rowKey: string;
  readonly leaseOwnerWorkItemId: string;
  readonly leaseAcquiredUtc: string;
  readonly leaseExpiresUtc: string;
  readonly leaseScope: AdobeSignCacheLeaseScope;
}

export type AdobeSignCacheLeaseAcquireOutcome =
  | { readonly status: 'acquired'; readonly leaseExpiresUtc: string }
  | {
      readonly status: 'conflict';
      readonly reason: 'active-other-owner' | 'race';
      readonly activeLeaseOwnerWorkItemId?: string;
      readonly leaseExpiresUtc?: string;
    };

export type AdobeSignCacheLeaseRenewOutcome =
  | { readonly status: 'renewed'; readonly leaseExpiresUtc: string }
  | { readonly status: 'not-renewed'; readonly reason: 'missing' | 'other-owner' | 'race' };

export type AdobeSignCacheLeaseReleaseOutcome = { readonly released: boolean };

interface LeaseTableEntity {
  partitionKey: string;
  rowKey: string;
  LeaseOwnerWorkItemId: string;
  LeaseAcquiredUtc: string;
  LeaseExpiresUtc: string;
  LeaseScope: AdobeSignCacheLeaseScope;
}

/**
 * Compose the lease row key. Throws when `AgreementTargeted` is requested
 * without an `agreementId` (caller error — the package locks one lease per
 * agreement, never an "agreement-targeted but unspecified" lease).
 */
export function composeAdobeSignCacheLeaseRowKey(
  scope: AdobeSignCacheLeaseScope,
  agreementId?: string,
): string {
  switch (scope) {
    case 'AgreementTargeted': {
      if (agreementId === undefined || agreementId.length === 0) {
        throw new RangeError(
          'composeAdobeSignCacheLeaseRowKey: AgreementTargeted lease requires a non-empty agreementId.',
        );
      }
      return agreementId;
    }
    case 'UserWide':
      return ADOBE_SIGN_CACHE_LEASE_USER_WIDE_ROW_KEY;
    case 'WebhookSubscription':
      return ADOBE_SIGN_CACHE_LEASE_WEBHOOK_SUBSCRIPTION_ROW_KEY;
  }
}

function deserialize(record: Record<string, unknown>): AdobeSignCacheLeaseRecord {
  return {
    adobeActorKey: String(record.partitionKey ?? ''),
    rowKey: String(record.rowKey ?? ''),
    leaseOwnerWorkItemId: String(record.LeaseOwnerWorkItemId ?? ''),
    leaseAcquiredUtc: String(record.LeaseAcquiredUtc ?? ''),
    leaseExpiresUtc: String(record.LeaseExpiresUtc ?? ''),
    leaseScope: String(record.LeaseScope ?? '') as AdobeSignCacheLeaseScope,
  };
}

function computeExpiresUtc(now: Date, ttlMs: number): string {
  return new Date(now.getTime() + ttlMs).toISOString();
}

export interface TryAcquireLeaseArgs {
  readonly adobeActorKey: string;
  readonly leaseScope: AdobeSignCacheLeaseScope;
  readonly agreementId?: string;
  readonly workItemId: string;
  readonly ttlMs: number;
}

export interface RenewLeaseArgs {
  readonly adobeActorKey: string;
  readonly leaseScope: AdobeSignCacheLeaseScope;
  readonly agreementId?: string;
  readonly workItemId: string;
  readonly ttlMs: number;
}

export interface ReleaseLeaseArgs {
  readonly adobeActorKey: string;
  readonly leaseScope: AdobeSignCacheLeaseScope;
  readonly agreementId?: string;
  readonly workItemId: string;
}

function validateLeaseArgs(args: {
  adobeActorKey: string;
  workItemId: string;
  ttlMs?: number;
}): void {
  if (args.adobeActorKey.length === 0) {
    throw new RangeError('AdobeSignCacheRefreshLeaseRepository: adobeActorKey must be non-empty.');
  }
  if (args.workItemId.length === 0) {
    throw new RangeError('AdobeSignCacheRefreshLeaseRepository: workItemId must be non-empty.');
  }
  if (args.ttlMs !== undefined && (args.ttlMs <= 0 || !Number.isFinite(args.ttlMs))) {
    throw new RangeError(
      `AdobeSignCacheRefreshLeaseRepository: ttlMs must be a positive finite number (got ${args.ttlMs}).`,
    );
  }
}

export class AdobeSignCacheRefreshLeaseRepository {
  private readonly client: TableClient;
  private readonly now: () => Date;

  constructor(opts: { client: TableClient; now?: () => Date }) {
    this.client = opts.client;
    this.now = opts.now ?? (() => new Date());
  }

  /**
   * Read the current lease for the addressed row, or null when absent.
   * Expired leases are returned as-is (the caller decides whether expiry
   * is benign or load-bearing); the `tryAcquire` path treats expiry as
   * a green light, while `release` checks owner regardless of expiry.
   */
  async get(input: {
    readonly adobeActorKey: string;
    readonly leaseScope: AdobeSignCacheLeaseScope;
    readonly agreementId?: string;
  }): Promise<AdobeSignCacheLeaseRecord | null> {
    const rowKey = composeAdobeSignCacheLeaseRowKey(input.leaseScope, input.agreementId);
    try {
      const record = await this.client.getEntity<Record<string, unknown>>(
        input.adobeActorKey,
        rowKey,
      );
      return deserialize(record);
    } catch (err: unknown) {
      if ((err as { statusCode?: number }).statusCode === 404) return null;
      throw err;
    }
  }

  async tryAcquire(args: TryAcquireLeaseArgs): Promise<AdobeSignCacheLeaseAcquireOutcome> {
    validateLeaseArgs(args);
    const rowKey = composeAdobeSignCacheLeaseRowKey(args.leaseScope, args.agreementId);
    const now = this.now();
    const nowUtc = now.toISOString();
    const leaseExpiresUtc = computeExpiresUtc(now, args.ttlMs);

    let existing: Record<string, unknown> | null = null;
    let existingEtag: string | undefined;
    try {
      const fetched = await this.client.getEntity<Record<string, unknown>>(
        args.adobeActorKey,
        rowKey,
      );
      existing = fetched;
      existingEtag = (fetched as { etag?: string }).etag;
    } catch (err: unknown) {
      if ((err as { statusCode?: number }).statusCode !== 404) throw err;
    }

    if (existing === null) {
      const entity: LeaseTableEntity = {
        partitionKey: args.adobeActorKey,
        rowKey,
        LeaseOwnerWorkItemId: args.workItemId,
        LeaseAcquiredUtc: nowUtc,
        LeaseExpiresUtc: leaseExpiresUtc,
        LeaseScope: args.leaseScope,
      };
      try {
        await this.client.createEntity(entity as TableEntity<LeaseTableEntity>);
        return { status: 'acquired', leaseExpiresUtc };
      } catch (err: unknown) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 409) return { status: 'conflict', reason: 'race' };
        throw err;
      }
    }

    const existingRecord = deserialize(existing);
    const existingExpiresMs = Date.parse(existingRecord.leaseExpiresUtc);
    const isExpired =
      !Number.isFinite(existingExpiresMs) || now.getTime() >= existingExpiresMs;
    if (!isExpired && existingRecord.leaseOwnerWorkItemId !== args.workItemId) {
      return {
        status: 'conflict',
        reason: 'active-other-owner',
        activeLeaseOwnerWorkItemId: existingRecord.leaseOwnerWorkItemId,
        leaseExpiresUtc: existingRecord.leaseExpiresUtc,
      };
    }

    const next: LeaseTableEntity = {
      partitionKey: args.adobeActorKey,
      rowKey,
      LeaseOwnerWorkItemId: args.workItemId,
      LeaseAcquiredUtc: nowUtc,
      LeaseExpiresUtc: leaseExpiresUtc,
      LeaseScope: args.leaseScope,
    };
    try {
      await this.client.updateEntity<TableEntity<LeaseTableEntity>>(
        next as TableEntity<LeaseTableEntity>,
        'Replace',
        existingEtag !== undefined ? { etag: existingEtag } : undefined,
      );
      return { status: 'acquired', leaseExpiresUtc };
    } catch (err: unknown) {
      const status = (err as { statusCode?: number }).statusCode;
      if (status === 412 || status === 409) return { status: 'conflict', reason: 'race' };
      throw err;
    }
  }

  async renew(args: RenewLeaseArgs): Promise<AdobeSignCacheLeaseRenewOutcome> {
    validateLeaseArgs(args);
    const rowKey = composeAdobeSignCacheLeaseRowKey(args.leaseScope, args.agreementId);
    let record: Record<string, unknown>;
    try {
      record = await this.client.getEntity<Record<string, unknown>>(args.adobeActorKey, rowKey);
    } catch (err: unknown) {
      if ((err as { statusCode?: number }).statusCode === 404) {
        return { status: 'not-renewed', reason: 'missing' };
      }
      throw err;
    }
    const existing = deserialize(record);
    if (existing.leaseOwnerWorkItemId !== args.workItemId) {
      return { status: 'not-renewed', reason: 'other-owner' };
    }
    const etag = (record as { etag?: string }).etag;
    const now = this.now();
    const leaseExpiresUtc = computeExpiresUtc(now, args.ttlMs);
    const next: LeaseTableEntity = {
      partitionKey: args.adobeActorKey,
      rowKey,
      LeaseOwnerWorkItemId: existing.leaseOwnerWorkItemId,
      LeaseAcquiredUtc: existing.leaseAcquiredUtc,
      LeaseExpiresUtc: leaseExpiresUtc,
      LeaseScope: existing.leaseScope,
    };
    try {
      await this.client.updateEntity<TableEntity<LeaseTableEntity>>(
        next as TableEntity<LeaseTableEntity>,
        'Replace',
        etag !== undefined ? { etag } : undefined,
      );
      return { status: 'renewed', leaseExpiresUtc };
    } catch (err: unknown) {
      const status = (err as { statusCode?: number }).statusCode;
      if (status === 412 || status === 409) return { status: 'not-renewed', reason: 'race' };
      throw err;
    }
  }

  async release(args: ReleaseLeaseArgs): Promise<AdobeSignCacheLeaseReleaseOutcome> {
    validateLeaseArgs({ adobeActorKey: args.adobeActorKey, workItemId: args.workItemId });
    const rowKey = composeAdobeSignCacheLeaseRowKey(args.leaseScope, args.agreementId);
    let record: Record<string, unknown>;
    try {
      record = await this.client.getEntity<Record<string, unknown>>(args.adobeActorKey, rowKey);
    } catch (err: unknown) {
      if ((err as { statusCode?: number }).statusCode === 404) return { released: false };
      throw err;
    }
    const existing = deserialize(record);
    if (existing.leaseOwnerWorkItemId !== args.workItemId) return { released: false };
    try {
      await this.client.deleteEntity(args.adobeActorKey, rowKey, {
        etag: (record as { etag?: string }).etag,
      });
      return { released: true };
    } catch (err: unknown) {
      const status = (err as { statusCode?: number }).statusCode;
      if (status === 404 || status === 409 || status === 412) return { released: false };
      throw err;
    }
  }
}
