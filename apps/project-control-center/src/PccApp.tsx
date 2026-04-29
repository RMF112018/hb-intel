import type { FC } from 'react';
import { PccShell } from './shell/PccShell';
import { PccSurfaceRouter } from './shell/PccSurfaceRouter';
import { usePccShellState } from './state/usePccShellState';
import type { PccResponsiveMode } from './layout/footprints';
import { PCC_PROJECT_PLACEHOLDER } from './preview/projectPlaceholder';

export interface PccAppProps {
  /** Test override for the responsive mode. */
  forceMode?: PccResponsiveMode;
}

export const PccApp: FC<PccAppProps> = ({ forceMode }) => {
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
      <PccSurfaceRouter activeSurfaceId={shell.activeSurfaceId} />
    </PccShell>
  );
};

export default PccApp;
