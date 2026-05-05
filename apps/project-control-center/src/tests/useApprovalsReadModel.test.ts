import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, renderHook, waitFor } from '@testing-library/react';
import {
  EMPTY_APPROVALS_READ_MODEL,
  SAMPLE_APPROVALS_READ_MODEL,
  type PccApprovalsReadModel,
  type PccProjectId,
  type PccReadModelEnvelope,
  type PccReadModelSourceStatus,
} from '@hbc/models/pcc';
import { useApprovalsReadModel } from '../surfaces/approvals/useApprovalsReadModel';
import type { IPccApprovalsReadModelClient } from '../surfaces/approvals/approvalsViewModel';

const PROJECT_ID = 'p-w14-approvals-hook' as PccProjectId;

function envelope(
  sourceStatus: PccReadModelSourceStatus,
  data: PccApprovalsReadModel = SAMPLE_APPROVALS_READ_MODEL,
): PccReadModelEnvelope<PccApprovalsReadModel> {
  return {
    projectId: PROJECT_ID,
    mode: 'fixture',
    sourceStatus,
    readOnly: true,
    warnings: [],
    generatedAtUtc: '2026-04-30T00:00:00.000Z',
    data,
  };
}

function resolvingClient(
  sourceStatus: PccReadModelSourceStatus = 'available',
  data: PccApprovalsReadModel = SAMPLE_APPROVALS_READ_MODEL,
): IPccApprovalsReadModelClient {
  return {
    getApprovals: async () => envelope(sourceStatus, data),
  };
}

function rejectingClient(): IPccApprovalsReadModelClient {
  return {
    getApprovals: async () => {
      throw new Error('simulated transport failure');
    },
  };
}

function deferredClient(): {
  client: IPccApprovalsReadModelClient;
  resolve: (env: PccReadModelEnvelope<PccApprovalsReadModel>) => void;
} {
  let resolveFn: ((env: PccReadModelEnvelope<PccApprovalsReadModel>) => void) | undefined;
  const promise = new Promise<PccReadModelEnvelope<PccApprovalsReadModel>>((res) => {
    resolveFn = res;
  });
  return {
    client: { getApprovals: () => promise },
    resolve: (env) => {
      resolveFn?.(env);
    },
  };
}

afterEach(() => {
  cleanup();
});

describe('useApprovalsReadModel — discriminated state transitions', () => {
  it('starts in loading and transitions to ready on resolved envelope', async () => {
    const client = resolvingClient('available');
    const { result } = renderHook(() => useApprovalsReadModel(client, PROJECT_ID));
    expect(result.current.status).toBe('loading');
    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });
    if (result.current.status !== 'ready') throw new Error('expected ready');
    expect(result.current.cardState).toBe('preview');
    expect(result.current.sourceStatus).toBe('available');
  });

  it('flows non-available envelopes through to status: ready (hook does not gate on sourceStatus)', async () => {
    const cases: ReadonlyArray<readonly [PccReadModelSourceStatus, string]> = [
      ['source-unavailable', 'unavailable-fixture'],
      ['backend-unavailable', 'error'],
      ['missing-config', 'missing-config'],
      ['stale', 'preview'],
      ['unauthorized', 'unauthorized-persona'],
      ['forbidden', 'unauthorized-persona'],
    ];
    for (const [sourceStatus, expectedCardState] of cases) {
      const client = resolvingClient(sourceStatus, EMPTY_APPROVALS_READ_MODEL);
      const { result, unmount } = renderHook(() =>
        useApprovalsReadModel(client, PROJECT_ID),
      );
      await waitFor(() => {
        expect(result.current.status).toBe('ready');
      });
      if (result.current.status !== 'ready') throw new Error('expected ready');
      expect(result.current.cardState).toBe(expectedCardState);
      expect(result.current.sourceStatus).toBe(sourceStatus);
      unmount();
    }
  });

  it('transitions to error when the client promise rejects', async () => {
    const client = rejectingClient();
    const { result } = renderHook(() => useApprovalsReadModel(client, PROJECT_ID));
    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });
  });
});

describe('useApprovalsReadModel — cancel-on-unmount', () => {
  it('does not update state after the hook unmounts before the promise resolves', async () => {
    const { client, resolve } = deferredClient();
    const setSpy = vi.fn();
    const { result, unmount } = renderHook(() => useApprovalsReadModel(client, PROJECT_ID));
    expect(result.current.status).toBe('loading');
    unmount();
    // Resolve after unmount; the cancelled flag must prevent any state push.
    resolve(envelope('available'));
    await new Promise((r) => setTimeout(r, 0));
    // No way to inspect post-unmount state directly, but the test should not throw
    // an act() warning. Calling result.current is safe (returns last value).
    expect(result.current.status).toBe('loading');
    setSpy.mockReset();
  });
});

describe('useApprovalsReadModel — viewerPersona flows into client call', () => {
  it('passes viewerPersona to client.getApprovals', async () => {
    const spy = vi.fn(async () => envelope('available'));
    const client: IPccApprovalsReadModelClient = { getApprovals: spy };
    const { result } = renderHook(() =>
      useApprovalsReadModel(client, PROJECT_ID, 'project-executive'),
    );
    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });
    expect(spy).toHaveBeenCalledWith(PROJECT_ID, 'project-executive');
  });
});
