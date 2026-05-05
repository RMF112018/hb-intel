/**
 * PCC External Systems — Audit History card (Phase 3 / Wave 15 / Prompt 07).
 *
 * Display-only timeline of past `IExternalSystemAuditEvent` entries from
 * the composite read-model. The view-model row deliberately omits the
 * `metadataJson` field; this card never renders metadata to text,
 * `data-*`, `title`, or `aria-label`. The hard gate is no rendered or
 * exposed metadata — testable via DOM-output assertions.
 *
 * No event replay, relaunch, repair, or link-opening affordances exist.
 * All rows are read-only `<li>` entries with semantic timestamps.
 */

import type { FC } from 'react';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccPreviewState, type PccPreviewStateKind } from '../../ui/PccPreviewState';
import { PccStatusPill } from '../../ui/PccStatusPill';
import type {
  IPccLaunchPadAuditEventRow,
  IPccLaunchPadAuditHistoryViewModel,
} from './launchPadViewModel';
import styles from './PccExternalSystemsSurface.module.css';

export interface PccExternalSystemsAuditHistoryCardProps {
  readonly auditHistory: IPccLaunchPadAuditHistoryViewModel;
  readonly cardState: PccPreviewStateKind;
  readonly isAvailable: boolean;
}

export const PccExternalSystemsAuditHistoryCard: FC<PccExternalSystemsAuditHistoryCardProps> = ({
  auditHistory,
  cardState,
  isAvailable,
}) => (
  <PccDashboardCard footprint="full" eyebrow="Audit" title="Audit history">
    <div
      className={styles.body}
      data-pcc-readiness-section="external-systems"
      data-pcc-launch-pad-lane="audit-history"
    >
      <p className={styles.auditRedactionNote}>
        Display-only timeline · event metadata is redacted by default.
      </p>
      {!isAvailable ? (
        <PccPreviewState state={cardState} />
      ) : auditHistory.totalEvents === 0 ? (
        <PccPreviewState state="empty" />
      ) : (
        <ol className={styles.auditList} data-pcc-launch-pad-audit-rows="">
          {auditHistory.rows.map((row) => (
            <AuditRow key={row.eventId} row={row} />
          ))}
        </ol>
      )}
    </div>
  </PccDashboardCard>
);

interface AuditRowProps {
  readonly row: IPccLaunchPadAuditEventRow;
}

const AuditRow: FC<AuditRowProps> = ({ row }) => (
  <li
    className={styles.auditRow}
    data-pcc-launch-pad-audit-row={row.eventId}
    data-pcc-launch-pad-audit-event-type={row.eventType}
    data-pcc-launch-pad-audit-system={row.systemKey}
  >
    <div className={styles.auditRowHeader}>
      <PccStatusPill tone="info">{row.eventType}</PccStatusPill>
      <time
        className={styles.auditRowTime}
        dateTime={row.occurredAtUtc}
        data-pcc-launch-pad-audit-occurred-at={row.occurredAtUtc}
      >
        {row.occurredAtDisplay}
      </time>
    </div>
    <div className={styles.auditRowMetaRow}>
      <span className={styles.auditRowMetaItem}>System: {row.systemDisplayName}</span>
      <span className={styles.auditRowMetaItem} data-pcc-launch-pad-audit-actor={row.actorDisplay}>
        Actor: {row.actorDisplay}
      </span>
      <span
        className={styles.auditRowMetaItem}
        data-pcc-launch-pad-audit-correlation-id={row.correlationId}
      >
        Correlation: {row.correlationId}
      </span>
    </div>
    <p className={styles.auditRowSummary}>{row.summary}</p>
  </li>
);

export default PccExternalSystemsAuditHistoryCard;
