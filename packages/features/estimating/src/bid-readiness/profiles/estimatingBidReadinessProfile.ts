/**
 * SF18-T03 default Estimating Bid Readiness profile.
 *
 * Defines the canonical six baseline criteria and threshold bands that configure
 * readiness evaluation without introducing a separate scoring engine runtime.
 *
 * Depends on:
 * - SF18-T01 package scaffold
 * - SF18-T02 contract/constants layer
 *
 * @design D-SF18-T03, L-01, L-02
 */
import {
  READINESS_PROFILE_IDENTIFIERS,
} from '../../constants/index.js';
import type {
  IEstimatingBidReadinessProfile,
  IHealthIndicatorCriterion,
} from '../../types/index.js';

function createDefaultCriterion(params: {
  criterionId: string;
  label: string;
  weight: number;
  isBlocker: boolean;
  actionHref: string;
}): IHealthIndicatorCriterion {
  return {
    criterionId: params.criterionId,
    label: params.label,
    weight: params.weight,
    isBlocker: params.isBlocker,
    isComplete: false,
    actionHref: params.actionHref,
    assignee: null,
    completeness: {
      requiredCount: 1,
      completedCount: 0,
      missingCount: 1,
      completionPercent: 0,
    },
  };
}

/**
 * Baseline profile for Estimating bid readiness.
 *
 * Criteria and weights mirror SF18 canonical defaults:
 * - cost sections (30)
 * - bid bond (15)
 * - addenda (15)
 * - subcontractor coverage (20)
 * - bid documents (10)
 * - CE sign-off (10)
 *
 * @design D-SF18-T03, L-01, L-02
 */
export const estimatingBidReadinessProfile: IEstimatingBidReadinessProfile = {
  profileId: READINESS_PROFILE_IDENTIFIERS[0],
  criteria: [
    createDefaultCriterion({
      criterionId: 'cost-sections-populated',
      label: 'Cost sections populated',
      weight: 30,
      isBlocker: true,
      actionHref: '/estimating/cost-sections',
    }),
    createDefaultCriterion({
      criterionId: 'bid-bond-confirmed',
      label: 'Bid bond confirmed',
      weight: 15,
      isBlocker: true,
      actionHref: '/estimating/bond',
    }),
    createDefaultCriterion({
      criterionId: 'addenda-acknowledged',
      label: 'Addenda acknowledged',
      weight: 15,
      isBlocker: true,
      actionHref: '/estimating/addenda',
    }),
    createDefaultCriterion({
      criterionId: 'subcontractor-coverage',
      label: 'Subcontractor coverage',
      weight: 20,
      isBlocker: false,
      actionHref: '/estimating/coverage',
    }),
    createDefaultCriterion({
      criterionId: 'bid-documents-attached',
      label: 'Bid documents attached',
      weight: 10,
      isBlocker: false,
      actionHref: '/estimating/documents',
    }),
    createDefaultCriterion({
      criterionId: 'ce-sign-off',
      label: 'CE sign-off',
      weight: 10,
      isBlocker: true,
      actionHref: '/estimating/signoff',
    }),
  ],
  thresholds: {
    readyMinScore: 90,
    nearlyReadyMinScore: 70,
    attentionNeededMinScore: 50,
  },
};
