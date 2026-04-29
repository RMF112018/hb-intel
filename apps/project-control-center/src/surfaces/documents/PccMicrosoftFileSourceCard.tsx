import type { FC } from 'react';
import {
  DOCUMENT_CONTROL_ACTIONS,
  DOCUMENT_CONTROL_SOURCES,
  type DocumentControlSourceId,
} from '@hbc/models/pcc';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccPreviewState } from '../../ui/PccPreviewState';
import { PccStatusPill } from '../../ui/PccStatusPill';
import type { PccProjectHomeCardProps } from '../projectHome/shared';
import styles from './PccDocumentsSurface.module.css';

export interface PccMicrosoftFileSourceCardProps extends PccProjectHomeCardProps {
  sourceId: DocumentControlSourceId;
}

export const PccMicrosoftFileSourceCard: FC<PccMicrosoftFileSourceCardProps> = ({
  sourceId,
  state = 'preview',
}) => {
  const source = DOCUMENT_CONTROL_SOURCES[sourceId];

  const body =
    state === 'preview' ? (
      <>
        <div className={styles.metaList}>
          <span className={styles.metaRow}>
            <span className={styles.metaLabel}>Source of record:</span>
            <span>{source.sourceOfRecordLabel}</span>
          </span>
          <span className={styles.metaRow}>
            <span className={styles.metaLabel}>Posture:</span>
            <PccStatusPill tone="success">{source.posture}</PccStatusPill>
            <PccStatusPill tone="info">{source.linkBehavior}</PccStatusPill>
          </span>
          <span className={styles.previewCue}>
            Future Microsoft Graph–backed file management
          </span>
        </div>
        <ul className={styles.actionGrid} data-pcc-doc-actions="">
          {source.previewActionIds.map((actionId) => {
            const action = DOCUMENT_CONTROL_ACTIONS[actionId];
            return (
              <li key={actionId}>
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  className={styles.actionChip}
                  data-pcc-doc-action={actionId}
                  data-pcc-doc-action-execution-state={action.executionState}
                  title={`${action.description} · ${action.futureCapability}`}
                >
                  {action.label}
                </button>
              </li>
            );
          })}
        </ul>
        <span className={styles.guardrail}>{source.guardrail}</span>
      </>
    ) : (
      <PccPreviewState state={state} />
    );

  return (
    <PccDashboardCard
      footprint="wide"
      eyebrow="Microsoft Files"
      title={source.displayName}
    >
      <div data-pcc-doc-lane={source.lane} data-pcc-document-source-id={sourceId}>
        {body}
      </div>
    </PccDashboardCard>
  );
};

export default PccMicrosoftFileSourceCard;
