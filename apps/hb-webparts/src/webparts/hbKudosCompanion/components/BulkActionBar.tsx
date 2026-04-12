/**
 * BulkActionBar — three-phase bulk approval surface (Phase-27
 * Prompt-07). Presents:
 *
 *   - idle     → selection count + Approve selected / Clear,
 *   - running  → selection count + inline progress bar + current
 *                item headline + cumulative succeeded / failed /
 *                skipped tallies so the operator always sees
 *                exactly what is happening,
 *   - summary  → per-tally breakdown, per-failure list with
 *                reasons, Retry failed (only when there is
 *                something to retry), and Dismiss.
 *
 * The bar is driven by `useBulkApproval`'s state machine; it does
 * not own dispatch logic.
 */
import * as React from 'react';
import { clsx } from 'clsx';
import companionStyles from '../companion.module.css';
import type {
  BulkApprovalState,
  BulkItemResult,
} from '../runtime/useBulkApproval.js';

export interface BulkActionBarProps {
  selectionCount: number;
  bulkState: BulkApprovalState;
  onApprove: () => void;
  onClearSelection: () => void;
  onRetryFailed: () => void;
  onDismissSummary: () => void;
  /** Non-bulk detail dispatch in flight; disable controls. */
  dispatchingOtherAction: boolean;
}

export function BulkActionBar({
  selectionCount,
  bulkState,
  onApprove,
  onClearSelection,
  onRetryFailed,
  onDismissSummary,
  dispatchingOtherAction,
}: BulkActionBarProps): React.JSX.Element | null {
  if (bulkState.phase === 'summary') {
    return <BulkSummary state={bulkState} onRetryFailed={onRetryFailed} onDismiss={onDismissSummary} />;
  }

  if (bulkState.phase === 'running') {
    return <BulkRunningBar state={bulkState} />;
  }

  // Idle — only rendered when the operator has selected rows.
  if (selectionCount === 0) return null;

  const disabled = dispatchingOtherAction;
  return (
    <div role="group" aria-label="Bulk actions" className={companionStyles.bulkBar}>
      <span className={companionStyles.bulkCount}>{selectionCount} selected</span>
      <button
        type="button"
        onClick={onApprove}
        disabled={disabled}
        aria-busy={disabled ? 'true' : undefined}
        data-hbc-testid="hb-kudos-bulk-approve"
        className={companionStyles.bulkApproveBtn}
      >
        Approve selected
      </button>
      <button
        type="button"
        onClick={onClearSelection}
        disabled={disabled}
        className={companionStyles.bulkClearBtn}
      >
        Clear
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Running — progress bar + current item + live tallies
// ---------------------------------------------------------------------------

function BulkRunningBar({ state }: { state: BulkApprovalState }): React.JSX.Element {
  const pct = state.total === 0 ? 0 : Math.round((state.completed / state.total) * 100);
  return (
    <div
      role="group"
      aria-label="Bulk approval in progress"
      aria-live="polite"
      data-hbc-testid="hb-kudos-bulk-running"
      className={clsx(companionStyles.bulkBar, companionStyles.bulkBarRunning)}
    >
      <div className={companionStyles.bulkProgress}>
        <div className={companionStyles.bulkProgressMeta}>
          <span>
            Approving{' '}
            <span className={companionStyles.bulkProgressCount}>
              {state.completed} / {state.total}
            </span>
          </span>
          <span>
            {state.succeeded} approved · {state.failed} failed
            {state.skipped > 0 ? ` · ${state.skipped} skipped` : ''}
          </span>
        </div>
        <div
          className={companionStyles.bulkProgressTrack}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={state.total}
          aria-valuenow={state.completed}
        >
          <div
            className={companionStyles.bulkProgressFill}
            style={{ width: `${pct}%` }}
          />
        </div>
        {state.currentHeadline ? (
          <span
            className={companionStyles.bulkProgressCurrent}
            data-hbc-testid="hb-kudos-bulk-current"
          >
            Currently: {state.currentHeadline}
          </span>
        ) : null}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Summary — tallies + per-failure list + retry / dismiss
// ---------------------------------------------------------------------------

function BulkSummary({
  state,
  onRetryFailed,
  onDismiss,
}: {
  state: BulkApprovalState;
  onRetryFailed: () => void;
  onDismiss: () => void;
}): React.JSX.Element {
  const failures = state.results.filter((r) => r.status === 'failed');
  const skipped = state.results.filter((r) => r.status === 'skipped');
  const canRetry = failures.length > 0;

  return (
    <section
      aria-label="Bulk approval summary"
      aria-live="polite"
      data-hbc-testid="hb-kudos-bulk-summary"
      className={companionStyles.bulkSummary}
    >
      <header className={companionStyles.bulkSummaryHeader}>
        <h3 className={companionStyles.bulkSummaryHeading}>Bulk approval summary</h3>
        <div className={companionStyles.bulkSummaryTallies} aria-label="Bulk approval tallies">
          <span className={companionStyles.bulkSummaryTally} data-tone="success">
            {state.succeeded} approved
          </span>
          <span
            className={companionStyles.bulkSummaryTally}
            data-tone={state.failed > 0 ? 'danger' : 'muted'}
          >
            {state.failed} failed
          </span>
          {state.skipped > 0 ? (
            <span className={companionStyles.bulkSummaryTally} data-tone="muted">
              {state.skipped} skipped
            </span>
          ) : null}
        </div>
      </header>

      {state.runError ? (
        <p className={companionStyles.bulkSummaryRunError}>{state.runError}</p>
      ) : null}

      {failures.length > 0 ? (
        <BulkResultList
          heading="Failed"
          items={failures}
          testId="hb-kudos-bulk-summary-failures"
        />
      ) : null}

      {skipped.length > 0 ? (
        <BulkResultList
          heading="Skipped"
          items={skipped}
          testId="hb-kudos-bulk-summary-skipped"
        />
      ) : null}

      <div className={companionStyles.bulkSummaryActions}>
        {canRetry ? (
          <button
            type="button"
            onClick={onRetryFailed}
            className={companionStyles.bulkRetryBtn}
            data-hbc-testid="hb-kudos-bulk-retry-failed"
          >
            Retry {failures.length} failed
          </button>
        ) : null}
        <button
          type="button"
          onClick={onDismiss}
          className={companionStyles.bulkDismissBtn}
          data-hbc-testid="hb-kudos-bulk-summary-dismiss"
        >
          Dismiss
        </button>
      </div>
    </section>
  );
}

function BulkResultList({
  heading,
  items,
  testId,
}: {
  heading: string;
  items: BulkItemResult[];
  testId: string;
}): React.JSX.Element {
  return (
    <div>
      <span className={companionStyles.bulkSummaryTally} data-tone="muted">
        {heading}
      </span>
      <ul className={companionStyles.bulkFailureList} data-hbc-testid={testId}>
        {items.map((r) => (
          <li key={r.id} className={companionStyles.bulkFailureItem}>
            {r.headline}
            {r.reason ? (
              <span className={companionStyles.bulkFailureReason}>— {r.reason}</span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
