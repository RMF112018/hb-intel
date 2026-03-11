/// <reference types="vitest/globals" />
import 'fake-indexeddb/auto';
import { SyncEngine } from '../sync/SyncEngine.js';
import { enqueue, listPending, markAttempt } from '../db/QueueStore.js';
import { closeSessionDb, resetSessionDbPromise } from '../db/SessionDb.js';
import type { IQueuedOperation, OperationExecutor } from '../types/index.js';
import { SYNC_BACKOFF_BASE_MS, SYNC_BACKOFF_MAX_MS, SESSION_DB_NAME } from '../constants/index.js';

/** Flush microtasks / fake-indexeddb task queue */
function flushAsync(ms = 50): Promise<void> {
  return vi.advanceTimersByTimeAsync(ms);
}

// Helper to create test operations
async function seedOp(
  overrides: Partial<Parameters<typeof enqueue>[0]> = {},
): Promise<IQueuedOperation> {
  const op = await enqueue({
    type: 'api-mutation',
    target: '/api/test',
    payload: { data: 'test' },
    ...overrides,
  });
  return op!;
}

describe('SyncEngine', () => {
  let engine: SyncEngine;
  let executor: ReturnType<typeof vi.fn<OperationExecutor>>;

  beforeEach(() => {
    // shouldAdvanceTime lets fake-indexeddb's internal setTimeout(0) fire
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.stubGlobal('navigator', { onLine: true });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response()));
    executor = vi.fn<OperationExecutor>().mockResolvedValue(undefined);
  });

  afterEach(async () => {
    engine?.dispose();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    await closeSessionDb();
    resetSessionDbPromise();
    // Delete the database so no state leaks between tests
    indexedDB.deleteDatabase(SESSION_DB_NAME);
  });

  it('processQueue calls executor for each pending item and removes them', async () => {
    const op1 = await seedOp({ target: '/api/1' });
    const op2 = await seedOp({ target: '/api/2' });
    engine = new SyncEngine({ executor });

    await engine.processQueue();

    expect(executor).toHaveBeenCalledTimes(2);
    expect(executor).toHaveBeenCalledWith(expect.objectContaining({ operationId: op1.operationId }));
    expect(executor).toHaveBeenCalledWith(expect.objectContaining({ operationId: op2.operationId }));

    const remaining = await listPending();
    expect(remaining).toHaveLength(0);
  });

  it('processQueue increments retry on executor failure', async () => {
    const op = await seedOp();
    executor.mockRejectedValueOnce(new Error('transient'));
    engine = new SyncEngine({ executor });

    await engine.processQueue();

    const pending = await listPending();
    expect(pending).toHaveLength(1);
    expect(pending[0].retryCount).toBe(1);
    expect(pending[0].lastError).toBe('transient');
  });

  it('processQueue marks failed when retries exhausted', async () => {
    await enqueue({
      type: 'api-mutation',
      target: '/api/test',
      payload: {},
      maxRetries: 1,
    });
    executor.mockRejectedValueOnce(new Error('permanent'));
    engine = new SyncEngine({ executor });

    await engine.processQueue();

    const pending = await listPending();
    expect(pending).toHaveLength(0); // retryCount === maxRetries → filtered out
  });

  it('processQueue applies exponential backoff delay', async () => {
    // Seed an op then simulate 2 prior failures
    const op = await seedOp();
    await markAttempt(op.operationId, 'err1');
    await markAttempt(op.operationId, 'err2');

    engine = new SyncEngine({ executor });

    const delaySpy = vi.spyOn(globalThis, 'setTimeout');
    const processPromise = engine.processQueue();

    // The backoff for retryCount=2 should be min(1000 * 2^2, 60000) = 4000ms
    await vi.advanceTimersByTimeAsync(SYNC_BACKOFF_BASE_MS * Math.pow(2, 2) + 100);
    await processPromise;

    const backoffCalls = delaySpy.mock.calls.filter(
      (call) => typeof call[1] === 'number' && call[1] >= SYNC_BACKOFF_BASE_MS,
    );
    expect(backoffCalls.length).toBeGreaterThanOrEqual(1);
    for (const call of backoffCalls) {
      expect(call[1]).toBeLessThanOrEqual(SYNC_BACKOFF_MAX_MS);
    }
  });

  it('processQueue is re-entrant safe (processing lock)', async () => {
    await seedOp();
    let resolveExecutor!: () => void;
    executor.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          resolveExecutor = resolve;
        }),
    );
    engine = new SyncEngine({ executor });

    const first = engine.processQueue();
    // Let listPending + executor invocation proceed
    await flushAsync();
    const second = engine.processQueue(); // should bail — processing lock held

    resolveExecutor();
    await first;
    await second;

    expect(executor).toHaveBeenCalledTimes(1);
  });

  it('triggerSync is no-op when offline', async () => {
    vi.stubGlobal('navigator', { onLine: false });
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    await seedOp();
    engine = new SyncEngine({ executor });

    await engine.triggerSync();

    expect(executor).not.toHaveBeenCalled();
  });

  it('triggerSync calls processQueue when online', async () => {
    await seedOp();
    engine = new SyncEngine({ executor });

    await engine.triggerSync();

    expect(executor).toHaveBeenCalledTimes(1);
  });

  it('triggerSync calls processQueue when degraded', async () => {
    const slowFetch = vi.fn().mockImplementation(
      () =>
        new Promise<Response>((resolve) => {
          setTimeout(() => resolve(new Response()), 3000);
        }),
    );
    vi.stubGlobal('fetch', slowFetch);

    await seedOp();
    engine = new SyncEngine({ executor, probeUrl: 'https://probe.test/health' });

    const syncPromise = engine.triggerSync();
    await vi.advanceTimersByTimeAsync(3100);
    await syncPromise;

    expect(executor).toHaveBeenCalledTimes(1);
  });

  it('registerBackgroundSync no-ops without service worker', async () => {
    vi.stubGlobal('navigator', { onLine: true });
    engine = new SyncEngine({ executor });

    await expect(engine.registerBackgroundSync()).resolves.toBeUndefined();
  });

  it('registerBackgroundSync registers sync tag when available', async () => {
    const registerSpy = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', {
      onLine: true,
      serviceWorker: {
        ready: Promise.resolve({
          sync: { register: registerSpy },
        }),
      },
    });
    engine = new SyncEngine({ executor });

    await engine.registerBackgroundSync();

    expect(registerSpy).toHaveBeenCalledWith('hbc-session-sync');
  });

  it('startPolling / stopPolling lifecycle', async () => {
    await seedOp();
    engine = new SyncEngine({ executor });

    engine.startPolling(1000);

    await vi.advanceTimersByTimeAsync(1100);
    expect(executor).toHaveBeenCalled();

    const callCount = executor.mock.calls.length;
    engine.stopPolling();

    await vi.advanceTimersByTimeAsync(2000);
    expect(executor.mock.calls.length).toBe(callCount);
  });

  it('dispose cleans up everything', () => {
    engine = new SyncEngine({ executor, pollIntervalMs: 5000 });
    const removeListenerSpy = vi.spyOn(window, 'removeEventListener');

    engine.dispose();

    expect(removeListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
    expect(removeListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));
  });

  it('auto-triggers sync on connectivity recovery (offline → online)', async () => {
    vi.stubGlobal('navigator', { onLine: false });
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    await seedOp();
    engine = new SyncEngine({ executor });

    // Simulate coming back online
    vi.stubGlobal('navigator', { onLine: true });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response()));

    window.dispatchEvent(new Event('online'));

    await vi.advanceTimersByTimeAsync(100);

    expect(executor).toHaveBeenCalled();
  });

  it('processes items in createdAt order', async () => {
    const executionOrder: string[] = [];
    executor.mockImplementation(async (op: IQueuedOperation) => {
      executionOrder.push(op.target);
    });

    await seedOp({ target: '/api/first' });
    await seedOp({ target: '/api/second' });
    await seedOp({ target: '/api/third' });

    engine = new SyncEngine({ executor });
    await engine.processQueue();

    expect(executionOrder).toEqual(['/api/first', '/api/second', '/api/third']);
  });
});
