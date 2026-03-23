/** SF25-T08 — Canonical scenarios. */
import { createMockPublishRequest } from './createMockPublishRequest.js';

export const mockPublishScenarios = {
  draft: createMockPublishRequest(),
  readyForReview: createMockPublishRequest({ state: 'ready-for-review', readiness: { isReady: true, blockingReasons: [], warningReasons: [], checkedAtIso: '2026-03-23T14:00:00.000Z' } }),
  approved: createMockPublishRequest({ state: 'approved-for-publish', approval: { status: 'approved', approverUpn: 'exec@example.com', approverName: 'Exec', decidedAtIso: '2026-03-23T14:05:00.000Z', reason: null } }),
  published: createMockPublishRequest({ state: 'published', receipt: { receiptId: 'rct-001', publishedAtIso: '2026-03-23T14:10:00.000Z', artifactUrl: 'https://sp.example.com/artifact', versionNumber: 1, frozen: true } }),
  superseded: createMockPublishRequest({ state: 'superseded', supersession: { supersededByRecordId: 'rec-002', supersededAtIso: '2026-03-23T15:00:00.000Z', reason: 'Newer version' } }),
  revoked: createMockPublishRequest({ state: 'revoked', revocation: { revokedByUpn: 'admin@example.com', revokedAtIso: '2026-03-23T16:00:00.000Z', reason: 'Policy violation' } }),
  failed: createMockPublishRequest({ state: 'failed' }),
  withApprovalRules: createMockPublishRequest({ approvalRules: [{ ruleId: 'r1', label: 'PM Approval', required: true, approverRole: 'PM', deadlineHours: 48, escalationUpn: null }] }),
} as const;
