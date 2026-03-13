import type {
  ConfidenceTier,
  IAutopsyEvidence,
  IPostBidAutopsy,
} from '@hbc/post-bid-autopsy';

import type { IEstimatingPostBidLearningProfile } from '../profiles/index.js';

export interface IEstimatingPostBidLearningRowProjection {
  readonly autopsyId: string;
  readonly pursuitId: string;
  readonly status: IPostBidAutopsy['status'];
  readonly outcome: IPostBidAutopsy['outcome'];
  readonly confidenceTier: ConfidenceTier;
  readonly evidenceCount: number;
}

export interface IEstimatingPostBidLearningSummaryProjection {
  readonly autopsyId: string;
  readonly profileId: string;
  readonly status: IPostBidAutopsy['status'];
  readonly confidenceScore: number;
  readonly reviewDecisionCount: number;
  readonly disagreementCount: number;
}

export interface IEstimatingAutopsyEvidenceProjection {
  readonly evidenceId: string;
  readonly type: IAutopsyEvidence['type'];
  readonly sourceRef: string;
  readonly reliabilityHint?: IAutopsyEvidence['reliabilityHint'];
}

export interface IEstimatingBenchmarkRecommendationProjection {
  readonly autopsyId: string;
  readonly publishable: boolean;
  readonly blockerCount: number;
  readonly rootCauseCodes: readonly string[];
  readonly minimumConfidenceTier: ConfidenceTier;
}

export interface IEstimatingPostBidLearningView {
  readonly row: IEstimatingPostBidLearningRowProjection;
  readonly summary: IEstimatingPostBidLearningSummaryProjection;
  readonly evidenceReferences: readonly IEstimatingAutopsyEvidenceProjection[];
  readonly benchmarkRecommendation: IEstimatingBenchmarkRecommendationProjection;
}

export const mapPostBidAutopsyToEstimatingView = (
  record: IPostBidAutopsy,
  profile: IEstimatingPostBidLearningProfile
): IEstimatingPostBidLearningView => ({
  row: {
    autopsyId: record.autopsyId,
    pursuitId: record.pursuitId,
    status: record.status,
    outcome: record.outcome,
    confidenceTier: record.confidence.tier,
    evidenceCount: record.evidence.length,
  },
  summary: {
    autopsyId: record.autopsyId,
    profileId: profile.profileId,
    status: record.status,
    confidenceScore: record.confidence.score,
    reviewDecisionCount: record.reviewDecisions.length,
    disagreementCount: record.disagreements.length,
  },
  evidenceReferences: record.evidence.map((evidence) => ({
    evidenceId: evidence.evidenceId,
    type: evidence.type,
    sourceRef: evidence.sourceRef,
    reliabilityHint: evidence.reliabilityHint,
  })),
  benchmarkRecommendation: {
    autopsyId: record.autopsyId,
    publishable: record.publicationGate.publishable,
    blockerCount: record.publicationGate.blockers.length,
    rootCauseCodes: record.rootCauseTags.map((tag) => tag.normalizedCode),
    minimumConfidenceTier: record.publicationGate.minimumConfidenceTier,
  },
});
