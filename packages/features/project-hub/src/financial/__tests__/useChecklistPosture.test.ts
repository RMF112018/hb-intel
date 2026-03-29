/**
 * useChecklistPosture — Wave 3D.3 lifecycle/gating/posture tests.
 */

import { describe, expect, it } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useChecklistPosture } from '../hooks/useChecklistPosture.js';

describe('useChecklistPosture', () => {
  it('starts in loading state', () => {
    const { result } = renderHook(() =>
      useChecklistPosture('proj-uuid-001', '2026-03', 'pm'),
    );
    expect(result.current.isLoading).toBe(true);
    expect(result.current.state).toBe('loading');
  });

  it('loads posture from facade and resolves', async () => {
    const { result } = renderHook(() =>
      useChecklistPosture('proj-uuid-001', '2026-03', 'pm'),
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.state).not.toBe('loading');
    expect(result.current.versionState).toBe('Working');
  });

  it('PM can edit checklist on Working version', async () => {
    const { result } = renderHook(() =>
      useChecklistPosture('proj-uuid-001', '2026-03', 'pm'),
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.canEditChecklist).toBe(true);
  });

  it('non-PM cannot edit checklist', async () => {
    const { result } = renderHook(() =>
      useChecklistPosture('proj-uuid-001', '2026-03', 'pe'),
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.canEditChecklist).toBe(false);
  });

  it('provides gate detail with required/completed counts', async () => {
    const { result } = renderHook(() =>
      useChecklistPosture('proj-uuid-001', '2026-03', 'pm'),
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.gate.requiredTotal).toBeGreaterThan(0);
    expect(typeof result.current.gate.requiredCompleted).toBe('number');
    expect(typeof result.current.gate.allRequiredComplete).toBe('boolean');
  });

  it('provides checklist groups from versioning service', async () => {
    const { result } = renderHook(() =>
      useChecklistPosture('proj-uuid-001', '2026-03', 'pm'),
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.checklistGroups.length).toBeGreaterThan(0);
  });

  it('reports confirmation gate status', async () => {
    const { result } = renderHook(() =>
      useChecklistPosture('proj-uuid-001', '2026-03', 'pm'),
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    // MockFinancialRepository returns canConfirm: false
    expect(result.current.canConfirmVersion).toBe(false);
    expect(result.current.gate.canConfirm).toBe(false);
  });

  it('reports checklist-incomplete blocker when required items pending', async () => {
    const { result } = renderHook(() =>
      useChecklistPosture('proj-uuid-001', '2026-03', 'pm'),
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    // MockFinancialRepository checklist has 3 items, not all required complete
    if (!result.current.gate.allRequiredComplete) {
      const blocker = result.current.blockers.find((b) => b.id === 'checklist-incomplete');
      expect(blocker).toBeDefined();
      expect(blocker!.message).toContain('gate G2');
    }
  });

  it('non-PM gets role warning', async () => {
    const { result } = renderHook(() =>
      useChecklistPosture('proj-uuid-001', '2026-03', 'pe'),
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const roleWarning = result.current.warnings.find((w) => w.id === 'non-pm-view');
    expect(roleWarning).toBeDefined();
  });

  it('provides module posture for upstream consumption', async () => {
    const { result } = renderHook(() =>
      useChecklistPosture('proj-uuid-001', '2026-03', 'pm'),
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.modulePosture).not.toBeNull();
    expect(result.current.modulePosture!.projectId).toBe('proj-uuid-001');
  });
});
