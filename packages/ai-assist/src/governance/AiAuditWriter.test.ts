import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AiAuditWriter } from './AiAuditWriter.js';
import { AiGovernanceApi } from './AiGovernanceApi.js';
import { createMockAiAuditRecord } from '../../testing/createMockAiAuditRecord.js';

beforeEach(() => {
  AiAuditWriter._clearForTests();
  AiGovernanceApi._clearForTests();
});

describe('AiAuditWriter', () => {
  it('persists record retrievable via governance audit trail', () => {
    const record = createMockAiAuditRecord();
    AiAuditWriter.write(record);
    const trail = AiGovernanceApi.getAuditTrail();
    expect(trail).toHaveLength(1);
    expect(trail[0].auditId).toBe(record.auditId);
  });

  it('invokes onWrite callback when set', () => {
    const callback = vi.fn();
    AiAuditWriter.setOnWrite(callback);
    const record = createMockAiAuditRecord();
    AiAuditWriter.write(record);
    expect(callback).toHaveBeenCalledWith(record);
  });

  it('throws on empty auditId', () => {
    expect(() => AiAuditWriter.write(createMockAiAuditRecord({ auditId: '' }))).toThrow(
      'auditId must be non-empty',
    );
  });

  it('throws on empty actionKey', () => {
    expect(() => AiAuditWriter.write(createMockAiAuditRecord({ actionKey: '' }))).toThrow(
      'actionKey must be non-empty',
    );
  });

  it('throws on empty recordType', () => {
    expect(() => AiAuditWriter.write(createMockAiAuditRecord({ recordType: '' }))).toThrow(
      'recordType must be non-empty',
    );
  });

  it('throws on empty recordId', () => {
    expect(() => AiAuditWriter.write(createMockAiAuditRecord({ recordId: '' }))).toThrow(
      'recordId must be non-empty',
    );
  });

  it('throws on empty invokedByUserId', () => {
    expect(() =>
      AiAuditWriter.write(createMockAiAuditRecord({ invokedByUserId: '' })),
    ).toThrow('invokedByUserId must be non-empty');
  });

  it('throws on empty invokedAtUtc', () => {
    expect(() =>
      AiAuditWriter.write(createMockAiAuditRecord({ invokedAtUtc: '' })),
    ).toThrow('invokedAtUtc must be non-empty');
  });
});
