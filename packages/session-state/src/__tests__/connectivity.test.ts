/// <reference types="vitest/globals" />
import {
  createConnectivityMonitor,
  type IConnectivityMonitor,
} from '../sync/connectivity.js';
import { CONNECTIVITY_PROBE_TIMEOUT_MS } from '../constants/index.js';

describe('createConnectivityMonitor', () => {
  let monitor: IConnectivityMonitor;

  afterEach(() => {
    monitor?.dispose();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('returns "online" by default (no probe URL)', () => {
    monitor = createConnectivityMonitor();
    expect(monitor.getStatus()).toBe('online');
  });

  it('returns "offline" when navigator.onLine is false', () => {
    vi.stubGlobal('navigator', { onLine: false });
    monitor = createConnectivityMonitor();
    expect(monitor.getStatus()).toBe('offline');
    vi.unstubAllGlobals();
  });

  it('returns "online" when probe succeeds within threshold', async () => {
    vi.stubGlobal('navigator', { onLine: true });
    const fetchSpy = vi.fn().mockResolvedValue(new Response());
    vi.stubGlobal('fetch', fetchSpy);

    monitor = createConnectivityMonitor('https://probe.test/health');
    const status = await monitor.probe();
    expect(status).toBe('online');
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://probe.test/health',
      expect.objectContaining({ method: 'HEAD', cache: 'no-store' }),
    );
    vi.unstubAllGlobals();
  });

  it('returns "degraded" when probe exceeds threshold', async () => {
    vi.stubGlobal('navigator', { onLine: true });

    const slowFetch = vi.fn().mockImplementation(
      () =>
        new Promise<Response>((resolve) => {
          // Simulate slow response beyond half the timeout
          setTimeout(() => resolve(new Response()), CONNECTIVITY_PROBE_TIMEOUT_MS / 2 + 100);
        }),
    );
    vi.stubGlobal('fetch', slowFetch);
    vi.useFakeTimers();

    monitor = createConnectivityMonitor('https://probe.test/health');
    const probePromise = monitor.probe();
    await vi.advanceTimersByTimeAsync(CONNECTIVITY_PROBE_TIMEOUT_MS / 2 + 200);
    const status = await probePromise;
    expect(status).toBe('degraded');
    vi.unstubAllGlobals();
  });

  it('returns "offline" when probe fetch throws', async () => {
    vi.stubGlobal('navigator', { onLine: true });
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network error')));

    monitor = createConnectivityMonitor('https://probe.test/health');
    const status = await monitor.probe();
    expect(status).toBe('offline');
    vi.unstubAllGlobals();
  });

  it('notifies subscribers on status change', async () => {
    vi.stubGlobal('navigator', { onLine: true });
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('fail')));

    monitor = createConnectivityMonitor('https://probe.test/health');
    const listener = vi.fn();
    monitor.subscribe(listener);

    await monitor.probe();
    expect(listener).toHaveBeenCalledWith('offline');
    vi.unstubAllGlobals();
  });

  it('does not notify when status unchanged', async () => {
    vi.stubGlobal('navigator', { onLine: true });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response()));

    monitor = createConnectivityMonitor('https://probe.test/health');
    const listener = vi.fn();
    monitor.subscribe(listener);

    // Status starts as 'online', probe returns 'online' — no change
    await monitor.probe();
    expect(listener).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it('dispose() removes listeners and clears interval', () => {
    vi.useFakeTimers();
    const removeListenerSpy = vi.spyOn(window, 'removeEventListener');

    monitor = createConnectivityMonitor('https://probe.test/health');
    const listener = vi.fn();
    monitor.subscribe(listener);
    monitor.dispose();

    expect(removeListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
    expect(removeListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));
  });

  it('unsubscribe function works', async () => {
    vi.stubGlobal('navigator', { onLine: true });
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('fail')));

    monitor = createConnectivityMonitor('https://probe.test/health');
    const listener = vi.fn();
    const unsub = monitor.subscribe(listener);
    unsub();

    await monitor.probe();
    expect(listener).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it('safe in environments without window/navigator', async () => {
    const origWindow = globalThis.window;
    const origNavigator = globalThis.navigator;

    // @ts-expect-error — intentionally removing globals for test
    delete (globalThis as Record<string, unknown>).window;
    // @ts-expect-error — intentionally removing globals for test
    delete (globalThis as Record<string, unknown>).navigator;

    const safeMonitor = createConnectivityMonitor();
    expect(safeMonitor.getStatus()).toBe('online');
    const status = await safeMonitor.probe();
    expect(status).toBe('online');
    safeMonitor.dispose();

    // Restore
    globalThis.window = origWindow;
    globalThis.navigator = origNavigator;
  });
});
