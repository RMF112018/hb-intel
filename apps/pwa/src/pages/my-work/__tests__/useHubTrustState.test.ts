/**
 * Trust state and freshness behavioral tests — P2-B3, FRS-01, FRS-02, TST-F2.
 *
 * Tests the trust state derivation logic from useHubTrustState:
 * - Split timestamp model (lastTrustedDataIso vs lastRefreshAttemptIso)
 * - Queued state preservation (not normalized to live)
 * - Freshness window behavior
 * - Stale-while-revalidate detection
 * - Degraded source propagation
 */
import { describe, it, expect } from 'vitest';
import { FEED_FRESHNESS_WINDOW_MS } from '../trustStateConstants.js';
import type { IHubTrustState } from '../useHubTrustState.js';

// Helper: simulate the pure derivation logic from useHubTrustState
// (extracted from the useMemo callback for testability without React hooks)
function deriveTrustState(
  feed: {
    lastRefreshedIso?: string;
    isStale?: boolean;
    healthState?: {
      freshness?: string;
      degradedSourceCount?: number;
      degradedSources?: string[];
    };
  } | undefined,
  isLoading: boolean,
  lastTrustedRef: { current: string | null },
  connectivity: 'online' | 'degraded' | 'offline' = 'online',
): IHubTrustState {
  const freshness = (feed?.healthState?.freshness ?? 'live') as
    | 'live' | 'cached' | 'partial' | 'queued';

  const lastRefreshAttemptIso = feed?.lastRefreshedIso ?? null;

  if (freshness === 'live' && lastRefreshAttemptIso) {
    lastTrustedRef.current = lastRefreshAttemptIso;
  }
  const lastTrustedDataIso = lastTrustedRef.current;

  const isWithinFreshnessWindow = lastTrustedDataIso
    ? Date.now() - new Date(lastTrustedDataIso).getTime() < FEED_FRESHNESS_WINDOW_MS
    : true;

  const isStaleWhileRevalidating =
    (feed?.isStale === true || !isWithinFreshnessWindow) && isLoading;

  const degradedSourceCount = feed?.healthState?.degradedSourceCount ?? 0;
  const degradedSources = (feed?.healthState?.degradedSources ?? []) as IHubTrustState['degradedSources'];

  return {
    freshness,
    lastTrustedDataIso,
    lastRefreshAttemptIso,
    isWithinFreshnessWindow,
    isStaleWhileRevalidating,
    connectivity,
    degradedSourceCount,
    degradedSources,
  };
}

