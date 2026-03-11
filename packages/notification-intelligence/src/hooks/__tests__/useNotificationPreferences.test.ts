import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PreferencesApi } from '../../api/PreferencesApi';
import { useNotificationPreferences } from '../useNotificationPreferences';
import { createMockNotificationPreferences } from '../../../testing/createMockNotificationPreferences';

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('../../api/PreferencesApi', () => ({
  PreferencesApi: {
    getPreferences: vi.fn(),
    updatePreferences: vi.fn(),
  },
}));

const mockGetPreferences = vi.mocked(PreferencesApi.getPreferences);
const mockUpdatePreferences = vi.mocked(PreferencesApi.updatePreferences);

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('useNotificationPreferences', () => {
  const mockPrefs = createMockNotificationPreferences({
    userId: 'user-001',
    pushEnabled: true,
    digestDay: 1,
    digestHour: 9,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetPreferences.mockResolvedValue(mockPrefs);
    mockUpdatePreferences.mockResolvedValue(mockPrefs);
  });

  it('returns null preferences initially, then loaded preferences', async () => {
    const { result } = renderHook(() => useNotificationPreferences(), {
      wrapper: createWrapper(),
    });

    // Initially loading
    expect(result.current.preferences).toBeUndefined();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.preferences).toEqual(mockPrefs);
  });

  it('updatePreferences performs optimistic update', async () => {
    const updated = createMockNotificationPreferences({
      ...mockPrefs,
      tierOverrides: { 'test.event': 'immediate' },
    });
    mockUpdatePreferences.mockResolvedValue(updated);

    const { result } = renderHook(() => useNotificationPreferences(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.preferences).toEqual(mockPrefs);
    });

    act(() => {
      result.current.updatePreferences({
        tierOverrides: { 'test.event': 'immediate' },
      });
    });

    await waitFor(() => {
      expect(mockUpdatePreferences).toHaveBeenCalledWith(
        { tierOverrides: { 'test.event': 'immediate' } },
        expect.anything(),
      );
    });
  });

  it('rolls back on error', async () => {
    mockUpdatePreferences.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useNotificationPreferences(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.preferences).toEqual(mockPrefs);
    });

    act(() => {
      result.current.updatePreferences({ pushEnabled: false });
    });

    // After error, should roll back to original preferences
    await waitFor(() => {
      expect(result.current.preferences).toEqual(mockPrefs);
    });
  });
});
