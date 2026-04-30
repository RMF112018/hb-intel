import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import {
  SAMPLE_EXTERNAL_SYSTEM_MISSING_CONFIGS,
  SAMPLE_PRIORITY_ACTIONS,
  SAMPLE_PROJECT_PROFILE,
  SAMPLE_SITE_HEALTH_SUMMARY,
  type PccProjectId,
} from '@hbc/models/pcc';
import { createPccFixtureReadModelClient } from '../../api/pccFixtureReadModelClient';
import { useProjectHomeReadModel } from './useProjectHomeReadModel';
import type { IPccProjectHomeReadModelClient } from './projectHomeViewModel';

const PROJECT_ID: PccProjectId = SAMPLE_PROJECT_PROFILE.projectId;

describe('useProjectHomeReadModel', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => {
        throw new Error('fetch must not be called by the hook with the fixture client');
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('initial render reports loading status with no view model', () => {
    const client = createPccFixtureReadModelClient();
    const { result } = renderHook(() => useProjectHomeReadModel(client, PROJECT_ID));
    expect(result.current.status).toBe('loading');
    expect(result.current.viewModel).toBeUndefined();
  });

  it('resolves to ready with the fixture view model after the microtask', async () => {
    const client = createPccFixtureReadModelClient();
    const { result } = renderHook(() => useProjectHomeReadModel(client, PROJECT_ID));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    const vm = result.current.viewModel;
    expect(vm).toBeDefined();
    expect(vm?.intelligence.state).toBe('preview');
    expect(vm?.intelligence.sourceStatus).toBe('available');
    expect(vm?.intelligence.data?.projectId).toBe(SAMPLE_PROJECT_PROFILE.projectId);
    expect(vm?.priorityActions.data).toEqual(SAMPLE_PRIORITY_ACTIONS);
    expect(vm?.siteHealth.data).toEqual(SAMPLE_SITE_HEALTH_SUMMARY);
    expect(vm?.missingConfigurations.data).toEqual(SAMPLE_EXTERNAL_SYSTEM_MISSING_CONFIGS);
    expect(vm?.documentControl.state).toBe('preview');
  });

  it('reports error state for every slot when simulateBackendUnavailable is set', async () => {
    const client = createPccFixtureReadModelClient({ simulateBackendUnavailable: true });
    const { result } = renderHook(() => useProjectHomeReadModel(client, PROJECT_ID));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    const vm = result.current.viewModel;
    expect(vm).toBeDefined();
    for (const key of [
      'intelligence',
      'priorityActions',
      'siteHealth',
      'documentControl',
      'missingConfigurations',
    ] as const) {
      expect(vm?.[key].state).toBe('error');
      expect(vm?.[key].sourceStatus).toBe('backend-unavailable');
    }
  });

  it('refetches when the client identity changes', async () => {
    const clientA = createPccFixtureReadModelClient();
    const clientB = createPccFixtureReadModelClient({ simulateBackendUnavailable: true });
    let currentClient: IPccProjectHomeReadModelClient = clientA;

    const { result, rerender } = renderHook(() =>
      useProjectHomeReadModel(currentClient, PROJECT_ID),
    );
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.viewModel?.intelligence.sourceStatus).toBe('available');

    await act(async () => {
      currentClient = clientB;
      rerender();
    });
    await waitFor(() =>
      expect(result.current.viewModel?.intelligence.sourceStatus).toBe('backend-unavailable'),
    );
  });
});
