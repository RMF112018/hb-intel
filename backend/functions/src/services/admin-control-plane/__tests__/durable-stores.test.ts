import { describe, it, expect } from 'vitest';
import {
  AdminRunStatus,
  AdminExecutionMode,
  AdminRiskLevel,
  AdminAuditEventType,
  AdminDomain,
} from '@hbc/models/admin-control-plane';
import type {
  IAdminRunEnvelope,
  IAdminActorContext,
  IAdminAuditRecord,
} from '@hbc/models/admin-control-plane';
import { serializeRunEnvelope, deserializeRunEnvelope } from '../admin-run-store.js';
import { serializeAuditRecord, deserializeAuditRecord, MockAdminAuditStore } from '../admin-audit-store.js';

/**
 * P4-03: Durable run store and audit spine serialization tests.
 *
 * Validates round-trip serialization for Table Storage entities
 * and append-only audit behavior.
 */

const TEST_ACTOR: IAdminActorContext = {
  upn: 'admin@hb.com',
  objectId: 'oid-admin-1',
  displayName: 'Test Admin',
  capturedAt: '2026-04-02T00:00:00.000Z',
};

// ── Run envelope serialization ──────────────────────────────────────────────────

describe('P4-03 Run envelope serialization round-trip', () => {
  const envelope: IAdminRunEnvelope = {
    runId: 'run-001',
    parentRunId: 'run-000',
    actionKey: 'provisioning:site:create' as never,
    domain: AdminDomain.ProvisioningRollout,
    riskLevel: AdminRiskLevel.Moderate,
    executionMode: AdminExecutionMode.Seamless,
    initiatedBy: TEST_ACTOR,
    lastApprovedBy: null,
    commandInputRef: 'ref-cmd-001',
    configSnapshotRef: null,
    status: AdminRunStatus.Running,
    totalSteps: 7,
    currentStep: 3,
    steps: [
      { stepNumber: 1, stepLabel: 'Create Site', status: 'Completed' as never, startedAt: '2026-04-02T00:01:00Z', completedAt: '2026-04-02T00:01:05Z', durationMs: 5000, errorMessage: null, compensatable: true, compensated: false },
      { stepNumber: 2, stepLabel: 'Doc Library', status: 'Completed' as never, startedAt: '2026-04-02T00:01:06Z', completedAt: '2026-04-02T00:01:10Z', durationMs: 4000, errorMessage: null, compensatable: true, compensated: false },
    ],
    failure: null,
    createdAt: '2026-04-02T00:00:00.000Z',
    startedAt: '2026-04-02T00:01:00.000Z',
    completedAt: null,
    targetEntityId: 'proj-001',
    targetEntityLabel: 'Test Project',
  };

  it('serializes and deserializes run envelope with all fields', () => {
    const serialized = serializeRunEnvelope(envelope);
    const deserialized = deserializeRunEnvelope(serialized);

    expect(deserialized.runId).toBe('run-001');
    expect(deserialized.parentRunId).toBe('run-000');
    expect(deserialized.actionKey).toBe('provisioning:site:create');
    expect(deserialized.domain).toBe(AdminDomain.ProvisioningRollout);
    expect(deserialized.riskLevel).toBe(AdminRiskLevel.Moderate);
    expect(deserialized.executionMode).toBe(AdminExecutionMode.Seamless);
    expect(deserialized.status).toBe(AdminRunStatus.Running);
    expect(deserialized.totalSteps).toBe(7);
    expect(deserialized.currentStep).toBe(3);
    expect(deserialized.targetEntityId).toBe('proj-001');
    expect(deserialized.targetEntityLabel).toBe('Test Project');
    expect(deserialized.commandInputRef).toBe('ref-cmd-001');
    expect(deserialized.createdAt).toBe('2026-04-02T00:00:00.000Z');
    expect(deserialized.startedAt).toBe('2026-04-02T00:01:00.000Z');
    expect(deserialized.completedAt).toBeNull();
  });

  it('preserves actor context through serialization', () => {
    const serialized = serializeRunEnvelope(envelope);
    const deserialized = deserializeRunEnvelope(serialized);

    expect(deserialized.initiatedBy.upn).toBe('admin@hb.com');
    expect(deserialized.initiatedBy.objectId).toBe('oid-admin-1');
    expect(deserialized.initiatedBy.displayName).toBe('Test Admin');
  });

  it('preserves step results through JSON serialization', () => {
    const serialized = serializeRunEnvelope(envelope);
    const deserialized = deserializeRunEnvelope(serialized);

    expect(deserialized.steps).toHaveLength(2);
    expect(deserialized.steps[0].stepLabel).toBe('Create Site');
    expect(deserialized.steps[1].durationMs).toBe(4000);
  });

  it('handles null optional fields correctly', () => {
    const minimalEnvelope: IAdminRunEnvelope = {
      ...envelope,
      parentRunId: null,
      lastApprovedBy: null,
      commandInputRef: null,
      configSnapshotRef: null,
      currentStep: null,
      failure: null,
      startedAt: null,
      completedAt: null,
      targetEntityId: null,
      targetEntityLabel: null,
    };

    const serialized = serializeRunEnvelope(minimalEnvelope);
    const deserialized = deserializeRunEnvelope(serialized);

    expect(deserialized.parentRunId).toBeNull();
    expect(deserialized.lastApprovedBy).toBeNull();
    expect(deserialized.commandInputRef).toBeNull();
    expect(deserialized.configSnapshotRef).toBeNull();
    expect(deserialized.currentStep).toBeNull();
    expect(deserialized.failure).toBeNull();
    expect(deserialized.startedAt).toBeNull();
    expect(deserialized.completedAt).toBeNull();
    expect(deserialized.targetEntityId).toBeNull();
    expect(deserialized.targetEntityLabel).toBeNull();
  });

  it('serializes failure summary correctly', () => {
    const failedEnvelope: IAdminRunEnvelope = {
      ...envelope,
      status: AdminRunStatus.Failed,
      failure: {
        failedAtStep: 3,
        failureClass: 'permissions',
        failureMessage: 'Insufficient permissions',
        retryEligible: true,
        retryCount: 1,
        lastRetryAt: '2026-04-02T01:00:00Z',
        escalated: false,
        escalatedBy: null,
        escalatedAt: null,
      },
    };

    const serialized = serializeRunEnvelope(failedEnvelope);
    const deserialized = deserializeRunEnvelope(serialized);

    expect(deserialized.failure).not.toBeNull();
    expect(deserialized.failure!.failedAtStep).toBe(3);
    expect(deserialized.failure!.failureClass).toBe('permissions');
    expect(deserialized.failure!.retryEligible).toBe(true);
  });

  it('uses domain as partition key and runId as row key', () => {
    const serialized = serializeRunEnvelope(envelope);
    expect(serialized.partitionKey).toBe(AdminDomain.ProvisioningRollout);
    expect(serialized.rowKey).toBe('run-001');
  });
});

