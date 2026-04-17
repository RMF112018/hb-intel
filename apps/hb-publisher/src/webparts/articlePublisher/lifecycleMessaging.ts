/**
 * Author-confident lifecycle messaging. Workstream-f step-04.
 *
 * The Publisher lifecycle (publish / republish / archive / withdraw
 * / transition) previously narrated its status line in operator
 * voice ("republish ok — action=inPlaceUpdate, reason=shellMatch,
 * state=published"). Operators have the Step-03 technical-details
 * drawer for that level of detail; the status line now reads as a
 * confident editorial assistant: short, specific, and human.
 *
 * Pure string builders so the copy is test-able and reusable.
 */

import type { WorkflowState } from '../../data/publisherAdapter/index.js';

export type PublishMode = 'create' | 'republish' | 'preview';

export type OrchestratorAction =
  | 'create'
  | 'inPlaceUpdate'
  | 'regenerate'
  | 'noOp'
  | 'blocked';

/** Inline progress copy stamped onto `status` while a run is in flight. */
export function inProgressMessage(mode: PublishMode): string {
  switch (mode) {
    case 'create':
      return 'Publishing the article…';
    case 'republish':
      return 'Republishing the article…';
    case 'preview':
      return 'Composing a preview…';
  }
}

/** Success copy after `orchestrator.run` returns `ok: true`. */
export function publishSuccessMessage(args: {
  readonly mode: PublishMode;
  readonly action: OrchestratorAction;
  readonly pageUrl?: string;
}): string {
  const { mode, action, pageUrl } = args;
  const tail = pageUrl ? ` View it at ${pageUrl}` : '';
  if (mode === 'preview') {
    return 'Preview is up to date.';
  }
  switch (action) {
    case 'create':
      return `Published. A new page is live.${tail}`;
    case 'inPlaceUpdate':
      return `Republished. The existing page is updated in place.${tail}`;
    case 'regenerate':
      return `Republished. A fresh page replaces the previous binding.${tail}`;
    case 'noOp':
      return `Nothing changed — the live page already matches the draft.${tail}`;
    case 'blocked':
      return 'Publish is blocked by validation. Resolve the blocking issues and try again.';
  }
}

/** Failure copy after `orchestrator.run` returns `ok: false`. */
export function publishFailureMessage(args: {
  readonly mode: PublishMode;
  readonly stage: string;
  readonly message: string;
}): string {
  const { mode, stage, message } = args;
  const verb = mode === 'create' ? 'Publish' : mode === 'republish' ? 'Republish' : 'Preview';
  return `${verb} didn't complete — ${stage}: ${message}`;
}

/** Inline progress copy for state-machine transitions. */
export function transitionInProgressMessage(to: WorkflowState): string {
  switch (to) {
    case 'archived':
      return 'Archiving the article…';
    case 'withdrawn':
      return 'Withdrawing the article…';
    case 'published':
      return 'Marking as published…';
    case 'approved':
      return 'Marking as approved…';
    case 'review':
      return 'Sending for review…';
    case 'draft':
      return 'Returning to draft…';
    case 'scheduled':
      return 'Marking as scheduled…';
    default:
      return `Moving to ${to}…`;
  }
}

/** Success copy for archive / withdraw outcomes. */
export function lifecycleOutcomeMessage(args: {
  readonly to: WorkflowState;
  readonly bindingUpdated: boolean;
}): string {
  const { to, bindingUpdated } = args;
  const bindingNote = bindingUpdated
    ? 'The live page has been taken down.'
    : 'No live page was bound.';
  if (to === 'archived') {
    return `Archived. ${bindingNote}`;
  }
  if (to === 'withdrawn') {
    return `Withdrawn. ${bindingNote}`;
  }
  return `Now in ${to}.`;
}

/** Failure copy for lifecycle transitions. */
export function lifecycleFailureMessage(args: {
  readonly to: WorkflowState;
  readonly stage: string;
  readonly message: string;
}): string {
  const { to, stage, message } = args;
  const verb =
    to === 'archived'
      ? 'Archive'
      : to === 'withdrawn'
        ? 'Withdraw'
        : `Transition to ${to}`;
  return `${verb} didn't complete — ${stage}: ${message}`;
}

/** Gentle refusal when a transition isn't allowed by the state machine. */
export function illegalTransitionMessage(
  from: WorkflowState,
  to: WorkflowState,
): string {
  return `Can't move ${from} articles to ${to} directly.`;
}

/**
 * Copy for the Publish button disabled tooltip.
 * Consolidates: draft unloaded, destination unsupported, binding /
 * validation block, dirty working copy, busy state.
 *
 * `dirty` is surfaced ahead of `busy` because publish / republish
 * resolve from saved repository state by ArticleId — shipping while
 * the in-memory working copy has drifted would publish stale saved
 * content, not the visible canvas. Authors must save first.
 */
export function publishDisabledReason(args: {
  readonly hasDraft: boolean;
  readonly destinationSupported: boolean;
  readonly validationBlocked: boolean;
  readonly busy: boolean;
  readonly dirty?: boolean;
}): string | undefined {
  if (!args.hasDraft) return 'Pick a draft first.';
  if (!args.destinationSupported) {
    return 'This destination isn\u2019t wired for publishing yet.';
  }
  if (args.validationBlocked) {
    return 'Resolve the blocking issues above before publishing.';
  }
  if (args.dirty) {
    return 'Save your edits first — publish ships the saved draft, not the in-memory working copy.';
  }
  if (args.busy) return 'A run is already in flight.';
  return undefined;
}
