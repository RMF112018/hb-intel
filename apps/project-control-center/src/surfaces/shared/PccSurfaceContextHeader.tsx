import type { FC } from 'react';
import { PCC_MVP_SURFACES, type PccMvpSurfaceId } from '@hbc/models/pcc';
import styles from './PccSurfaceContextHeader.module.css';

export interface PccSurfaceContextHeaderProps {
  readonly surfaceId: PccMvpSurfaceId;
  readonly projectLabel: string;
  readonly postureLabel: string;
  readonly sourceStatusLabel: string;
  readonly sourceConfidenceLabel: string;
  readonly lastUpdatedLabel: string;
}

export const PccSurfaceContextHeader: FC<PccSurfaceContextHeaderProps> = ({
  surfaceId,
  projectLabel,
  postureLabel,
  sourceStatusLabel,
  sourceConfidenceLabel,
  lastUpdatedLabel,
}) => {
  const surface = PCC_MVP_SURFACES[surfaceId];

  return (
    <section
      className={styles.context}
      data-pcc-surface-context=""
      data-pcc-surface-context-id={surfaceId}
    >
      <div className={styles.summary}>
        <p className={styles.project} data-pcc-context-project="">
          {projectLabel}
        </p>
        <p className={styles.surface} data-pcc-context-surface="">
          {surface.displayName}
        </p>
        <p className={styles.description} data-pcc-context-surface-description="">
          {surface.description}
        </p>
      </div>
      <div className={styles.metaRow}>
        <span className={styles.metaCell}>
          <span className={styles.metaLabel}>Posture</span>
          <span className={styles.metaValue} data-pcc-context-posture="">
            {postureLabel}
          </span>
        </span>
        <span className={styles.metaCell}>
          <span className={styles.metaLabel}>Source status</span>
          <span className={styles.metaValue} data-pcc-context-source-status="">
            {sourceStatusLabel}
          </span>
        </span>
        <span className={styles.metaCell}>
          <span className={styles.metaLabel}>Source confidence</span>
          <span className={styles.metaValue} data-pcc-context-source-confidence="">
            {sourceConfidenceLabel}
          </span>
        </span>
        <span className={styles.metaCell}>
          <span className={styles.metaLabel}>Last updated</span>
          <span className={styles.metaValue} data-pcc-context-last-updated="">
            {lastUpdatedLabel}
          </span>
        </span>
      </div>
    </section>
  );
};

export default PccSurfaceContextHeader;
