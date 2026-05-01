import type { FC } from 'react';
import type {
  ITeamAccessRequestPreview,
  TeamAccessExecutionStatus,
} from '@hbc/models/pcc';
import { PccStatusPill, type PccStatusPillTone } from '../../ui/PccStatusPill';
import { PccPreviewState } from '../../ui/PccPreviewState';
import { PccRequestStatusBadge } from './PccRequestStatusBadge';
import { REQUEST_STATUS_LABELS } from './teamAccessAdapter';
import styles from './PccTeamAccessSurface.module.css';

export const EXECUTION_QUEUE_SECTION_IDS = [
  'pending-manual-it',
  'completed-manual',
  'backend-gated-later',
  'preview-only',
] as const;

export type ExecutionQueueSectionId = (typeof EXECUTION_QUEUE_SECTION_IDS)[number];

export const EXECUTION_QUEUE_SECTION_LABELS: Readonly<Record<ExecutionQueueSectionId, string>> = {
  'pending-manual-it': 'Pending Manual IT',
  'completed-manual': 'Completed Manual',
  'backend-gated-later': 'Backend-Gated Later',
  'preview-only': 'Preview Only',
};

export const EXECUTION_QUEUE_SECTION_TONES: Readonly<Record<ExecutionQueueSectionId, PccStatusPillTone>> = {
  'pending-manual-it': 'warning',
  'completed-manual': 'success',
  'backend-gated-later': 'info',
  'preview-only': 'neutral',
};

export interface PccAccessExecutionQueueProps {
  readonly records: readonly ITeamAccessRequestPreview[];
  readonly laneExecutionStatus: TeamAccessExecutionStatus;
}

interface RecordRowProps {
  readonly record: ITeamAccessRequestPreview;
  readonly perRecordHelper?: string;
}

const RecordRow: FC<RecordRowProps> = ({ record, perRecordHelper }) => (
  <li
    className={styles.queueRow}
    data-pcc-execution-queue-row={record.requestId}
  >
    <div className={styles.metaRow}>
      <strong>{record.requestedUserLabel}</strong>
      <PccRequestStatusBadge status={record.requestStatus} />
    </div>
    <div className={styles.metaRow}>
      Requested role: {record.requestedPersona} · Template:{' '}
      {record.requestedPermissionTemplateLabel}
    </div>
    {record.reviewedByLabel ? (
      <div className={styles.metaRow}>Reviewed by: {record.reviewedByLabel}</div>
    ) : null}
    {record.reviewerCommentPreview ? (
      <div className={styles.metaRow}>
        Approval / comment preview: {record.reviewerCommentPreview}
      </div>
    ) : null}
    {perRecordHelper ? (
      <div
        className={styles.previewCue}
        data-pcc-execution-queue-row-helper=""
      >
        {perRecordHelper}
      </div>
    ) : null}
  </li>
);

interface SectionShellProps {
  readonly id: ExecutionQueueSectionId;
  readonly children: React.ReactNode;
}

const SectionShell: FC<SectionShellProps> = ({ id, children }) => {
  const tone = EXECUTION_QUEUE_SECTION_TONES[id];
  const label = EXECUTION_QUEUE_SECTION_LABELS[id];
  return (
    <section
      className={styles.executionQueueSection}
      data-pcc-execution-queue-section={id}
      data-pcc-execution-queue-section-tone={tone}
    >
      <header className={styles.executionQueueSectionHeader}>
        <PccStatusPill tone={tone}>{label}</PccStatusPill>
        <span data-pcc-execution-queue-section-label={label}>{label}</span>
      </header>
      {children}
    </section>
  );
};

export const PccAccessExecutionQueue: FC<PccAccessExecutionQueueProps> = ({
  records,
  laneExecutionStatus,
}) => {
  const pendingManualItRecords = records.filter(
    (record) => record.requestStatus === 'approved-pending-execution',
  );
  const completedManualRecords = records.filter(
    (record) => record.requestStatus === 'completed-manual',
  );
  const isBackendGated = laneExecutionStatus === 'backend-gated-later';
  const isPreviewOnly = laneExecutionStatus === 'preview-only';

  return (
    <div
      className={styles.executionQueue}
      data-pcc-access-execution-queue={records.length}
    >
      <SectionShell id="pending-manual-it">
        {pendingManualItRecords.length === 0 ? (
          <PccPreviewState
            state="unavailable-fixture"
            title="No requests awaiting manual IT execution"
            description="Manual IT handled — fixture preview shows no pending records in this state."
          />
        ) : (
          <ul
            className={styles.list}
            data-pcc-execution-queue-section-list="pending-manual-it"
          >
            {pendingManualItRecords.map((record) => (
              <RecordRow
                key={record.requestId}
                record={record}
                perRecordHelper={`${REQUEST_STATUS_LABELS['approved-pending-execution']} · Manual IT handled`}
              />
            ))}
          </ul>
        )}
      </SectionShell>

      <SectionShell id="completed-manual">
        {completedManualRecords.length === 0 ? (
          <PccPreviewState
            state="unavailable-fixture"
            title="No completed-manual records"
            description="Manual IT handled — fixture preview shows no completed records."
          />
        ) : (
          <ul
            className={styles.list}
            data-pcc-execution-queue-section-list="completed-manual"
          >
            {completedManualRecords.map((record) => (
              <RecordRow
                key={record.requestId}
                record={record}
                perRecordHelper="Manual IT handled"
              />
            ))}
          </ul>
        )}
      </SectionShell>

      <SectionShell id="backend-gated-later">
        {isBackendGated ? (
          <p
            className={styles.previewCue}
            data-pcc-execution-queue-section-note="lane-deferred"
          >
            Lane execution is currently Backend-Gated Later. Approved
            requests remain pending; no permission change is executed in
            preview.
          </p>
        ) : (
          <PccPreviewState
            state="unavailable-fixture"
            title="No backend-gated activity"
            description="Lane is not currently in Backend-Gated Later posture."
          />
        )}
      </SectionShell>

      <SectionShell id="preview-only">
        <p
          className={styles.previewCue}
          data-pcc-execution-queue-section-note="preview-context"
          data-pcc-execution-queue-section-active={isPreviewOnly ? 'true' : 'false'}
        >
          Preview Only — execution surface is intentionally absent. No
          permission change is executed and no synthetic execution
          activity is rendered.
        </p>
      </SectionShell>
    </div>
  );
};

export default PccAccessExecutionQueue;
