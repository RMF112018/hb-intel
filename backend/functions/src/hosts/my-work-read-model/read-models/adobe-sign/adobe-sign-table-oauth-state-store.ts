/**
 * Adobe Sign OAuth state store — durable Azure Table adapter.
 *
 * Implements the existing `IAdobeSignOAuthStateStore` interface against
 * Azure Table Storage. Two boundary guarantees beyond the in-memory mock:
 *
 *   1. **Raw `stateValue` is never persisted.** Rows are keyed by
 *      SHA-256(`stateValue`) → base64url. The unhashed value lives only
 *      in the caller's request flow (issued at /start, echoed back to
 *      /callback by Adobe).
 *   2. **Single-use is enforced by ETag-bound update.** On `take`, the
 *      row is read with its current ETag, and the `consumed` transition
 *      is applied via `updateEntity(..., { etag })`. Two concurrent
 *      callbacks for the same state cannot both observe `'valid'` — the
 *      losing race observes `'consumed'`.
 *
 * RestErrors are mapped to `{ outcome: 'store-unavailable' }` with a
 * closed-enum reason so route handlers do not leak vendor strings.
 *
 * @module hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-table-oauth-state-store
 */

import { createHash } from 'node:crypto';

import { TableClient, type TableEntity } from '@azure/data-tables';

import type { AdobeSignActorKey } from './adobe-sign-actor-normalizer.js';
import { classifyOAuthStateAtConsume } from './adobe-sign-oauth-state.js';
import type { AdobeSignOAuthStateRecord } from './adobe-sign-oauth-state.js';
import type {
  AdobeSignOAuthStateTakeResult,
  IAdobeSignOAuthStateStore,
} from './adobe-sign-oauth-state-store.js';

export const ADOBE_SIGN_OAUTH_STATE_TABLE = 'AdobeSignOAuthState' as const;
export const ADOBE_SIGN_OAUTH_STATE_PARTITION = 'oauth-state' as const;

interface OAuthStateEntity {
  actorKey: AdobeSignActorKey;
  returnPath: string;
  createdAtUtc: string;
  expiresAtUtc: string;
  consumedAtUtc?: string;
}

function hashStateValue(stateValue: string): string {
  return createHash('sha256').update(stateValue, 'utf8').digest('base64url');
}

function reasonForRestError(err: unknown): 'transient' | 'auth' | 'unknown' {
  const status = (err as { statusCode?: number }).statusCode;
  if (status === 401 || status === 403) return 'auth';
  if (typeof status === 'number' && status >= 500) return 'transient';
  return 'unknown';
}

export class TableAdobeSignOAuthStateStore implements IAdobeSignOAuthStateStore {
  private tableEnsured = false;

  constructor(private readonly client: TableClient) {}

  async put(record: AdobeSignOAuthStateRecord): Promise<void> {
    await this.ensureTable();
    const rowKey = hashStateValue(record.stateValue);
    await this.client.createEntity<TableEntity<OAuthStateEntity>>({
      partitionKey: ADOBE_SIGN_OAUTH_STATE_PARTITION,
      rowKey,
      actorKey: record.actorKey,
      returnPath: record.returnPath,
      createdAtUtc: record.createdAtUtc,
      expiresAtUtc: record.expiresAtUtc,
    });
  }

  async take(stateValue: string, now: Date): Promise<AdobeSignOAuthStateTakeResult> {
    await this.ensureTable().catch(() => undefined);
    const rowKey = hashStateValue(stateValue);
    let entity: TableEntity<OAuthStateEntity>;
    try {
      entity = await this.client.getEntity<TableEntity<OAuthStateEntity>>(
        ADOBE_SIGN_OAUTH_STATE_PARTITION,
        rowKey,
      );
    } catch (err: unknown) {
      const status = (err as { statusCode?: number }).statusCode;
      if (status === 404) return { outcome: 'missing' };
      return { outcome: 'store-unavailable', reason: reasonForRestError(err) };
    }

    const record: AdobeSignOAuthStateRecord = {
      stateValue,
      actorKey: entity.actorKey,
      returnPath: entity.returnPath,
      createdAtUtc: entity.createdAtUtc,
      expiresAtUtc: entity.expiresAtUtc,
      ...(entity.consumedAtUtc !== undefined ? { consumedAtUtc: entity.consumedAtUtc } : {}),
    };

    const verdict = classifyOAuthStateAtConsume(record, now);
    if (verdict === 'consumed') return { outcome: 'consumed' };
    if (verdict === 'expired') {
      // Best-effort cleanup of the expired row.
      try {
        await this.client.deleteEntity(ADOBE_SIGN_OAUTH_STATE_PARTITION, rowKey);
      } catch {
        // ignore — the row will be picked up by future cleanup
      }
      return { outcome: 'expired' };
    }

    const etag = (entity as TableEntity<OAuthStateEntity> & { etag?: string }).etag;
    try {
      await this.client.updateEntity<TableEntity<OAuthStateEntity>>(
        {
          partitionKey: ADOBE_SIGN_OAUTH_STATE_PARTITION,
          rowKey,
          actorKey: entity.actorKey,
          returnPath: entity.returnPath,
          createdAtUtc: entity.createdAtUtc,
          expiresAtUtc: entity.expiresAtUtc,
          consumedAtUtc: now.toISOString(),
        },
        'Replace',
        etag !== undefined ? { etag } : undefined,
      );
    } catch (err: unknown) {
      const status = (err as { statusCode?: number }).statusCode;
      if (status === 412 || status === 409) {
        // Lost the ETag race; another callback already consumed it.
        return { outcome: 'consumed' };
      }
      return { outcome: 'store-unavailable', reason: reasonForRestError(err) };
    }

    return { outcome: 'valid', record };
  }

  private async ensureTable(): Promise<void> {
    if (this.tableEnsured) return;
    try {
      await this.client.createTable();
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code !== 'TableAlreadyExists') throw err;
    }
    this.tableEnsured = true;
  }
}
