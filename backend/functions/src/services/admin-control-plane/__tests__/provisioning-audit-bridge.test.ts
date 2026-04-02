import { describe, it, expect, beforeEach } from 'vitest';
import {
  AdminAuditEventType,
  AdminDomain,
} from '@hbc/models/admin-control-plane';
import type { IAdminActorContext, IAdminAuditRecord } from '@hbc/models/admin-control-plane';
import { ProvisioningAuditBridge } from '../provisioning-audit-bridge.js';
import { InMemoryAdminRunService } from '../in-memory-run-service.js';
import { MockAdminAuditStore } from '../admin-audit-store.js';
import type { IProvisioningStatusSnapshot } from '../orchestration-bridge.js';

/**
 * P4-04: Provisioning audit bridge tests.
 *
 * Validates that provisioning saga lifecycle events are correctly
 * projected into the generalized admin run/audit spine.
 */

const TEST_ACTOR: IAdminActorContext = {
  upn: 'admin@hb.com',
  objectId: 'oid-1',
  displayName: 'Test Admin',
  capturedAt: '2026-04-02T00:00:00.000Z',
};

const TEST_SNAPSHOT: IProvisioningStatusSnapshot = {
  projectId: 'proj-001',
  projectName: 'Test Project',
  correlationId: 'corr-001',
  overallStatus: 'InProgress',
  currentStep: 1,
  totalSteps: 7,
  triggeredBy: 'admin@hb.com',
  createdAt: '2026-04-02T10:00:00.000Z',
};

