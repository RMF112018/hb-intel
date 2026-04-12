/**
 * useBulkApproval — dedicated bulk-approval state machine for the HB
 * Kudos Approval Companion.
 *
 * Phase-27 Prompt-07 hardening: the previous inline loop inside
 * `useCompanionActions` set a single `dispatching` boolean and
 * collapsed every outcome into an "N of M failed" string. This hook
 * replaces that with:
 *
 *   - per-item result tracking (succeeded / failed / skipped),
 *   - live progress during execution (total / completed / current
 *     item name so the operator always sees what's happening now),
 *   - an explicit summary phase surfaced after completion with
 *     per-failure reasons and a "Retry failed" path,
 *   - one authoritative execution function invoked by both the
 *     initial run and the retry path — no duplicated dispatch code.
 *
 * Typed `KudosPatch` contracts, audit-write side effects, and caller-
 * role authorization are unchanged; only the reporting + progress
 * surface has been hardened.
 */
import * as React from 'react';
import { submitKudosGovernanceAction } from '../../../homepage/data/kudosGovernanceWriter.js';
import { getKudosListHostUrl } from '../../../homepage/data/spContext.js';
import type {
  KudosCapabilities,
  KudosRole,
} from '../../../homepage/helpers/kudosCapabilities.js';
import type { KudosEntry } from '../../../homepage/webparts/kudosContracts.js';

export interface BulkItemResult {
  id: string;
  headline: string;
  status: 'succeeded' | 'failed' | 'skipped';
  /** Reason text when `status === 'failed'` or `'skipped'`. */
  reason?: string;
}

export type BulkApprovalPhase = 'idle' | 'running' | 'summary';

export interface BulkApprovalState {
  phase: BulkApprovalPhase;
  /** Items selected for this run (captured when the run started). */
  total: number;
  /** Items processed so far (succeeded + failed + skipped). */
  completed: number;
  succeeded: number;
  failed: number;
  skipped: number;
  /** The id of the item currently being processed (running only). */
  currentEntryId?: string;
  /** Display name of the item currently being processed. */
  currentHeadline?: string;
  /** Per-item outcomes; populated as each item resolves. */
  results: BulkItemResult[];
  /** Top-level host/context error that aborted the run, if any. */
  runError?: string;
}

const IDLE: BulkApprovalState = {
  phase: 'idle',
  total: 0,
  completed: 0,
  succeeded: 0,
  failed: 0,
  skipped: 0,
  results: [],
};

type Action =
  | { type: 'start'; total: number }
  | { type: 'progress'; entry: KudosEntry }
  | { type: 'itemResult'; result: BulkItemResult }
  | { type: 'finish' }
  | { type: 'abort'; reason: string }
  | { type: 'dismiss' };

function reducer(state: BulkApprovalState, action: Action): BulkApprovalState {
  switch (action.type) {
    case 'start':
      return {
        phase: 'running',
        total: action.total,
        completed: 0,
        succeeded: 0,
        failed: 0,
        skipped: 0,
        results: [],
      };
    case 'progress':
      return {
        ...state,
        currentEntryId: action.entry.id,
        currentHeadline: action.entry.headline,
      };
    case 'itemResult': {
      const results = [...state.results, action.result];
      return {
        ...state,
        completed: state.completed + 1,
        succeeded: state.succeeded + (action.result.status === 'succeeded' ? 1 : 0),
        failed: state.failed + (action.result.status === 'failed' ? 1 : 0),
        skipped: state.skipped + (action.result.status === 'skipped' ? 1 : 0),
        results,
      };
    }
    case 'finish':
      return {
        ...state,
        phase: 'summary',
        currentEntryId: undefined,
        currentHeadline: undefined,
      };
    case 'abort':
      return {
        ...state,
        phase: 'summary',
        currentEntryId: undefined,
        currentHeadline: undefined,
        runError: action.reason,
      };
    case 'dismiss':
      return IDLE;
    default:
      return state;
  }
}

export interface UseBulkApprovalInput {
  queue: KudosEntry[];
  identityEmail: string | undefined;
  role: KudosRole;
  capabilities: KudosCapabilities;
  refreshData: () => void;
  /** Called after a run completes so the host can clear selection. */
  onRunFinished?: () => void;
}

