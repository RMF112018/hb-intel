/**
 * SF25-T03 — Publish lifecycle state machine.
 *
 * Governing: SF25-T03, L-01, L-02
 */

import type { PublishState, IPublishRequest, IPublishTarget, IPublishApprovalRule, IPublishBicStepConfig, IReadinessState, IReadinessRule, IPublicationRecord } from '../types/index.js';

export const VALID_PUBLISH_TRANSITIONS: Readonly<Record<PublishState, readonly PublishState[]>> = {
  'draft': ['ready-for-review', 'failed'],
  'ready-for-review': ['approved-for-publish', 'draft', 'failed'],
  'approved-for-publish': ['publishing', 'draft', 'failed'],
  'publishing': ['published', 'failed'],
  'published': ['superseded', 'revoked'],
  'superseded': [],
  'revoked': [],
  'failed': ['draft'],
} as const;

export interface ICreatePublishRequestInput {
  sourceModuleKey: string;
  sourceRecordId: string;
  sourceVersionId?: string | null;
  issueLabel?: string | null;
  requestedByUserId: string;
  targets: IPublishTarget[];
  approvalRules?: IPublishApprovalRule[];
  bicSteps?: IPublishBicStepConfig[];
}

export function createPublishRequest(input: ICreatePublishRequestInput, now?: Date): IPublishRequest {
  if (!input.sourceModuleKey) throw new Error('PublishWorkflow: sourceModuleKey is required');
  if (!input.sourceRecordId) throw new Error('PublishWorkflow: sourceRecordId is required');
  if (!input.requestedByUserId) throw new Error('PublishWorkflow: requestedByUserId is required');

  const timestamp = (now ?? new Date()).toISOString();
  return {
    publishRequestId: crypto.randomUUID(),
    sourceModuleKey: input.sourceModuleKey,
    sourceRecordId: input.sourceRecordId,
    sourceVersionId: input.sourceVersionId ?? null,
    artifactId: null,
    issueLabel: input.issueLabel ?? null,
    state: 'draft',
    requestedByUserId: input.requestedByUserId,
    targets: input.targets,
    readiness: { isReady: false, blockingReasons: [], warningReasons: [], checkedAtIso: timestamp },
    approval: { status: 'pending', approverUpn: null, approverName: null, decidedAtIso: null, reason: null },
    supersession: { supersededByRecordId: null, supersededAtIso: null, reason: null },
    revocation: { revokedByUpn: null, revokedAtIso: null, reason: null },
    receipt: null,
    contextStamp: null,
    approvalRules: input.approvalRules ?? [],
    bicSteps: input.bicSteps ?? [],
    telemetry: { publishCompletionLatency: null, approvalCycleTimeReduction: null, supersessionTraceabilityScore: null, publishGovernanceCes: null, formalIssueAdoptionRate: null },
    createdAtIso: timestamp,
    updatedAtIso: timestamp,
  };
}

export function transitionPublishState(request: IPublishRequest, targetState: PublishState, now?: Date): IPublishRequest {
  const allowed = VALID_PUBLISH_TRANSITIONS[request.state];
  if (!allowed?.includes(targetState)) {
    throw new Error(`PublishLifecycle: invalid transition ${request.state} → ${targetState}. Allowed: [${allowed?.join(', ') ?? 'none'}]`);
  }
  const timestamp = (now ?? new Date()).toISOString();
  return { ...request, state: targetState, updatedAtIso: timestamp };
}

export function evaluateReadiness(request: IPublishRequest, rules: IReadinessRule[], now?: Date): IReadinessState {
  const blockingReasons: string[] = [];
  const warningReasons: string[] = [];

  for (const rule of rules) {
    const result = rule.evaluate(request as unknown as IPublicationRecord);
    if (!result.pass) blockingReasons.push(result.message);
  }

  if (request.targets.length === 0) blockingReasons.push('No publish targets defined');
  if (!request.sourceRecordId) blockingReasons.push('Source record is required');

  return {
    isReady: blockingReasons.length === 0,
    blockingReasons,
    warningReasons,
    checkedAtIso: (now ?? new Date()).toISOString(),
  };
}
