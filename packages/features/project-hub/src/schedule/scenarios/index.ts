import type {
  IScenarioActivityRecord,
  IScenarioBranch,
  IScenarioPromotionValidation,
  ScenarioPromotionDisposition,
  ScenarioStatus,
} from '../types/index.js';

/**
 * P3-E5-T04 scenario branch domain logic.
 * Pure, deterministic, no external dependencies beyond types.
 */

// ── Scenario Status State Machine ────────────────────────────────────

/** Valid scenario lifecycle actions. */
export type ScenarioAction =
  | 'submitForReview'
  | 'approve'
  | 'reject'
  | 'promoteToCommitment'
  | 'promoteToPublication'
  | 'archive';

/**
 * Transition scenario status per §5.1 lifecycle.
 * Throws on invalid transitions.
 */
export const transitionScenarioStatus = (
  current: ScenarioStatus,
  action: ScenarioAction,
): ScenarioStatus => {
  switch (current) {
    case 'Draft':
      if (action === 'submitForReview') return 'UnderReview';
      if (action === 'archive') return 'Archived';
      break;
    case 'UnderReview':
      if (action === 'approve') return 'Approved';
      if (action === 'reject') return 'Rejected';
      break;
    case 'Approved':
      if (action === 'promoteToCommitment') return 'PromotedToCommitment';
      if (action === 'promoteToPublication') return 'PromotedToPublication';
      if (action === 'archive') return 'Archived';
      break;
    case 'Rejected':
      if (action === 'archive') return 'Archived';
      break;
    case 'PromotedToCommitment':
    case 'PromotedToPublication':
      if (action === 'archive') return 'Archived';
      break;
    case 'Archived':
      break;
  }

  throw new Error(
    `Invalid scenario transition: cannot '${action}' from '${current}'.`,
  );
};

// ── Scenario Promotion Validation (§5.4) ─────────────────────────────

/**
 * Validate whether a scenario can be promoted to the given disposition.
 * §5.4 rules: must be Approved; PromoteToCommitment requires activity overrides;
 * PromoteToBaseline requires PE approval.
 */
export const validateScenarioPromotion = (
  scenario: IScenarioBranch,
  disposition: ScenarioPromotionDisposition,
  activityOverrides: ReadonlyArray<IScenarioActivityRecord>,
  peApproverId?: string | null,
): IScenarioPromotionValidation => {
  const blockers: string[] = [];

  if (disposition === 'None') {
    return { canPromote: false, blockers: ['No promotion disposition specified.'] };
  }

  if (scenario.status !== 'Approved') {
    blockers.push(
      `Scenario must be in 'Approved' status to promote; current status is '${scenario.status}'.`,
    );
  }

  if (disposition === 'PromoteToCommitment') {
    const overrideCount = countActivityOverrides(activityOverrides);
    if (overrideCount === 0) {
      blockers.push(
        'PromoteToCommitment requires at least one activity with date or float overrides.',
      );
    }
  }

  if (disposition === 'PromoteToBaseline') {
    if (!peApproverId) {
      blockers.push('PromoteToBaseline requires PE approval (peApproverId must be provided).');
    }
  }

  return {
    canPromote: blockers.length === 0,
    blockers,
  };
};

// ── Effective Activity Date Resolution (§5.2) ────────────────────────

/**
 * Get the effective date for an activity in a scenario context.
 * Returns scenario override if set; else falls back to source snapshot value.
 */
export const getEffectiveActivityDate = (
  scenarioOverride: IScenarioActivityRecord | null,
  sourceDate: string,
  field: 'start' | 'finish',
): string => {
  if (!scenarioOverride) {
    return sourceDate;
  }

  const overrideDate =
    field === 'start'
      ? scenarioOverride.scenarioStartDate
      : scenarioOverride.scenarioFinishDate;

  return overrideDate ?? sourceDate;
};

// ── Activity Override Counter ────────────────────────────────────────

/**
 * Count activities with at least one non-null override (date or float).
 */
export const countActivityOverrides = (
  activities: ReadonlyArray<IScenarioActivityRecord>,
): number => {
  return activities.filter(
    (a) =>
      a.scenarioStartDate !== null ||
      a.scenarioFinishDate !== null ||
      a.scenarioFloatHrs !== null,
  ).length;
};
