import type { IPostBidAutopsy } from '../types/index.js';
import { createAutopsyTelemetryState } from '../telemetry/index.js';
import { createConfidenceAssessment, POST_BID_AUTOPSY_CONFIDENCE_BOUNDARY } from './confidence/index.js';
import { createEvidenceRecord, POST_BID_AUTOPSY_EVIDENCE_BOUNDARY } from './evidence/index.js';
import {
  createDisagreementRecord,
  createOverrideGovernance,
  createReviewDecision,
  createSensitivityPolicy,
  POST_BID_AUTOPSY_GOVERNANCE_BOUNDARY,
} from './governance/index.js';
import {
  createPublicationGate,
  createSupersessionLink,
  POST_BID_AUTOPSY_PUBLICATION_BOUNDARY,
} from './publication/index.js';
import { createRootCauseTag, POST_BID_AUTOPSY_TAXONOMY_BOUNDARY } from './taxonomy/index.js';

export {
  POST_BID_AUTOPSY_CONFIDENCE_BOUNDARY,
  POST_BID_AUTOPSY_EVIDENCE_BOUNDARY,
  POST_BID_AUTOPSY_GOVERNANCE_BOUNDARY,
  POST_BID_AUTOPSY_PUBLICATION_BOUNDARY,
  POST_BID_AUTOPSY_TAXONOMY_BOUNDARY,
  createConfidenceAssessment,
  createEvidenceRecord,
  createSensitivityPolicy,
  createReviewDecision,
  createDisagreementRecord,
  createOverrideGovernance,
  createPublicationGate,
  createSupersessionLink,
  createRootCauseTag,
};

export const createPostBidAutopsyRecord = (
  overrides: Partial<IPostBidAutopsy> = {}
): IPostBidAutopsy => ({
  autopsyId: overrides.autopsyId ?? 'autopsy-default',
  pursuitId: overrides.pursuitId ?? 'pursuit-default',
  scorecardId: overrides.scorecardId ?? 'scorecard-default',
  outcome: overrides.outcome ?? 'lost',
  status: overrides.status ?? 'draft',
  confidence: overrides.confidence ?? createConfidenceAssessment(),
  evidence: overrides.evidence ?? [createEvidenceRecord()],
  rootCauseTags: overrides.rootCauseTags ?? [createRootCauseTag()],
  sensitivity: overrides.sensitivity ?? createSensitivityPolicy(),
  reviewDecisions: overrides.reviewDecisions ?? [createReviewDecision()],
  disagreements: overrides.disagreements ?? [createDisagreementRecord()],
  publicationGate: overrides.publicationGate ?? createPublicationGate(),
  supersession: overrides.supersession ?? createSupersessionLink(),
  overrideGovernance:
    overrides.overrideGovernance === undefined ? null : overrides.overrideGovernance,
  telemetry: overrides.telemetry ?? createAutopsyTelemetryState(),
});

export const createPostBidAutopsyModelBoundary = () =>
  Object.freeze({
    evidence: POST_BID_AUTOPSY_EVIDENCE_BOUNDARY,
    confidence: POST_BID_AUTOPSY_CONFIDENCE_BOUNDARY,
    taxonomy: POST_BID_AUTOPSY_TAXONOMY_BOUNDARY,
    governance: POST_BID_AUTOPSY_GOVERNANCE_BOUNDARY,
    publication: POST_BID_AUTOPSY_PUBLICATION_BOUNDARY,
  });
