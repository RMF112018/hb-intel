import type { FC } from 'react';
import { PCC_MVP_SURFACES, PCC_MVP_SURFACE_IDS } from '@hbc/models/pcc';
import { PccShell } from './shell/PccShell';
import { PccDashboardCard } from './layout/PccDashboardCard';
import { PccPreviewState } from './ui/PccPreviewState';
import {
  PCC_CARD_FOOTPRINTS,
  type PccCardFootprint,
  type PccResponsiveMode,
} from './layout/footprints';
import { PCC_PROJECT_PLACEHOLDER } from './preview/projectPlaceholder';

const FOOTPRINT_DEMO_TITLES: Record<PccCardFootprint, string> = {
  hero: 'Project hero',
  wide: 'Wide insight band',
  standard: 'Standard tile',
  compact: 'Compact KPI',
  tall: 'Tall side panel',
  full: 'Full-width strip',
};

export interface PccAppProps {
  /** Test override for the responsive mode. */
  forceMode?: PccResponsiveMode;
}

export const PccApp: FC<PccAppProps> = ({ forceMode }) => (
  <PccShell
    projectName={PCC_PROJECT_PLACEHOLDER.projectName}
    subtitle={PCC_PROJECT_PLACEHOLDER.subtitle}
    dateScope={PCC_PROJECT_PLACEHOLDER.dateScope}
    pills={PCC_PROJECT_PLACEHOLDER.pills}
    forceMode={forceMode}
  >
    {PCC_CARD_FOOTPRINTS.map((footprint) => (
      <PccDashboardCard
        key={`footprint-demo-${footprint}`}
        footprint={footprint}
        eyebrow={`Footprint · ${footprint}`}
        title={FOOTPRINT_DEMO_TITLES[footprint]}
      >
        <PccPreviewState state="preview" />
      </PccDashboardCard>
    ))}

    {PCC_MVP_SURFACE_IDS.map((id) => {
      const surface = PCC_MVP_SURFACES[id];
      return (
        <PccDashboardCard
          key={`surface-card-${id}`}
          footprint="standard"
          eyebrow="MVP Surface"
          title={surface.displayName}
        >
          <p style={{ margin: 0, fontSize: 13, color: 'var(--pcc-color-text-muted)' }}>
            {surface.description}
          </p>
          <PccPreviewState state="preview" />
        </PccDashboardCard>
      );
    })}
  </PccShell>
);

export default PccApp;
