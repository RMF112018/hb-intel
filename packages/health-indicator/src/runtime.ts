/**
 * Canonical health-indicator runtime primitives.
 *
 * Runtime logic is deterministic and side-effect free to support adapter-level
 * reuse across shared features without duplicating scoring engines.
 *
 * @design D-SF18-T06
 */

export type HealthIndicatorStatus = 'ready' | 'nearly-ready' | 'attention-needed' | 'not-ready';
export type HealthIndicatorScoringBand = 'excellent' | 'strong' | 'moderate' | 'weak';

export interface IHealthIndicatorVersionedRecord {
  readonly recordId: string;
  readonly version: number;
  readonly updatedAt: string;
  readonly updatedBy: string;
  readonly source?: string;
  readonly correlationId?: string;
}

export interface IHealthIndicatorGovernanceMetadata {
  readonly governanceState: string;
  readonly recordedAt: string;
  readonly recordedBy: string;
  readonly traceId: string;
  readonly immutableSnapshotId?: string;
  readonly telemetryKeys: readonly string[];
}

export interface IHealthIndicatorCompletenessMetadata {
  readonly requiredCount: number;
  readonly completedCount: number;
  readonly missingCount: number;
  readonly completionPercent: number;
}

export interface IHealthIndicatorCriterion {
  readonly criterionId: string;
  readonly label: string;
  readonly weight: number;
  readonly isBlocker: boolean;
  readonly isComplete: boolean;
  readonly actionHref: string;
  readonly completeness: IHealthIndicatorCompletenessMetadata;
  readonly assignee?: {
    readonly userId: string;
  } | null;
  readonly risk?: {
    readonly confidence: 'low' | 'medium' | 'high';
  };
}

export interface IHealthIndicatorProfile {
  readonly profileId: string;
  readonly criteria: readonly IHealthIndicatorCriterion[];
  readonly thresholds: {
    readonly readyMinScore: number;
    readonly nearlyReadyMinScore: number;
    readonly attentionNeededMinScore: number;
  };
}

export interface IHealthIndicatorCriterionOverride {
  readonly criterionId: string;
  readonly label?: string;
  readonly weight?: number;
  readonly isBlocker?: boolean;
  readonly actionHref?: string;
}

export interface IHealthIndicatorAdminOverride {
  readonly profileId?: string;
  readonly criteria?: readonly IHealthIndicatorCriterionOverride[];
  readonly thresholds?: Partial<IHealthIndicatorProfile['thresholds']>;
  readonly governance?: Partial<IHealthIndicatorGovernanceMetadata>;
  readonly version?: IHealthIndicatorVersionedRecord;
}

export interface IHealthIndicatorResolvedConfig {
  readonly profile: IHealthIndicatorProfile;
  readonly governance: IHealthIndicatorGovernanceMetadata;
  readonly version: IHealthIndicatorVersionedRecord;
  readonly source: 'baseline' | 'admin-override' | 'fallback';
  readonly fallbackApplied: boolean;
  readonly validationErrors: readonly string[];
}

export interface IHealthIndicatorReadinessScore {
  readonly value: number;
  readonly status: HealthIndicatorStatus;
  readonly band: HealthIndicatorScoringBand;
  readonly computedAt: string;
}

export interface IHealthIndicatorCategoryBreakdown {
  readonly categoryId: string;
  readonly label: string;
  readonly dimension: string;
  readonly score: number;
  readonly maxScore: number;
  readonly completionPercent: number;
  readonly blockerCount: number;
}

export interface IHealthIndicatorRecommendationAction {
  readonly actionId: string;
  readonly label: string;
  readonly actionHref: string;
  readonly ownerUserId?: string;
}

export interface IHealthIndicatorRecommendation {
  readonly recommendationId: string;
  readonly category: string;
  readonly priority: 'critical' | 'high' | 'medium' | 'low';
  readonly title: string;
  readonly summary: string;
  readonly actions: readonly IHealthIndicatorRecommendationAction[];
}

