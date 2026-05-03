/**
 * Unified Lifecycle preview seam — LifecycleTimelinePreview.
 *
 * Reusable, presentational, fixture-safe preview of a project's
 * lifecycle timeline (events + checkpoints + gate signals) for
 * dashboard-style embedding inside a future PccDashboardCard. Renders
 * card BODY content only — no card chrome, no bento wrapping.
 *
 * Pure: no client, no hooks, no fetch, no router, no useState/useEffect.
 * Renders directly from `IPccLifecycleTimelineViewModel` produced by
 * Prompt 04B's `buildPccLifecycleTimelineViewModel` adapter. Withheld
 * records are omitted entirely so callers cannot infer their existence;
 * masked records render a non-sensitive summary plus a Restricted pill.
 */

import { Fragment, type FC } from 'react';
import { PccPreviewState } from '../../../ui/PccPreviewState';
import { PccStatusPill, type PccStatusPillTone } from '../../../ui/PccStatusPill';
import type {
  IPccCheckpointVm,
  IPccGateSignalVm,
  IPccLifecycleEventVm,
  IPccLifecycleTimelineViewModel,
} from '../unifiedLifecycleViewModel.js';
import styles from './LifecycleTimelinePreview.module.css';

const COMPLETED_EVENT_STATUSES = new Set([
  'completed',
  'closed',
  'verified',
  'accepted',
]);
const ACTIVE_EVENT_STATUSES = new Set([
  'in-progress',
  'active',
  'scheduled',
  'recorded',
]);
const RISK_EVENT_STATUSES = new Set([
  'blocked',
  'at-risk',
  'rejected',
  'failed',
]);

function eventStatusTone(status: string): PccStatusPillTone {
  if (COMPLETED_EVENT_STATUSES.has(status)) return 'success';
  if (RISK_EVENT_STATUSES.has(status)) return 'danger';
  if (ACTIVE_EVENT_STATUSES.has(status)) return 'info';
  return 'neutral';
}

function gateStatusTone(status: string): PccStatusPillTone {
  if (status === 'green' || status === 'pass' || status === 'cleared') return 'success';
  if (status === 'red' || status === 'fail' || status === 'blocked') return 'danger';
  if (status === 'amber' || status === 'at-risk' || status === 'caution') return 'warning';
  return 'neutral';
}

export interface ILifecycleTimelinePreviewProps {
  readonly viewModel: IPccLifecycleTimelineViewModel;
}

export const LifecycleTimelinePreview: FC<ILifecycleTimelinePreviewProps> = ({
  viewModel,
}) => {
  if (viewModel.sourceStatus !== 'available') {
    return (
      <div data-pcc-lifecycle-timeline="" className={styles.root}>
        <PccPreviewState state={viewModel.cardState} />
      </div>
    );
  }

  const visibleEvents = viewModel.events.filter((e) => !e.redaction.withheld);
  if (
    visibleEvents.length === 0 &&
    viewModel.checkpoints.length === 0 &&
    viewModel.gateSignals.length === 0
  ) {
    return (
      <div data-pcc-lifecycle-timeline="" className={styles.root}>
        <PccPreviewState state="empty" />
      </div>
    );
  }

  return (
    <div data-pcc-lifecycle-timeline="" className={styles.root}>
      {visibleEvents.length > 0 ? (
        <ol className={styles.events}>
          {visibleEvents.map((event) => (
            <LifecycleEventRow key={event.eventId} event={event} />
          ))}
        </ol>
      ) : null}

      {viewModel.checkpoints.length > 0 ? (
        <section
          className={styles.section}
          data-pcc-lifecycle-checkpoints=""
          aria-label="Checkpoints"
        >
          <p className={styles.sectionTitle}>Checkpoints</p>
          <ul className={styles.chipRow}>
            {viewModel.checkpoints.map((cp) => (
              <CheckpointChip key={cp.checkpointId} checkpoint={cp} />
            ))}
          </ul>
        </section>
      ) : null}

      {viewModel.gateSignals.length > 0 ? (
        <section
          className={styles.section}
          data-pcc-lifecycle-gate-signals=""
          aria-label="Gate signals"
        >
          <p className={styles.sectionTitle}>Gate signals</p>
          <ul className={styles.chipRow}>
            {viewModel.gateSignals.map((g) => (
              <GateSignalChip key={g.signalId} signal={g} />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
};

const LifecycleEventRow: FC<{ event: IPccLifecycleEventVm }> = ({ event }) => {
  const masked = event.redaction.redacted && !event.redaction.withheld;
  return (
    <li className={styles.event} data-pcc-lifecycle-event-id={event.eventId}>
      <div className={styles.eventHeader}>
        <PccStatusPill tone={eventStatusTone(event.status)}>{event.status}</PccStatusPill>
        <span className={styles.eventStage}>{event.lifecycleStage}</span>
        {masked ? (
          <PccStatusPill tone="warning">Restricted</PccStatusPill>
        ) : event.sourceLineage ? (
          <PccStatusPill tone="info">{event.sourceLineage.sourceSystem}</PccStatusPill>
        ) : null}
      </div>
      <p className={styles.eventSummary}>
        {masked ? 'Restricted lifecycle entry — summary withheld.' : event.summary}
      </p>
      <p className={styles.eventMeta}>
        <time dateTime={event.recordedAtUtc}>{event.recordedAtUtc}</time>
        <Fragment> · </Fragment>
        <span>{event.eventType}</span>
      </p>
    </li>
  );
};

const CheckpointChip: FC<{ checkpoint: IPccCheckpointVm }> = ({ checkpoint }) => (
  <li
    className={styles.chip}
    data-pcc-lifecycle-checkpoint-id={checkpoint.checkpointId}
  >
    <PccStatusPill tone={eventStatusTone(checkpoint.status)}>
      {checkpoint.status}
    </PccStatusPill>
    <span className={styles.chipLabel}>{checkpoint.lifecycleStage}</span>
  </li>
);

const GateSignalChip: FC<{ signal: IPccGateSignalVm }> = ({ signal }) => (
  <li className={styles.chip} data-pcc-lifecycle-gate-signal-id={signal.signalId}>
    <PccStatusPill tone={gateStatusTone(signal.status)}>{signal.status}</PccStatusPill>
    <span className={styles.chipLabel}>{signal.gateId}</span>
  </li>
);

export default LifecycleTimelinePreview;
