/**
 * PriorityPulseStrip — companion workspace priority-signal band.
 *
 * Phase-28 Prompt-02 structural redesign. Introduced so the moderation
 * workspace advertises its workload at a glance instead of hiding all
 * priority signal inside the queue rows. The strip renders between the
 * workspace header and the sticky control zone so the operator sees
 * "what actually needs attention right now" before scanning the
 * queue itself.
 *
 * Signals (in priority order):
 *   - overdue: how many queue items have exceeded the pending SLA.
 *   - approaching: how many are close to overdue.
 *   - flagged: how many carry `isFlaggedForAdminReview === true`.
 *   - pending: total count of the pending tab (the default moderation
 *     scope).
 *
 * Each pulse chip is clickable and scopes the queue to its signal.
 * When there are no actionable signals, the strip collapses to an
 * intentional "all clear" state so the operator can see the workspace
 * is healthy, not merely empty.
 */
import * as React from 'react';
import { clsx } from 'clsx';
import companionStyles from '../companion.module.css';

export type PulseSignalId = 'overdue' | 'approaching' | 'flagged' | 'pending';

export interface PulseSignal {
  id: PulseSignalId;
  label: string;
  count: number;
  tone: 'danger' | 'warning' | 'info' | 'neutral';
  /** Apply the companion filter for this pulse. */
  onScope: () => void;
  active?: boolean;
}

export interface PriorityPulseStripProps {
  signals: PulseSignal[];
  totalPending: number;
}

export function PriorityPulseStrip({
  signals,
  totalPending,
}: PriorityPulseStripProps): React.JSX.Element {
  const actionable = signals.filter(
    (s) => s.count > 0 && (s.id === 'overdue' || s.id === 'approaching' || s.id === 'flagged'),
  );

  return (
    <div
      className={companionStyles.pulseStrip}
      role="group"
      aria-label="Queue priority signals"
      data-hbc-testid="hb-kudos-pulse-strip"
    >
      <span className={companionStyles.pulseStripLabel}>Workload</span>
      {actionable.length === 0 ? (
        <span
          className={companionStyles.pulseAllClear}
          data-hbc-testid="hb-kudos-pulse-all-clear"
        >
          <span className={companionStyles.pulseAllClearDot} aria-hidden="true" />
          All clear · {totalPending} pending
        </span>
      ) : (
        signals.map((signal) => (
          <PulseChip key={signal.id} signal={signal} />
        ))
      )}
    </div>
  );
}

function PulseChip({ signal }: { signal: PulseSignal }): React.JSX.Element | null {
  if (signal.count === 0 && signal.id !== 'pending') return null;
  return (
    <button
      type="button"
      className={clsx(
        companionStyles.pulseChip,
        signal.active && companionStyles.pulseChipActive,
      )}
      data-pulse-tone={signal.tone}
      data-hbc-testid={`hb-kudos-pulse-${signal.id}`}
      onClick={signal.onScope}
    >
      <span className={companionStyles.pulseChipCount}>{signal.count}</span>
      <span className={companionStyles.pulseChipLabel}>{signal.label}</span>
    </button>
  );
}
