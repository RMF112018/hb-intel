import { AUTOPSY_MIN_PUBLISH_CONFIDENCE } from '../../constants/index.js';
import type {
  ConfidenceTier,
  IAutopsyPublicationBlockerSummary,
  IAutopsyRecordSnapshot,
  IOverrideGovernance,
} from '../../types/index.js';

const CONFIDENCE_ORDER: Record<ConfidenceTier, number> = {
  unreliable: 0,
  low: 1,
  moderate: 2,
  high: 3,
};

export const hasOpenDisagreements = (record: Pick<IAutopsyRecordSnapshot, 'autopsy'>): boolean =>
  record.autopsy.disagreements.some((disagreement) => disagreement.resolutionStatus === 'open');

export const requiresOverrideApproval = (overrideGovernance: IOverrideGovernance | null | undefined): boolean =>
  Boolean(
    overrideGovernance &&
      overrideGovernance.approvalRequired &&
      (!overrideGovernance.approvedBy || !overrideGovernance.approvedAt)
  );

export const createPublicationBlockerSummary = (
  record: Pick<IAutopsyRecordSnapshot, 'autopsy'>
): IAutopsyPublicationBlockerSummary => {
  const blockers = new Set<string>();
  const autopsy = record.autopsy;

  if (autopsy.evidence.length < autopsy.publicationGate.requiredEvidenceCount) {
    blockers.add('missing-evidence');
  }

  if (
    CONFIDENCE_ORDER[autopsy.confidence.tier] <
    CONFIDENCE_ORDER[autopsy.publicationGate.minimumConfidenceTier]
  ) {
    blockers.add('confidence-below-minimum');
  }

  if (hasOpenDisagreements(record)) {
    blockers.add('open-disagreements');
  }

  if (!autopsy.reviewDecisions.some((decision) => decision.decision === 'approved')) {
    blockers.add('review-approval-pending');
  }

  if (autopsy.sensitivity.visibility === 'confidential' && autopsy.overrideGovernance === null) {
    blockers.add('sensitivity-review-required');
  }

  return {
    publishable: blockers.size === 0,
    blockers: [...blockers],
    minimumConfidenceTier: autopsy.publicationGate.minimumConfidenceTier ?? AUTOPSY_MIN_PUBLISH_CONFIDENCE,
  };
};
