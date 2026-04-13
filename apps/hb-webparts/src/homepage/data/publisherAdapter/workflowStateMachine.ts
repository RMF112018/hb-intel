/**
 * Pure workflow state machine for Project Spotlight publisher posts.
 *
 * Authority: architecture doc 09 (Editorial Workflow and Lifecycle).
 * Permitted transitions (v1):
 *   draft      → inReview | archived | withdrawn
 *   inReview   → approved | draft | withdrawn
 *   approved   → scheduled | published | draft | withdrawn
 *   scheduled  → published | approved | withdrawn
 *   published  → archived | withdrawn
 *   archived   → withdrawn
 *   withdrawn  → (terminal)
 */

import type { WorkflowState, WorkflowHistoryAction } from './publisherEnums';

const TRANSITIONS: Readonly<Record<WorkflowState, readonly WorkflowState[]>> = {
  draft: ['inReview', 'archived', 'withdrawn'],
  inReview: ['approved', 'draft', 'withdrawn'],
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

export function historyActionFor(
  from: WorkflowState,
  to: WorkflowState,
): WorkflowHistoryAction {
  if (to === 'published') return 'publish';
  if (to === 'archived') return 'archive';
  if (to === 'withdrawn') return 'withdraw';
  if (from === 'scheduled' && to === 'approved') return 'approvalDecision';
  if (from === 'inReview' && to === 'approved') return 'approvalDecision';
  return 'transition';
}
