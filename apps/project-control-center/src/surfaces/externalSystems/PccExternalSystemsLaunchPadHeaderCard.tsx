import type { FC } from 'react';
import { PCC_MVP_SURFACES } from '@hbc/models/pcc';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccPreviewState, type PccPreviewStateKind } from '../../ui/PccPreviewState';
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
    hierarchy="primary"
    tier="tier1"
    region="command"
    headingLevel={2}
    eyebrow={SURFACE.displayName}
    title="Launch Pad"
    dataActiveSurfacePanel="external-systems"
  >
    <div
      className={styles.body}
      data-pcc-readiness-section="external-systems"
      data-pcc-launch-pad-lane="header"
    >
      <p className={styles.message}>{header.subtitle}</p>
      {isAvailable ? (
        <span className={styles.previewCue}>Launch links open the source system in a new tab.</span>
      ) : (
        <PccPreviewState state={cardState} />
      )}
    </div>
  </PccDashboardCard>
);

export default PccExternalSystemsLaunchPadHeaderCard;
