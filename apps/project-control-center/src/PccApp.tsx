import type { FC } from 'react';
import { PCC_MVP_SURFACES } from '@hbc/models/pcc';
import { PccShell } from './shell/PccShell';
import type { PccProjectHeroSourceConfidence } from './shell/PccProjectHeroBand';
import { PccSurfaceRouter, type IPccSurfaceRouterReadModelClient } from './shell/PccSurfaceRouter';
import { usePccShellState } from './state/usePccShellState';
import type { PccResponsiveMode } from './layout/footprints';
import { PCC_PROJECT_PLACEHOLDER } from './preview/projectPlaceholder';

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
  const activeSurface = PCC_MVP_SURFACES[shell.activeSurfaceId];
  const sourceConfidence: PccProjectHeroSourceConfidence = shell.previewMode ? 'reference' : 'live';

  return (
    <PccShell
      projectName={PCC_PROJECT_PLACEHOLDER.projectName}
      clientName={PCC_PROJECT_PLACEHOLDER.clientName}
      location={PCC_PROJECT_PLACEHOLDER.location}
      estimatedValue={PCC_PROJECT_PLACEHOLDER.estimatedValue}
      pills={PCC_PROJECT_PLACEHOLDER.pills}
      activeSurfaceLabel={activeSurface.displayName}
      activeSurfaceWorkflowLabel={activeSurface.description}
      activeSurfaceId={shell.activeSurfaceId}
      onSelectSurface={shell.setActiveSurface}
      sourceConfidence={sourceConfidence}
      forceMode={forceMode}
    >
      <PccSurfaceRouter activeSurfaceId={shell.activeSurfaceId} readModelClient={readModelClient} />
    </PccShell>
  );
};

export default PccApp;
