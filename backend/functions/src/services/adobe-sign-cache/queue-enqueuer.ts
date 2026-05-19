/**
 * My Dashboard | Adobe Sign cache — queue enqueuer (B05.15 Prompts 03 + 05).
 *
 * Producer-side seam consumed by:
 *   - the OAuth callback (`InitialHydration` + `EnsureUserWebhook`, Prompt 05)
 *   - the manual-refresh route (Prompt 05)
 *   - the public webhook receiver (Prompt 06)
 *   - the reconciliation scheduler (Prompt 08)
 *
 * Prompt 03 landed the interface, the validator, and the in-memory test
 * factory. Prompt 05 adds the concrete `@azure/storage-queue`-backed
 * adapter, a composition root that reads `process.env`, and an endpoint
 * resolver that prefers `AZURE_STORAGE_QUEUE_ENDPOINT` and falls back to
 * deriving the queue endpoint from `AZURE_TABLE_ENDPOINT` (same storage
 * account, sibling service).
 *
 * @module services/adobe-sign-cache/queue-enqueuer
 */

import { DefaultAzureCredential } from '@azure/identity';
import { QueueClient } from '@azure/storage-queue';

import {
  validateAdobeSignCacheWorkItem,
  type AdobeSignCacheWorkItem,
} from './queue-work-item-contract.js';

export interface AdobeSignCacheQueueEnqueueResult {
  readonly messageId: string;
  readonly insertedAtUtc: string;
}

export interface AdobeSignCacheQueueHealth {
  readonly ready: boolean;
  readonly reason?: string;
}

export interface IAdobeSignCacheQueueEnqueuer {
  /**
   * Enqueue a work item onto the `adobe-sign-cache-work-items` queue.
   *
   * Implementations MUST run the payload through
   * `validateAdobeSignCacheWorkItem` before serialization to guard against
   * accidental token / signing-URL leakage and shape drift.
   */
  enqueue(workItem: AdobeSignCacheWorkItem): Promise<AdobeSignCacheQueueEnqueueResult>;

  /**
   * Lightweight readiness probe. Returns `ready: false` with a closed reason
   * when the underlying queue is not yet configured / reachable. Callers
   * decide whether to fail-soft (e.g. webhook receiver acknowledges Adobe
   * but skips enqueue) or fail-hard.
   */
  health(): Promise<AdobeSignCacheQueueHealth>;
}

export interface InMemoryAdobeSignCacheQueueEnqueuer extends IAdobeSignCacheQueueEnqueuer {
  /** Captured payloads in enqueue order. */
  readonly items: readonly AdobeSignCacheWorkItem[];
  /** Test helper — clear captured items. */
  reset(): void;
}

export interface CreateInMemoryAdobeSignCacheQueueEnqueuerDeps {
  readonly now?: () => Date;
  readonly randomUUID?: () => string;
}

/**
 * Test-only in-memory enqueuer. Captures every successfully validated work
 * item; rejects payloads that fail `validateAdobeSignCacheWorkItem`. Mirrors
 * the behavior contract of the real adapter (validate-before-send) so unit
 * tests catch shape drift early.
 */
export function createInMemoryAdobeSignCacheQueueEnqueuer(
  deps: CreateInMemoryAdobeSignCacheQueueEnqueuerDeps = {},
): InMemoryAdobeSignCacheQueueEnqueuer {
  const items: AdobeSignCacheWorkItem[] = [];
  const now = deps.now ?? (() => new Date());
  const randomUUID = deps.randomUUID ?? (() => globalThis.crypto.randomUUID());

  return {
    items,
    async enqueue(workItem: AdobeSignCacheWorkItem): Promise<AdobeSignCacheQueueEnqueueResult> {
      const validated = validateAdobeSignCacheWorkItem(workItem);
      if (!validated.ok) {
        throw new Error(
          `InMemoryAdobeSignCacheQueueEnqueuer.enqueue: invalid work item — ${validated.reason}`,
        );
      }
      items.push(validated.workItem);
      return {
        messageId: randomUUID(),
        insertedAtUtc: now().toISOString(),
      };
    },
    async health(): Promise<AdobeSignCacheQueueHealth> {
      return { ready: true };
    },
    reset(): void {
      items.length = 0;
    },
  };
}

// ───────────────────────────────────────────────────────────────────────────
// Concrete `@azure/storage-queue` adapter (B05.15 Prompt 05)
// ───────────────────────────────────────────────────────────────────────────

/**
 * Subset of `@azure/storage-queue#QueueClient` used by the adapter.
 * Tests inject a stub satisfying this minimal surface — the real
 * `QueueClient` from the SDK satisfies it structurally.
 */
export interface IAdobeSignCacheQueueClient {
  sendMessage(
    messageText: string,
    options?: unknown,
  ): Promise<{ messageId?: string; insertedOn?: Date }>;
  exists?(): Promise<boolean>;
}

export interface CreateAzureStorageQueueAdobeSignCacheEnqueuerDeps {
  readonly queueClient: IAdobeSignCacheQueueClient;
  readonly queueName: string;
  readonly now?: () => Date;
}

/**
 * Production enqueuer. Validates the payload (defense-in-depth against
 * prohibited-field leakage even though callers validate via
 * `buildAdobeSignCacheWorkItem`), serializes to JSON, base64-encodes (the
 * Azure Functions queue trigger expects base64-by-default), and calls
 * `queueClient.sendMessage`. The SDK response yields `messageId` +
 * `insertedOn`; both are passed through to the caller.
 */