export interface IHealthIndicatorSummary {
  readonly score: IHealthIndicatorReadinessScore;
  readonly completeness: IHealthIndicatorCompletenessMetadata;
  readonly categoryBreakdown: readonly IHealthIndicatorCategoryBreakdown[];
  readonly recommendations: readonly IHealthIndicatorRecommendation[];
  readonly governance: IHealthIndicatorGovernanceMetadata;
}

function cloneCriterion(criterion: IHealthIndicatorCriterion): IHealthIndicatorCriterion {
  return {
    ...criterion,
    completeness: { ...criterion.completeness },
    assignee: criterion.assignee ? { ...criterion.assignee } : null,
    risk: criterion.risk ? { ...criterion.risk } : undefined,
  };
}

function cloneProfile(profile: IHealthIndicatorProfile): IHealthIndicatorProfile {
  return {
    ...profile,
    criteria: profile.criteria.map(cloneCriterion),
    thresholds: { ...profile.thresholds },
  };
}

function findDuplicateCriterionIds(overrides: readonly IHealthIndicatorCriterionOverride[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const item of overrides) {
    if (seen.has(item.criterionId)) {
      duplicates.add(item.criterionId);
    }
    seen.add(item.criterionId);
  }
  return [...duplicates].sort();
}

function normalizeWeights(criteria: readonly IHealthIndicatorCriterion[]): IHealthIndicatorCriterion[] {
  const total = criteria.reduce((sum, criterion) => sum + criterion.weight, 0);
  if (total <= 0) {
    return criteria.map((criterion) => ({ ...criterion, weight: 0 }));
  }

  const normalized = criteria.map((criterion) => ({
    ...criterion,
    weight: Number(((criterion.weight / total) * 100).toFixed(4)),
  }));

  const running = normalized.slice(0, -1).reduce((sum, criterion) => sum + criterion.weight, 0);
  const remainder = Number((100 - running).toFixed(4));
  if (normalized.length > 0) {
    normalized[normalized.length - 1] = {
      ...normalized[normalized.length - 1],
      weight: remainder,
    };
  }

  return normalized;
}

