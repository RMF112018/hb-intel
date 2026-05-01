/**
 * Wave 7 / Prompt 06 — Document Control reviews & approvals card.
 *
 * Renders three sections from the document-control read-model view-model:
 *
 *   1. Review type vocabulary — `viewModel.reviewTypes`
 *   2. Review state legend     — `viewModel.reviewStates`
 *   3. Review queue            — `viewModel.reviewQueueSample`
 *
 * This is **read-model rendering only**. The card takes only an optional
 * `viewModel` prop and renders no buttons, no anchors, and no executable
 * handlers. No live approval, rejection, return, reassign, routing, or
 * workflow-mutation behavior is introduced; no Graph/PnP/SharePoint REST
 * or external system runtime is imported.
 *
 * When `viewModel` is undefined (loading / error / no read-model client
 * mounted), the card renders the shell with empty fallback markers so
 * the surface stays informative without crashing.
 */

import type { FC } from 'react';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import styles from './PccDocumentsSurface.module.css';
import type { IPccDocumentControlViewModel } from './documentControlViewModel';
import {
  resolveReviewStateMessage,
  resolveReviewTypeLabel,
} from './reviewMessaging';

export interface PccDocumentControlReviewsCardProps {
  readonly viewModel?: IPccDocumentControlViewModel;
}

export const PccDocumentControlReviewsCard: FC<PccDocumentControlReviewsCardProps> = ({
  viewModel,
}) => {
  const reviewTypes = viewModel?.reviewTypes ?? [];
  const reviewStates = viewModel?.reviewStates ?? [];
  const queue = viewModel?.reviewQueueSample ?? [];
  const roleVocabulary = viewModel?.roleVocabulary;

  return (
    <PccDashboardCard footprint="full" eyebrow="Reviews" title="Reviews & Approvals">
      <div className={styles.headerCopy} data-pcc-doc-reviews-card="true">
        <p className={styles.laneDescription}>
          Read-only summary of the Wave 7 document-control review vocabulary, state legend, and
          queue sample. This is read-model rendering — no live approval, rejection, return, or
          reassignment behavior.
        </p>

        {/* 1. Review type vocabulary */}
        <section data-pcc-doc-reviews-section="review-types">
          <h4 className={styles.laneTitle}>Review types</h4>
          {reviewTypes.length === 0 ? (
            <p className={styles.guardrail} data-pcc-doc-review-types-empty="true">
              No data in this preview.
            </p>
          ) : (
            <ul className={styles.metaList} data-pcc-doc-review-types-list="true">
              {reviewTypes.map((typeId) => (
                <li
                  key={typeId}
                  className={styles.metaRow}
                  data-pcc-doc-review-type={typeId}
                >
                  <span className={styles.metaLabel}>{resolveReviewTypeLabel(typeId)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* 2. Review state legend */}
        <section data-pcc-doc-reviews-section="review-states">
          <h4 className={styles.laneTitle}>Review states</h4>
          {reviewStates.length === 0 ? (
            <p className={styles.guardrail} data-pcc-doc-review-states-empty="true">
              No data in this preview.
            </p>
          ) : (
            <ul className={styles.metaList} data-pcc-doc-review-state-legend="true">
              {reviewStates.map((stateId) => {
                const message = resolveReviewStateMessage(stateId);
                return (
                  <li
                    key={stateId}
                    className={styles.metaRow}
                    data-pcc-doc-review-state-legend-code={stateId}
                    data-pcc-doc-review-state-tone={message.tone}
                  >
                    <span className={styles.metaLabel}>{message.label}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* 3. Review queue sample */}
        <section data-pcc-doc-reviews-section="review-queue">
          <h4 className={styles.laneTitle}>Review queue</h4>
          {queue.length === 0 ? (
            <p className={styles.guardrail} data-pcc-doc-review-queue-empty="true">
              No data in this preview.
            </p>
          ) : (
            <ul className={styles.metaList} data-pcc-doc-review-queue="true">
              {queue.map((item) => {
                const typeLabel = resolveReviewTypeLabel(item.reviewType);
                const stateMessage = resolveReviewStateMessage(item.reviewState);
                const roleLabel = roleVocabulary?.[item.assignedRoleCode]?.label;
                const roleText = roleLabel
                  ? `${item.assignedRoleCode} — ${roleLabel}`
                  : item.assignedRoleCode;
                return (
                  <li
                    key={item.itemId}
                    className={styles.metaRow}
                    data-pcc-doc-review-queue-row={item.itemId}
                  >
                    <span
                      className={styles.metaLabel}
                      data-pcc-doc-review-queue-file="true"
                    >
                      {item.fileName}
                    </span>
                    <span data-pcc-doc-review-queue-type={item.reviewType}>· {typeLabel}</span>
                    <span
                      data-pcc-doc-review-queue-state={item.reviewState}
                      data-pcc-doc-review-queue-state-tone={stateMessage.tone}
                    >
                      · {stateMessage.label}
                    </span>
                    <span data-pcc-doc-review-queue-role={item.assignedRoleCode}>
                      · {roleText}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </PccDashboardCard>
  );
};

export default PccDocumentControlReviewsCard;
