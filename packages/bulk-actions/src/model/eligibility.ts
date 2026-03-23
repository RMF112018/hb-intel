/**
 * SF27-T03 — Eligibility evaluation.
 */
import type { IBulkActionItemRef, IBulkEligibilityResult, IBulkActionDefinition } from '../types/index.js';

export type EligibilityEvaluator = (itemRef: IBulkActionItemRef, action: IBulkActionDefinition<unknown>) => IBulkEligibilityResult;

export function evaluateEligibility(
  itemRefs: IBulkActionItemRef[],
  action: IBulkActionDefinition<unknown>,
  evaluator: EligibilityEvaluator,
): IBulkEligibilityResult[] {
  return itemRefs.map(ref => evaluator(ref, action));
}

export function filterEligible(results: IBulkEligibilityResult[]): { eligible: IBulkEligibilityResult[]; ineligible: IBulkEligibilityResult[] } {
  const eligible = results.filter(r => r.eligible);
  const ineligible = results.filter(r => !r.eligible);
  return { eligible, ineligible };
}
