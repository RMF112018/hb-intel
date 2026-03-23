/** SF25-T08 — Mock factory for IPublishRequest. */
import type { IPublishRequest } from '../src/types/index.js';

export function createMockPublishRequest(overrides?: Partial<IPublishRequest>): IPublishRequest {
  return {
    publishRequestId: 'pub-mock-001', sourceModuleKey: 'financial', sourceRecordId: 'rec-001',
    sourceVersionId: null, artifactId: null, issueLabel: null, state: 'draft',
    requestedByUserId: 'pm@example.com',
    targets: [{ targetId: 'sp-001', targetType: 'sharepoint', label: 'Reports Library', recipientScope: 'project-team' }],
    readiness: { isReady: false, blockingReasons: [], warningReasons: [], checkedAtIso: '2026-03-23T14:00:00.000Z' },
    approval: { status: 'pending', approverUpn: null, approverName: null, decidedAtIso: null, reason: null },
    supersession: { supersededByRecordId: null, supersededAtIso: null, reason: null },
    revocation: { revokedByUpn: null, revokedAtIso: null, reason: null },
    receipt: null, contextStamp: null, approvalRules: [], bicSteps: [],
    telemetry: { publishCompletionLatency: null, approvalCycleTimeReduction: null, supersessionTraceabilityScore: null, publishGovernanceCes: null, formalIssueAdoptionRate: null },
    createdAtIso: '2026-03-23T14:00:00.000Z', updatedAtIso: '2026-03-23T14:00:00.000Z',
    ...overrides,
  };
}
