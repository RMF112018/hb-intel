/**
 * W0-G3-T05: useAutoSaveDraft tests
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import type { OperationExecutor } from '../types/index.js';
import { SessionStateProvider } from '../context/SessionStateProvider.js';
import { useAutoSaveDraft } from '../hooks/useAutoSaveDraft.js';
import {
  saveDraft as storeSaveDraft,
  loadDraft as storeLoadDraft,
} from '../db/DraftStore.js';
import { closeSessionDb, resetSessionDbPromise } from '../db/SessionDb.js';

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
// Tests
// ---------------------------------------------------------------------------

describe('useAutoSaveDraft', () => {
  it('returns null value initially when no draft exists', () => {
    const { result } = renderHook(
      () => useAutoSaveDraft<{ name: string }>('auto-test', 24, 100),
      { wrapper },
    );
    expect(result.current.value).toBeNull();
    expect(result.current.lastSavedAt).toBeNull();
    expect(result.current.isSavePending).toBe(false);
  });

  it('collapses multiple rapid queueSave calls into a single save', async () => {
    const { result } = renderHook(
      () => useAutoSaveDraft<string>('debounce-test', 24, 100),
      { wrapper },
    );

    act(() => {
      result.current.queueSave('first');
      result.current.queueSave('second');
      result.current.queueSave('third');
    });

    // Save pending during debounce window
    expect(result.current.isSavePending).toBe(true);

    // Wait for debounce to fire
    await act(async () => {
      await new Promise((r) => setTimeout(r, 150));
    });

    await waitFor(async () => {
      const loaded = await storeLoadDraft<string>('debounce-test');
      expect(loaded).toBe('third');
    });

    expect(result.current.isSavePending).toBe(false);
  });

  it('updates lastSavedAt after debounce fires', async () => {
    const { result } = renderHook(
      () => useAutoSaveDraft<string>('ts-test', 24, 100),
      { wrapper },
    );

    expect(result.current.lastSavedAt).toBeNull();

    act(() => {
      result.current.queueSave('value');
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 150));
    });

    await waitFor(() => {
      expect(result.current.lastSavedAt).not.toBeNull();
    });

    // Should be a valid ISO string
    expect(new Date(result.current.lastSavedAt!).toISOString()).toBe(
      result.current.lastSavedAt,
    );
  });

  it('isSavePending is true during debounce window', async () => {
    const { result } = renderHook(
      () => useAutoSaveDraft<string>('pending-test', 24, 200),
      { wrapper },
    );

    expect(result.current.isSavePending).toBe(false);

    act(() => {
      result.current.queueSave('value');
    });

    expect(result.current.isSavePending).toBe(true);

    await act(async () => {
      await new Promise((r) => setTimeout(r, 250));
    });

    expect(result.current.isSavePending).toBe(false);
  });

  it('clear resets draft and lastSavedAt', async () => {
    const { result } = renderHook(
      () => useAutoSaveDraft<string>('clear-test', 24, 100),
      { wrapper },
    );

    // Save a value first
    act(() => {
      result.current.queueSave('saved-value');
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 150));
    });

    await waitFor(() => {
      expect(result.current.lastSavedAt).not.toBeNull();
    });

    // Now clear
    act(() => {
      result.current.clear();
    });

    expect(result.current.value).toBeNull();
    expect(result.current.lastSavedAt).toBeNull();
    expect(result.current.isSavePending).toBe(false);

    await waitFor(async () => {
      const loaded = await storeLoadDraft('clear-test');
      expect(loaded).toBeNull();
    });
  });

  it('clear cancels any pending debounced save', async () => {
    const { result } = renderHook(
      () => useAutoSaveDraft<string>('clear-pending-test', 24, 200),
      { wrapper },
    );

    act(() => {
      result.current.queueSave('will-be-cleared');
    });

    expect(result.current.isSavePending).toBe(true);

    act(() => {
      result.current.clear();
    });

    expect(result.current.isSavePending).toBe(false);

    // Wait past the original debounce — nothing should have been saved
    await act(async () => {
      await new Promise((r) => setTimeout(r, 300));
    });

    await waitFor(async () => {
      const loaded = await storeLoadDraft('clear-pending-test');
      expect(loaded).toBeNull();
    });
  });

  it('loads existing draft value on mount', async () => {
    await storeSaveDraft('preloaded', { data: 'existing' }, 24);

    const { result } = renderHook(
      () => useAutoSaveDraft<{ data: string }>('preloaded', 24, 100),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.value).toEqual({ data: 'existing' });
    });
  });
});
