/**
 * PCC External Systems surface (Phase 3 / Wave 15).
 *
 * Wave 15 Launch Pad shell. Read-only / preview-only composition for the
 * Wave 15 composite read-model (`pcc/projects/{projectId}/external-systems-launch-pad`).
 *
 * Composition (Fragment of direct PccDashboardCard children — bento
 * direct-child invariant):
 *   - header card (carries `data-pcc-active-surface-panel="external-systems"`);
 *   - summary band (composite totals);
 *   - Project Launch Links card with an "Add project link" trigger that
 *     opens the inert Add/Edit drawer (Prompt 06);
 *   - Custom Link Review Queue card with read-only Review Item detail
 *     panel (Prompt 06);
 *   - Procore configuration & status card (Wave 13 — display-only).
 *
 * The Add/Edit drawer is portal-mounted to `document.body`; it is *not*
 * a sibling of the bento grid and never participates in the
 * direct-child invariant.
 *
 * Two render paths (mirrors `PccApprovalsSurface`):
 *   - Router-supplied `readModelClient` → asynchronous fetch via
 *     `useLaunchPadReadModel(...)`. Hook owns loading and error.
 *   - No client supplied → synchronous fixture envelope + adapter; the
 *     async hook is never invoked. Used by isolated previews and tests.
 *
 * No active launch behavior: even policy-allowed + approved links render
 * inert/disabled launch affordances. No `<a href>` external anchors. No
 * iframe or current-image embeds. No live SDK calls. No write/command
 * handlers — drawer save is always disabled, review-queue rows expose
 * detail-panel toggles only.
 */

import { useCallback, useRef, useState, type FC } from 'react';
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
import { PccExternalSystemsLaunchPadSummaryCard } from './PccExternalSystemsLaunchPadSummaryCard';
import { PccExternalSystemsProjectLinksCard } from './PccExternalSystemsProjectLinksCard';
import { PccExternalSystemsReviewQueueCard } from './PccExternalSystemsReviewQueueCard';
import { PccExternalSystemsAddEditLinkDrawer } from './PccExternalSystemsAddEditLinkDrawer';
import { PccExternalSystemsProcoreConfigurationStatusCard } from './PccExternalSystemsProcoreConfigurationStatusCard';
import { PccExternalSystemsRegistryCard } from './PccExternalSystemsRegistryCard';
import { PccExternalSystemsMappingStatusCard } from './PccExternalSystemsMappingStatusCard';
import { PccExternalSystemsSourceHealthCard } from './PccExternalSystemsSourceHealthCard';
import { PccExternalSystemsAuditHistoryCard } from './PccExternalSystemsAuditHistoryCard';
import { PccExternalSystemsHbiLineageCard } from './PccExternalSystemsHbiLineageCard';
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
  const vm = buildPccLaunchPadViewModel(FIXTURE_ENVELOPE, viewerPersona);
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
        tier="state"
        region="state"
        headingLevel={2}
        eyebrow="External Platforms"
        title="Launch Pad"
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
        tier="state"
        region="state"
        headingLevel={2}
        eyebrow="External Platforms"
        title="Launch Pad"
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

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedReviewItemId, setSelectedReviewItemId] = useState<string | null>(null);
  const [selectedMappingId, setSelectedMappingId] = useState<string | null>(null);
  const addLinkButtonRef = useRef<HTMLButtonElement | null>(null);

  const handleOpenDrawer = useCallback((): void => {
    setDrawerOpen(true);
  }, []);
  const handleDismissDrawer = useCallback((): void => {
    setDrawerOpen(false);
  }, []);

  return (
    <>
      <PccExternalSystemsLaunchPadSummaryCard
        summary={viewModel.summary}
        cardState={viewModel.cardState}
        isAvailable={isAvailable}
      />
      <PccExternalSystemsProjectLinksCard
        projectLinks={viewModel.projectLinks}
        cardState={viewModel.cardState}
        isAvailable={isAvailable}
        onOpenAddLinkDrawer={handleOpenDrawer}
        addLinkButtonRef={addLinkButtonRef}
      />
      <PccExternalSystemsReviewQueueCard
        reviewQueue={viewModel.reviewQueue}
        cardState={viewModel.cardState}
        isAvailable={isAvailable}
        selectedReviewItemId={selectedReviewItemId}
        onSelectReviewItem={setSelectedReviewItemId}
      />
      <PccExternalSystemsProcoreConfigurationStatusCard
        viewModel={FIXTURE_PROCORE_SURFACE_VIEW_MODEL}
      />
      <PccExternalSystemsRegistryCard
        registry={viewModel.registry}
        cardState={viewModel.cardState}
        isAvailable={isAvailable}
      />
      <PccExternalSystemsMappingStatusCard
        mappingStatus={viewModel.mappingStatus}
        cardState={viewModel.cardState}
        isAvailable={isAvailable}
        selectedMappingId={selectedMappingId}
        onSelectMapping={setSelectedMappingId}
      />
      <PccExternalSystemsSourceHealthCard
        sourceHealth={viewModel.sourceHealth}
        cardState={viewModel.cardState}
        isAvailable={isAvailable}
      />
      <PccExternalSystemsAuditHistoryCard
        auditHistory={viewModel.auditHistory}
        cardState={viewModel.cardState}
        isAvailable={isAvailable}
      />
      <PccExternalSystemsHbiLineageCard
        hbiLineage={viewModel.hbiLineage}
        cardState={viewModel.cardState}
        isAvailable={isAvailable}
      />
      <PccExternalSystemsAddEditLinkDrawer
        isOpen={drawerOpen}
        onDismiss={handleDismissDrawer}
        returnFocusRef={addLinkButtonRef}
        roleActionVisibility={viewModel.roleActionVisibility}
      />
    </>
  );
};

export default PccExternalSystemsSurface;