export function createAzureStorageQueueAdobeSignCacheEnqueuer(
  deps: CreateAzureStorageQueueAdobeSignCacheEnqueuerDeps,
): IAdobeSignCacheQueueEnqueuer {
  const now = deps.now ?? (() => new Date());
  return {
    async enqueue(workItem: AdobeSignCacheWorkItem): Promise<AdobeSignCacheQueueEnqueueResult> {
      const validated = validateAdobeSignCacheWorkItem(workItem);
      if (!validated.ok) {
        throw new Error(
          `AzureStorageQueueAdobeSignCacheEnqueuer.enqueue: invalid work item — ${validated.reason}`,
        );
      }
      const payload = JSON.stringify(validated.workItem);
      const messageText = Buffer.from(payload, 'utf8').toString('base64');
      const response = await deps.queueClient.sendMessage(messageText);
      const messageId =
        typeof response?.messageId === 'string' && response.messageId.length > 0
          ? response.messageId
          : '';
      const insertedAtUtc =
        response?.insertedOn instanceof Date
          ? response.insertedOn.toISOString()
          : now().toISOString();
      if (!messageId) {
        throw new Error(
          'AzureStorageQueueAdobeSignCacheEnqueuer.enqueue: SDK response did not include messageId',
        );
      }
      return { messageId, insertedAtUtc };
    },
    async health(): Promise<AdobeSignCacheQueueHealth> {
      if (typeof deps.queueClient.exists !== 'function') {
        // Without an `exists` probe we can't ascertain readiness; treat as
        // best-effort ready and let the first `sendMessage` failure surface.
        return { ready: true };
      }
      try {
        const exists = await deps.queueClient.exists();
        return exists
          ? { ready: true }
          : { ready: false, reason: 'queue-not-found' };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { ready: false, reason: `health-probe-failed:${message}` };
      }
    },
  };
}

// ───────────────────────────────────────────────────────────────────────────
// Endpoint resolution + composition root
// ───────────────────────────────────────────────────────────────────────────

export type EnvLike = Readonly<Record<string, string | undefined>>;

/**
 * Resolve the queue service endpoint URL.
 *
 * - Prefer explicit `AZURE_STORAGE_QUEUE_ENDPOINT` (e.g.
 *   `https://hbintelstorage.queue.core.windows.net/`).
 * - Otherwise derive from `AZURE_TABLE_ENDPOINT` by swapping the
 *   `.table.` subdomain to `.queue.` (same storage account, sibling
 *   service — the canonical Azure URL pattern).
 * - Return `undefined` when neither is resolvable.
 */
export function resolveAdobeSignCacheQueueEndpoint(env: EnvLike): string | undefined {
  const explicit = env.AZURE_STORAGE_QUEUE_ENDPOINT?.trim();
  if (explicit !== undefined && explicit.length > 0) return explicit;
  const tableEndpoint = env.AZURE_TABLE_ENDPOINT?.trim();
  if (tableEndpoint === undefined || tableEndpoint.length === 0) return undefined;
  try {
    const url = new URL(tableEndpoint);
    if (!url.hostname.includes('.table.')) return undefined;
    url.hostname = url.hostname.replace('.table.', '.queue.');
    return url.toString();
  } catch {
    return undefined;
  }
}

export type AdobeSignCacheQueueEnqueuerCompositionReason =
  | 'queue-endpoint-not-configured'
  | 'queue-name-not-configured';

export type AdobeSignCacheQueueEnqueuerComposition =
  | {
      readonly status: 'ready';
      readonly enqueuer: IAdobeSignCacheQueueEnqueuer;
      readonly queueName: string;
      readonly queueEndpoint: string;
    }
  | {
      readonly status: 'configuration-required';
      readonly reason: AdobeSignCacheQueueEnqueuerCompositionReason;
    };

export interface ComposeAdobeSignCacheQueueEnqueuerOptions {
  /** Override the SDK client factory (tests inject an `IAdobeSignCacheQueueClient` stub). */
  readonly buildQueueClient?: (input: {
    readonly endpoint: string;
    readonly queueName: string;
  }) => IAdobeSignCacheQueueClient;
  readonly now?: () => Date;
}

/**
 * Production composition root. Reads `ADOBE_SIGN_CACHE_QUEUE_NAME` +
 * `resolveAdobeSignCacheQueueEndpoint(env)`, constructs a `QueueClient`
 * using `DefaultAzureCredential`, and wraps it in the Azure Storage
 * Queue adapter. Callers degrade gracefully when this returns
 * `configuration-required`.
 */
export function composeAdobeSignCacheQueueEnqueuer(
  env: EnvLike,
  options: ComposeAdobeSignCacheQueueEnqueuerOptions = {},
): AdobeSignCacheQueueEnqueuerComposition {
  const queueName = env.ADOBE_SIGN_CACHE_QUEUE_NAME?.trim();
  if (queueName === undefined || queueName.length === 0) {
    return { status: 'configuration-required', reason: 'queue-name-not-configured' };
  }
  const endpoint = resolveAdobeSignCacheQueueEndpoint(env);
  if (endpoint === undefined) {
    return { status: 'configuration-required', reason: 'queue-endpoint-not-configured' };
  }
  const queueClient =
    options.buildQueueClient !== undefined
      ? options.buildQueueClient({ endpoint, queueName })
      : (new QueueClient(
          new URL(queueName, endpoint.endsWith('/') ? endpoint : `${endpoint}/`).toString(),
          new DefaultAzureCredential(),
        ) as unknown as IAdobeSignCacheQueueClient);
  const enqueuer = createAzureStorageQueueAdobeSignCacheEnqueuer({
    queueClient,
    queueName,
    now: options.now,
  });
  return { status: 'ready', enqueuer, queueName, queueEndpoint: endpoint };
}
