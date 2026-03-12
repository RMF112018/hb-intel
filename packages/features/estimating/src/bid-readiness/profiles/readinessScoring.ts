/**
 * SF18-T03 deterministic scoring and summary composition helpers.
 *
 * These helpers remain pure and side-effect free so profile/config behavior is
 * reproducible across PWA, SPFx, and offline replay boundaries.
 *
 * @design D-SF18-T03, L-01, L-02, L-04, L-06
 */
import type {
  ICompletenessMetadata,
  IHealthIndicatorCriterion,
  IReadinessCategoryBreakdown,
  IReadinessGovernanceMetadata,
  IReadinessRecommendation,
  IReadinessSummaryPayload,
  IReadinessScore,
  ScoringDimensionKey,
} from '../../types/index.js';
import type { ScoringBand } from '../../constants/index.js';
import { resolveBidReadinessProfileConfig, type IResolvedBidReadinessConfig } from './readinessConfigResolver.js';

function computeWeightedScore(criteria: readonly IHealthIndicatorCriterion[]): number {
  const totalWeight = criteria.reduce((sum, criterion) => sum + criterion.weight, 0);
  if (totalWeight <= 0) {
    return 0;
  }

  const completedWeight = criteria
    .filter((criterion) => criterion.isComplete)
    .reduce((sum, criterion) => sum + criterion.weight, 0);

  return Number(((completedWeight / totalWeight) * 100).toFixed(2));
}

function resolveStatus(
  score: number,
  blockers: readonly IHealthIndicatorCriterion[],
  thresholds: IResolvedBidReadinessConfig['profile']['thresholds'],
): IReadinessScore['status'] {
  const hasIncompleteBlocker = blockers.some((criterion) => !criterion.isComplete);

  if (!hasIncompleteBlocker && score >= thresholds.readyMinScore) {
    return 'ready';
  }

  if (!hasIncompleteBlocker && score >= thresholds.nearlyReadyMinScore) {
    return 'nearly-ready';
  }

  if (score >= thresholds.attentionNeededMinScore) {
    return 'attention-needed';
  }

  return 'not-ready';
}

function resolveBand(score: number): ScoringBand {
  if (score >= 90) {
    return 'excellent';
  }
  if (score >= 70) {
    return 'strong';
  }
  if (score >= 50) {
    return 'moderate';
  }
  return 'weak';
}

function resolveDimension(criterionId: string): ScoringDimensionKey {
  if (criterionId === 'cost-sections-populated' || criterionId === 'bid-documents-attached') {
    return 'scope-completeness';
  }
  if (criterionId === 'subcontractor-coverage') {
    return 'coverage';
  }
  if (criterionId === 'ce-sign-off') {
    return 'governance';
  }
  return 'compliance';
}

function buildCompleteness(criteria: readonly IHealthIndicatorCriterion[]): ICompletenessMetadata {
  const requiredCount = criteria.length;
  const completedCount = criteria.filter((criterion) => criterion.isComplete).length;
  const missingCount = Math.max(0, requiredCount - completedCount);
  const completionPercent = requiredCount === 0
    ? 0
    : Number(((completedCount / requiredCount) * 100).toFixed(2));

  return {
    requiredCount,
    completedCount,
    missingCount,
    completionPercent,
  };
}

function buildCategoryBreakdown(
  criteria: readonly IHealthIndicatorCriterion[],
): IReadinessCategoryBreakdown[] {
  const buckets = new Map<string, {
    label: string;
    dimension: ScoringDimensionKey;
    score: number;
    maxScore: number;
    blockerCount: number;
  }>();

  for (const criterion of criteria) {
    const dimension = resolveDimension(criterion.criterionId);
    const key = `dimension:${dimension}`;
    const current = buckets.get(key) ?? {
      label: dimension,
      dimension,
      score: 0,
      maxScore: 0,
      blockerCount: 0,
    };

    current.maxScore += criterion.weight;
    if (criterion.isComplete) {
      current.score += criterion.weight;
    }
    if (criterion.isBlocker && !criterion.isComplete) {
      current.blockerCount += 1;
    }

    buckets.set(key, current);
  }

  return [...buckets.entries()]
    .map(([categoryId, bucket]) => ({
      categoryId,
      label: bucket.label,
      dimension: bucket.dimension,
      score: Number(bucket.score.toFixed(2)),
      maxScore: Number(bucket.maxScore.toFixed(2)),
      completionPercent: bucket.maxScore <= 0
        ? 0
        : Number(((bucket.score / bucket.maxScore) * 100).toFixed(2)),
      blockerCount: bucket.blockerCount,
    }))
    .sort((left, right) => left.categoryId.localeCompare(right.categoryId));
}

