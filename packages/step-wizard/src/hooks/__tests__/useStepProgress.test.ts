// hooks/__tests__/useStepProgress.test.ts
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useStepProgress } from '../useStepProgress';
import { createMockWizardConfig, createWizardWrapper, mockWizardStates } from '@hbc/step-wizard/testing';

describe('useStepProgress', () => {
  it('returns zeros with isStale=false when no draft exists', () => {
    const config = createMockWizardConfig({ draftKey: undefined });
    const { result } = renderHook(() => useStepProgress(config, {}), {
      wrapper: createWizardWrapper(),
    });
    expect(result.current.completedCount).toBe(0);
    expect(result.current.requiredCount).toBe(2);
    expect(result.current.percentComplete).toBe(0);
    expect(result.current.isComplete).toBe(false);
    expect(result.current.isStale).toBe(false);
  });

  it('returns correct counts with draft', () => {
    const config = createMockWizardConfig({ draftKey: 'test-progress' });
    const { result } = renderHook(() => useStepProgress(config, {}), {
      wrapper: createWizardWrapper(mockWizardStates.inProgress),
    });
    expect(result.current.completedCount).toBe(1);
    expect(result.current.requiredCount).toBe(2);
    expect(result.current.percentComplete).toBe(50);
    expect(result.current.isComplete).toBe(false);
  });

  it('detects stale draft (savedAt > 24h ago)', () => {
    const staleDraft = {
      ...mockWizardStates.inProgress.draft,
      savedAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
    };
    const config = createMockWizardConfig({ draftKey: 'test-stale' });
    const { result } = renderHook(() => useStepProgress(config, {}), {
      wrapper: createWizardWrapper({ draft: staleDraft }),
    });
    expect(result.current.isStale).toBe(true);
  });

  it('returns isComplete=true and percentComplete=100 when all required done', () => {
    const config = createMockWizardConfig({ draftKey: 'test-complete' });
    const { result } = renderHook(() => useStepProgress(config, {}), {
      wrapper: createWizardWrapper(mockWizardStates.complete),
    });
    expect(result.current.isComplete).toBe(true);
    expect(result.current.percentComplete).toBe(100);
    expect(result.current.completedCount).toBe(3);
  });
});
