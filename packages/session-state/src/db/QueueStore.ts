/**
 * QueueStore — Offline operation queue — SF12-T03, D-01/D-02
 */
import type { IQueuedOperation, QueuedOperationType } from '../types/index.js';
import { QUEUE_DEFAULT_MAX_RETRIES } from '../constants/index.js';
import { openSessionDb } from './SessionDb.js';

/**
 * Input shape for enqueuing a new operation.
 * Consumers supply only the business-relevant fields; IDs and timestamps are generated.
 */
export interface EnqueueInput {
  type: QueuedOperationType;
  target: string;
  payload: unknown;
  maxRetries?: number;
}

/**
 * Enqueues a new operation. Returns the created IQueuedOperation or null if IDB unavailable.
 */
export async function enqueue(input: EnqueueInput): Promise<IQueuedOperation | null> {
  const db = await openSessionDb();
  if (!db) return null;

  try {
    const operation: IQueuedOperation = {
      operationId: crypto.randomUUID(),
      type: input.type,
      target: input.target,
      payload: input.payload,
      retryCount: 0,
      maxRetries: input.maxRetries ?? QUEUE_DEFAULT_MAX_RETRIES,
      createdAt: new Date().toISOString(),
      lastAttemptAt: null,
      lastError: null,
    };
    await db.put('queue', operation);
    return operation;
    /* v8 ignore start */
  } catch (err) {
    console.warn('[session-state] enqueue failed:', err);
    return null;
  }
  /* v8 ignore stop */
}

/**
 * Lists all pending operations (retryCount < maxRetries) sorted by createdAt ASC.
 * Returns empty array if IDB unavailable.
 */
export async function listPending(): Promise<IQueuedOperation[]> {
  const db = await openSessionDb();
  if (!db) return [];

  try {
    const all = await db.getAllFromIndex('queue', 'createdAt');
    return all.filter((op) => op.retryCount < op.maxRetries);
    /* v8 ignore start */
  } catch (err) {
    console.warn('[session-state] listPending failed:', err);
    return [];
  }
  /* v8 ignore stop */
}

/**
 * Increments retryCount, sets lastAttemptAt and optionally lastError.
 * Returns the updated operation or null.
 */
export async function markAttempt(
  operationId: string,
  error?: string,
): Promise<IQueuedOperation | null> {
  const db = await openSessionDb();
  if (!db) return null;

  try {
    const op = await db.get('queue', operationId);
    if (!op) return null;

    const updated: IQueuedOperation = {
      ...op,
      retryCount: op.retryCount + 1,
      lastAttemptAt: new Date().toISOString(),
      lastError: error ?? null,
    };
    await db.put('queue', updated);
    return updated;
    /* v8 ignore start */
  } catch (err) {
    console.warn('[session-state] markAttempt failed:', err);
    return null;
  }
  /* v8 ignore stop */
}

/**
 * Removes an operation by ID. No-op if missing or IDB unavailable.
 */
export async function remove(operationId: string): Promise<void> {
  const db = await openSessionDb();
  if (!db) return;

  try {
    await db.delete('queue', operationId);
    /* v8 ignore start */
  } catch (err) {
    console.warn('[session-state] remove failed:', err);
  }
  /* v8 ignore stop */
}

/**
 * Marks an operation as permanently failed by setting retryCount = maxRetries.
 * The operation remains in the store for UI surfacing.
 */
export async function markFailed(
  operationId: string,
  lastError: string,
): Promise<IQueuedOperation | null> {
  const db = await openSessionDb();
  if (!db) return null;

  try {
    const op = await db.get('queue', operationId);
    if (!op) return null;

    const updated: IQueuedOperation = {
      ...op,
      retryCount: op.maxRetries,
      lastAttemptAt: new Date().toISOString(),
      lastError,
    };
    await db.put('queue', updated);
    return updated;
    /* v8 ignore start */
  } catch (err) {
    console.warn('[session-state] markFailed failed:', err);
    return null;
  }
  /* v8 ignore stop */
}