export interface UseBulkApprovalResult {
  bulkState: BulkApprovalState;
  /** Kick off a bulk approval over the provided selected ids. */
  runBulkApproval: (ids: Iterable<string>) => Promise<void>;
  /** Re-run only the items that failed in the most recent summary. */
  retryFailed: () => Promise<void>;
  /** Dismiss the summary panel and return to idle. */
  dismissSummary: () => void;
  /** Convenience boolean for call sites that just need "is running". */
  isRunning: boolean;
}

export function useBulkApproval({
  queue,
  identityEmail,
  role,
  capabilities,
  refreshData,
  onRunFinished,
}: UseBulkApprovalInput): UseBulkApprovalResult {
  const [bulkState, dispatch] = React.useReducer(reducer, IDLE);

  // Keep `queue` reachable from the stable `run` callback without
  // re-creating the callback on every queue update.
  const queueRef = React.useRef(queue);
  React.useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  const run = React.useCallback(
    async (ids: Iterable<string>) => {
      if (!capabilities.canBulkApprove) return;

      const idList = Array.from(new Set(ids));
      if (idList.length === 0) return;

      const listHostUrl = getKudosListHostUrl();
      if (!listHostUrl) {
        dispatch({ type: 'start', total: idList.length });
        dispatch({ type: 'abort', reason: 'SharePoint site context is not available.' });
        return;
      }

      dispatch({ type: 'start', total: idList.length });

      for (const id of idList) {
        const entry = queueRef.current.find((e) => e.id === id);
        if (!entry) {
          dispatch({
            type: 'itemResult',
            result: {
              id,
              headline: id,
              status: 'skipped',
              reason: 'Item dropped out of the current queue.',
            },
          });
          continue;
        }
        if (
          entry.workflowStatus &&
          entry.workflowStatus !== 'pending' &&
          entry.workflowStatus !== 'revisionRequested'
        ) {
          dispatch({
            type: 'itemResult',
            result: {
              id: entry.id,
              headline: entry.headline,
              status: 'skipped',
              reason: `Status "${entry.workflowStatus}" is not approvable in bulk.`,
            },
          });
          continue;
        }

        dispatch({ type: 'progress', entry });

        try {
          const result = await submitKudosGovernanceAction(
            listHostUrl,
            { kind: 'approve', kudosId: entry.id },
            {
              actorEmail: identityEmail,
              callerRole: role,
              headline: entry.headline,
              isFirstPublish: entry.wasEverPublished !== true,
            },
          );
          if (result.ok) {
            dispatch({
              type: 'itemResult',
              result: { id: entry.id, headline: entry.headline, status: 'succeeded' },
            });
          } else {
            dispatch({
              type: 'itemResult',
              result: {
                id: entry.id,
                headline: entry.headline,
                status: 'failed',
                reason: result.error,
              },
            });
          }
        } catch (err) {
          dispatch({
            type: 'itemResult',
            result: {
              id: entry.id,
              headline: entry.headline,
              status: 'failed',
              reason: err instanceof Error ? err.message : 'Dispatch threw.',
            },
          });
        }
      }

      dispatch({ type: 'finish' });
      refreshData();
      onRunFinished?.();
    },
    [capabilities.canBulkApprove, identityEmail, role, refreshData, onRunFinished],
  );

  // Snapshot the last run's failed ids so the retry path does not
  // depend on the reducer state shape surviving future refactors.
  const lastFailedRef = React.useRef<string[]>([]);
  React.useEffect(() => {
    if (bulkState.phase === 'summary') {
      lastFailedRef.current = bulkState.results
        .filter((r) => r.status === 'failed')
        .map((r) => r.id);
    }
  }, [bulkState.phase, bulkState.results]);

  const retryFailed = React.useCallback(async () => {
    if (lastFailedRef.current.length === 0) return;
    await run(lastFailedRef.current);
  }, [run]);

  const dismissSummary = React.useCallback(() => {
    dispatch({ type: 'dismiss' });
  }, []);

  return {
    bulkState,
    runBulkApproval: run,
    retryFailed,
    dismissSummary,
    isRunning: bulkState.phase === 'running',
  };
}
