import { describe, it, expect, beforeEach } from 'vitest';
import { AdminRunStatus, AdminExecutionMode, AdminRiskLevel } from '@hbc/models/admin-control-plane';
import type { IAdminActorContext, IAdminRunLaunchRequest } from '@hbc/models/admin-control-plane';
import { InMemoryAdminRunService } from '../in-memory-run-service.js';

/**
 * P3-05: In-memory admin run service tests.
 *
 * Validates the run lifecycle: launch, status retrieval, history listing,
 * cancel, and retry. These tests verify the command-handler skeleton
 * produces stable response envelopes.
 */

const TEST_ACTOR: IAdminActorContext = {
  upn: 'admin@hb.com',
  objectId: 'oid-admin-1',
  displayName: 'Test Admin',
  capturedAt: '2026-04-02T00:00:00.000Z',
};

const TEST_LAUNCH_REQUEST: IAdminRunLaunchRequest = {
  actionKey: 'provisioning:site:create' as never,
  commandInput: { projectName: 'Test Project' },
  targetEntityId: 'proj-001',
};

describe('P3-05 InMemoryAdminRunService', () => {
  let service: InMemoryAdminRunService;

  beforeEach(() => {
    service = new InMemoryAdminRunService();
  });

  describe('launchRun', () => {
    it('creates a run with Pending status', async () => {
      const result = await service.launchRun(TEST_LAUNCH_REQUEST, TEST_ACTOR);

      expect(result.runId).toBeTruthy();
      expect(result.status).toBe(AdminRunStatus.Pending);
      expect(result.actionKey).toBe(TEST_LAUNCH_REQUEST.actionKey);
      expect(result.executionMode).toBe(AdminExecutionMode.Seamless);
      expect(result.riskLevel).toBe(AdminRiskLevel.Low);
    });

    it('creates a run with Validating status for dry-run', async () => {
      const dryRunRequest = { ...TEST_LAUNCH_REQUEST, dryRun: true };
      const result = await service.launchRun(dryRunRequest, TEST_ACTOR);

      expect(result.status).toBe(AdminRunStatus.Validating);
    });

    it('stores the run envelope for later retrieval', async () => {
      const result = await service.launchRun(TEST_LAUNCH_REQUEST, TEST_ACTOR);
      const envelope = await service.getRun(result.runId);

      expect(envelope).not.toBeNull();
      expect(envelope!.runId).toBe(result.runId);
      expect(envelope!.actionKey).toBe(TEST_LAUNCH_REQUEST.actionKey);
      expect(envelope!.initiatedBy.upn).toBe(TEST_ACTOR.upn);
      expect(envelope!.targetEntityId).toBe('proj-001');
      expect(envelope!.parentRunId).toBeNull();
      expect(envelope!.createdAt).toBeTruthy();
    });

    it('generates unique runIds for each launch', async () => {
      const r1 = await service.launchRun(TEST_LAUNCH_REQUEST, TEST_ACTOR);
      const r2 = await service.launchRun(TEST_LAUNCH_REQUEST, TEST_ACTOR);

      expect(r1.runId).not.toBe(r2.runId);
    });
  });

  describe('getRun', () => {
    it('returns null for unknown runId', async () => {
      const result = await service.getRun('nonexistent-id');
      expect(result).toBeNull();
    });

    it('returns the full envelope for a known run', async () => {
      const launched = await service.launchRun(TEST_LAUNCH_REQUEST, TEST_ACTOR);
      const envelope = await service.getRun(launched.runId);

      expect(envelope).not.toBeNull();
      expect(envelope!.steps).toEqual([]);
      expect(envelope!.failure).toBeNull();
      expect(envelope!.completedAt).toBeNull();
    });
  });

  describe('listRuns', () => {
    it('returns empty list when no runs exist', async () => {
      const result = await service.listRuns({});
      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('lists all runs with default pagination', async () => {
      await service.launchRun(TEST_LAUNCH_REQUEST, TEST_ACTOR);
      await service.launchRun(TEST_LAUNCH_REQUEST, TEST_ACTOR);

      const result = await service.listRuns({});
      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(25);
    });

    it('paginates results', async () => {
      for (let i = 0; i < 5; i++) {
        await service.launchRun(TEST_LAUNCH_REQUEST, TEST_ACTOR);
      }

      const page1 = await service.listRuns({ page: 1, pageSize: 2 });
      expect(page1.items).toHaveLength(2);
      expect(page1.total).toBe(5);

      const page3 = await service.listRuns({ page: 3, pageSize: 2 });
      expect(page3.items).toHaveLength(1);
    });

    it('returns run summaries with correct shape', async () => {
      await service.launchRun(TEST_LAUNCH_REQUEST, TEST_ACTOR);
      const result = await service.listRuns({});

      const summary = result.items[0];
      expect(summary.runId).toBeTruthy();
      expect(summary.actionKey).toBe(TEST_LAUNCH_REQUEST.actionKey);
      expect(summary.status).toBe(AdminRunStatus.Pending);
      expect(summary.initiatedBy.upn).toBe(TEST_ACTOR.upn);
      expect(summary.createdAt).toBeTruthy();
    });
  });

  describe('cancelRun', () => {
    it('cancels a Pending run', async () => {
      const launched = await service.launchRun(TEST_LAUNCH_REQUEST, TEST_ACTOR);
      const cancelled = await service.cancelRun(launched.runId, TEST_ACTOR, 'No longer needed');

      expect(cancelled.status).toBe(AdminRunStatus.Cancelled);
      expect(cancelled.completedAt).toBeTruthy();
    });

    it('persists the cancelled status', async () => {
      const launched = await service.launchRun(TEST_LAUNCH_REQUEST, TEST_ACTOR);
      await service.cancelRun(launched.runId, TEST_ACTOR);

      const envelope = await service.getRun(launched.runId);
      expect(envelope!.status).toBe(AdminRunStatus.Cancelled);
    });

    it('throws for non-existent run', async () => {
      await expect(service.cancelRun('bad-id', TEST_ACTOR)).rejects.toThrow('not found');
    });

    it('throws for already completed run', async () => {
      const launched = await service.launchRun(TEST_LAUNCH_REQUEST, TEST_ACTOR);
      await service.cancelRun(launched.runId, TEST_ACTOR);

      await expect(service.cancelRun(launched.runId, TEST_ACTOR)).rejects.toThrow('cannot be cancelled');
    });
  });

  describe('retryRun', () => {
    it('creates a new run from a failed parent', async () => {
      // Launch and manually fail the run for testing
      const launched = await service.launchRun(TEST_LAUNCH_REQUEST, TEST_ACTOR);
      const run = await service.getRun(launched.runId);

      // Simulate failure by directly updating the store (test-only hack)
      (service as unknown as { runs: Map<string, unknown> }).runs.set(launched.runId, {
        ...run!,
        status: AdminRunStatus.Failed,
        failure: { retryCount: 0, failedAtStep: 1, failureClass: 'transient', failureMessage: 'test', retryEligible: true, lastRetryAt: null, escalated: false, escalatedBy: null, escalatedAt: null },
      });

      const retryResult = await service.retryRun(launched.runId, TEST_ACTOR);

      expect(retryResult.runId).not.toBe(launched.runId);
      expect(retryResult.status).toBe(AdminRunStatus.Pending);
      expect(retryResult.actionKey).toBe(TEST_LAUNCH_REQUEST.actionKey);

      // Verify the retry run is linked to parent
      const retryEnvelope = await service.getRun(retryResult.runId);
      expect(retryEnvelope!.parentRunId).toBe(launched.runId);
    });

    it('throws for non-existent run', async () => {
      await expect(service.retryRun('bad-id', TEST_ACTOR)).rejects.toThrow('not found');
    });

    it('throws for non-failed run', async () => {
      const launched = await service.launchRun(TEST_LAUNCH_REQUEST, TEST_ACTOR);
      await expect(service.retryRun(launched.runId, TEST_ACTOR)).rejects.toThrow('not in Failed status');
    });
  });
});
