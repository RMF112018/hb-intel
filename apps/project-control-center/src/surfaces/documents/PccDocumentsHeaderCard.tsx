import type { FC } from 'react';
import { PCC_MVP_SURFACES, DOCUMENT_CONTROL_LANES } from '@hbc/models/pcc';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { laneDisplayLabel } from './shared';
import styles from './PccDocumentsSurface.module.css';

const DOCUMENTS_SURFACE = PCC_MVP_SURFACES['documents'];

export const PccDocumentsHeaderCard: FC = () => (
  <PccDashboardCard
    footprint="full"
    eyebrow={DOCUMENTS_SURFACE.displayName}
    title="Document Control Center"
    dataActiveSurfacePanel="documents"
  >
    <div className={styles.headerCopy}>
      <p>{DOCUMENTS_SURFACE.description}</p>
      <span className={styles.previewCue}>
        Preview frame · No live document operations are active in this preview.
      </span>
      <div className={styles.headerLanes}>
        {DOCUMENT_CONTROL_LANES.map((lane) => (
          <div key={lane} className={styles.headerLaneCard} data-pcc-doc-lane={lane}>
            <span className={styles.laneTitle}>{laneDisplayLabel(lane)}</span>
            <span className={styles.laneDescription}>
              {lane === 'microsoft-files'
                ? 'Future Microsoft Graph–backed file management for project libraries. PCC will not duplicate Microsoft files into a separate store.'
                : 'Launch and visibility access only. PCC does not mirror, sync, or write back to external systems.'}
            </span>
          </div>
        ))}
      </div>
    </div>
  </PccDashboardCard>
);

export default PccDocumentsHeaderCard;
