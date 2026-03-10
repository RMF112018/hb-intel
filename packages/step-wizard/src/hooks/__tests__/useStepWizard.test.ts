// hooks/__tests__/useStepWizard.test.ts
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStepWizard } from '../useStepWizard';
import { createMockWizardConfig, createWizardWrapper, mockWizardStates } from '@hbc/step-wizard/testing';

describe('useStepWizard', () => {
  it('initialises with not-started state when no draft exists', () => {
    const config = createMockWizardConfig({ orderMode: 'sequential' });
    const { result } = renderHook(() => useStepWizard(config, {}), {
      wrapper: createWizardWrapper(),
    });
    expect(result.current.state.steps.every((s) => s.status === 'not-started')).toBe(true);
  });

  it('advance moves to next step', async () => {
    const config = createMockWizardConfig({ orderMode: 'sequential' });
    const { result } = renderHook(() => useStepWizard(config, {}), {
      wrapper: createWizardWrapper(),
    });
    await act(async () => { result.current.advance(); });
    expect(result.current.state.steps[1].status).toBe('in-progress');
  });

  it('markComplete validates required step (D-03)', async () => {
    const config = createMockWizardConfig({
      orderMode: 'parallel',
      steps: [{ stepId: 'step-1', label: 'Step 1', required: true,
        validate: () => 'Must fill required fields' }],
    });
    const { result } = renderHook(() => useStepWizard(config, {}), {
      wrapper: createWizardWrapper(),
    });
    await act(async () => {
      await result.current.markComplete('step-1');
    });
    expect(result.current.state.steps[0].status).not.toBe('complete');
    expect(result.current.getValidationError('step-1')).toBe('Must fill required fields');
  });

  it('optional step completes despite validation error (D-03)', async () => {
    const config = createMockWizardConfig({
      steps: [{ stepId: 'step-1', label: 'Step 1', required: false,
        validate: () => 'Optional field' }],
    });
    const { result } = renderHook(() => useStepWizard(config, {}), {
      wrapper: createWizardWrapper(),
    });
    await act(async () => { await result.current.markComplete('step-1'); });
    expect(result.current.state.steps[0].status).toBe('complete');
  });

  it('onAllComplete fires on each completion cycle (D-07)', async () => {
    const onAllComplete = vi.fn();
    const config = createMockWizardConfig({ onAllComplete, steps: [
      { stepId: 'step-1', label: 'Step 1', required: true },
    ], allowReopen: true });
    const { result } = renderHook(() => useStepWizard(config, {}), {
      wrapper: createWizardWrapper(),
    });
    await act(async () => { await result.current.markComplete('step-1'); });
    await act(async () => { result.current.reopenStep('step-1'); });
    await act(async () => { await result.current.markComplete('step-1'); });
    expect(onAllComplete).toHaveBeenCalledTimes(2); // fires on each re-completion
  });

  it('reopenStep blocked when allowReopen not set (D-05)', () => {
    const config = createMockWizardConfig({ allowReopen: undefined, draftKey: 'test-reopen' });
    const { result } = renderHook(() => useStepWizard(config, {}), {
      wrapper: createWizardWrapper(mockWizardStates.complete),
    });
    act(() => { result.current.reopenStep(config.steps[0].stepId); });
    expect(result.current.state.steps[0].status).toBe('complete'); // unchanged
  });

  it('sequential-with-jumps: goTo locked step blocked (D-01)', () => {
    const config = createMockWizardConfig({ orderMode: 'sequential-with-jumps', draftKey: 'test-goto' });
    const { result } = renderHook(() => useStepWizard(config, {}), {
      wrapper: createWizardWrapper(mockWizardStates.notStarted),
    });
    act(() => { result.current.goTo(config.steps[2].stepId); }); // step 3 not visited
    expect(result.current.state.activeStepId).not.toBe(config.steps[2].stepId);
  });

  it('markBlocked sets step to blocked status', async () => {
    const config = createMockWizardConfig({ orderMode: 'parallel' });
    const { result } = renderHook(() => useStepWizard(config, {}), {
      wrapper: createWizardWrapper(),
    });
    act(() => { result.current.markBlocked('step-1', 'External dependency'); });
    expect(result.current.state.steps[0].status).toBe('blocked');
  });

  it('advance on last step does nothing (no next step)', async () => {
    const config = createMockWizardConfig({
      steps: [{ stepId: 'step-1', label: 'Only Step', required: true }],
    });
    const { result } = renderHook(() => useStepWizard(config, {}), {
      wrapper: createWizardWrapper(),
    });
    const before = result.current.state.activeStepId;
    await act(async () => { result.current.advance(); });
    expect(result.current.state.activeStepId).toBe(before);
  });

  it('advance records validation error on departure', async () => {
    const config = createMockWizardConfig({
      steps: [
        { stepId: 'step-1', label: 'Step 1', required: true, validate: () => 'Needs data' },
        { stepId: 'step-2', label: 'Step 2', required: true },
      ],
    });
    const { result } = renderHook(() => useStepWizard(config, {}), {
      wrapper: createWizardWrapper(),
    });
    await act(async () => { result.current.advance(); });
    expect(result.current.getValidationError('step-1')).toBe('Needs data');
  });

  it('markComplete calls step.onComplete callback', async () => {
    const onComplete = vi.fn();
    const config = createMockWizardConfig({
      steps: [{ stepId: 'step-1', label: 'Step 1', required: true, onComplete }],
    });
    const { result } = renderHook(() => useStepWizard(config, {}), {
      wrapper: createWizardWrapper(),
    });
    await act(async () => { await result.current.markComplete('step-1'); });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('goTo in parallel mode succeeds for any step', () => {
    const config = createMockWizardConfig({ orderMode: 'parallel' });
    const { result } = renderHook(() => useStepWizard(config, {}), {
      wrapper: createWizardWrapper(),
    });
    act(() => { result.current.goTo('step-3'); });
    expect(result.current.state.steps[2].status).toBe('in-progress');
  });

  it('restores draft on mount — monotonic merge applied (D-02)', () => {
    const config = createMockWizardConfig({ draftKey: 'test-restore' });
    const { result } = renderHook(() => useStepWizard(config, {}), {
      wrapper: createWizardWrapper(mockWizardStates.complete),
    });
    // All steps should be complete from the restored draft
    expect(result.current.state.steps[0].status).toBe('complete');
    expect(result.current.state.steps[1].status).toBe('complete');
    expect(result.current.state.steps[2].status).toBe('complete');
  });

  it('goTo records validation error on departure from active step', () => {
    const config = createMockWizardConfig({
      orderMode: 'parallel',
      steps: [
        { stepId: 'step-1', label: 'Step 1', required: true, validate: () => 'Missing data' },
        { stepId: 'step-2', label: 'Step 2', required: true },
      ],
    });
    const { result } = renderHook(() => useStepWizard(config, {}), {
      wrapper: createWizardWrapper(),
    });
    act(() => { result.current.goTo('step-2'); });
    expect(result.current.getValidationError('step-1')).toBe('Missing data');
  });

  it('markComplete on nonexistent step does nothing', async () => {
    const config = createMockWizardConfig();
    const { result } = renderHook(() => useStepWizard(config, {}), {
      wrapper: createWizardWrapper(),
    });
    await act(async () => { await result.current.markComplete('nonexistent'); });
    // No crash, state unchanged
    expect(result.current.state.steps[0].status).toBe('not-started');
  });

  it('advance in sequential-with-jumps records visit on next step', async () => {
    const config = createMockWizardConfig({ orderMode: 'sequential-with-jumps' });
    const { result } = renderHook(() => useStepWizard(config, {}), {
      wrapper: createWizardWrapper(),
    });
    await act(async () => { result.current.advance(); });
    // step-2 should now be in-progress via visit + status update
    expect(result.current.state.steps[1].status).toBe('in-progress');
  });

  it('overdue polling fires for steps past due', async () => {
    vi.useFakeTimers();
    const pastDue = new Date(Date.now() - 1000).toISOString();
    const config = createMockWizardConfig({
      steps: [
        { stepId: 'step-1', label: 'Step 1', required: true, dueDate: () => pastDue },
      ],
    });
    const { result } = renderHook(() => useStepWizard(config, {}), {
      wrapper: createWizardWrapper(),
    });
    // Overdue check runs on mount
    expect(result.current.state.steps[0].isOverdue).toBe(true);
    vi.useRealTimers();
  });

  it('reopenStep resets onAllCompleteFired (D-07)', async () => {
    const onAllComplete = vi.fn();
    const config = createMockWizardConfig({
      allowReopen: true,
      onAllComplete,
      steps: [
        { stepId: 'step-1', label: 'Step 1', required: true },
        { stepId: 'step-2', label: 'Step 2', required: true },
      ],
    });
    const { result } = renderHook(() => useStepWizard(config, {}), {
      wrapper: createWizardWrapper(mockWizardStates.complete),
    });
    act(() => { result.current.reopenStep('step-1'); });
    expect(result.current.state.steps[0].status).toBe('in-progress');
    expect(result.current.state.onAllCompleteFired).toBe(false);
  });

  it('goTo in sequential-with-jumps records visit on target step (D-01)', () => {
    const config = createMockWizardConfig({
      orderMode: 'sequential-with-jumps',
      steps: [
        { stepId: 'step-1', label: 'Step 1', required: true, order: 1 },
        { stepId: 'step-2', label: 'Step 2', required: true, order: 2 },
      ],
    });
    // Start with step-1 and step-2 visited so step-2 is unlocked
    const draft = {
      ...mockWizardStates.notStarted.draft,
      visitedStepIds: ['step-1', 'step-2'],
      stepStatuses: { 'step-1': 'in-progress' as const, 'step-2': 'not-started' as const, 'step-3': 'not-started' as const },
    };
    const { result } = renderHook(() => useStepWizard(config, {}), {
      wrapper: createWizardWrapper({ draft }),
    });
    act(() => { result.current.goTo('step-2'); });
    expect(result.current.state.steps[1].status).toBe('in-progress');
  });

  it('getValidationError returns null for unvalidated step', () => {
    const config = createMockWizardConfig();
    const { result } = renderHook(() => useStepWizard(config, {}), {
      wrapper: createWizardWrapper(),
    });
    expect(result.current.getValidationError('step-1')).toBeNull();
  });

  it('advance does nothing when wizard is complete (no activeStepId)', () => {
    const config = createMockWizardConfig({ draftKey: 'test-complete-advance' });
    const { result } = renderHook(() => useStepWizard(config, {}), {
      wrapper: createWizardWrapper(mockWizardStates.complete),
    });
    expect(result.current.state.isComplete).toBe(true);
    act(() => { result.current.advance(); });
    // No crash, stays complete
    expect(result.current.state.isComplete).toBe(true);
  });

  it('overdue polling skips complete/skipped steps', async () => {
    vi.useFakeTimers();
    const pastDue = new Date(Date.now() - 1000).toISOString();
    const config = createMockWizardConfig({
      steps: [
        { stepId: 'step-1', label: 'Step 1', required: true, dueDate: () => pastDue },
        { stepId: 'step-2', label: 'Step 2', required: true, dueDate: () => pastDue },
      ],
      draftKey: 'test-overdue-skip',
    });
    const draft = {
      ...mockWizardStates.notStarted.draft,
      stepStatuses: {
        'step-1': 'complete' as const,
        'step-2': 'in-progress' as const,
        'step-3': 'not-started' as const,
      },
    };
    const { result } = renderHook(() => useStepWizard(config, {}), {
      wrapper: createWizardWrapper({ draft }),
    });
    // step-1 is complete so NOT overdue; step-2 is in-progress and past due so IS overdue
    expect(result.current.state.steps.find((s) => s.stepId === 'step-1')?.isOverdue).toBe(false);
    expect(result.current.state.steps.find((s) => s.stepId === 'step-2')?.isOverdue).toBe(true);
    vi.useRealTimers();
  });

  it('overdue polling handles non-overdue step (dueDate in future)', async () => {
    vi.useFakeTimers();
    const futureDue = new Date(Date.now() + 100000).toISOString();
    const config = createMockWizardConfig({
      steps: [
        { stepId: 'step-1', label: 'Step 1', required: true, dueDate: () => futureDue },
      ],
    });
    const { result } = renderHook(() => useStepWizard(config, {}), {
      wrapper: createWizardWrapper(),
    });
    expect(result.current.state.steps[0].isOverdue).toBe(false);
    vi.useRealTimers();
  });

  it('overdue polling handles null dueDate', async () => {
    vi.useFakeTimers();
    const config = createMockWizardConfig({
      steps: [
        { stepId: 'step-1', label: 'Step 1', required: true, dueDate: () => null },
      ],
    });
    const { result } = renderHook(() => useStepWizard(config, {}), {
      wrapper: createWizardWrapper(),
    });
    expect(result.current.state.steps[0].isOverdue).toBe(false);
    vi.useRealTimers();
  });

  it('initialises without draftKey — reads no stored draft', () => {
    const config = createMockWizardConfig({ draftKey: undefined });
    const { result } = renderHook(() => useStepWizard(config, {}), {
      wrapper: createWizardWrapper(),
    });
    expect(result.current.state.steps.every((s) => s.status === 'not-started')).toBe(true);
  });
});
