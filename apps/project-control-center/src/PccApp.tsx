import type { FC } from 'react';
import { PCC_MVP_SURFACES } from '@hbc/models/pcc';
import { PccShell } from './shell/PccShell';
import { PccSurfaceRouter, type IPccSurfaceRouterReadModelClient } from './shell/PccSurfaceRouter';
import { usePccShellState } from './state/usePccShellState';
import type { PccResponsiveMode } from './layout/footprints';
import { PCC_PROJECT_PLACEHOLDER } from './preview/projectPlaceholder';

export interface PccAppProps {
  /** Test override for the responsive mode. */
  forceMode?: PccResponsiveMode;
  /**
   * Wave 4 / Prompt 05 + Wave 6 / Prompt 06 — optional opt-in read-model
   * client. When supplied, Project Home and Team & Access consume
   * envelopes through the seam; default fixture rendering is preserved
   * when omitted.
   */
  readModelClient?: IPccSurfaceRouterReadModelClient;
}

export const PccApp: FC<PccAppProps> = ({ forceMode, readModelClient }) => {
  const shell = usePccShellState();
  const activeSurface = PCC_MVP_SURFACES[shell.activeSurfaceId];

  return (
    <PccShell
      projectName={PCC_PROJECT_PLACEHOLDER.projectName}
      subtitle={PCC_PROJECT_PLACEHOLDER.subtitle}
      dateScope={PCC_PROJECT_PLACEHOLDER.dateScope}
      pills={PCC_PROJECT_PLACEHOLDER.pills}
      activeSurfaceLabel={activeSurface.displayName}
      activeSurfaceWorkflowLabel={activeSurface.description}
      activeSurfaceId={shell.activeSurfaceId}
      onSelectSurface={shell.setActiveSurface}
      forceMode={forceMode}
    >
      <PccSurfaceRouter activeSurfaceId={shell.activeSurfaceId} readModelClient={readModelClient} />
    </PccShell>
  );
};

export default PccApp;
