import type { FC } from 'react';
import { PCC_MVP_SURFACES, type PccReadModelSourceStatus } from '@hbc/models/pcc';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { pccSurfacePostureCopy, type PccSurfacePostureKind } from '../../ui/pccSurfacePostureCopy';
import { PccSurfaceContextHeader } from '../shared/PccSurfaceContextHeader';
import styles from './PccDocumentsSurface.module.css';
import { HB_DOCUMENT_CONTROL_CENTER_TITLE } from './documentControlViewModel';

const DOCUMENTS_SURFACE = PCC_MVP_SURFACES['documents'];

export interface PccDocumentsHeaderCardProps {
  readonly readModelStatus?: 'loading' | 'preview' | 'error';
  readonly sourceStatus?: PccReadModelSourceStatus;
}

function postureKindFor(props: PccDocumentsHeaderCardProps): PccSurfacePostureKind {
  if (props.readModelStatus === 'loading') return 'loading';
  if (props.readModelStatus === 'error' || props.sourceStatus === 'backend-unavailable') {
    return 'error';
  }
  if (props.sourceStatus === 'source-unavailable') return 'unavailable';
  return 'reference';
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
  const posture = pccSurfacePostureCopy(postureKindFor(props));
  return (
    <PccDashboardCard
      footprint="full"
      eyebrow={DOCUMENTS_SURFACE.displayName}
      title={HB_DOCUMENT_CONTROL_CENTER_TITLE}
      dataActiveSurfacePanel="documents"
    >
      <div className={styles.headerCopy}>
        <PccSurfaceContextHeader
          surfaceId="documents"
          projectLabel="Project 26-000-00 · Document Control"
          postureLabel={posture.postureLabel}
          sourceStatusLabel={posture.sourceStatusLabel}
          sourceConfidenceLabel={posture.sourceConfidenceLabel}
          lastUpdatedLabel={posture.lastUpdatedLabel}
        />
        <span className={styles.previewCue}>{cueFor(props)}</span>
      </div>
    </PccDashboardCard>
  );
};

export default PccDocumentsHeaderCard;
