import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import {
  SAMPLE_PROJECT_PROFILE,
  SAMPLE_TEAM_ACCESS_PREVIEW_MODEL,
  type PccProjectId,
  type PccReadModelEnvelope,
  type PccTeamAccessReadModel,
} from '@hbc/models/pcc';
import { createPccFixtureReadModelClient } from '../../api/pccFixtureReadModelClient';
import {
  useTeamAccessReadModel,
  type IPccTeamAccessReadModelClient,
} from './useTeamAccessReadModel';

const PROJECT_ID: PccProjectId = SAMPLE_PROJECT_PROFILE.projectId;

describe('useTeamAccessReadModel — fixture-default behavior', () => {
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

  it('initial render reports loading status with no data', () => {
    const client = createPccFixtureReadModelClient();
    const { result } = renderHook(() => useTeamAccessReadModel(client, PROJECT_ID));
    expect(result.current.status).toBe('loading');
    expect(result.current.data).toBeUndefined();
  });

  it('resolves to preview with the fixture envelope data', async () => {
    const client = createPccFixtureReadModelClient();
    const { result } = renderHook(() => useTeamAccessReadModel(client, PROJECT_ID));
    await waitFor(() => expect(result.current.status).toBe('preview'));
    expect(result.current.sourceStatus).toBe('available');
    expect(result.current.data?.preview).toBe(SAMPLE_TEAM_ACCESS_PREVIEW_MODEL);
  });

  it('resolves to error when simulateBackendUnavailable is set', async () => {
    const client = createPccFixtureReadModelClient({ simulateBackendUnavailable: true });
    const { result } = renderHook(() => useTeamAccessReadModel(client, PROJECT_ID));
    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.sourceStatus).toBe('backend-unavailable');
  });
});

describe('useTeamAccessReadModel — error + cancellation paths', () => {
  it('promise rejection sets error state without throwing', async () => {
    const rejectingClient: IPccTeamAccessReadModelClient = {
      async getTeamAccess() {
        throw new Error('boom');
      },
    };
    const { result } = renderHook(() =>
      useTeamAccessReadModel(rejectingClient, PROJECT_ID),
    );
    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.sourceStatus).toBeUndefined();
    expect(result.current.data).toBeUndefined();
  });

  it('mounted-flag cancellation: state setter is not called after unmount', async () => {
    type ResolveFn = (env: PccReadModelEnvelope<PccTeamAccessReadModel>) => void;
    const deferred: { resolve: ResolveFn | null } = { resolve: null };
    const pendingClient: IPccTeamAccessReadModelClient = {
      getTeamAccess() {
        return new Promise<PccReadModelEnvelope<PccTeamAccessReadModel>>((resolve) => {
          deferred.resolve = resolve;
        });
      },
    };
    const { result, unmount } = renderHook(() =>
      useTeamAccessReadModel(pendingClient, PROJECT_ID),
    );
    expect(result.current.status).toBe('loading');
    unmount();
    deferred.resolve?.({
      projectId: PROJECT_ID,
      mode: 'fixture',
      sourceStatus: 'available',
      readOnly: true,
      warnings: [],
      generatedAtUtc: '2026-04-30T00:00:00.000Z',
      data: { preview: SAMPLE_TEAM_ACCESS_PREVIEW_MODEL },
    });
    await new Promise((r) => setTimeout(r, 0));
    // The state remains 'loading' because cancellation was set before resolve.
    expect(result.current.status).toBe('loading');
  });

  it('refetches when the projectId changes', async () => {
    const spy = vi.fn(async (id: PccProjectId) => ({
      projectId: id,
      mode: 'fixture' as const,
      sourceStatus: 'available' as const,
      readOnly: true as const,
      warnings: [],
      generatedAtUtc: '2026-04-30T00:00:00.000Z',
      data: { preview: SAMPLE_TEAM_ACCESS_PREVIEW_MODEL },
    }));
    const client: IPccTeamAccessReadModelClient = { getTeamAccess: spy };
    const { result, rerender } = renderHook(
      ({ id }: { id: PccProjectId }) => useTeamAccessReadModel(client, id),
      { initialProps: { id: PROJECT_ID } },
    );
    await waitFor(() => expect(result.current.status).toBe('preview'));
    expect(spy).toHaveBeenCalledTimes(1);
    rerender({ id: 'other-project' as PccProjectId });
    await waitFor(() => expect(spy).toHaveBeenCalledTimes(2));
  });
});
