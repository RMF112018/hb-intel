/**
 * Pure workflow state machine for Article Publisher articles.
 *
 * Uses the tenant `HB Articles.WorkflowState` Choice values directly.
 * Permitted transitions (v1):
 *   draft      → review | archived | withdrawn
 *   review     → approved | draft | withdrawn
 *   approved   → scheduled | draft | withdrawn
 *   scheduled  → approved | withdrawn
 *   published  → archived | withdrawn
 *   archived   → withdrawn
 *   withdrawn  → (terminal)
 *
 * `published` is intentionally NOT reachable from any manual transition.
 * The publish orchestrator is the single producer of
 * `WorkflowState='published'`; it runs page creation, page publish, and
 * binding closure before stamping the state. Any generic UI or state-
 * machine path that appears to promote an article directly to
 * `published` is a bypass and must be rejected here.
 */

import type { WorkflowState } from './publisherEnums';

const TRANSITIONS: Readonly<Record<WorkflowState, readonly WorkflowState[]>> = {
  draft: ['review', 'archived', 'withdrawn'],
  review: ['approved', 'draft', 'withdrawn'],
  approved: ['scheduled', 'draft', 'withdrawn'],
  scheduled: ['approved', 'withdrawn'],
  published: ['archived', 'withdrawn'],
  archived: ['withdrawn'],
  withdrawn: [],
};

export function canTransition(from: WorkflowState, to: WorkflowState): boolean {
  return TRANSITIONS[from].includes(to);
}

export function validTransitionsFrom(
  from: WorkflowState,
): readonly WorkflowState[] {
  return TRANSITIONS[from];
}
