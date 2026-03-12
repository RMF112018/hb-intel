import type { ITopRecommendedAction } from '../../types/index.js';

export interface IRecommendationCandidate {
  actionText: string;
  actionLink: string | null;
  reasonCode: string;
  owner: string | null;
  urgency: number;
  impact: number;
  reversibilityWindowHours: number;
  ownerAvailability: number;
  confidenceWeight: number;
}

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

const rankCandidate = (candidate: IRecommendationCandidate): number => {
  const urgency = clamp(candidate.urgency, 0, 100) * 0.35;
  const impact = clamp(candidate.impact, 0, 100) * 0.3;
  const reversibility = clamp(100 - candidate.reversibilityWindowHours, 0, 100) * 0.15;
  const ownerAvailability = clamp(candidate.ownerAvailability, 0, 100) * 0.1;
  const confidence = clamp(candidate.confidenceWeight, 0, 100) * 0.1;

  return urgency + impact + reversibility + ownerAvailability + confidence;
};

export const rankRecommendationCandidates = (
  candidates: IRecommendationCandidate[]
): IRecommendationCandidate[] =>
  [...candidates].sort((left, right) => rankCandidate(right) - rankCandidate(left));

export const selectTopRecommendedAction = (
  candidates: IRecommendationCandidate[]
): ITopRecommendedAction | null => {
  if (candidates.length === 0) {
    return null;
  }

  const winner = rankRecommendationCandidates(candidates)[0];

  return {
    actionText: winner.actionText,
    actionLink: winner.actionLink,
    reasonCode: winner.reasonCode,
    owner: winner.owner,
    urgency: Math.round(clamp(winner.urgency, 0, 100)),
    impact: Math.round(clamp(winner.impact, 0, 100)),
    confidenceWeight: Math.round(clamp(winner.confidenceWeight, 0, 100)),
  };
};

export const HEALTH_PULSE_RECOMMENDATION_SCOPE = 'health-pulse/recommendation';
