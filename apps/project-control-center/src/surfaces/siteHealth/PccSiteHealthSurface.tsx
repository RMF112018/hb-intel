import { Fragment, type FC } from 'react';
import { PccSiteHealthOverviewCard } from './PccSiteHealthOverviewCard';
import { PccSiteHealthChecksCard } from './PccSiteHealthChecksCard';
import { PccSiteHealthDriftCard } from './PccSiteHealthDriftCard';
import { PccSiteHealthRepairRequestsCard } from './PccSiteHealthRepairRequestsCard';

/**
 * Wave 2 / Prompt 06 — Site Health surface.
 *
 * Read-model summary preview. No scanner, repair runner, Graph/PnP probe,
 * tenant probe, backend persistence, or mutation path is introduced.
 * The Repair Requests card is a non-operational placeholder.
 */
export const PccSiteHealthSurface: FC = () => (
  <Fragment>
    <PccSiteHealthOverviewCard />
    <PccSiteHealthChecksCard />
    <PccSiteHealthDriftCard />
    <PccSiteHealthRepairRequestsCard />
  </Fragment>
);

export default PccSiteHealthSurface;
