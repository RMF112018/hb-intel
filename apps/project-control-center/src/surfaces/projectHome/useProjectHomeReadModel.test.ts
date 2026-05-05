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
    // Wave 13E — Procore-derived candidates may append after the home
    // envelope's priorityActions. Wave 14 / Prompt 06 — approvals-derived
    // candidates also append. Assert prefix-equality plus category
    // membership in the approved appended-source set on every appended
    // item.
    expect(vm?.priorityActions.data.slice(0, SAMPLE_PRIORITY_ACTIONS.length)).toEqual(
      SAMPLE_PRIORITY_ACTIONS,
    );
    const appendedSources: ReadonlySet<string> = new Set(['procore-sync', 'approval']);
    for (const appended of vm?.priorityActions.data.slice(SAMPLE_PRIORITY_ACTIONS.length) ?? []) {
      expect(appendedSources.has(appended.category)).toBe(true);
    }
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

  it('invokes getProjectHome, getPriorityActions, getDocumentControl, and the two Procore methods in parallel', async () => {
    const client = createPccFixtureReadModelClient();
    const homeSpy = vi.spyOn(client, 'getProjectHome');
    const prioritySpy = vi.spyOn(client, 'getPriorityActions');
    const docSpy = vi.spyOn(client, 'getDocumentControl');
    const procoreMappingSpy = vi.spyOn(client, 'getProcoreProjectMapping');
    const procoreSyncSpy = vi.spyOn(client, 'getProcoreSyncHealth');
    const { result } = renderHook(() => useProjectHomeReadModel(client, PROJECT_ID));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(homeSpy).toHaveBeenCalledTimes(1);
    expect(prioritySpy).toHaveBeenCalledTimes(1);
    expect(docSpy).toHaveBeenCalledTimes(1);
    expect(procoreMappingSpy).toHaveBeenCalledTimes(1);
    expect(procoreSyncSpy).toHaveBeenCalledTimes(1);
    expect(homeSpy).toHaveBeenCalledWith(PROJECT_ID);
    expect(prioritySpy).toHaveBeenCalledWith(PROJECT_ID);
    expect(docSpy).toHaveBeenCalledWith(PROJECT_ID);
    expect(procoreMappingSpy).toHaveBeenCalledWith(PROJECT_ID);
    expect(procoreSyncSpy).toHaveBeenCalledWith(PROJECT_ID);
  });

  it('priorityActions slot reflects the standalone priority-actions envelope, not the home envelope', async () => {
    const baseClient = createPccFixtureReadModelClient();
    const altActions: PccPriorityActionsReadModel['actions'] = [SAMPLE_PRIORITY_ACTIONS[0]!];
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
      getProcoreProjectMapping: (id, persona) => baseClient.getProcoreProjectMapping(id, persona),
      getProcoreSyncHealth: (id, persona) => baseClient.getProcoreSyncHealth(id, persona),
      getUnifiedLifecycle: async () => SAMPLE_UNIFIED_LIFECYCLE_ENVELOPE,
      getUnifiedSearch: (id, persona, query) => baseClient.getUnifiedSearch(id, persona, query),
      // Wave 14 / Prompt 06 — provider-family-test alignment: hook now
      // also resolves getApprovals (via per-call `.catch(() => undefined)`).
      getApprovals: (id, persona) => baseClient.getApprovals(id, persona),
    };
    const { result } = renderHook(() => useProjectHomeReadModel(client, PROJECT_ID));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    // Wave 13E — Procore-derived candidates flow through `category:'procore-sync'`.
    // Wave 14 / Prompt 06 — approvals-derived candidates flow through
    // `category:'approval'`. Filter both out to keep the standalone-envelope
    // assertion focused on the supplied envelope contents.
    const nonProcoreActions = result.current.viewModel?.priorityActions.data?.filter(
      (action) => action.category !== 'procore-sync' && action.category !== 'approval',
    );
    expect(nonProcoreActions).toEqual(altActions);
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
      getProcoreProjectMapping: (id, persona) => baseClient.getProcoreProjectMapping(id, persona),
      getProcoreSyncHealth: (id, persona) => baseClient.getProcoreSyncHealth(id, persona),
      getUnifiedLifecycle: async () => SAMPLE_UNIFIED_LIFECYCLE_ENVELOPE,
      getUnifiedSearch: (id, persona, query) => baseClient.getUnifiedSearch(id, persona, query),
      // Wave 14 / Prompt 06 — provider-family-test alignment: hook now
      // also resolves getApprovals (via per-call `.catch(() => undefined)`).
      getApprovals: (id, persona) => baseClient.getApprovals(id, persona),
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

  it('does not call getUnifiedLifecycle or getUnifiedSearch (Wave 99 / Prompts 05B + 06C architectural lock)', async () => {
    // The unified-lifecycle aggregate envelope is consumed exclusively by
    // PccProjectHomeUnifiedLifecycleSection via useUnifiedLifecycleReadModel.
    // The unified-search (Ask HBI) envelope is consumed exclusively by
    // PccProjectHomeAskHbiSection via useUnifiedSearchReadModel inside the
    // panel. useProjectHomeReadModel must continue to call only its three
    // existing methods (getProjectHome, getPriorityActions,
    // getDocumentControl) and must NEVER call getUnifiedLifecycle or
    // getUnifiedSearch.
    const client = createPccFixtureReadModelClient();
    const homeSpy = vi.spyOn(client, 'getProjectHome');
    const prioritySpy = vi.spyOn(client, 'getPriorityActions');
    const docSpy = vi.spyOn(client, 'getDocumentControl');
    const unifiedSpy = vi.spyOn(client, 'getUnifiedLifecycle');
    const unifiedSearchSpy = vi.spyOn(client, 'getUnifiedSearch');
    const { result } = renderHook(() => useProjectHomeReadModel(client, PROJECT_ID));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(homeSpy).toHaveBeenCalledTimes(1);
    expect(prioritySpy).toHaveBeenCalledTimes(1);
    expect(docSpy).toHaveBeenCalledTimes(1);
    expect(unifiedSpy).not.toHaveBeenCalled();
    expect(unifiedSearchSpy).not.toHaveBeenCalled();
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

  it('reaches `ready` with `source-unavailable` slots when getProjectHome rejects (per-call catch)', async () => {
    // Wave 99: under hosted SPFx runtime a single read-model call can reject
    // (e.g., a transient transport failure). The hook wraps every call in
    // `.catch(() => undefined)` so a rejection degrades to a per-slot
    // `'source-unavailable'` posture rather than stalling the surface in
    // `'loading'` forever (the prior bug that drove the tenant skeleton
    // symptom). This test mocks `getProjectHome` to reject and asserts the
    // hook still reaches `'ready'`, with home-derived slots flagged as
    // source-unavailable while non-home-dependent slots resolve normally.
    const baseClient = createPccFixtureReadModelClient();
    const client: IPccProjectHomeReadModelClient = {
      getProjectHome: () => Promise.reject(new Error('transient transport failure')),
      getDocumentControl: (id, persona) => baseClient.getDocumentControl(id, persona),
      getPriorityActions: (id, persona) => baseClient.getPriorityActions(id, persona),
      getProcoreProjectMapping: (id, persona) => baseClient.getProcoreProjectMapping(id, persona),
      getProcoreSyncHealth: (id, persona) => baseClient.getProcoreSyncHealth(id, persona),
      getUnifiedLifecycle: (id, persona) => baseClient.getUnifiedLifecycle(id, persona),
      getUnifiedSearch: (id, persona, query) => baseClient.getUnifiedSearch(id, persona, query),
      getApprovals: (id, persona) => baseClient.getApprovals(id, persona),
    };
    const { result } = renderHook(() => useProjectHomeReadModel(client, PROJECT_ID));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    const vm = result.current.viewModel;
    expect(vm).toBeDefined();
    expect(vm?.intelligence.sourceStatus).toBe('source-unavailable');
    expect(vm?.intelligence.state).toBe('unavailable-fixture');
    expect(vm?.intelligence.data).toBeUndefined();
    expect(vm?.siteHealth.sourceStatus).toBe('source-unavailable');
    expect(vm?.missingConfigurations.sourceStatus).toBe('source-unavailable');
    // documentControl slot stays resolved because its envelope didn't reject.
    expect(vm?.documentControl.sourceStatus).toBe('available');
  });

  it('reaches `ready` with all degraded slots when every read-model call rejects', async () => {
    // Worst-case rejection: every call fails. The hook must not hang in
    // `'loading'`; it must produce a fully-degraded view-model so the
    // surface renders `'unavailable-fixture'` cards rather than skeleton.
    const reject = () => Promise.reject(new Error('all calls rejected'));
    const client: IPccProjectHomeReadModelClient = {
      getProjectHome: reject,
      getDocumentControl: reject,
      getPriorityActions: reject,
      getProcoreProjectMapping: reject,
      getProcoreSyncHealth: reject,
      getUnifiedLifecycle: reject,
      getUnifiedSearch: reject,
      getApprovals: reject,
    };
    const { result } = renderHook(() => useProjectHomeReadModel(client, PROJECT_ID));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    const vm = result.current.viewModel;
    expect(vm).toBeDefined();
    for (const key of [
      'intelligence',
      'siteHealth',
      'documentControl',
      'missingConfigurations',
      'priorityActions',
      'procoreSnapshot',
    ] as const) {
      expect(vm?.[key].sourceStatus).toBe('source-unavailable');
    }
    expect(vm?.intelligence.data).toBeUndefined();
    expect(vm?.siteHealth.data).toBeUndefined();
    expect(vm?.documentControl.data).toEqual([]);
    expect(vm?.missingConfigurations.data).toEqual([]);
    expect(vm?.priorityActions.data).toEqual([]);
    // Approvals card view-model is omitted when the approvals envelope is
    // absent (existing Wave 14 contract; preserved when getApprovals
    // rejects).
    expect(vm?.approvalsCard).toBeUndefined();
  });
});
