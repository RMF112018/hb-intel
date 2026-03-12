/**
 * SF18-T07 approval authority reference integration adapter.
 *
 * Resolves deterministic approval requirements from readiness state while
 * keeping external authority services out of feature runtime.
 *
 * @design D-SF18-T07
 */
import type { IBidReadinessViewState } from '../../types/index.js';

export interface IBidReadinessApprovalRequirement {
  readonly approvalId: string;
  readonly role: 'ChiefEstimator' | 'PreconstructionManager' | 'OperationsLead';
  readonly required: boolean;
  readonly satisfied: boolean;
  readonly rationale: string;
}

export interface IBidReadinessApprovalResolution {
  readonly decision: 'approved' | 'pending' | 'blocked';
  readonly requirements: readonly IBidReadinessApprovalRequirement[];
}

/**
 * Resolves approval authority outcomes from bid-readiness view state.
 *
 * @design D-SF18-T07
 */
export function resolveBidReadinessApprovalAuthority(
  viewState: IBidReadinessViewState | null,
): IBidReadinessApprovalResolution {
  if (!viewState) {
    return {
      decision: 'pending',
      requirements: [
        {
          approvalId: 'missing-readiness-state',
          role: 'ChiefEstimator',
          required: true,
          satisfied: false,
          rationale: 'Readiness state is unavailable.',
        },
      ],
    };
  }

  const ceCriterion = viewState.criteria.find((item) => item.criterion.criterionId === 'ce-sign-off');
  const incompleteBlockers = viewState.criteria.filter(
    ({ criterion, isComplete }) => criterion.isBlocker && !isComplete,
  ).length;

  const requirements: IBidReadinessApprovalRequirement[] = [
    {
      approvalId: 'ce-sign-off',
      role: 'ChiefEstimator',
      required: true,
      satisfied: Boolean(ceCriterion?.isComplete),
      rationale: 'Chief Estimator sign-off is a required readiness criterion.',
    },
    {
      approvalId: 'blocker-clearance',
      role: 'PreconstructionManager',
      required: incompleteBlockers > 0,
      satisfied: incompleteBlockers === 0,
      rationale: incompleteBlockers > 0
        ? 'Incomplete blocker criteria require preconstruction clearance.'
        : 'No incomplete blocker criteria remain.',
    },
    {
      approvalId: 'final-operational-check',
      role: 'OperationsLead',
      required: viewState.status !== 'ready',
      satisfied: viewState.status === 'ready',
      rationale: viewState.status === 'ready'
        ? 'Readiness state is ready.'
        : 'Operational review remains required before submission.',
    },
  ];

  const decision = requirements.some((item) => item.required && !item.satisfied)
    ? (incompleteBlockers > 0 ? 'blocked' : 'pending')
    : 'approved';

  return {
    decision,
    requirements,
  };
}
