import type { FC } from 'react';
import {
  DOCUMENT_CONTROL_SOURCES,
  SAMPLE_DOCUMENT_CONTROL_SOURCE_IDS,
} from '@hbc/models/pcc';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccPreviewState } from '../../ui/PccPreviewState';
import { PccStatusPill } from '../../ui/PccStatusPill';
import type { PccProjectHomeCardProps } from './shared';
import styles from './PccProjectHome.module.css';

function postureTone(posture: string): 'success' | 'info' | 'warning' | 'neutral' {
  switch (posture) {
    case 'mvp-required':
      return 'success';
    case 'mvp-optional':
      return 'info';
    case 'conditional':
      return 'warning';
    default:
      return 'neutral';
  }
}

function linkBehaviorLabel(behavior: string): string {
  switch (behavior) {
    case 'browse-in-place':
      return 'Browse in place';
    case 'launch-link':
      return 'Launch link';
    default:
      return behavior;
  }
}

const DocumentControlBody: FC = () => (
  <div className={styles.sourceGrid} data-pcc-document-control-body="">
    {SAMPLE_DOCUMENT_CONTROL_SOURCE_IDS.map((id) => {
      const source = DOCUMENT_CONTROL_SOURCES[id];
      return (
        <div
          key={id}
          className={styles.sourceTile}
          data-pcc-document-source-id={id}
          data-pcc-document-posture={source.posture}
          data-pcc-document-link-behavior={source.linkBehavior}
        >
          <span className={styles.sourceName}>{source.displayName}</span>
          <PccStatusPill tone={postureTone(source.posture)}>{source.posture}</PccStatusPill>
          <span className={styles.sourceMeta}>{linkBehaviorLabel(source.linkBehavior)}</span>
        </div>
      );
    })}
  </div>
);

export const PccDocumentControlCard: FC<PccProjectHomeCardProps> = ({ state = 'preview' }) => (
  <PccDashboardCard
    footprint="wide"
    eyebrow="Documents"
    title="Document Control Center"
  >
    {state === 'preview' ? <DocumentControlBody /> : <PccPreviewState state={state} />}
  </PccDashboardCard>
);

export default PccDocumentControlCard;
