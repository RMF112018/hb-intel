import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import {
  SAMPLE_EXTERNAL_SYSTEM_MISSING_CONFIGS,
  SAMPLE_PRIORITY_ACTIONS,
  SAMPLE_PROJECT_PROFILE,
  SAMPLE_SITE_HEALTH_SUMMARY,
  SAMPLE_UNIFIED_LIFECYCLE_ENVELOPE,
  type PccPriorityActionsReadModel,
  type PccProjectId,
  type PccReadModelEnvelope,
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

  it('invokes getProjectHome, getPriorityActions, and getDocumentControl in parallel', async () => {
    const client = createPccFixtureReadModelClient();
    const homeSpy = vi.spyOn(client, 'getProjectHome');
    const prioritySpy = vi.spyOn(client, 'getPriorityActions');
    const docSpy = vi.spyOn(client, 'getDocumentControl');
    const { result } = renderHook(() => useProjectHomeReadModel(client, PROJECT_ID));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(homeSpy).toHaveBeenCalledTimes(1);
    expect(prioritySpy).toHaveBeenCalledTimes(1);
    expect(docSpy).toHaveBeenCalledTimes(1);
    expect(homeSpy).toHaveBeenCalledWith(PROJECT_ID);
    expect(prioritySpy).toHaveBeenCalledWith(PROJECT_ID);
    expect(docSpy).toHaveBeenCalledWith(PROJECT_ID);
  });

  it('priorityActions slot reflects the standalone priority-actions envelope, not the home envelope', async () => {
    const baseClient = createPccFixtureReadModelClient();
    const altActions: PccPriorityActionsReadModel['actions'] = [
      SAMPLE_PRIORITY_ACTIONS[0]!,
    ];
    const altEnvelope: PccReadModelEnvelope<PccPriorityActionsReadModel> = {
      projectId: PROJECT_ID,
      mode: 'mock',
      sourceStatus: 'available',
      readOnly: true,
      warnings: [],
      generatedAtUtc: '2026-04-30T00:00:00.000Z',
      data: { actions: altActions },
    };
    const client: IPccProjectHomeReadModelClient = {
      getProjectHome: (id, persona) => baseClient.getProjectHome(id, persona),
      getDocumentControl: (id, persona) => baseClient.getDocumentControl(id, persona),
      getPriorityActions: async () => altEnvelope,
      getUnifiedLifecycle: async () => SAMPLE_UNIFIED_LIFECYCLE_ENVELOPE,
    };
    const { result } = renderHook(() => useProjectHomeReadModel(client, PROJECT_ID));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.viewModel?.priorityActions.data).toEqual(altActions);
    expect(result.current.viewModel?.priorityActions.sourceStatus).toBe('available');
  });

  it('priorityActions slot reflects backend-unavailable from the standalone envelope only when home is available', async () => {
    const baseClient = createPccFixtureReadModelClient();
    const unavailableEnvelope: PccReadModelEnvelope<PccPriorityActionsReadModel> = {
      projectId: PROJECT_ID,
      mode: 'mock',
      sourceStatus: 'backend-unavailable',
      readOnly: true,
      warnings: [],
      generatedAtUtc: '2026-04-30T00:00:00.000Z',
      data: { actions: [] },
    };
    const client: IPccProjectHomeReadModelClient = {
      getProjectHome: (id, persona) => baseClient.getProjectHome(id, persona),
      getDocumentControl: (id, persona) => baseClient.getDocumentControl(id, persona),
      getPriorityActions: async () => unavailableEnvelope,
      getUnifiedLifecycle: async () => SAMPLE_UNIFIED_LIFECYCLE_ENVELOPE,
    };
    const { result } = renderHook(() => useProjectHomeReadModel(client, PROJECT_ID));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    const vm = result.current.viewModel;
    expect(vm?.priorityActions.state).toBe('error');
    expect(vm?.priorityActions.sourceStatus).toBe('backend-unavailable');
    expect(vm?.intelligence.state).toBe('preview');
    expect(vm?.siteHealth.state).toBe('preview');
    expect(vm?.documentControl.state).toBe('preview');
    expect(vm?.missingConfigurations.state).toBe('preview');
  });

  it('does not call getUnifiedLifecycle (Wave 99 / Prompt 05B architectural lock)', async () => {
    // The unified-lifecycle aggregate envelope is consumed exclusively by
    // PccProjectHomeUnifiedLifecycleSection via useUnifiedLifecycleReadModel.
    // useProjectHomeReadModel must continue to call only its three existing
    // methods (getProjectHome, getPriorityActions, getDocumentControl) and
    // must NEVER call getUnifiedLifecycle.
    const client = createPccFixtureReadModelClient();
    const homeSpy = vi.spyOn(client, 'getProjectHome');
    const prioritySpy = vi.spyOn(client, 'getPriorityActions');
    const docSpy = vi.spyOn(client, 'getDocumentControl');
    const unifiedSpy = vi.spyOn(client, 'getUnifiedLifecycle');
    const { result } = renderHook(() => useProjectHomeReadModel(client, PROJECT_ID));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(homeSpy).toHaveBeenCalledTimes(1);
    expect(prioritySpy).toHaveBeenCalledTimes(1);
    expect(docSpy).toHaveBeenCalledTimes(1);
    expect(unifiedSpy).not.toHaveBeenCalled();
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
