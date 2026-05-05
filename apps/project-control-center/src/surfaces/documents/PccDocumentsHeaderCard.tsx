import type { FC } from 'react';
import { PCC_MVP_SURFACES, type PccReadModelSourceStatus } from '@hbc/models/pcc';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccSurfaceContextHeader } from '../shared/PccSurfaceContextHeader';
import styles from './PccDocumentsSurface.module.css';
import { HB_DOCUMENT_CONTROL_CENTER_TITLE } from './documentControlViewModel';

const DOCUMENTS_SURFACE = PCC_MVP_SURFACES['documents'];

export interface PccDocumentsHeaderCardProps {
  readonly readModelStatus?: 'loading' | 'preview' | 'error';
  readonly sourceStatus?: PccReadModelSourceStatus;
}

function previewCueFor(props: PccDocumentsHeaderCardProps): string {
  if (props.readModelStatus === 'loading') {
    return 'Loading the document control read model.';
  }
  if (props.readModelStatus === 'error' || props.sourceStatus === 'backend-unavailable') {
    return 'Document control read model is unavailable. Showing preview-safe state.';
  }
  if (props.sourceStatus === 'source-unavailable') {
    return 'No document control sources are available for this project. Showing preview-safe state.';
  }
  return 'Read-only preview. Document control surfaces three lanes from the project read model.';
}

export const PccDocumentsHeaderCard: FC<PccDocumentsHeaderCardProps> = (props) => (
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
        postureLabel="Read-only preview"
        sourceStatusLabel={props.sourceStatus ?? 'Source unavailable'}
        sourceConfidenceLabel={
          props.sourceStatus === 'available' ? 'Envelope confidence' : 'Preview confidence'
        }
        lastUpdatedLabel={
          props.readModelStatus === 'preview'
            ? 'Envelope timestamp available'
            : 'Not connected in this prompt'
        }
      />
      <span className={styles.previewCue}>{previewCueFor(props)}</span>
    </div>
  </PccDashboardCard>
);

export default PccDocumentsHeaderCard;
