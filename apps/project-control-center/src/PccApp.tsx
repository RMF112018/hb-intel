import type { FC } from 'react';
import { PccShell } from './shell/PccShell';
import { PccSurfaceRouter } from './shell/PccSurfaceRouter';
import { usePccShellState } from './state/usePccShellState';
import type { PccResponsiveMode } from './layout/footprints';
import { PCC_PROJECT_PLACEHOLDER } from './preview/projectPlaceholder';
import type { IPccProjectHomeReadModelClient } from './surfaces/projectHome/projectHomeViewModel';

export interface PccAppProps {
  /** Test override for the responsive mode. */
  forceMode?: PccResponsiveMode;
  /**
   * Wave 4 / Prompt 05 — optional opt-in read-model client. When supplied,
   * Project Home consumes envelopes through the seam; default fixture
   * rendering is preserved when omitted.
   */
  readModelClient?: IPccProjectHomeReadModelClient;
}

export const PccApp: FC<PccAppProps> = ({ forceMode, readModelClient }) => {
  const shell = usePccShellState();

  return (
    <PccShell
      projectName={PCC_PROJECT_PLACEHOLDER.projectName}
      subtitle={PCC_PROJECT_PLACEHOLDER.subtitle}
      dateScope={PCC_PROJECT_PLACEHOLDER.dateScope}
      pills={PCC_PROJECT_PLACEHOLDER.pills}
      activeSurfaceId={shell.activeSurfaceId}
      onSelectSurface={shell.setActiveSurface}
      forceMode={forceMode}
    >
      <PccSurfaceRouter
        activeSurfaceId={shell.activeSurfaceId}
        readModelClient={readModelClient}
      />
    </PccShell>
  );
};

export default PccApp;
