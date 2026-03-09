import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComplexityProvider } from '../context/ComplexityProvider';
import { useComplexity } from '../hooks/useComplexity';
import type { IComplexityPreference } from '../types/IComplexityPreference';
import { COMPLEXITY_STORAGE_KEY } from '../types/IComplexityPreference';

describe('ComplexityProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('renders children at default tier (essential) when no cache exists', () => {
    render(
      <ComplexityProvider>
        <span>child</span>
      </ComplexityProvider>
    );
    expect(screen.getByText('child')).toBeInTheDocument();
  });

  it('provides default essential tier to useComplexity when no cache', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ComplexityProvider>{children}</ComplexityProvider>
    );
    const { result } = renderHook(() => useComplexity(), { wrapper });
    // Optimistic default is essential
    expect(result.current.tier).toBe('essential');
    expect(result.current.showCoaching).toBe(true);
  });

  it('reads cached preference from localStorage on mount', () => {
    const cached: IComplexityPreference = { tier: 'expert', showCoaching: false };
    localStorage.setItem('hbc::complexity::v1', JSON.stringify(cached));

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ComplexityProvider>{children}</ComplexityProvider>
    );
    const { result } = renderHook(() => useComplexity(), { wrapper });
    expect(result.current.tier).toBe('expert');
    expect(result.current.showCoaching).toBe(false);
  });

  it('_testPreference overrides cached and API values', () => {
    localStorage.setItem('hbc::complexity::v1', JSON.stringify({ tier: 'expert', showCoaching: false }));

    const testPref: IComplexityPreference = { tier: 'standard', showCoaching: true };
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ComplexityProvider _testPreference={testPref}>{children}</ComplexityProvider>
    );
    const { result } = renderHook(() => useComplexity(), { wrapper });
    expect(result.current.tier).toBe('standard');
    expect(result.current.showCoaching).toBe(true);
  });

  it('context exposes expected shape', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ComplexityProvider>{children}</ComplexityProvider>
    );
    const { result } = renderHook(() => useComplexity(), { wrapper });
    expect(result.current).toEqual(expect.objectContaining({
      tier: expect.any(String),
      showCoaching: expect.any(Boolean),
      isLocked: expect.any(Boolean),
      atLeast: expect.any(Function),
      is: expect.any(Function),
      setTier: expect.any(Function),
      setShowCoaching: expect.any(Function),
    }));
  });

  it('atLeast and is return correct values for essential tier', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ComplexityProvider>{children}</ComplexityProvider>
    );
    const { result } = renderHook(() => useComplexity(), { wrapper });
    // Default is essential
    expect(result.current.atLeast('essential')).toBe(true);
    expect(result.current.atLeast('standard')).toBe(false);
    expect(result.current.is('essential')).toBe(true);
    expect(result.current.is('standard')).toBe(false);
  });

  it('setTier updates the tier and persists to storage', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ComplexityProvider>{children}</ComplexityProvider>
    );
    const { result } = renderHook(() => useComplexity(), { wrapper });

    act(() => {
      result.current.setTier('expert');
    });

    expect(result.current.tier).toBe('expert');
    const stored = JSON.parse(localStorage.getItem('hbc::complexity::v1')!);
    expect(stored.tier).toBe('expert');
  });

  it('setTier is no-op when locked', async () => {
    const lockedPref: IComplexityPreference = {
      tier: 'essential',
      showCoaching: true,
      lockedBy: 'admin',
    };
    localStorage.setItem('hbc::complexity::v1', JSON.stringify(lockedPref));

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ComplexityProvider>{children}</ComplexityProvider>
    );
    const { result } = renderHook(() => useComplexity(), { wrapper });

    act(() => {
      result.current.setTier('expert');
    });

    // Tier should remain essential because it's locked
    expect(result.current.tier).toBe('essential');
  });

  it('setShowCoaching updates coaching preference', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ComplexityProvider>{children}</ComplexityProvider>
    );
    const { result } = renderHook(() => useComplexity(), { wrapper });

    act(() => {
      result.current.setShowCoaching(false);
    });

    expect(result.current.showCoaching).toBe(false);
  });

  it('syncs preference from API on mount', async () => {
    const apiPref: IComplexityPreference = { tier: 'expert', showCoaching: false };
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => apiPref,
    } as Response);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ComplexityProvider>{children}</ComplexityProvider>
    );
    const { result } = renderHook(() => useComplexity(), { wrapper });

    await waitFor(() => {
      expect(result.current.tier).toBe('expert');
    });
  });

  it('uses sessionStorage when spfxContext is provided', () => {
    const spfxContext = { pageContext: { user: { loginName: 'user@test.com' } } };
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ComplexityProvider spfxContext={spfxContext}>{children}</ComplexityProvider>
    );
    const { result } = renderHook(() => useComplexity(), { wrapper });

    act(() => {
      result.current.setTier('expert');
    });

    expect(sessionStorage.getItem('hbc::complexity::v1')).not.toBeNull();
    expect(localStorage.getItem('hbc::complexity::v1')).toBeNull();
  });

  it('resolves expired lock on API sync', async () => {
    const expiredLockPref: IComplexityPreference = {
      tier: 'essential',
      showCoaching: true,
      lockedBy: 'onboarding',
      lockedUntil: '2020-01-01T00:00:00Z', // expired
    };
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => expiredLockPref,
    } as Response);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ComplexityProvider>{children}</ComplexityProvider>
    );
    const { result } = renderHook(() => useComplexity(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLocked).toBe(false);
    });
  });

  it('auto-sets showCoaching false when upgrading from essential', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ComplexityProvider>{children}</ComplexityProvider>
    );
    const { result } = renderHook(() => useComplexity(), { wrapper });

    // Default is essential with showCoaching true
    expect(result.current.showCoaching).toBe(true);

    act(() => {
      result.current.setTier('standard');
    });

    // D-07: showCoaching auto-set to false when upgrading from essential
    expect(result.current.showCoaching).toBe(false);
  });

  it('handles StorageEvent from other tabs (D-05)', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ComplexityProvider>{children}</ComplexityProvider>
    );
    const { result } = renderHook(() => useComplexity(), { wrapper });

    // Simulate a StorageEvent from another tab
    const updated: IComplexityPreference = { tier: 'expert', showCoaching: false };
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', {
        key: COMPLEXITY_STORAGE_KEY,
        newValue: JSON.stringify(updated),
      }));
    });

    expect(result.current.tier).toBe('expert');
  });

  it('ignores StorageEvent for unrelated keys', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ComplexityProvider>{children}</ComplexityProvider>
    );
    const { result } = renderHook(() => useComplexity(), { wrapper });

    act(() => {
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'some-other-key',
        newValue: JSON.stringify({ tier: 'expert' }),
      }));
    });

    expect(result.current.tier).toBe('essential');
  });

  it('ignores StorageEvent with null newValue', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ComplexityProvider>{children}</ComplexityProvider>
    );
    const { result } = renderHook(() => useComplexity(), { wrapper });

    act(() => {
      window.dispatchEvent(new StorageEvent('storage', {
        key: COMPLEXITY_STORAGE_KEY,
        newValue: null,
      }));
    });

    expect(result.current.tier).toBe('essential');
  });

  it('ignores StorageEvent with corrupt JSON', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ComplexityProvider>{children}</ComplexityProvider>
    );
    const { result } = renderHook(() => useComplexity(), { wrapper });

    act(() => {
      window.dispatchEvent(new StorageEvent('storage', {
        key: COMPLEXITY_STORAGE_KEY,
        newValue: 'not-json',
      }));
    });

    expect(result.current.tier).toBe('essential');
  });

  it('skips StorageEvent listener in SPFx mode', async () => {
    const spfxContext = { pageContext: { user: { loginName: 'user@test.com' } } };
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ComplexityProvider spfxContext={spfxContext}>{children}</ComplexityProvider>
    );
    const { result } = renderHook(() => useComplexity(), { wrapper });

    act(() => {
      window.dispatchEvent(new StorageEvent('storage', {
        key: COMPLEXITY_STORAGE_KEY,
        newValue: JSON.stringify({ tier: 'expert', showCoaching: false }),
      }));
    });

    // Should NOT update — SPFx mode skips StorageEvent
    expect(result.current.tier).toBe('essential');
  });

  it('derives tier from AD groups for new user (404 from API)', async () => {
    // First call: fetchPreference returns 404 (new user)
    vi.mocked(fetch)
      .mockResolvedValueOnce({ ok: false, status: 404 } as Response)
      // Second call: AD groups endpoint
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ groups: ['HBC-VP'] }),
      } as Response)
      // Third call: patchPreference
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tier: 'expert', showCoaching: false }),
      } as Response);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ComplexityProvider>{children}</ComplexityProvider>
    );
    const { result } = renderHook(() => useComplexity(), { wrapper });

    await waitFor(() => {
      expect(result.current.tier).toBe('expert');
    });
  });

  it('handles API sync failure gracefully', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ComplexityProvider>{children}</ComplexityProvider>
    );
    const { result } = renderHook(() => useComplexity(), { wrapper });

    // Should still have optimistic default
    await waitFor(() => {
      expect(result.current.tier).toBe('essential');
    });
  });

  it('polls for lock expiry and clears expired locks (D-06)', async () => {
    vi.useFakeTimers();

    // Preference with a lock that will expire "soon"
    const lockedPref: IComplexityPreference = {
      tier: 'essential',
      showCoaching: true,
      lockedBy: 'onboarding',
      lockedUntil: new Date(Date.now() + 30_000).toISOString(), // expires in 30s
    };
    localStorage.setItem(COMPLEXITY_STORAGE_KEY, JSON.stringify(lockedPref));

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ComplexityProvider>{children}</ComplexityProvider>
    );
    const { result } = renderHook(() => useComplexity(), { wrapper });

    expect(result.current.isLocked).toBe(true);

    // Fast-forward past the lock expiry + polling interval
    await act(async () => {
      vi.advanceTimersByTime(90_000);
    });

    expect(result.current.isLocked).toBe(false);

    vi.useRealTimers();
  });
});
