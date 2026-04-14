/**
 * Pure workflow state machine for Article Publisher articles.
 *
 * Uses the tenant `HB Articles.WorkflowState` Choice values directly.
 * Permitted transitions (v1):
 *   draft      → review | archived | withdrawn
 *   review     → approved | draft | withdrawn
 *   approved   → scheduled | published | draft | withdrawn
 *   scheduled  → published | approved | withdrawn
 *   published  → archived | withdrawn
 *   archived   → withdrawn
 *   withdrawn  → (terminal)
 */

import type { WorkflowState } from './publisherEnums';

const TRANSITIONS: Readonly<Record<WorkflowState, readonly WorkflowState[]>> = {
  draft: ['review', 'archived', 'withdrawn'],
  review: ['approved', 'draft', 'withdrawn'],
  approved: ['scheduled', 'published', 'draft', 'withdrawn'],
  scheduled: ['published', 'approved', 'withdrawn'],
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
