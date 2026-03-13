import type {
  IDisagreementRecord,
  IOverrideGovernance,
  IReviewDecision,
  ISensitivityPolicy,
} from '../../types/index.js';

export const POST_BID_AUTOPSY_GOVERNANCE_BOUNDARY = Object.freeze({
  owner: 'primitive',
  area: 'governance',
  adapterMayProvide: Object.freeze(['audience-overrides']),
  adapterMustNotOwn: Object.freeze(['sensitivity-policy', 'disagreement-capture', 'override-governance']),
});

export const createSensitivityPolicy = (
  overrides: Partial<ISensitivityPolicy> = {}
): ISensitivityPolicy => ({
  visibility: overrides.visibility ?? 'role-scoped',
  redactionRequired: overrides.redactionRequired ?? false,
});

export const createReviewDecision = (
  overrides: Partial<IReviewDecision> = {}
): IReviewDecision => ({
  stage: overrides.stage ?? 'author-review',
  decision: overrides.decision ?? 'approved',
  reviewer: overrides.reviewer ?? 'reviewer-default',
  decidedAt: overrides.decidedAt ?? '2026-03-13T00:00:00.000Z',
  notes: overrides.notes,
});

export const createDisagreementRecord = (
  overrides: Partial<IDisagreementRecord> = {}
): IDisagreementRecord => ({
  disagreementId: overrides.disagreementId ?? 'disagreement-default',
  criterion: overrides.criterion ?? 'confidence-calibration',
  participants: overrides.participants ?? ['estimating-lead', 'bd-manager'],
  summary: overrides.summary ?? 'Confidence rationale requires follow-up.',
  escalationRequired: overrides.escalationRequired ?? false,
  resolutionStatus: overrides.resolutionStatus ?? 'open',
});

export const createOverrideGovernance = (
  overrides: Partial<IOverrideGovernance> = {}
): IOverrideGovernance => ({
  overrideReason: overrides.overrideReason ?? 'Manual correction required',
  overriddenBy: overrides.overriddenBy ?? 'reviewer-default',
  overriddenAt: overrides.overriddenAt ?? '2026-03-13T00:00:00.000Z',
  approvalRequired: overrides.approvalRequired ?? true,
  approvedBy: overrides.approvedBy ?? null,
  approvedAt: overrides.approvedAt ?? null,
});

export {
  createPublicationBlockerSummary,
  hasOpenDisagreements,
  requiresOverrideApproval,
} from './blockers.js';
