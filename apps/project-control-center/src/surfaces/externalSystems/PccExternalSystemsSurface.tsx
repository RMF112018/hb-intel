import { Fragment, type FC } from 'react';
import { EXTERNAL_SYSTEM_IDS } from '@hbc/models/pcc';
import { PccExternalSystemsHeaderCard } from './PccExternalSystemsHeaderCard';
import { PccExternalSystemTile } from './PccExternalSystemTile';

/**
 * Wave 2 / Prompt 06 — External Systems surface.
 *
 * Renders the header card + one tile per `ExternalSystemId`. Each tile
 * resolves its own state (`configured` / `missing` / `unavailable-fixture`)
 * from `SAMPLE_EXTERNAL_SYSTEM_LINKS` and
 * `SAMPLE_EXTERNAL_SYSTEM_MISSING_CONFIGS`. No live API calls, no
 * `<a href>` launch behavior.
 */
export const PccExternalSystemsSurface: FC = () => (
  <Fragment>
    <PccExternalSystemsHeaderCard />
    {EXTERNAL_SYSTEM_IDS.map((id) => (
      <PccExternalSystemTile key={id} systemId={id} />
    ))}
  </Fragment>
);

export default PccExternalSystemsSurface;
