/**
 * useBudgetImportPosture — Wave 3C.3 posture/validation/reconciliation tests.
 */

import { describe, expect, it } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useBudgetImportPosture } from '../hooks/useBudgetImportPosture.js';

describe('useBudgetImportPosture', () => {
  it('starts in loading state', () => {
    const { result } = renderHook(() =>
      useBudgetImportPosture('proj-uuid-001', '2026-03', 'pm'),
    );
    expect(result.current.isLoading).toBe(true);
    expect(result.current.state).toBe('loading');
  });

  it('loads posture from facade and resolves', async () => {
    const { result } = renderHook(() =>
      useBudgetImportPosture('proj-uuid-001', '2026-03', 'pm'),
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.state).not.toBe('loading');
    expect(result.current.versionState).toBe('Working');
  });

  it('PM can import on Working version', async () => {
    const { result } = renderHook(() =>
      useBudgetImportPosture('proj-uuid-001', '2026-03', 'pm'),
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.canImport).toBe(true);
    expect(result.current.canEditFTC).toBe(true);
  });

  it('non-PM cannot import or edit FTC', async () => {
    const { result } = renderHook(() =>
      useBudgetImportPosture('proj-uuid-001', '2026-03', 'pe'),
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.canImport).toBe(false);
    expect(result.current.canEditFTC).toBe(false);
  });

  it('reports line count from facade', async () => {
    const { result } = renderHook(() =>
      useBudgetImportPosture('proj-uuid-001', '2026-03', 'pm'),
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.lineCount).toBeGreaterThan(0);
  });

  it('reports pending reconciliation condition count', async () => {
    const { result } = renderHook(() =>
      useBudgetImportPosture('proj-uuid-001', '2026-03', 'pm'),
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(typeof result.current.pendingConditionCount).toBe('number');
  });

  it('provides downstream impact assessment', async () => {
    const { result } = renderHook(() =>
      useBudgetImportPosture('proj-uuid-001', '2026-03', 'pm'),
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(typeof result.current.downstream.confirmationBlocked).toBe('boolean');
    expect(typeof result.current.downstream.staleBudgetLineCount).toBe('number');
    expect(typeof result.current.downstream.forecastImpacted).toBe('boolean');
  });

  it('non-PM gets info warning about role requirement', async () => {
    const { result } = renderHook(() =>
      useBudgetImportPosture('proj-uuid-001', '2026-03', 'pe'),
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const roleWarning = result.current.warnings.find((w) => w.id === 'non-pm-view');
    expect(roleWarning).toBeDefined();
  });

  it('provides module posture for upstream consumption', async () => {
    const { result } = renderHook(() =>
      useBudgetImportPosture('proj-uuid-001', '2026-03', 'pm'),
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.modulePosture).not.toBeNull();
    expect(result.current.modulePosture!.projectId).toBe('proj-uuid-001');
  });
});
