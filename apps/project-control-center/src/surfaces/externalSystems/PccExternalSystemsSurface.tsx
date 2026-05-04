import { Fragment, type FC } from 'react';
import { EXTERNAL_SYSTEM_IDS } from '@hbc/models/pcc';
import { FIXTURE_PROCORE_SURFACE_VIEW_MODEL } from '../../viewModels/procoreSurfaceFixture';
import { PccExternalSystemsHeaderCard } from './PccExternalSystemsHeaderCard';
import { PccExternalSystemsProcoreConfigurationStatusCard } from './PccExternalSystemsProcoreConfigurationStatusCard';
import { PccExternalSystemTile } from './PccExternalSystemTile';

/**
 * Wave 2 / Prompt 06 — External Systems surface.
 *
 * Renders the header card + one tile per `ExternalSystemId`. Each tile
 * resolves its own state (`configured` / `missing` / `unavailable-fixture`)
 * from `SAMPLE_EXTERNAL_SYSTEM_LINKS` and
 * `SAMPLE_EXTERNAL_SYSTEM_MISSING_CONFIGS`. No live API calls, no
 * `<a href>` launch behavior.
 *
 * Wave 13 Prompt 13E — adds a dedicated Procore configuration & status
 * card driven by the shared Procore surface view-model. Display-only;
 * no Procore SDK, no Procore link, no enabled mutation.
 */
export const PccExternalSystemsSurface: FC = () => (
  <Fragment>
    <PccExternalSystemsHeaderCard />
    {EXTERNAL_SYSTEM_IDS.map((id) => (
      <PccExternalSystemTile key={id} systemId={id} />
    ))}
    <PccExternalSystemsProcoreConfigurationStatusCard
      viewModel={FIXTURE_PROCORE_SURFACE_VIEW_MODEL}
    />
  </Fragment>
);

export default PccExternalSystemsSurface;