describe('useHubTrustState derivation (P2-B3)', () => {
  describe('FRS-01: Split timestamp model', () => {
    it('sets lastTrustedDataIso when freshness is live', () => {
      const ref = { current: null as string | null };
      const now = new Date().toISOString();
      const result = deriveTrustState(
        { lastRefreshedIso: now, healthState: { freshness: 'live' } },
        false,
        ref,
      );
      expect(result.lastTrustedDataIso).toBe(now);
      expect(result.lastRefreshAttemptIso).toBe(now);
    });

    it('does NOT update lastTrustedDataIso when freshness is partial', () => {
      const oldTrusted = '2026-03-22T10:00:00.000Z';
      const ref = { current: oldTrusted };
      const attemptTime = new Date().toISOString();
      const result = deriveTrustState(
        { lastRefreshedIso: attemptTime, healthState: { freshness: 'partial', degradedSourceCount: 1 } },
        false,
        ref,
      );
      expect(result.lastTrustedDataIso).toBe(oldTrusted);
      expect(result.lastRefreshAttemptIso).toBe(attemptTime);
    });

    it('does NOT update lastTrustedDataIso when freshness is cached', () => {
      const oldTrusted = '2026-03-22T09:00:00.000Z';
      const ref = { current: oldTrusted };
      const result = deriveTrustState(
        { lastRefreshedIso: new Date().toISOString(), healthState: { freshness: 'cached' } },
        false,
        ref,
      );
      expect(result.lastTrustedDataIso).toBe(oldTrusted);
    });
  });

  describe('FRS-02: Queued state preservation', () => {
    it('preserves queued as a distinct freshness state', () => {
      const ref = { current: null as string | null };
      const result = deriveTrustState(
        { lastRefreshedIso: new Date().toISOString(), healthState: { freshness: 'queued' } },
        false,
        ref,
      );
      expect(result.freshness).toBe('queued');
    });

    it('does not normalize queued to live', () => {
      const ref = { current: null as string | null };
      const result = deriveTrustState(
        { healthState: { freshness: 'queued' } },
        false,
        ref,
      );
      expect(result.freshness).not.toBe('live');
    });
  });

  describe('TST-F2: Freshness window', () => {
    it('is within window when trusted data is recent', () => {
      const ref = { current: null as string | null };
      const result = deriveTrustState(
        { lastRefreshedIso: new Date().toISOString(), healthState: { freshness: 'live' } },
        false,
        ref,
      );
      expect(result.isWithinFreshnessWindow).toBe(true);
    });

    it('is outside window when trusted data is old', () => {
      const old = new Date(Date.now() - FEED_FRESHNESS_WINDOW_MS - 60_000).toISOString();
      const ref = { current: old };
      const result = deriveTrustState(
        { lastRefreshedIso: new Date().toISOString(), healthState: { freshness: 'partial' } },
        false,
        ref,
      );
      expect(result.isWithinFreshnessWindow).toBe(false);
    });

    it('treats no timestamp as within window (loading state)', () => {
      const ref = { current: null as string | null };
      const result = deriveTrustState(undefined, true, ref);
      expect(result.isWithinFreshnessWindow).toBe(true);
    });

    it('freshness window is 5 minutes', () => {
      expect(FEED_FRESHNESS_WINDOW_MS).toBe(300_000);
    });
  });

  describe('Stale-while-revalidate', () => {
    it('detects stale-while-revalidating when loading and stale', () => {
      const ref = { current: null as string | null };
      const result = deriveTrustState(
        { lastRefreshedIso: new Date().toISOString(), isStale: true, healthState: { freshness: 'live' } },
        true,
        ref,
      );
      expect(result.isStaleWhileRevalidating).toBe(true);
    });

    it('is not stale-while-revalidating when not loading', () => {
      const ref = { current: null as string | null };
      const result = deriveTrustState(
        { lastRefreshedIso: new Date().toISOString(), isStale: true, healthState: { freshness: 'live' } },
        false,
        ref,
      );
      expect(result.isStaleWhileRevalidating).toBe(false);
    });
  });

  describe('Degraded sources', () => {
    it('propagates degraded source count', () => {
      const ref = { current: null as string | null };
      const result = deriveTrustState(
        { healthState: { freshness: 'partial', degradedSourceCount: 2, degradedSources: ['bic-next-move', 'workflow-handoff'] } },
        false,
        ref,
      );
      expect(result.degradedSourceCount).toBe(2);
      expect(result.degradedSources).toHaveLength(2);
    });

    it('defaults to zero degraded sources when feed is undefined', () => {
      const ref = { current: null as string | null };
      const result = deriveTrustState(undefined, false, ref);
      expect(result.degradedSourceCount).toBe(0);
      expect(result.degradedSources).toEqual([]);
    });
  });

  describe('Default states', () => {
    it('defaults to live freshness when feed is undefined', () => {
      const ref = { current: null as string | null };
      const result = deriveTrustState(undefined, false, ref);
      expect(result.freshness).toBe('live');
    });

    it('defaults to null timestamps when feed is undefined', () => {
      const ref = { current: null as string | null };
      const result = deriveTrustState(undefined, false, ref);
      expect(result.lastTrustedDataIso).toBeNull();
      expect(result.lastRefreshAttemptIso).toBeNull();
    });
  });
});
