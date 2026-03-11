/**
 * createMockAiAuditRecord — SF15-T02, D-10 (testing sub-path)
 *
 * Factory for mock IAiAuditRecord instances with Partial overrides.
 */
import type { IAiAuditRecord } from '../src/types/index.js';

export function createMockAiAuditRecord(
  overrides: Partial<IAiAuditRecord> = {},
): IAiAuditRecord {
  return {
    auditId: 'audit-001',
    actionKey: 'mock-summarize-scorecard',
    recordType: 'scorecard',
    recordId: 'record-001',
    invokedByUserId: 'user-001',
    invokedAtUtc: '2026-03-11T00:00:00.000Z',
    modelKey: 'gpt-4o',
    resolvedModelName: 'gpt-4o',
    resolvedModelVersion: '2024-08-06',
    contextSourceKeys: [],
    policyDecision: 'allowed',
    rateLimitBucket: 'default',
    outcome: 'success',
    tokenUsage: { prompt: 100, completion: 50, total: 150 },
    confidenceScore: 0.85,
    ...overrides,
  };
}
