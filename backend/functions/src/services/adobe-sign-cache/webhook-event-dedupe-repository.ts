/**
 * My Dashboard | Adobe Sign cache — webhook event dedupe repository
 * (B05.15 Prompt 03).
 *
 * Table: `AdobeSignWebhookEventDedupe`.
 *   PartitionKey = subscriptionKey
 *   RowKey       = dedupe key (providerEventId or SHA-256 fallback)
 *
 * Application-enforced 14-day TTL via `ExpiresUtc`. First-event-wins
 * semantics via `createEntity` 409-conflict trap, mirroring the
 * idempotency-storage-service pattern.
 *
 * The retention timer in Prompt 10 calls `deleteExpired(now)` to purge rows
 * whose `ExpiresUtc` has passed.
 *
 * @module services/adobe-sign-cache/webhook-event-dedupe-repository
 */

import type { TableClient, TableEntity } from '@azure/data-tables';

import { createAppTableClient } from '../../utils/table-client-factory.js';
import {
  ADOBE_SIGN_CACHE_TUNING_DEFAULTS,
  resolveAdobeSignCacheConfigReadiness,
} from '../../hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-cache-config.js';

export interface AdobeSignWebhookEventDedupeRecord {
  readonly subscriptionKey: string;
  readonly dedupeKey: string;
  readonly createdUtc: string;
  readonly expiresUtc: string;
  readonly providerEventType?: string;
  readonly agreementId?: string;
  readonly bodyHashSha256?: string;
}

export interface TryReserveDedupeReservation {
  readonly subscriptionKey: string;
  readonly dedupeKey: string;
  readonly providerEventType?: string;
  readonly agreementId?: string;
  readonly bodyHashSha256?: string;
  readonly ttlDays: number;
}

export type AdobeSignWebhookEventDedupeReserveOutcome = 'reserved' | 'duplicate';

interface DedupeTableEntity {
  partitionKey: string;
  rowKey: string;
  CreatedUtc: string;
  ExpiresUtc: string;
  ProviderEventType: string;
  AgreementId: string;
  BodyHashSha256: string;
}

function emptyToUndefined(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  return value.length === 0 ? undefined : value;
}

function deserialize(record: Record<string, unknown>): AdobeSignWebhookEventDedupeRecord {
  return {
    subscriptionKey: String(record.partitionKey ?? ''),
    dedupeKey: String(record.rowKey ?? ''),
    createdUtc: String(record.CreatedUtc ?? ''),
    expiresUtc: String(record.ExpiresUtc ?? ''),
    providerEventType: emptyToUndefined(record.ProviderEventType),
    agreementId: emptyToUndefined(record.AgreementId),
    bodyHashSha256: emptyToUndefined(record.BodyHashSha256),
  };
}

function computeExpiresUtc(now: Date, ttlDays: number): string {
  return new Date(now.getTime() + ttlDays * 24 * 60 * 60 * 1000).toISOString();
}

export class AdobeSignWebhookEventDedupeRepository {
  private readonly client: TableClient;
  private readonly now: () => Date;

  constructor(opts: { client: TableClient; now?: () => Date }) {
    this.client = opts.client;
    this.now = opts.now ?? (() => new Date());
  }

  /**
   * Attempt to reserve the dedupe key. Returns `'reserved'` on first write
   * (Adobe event seen for the first time) and `'duplicate'` on subsequent
   * writes for the same `(subscriptionKey, dedupeKey)` (Azure Tables 409
   * collision). Callers MUST NOT enqueue refresh work when this returns
   * `'duplicate'`.
   */
  async tryReserve(
    reservation: TryReserveDedupeReservation,
  ): Promise<AdobeSignWebhookEventDedupeReserveOutcome> {
    if (!Number.isFinite(reservation.ttlDays) || reservation.ttlDays <= 0) {
      throw new RangeError(
        `AdobeSignWebhookEventDedupeRepository.tryReserve: ttlDays must be a positive finite number (got ${reservation.ttlDays}).`,
      );
    }
    if (reservation.subscriptionKey.length === 0 || reservation.dedupeKey.length === 0) {
      throw new RangeError(
        'AdobeSignWebhookEventDedupeRepository.tryReserve: subscriptionKey and dedupeKey must be non-empty.',
      );
    }
    const now = this.now();
    const entity: DedupeTableEntity = {
      partitionKey: reservation.subscriptionKey,
      rowKey: reservation.dedupeKey,
      CreatedUtc: now.toISOString(),
      ExpiresUtc: computeExpiresUtc(now, reservation.ttlDays),
      ProviderEventType: reservation.providerEventType ?? '',
      AgreementId: reservation.agreementId ?? '',
      BodyHashSha256: reservation.bodyHashSha256 ?? '',
    };
    try {
      await this.client.createEntity(entity as TableEntity<DedupeTableEntity>);
      return 'reserved';
    } catch (err: unknown) {
      const status = (err as { statusCode?: number }).statusCode;
      if (status === 409) return 'duplicate';
      throw err;
    }
  }