describe('P4-04 ProvisioningAuditBridge', () => {
  let runService: InMemoryAdminRunService;
  let auditService: MockAdminAuditStore;
  let bridge: ProvisioningAuditBridge;

  beforeEach(() => {
    runService = new InMemoryAdminRunService();
    auditService = new MockAdminAuditStore();
    bridge = new ProvisioningAuditBridge(runService, auditService);
  });

  describe('recordEvent — saga lifecycle', () => {
    it('records saga.started as RunStarted audit event', async () => {
      await bridge.recordEvent('saga.started', TEST_SNAPSHOT, TEST_ACTOR);

      const events = await auditService.listByRunId('corr-001');
      expect(events).toHaveLength(1);
      expect(events[0].eventType).toBe(AdminAuditEventType.RunStarted);
      expect(events[0].domain).toBe(AdminDomain.ProvisioningRollout);
      expect(events[0].runId).toBe('corr-001');
      expect(events[0].summary).toContain('started');
      expect(events[0].summary).toContain('Test Project');
    });

    it('records saga.completed as RunCompleted audit event', async () => {
      const completedSnapshot = { ...TEST_SNAPSHOT, overallStatus: 'Completed' };
      await bridge.recordEvent('saga.completed', completedSnapshot, TEST_ACTOR);

      const events = await auditService.listByRunId('corr-001');
      expect(events).toHaveLength(1);
      expect(events[0].eventType).toBe(AdminAuditEventType.RunCompleted);
    });

    it('records saga.failed as RunFailed audit event', async () => {
      const failedSnapshot = { ...TEST_SNAPSHOT, overallStatus: 'Failed' };
      await bridge.recordEvent('saga.failed', failedSnapshot, TEST_ACTOR, { error: 'Permission denied' });

      const events = await auditService.listByRunId('corr-001');
      expect(events).toHaveLength(1);
      expect(events[0].eventType).toBe(AdminAuditEventType.RunFailed);
      expect(events[0].summary).toContain('Permission denied');
    });

    it('records saga.step.completed with step details', async () => {
      await bridge.recordEvent('saga.step.completed', TEST_SNAPSHOT, TEST_ACTOR, {
        stepNumber: 3,
        stepName: 'Upload Template Files',
      });

      const events = await auditService.listByRunId('corr-001');
      expect(events[0].summary).toContain('Step 3');
      expect(events[0].summary).toContain('Upload Template Files');
    });

    it('records saga.step5.deferred', async () => {
      const deferredSnapshot = { ...TEST_SNAPSHOT, overallStatus: 'WebPartsPending' };
      await bridge.recordEvent('saga.step5.deferred', deferredSnapshot, TEST_ACTOR);

      const events = await auditService.listByRunId('corr-001');
      expect(events[0].summary).toContain('deferred');
    });
  });

  describe('recordEvent — admin mutations', () => {
    it('records admin.retry as RunRetried audit event', async () => {
      await bridge.recordEvent('admin.retry', TEST_SNAPSHOT, TEST_ACTOR);

      const events = await auditService.listByRunId('corr-001');
      expect(events[0].eventType).toBe(AdminAuditEventType.RunRetried);
      expect(events[0].summary).toContain('retry');
    });

    it('records admin.escalate as CheckpointEscalated audit event', async () => {
      await bridge.recordEvent('admin.escalate', TEST_SNAPSHOT, TEST_ACTOR, { reason: 'Needs IT attention' });

      const events = await auditService.listByRunId('corr-001');
      expect(events[0].eventType).toBe(AdminAuditEventType.CheckpointEscalated);
      expect(events[0].rationale).not.toBeNull();
      expect(events[0].rationale!.reason).toBe('Needs IT attention');
    });

    it('records admin.archive as RunCancelled audit event', async () => {
      await bridge.recordEvent('admin.archive', TEST_SNAPSHOT, TEST_ACTOR);

      const events = await auditService.listByRunId('corr-001');
      expect(events[0].eventType).toBe(AdminAuditEventType.RunCancelled);
    });

    it('records admin.force-state as ConfigModified audit event', async () => {
      await bridge.recordEvent('admin.force-state', TEST_SNAPSHOT, TEST_ACTOR, { reason: 'Manual override' });

      const events = await auditService.listByRunId('corr-001');
      expect(events[0].eventType).toBe(AdminAuditEventType.ConfigModified);
      expect(events[0].summary).toContain('force-state');
    });
  });

  describe('recordEvent — fire-and-forget safety', () => {
    it('does not throw when audit service fails', async () => {
      const failingAudit = {
        recordEvent: async () => { throw new Error('Storage unavailable'); },
        listByRunId: async () => [],
        listByEventType: async () => [],
      };
      const safeBridge = new ProvisioningAuditBridge(runService, failingAudit);

      // Should not throw
      await safeBridge.recordEvent('saga.started', TEST_SNAPSHOT, TEST_ACTOR);
    });
  });

  describe('recordEvent — actor attribution', () => {
    it('uses provided actor when available', async () => {
      await bridge.recordEvent('saga.started', TEST_SNAPSHOT, TEST_ACTOR);

      const events = await auditService.listByRunId('corr-001');
      expect(events[0].actor.upn).toBe('admin@hb.com');
      expect(events[0].actor.objectId).toBe('oid-1');
    });

    it('falls back to triggeredBy when no actor provided', async () => {
      await bridge.recordEvent('saga.started', TEST_SNAPSHOT);

      const events = await auditService.listByRunId('corr-001');
      expect(events[0].actor.upn).toBe('admin@hb.com');
    });
  });

  describe('projectRunStatus', () => {
    it('does not throw for a new snapshot (fire-and-forget)', async () => {
      await bridge.projectRunStatus(TEST_SNAPSHOT);
      // Should complete without throwing
    });
  });

  describe('retry chain capture', () => {
    it('captures retry event with parent correlation', async () => {
      const retrySnapshot: IProvisioningStatusSnapshot = {
        ...TEST_SNAPSHOT,
        correlationId: 'corr-002',
        parentCorrelationId: 'corr-001',
      };

      await bridge.recordEvent('admin.retry', retrySnapshot, TEST_ACTOR);

      const events = await auditService.listByRunId('corr-002');
      expect(events).toHaveLength(1);
      expect(events[0].eventType).toBe(AdminAuditEventType.RunRetried);
    });
  });
});
