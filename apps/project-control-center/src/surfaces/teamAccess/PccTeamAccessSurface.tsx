import type { FC } from 'react';
import type { PccPersona } from '@hbc/models/pcc';
import { PccTeamAccessLaneShell } from './PccTeamAccessLaneShell';
import { PccTeamAccessReadModelContent } from './PccTeamAccessReadModelContent';
import type { IPccTeamAccessReadModelClient } from './useTeamAccessReadModel';

export interface PccTeamAccessSurfaceProps {
  previewPersona?: PccPersona;
  previewHasProjectSiteAccess?: boolean;
  /**
   * Wave 6 / Prompt 06 — opt-in read-model client. When supplied, the
   * Team & Access surface consumes the `team-access` envelope through
   * the seam via `PccTeamAccessReadModelContent`. When omitted, the
   * fixture-default lane shell is rendered unchanged.
   */
  readModelClient?: IPccTeamAccessReadModelClient;
}

export const PccTeamAccessSurface: FC<PccTeamAccessSurfaceProps> = ({
  previewPersona,
  previewHasProjectSiteAccess,
  readModelClient,
}) => {
  if (readModelClient) {
    return (
      <PccTeamAccessReadModelContent
        client={readModelClient}
        previewPersona={previewPersona}
        previewHasProjectSiteAccess={previewHasProjectSiteAccess}
      />
    );
  }

  return (
    <PccTeamAccessLaneShell
      previewPersona={previewPersona}
      previewHasProjectSiteAccess={previewHasProjectSiteAccess}
    />
  );
};

export default PccTeamAccessSurface;
