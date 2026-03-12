/**
 * SF18-T03 adapters between pursuit readiness inputs and T02 contract outputs.
 *
 * This layer stays deterministic and side-effect free while projecting pursuit-like
 * inputs into canonical `IHealthIndicatorState` and `IBidReadinessViewState` data.
 *
 * @design D-SF18-T03, L-01, L-02, L-04
 */
import {
  BID_READINESS_SYNC_INDICATORS,
  type SyncIndicator,
} from '../../constants/index.js';
import type {
  IHealthIndicatorCriterion,
  IHealthIndicatorState,
  IBidReadinessViewState,
  VersionedRecord,
} from '../../types/index.js';
import {
  evaluateReadinessSummary,
  resolveBidReadinessProfileConfig,
  type IEstimatingBidReadinessAdminOverride,
} from '../profiles/index.js';

export interface IEstimatingPursuitReadinessInput {
  readonly pursuitId: string;
  readonly dueAt?: string;
  readonly costSectionsPopulated?: boolean;
  readonly bidBondConfirmed?: boolean;
  readonly addendaAcknowledged?: boolean;
  readonly subcontractorCoverageMet?: boolean;
  readonly bidDocumentsAttached?: boolean;
  readonly ceSignOff?: boolean;
  readonly version?: VersionedRecord;
}

function resolveCompletionByCriterion(
  criterionId: string,
  input: IEstimatingPursuitReadinessInput,
): boolean {
  switch (criterionId) {
    case 'cost-sections-populated':
      return Boolean(input.costSectionsPopulated);
    case 'bid-bond-confirmed':
      return Boolean(input.bidBondConfirmed);
    case 'addenda-acknowledged':
      return Boolean(input.addendaAcknowledged);
    case 'subcontractor-coverage':
      return Boolean(input.subcontractorCoverageMet);
    case 'bid-documents-attached':
      return Boolean(input.bidDocumentsAttached);
    case 'ce-sign-off':
      return Boolean(input.ceSignOff);
    default:
      return false;
  }
}

function withCriterionCompletion(
  criteria: readonly IHealthIndicatorCriterion[],
  input: IEstimatingPursuitReadinessInput,
): IHealthIndicatorCriterion[] {
  return criteria
    .map((criterion) => {
      const isComplete = resolveCompletionByCriterion(criterion.criterionId, input);
      const requiredCount = criterion.completeness.requiredCount;
      const completedCount = isComplete ? requiredCount : 0;
      const missingCount = Math.max(0, requiredCount - completedCount);

      return {
        ...criterion,
        isComplete,
        completeness: {
          requiredCount,
          completedCount,
          missingCount,
          completionPercent: requiredCount === 0
            ? 0
            : Number(((completedCount / requiredCount) * 100).toFixed(2)),
        },
      };
    })
    .sort((left, right) => {
      if (left.isBlocker !== right.isBlocker) {
        return left.isBlocker ? -1 : 1;
      }
      if (left.weight !== right.weight) {
        return right.weight - left.weight;
      }
      return left.label.localeCompare(right.label);
    });
}

function resolveVersion(input: IEstimatingPursuitReadinessInput): VersionedRecord {
  if (input.version) {
    return input.version;
  }

  return {
    recordId: input.pursuitId,
    version: 1,
    updatedAt: new Date(0).toISOString(),
    updatedBy: 'system:sf18-adapter',
    source: 'adapter-fallback',
    correlationId: `sf18-${input.pursuitId}`,
  };
}

function resolveDueMetadata(input: IEstimatingPursuitReadinessInput): {
  daysUntilDue: number | null;
  isOverdue: boolean;
} {
  if (!input.dueAt) {
    return {
      daysUntilDue: null,
      isOverdue: false,
    };
  }

  const nowMs = Date.now();
  const dueMs = new Date(input.dueAt).getTime();
  const deltaDays = Math.ceil((dueMs - nowMs) / (24 * 60 * 60 * 1000));

  return {
    daysUntilDue: Number.isFinite(deltaDays) ? deltaDays : null,
    isOverdue: Number.isFinite(deltaDays) ? deltaDays < 0 : false,
  };
}

/**
 * Maps pursuit-like inputs to canonical health-indicator state for SF18 surfaces.
 *
 * @design D-SF18-T03
 */
export function mapPursuitToHealthIndicatorItem(
  pursuit: IEstimatingPursuitReadinessInput,
  override?: IEstimatingBidReadinessAdminOverride,
): IHealthIndicatorState {
  const config = resolveBidReadinessProfileConfig(override);
  const criteria = withCriterionCompletion(config.profile.criteria, pursuit);
  const { summary } = evaluateReadinessSummary(criteria, override);
  const { daysUntilDue, isOverdue } = resolveDueMetadata(pursuit);

  return {
    score: summary.score.value,
    status: summary.score.status,
    criteria,
    blockers: criteria.filter((criterion) => criterion.isBlocker),
    daysUntilDue,
    isOverdue,
    version: resolveVersion(pursuit),
  };
}

/**
 * Maps canonical health-indicator state to Estimating view state.
 *
 * @design D-SF18-T03
 */
export function mapHealthIndicatorStateToBidReadinessView(
  state: IHealthIndicatorState,
  override?: IEstimatingBidReadinessAdminOverride,
  syncIndicator: SyncIndicator = BID_READINESS_SYNC_INDICATORS[0],
): IBidReadinessViewState {
  const normalizedSync = BID_READINESS_SYNC_INDICATORS.includes(syncIndicator)
    ? syncIndicator
    : BID_READINESS_SYNC_INDICATORS[0];

  const { summary } = evaluateReadinessSummary(state.criteria, override);

  return {
    status: state.status,
    score: state.score,
    blockers: state.blockers,
    criteria: state.criteria.map((criterion) => ({
      criterion,
      isComplete: criterion.isComplete,
      assignee: criterion.assignee,
      actionHref: criterion.actionHref,
    })),
    summary,
    daysUntilDue: state.daysUntilDue,
    isOverdue: state.isOverdue,
    version: state.version,
    syncIndicator: normalizedSync,
  };
}