function buildRecommendations(
  criteria: readonly IHealthIndicatorCriterion[],
  score: number,
): IReadinessRecommendation[] {
  const blockers = criteria.filter((criterion) => criterion.isBlocker && !criterion.isComplete);
  const nonBlockers = criteria.filter((criterion) => !criterion.isBlocker && !criterion.isComplete);
  const recommendations: IReadinessRecommendation[] = [];

  if (blockers.length > 0) {
    recommendations.push({
      recommendationId: 'resolve-blockers',
      category: 'blocker-resolution',
      priority: 'critical',
      title: 'Resolve blocker criteria',
      summary: `${blockers.length} blocker criteria must be completed before bid submission readiness.`,
      actions: blockers.map((criterion) => ({
        actionId: `resolve-${criterion.criterionId}`,
        label: `Complete ${criterion.label}`,
        actionHref: criterion.actionHref,
        ownerUserId: criterion.assignee?.userId,
      })),
    });
  }

  if (nonBlockers.length > 0) {
    recommendations.push({
      recommendationId: 'complete-non-blockers',
      category: 'documentation-completion',
      priority: blockers.length > 0 ? 'medium' : 'high',
      title: 'Complete remaining readiness criteria',
      summary: `${nonBlockers.length} non-blocker criteria remain incomplete.`,
      actions: nonBlockers.map((criterion) => ({
        actionId: `complete-${criterion.criterionId}`,
        label: `Address ${criterion.label}`,
        actionHref: criterion.actionHref,
        ownerUserId: criterion.assignee?.userId,
      })),
    });
  }

  if (score < 70) {
    recommendations.push({
      recommendationId: 'improve-readiness-score',
      category: 'coverage-improvement',
      priority: 'high',
      title: 'Increase readiness score',
      summary: 'Current readiness score is below nearly-ready threshold; prioritize high-weight criteria.',
      actions: [],
    });
  }

  return recommendations;
}

/**
 * Composes a normalized readiness summary payload from criteria and resolved config.
 *
 * @design D-SF18-T03
 */
export function buildReadinessSummary(
  criteria: readonly IHealthIndicatorCriterion[],
  config: Pick<IResolvedBidReadinessConfig, 'profile' | 'governance'>,
  computedAt = new Date().toISOString(),
): IReadinessSummaryPayload {
  const scoreValue = computeWeightedScore(criteria);
  const blockers = criteria.filter((criterion) => criterion.isBlocker);
  const status = resolveStatus(scoreValue, blockers, config.profile.thresholds);
  const score: IReadinessScore = {
    value: scoreValue,
    status,
    band: resolveBand(scoreValue),
    computedAt,
  };

  return {
    score,
    completeness: buildCompleteness(criteria),
    categoryBreakdown: buildCategoryBreakdown(criteria),
    recommendations: buildRecommendations(criteria, scoreValue),
    governance: config.governance,
  };
}

/**
 * Convenience helper that resolves config first, then computes summary.
 *
 * @design D-SF18-T03
 */
export function evaluateReadinessSummary(
  criteria: readonly IHealthIndicatorCriterion[],
  override?: Parameters<typeof resolveBidReadinessProfileConfig>[0],
  computedAt = new Date().toISOString(),
): { summary: IReadinessSummaryPayload; config: IResolvedBidReadinessConfig } {
  const config = resolveBidReadinessProfileConfig(override);
  const summary = buildReadinessSummary(criteria, config, computedAt);
  return { summary, config };
}
