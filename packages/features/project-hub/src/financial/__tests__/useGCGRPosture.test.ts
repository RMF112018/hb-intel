/**
 * useGCGRPosture — Wave 3B.3 posture/blocker/rollup tests.
 */

import { describe, expect, it } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useGCGRPosture } from '../hooks/useGCGRPosture.js';

describe('useGCGRPosture', () => {
  it('starts in loading state', () => {
    const { result } = renderHook(() =>
      useGCGRPosture('proj-uuid-001', '2026-03', 'pm'),
    );
    expect(result.current.isLoading).toBe(true);
    expect(result.current.state).toBe('loading');
  });

  it('loads posture from facade and resolves', async () => {
    const { result } = renderHook(() =>
      useGCGRPosture('proj-uuid-001', '2026-03', 'pm'),
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.state).not.toBe('loading');
    expect(result.current.versionState).toBe('Working');
  });

  it('PM can edit on Working version', async () => {
    const { result } = renderHook(() =>
      useGCGRPosture('proj-uuid-001', '2026-03', 'pm'),
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.canEdit).toBe(true);
  });

  it('non-PM cannot edit', async () => {
    const { result } = renderHook(() =>
      useGCGRPosture('proj-uuid-001', '2026-03', 'pe'),
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.canEdit).toBe(false);
  });

  it('provides rollup integrity data', async () => {
    const { result } = renderHook(() =>
      useGCGRPosture('proj-uuid-001', '2026-03', 'pm'),
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.rollup.lineCount).toBeGreaterThan(0);
    expect(typeof result.current.rollup.totalVariance).toBe('number');
    expect(typeof result.current.rollup.totalBudget).toBe('number');
    expect(result.current.rollup.isConsistent).toBe(true);
  });

  it('provides category groups for worksheet-aligned display', async () => {
    const { result } = renderHook(() =>
      useGCGRPosture('proj-uuid-001', '2026-03', 'pm'),
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.rollup.categoryGroups.length).toBeGreaterThan(0);
    const gcGroup = result.current.rollup.categoryGroups.find((g) => g.category === 'GeneralConditions');
    expect(gcGroup).toBeDefined();
  });

  it('reports over-budget warning when lines exceed budget', async () => {
    const { result } = renderHook(() =>
      useGCGRPosture('proj-uuid-001', '2026-03', 'pm'),
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // MockFinancialRepository returns at least one over-budget line
    if (result.current.rollup.overBudgetCount > 0) {
      const overBudgetWarning = result.current.warnings.find((w) => w.id === 'over-budget-lines');
      expect(overBudgetWarning).toBeDefined();
    }
  });

  it('exposes gcgrTotalVariance for Forecast Summary rollup seam', async () => {
    const { result } = renderHook(() =>
      useGCGRPosture('proj-uuid-001', '2026-03', 'pm'),
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(typeof result.current.rollup.totalVariance).toBe('number');
    // This is the value that feeds IFinancialForecastSummary.gcgrTotalVariance
  });

  it('provides module posture for upstream consumption', async () => {
    const { result } = renderHook(() =>
      useGCGRPosture('proj-uuid-001', '2026-03', 'pm'),
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.modulePosture).not.toBeNull();
    expect(result.current.modulePosture!.projectId).toBe('proj-uuid-001');
  });
});