// ── Audit record serialization ──────────────────────────────────────────────────

describe('P4-03 Audit record serialization round-trip', () => {
  const auditRecord: IAdminAuditRecord = {
    auditId: 'audit-001',
    eventType: AdminAuditEventType.RunStarted,
    timestamp: '2026-04-02T00:00:00.000Z',
    domain: AdminDomain.ProvisioningRollout,
    actionKey: 'provisioning:site:create' as never,
    runId: 'run-001',
    checkpointInstanceId: null,
    actor: TEST_ACTOR,
    rationale: null,
    evidenceRef: null,
    configSnapshotRef: null,
    runStatusAtEvent: AdminRunStatus.Pending,
    summary: 'Run launched for project provisioning',
  };

  it('serializes and deserializes audit record', () => {
    const serialized = serializeAuditRecord(auditRecord);
    const deserialized = deserializeAuditRecord(serialized);

    expect(deserialized.auditId).toBe('audit-001');
    expect(deserialized.eventType).toBe(AdminAuditEventType.RunStarted);
    expect(deserialized.runId).toBe('run-001');
    expect(deserialized.summary).toBe('Run launched for project provisioning');
    expect(deserialized.actor.upn).toBe('admin@hb.com');
  });

  it('uses runId as partition key and auditId as row key', () => {
    const serialized = serializeAuditRecord(auditRecord);
    expect(serialized.partitionKey).toBe('run-001');
    expect(serialized.rowKey).toBe('audit-001');
  });

  it('uses __global__ partition for events without runId', () => {
    const globalEvent: IAdminAuditRecord = { ...auditRecord, runId: null };
    const serialized = serializeAuditRecord(globalEvent);
    expect(serialized.partitionKey).toBe('__global__');
  });

  it('handles null optional fields correctly', () => {
    const serialized = serializeAuditRecord(auditRecord);
    const deserialized = deserializeAuditRecord(serialized);

    expect(deserialized.checkpointInstanceId).toBeNull();
    expect(deserialized.rationale).toBeNull();
    expect(deserialized.evidenceRef).toBeNull();
    expect(deserialized.configSnapshotRef).toBeNull();
  });
});

