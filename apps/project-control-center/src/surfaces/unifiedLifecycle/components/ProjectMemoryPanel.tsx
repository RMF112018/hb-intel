/**
 * Unified Lifecycle preview seam — ProjectMemoryPanel.
 *
 * Reusable, presentational, fixture-safe project-memory panel
 * (decisions, assumptions, notes). Renders card BODY content only —
 * the consumer wraps in a PccDashboardCard.
 *
 * Pure: no client, no hooks, no fetch, no router. Withheld records
 * are omitted entirely; masked records render summary plus a
 * Restricted pill — never the underlying decision/assumption text.
 */

import { type FC } from 'react';
import { PccPreviewState } from '../../../ui/PccPreviewState';
import { PccStatusPill, type PccStatusPillTone } from '../../../ui/PccStatusPill';
import type {
  IPccAssumptionVm,
  IPccDecisionVm,
  IPccMemoryNoteVm,
  IPccMemoryRecordVm,
  IPccProjectMemoryViewModel,
} from '../unifiedLifecycleViewModel.js';
import styles from './ProjectMemoryPanel.module.css';

const VALIDATED = new Set(['validated', 'confirmed']);
const RISK = new Set(['invalidated', 'rejected']);
const NEUTRAL_NOT_OPEN = new Set(['superseded', 'converted-to-action', 'archived']);

function memoryStatusTone(status: string): PccStatusPillTone {
  if (VALIDATED.has(status)) return 'success';
  if (RISK.has(status)) return 'danger';
  if (NEUTRAL_NOT_OPEN.has(status)) return 'neutral';
  return 'info';
}

export interface IProjectMemoryPanelProps {
  readonly viewModel: IPccProjectMemoryViewModel;
}

export const ProjectMemoryPanel: FC<IProjectMemoryPanelProps> = ({ viewModel }) => {
  if (viewModel.sourceStatus !== 'available') {
    return (
      <div data-pcc-project-memory="" className={styles.root}>
        <PccPreviewState state={viewModel.cardState} />
      </div>
    );
  }

  const visibleDecisions = viewModel.decisions.filter((d) => !d.redaction.withheld);
  const visibleAssumptions = viewModel.assumptions.filter((a) => !a.redaction.withheld);
  const visibleNotes = viewModel.records.filter(
    (r): r is IPccMemoryNoteVm =>
      r.recordType !== 'decision' && r.recordType !== 'assumption' && !r.redaction.withheld,
  );

  if (
    visibleDecisions.length === 0 &&
    visibleAssumptions.length === 0 &&
    visibleNotes.length === 0
  ) {
    return (
      <div data-pcc-project-memory="" className={styles.root}>
        <PccPreviewState state="empty" />
      </div>
    );
  }

  return (
    <div data-pcc-project-memory="" className={styles.root}>
      {visibleDecisions.length > 0 ? (
        <section className={styles.section} data-pcc-project-memory-decisions="">
          <p className={styles.sectionTitle}>Decisions</p>
          <ul className={styles.records}>
            {visibleDecisions.map((record) => (
              <MemoryRow key={record.memoryId} record={record} />
            ))}
          </ul>
        </section>
      ) : null}
      {visibleAssumptions.length > 0 ? (
        <section className={styles.section} data-pcc-project-memory-assumptions="">
          <p className={styles.sectionTitle}>Assumptions</p>
          <ul className={styles.records}>
            {visibleAssumptions.map((record) => (
              <MemoryRow key={record.memoryId} record={record} />
            ))}
          </ul>
        </section>
      ) : null}
      {visibleNotes.length > 0 ? (
        <section className={styles.section} data-pcc-project-memory-notes="">
          <p className={styles.sectionTitle}>Notes</p>
          <ul className={styles.records}>
            {visibleNotes.map((record) => (
              <MemoryRow key={record.memoryId} record={record} />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
};

const MemoryRow: FC<{ record: IPccMemoryRecordVm }> = ({ record }) => {
  const masked = record.redaction.redacted && !record.redaction.withheld;
  return (
    <li className={styles.row} data-pcc-memory-record-id={record.memoryId}>
      <div className={styles.rowHeader}>
        <PccStatusPill tone={memoryStatusTone(record.status)}>{record.status}</PccStatusPill>
        <span className={styles.recordType}>{record.recordType}</span>
        {masked ? (
          <PccStatusPill tone="warning">Restricted</PccStatusPill>
        ) : record.sourceLineage ? (
          <PccStatusPill tone="info">{record.sourceLineage.sourceSystem}</PccStatusPill>
        ) : null}
      </div>
      <p className={styles.summary}>{record.summary}</p>
      {!masked ? <MemoryDetail record={record} /> : null}
    </li>
  );
};

const MemoryDetail: FC<{ record: IPccMemoryRecordVm }> = ({ record }) => {
  if (record.recordType === 'decision') {
    const decision = record as IPccDecisionVm;
    return (
      <p className={styles.detail}>
        <strong>Decision:</strong> {decision.decision}
      </p>
    );
  }
  if (record.recordType === 'assumption') {
    const assumption = record as IPccAssumptionVm;
    return (
      <p className={styles.detail}>
        <strong>Assumption:</strong> {assumption.assumption}
      </p>
    );
  }
  return null;
};

export default ProjectMemoryPanel;
