import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { IQueuedOperation } from '@hbc/session-state';

vi.mock('@hbc/session-state', () => ({
  listPending: vi.fn(),
}));

import { listPending } from '@hbc/session-state';
import { draftResumeAdapter } from '../../adapters/draftResumeAdapter.js';
import { createMockRuntimeContext, createMockMyWorkQuery } from '@hbc/my-work-feed/testing';

const mockListPending = vi.mocked(listPending);

function createQueuedOperation(overrides?: Partial<IQueuedOperation>): IQueuedOperation {
  return {
    operationId: 'op-001',
    type: 'upload',
    target: '/documents/report.pdf',
    payload: { fileSize: 1024 },
    retryCount: 0,
    maxRetries: 3,
    createdAt: '2026-01-15T10:00:00.000Z',
    lastAttemptAt: null,
    lastError: null,
    ...overrides,
  };
}

describe('draftResumeAdapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reports isEnabled as true', () => {
    expect(draftResumeAdapter.isEnabled(createMockRuntimeContext())).toBe(true);
  });

  it('maps queued operations with class queued-follow-up', async () => {
    mockListPending.mockResolvedValue([createQueuedOperation()]);

    const items = await draftResumeAdapter.load(createMockMyWorkQuery(), createMockRuntimeContext());
    expect(items).toHaveLength(1);
    expect(items[0].class).toBe('queued-follow-up');
    expect(items[0].priority).toBe('watch');
    expect(items[0].state).toBe('waiting');
  });

  it('derives title from operation type', async () => {
    mockListPending.mockResolvedValue([
      createQueuedOperation({ type: 'upload' }),
      createQueuedOperation({ operationId: 'op-002', type: 'form-save' }),
      createQueuedOperation({ operationId: 'op-003', type: 'acknowledgment' }),
      createQueuedOperation({ operationId: 'op-004', type: 'api-mutation' }),
      createQueuedOperation({ operationId: 'op-005', type: 'notification-action' }),
    ]);

    const items = await draftResumeAdapter.load(createMockMyWorkQuery(), createMockRuntimeContext());
    expect(items[0].title).toBe('Queued upload');
    expect(items[1].title).toBe('Queued form save');
    expect(items[2].title).toBe('Queued acknowledgment');
    expect(items[3].title).toBe('Queued API update');
    expect(items[4].title).toBe('Queued notification action');
  });

  it('sets offlineCapable to true', async () => {
    mockListPending.mockResolvedValue([createQueuedOperation()]);

    const items = await draftResumeAdapter.load(createMockMyWorkQuery(), createMockRuntimeContext());
    expect(items[0].offlineCapable).toBe(true);
  });

  it('includes retry state in summary when there is an error', async () => {
    mockListPending.mockResolvedValue([
      createQueuedOperation({
        retryCount: 2,
        maxRetries: 3,
        lastError: 'Network timeout',
        lastAttemptAt: '2026-01-15T12:00:00.000Z',
      }),
    ]);

    const items = await draftResumeAdapter.load(createMockMyWorkQuery(), createMockRuntimeContext());
    expect(items[0].summary).toContain('retry 2/3');
    expect(items[0].summary).toContain('Network timeout');
    expect(items[0].lifecycle.currentStepLabel).toBe('Retrying');
  });

  it('shows target as summary when no error', async () => {
    mockListPending.mockResolvedValue([createQueuedOperation()]);

    const items = await draftResumeAdapter.load(createMockMyWorkQuery(), createMockRuntimeContext());
    expect(items[0].summary).toBe('/documents/report.pdf');
    expect(items[0].lifecycle.currentStepLabel).toBe('Pending');
  });

  it('sets canAct false with cannotActReason populated (per P2-A3 §1.5)', async () => {
    mockListPending.mockResolvedValue([createQueuedOperation()]);

    const items = await draftResumeAdapter.load(createMockMyWorkQuery(), createMockRuntimeContext());
    expect(items[0].permissionState.canOpen).toBe(false);
    expect(items[0].permissionState.canAct).toBe(false);
    expect(items[0].permissionState.cannotActReason).toBe('Queued operations are managed automatically by the sync queue');
  });

  it('returns empty array when no pending operations', async () => {
    mockListPending.mockResolvedValue([]);

    const items = await draftResumeAdapter.load(createMockMyWorkQuery(), createMockRuntimeContext());
    expect(items).toEqual([]);
  });

  it('builds correct dedupeKey and workItemId', async () => {
    mockListPending.mockResolvedValue([
      createQueuedOperation({ operationId: 'op-xyz', type: 'upload', target: '/docs/file.pdf' }),
    ]);

    const items = await draftResumeAdapter.load(createMockMyWorkQuery(), createMockRuntimeContext());
    expect(items[0].dedupeKey).toBe('queue::upload::/docs/file.pdf');
    expect(items[0].workItemId).toBe('session-state::op-xyz');
  });
});
