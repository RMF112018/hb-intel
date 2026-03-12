/**
 * SF18-T03 readiness profile configuration resolution.
 *
 * Merge order (locked): baseline profile -> admin override -> runtime validation.
 *
 * Validation guarantees:
 * - non-negative criterion weights
 * - deterministic normalization of weights to 100 total
 * - threshold ordering: ready > nearly-ready > attention-needed
 * - at least one blocker criterion
 *
 * Fallback behavior:
 * - invalid/partial/unknown overrides return baseline profile with collected
 *   validation errors and fallbackApplied flag for degraded-state visibility.
 *
 * @design D-SF18-T03, L-01, L-02, L-04, L-06
 */
import { TELEMETRY_KEYS } from '../../constants/index.js';
import type {
  IEstimatingBidReadinessProfile,
  IHealthIndicatorCriterion,
  IReadinessGovernanceMetadata,
  VersionedRecord,
} from '../../types/index.js';
import { estimatingBidReadinessProfile } from './estimatingBidReadinessProfile.js';

export interface ICriterionOverride {
  readonly criterionId: string;
  readonly label?: string;
  readonly weight?: number;
  readonly isBlocker?: boolean;
  readonly actionHref?: string;
}

export interface IEstimatingBidReadinessAdminOverride {
  readonly profileId?: IEstimatingBidReadinessProfile['profileId'];
  readonly criteria?: readonly ICriterionOverride[];
  readonly thresholds?: Partial<IEstimatingBidReadinessProfile['thresholds']>;
  readonly governance?: Partial<IReadinessGovernanceMetadata>;
  readonly version?: VersionedRecord;
}

export interface IResolvedBidReadinessConfig {
  readonly profile: IEstimatingBidReadinessProfile;
  readonly governance: IReadinessGovernanceMetadata;
  readonly version: VersionedRecord;
  readonly source: 'baseline' | 'admin-override' | 'fallback';
  readonly fallbackApplied: boolean;
  readonly validationErrors: readonly string[];
}

function cloneCriterion(criterion: IHealthIndicatorCriterion): IHealthIndicatorCriterion {
  return {
    ...criterion,
    completeness: { ...criterion.completeness },
    qualification: criterion.qualification ? { ...criterion.qualification } : undefined,
    risk: criterion.risk ? { ...criterion.risk } : undefined,
    assignee: criterion.assignee ? { ...criterion.assignee } : null,
  };
}

function cloneProfile(profile: IEstimatingBidReadinessProfile): IEstimatingBidReadinessProfile {
  return {
    ...profile,
    criteria: profile.criteria.map(cloneCriterion),
    thresholds: { ...profile.thresholds },
  };
}

function findDuplicateCriterionIds(overrides: readonly ICriterionOverride[]): string[] {
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

  // Preserve deterministic sum = 100 by applying remainder to the final entry.
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

function buildDefaultVersion(): VersionedRecord {
  return {
    recordId: 'sf18-profile-estimating-bid-readiness',
    version: 1,
    updatedAt: new Date(0).toISOString(),
    updatedBy: 'system:sf18-baseline',
    source: 'baseline-profile',
    correlationId: 'sf18-t03-baseline',
  };
}

function buildDefaultGovernance(nowIso: string): IReadinessGovernanceMetadata {
  return {
    governanceState: 'approved',
    recordedAt: nowIso,
    recordedBy: 'system:sf18-profile-resolver',
    traceId: 'sf18-t03-profile-resolver',
    immutableSnapshotId: 'sf18-estimating-bid-readiness-baseline',
    telemetryKeys: TELEMETRY_KEYS,
  };
}

/**
 * Resolves effective profile config with deterministic validation and fallback.
 *
 * @design D-SF18-T03
 */
export function resolveBidReadinessProfileConfig(
  override?: IEstimatingBidReadinessAdminOverride | null,
): IResolvedBidReadinessConfig {
  const baseline = cloneProfile(estimatingBidReadinessProfile);
  const nowIso = new Date().toISOString();
  const errors: string[] = [];

  if (!override) {
    return {
      profile: baseline,
      governance: buildDefaultGovernance(nowIso),
      version: buildDefaultVersion(),
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
    baseline.criteria.map((criterion) => [criterion.criterionId, cloneCriterion(criterion)]),
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
      override.thresholds?.readyMinScore ?? baseline.thresholds.readyMinScore,
    nearlyReadyMinScore:
      override.thresholds?.nearlyReadyMinScore ?? baseline.thresholds.nearlyReadyMinScore,
    attentionNeededMinScore:
      override.thresholds?.attentionNeededMinScore ?? baseline.thresholds.attentionNeededMinScore,
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

  // Deterministic ordering: blockers first, then weight desc, then label asc.
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
  const profile: IEstimatingBidReadinessProfile = fallbackApplied
    ? baseline
    : {
      profileId: override.profileId ?? baseline.profileId,
      criteria,
      thresholds: resolvedThresholds,
    };

  const version = override.version ?? buildDefaultVersion();
  const governance: IReadinessGovernanceMetadata = {
    ...buildDefaultGovernance(nowIso),
    ...override.governance,
    telemetryKeys: override.governance?.telemetryKeys ?? TELEMETRY_KEYS,
  };

  return {
    profile,
    governance,
    version,
    source: fallbackApplied ? 'fallback' : 'admin-override',
    fallbackApplied,
    validationErrors: errors,
  };
}
