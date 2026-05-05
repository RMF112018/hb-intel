/**
 * PCC External Systems surface (Phase 3 / Wave 15 / Prompt 05).
 *
 * Wave 15 Launch Pad shell. Read-only / preview-only composition for the
 * Wave 15 composite read-model (`pcc/projects/{projectId}/external-systems-launch-pad`).
 * Renders the header card, summary band, project launch links panel, and
 * preserves the Wave 13 Procore configuration & status card as a direct
 * grid sibling (display-only, fixture-driven).
 *
 * Two render paths (mirrors `PccApprovalsSurface`):
 *   - Router-supplied `readModelClient` → asynchronous fetch via
 *     `useLaunchPadReadModel(...)`. Hook owns loading and error.
 *   - No client supplied → synchronous fixture envelope + adapter; the
 *     async hook is never invoked. Used by isolated previews and tests.
 *
 * Bento direct-child invariant: returns a `Fragment` of direct
 * `PccDashboardCard` children. Loading / error variants render a single
 * full-width card so the bento grid layout remains intact.
 *
 * Prompt 05 scope: header + summary + project launch links + Procore card.
 * Review queue (Prompt 06), registry/mapping/audit detail (Prompt 07),
 * and HBI lineage UI (Prompt 08) are intentionally absent.
 *
 * No active launch behavior: even policy-allowed + approved links render
 * inert/disabled launch affordances. No `<a href>` external anchors. No
 * iframe or current-image embeds. No live SDK calls.
 */

import { Fragment, type FC } from 'react';
import {
  SAMPLE_PCC_EXTERNAL_SYSTEMS_LAUNCH_PAD_READ_MODEL_KNOWN_PROJECT,
  SAMPLE_PROJECT_PROFILE,
  type IPccExternalSystemsLaunchPadReadModel,
  type PccPersona,
  type PccProjectId,
  type PccReadModelEnvelope,
} from '@hbc/models/pcc';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccPreviewState } from '../../ui/PccPreviewState';
import { FIXTURE_PROCORE_SURFACE_VIEW_MODEL } from '../../viewModels/procoreSurfaceFixture';
import { PccExternalSystemsLaunchPadHeaderCard } from './PccExternalSystemsLaunchPadHeaderCard';
import { PccExternalSystemsLaunchPadSummaryCard } from './PccExternalSystemsLaunchPadSummaryCard';
import { PccExternalSystemsProjectLinksCard } from './PccExternalSystemsProjectLinksCard';
import { PccExternalSystemsProcoreConfigurationStatusCard } from './PccExternalSystemsProcoreConfigurationStatusCard';
import { buildPccLaunchPadViewModel } from './launchPadAdapter';
import { useLaunchPadReadModel } from './useLaunchPadReadModel';
import type {
  IPccLaunchPadReadModelClient,
  IPccLaunchPadReadyViewModel,
  IPccLaunchPadViewModel,
} from './launchPadViewModel';
import styles from './PccExternalSystemsSurface.module.css';

const FIXTURE_PROJECT_ID: PccProjectId = SAMPLE_PROJECT_PROFILE.projectId;

const FIXTURE_ENVELOPE: PccReadModelEnvelope<IPccExternalSystemsLaunchPadReadModel> = {
  projectId: FIXTURE_PROJECT_ID,
  mode: 'fixture',
  sourceStatus: 'available',
  readOnly: true,
  warnings: [],
  generatedAtUtc: '2026-04-30T00:00:00.000Z',
  data: SAMPLE_PCC_EXTERNAL_SYSTEMS_LAUNCH_PAD_READ_MODEL_KNOWN_PROJECT,
};

export interface PccExternalSystemsSurfaceProps {
  readonly readModelClient?: IPccLaunchPadReadModelClient;
  readonly projectId?: PccProjectId;
  readonly viewerPersona?: PccPersona;
}

export const PccExternalSystemsSurface: FC<PccExternalSystemsSurfaceProps> = ({
  readModelClient,
  projectId,
  viewerPersona,
}) => {
  if (readModelClient) {
    return (
      <PccExternalSystemsSurfaceClientPath
        readModelClient={readModelClient}
        projectId={projectId ?? FIXTURE_PROJECT_ID}
        viewerPersona={viewerPersona}
      />
    );
  }
  const vm = buildPccLaunchPadViewModel(FIXTURE_ENVELOPE);
  return <PccExternalSystemsSurfaceCards viewModel={vm} />;
};

interface PccExternalSystemsSurfaceClientPathProps {
  readonly readModelClient: IPccLaunchPadReadModelClient;
  readonly projectId: PccProjectId;
  readonly viewerPersona?: PccPersona;
}

const PccExternalSystemsSurfaceClientPath: FC<PccExternalSystemsSurfaceClientPathProps> = ({
  readModelClient,
  projectId,
  viewerPersona,
}) => {
  const vm = useLaunchPadReadModel(readModelClient, projectId, viewerPersona);
  return <PccExternalSystemsSurfaceCards viewModel={vm} />;
};

interface PccExternalSystemsSurfaceCardsProps {
  readonly viewModel: IPccLaunchPadViewModel;
}

const PccExternalSystemsSurfaceCards: FC<PccExternalSystemsSurfaceCardsProps> = ({ viewModel }) => {
  if (viewModel.status === 'loading') {
    return (
      <PccDashboardCard
        footprint="full"
        eyebrow="External Systems"
        title="Launch Pad"
        dataActiveSurfacePanel="external-systems"
      >
        <div
          className={styles.body}
          data-pcc-readiness-section="external-systems"
          data-pcc-launch-pad-lane="header"
        >
          <PccPreviewState state="loading" />
        </div>
      </PccDashboardCard>
    );
  }
  if (viewModel.status === 'error') {
    return (
      <PccDashboardCard
        footprint="full"
        eyebrow="External Systems"
        title="Launch Pad"
        dataActiveSurfacePanel="external-systems"
      >
        <div
          className={styles.body}
          data-pcc-readiness-section="external-systems"
          data-pcc-launch-pad-lane="header"
        >
          <PccPreviewState state="error" />
        </div>
      </PccDashboardCard>
    );
  }
  return <ReadyCards viewModel={viewModel} />;
};

interface ReadyCardsProps {
  readonly viewModel: IPccLaunchPadReadyViewModel;
}

const ReadyCards: FC<ReadyCardsProps> = ({ viewModel }) => {
  const isAvailable = viewModel.cardState === 'preview';
  return (
    <Fragment>
      <PccExternalSystemsLaunchPadHeaderCard
        header={viewModel.header}
        cardState={viewModel.cardState}
        isAvailable={isAvailable}
      />
      <PccExternalSystemsLaunchPadSummaryCard
        summary={viewModel.summary}
        cardState={viewModel.cardState}
        isAvailable={isAvailable}
      />
      <PccExternalSystemsProjectLinksCard
        projectLinks={viewModel.projectLinks}
        cardState={viewModel.cardState}
        isAvailable={isAvailable}
      />
      <PccExternalSystemsProcoreConfigurationStatusCard
        viewModel={FIXTURE_PROCORE_SURFACE_VIEW_MODEL}
      />
    </Fragment>
  );
};

export default PccExternalSystemsSurface;
