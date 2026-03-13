import { describe, expect, it } from 'vitest';

import {
  POST_BID_AUTOPSY_API_SURFACES,
  createPostBidAutopsyApiScaffold,
} from './api/index.js';
import {
  POST_BID_AUTOPSY_CONFIDENCE_BOUNDARY,
  POST_BID_AUTOPSY_EVIDENCE_BOUNDARY,
  POST_BID_AUTOPSY_GOVERNANCE_BOUNDARY,
  POST_BID_AUTOPSY_PUBLICATION_BOUNDARY,
  POST_BID_AUTOPSY_TAXONOMY_BOUNDARY,
  createConfidenceAssessment,
  createDisagreementRecord,
  createEvidenceRecord,
  createOverrideGovernance,
  createPostBidAutopsyModelBoundary,
  createPostBidAutopsyRecord,
  createPublicationGate,
  createReviewDecision,
  createRootCauseTag,
  createSensitivityPolicy,
  createSupersessionLink,
} from './model/index.js';
import {
  POST_BID_AUTOPSY_HOOK_SURFACES,
  createAutopsyCommitMetadata,
  createAutopsyCompletenessState,
  createAutopsyPublicationBlockerSummary,
  createAutopsyQueueState,
  createPostBidAutopsyHookScaffold,
  createPostBidAutopsyQueueQueryKey,
  createPostBidAutopsyReviewQueryKey,
  createPostBidAutopsySectionsQueryKey,
  createPostBidAutopsyStateQueryKey,
} from './hooks/index.js';
import {
  POST_BID_AUTOPSY_TELEMETRY_EVENTS,
  createAutopsyTelemetryState,
} from './telemetry/index.js';
import { POST_BID_AUTOPSY_COMPONENT_CONTRACTS } from './components/index.js';
import {
  createMockBenchmarkDatasetSignal,
  createMockPostBidAutopsyApi,
  createMockPostBidAutopsyRecord,
} from '../testing/index.js';

describe('post-bid autopsy scaffold surfaces', () => {
  it('creates deterministic primitive-owned boundary records', () => {
    expect(POST_BID_AUTOPSY_EVIDENCE_BOUNDARY.owner).toBe('primitive');
    expect(POST_BID_AUTOPSY_CONFIDENCE_BOUNDARY.area).toBe('confidence');
    expect(POST_BID_AUTOPSY_TAXONOMY_BOUNDARY.area).toBe('taxonomy');
    expect(POST_BID_AUTOPSY_GOVERNANCE_BOUNDARY.area).toBe('governance');
    expect(POST_BID_AUTOPSY_PUBLICATION_BOUNDARY.area).toBe('publication');

    const record = createPostBidAutopsyRecord({
      evidence: [createEvidenceRecord({ evidenceId: 'e-1' })],
      confidence: createConfidenceAssessment({ score: 0.81 }),
      rootCauseTags: [createRootCauseTag({ tagId: 'tag-1' })],
      sensitivity: createSensitivityPolicy({ visibility: 'project-scoped' }),
      reviewDecisions: [createReviewDecision({ reviewer: 'approver-1' })],
      disagreements: [createDisagreementRecord({ disagreementId: 'disagreement-1' })],
      publicationGate: createPublicationGate({ requiredEvidenceCount: 2 }),
      supersession: createSupersessionLink({ reason: 'refreshed-autopsy' }),
      overrideGovernance: createOverrideGovernance({ overriddenBy: 'approver-1' }),
      telemetry: createAutopsyTelemetryState({ corroborationRate: 0.5 }),
    });

    expect(record.evidence[0]?.evidenceId).toBe('e-1');
    expect(record.confidence.score).toBe(0.81);
    expect(record.rootCauseTags[0]?.tagId).toBe('tag-1');
    expect(record.sensitivity.visibility).toBe('project-scoped');
    expect(record.reviewDecisions[0]?.reviewer).toBe('approver-1');
    expect(record.disagreements[0]?.disagreementId).toBe('disagreement-1');
    expect(record.publicationGate.requiredEvidenceCount).toBe(2);
    expect(record.supersession.reason).toBe('refreshed-autopsy');
    expect(record.overrideGovernance?.overriddenBy).toBe('approver-1');
    expect(record.telemetry.corroborationRate).toBe(0.5);
    expect(createPostBidAutopsyModelBoundary().governance.owner).toBe('primitive');
  });

  it('exposes deterministic api, hook, component, and telemetry scaffolds', () => {
    expect(createPostBidAutopsyApiScaffold().surfaces).toEqual(POST_BID_AUTOPSY_API_SURFACES);
    expect(createMockPostBidAutopsyApi().surfaces).toHaveLength(2);
    expect(createPostBidAutopsyHookScaffold().surfaces).toEqual(POST_BID_AUTOPSY_HOOK_SURFACES);
    expect(createPostBidAutopsyStateQueryKey('pursuit-1')).toEqual([
      'post-bid-autopsy',
      'pursuit-1',
    ]);
    expect(createPostBidAutopsySectionsQueryKey('pursuit-1')).toEqual([
      'post-bid-autopsy',
      'pursuit-1',
      'sections',
    ]);
    expect(createPostBidAutopsyReviewQueryKey('pursuit-1')).toEqual([
      'post-bid-autopsy',
      'pursuit-1',
      'review',
    ]);
    expect(createPostBidAutopsyQueueQueryKey('pursuit-1')).toEqual([
      'post-bid-autopsy',
      'pursuit-1',
      'queue',
    ]);
    expect(createAutopsyQueueState().syncQueueKey).toBe('post-bid-autopsy-sync-queue');
    expect(createAutopsyCommitMetadata().source).toBe('unknown');
    expect(
      createAutopsyCompletenessState(
        createMockPostBidAutopsyRecord({
          evidence: [],
          publicationGate: createPublicationGate({ requiredEvidenceCount: 2 }),
        })
      ).evidenceComplete
    ).toBe(false);
    expect(
      createAutopsyPublicationBlockerSummary(
        createMockPostBidAutopsyRecord({
          publicationGate: createPublicationGate({ blockers: ['review-pending'] }),
        })
      ).blockers
    ).toEqual(['review-pending']);
    expect(POST_BID_AUTOPSY_COMPONENT_CONTRACTS).toHaveLength(4);
    expect(POST_BID_AUTOPSY_TELEMETRY_EVENTS).toContain('post-bid-autopsy.signal-published');
  });

  it('provides public testing fixtures compatible with the scaffold contracts', () => {
    const record = createMockPostBidAutopsyRecord({ status: 'review' });
    const signal = createMockBenchmarkDatasetSignal({ signalId: 'signal-1' });

    expect(record.status).toBe('review');
    expect(signal.signalId).toBe('signal-1');
    expect(signal.signalType).toBe('benchmark-dataset-enrichment');
  });
});
