import { useState, type FC } from 'react';
import type { ITeamAccessRequestPreview } from '@hbc/models/pcc';
import { PccPreviewState } from '../../ui/PccPreviewState';
import type { TeamAccessBranch } from './teamAccessViewModel';
import { PccRequestStatusBadge } from './PccRequestStatusBadge';
import { PccAccessRequestDetail } from './PccAccessRequestDetail';
import { PccAccessReviewControls } from './PccAccessReviewControls';
import styles from './PccTeamAccessSurface.module.css';

export interface PccAccessRequestQueueProps {
  readonly records: readonly ITeamAccessRequestPreview[];
  readonly branch: TeamAccessBranch;
}

export const PccAccessRequestQueue: FC<PccAccessRequestQueueProps> = ({ records, branch }) => {
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  if (records.length === 0) {
    return (
      <div className={styles.queue} data-pcc-access-request-queue={0}>
        <PccPreviewState state="unavailable-fixture" />
      </div>
    );
  }

  const selectedRecord =
    selectedRequestId !== null
      ? (records.find((record) => record.requestId === selectedRequestId) ?? null)
      : null;

  const canReview = branch === 'access-manager';

  return (
    <div className={styles.queue} data-pcc-access-request-queue={records.length}>
      <ul className={styles.list} data-pcc-access-request-queue-list="">
        {records.map((record) => {
          const isSelected = record.requestId === selectedRequestId;
          return (
            <li
              key={record.requestId}
              className={styles.queueRow}
              data-pcc-access-request-queue-row={record.requestId}
              data-pcc-access-request-queue-row-selected={isSelected ? 'true' : 'false'}
            >
              <div className={styles.metaRow}>
                <strong>{record.requestedUserLabel}</strong>
                <PccRequestStatusBadge status={record.requestStatus} />
              </div>
              <div className={styles.metaRow}>
                Requested role: {record.requestedPersona} · Template:{' '}
                {record.requestedPermissionTemplateLabel}
              </div>
              <div className={styles.queueRowActions}>
                <button
                  type="button"
                  className={styles.disabledAction}
                  onClick={() => setSelectedRequestId(record.requestId)}
                  data-pcc-access-request-queue-action="view-detail"
                  data-pcc-access-request-queue-action-target={record.requestId}
                >
                  View detail
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {selectedRecord !== null ? (
        <>
          <PccAccessRequestDetail request={selectedRecord} />
          <PccAccessReviewControls request={selectedRecord} canReview={canReview} />
        </>
      ) : null}
    </div>
  );
};

export default PccAccessRequestQueue;