function resolveStatus(
  score: number,
  blockers: readonly IHealthIndicatorCriterion[],
  thresholds: IHealthIndicatorProfile['thresholds'],
): HealthIndicatorStatus {
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

function resolveBand(score: number): HealthIndicatorScoringBand {
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

function buildCompleteness(criteria: readonly IHealthIndicatorCriterion[]): IHealthIndicatorCompletenessMetadata {
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

function resolveDimension(criterionId: string): string {
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

function buildCategoryBreakdown(
  criteria: readonly IHealthIndicatorCriterion[],
): IHealthIndicatorCategoryBreakdown[] {
  const buckets = new Map<string, {
    label: string;
    dimension: string;
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
): IHealthIndicatorRecommendation[] {
  const blockers = criteria.filter((criterion) => criterion.isBlocker && !criterion.isComplete);
  const nonBlockers = criteria.filter((criterion) => !criterion.isBlocker && !criterion.isComplete);
  const recommendations: IHealthIndicatorRecommendation[] = [];

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
 * Resolves effective profile config with deterministic validation and fallback.
 *
 * @design D-SF18-T06
 */
export function resolveHealthIndicatorProfileConfig(params: {
  baseline: IHealthIndicatorProfile;
  override?: IHealthIndicatorAdminOverride | null;
  telemetryKeys: readonly string[];
  defaultVersion: IHealthIndicatorVersionedRecord;
  defaultGovernance: Omit<IHealthIndicatorGovernanceMetadata, 'telemetryKeys'>;
}): IHealthIndicatorResolvedConfig {
  const { baseline, override, telemetryKeys, defaultVersion, defaultGovernance } = params;
  const baselineClone = cloneProfile(baseline);
  const errors: string[] = [];

  if (!override) {
    return {
      profile: baselineClone,
      governance: {
        ...defaultGovernance,
        telemetryKeys,
      },
      version: defaultVersion,
      source: 'baseline',
      fallbackApplied: false,
      validationErrors: errors,
    };
  }

  const duplicateIds = override.criteria ? findDuplicateCriterionIds(override.criteria) : [];
  if (duplicateIds.length > 0) {
    errors.push(`Duplicate criterion overrides: ${duplicateIds.join(', ')}`);
  }

  const criteriaById = new Map(
    baselineClone.criteria.map((criterion) => [criterion.criterionId, cloneCriterion(criterion)]),
  );

  for (const criterionOverride of override.criteria ?? []) {
    const target = criteriaById.get(criterionOverride.criterionId);
    if (!target) {
      errors.push(`Unknown criterion override id: ${criterionOverride.criterionId}`);
      continue;
    }

    const nextWeight = criterionOverride.weight ?? target.weight;
    if (nextWeight < 0) {
      errors.push(`Negative weight for criterion: ${criterionOverride.criterionId}`);
      continue;
    }

    criteriaById.set(criterionOverride.criterionId, {
      ...target,
      label: criterionOverride.label ?? target.label,
      weight: nextWeight,
      isBlocker: criterionOverride.isBlocker ?? target.isBlocker,
      actionHref: criterionOverride.actionHref ?? target.actionHref,
    });
  }

  const resolvedThresholds = {
    readyMinScore:
      override.thresholds?.readyMinScore ?? baselineClone.thresholds.readyMinScore,
    nearlyReadyMinScore:
      override.thresholds?.nearlyReadyMinScore ?? baselineClone.thresholds.nearlyReadyMinScore,
    attentionNeededMinScore:
      override.thresholds?.attentionNeededMinScore ?? baselineClone.thresholds.attentionNeededMinScore,
  };

  if (!(resolvedThresholds.readyMinScore > resolvedThresholds.nearlyReadyMinScore
      && resolvedThresholds.nearlyReadyMinScore > resolvedThresholds.attentionNeededMinScore)) {
    errors.push('Threshold ordering invalid: ready > nearly-ready > attention-needed is required.');
  }

  let criteria = normalizeWeights([...criteriaById.values()]);
  if (criteria.every((criterion) => !criterion.isBlocker)) {
    errors.push('At least one blocker criterion is required.');
  }

  if (criteria.some((criterion) => criterion.weight < 0)) {
    errors.push('Criteria weights must be non-negative after normalization.');
  }

  criteria = [...criteria].sort((left, right) => {
    if (left.isBlocker !== right.isBlocker) {
      return left.isBlocker ? -1 : 1;
    }
    if (left.weight !== right.weight) {
      return right.weight - left.weight;
    }
    return left.label.localeCompare(right.label);
  });

  const fallbackApplied = errors.length > 0;
  const profile: IHealthIndicatorProfile = fallbackApplied
    ? baselineClone
    : {
      profileId: override.profileId ?? baselineClone.profileId,
      criteria,
      thresholds: resolvedThresholds,
    };

  return {
    profile,
    governance: {
      ...defaultGovernance,
      ...override.governance,
      telemetryKeys: override.governance?.telemetryKeys ?? telemetryKeys,
    },
    version: override.version ?? defaultVersion,
    source: fallbackApplied ? 'fallback' : 'admin-override',
    fallbackApplied,
    validationErrors: errors,
  };
}

/**
 * Builds deterministic readiness summary from criteria and resolved config.
 *
 * @design D-SF18-T06
 */
export function buildHealthIndicatorSummary(
  criteria: readonly IHealthIndicatorCriterion[],
  config: Pick<IHealthIndicatorResolvedConfig, 'profile' | 'governance'>,
  computedAt = new Date().toISOString(),
): IHealthIndicatorSummary {
  const scoreValue = computeWeightedScore(criteria);
  const blockers = criteria.filter((criterion) => criterion.isBlocker);

  return {
    score: {
      value: scoreValue,
      status: resolveStatus(scoreValue, blockers, config.profile.thresholds),
      band: resolveBand(scoreValue),
      computedAt,
    },
    completeness: buildCompleteness(criteria),
    categoryBreakdown: buildCategoryBreakdown(criteria),
    recommendations: buildRecommendations(criteria, scoreValue),
    governance: config.governance,
  };
}
