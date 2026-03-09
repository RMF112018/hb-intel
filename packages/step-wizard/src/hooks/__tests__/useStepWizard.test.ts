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
});
