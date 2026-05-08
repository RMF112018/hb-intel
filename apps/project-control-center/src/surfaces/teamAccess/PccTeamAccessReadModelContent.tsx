/**
 * Team & Access opt-in child (Phase 3 / Wave 6 / Prompt 06; direct-child
 * remediation Phase 3 / Wave 15A / wave-b4 / Prompt 01).
 *
 * Rendered by `PccTeamAccessSurface` only when an explicit
 * `IPccTeamAccessReadModelClient` is supplied via mount config. Calls
 * `useTeamAccessReadModel` unconditionally so the rule against
 * conditional hook invocation is preserved.
 *
 * Every render state returns a Fragment of `PccDashboardCard`s (or, for
 * loading/error, a single `PccDashboardCard`) so each card is a direct
 * child of `[data-pcc-bento-grid]`.
 */

import { Fragment, type FC } from 'react';
import { PCC_MVP_SURFACES, SAMPLE_PROJECT_PROFILE, type PccPersona } from '@hbc/models/pcc';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
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

const SURFACE = PCC_MVP_SURFACES['team-and-access'];

export const PccTeamAccessReadModelContent: FC<PccTeamAccessReadModelContentProps> = ({
  client,
  previewPersona,
  previewHasProjectSiteAccess,
}) => {
  const result = useTeamAccessReadModel(client, SAMPLE_PROJECT_PROFILE.projectId);

  if (result.status === 'loading') {
    return (
      <PccDashboardCard
        footprint="full"
        tier="state"
        region="state"
        headingLevel={2}
        eyebrow={SURFACE.displayName}
        title="Loading team & access"
      >
        <PccPreviewState
          state="loading"
          title="Loading team & access"
          description="Reading the latest team-access envelope."
        />
      </PccDashboardCard>
    );
  }

  if (result.status === 'error') {
    return (
      <PccDashboardCard
        footprint="full"
        tier="state"
        region="state"
        headingLevel={2}
        eyebrow={SURFACE.displayName}
        title="Team and access unavailable"
      >
        <PccPreviewState
          state="error"
          title="Team and access unavailable"
          description="Team and access content could not be loaded. Try again later."
        />
      </PccDashboardCard>
    );
  }

  return (
    <Fragment>
      <PccTeamAccessLaneShell
        previewPersona={previewPersona}
        previewHasProjectSiteAccess={previewHasProjectSiteAccess}
      />
    </Fragment>
  );
};

export default PccTeamAccessReadModelContent;