// ── Mock audit store append-only behavior ───────────────────────────────────────

describe('P4-03 MockAdminAuditStore append-only behavior', () => {
  it('records and retrieves events by runId', async () => {
    const store = new MockAdminAuditStore();
    const record: IAdminAuditRecord = {
      auditId: 'a1',
      eventType: AdminAuditEventType.RunStarted,
      timestamp: '2026-04-02T00:00:00Z',
      domain: AdminDomain.ProvisioningRollout,
      actionKey: null,
      runId: 'run-1',
      checkpointInstanceId: null,
      actor: TEST_ACTOR,
      rationale: null,
      evidenceRef: null,
      configSnapshotRef: null,
      runStatusAtEvent: null,
      summary: 'Test event',
    };

    await store.recordEvent(record);
    await store.recordEvent({ ...record, auditId: 'a2', eventType: AdminAuditEventType.RunCompleted, timestamp: '2026-04-02T00:01:00Z' });

    const events = await store.listByRunId('run-1');
    expect(events).toHaveLength(2);
    expect(events[0].auditId).toBe('a1');
    expect(events[1].auditId).toBe('a2');
  });

  it('filters events by event type', async () => {
    const store = new MockAdminAuditStore();
    const base: IAdminAuditRecord = {
      auditId: 'a1',
      eventType: AdminAuditEventType.RunStarted,
      timestamp: '2026-04-02T00:00:00Z',
      domain: AdminDomain.ProvisioningRollout,
      actionKey: null,
      runId: 'run-1',
      checkpointInstanceId: null,
      actor: TEST_ACTOR,
      rationale: null,
      evidenceRef: null,
      configSnapshotRef: null,
      runStatusAtEvent: null,
      summary: 'Started',
    };

    await store.recordEvent(base);
    await store.recordEvent({ ...base, auditId: 'a2', eventType: AdminAuditEventType.RunCompleted });
    await store.recordEvent({ ...base, auditId: 'a3', eventType: AdminAuditEventType.RunStarted, runId: 'run-2' });

    const started = await store.listByEventType(AdminAuditEventType.RunStarted);
    expect(started).toHaveLength(2);

    const completed = await store.listByEventType(AdminAuditEventType.RunCompleted);
    expect(completed).toHaveLength(1);
  });

  it('respects limit option', async () => {
    const store = new MockAdminAuditStore();
    const base: IAdminAuditRecord = {
      auditId: 'a1', eventType: AdminAuditEventType.RunStarted,
      timestamp: '2026-04-02T00:00:00Z', domain: AdminDomain.ProvisioningRollout,
      actionKey: null, runId: 'run-1', checkpointInstanceId: null,
      actor: TEST_ACTOR, rationale: null, evidenceRef: null,
      configSnapshotRef: null, runStatusAtEvent: null, summary: 'Test',
    };

    for (let i = 0; i < 5; i++) {
      await store.recordEvent({ ...base, auditId: `a${i}`, timestamp: `2026-04-02T00:0${i}:00Z` });
    }

    const limited = await store.listByEventType(AdminAuditEventType.RunStarted, { limit: 3 });
    expect(limited).toHaveLength(3);
  });
});
