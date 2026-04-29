import type { FC } from 'react';
import {
  DOCUMENT_CONTROL_SOURCES,
  type DocumentControlSourceId,
} from '@hbc/models/pcc';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccPreviewState } from '../../ui/PccPreviewState';
import { PccStatusPill } from '../../ui/PccStatusPill';
import type { PccProjectHomeCardProps } from '../projectHome/shared';
import styles from './PccDocumentsSurface.module.css';

export interface PccExternalDocSystemCardProps extends PccProjectHomeCardProps {
  sourceId: DocumentControlSourceId;
}

export const PccExternalDocSystemCard: FC<PccExternalDocSystemCardProps> = ({
  sourceId,
  state = 'preview',
}) => {
  const source = DOCUMENT_CONTROL_SOURCES[sourceId];

  const body =
    state === 'preview' ? (
      <div className={styles.metaList}>
        <span className={styles.metaRow}>
          <span className={styles.metaLabel}>Source of record:</span>
          <span>{source.sourceOfRecordLabel}</span>
        </span>
        <span className={styles.metaRow}>
          <PccStatusPill tone="info">{source.posture}</PccStatusPill>
          <PccStatusPill tone="neutral">{source.linkBehavior}</PccStatusPill>
        </span>
        <span data-pcc-doc-launch-cue className={styles.previewCue}>
          Launch / visibility only · Configured launch links open the source platform.
        </span>
        <span className={styles.guardrail}>{source.guardrail}</span>
      </div>
    ) : (
      <PccPreviewState state={state} />
    );

  return (
    <PccDashboardCard
      footprint="standard"
      eyebrow="External Document Systems"
      title={source.displayName}
    >
      <div data-pcc-doc-lane={source.lane} data-pcc-document-source-id={sourceId}>
        {body}
      </div>
    </PccDashboardCard>
  );
};

export default PccExternalDocSystemCard;
