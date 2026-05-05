import type { FC } from 'react';
import { PCC_MVP_SURFACES } from '@hbc/models/pcc';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccPreviewState, type PccPreviewStateKind } from '../../ui/PccPreviewState';
import { PccSurfaceContextHeader } from '../shared/PccSurfaceContextHeader';
import type { IPccLaunchPadHeaderViewModel } from './launchPadViewModel';
import styles from './PccExternalSystemsSurface.module.css';

const SURFACE = PCC_MVP_SURFACES['external-systems'];

export interface PccExternalSystemsLaunchPadHeaderCardProps {
  readonly header: IPccLaunchPadHeaderViewModel;
  readonly cardState: PccPreviewStateKind;
  readonly isAvailable: boolean;
}

export const PccExternalSystemsLaunchPadHeaderCard: FC<
  PccExternalSystemsLaunchPadHeaderCardProps
> = ({ header, cardState, isAvailable }) => (
  <PccDashboardCard
    footprint="full"
    eyebrow={SURFACE.displayName}
    title="Launch Pad"
    dataActiveSurfacePanel="external-systems"
  >
    <div
      className={styles.body}
      data-pcc-readiness-section="external-systems"
      data-pcc-launch-pad-lane="header"
    >
      <PccSurfaceContextHeader
        surfaceId="external-systems"
        projectLabel={`Project ${header.projectId ?? '26-000-00'} · Integration Launch Pad`}
        postureLabel="Read-only preview"
        sourceStatusLabel="Read-model available"
        sourceConfidenceLabel="Envelope confidence"
        lastUpdatedLabel="Runtime envelope timestamp"
      />
      <p className={styles.message}>{header.subtitle}</p>
      {isAvailable ? (
        <span className={styles.previewCue}>
          Inert preview · launch affordances are disabled in this prompt.
        </span>
      ) : (
        <PccPreviewState state={cardState} />
      )}
    </div>
  </PccDashboardCard>
);

export default PccExternalSystemsLaunchPadHeaderCard;
