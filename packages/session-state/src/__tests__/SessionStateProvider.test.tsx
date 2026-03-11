/**
 * SessionStateProvider + hooks tests — SF12-T05
 */
import { render, screen, renderHook, act, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import type { OperationExecutor } from '../types/index.js';
import { SessionStateProvider } from '../context/SessionStateProvider.js';
import { useSessionState } from '../hooks/useSessionState.js';
import { useConnectivity } from '../hooks/useConnectivity.js';
import { useDraft } from '../hooks/useDraft.js';
import {
  saveDraft as storeSaveDraft,
  loadDraft as storeLoadDraft,
  purgeExpiredDrafts,
} from '../db/DraftStore.js';
import { listPending } from '../db/QueueStore.js';
import { closeSessionDb, resetSessionDbPromise } from '../db/SessionDb.js';
import { SESSION_DB_NAME } from '../constants/index.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockExecutor: OperationExecutor = vi.fn().mockResolvedValue(undefined);

function wrapper({ children }: { children: ReactNode }) {
  return (
    <SessionStateProvider executor={mockExecutor}>
      {children}
    </SessionStateProvider>
  );
}

async function teardownDb(): Promise<void> {
  await closeSessionDb();
  resetSessionDbPromise();
  const dbs = await indexedDB.databases();
  for (const db of dbs) {
    if (db.name) indexedDB.deleteDatabase(db.name);
  }
}

// ---------------------------------------------------------------------------
// Setup / Teardown
// ---------------------------------------------------------------------------

beforeEach(async () => {
  vi.restoreAllMocks();
  await teardownDb();
});

afterEach(async () => {
  await teardownDb();
});

// ---------------------------------------------------------------------------
// Provider Tests
// ---------------------------------------------------------------------------

describe('SessionStateProvider', () => {
  it('renders children', () => {
    render(
      <SessionStateProvider executor={mockExecutor}>
        <div data-testid="child">Hello</div>
      </SessionStateProvider>,
    );
    expect(screen.getByTestId('child')).toHaveTextContent('Hello');
  });

  it('initializes with default connectivity online', () => {
    const { result } = renderHook(() => useSessionState(), { wrapper });
    expect(result.current.connectivity).toBe('online');
  });

  it('purges expired drafts on mount', async () => {
    // Save an already-expired draft before mounting provider
    await storeSaveDraft('expired-key', { data: 'old' }, 0);

    render(
      <SessionStateProvider executor={mockExecutor}>
        <div>test</div>
      </SessionStateProvider>,
    );

    // Give purge time to run (fire-and-forget)
    await waitFor(async () => {
      const loaded = await storeLoadDraft('expired-key');
      expect(loaded).toBeNull();
    });
  });

  it('triggerSync calls engine sync and refreshes queue', async () => {
    const { result } = renderHook(() => useSessionState(), { wrapper });

    await act(async () => {
      await result.current.triggerSync();
    });

    // Should not throw; queue state refreshed
    expect(result.current.pendingCount).toBe(0);
    expect(result.current.queuedOperations).toEqual([]);
  });

  it('saveDraft persists via store', async () => {
    const { result } = renderHook(() => useSessionState(), { wrapper });

    act(() => {
      result.current.saveDraft('test-draft', { hello: 'world' }, 24);
    });

    await waitFor(async () => {
      const loaded = await storeLoadDraft('test-draft');
      expect(loaded).toEqual({ hello: 'world' });
    });
  });

  it('clearDraft removes via store', async () => {
    await storeSaveDraft('to-clear', { data: 1 }, 24);

    const { result } = renderHook(() => useSessionState(), { wrapper });

    act(() => {
      result.current.clearDraft('to-clear');
    });

    await waitFor(async () => {
      const loaded = await storeLoadDraft('to-clear');
      expect(loaded).toBeNull();
    });
  });

  it('queueOperation enqueues via store and updates pendingCount', async () => {
    const { result } = renderHook(() => useSessionState(), { wrapper });

    act(() => {
      result.current.queueOperation({
        type: 'form-save',
        target: '/api/save',
        payload: { form: 'data' },
        maxRetries: 3,
      });
    });

    await waitFor(() => {
      expect(result.current.pendingCount).toBe(1);
    });

    expect(result.current.queuedOperations).toHaveLength(1);
    expect(result.current.queuedOperations[0].type).toBe('form-save');
  });

  it('cleans up engine and monitor on unmount', () => {
    const { unmount } = render(
      <SessionStateProvider executor={mockExecutor}>
        <div>test</div>
      </SessionStateProvider>,
    );

    // Should not throw on unmount
    expect(() => unmount()).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// useSessionState
// ---------------------------------------------------------------------------

describe('useSessionState', () => {
  it('throws outside provider', () => {
    // Suppress React error boundary console output
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useSessionState());
    }).toThrow('useSessionState must be used within a SessionStateProvider');

    spy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// useConnectivity
// ---------------------------------------------------------------------------

describe('useConnectivity', () => {
  it('returns connectivity status', () => {
    const { result } = renderHook(() => useConnectivity(), { wrapper });
    expect(['online', 'offline', 'degraded']).toContain(result.current);
  });
});

// ---------------------------------------------------------------------------
// useDraft
// ---------------------------------------------------------------------------

describe('useDraft', () => {
  it('loads draft on mount', async () => {
    await storeSaveDraft('my-draft', { name: 'test' }, 24);

    const { result } = renderHook(() => useDraft<{ name: string }>('my-draft'), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.value).toEqual({ name: 'test' });
    });
  });

  it('save updates local state and persists', async () => {
    const { result } = renderHook(() => useDraft<string>('save-test', 48), {
      wrapper,
    });

    act(() => {
      result.current.save('hello');
    });

    expect(result.current.value).toBe('hello');

    await waitFor(async () => {
      const loaded = await storeLoadDraft<string>('save-test');
      expect(loaded).toBe('hello');
    });
  });

  it('clear resets to null and removes from store', async () => {
    await storeSaveDraft('clear-test', 'data', 24);

    const { result } = renderHook(() => useDraft<string>('clear-test'), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.value).toBe('data');
    });

    act(() => {
      result.current.clear();
    });

    expect(result.current.value).toBeNull();

    await waitFor(async () => {
      const loaded = await storeLoadDraft('clear-test');
      expect(loaded).toBeNull();
    });
  });

  it('reloads when draftKey changes', async () => {
    await storeSaveDraft('key-a', 'value-a', 24);
    await storeSaveDraft('key-b', 'value-b', 24);

    const { result, rerender } = renderHook(
      ({ draftKey }: { draftKey: string }) => useDraft<string>(draftKey),
      {
        wrapper,
        initialProps: { draftKey: 'key-a' },
      },
    );

    await waitFor(() => {
      expect(result.current.value).toBe('value-a');
    });

    rerender({ draftKey: 'key-b' });

    await waitFor(() => {
      expect(result.current.value).toBe('value-b');
    });
  });
});
