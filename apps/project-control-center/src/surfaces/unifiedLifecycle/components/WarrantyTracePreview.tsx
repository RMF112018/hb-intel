/**
 * Unified Lifecycle preview seam — WarrantyTracePreview.
 *
 * Reusable, presentational, fixture-safe warranty-trace preview.
 * Renders rows with no-blame language: when a row is unresolved or
 * its recommendation is missing, no responsible party is shown and
 * the row carries an explicit "Insufficient evidence — no
 * responsible party assigned" caption. Card BODY content only.
 *
 * Pure: no client, no hooks, no fetch, no router.
 */

import { type FC } from 'react';
import { PccPreviewState } from '../../../ui/PccPreviewState';
import { PccStatusPill, type PccStatusPillTone } from '../../../ui/PccStatusPill';
import type {
  IPccWarrantyTraceRowVm,
  IPccWarrantyTraceViewModel,
} from '../unifiedLifecycleViewModel.js';
import styles from './WarrantyTracePreview.module.css';

function warrantyStatusTone(row: IPccWarrantyTraceRowVm): PccStatusPillTone {
  if (row.isUnresolved) return 'warning';
  if (row.status === 'resolved' || row.status === 'closed') return 'success';
  return 'neutral';
}

export interface IWarrantyTracePreviewProps {
  readonly viewModel: IPccWarrantyTraceViewModel;
}

export const WarrantyTracePreview: FC<IWarrantyTracePreviewProps> = ({ viewModel }) => {
  if (viewModel.sourceStatus !== 'available') {
    return (
      <div data-pcc-warranty-trace="" className={styles.root}>
        <PccPreviewState state={viewModel.cardState} />
      </div>
    );
  }

  const visibleTraces = viewModel.traces.filter((t) => !t.redaction.withheld);
  if (visibleTraces.length === 0) {
    return (
      <div data-pcc-warranty-trace="" className={styles.root}>
        <PccPreviewState state="empty" />
      </div>
    );
  }

  return (
    <div data-pcc-warranty-trace="" className={styles.root}>
      <ul className={styles.rows}>
        {visibleTraces.map((trace) => (
          <WarrantyRow key={trace.warrantyTraceId} trace={trace} />
        ))}
      </ul>
    </div>
  );
};

const WarrantyRow: FC<{ trace: IPccWarrantyTraceRowVm }> = ({ trace }) => {
  const masked = trace.redaction.redacted && !trace.redaction.withheld;
  const showRecommendation = !trace.isUnresolved && trace.recommendation !== undefined;
  return (
    <li className={styles.row} data-pcc-warranty-trace-id={trace.warrantyTraceId}>
      <div className={styles.rowHeader}>
        <PccStatusPill tone={warrantyStatusTone(trace)}>{trace.status}</PccStatusPill>
        {masked ? <PccStatusPill tone="warning">Restricted</PccStatusPill> : null}
        <PccStatusPill tone="neutral">
          {trace.evidenceLinks.length} evidence
        </PccStatusPill>
        <PccStatusPill tone="neutral">
          {trace.traceabilityEdges.length} edges
        </PccStatusPill>
      </div>
      <p className={styles.summary}>
        {masked ? 'Restricted warranty trace — issue summary withheld.' : trace.issueSummary}
      </p>
      {showRecommendation && trace.recommendation ? (
        <p
          className={styles.recommendation}
          data-pcc-warranty-recommendation-state="present"
        >
          <strong>Recommended responsible party:</strong>{' '}
          {trace.recommendation.recommendedResponsibleType}{' '}
          <PccStatusPill tone="info">{trace.recommendation.confidence}</PccStatusPill>
        </p>
      ) : (
        <p
          className={styles.unresolved}
          data-pcc-warranty-recommendation-state="insufficient-evidence"
        >
          Insufficient evidence — no responsible party assigned.
        </p>
      )}
    </li>
  );
};

export default WarrantyTracePreview;
