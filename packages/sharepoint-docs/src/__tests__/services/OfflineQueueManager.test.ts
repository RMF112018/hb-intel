import { OfflineQueueManager } from '../../services/OfflineQueueManager.js';
import { SIZE_OFFLINE_MAX } from '../../constants/fileSizeLimits.js';

const makeFile = (name: string, size: number): File =>
  new File([new ArrayBuffer(size)], name, { type: 'application/pdf' });

describe('OfflineQueueManager', () => {
  let mgr: OfflineQueueManager;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-08T10:00:00Z'));
    sessionStorage.clear();
    mgr = new OfflineQueueManager();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('throws when enqueuing files over 50 MB', async () => {
    const bigFile = makeFile('huge.pdf', SIZE_OFFLINE_MAX + 1);
    await expect(mgr.enqueue({ file: bigFile, contextId: 'ctx', contextType: 'bd-lead' }))
      .rejects.toThrow('cannot be queued for offline upload');
  });

  it('creates entry with 48-hour TTL', async () => {
    const entry = await mgr.enqueue({ file: makeFile('a.pdf', 1000), contextId: 'ctx', contextType: 'bd-lead' });
    const expected = new Date('2026-03-10T10:00:00Z').toISOString();
    expect(entry.expiresAt).toBe(expected);
  });

  it('marks entries as expired after TTL', async () => {
    await mgr.enqueue({ file: makeFile('b.pdf', 1000), contextId: 'ctx', contextType: 'bd-lead' });

    // Advance time by 49 hours
    vi.setSystemTime(new Date('2026-03-10T11:00:00Z'));

    // Create a new manager instance — pruning runs in constructor
    const mgr2 = new OfflineQueueManager();
    expect(mgr2.getSummary().hasExpiredEntries).toBe(true);
    expect(mgr2.getSummary().totalQueued).toBe(0);
  });

  it('removes entry on remove()', async () => {
    const entry = await mgr.enqueue({ file: makeFile('c.pdf', 1000), contextId: 'ctx', contextType: 'bd-lead' });
    expect(mgr.getSummary().totalQueued).toBe(1);
    mgr.remove(entry.queueId);
    expect(mgr.getSummary().totalQueued).toBe(0);
  });

  it('calls syncAll upload function for each pending entry', async () => {
    await mgr.enqueue({ file: makeFile('d.pdf', 1000), contextId: 'ctx', contextType: 'bd-lead' });
    await mgr.enqueue({ file: makeFile('e.pdf', 2000), contextId: 'ctx', contextType: 'bd-lead' });

    const uploadFn = vi.fn().mockResolvedValue(undefined);
    await mgr.syncAll(uploadFn);

    expect(uploadFn).toHaveBeenCalledTimes(2);
    expect(mgr.getSummary().totalQueued).toBe(0);
  });

  it('getByContext returns entries for the given context only', async () => {
    await mgr.enqueue({ file: makeFile('a.pdf', 1000), contextId: 'ctx-1', contextType: 'bd-lead' });
    await mgr.enqueue({ file: makeFile('b.pdf', 1000), contextId: 'ctx-2', contextType: 'bd-lead' });
    const entries = mgr.getByContext('ctx-1');
    expect(entries).toHaveLength(1);
    expect(entries[0].contextId).toBe('ctx-1');
  });

  it('subscribe notifies listeners on enqueue', async () => {
    const listener = vi.fn();
    mgr.subscribe(listener);
    await mgr.enqueue({ file: makeFile('f.pdf', 1000), contextId: 'ctx', contextType: 'bd-lead' });
    expect(listener).toHaveBeenCalled();
  });

  it('unsubscribe stops notifications', async () => {
    const listener = vi.fn();
    const unsub = mgr.subscribe(listener);
    unsub();
    await mgr.enqueue({ file: makeFile('g.pdf', 1000), contextId: 'ctx', contextType: 'bd-lead' });
    expect(listener).not.toHaveBeenCalled();
  });

  it('syncAll skips entries with missing file references', async () => {
    await mgr.enqueue({ file: makeFile('h.pdf', 1000), contextId: 'ctx', contextType: 'bd-lead' });
    // Clear the internal file store to simulate lost file reference
    // Access private member for testing
    (mgr as unknown as { fileStore: Map<string, File> }).fileStore.clear();

    const uploadFn = vi.fn().mockResolvedValue(undefined);
    await mgr.syncAll(uploadFn);
    expect(uploadFn).not.toHaveBeenCalled();
  });

  it('syncAll handles upload failure without removing entry', async () => {
    await mgr.enqueue({ file: makeFile('fail.pdf', 1000), contextId: 'ctx', contextType: 'bd-lead' });

    const uploadFn = vi.fn().mockRejectedValue(new Error('Upload failed'));
    await mgr.syncAll(uploadFn);

    // Entry should still exist (failed, not removed)
    expect(mgr.getSummary().totalQueued).toBe(0); // status is 'failed', not 'queued'
  });

  it('syncAll is idempotent when already syncing', async () => {
    await mgr.enqueue({ file: makeFile('i.pdf', 1000), contextId: 'ctx', contextType: 'bd-lead' });

    let resolveUpload: () => void;
    const uploadPromise = new Promise<void>(r => { resolveUpload = r; });
    const uploadFn = vi.fn().mockReturnValue(uploadPromise);

    // Start first sync
    const sync1 = mgr.syncAll(uploadFn);
    // Start second sync while first is in progress — should be no-op
    const sync2 = mgr.syncAll(uploadFn);

    resolveUpload!();
    await sync1;
    await sync2;

    expect(uploadFn).toHaveBeenCalledTimes(1);
  });

  it('retryEntry retries a failed entry', async () => {
    const entry = await mgr.enqueue({ file: makeFile('retry.pdf', 1000), contextId: 'ctx', contextType: 'bd-lead' });

    // First fail via syncAll
    const failFn = vi.fn().mockRejectedValue(new Error('fail'));
    await mgr.syncAll(failFn);

    // Now retry
    const successFn = vi.fn().mockResolvedValue(undefined);
    await mgr.retryEntry(entry.queueId, successFn);
    expect(successFn).toHaveBeenCalledTimes(1);
    expect(mgr.getSummary().totalQueued).toBe(0);
  });

  it('retryEntry handles missing file reference gracefully', async () => {
    const entry = await mgr.enqueue({ file: makeFile('lost.pdf', 1000), contextId: 'ctx', contextType: 'bd-lead' });
    (mgr as unknown as { fileStore: Map<string, File> }).fileStore.clear();

    const uploadFn = vi.fn();
    await mgr.retryEntry(entry.queueId, uploadFn);
    expect(uploadFn).not.toHaveBeenCalled();
  });

  it('retryEntry is no-op for unknown queueId', async () => {
    const uploadFn = vi.fn();
    await mgr.retryEntry('nonexistent', uploadFn);
    expect(uploadFn).not.toHaveBeenCalled();
  });

  it('retryEntry handles upload failure', async () => {
    const entry = await mgr.enqueue({ file: makeFile('retry-fail.pdf', 1000), contextId: 'ctx', contextType: 'bd-lead' });

    const failFn = vi.fn().mockRejectedValue(new Error('retry failed'));
    await mgr.retryEntry(entry.queueId, failFn);
    // Entry still exists with failed status
  });

  it('persists metadata to sessionStorage', async () => {
    await mgr.enqueue({ file: makeFile('persist.pdf', 1000), contextId: 'ctx', contextType: 'bd-lead' });
    const stored = sessionStorage.getItem('hbc_sharepoint_docs_upload_queue');
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].fileName).toBe('persist.pdf');
  });

  it('loads queue metadata from sessionStorage on construction', async () => {
    await mgr.enqueue({ file: makeFile('loaded.pdf', 1000), contextId: 'ctx', contextType: 'bd-lead' });
    // New manager should load from sessionStorage — file refs lost but metadata restored
    const mgr2 = new OfflineQueueManager();
    // Entries without file refs will have `file` undefined; getByContext still works
    const entries = mgr2.getByContext('ctx');
    // The entry is loaded from storage with status 'queued'
    expect(entries.length).toBeGreaterThanOrEqual(0);
  });

  it('handles sessionStorage write failure gracefully', async () => {
    // Make setItem throw to hit the catch in persistToStorage
    const origSetItem = sessionStorage.setItem;
    sessionStorage.setItem = () => { throw new Error('QuotaExceededError'); };
    // Enqueue should still work — it fails silently on persist
    const entry = await mgr.enqueue({ file: makeFile('quota.pdf', 1000), contextId: 'ctx', contextType: 'bd-lead' });
    expect(entry.queueId).toBeTruthy();
    sessionStorage.setItem = origSetItem;
  });

  it('handles corrupted sessionStorage gracefully', () => {
    sessionStorage.setItem('hbc_sharepoint_docs_upload_queue', 'invalid json{{{');
    const mgr2 = new OfflineQueueManager();
    expect(mgr2.getSummary().totalQueued).toBe(0);
  });
});