  /**
   * Look up the active reservation for the given key. Returns null when the
   * row is missing (404) OR when `ExpiresUtc <= now` — expired rows are
   * treated as absent regardless of whether the retention timer has purged
   * them yet (load-bearing: a webhook duplicate arriving after expiry should
   * be re-reserved, not silently skipped).
   */
  async findActive(input: {
    readonly subscriptionKey: string;
    readonly dedupeKey: string;
  }): Promise<AdobeSignWebhookEventDedupeRecord | null> {
    try {
      const record = await this.client.getEntity<Record<string, unknown>>(
        input.subscriptionKey,
        input.dedupeKey,
      );
      const deserialized = deserialize(record);
      const expiresMs = Date.parse(deserialized.expiresUtc);
      if (!Number.isFinite(expiresMs) || this.now().getTime() >= expiresMs) {
        return null;
      }
      return deserialized;
    } catch (err: unknown) {
      const status = (err as { statusCode?: number }).statusCode;
      if (status === 404) return null;
      throw err;
    }
  }

  /**
   * Delete every row whose `ExpiresUtc < now`. Returns the number of rows
   * deleted (for telemetry / runbook evidence). Daily retention timer
   * (Prompt 10) wires this up.
   */
  async deleteExpired(asOf?: Date): Promise<{ deleted: number }> {
    const cutoff = (asOf ?? this.now()).toISOString();
    const entities = this.client.listEntities<Record<string, unknown>>({
      queryOptions: { filter: `ExpiresUtc lt '${cutoff}'` },
    });
    let deleted = 0;
    const tasks: Promise<void>[] = [];
    for await (const record of entities) {
      const partitionKey = String(record.partitionKey ?? '');
      const rowKey = String(record.rowKey ?? '');
      if (partitionKey.length === 0 || rowKey.length === 0) continue;
      tasks.push(
        this.client.deleteEntity(partitionKey, rowKey).then(
          () => {
            deleted += 1;
          },
          (err: unknown) => {
            const status = (err as { statusCode?: number }).statusCode;
            // 404 race during cleanup is benign — row already gone.
            if (status !== 404) throw err;
          },
        ),
      );
    }
    await Promise.all(tasks);
    return { deleted };
  }
}

// ───────────────────────────────────────────────────────────────────────────
// Composition root (B05.15 Prompt 06)
// ───────────────────────────────────────────────────────────────────────────

export type EnvLike = Readonly<Record<string, string | undefined>>;

export type AdobeSignWebhookEventDedupeRepositoryCompositionReason =
  | 'table-endpoint-not-configured'
  | 'table-name-not-configured';

export type AdobeSignWebhookEventDedupeRepositoryComposition =
  | {
      readonly status: 'ready';
      readonly repository: AdobeSignWebhookEventDedupeRepository;
      readonly tableName: string;
      readonly retentionDays: number;
    }
  | {
      readonly status: 'configuration-required';
      readonly reason: AdobeSignWebhookEventDedupeRepositoryCompositionReason;
    };

export interface ComposeAdobeSignWebhookEventDedupeRepositoryOptions {
  /** Tests inject a stub `TableClient` to avoid real Azure resources. */
  readonly buildTableClient?: (tableName: string) => TableClient;
  readonly now?: () => Date;
}

/**
 * Production composition root. Reads `ADOBE_SIGN_WEBHOOK_DEDUPE_TABLE_NAME`
 * (required), confirms `AZURE_TABLE_ENDPOINT` (required), and resolves the
 * 14-day retention TTL from Prompt 01's cache-config readiness tuning
 * surface. Returns the composed `AdobeSignWebhookEventDedupeRepository`
 * along with the retention window so the receiver can pass `ttlDays` to
 * `tryReserve` without re-resolving config.
 */
export function composeAdobeSignWebhookEventDedupeRepository(
  env: EnvLike,
  options: ComposeAdobeSignWebhookEventDedupeRepositoryOptions = {},
): AdobeSignWebhookEventDedupeRepositoryComposition {
  const tableName = env.ADOBE_SIGN_WEBHOOK_DEDUPE_TABLE_NAME?.trim();
  if (tableName === undefined || tableName.length === 0) {
    return { status: 'configuration-required', reason: 'table-name-not-configured' };
  }
  const tableEndpoint = env.AZURE_TABLE_ENDPOINT?.trim();
  if (tableEndpoint === undefined || tableEndpoint.length === 0) {
    return { status: 'configuration-required', reason: 'table-endpoint-not-configured' };
  }
  const tuning = resolveAdobeSignCacheConfigReadiness(env).tuning;
  const retentionDays =
    tuning.ADOBE_SIGN_CACHE_DEDUPE_RETENTION_DAYS ??
    ADOBE_SIGN_CACHE_TUNING_DEFAULTS.ADOBE_SIGN_CACHE_DEDUPE_RETENTION_DAYS;
  const client =
    options.buildTableClient !== undefined
      ? options.buildTableClient(tableName)
      : createAppTableClient(tableName);
  const repository = new AdobeSignWebhookEventDedupeRepository({
    client,
    now: options.now,
  });
  return { status: 'ready', repository, tableName, retentionDays };
}
