import { describe, it, expect, beforeEach } from 'vitest';
import { AiGovernanceApi } from './AiGovernanceApi.js';
import { createMockAiAuditRecord } from '../../testing/createMockAiAuditRecord.js';
import type { IAiActionInvokeContext } from '../types/index.js';

const baseContext: IAiActionInvokeContext = {
  userId: 'user-1',
  role: 'estimator',
  recordType: 'scorecard',
  recordId: 'sc-1',
  complexity: 'standard',
};

beforeEach(() => {
  AiGovernanceApi._clearForTests();
});

describe('AiGovernanceApi', () => {
  describe('evaluatePolicy', () => {
    it('returns allowed when no restrictions', () => {
      const result = AiGovernanceApi.evaluatePolicy('summarize', baseContext);
      expect(result.decision).toBe('allowed');
      expect(result.notes).toContain('Policy check passed');
    });

    it('returns blocked for disabled action', () => {
      AiGovernanceApi.setPolicy({ disableActions: ['summarize'] });
      const result = AiGovernanceApi.evaluatePolicy('summarize', baseContext);
      expect(result.decision).toBe('blocked');
      expect(result.notes[0]).toContain('disabled by policy');
    });

    it('returns approval-required for actions needing approval', () => {
      AiGovernanceApi.setPolicy({ requireApprovalActions: ['generate-bid'] });
      const result = AiGovernanceApi.evaluatePolicy('generate-bid', baseContext);
      expect(result.decision).toBe('approval-required');
      expect(result.notes[0]).toContain('requires approval');
    });

    it('returns blocked when rate limit exceeded', () => {
      AiGovernanceApi.setPolicy({ rateLimitPerHourByRole: { estimator: 1 } });
      // Add a recent audit record to consume the limit
      AiGovernanceApi.recordAudit(
        createMockAiAuditRecord({
          rateLimitBucket: 'estimator',
          invokedAtUtc: new Date().toISOString(),
        }),
      );
      const result = AiGovernanceApi.evaluatePolicy('summarize', baseContext);
      expect(result.decision).toBe('blocked');
      expect(result.notes[0]).toContain('Rate limit exceeded');
    });
  });

  describe('checkRateLimit', () => {
    it('returns unlimited when no limit configured', () => {
      const result = AiGovernanceApi.checkRateLimit('estimator');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(Infinity);
    });

    it('counts recent audit records against limit', () => {
      AiGovernanceApi.setPolicy({ rateLimitPerHourByRole: { estimator: 5 } });
      AiGovernanceApi.recordAudit(
        createMockAiAuditRecord({
          rateLimitBucket: 'estimator',
          invokedAtUtc: new Date().toISOString(),
        }),
      );
      const result = AiGovernanceApi.checkRateLimit('estimator');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
      expect(result.limit).toBe(5);
    });
  });

  describe('getAuditTrail', () => {
    it('returns all records sorted by invokedAtUtc desc', () => {
      AiGovernanceApi.recordAudit(createMockAiAuditRecord({ auditId: 'a1', invokedAtUtc: '2026-01-01T00:00:00Z' }));
      AiGovernanceApi.recordAudit(createMockAiAuditRecord({ auditId: 'a2', invokedAtUtc: '2026-03-01T00:00:00Z' }));
      const trail = AiGovernanceApi.getAuditTrail();
      expect(trail[0].auditId).toBe('a2');
      expect(trail[1].auditId).toBe('a1');
    });

    it('filters by actionKey', () => {
      AiGovernanceApi.recordAudit(createMockAiAuditRecord({ auditId: 'a1', actionKey: 'summarize' }));
      AiGovernanceApi.recordAudit(createMockAiAuditRecord({ auditId: 'a2', actionKey: 'generate' }));
      const trail = AiGovernanceApi.getAuditTrail({ actionKey: 'summarize' });
      expect(trail).toHaveLength(1);
      expect(trail[0].actionKey).toBe('summarize');
    });

    it('filters by recordType', () => {
      AiGovernanceApi.recordAudit(createMockAiAuditRecord({ auditId: 'a1', recordType: 'bid' }));
      AiGovernanceApi.recordAudit(createMockAiAuditRecord({ auditId: 'a2', recordType: 'scorecard' }));
      const trail = AiGovernanceApi.getAuditTrail({ recordType: 'bid' });
      expect(trail).toHaveLength(1);
    });

    it('filters by userId', () => {
      AiGovernanceApi.recordAudit(createMockAiAuditRecord({ auditId: 'a1', invokedByUserId: 'user-1' }));
      AiGovernanceApi.recordAudit(createMockAiAuditRecord({ auditId: 'a2', invokedByUserId: 'user-2' }));
      const trail = AiGovernanceApi.getAuditTrail({ userId: 'user-1' });
      expect(trail).toHaveLength(1);
    });

    it('filters by date range', () => {
      AiGovernanceApi.recordAudit(createMockAiAuditRecord({ auditId: 'a1', invokedAtUtc: '2026-01-01T00:00:00Z' }));
      AiGovernanceApi.recordAudit(createMockAiAuditRecord({ auditId: 'a2', invokedAtUtc: '2026-06-01T00:00:00Z' }));
      const trail = AiGovernanceApi.getAuditTrail({ fromUtc: '2026-03-01T00:00:00Z' });
      expect(trail).toHaveLength(1);
      expect(trail[0].auditId).toBe('a2');
    });
  });

  describe('recordAudit', () => {
    it('persists records retrievable via getAuditTrail', () => {
      const record = createMockAiAuditRecord();
      AiGovernanceApi.recordAudit(record);
      expect(AiGovernanceApi.getAuditTrail()).toHaveLength(1);
    });
  });

  describe('getPolicyStatus', () => {
    it('returns current policy and audit count', () => {
      AiGovernanceApi.setPolicy({ disableActions: ['x'] });
      AiGovernanceApi.recordAudit(createMockAiAuditRecord());
      const status = AiGovernanceApi.getPolicyStatus();
      expect(status.policy.disableActions).toEqual(['x']);
      expect(status.auditCount).toBe(1);
    });
  });

  describe('getRateLimitStatus', () => {
    it('returns status for all configured roles', () => {
      AiGovernanceApi.setPolicy({ rateLimitPerHourByRole: { estimator: 10, admin: 50 } });
      const status = AiGovernanceApi.getRateLimitStatus();
      expect(status).toHaveProperty('estimator');
      expect(status).toHaveProperty('admin');
      expect(status.estimator.limit).toBe(10);
    });
  });
});
