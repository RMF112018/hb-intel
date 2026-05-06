import type { FC } from 'react';
import { PCC_MVP_SURFACES, type PccReadModelSourceStatus } from '@hbc/models/pcc';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import styles from './PccDocumentsSurface.module.css';
import { HB_DOCUMENT_CONTROL_CENTER_TITLE } from './documentControlViewModel';

const DOCUMENTS_SURFACE = PCC_MVP_SURFACES['documents'];

export interface PccDocumentsHeaderCardProps {
  readonly readModelStatus?: 'loading' | 'preview' | 'error';
  readonly sourceStatus?: PccReadModelSourceStatus;
}

function cueFor(props: PccDocumentsHeaderCardProps): string {
  if (props.readModelStatus === 'loading') {
    return 'Loading document control content.';
  }
  if (props.readModelStatus === 'error' || props.sourceStatus === 'backend-unavailable') {
    return 'Document control is temporarily unavailable. Try again later.';
  }
  if (props.sourceStatus === 'source-unavailable') {
    return 'No document control sources are available for this project.';
  }
  return 'Document control shows three lanes for this project.';
}

export const PccDocumentsHeaderCard: FC<PccDocumentsHeaderCardProps> = (props) => {
  return (
    <PccDashboardCard
      footprint="full"
      eyebrow={DOCUMENTS_SURFACE.displayName}
      title={HB_DOCUMENT_CONTROL_CENTER_TITLE}
      dataActiveSurfacePanel="documents"
    >
      <div className={styles.headerCopy}>
        <span className={styles.previewCue}>{cueFor(props)}</span>
      </div>
    </PccDashboardCard>
  );
};

export default PccDocumentsHeaderCard;
