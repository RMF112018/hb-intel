/**
 * Recommendation and action payload contracts for readiness guidance surfaces.
 *
 * @design D-SF18-T02
 */
import type { RecommendationCategory, PriorityLevel } from '../constants/index.js';

export interface IReadinessActionPayload {
  readonly actionId: string;
  readonly label: string;
  readonly actionHref: string;
  readonly ownerUserId?: string;
  readonly dueAt?: string;
}

export interface IReadinessRecommendation {
  readonly recommendationId: string;
  readonly category: RecommendationCategory;
  readonly priority: PriorityLevel;
  readonly title: string;
  readonly summary: string;
  readonly actions: readonly IReadinessActionPayload[];
}
