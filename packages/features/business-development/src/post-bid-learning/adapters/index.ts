import type {
  ConfidenceTier,
  IAutopsyEvidence,
  IPostBidAutopsy,
} from '@hbc/post-bid-autopsy';

import type { IBusinessDevelopmentPostBidLearningProfile } from '../profiles/index.js';

export interface IBusinessDevelopmentPostBidLearningRowProjection {
  readonly autopsyId: string;
  readonly pursuitId: string;
  readonly scorecardId: string;
  readonly status: IPostBidAutopsy['status'];
  readonly outcome: IPostBidAutopsy['outcome'];
  readonly confidenceTier: ConfidenceTier;
  readonly publicationReady: boolean;
  readonly blockerCount: number;
}

export interface IBusinessDevelopmentPostBidLearningSummaryProjection {
  readonly autopsyId: string;
  readonly profileId: string;
  readonly status: IPostBidAutopsy['status'];
  readonly evidenceCount: number;
  readonly rootCauseLabels: readonly string[];
  readonly reviewDecisionCount: number;
  readonly sensitivityVisibility: IPostBidAutopsy['sensitivity']['visibility'];
}

export interface IBusinessDevelopmentAutopsyEvidenceProjection {
  readonly evidenceId: string;
  readonly type: IAutopsyEvidence['type'];
  readonly sourceRef: string;
  readonly sensitivity: IAutopsyEvidence['sensitivity'];
}

export interface IBusinessDevelopmentBenchmarkEnrichmentProjection {
  readonly autopsyId: string;
  readonly publishable: boolean;
  readonly minimumConfidenceTier: ConfidenceTier;
  readonly blockerCount: number;
  readonly rootCauseCodes: readonly string[];
}

export interface IBusinessDevelopmentPostBidLearningView {
  readonly row: IBusinessDevelopmentPostBidLearningRowProjection;
  readonly summary: IBusinessDevelopmentPostBidLearningSummaryProjection;
  readonly evidenceReferences: readonly IBusinessDevelopmentAutopsyEvidenceProjection[];
  readonly benchmarkEnrichment: IBusinessDevelopmentBenchmarkEnrichmentProjection;
}

export const mapPostBidAutopsyToBusinessDevelopmentView = (
  record: IPostBidAutopsy,
  profile: IBusinessDevelopmentPostBidLearningProfile
): IBusinessDevelopmentPostBidLearningView => ({
  row: {
    autopsyId: record.autopsyId,
    pursuitId: record.pursuitId,
    scorecardId: record.scorecardId,
    status: record.status,
    outcome: record.outcome,
    confidenceTier: record.confidence.tier,
    publicationReady: record.publicationGate.publishable,
    blockerCount: record.publicationGate.blockers.length,
  },
  summary: {
    autopsyId: record.autopsyId,
    profileId: profile.profileId,
    status: record.status,
    evidenceCount: record.evidence.length,
    rootCauseLabels: record.rootCauseTags.map((tag) => tag.label),
    reviewDecisionCount: record.reviewDecisions.length,
    sensitivityVisibility: record.sensitivity.visibility,
  },
  evidenceReferences: record.evidence.map((evidence) => ({
    evidenceId: evidence.evidenceId,
    type: evidence.type,
    sourceRef: evidence.sourceRef,
    sensitivity: evidence.sensitivity,
  })),
  benchmarkEnrichment: {
    autopsyId: record.autopsyId,
    publishable: record.publicationGate.publishable,
    minimumConfidenceTier: record.publicationGate.minimumConfidenceTier,
    blockerCount: record.publicationGate.blockers.length,
    rootCauseCodes: record.rootCauseTags.map((tag) => tag.normalizedCode),
  },
});
