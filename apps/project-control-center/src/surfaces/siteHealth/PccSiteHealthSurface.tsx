import { Fragment, type FC } from 'react';
import { FIXTURE_PROCORE_SURFACE_VIEW_MODEL } from '../../viewModels/procoreSurfaceFixture';
import { PccSiteHealthOverviewCard } from './PccSiteHealthOverviewCard';
import { PccSiteHealthChecksCard } from './PccSiteHealthChecksCard';
import { PccSiteHealthDriftCard } from './PccSiteHealthDriftCard';
import { PccSiteHealthProcoreSyncRepairCard } from './PccSiteHealthProcoreSyncRepairCard';
import { PccSiteHealthRepairRequestsCard } from './PccSiteHealthRepairRequestsCard';

/**
 * Wave 2 / Prompt 06 — Site Health surface.
 *
 * Read-model summary preview. No scanner, repair runner, Graph/PnP probe,
 * tenant probe, backend persistence, or mutation path is introduced.
 * The Repair Requests card is a non-operational placeholder.
 *
 * Wave 13 Prompt 13E — adds a Procore sync & repair posture card driven
 * by the shared Procore surface view-model. Display-only; no live SDK,
 * no repair execution.
 */
export const PccSiteHealthSurface: FC = () => (
  <Fragment>
    <PccSiteHealthOverviewCard />
    <PccSiteHealthChecksCard />
    <PccSiteHealthDriftCard />
    <PccSiteHealthRepairRequestsCard />
    <PccSiteHealthProcoreSyncRepairCard viewModel={FIXTURE_PROCORE_SURFACE_VIEW_MODEL} />
  </Fragment>
);

export default PccSiteHealthSurface;
