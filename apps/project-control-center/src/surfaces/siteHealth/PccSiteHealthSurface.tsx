import { Fragment, type FC } from 'react';
import { FIXTURE_PROCORE_SURFACE_VIEW_MODEL } from '../../viewModels/procoreSurfaceFixture';
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
 *
 * Wave 15A wave-b9 Prompt 4B-08 — `PccSiteHealthOverviewCard` was
 * removed because the shell hero already carries selected-tab identity,
 * `Drift and repair signals` / `Repair Posture: Managed through
 * SharePoint admin tooling` heroHighlights, and `Read-only preview`
 * governance microcopy after Prompt 4B-02. The four operational
 * overview metrics (Overall severity / Failing / Warnings / Last run)
 * were ABSORBED into `PccSiteHealthChecksCard` body via a compact
 * summary row at the top, reusing the existing
 * `data-pcc-site-health-overall|failing|warning|last-run` markers.
 * Site Health moved from `SURFACES_WITH_COMPATIBILITY_CARD` →
 * `SURFACES_WITH_SHELL_ONLY_PANEL`; the shell `<main role="tabpanel">`
 * is the sole carrier of `data-pcc-active-surface-panel="site-health"`.
 */
export const PccSiteHealthSurface: FC = () => (
  <Fragment>
    <PccSiteHealthChecksCard />
    <PccSiteHealthDriftCard />
    <PccSiteHealthRepairRequestsCard />
    <PccSiteHealthProcoreSyncRepairCard viewModel={FIXTURE_PROCORE_SURFACE_VIEW_MODEL} />
  </Fragment>
);

export default PccSiteHealthSurface;
