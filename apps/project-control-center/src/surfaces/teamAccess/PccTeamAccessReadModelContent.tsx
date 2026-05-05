/**
 * Team & Access opt-in child (Phase 3 / Wave 6 / Prompt 06).
 *
 * Rendered by `PccTeamAccessSurface` only when an explicit
 * `IPccTeamAccessReadModelClient` is supplied via mount config. Calls
 * `useTeamAccessReadModel` unconditionally so the rule against
 * conditional hook invocation is preserved.
 *
 * Imports `PccTeamAccessLaneShell` directly. Does not import
 * `PccTeamAccessSurface` — see the dependency-direction diagram in the
 * Wave 6 / Prompt 06 plan.
 */

import type { FC } from 'react';
import { SAMPLE_PROJECT_PROFILE, type PccPersona } from '@hbc/models/pcc';
import { PccPreviewState } from '../../ui/PccPreviewState';
import { PccTeamAccessLaneShell } from './PccTeamAccessLaneShell';
import {
  useTeamAccessReadModel,
  type IPccTeamAccessReadModelClient,
} from './useTeamAccessReadModel';

export interface PccTeamAccessReadModelContentProps {
  readonly client: IPccTeamAccessReadModelClient;
  readonly previewPersona?: PccPersona;
  readonly previewHasProjectSiteAccess?: boolean;
}

export const PccTeamAccessReadModelContent: FC<PccTeamAccessReadModelContentProps> = ({
  client,
  previewPersona,
  previewHasProjectSiteAccess,
}) => {
  const result = useTeamAccessReadModel(client, SAMPLE_PROJECT_PROFILE.projectId);

  if (result.status === 'loading') {
    return (
      <div data-pcc-team-access-read-model-content="loading">
        <PccPreviewState
          state="loading"
          title="Loading team & access"
          description="Reading the latest team-access envelope."
        />
      </div>
    );
  }

  if (result.status === 'error') {
    return (
      <div data-pcc-team-access-read-model-content="error">
        <PccPreviewState
          state="error"
          title="Team and access content is temporarily unavailable"
          description="Team and access content could not be loaded. Try again later."
        />
      </div>
    );
  }

  return (
    <div data-pcc-team-access-read-model-content="preview">
      <PccTeamAccessLaneShell
        previewPersona={previewPersona}
        previewHasProjectSiteAccess={previewHasProjectSiteAccess}
      />
    </div>
  );
};

export default PccTeamAccessReadModelContent;
