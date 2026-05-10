import type { FC } from 'react';
import { SAMPLE_PROJECT_PROFILE } from '@hbc/models/pcc';
import { PccShell } from './shell/PccShell';
import { PccSurfaceRouter, type IPccSurfaceRouterReadModelClient } from './shell/PccSurfaceRouter';
import { usePccShellState } from './state/usePccShellState';
import type { PccResponsiveMode } from './layout/footprints';
import { deriveShellHeroViewModel } from './preview/projectShellViewModel';

export interface PccAppProps {
  /** Test override for the responsive mode. */
  forceMode?: PccResponsiveMode;
  /**
   * Optional opt-in read-model client. When supplied, surfaces consume
   * envelopes through the seam; default fixture rendering is preserved
   * when omitted.
   */
  readModelClient?: IPccSurfaceRouterReadModelClient;
}

export const PccApp: FC<PccAppProps> = ({ forceMode, readModelClient }) => {
  const shell = usePccShellState();
  const heroViewModel = deriveShellHeroViewModel(SAMPLE_PROJECT_PROFILE, shell.activePrimaryTabId);

  return (
    <PccShell
      heroViewModel={heroViewModel}
      activePrimaryTabId={shell.activePrimaryTabId}
      activeModuleId={shell.activeModuleId}
      onSelectPrimarySurface={shell.selectPrimarySurface}
      onSelectModule={shell.selectModule}
      forceMode={forceMode}
    >
      <PccSurfaceRouter
        activePrimaryTabId={shell.activePrimaryTabId}
        activeModuleId={shell.activeModuleId}
        readModelClient={readModelClient}
      />
    </PccShell>
  );
};

export default PccApp;
