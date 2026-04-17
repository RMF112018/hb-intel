import * as React from 'react';
import { HbKudos } from '../../hbKudos/HbKudos.js';
import { ZoneErrorBoundary } from '../ZoneErrorBoundary.js';
import type { HbHomepageZoneProps } from '../hbHomepageContract.js';

export function HbKudosZone({
  moduleConfig,
  identity,
  assetBaseUrl,
  getGraphToken,
}: HbHomepageZoneProps): React.JSX.Element {
  return (
    <ZoneErrorBoundary zoneName="hb-kudos">
      <section aria-label="HB Kudos">
        <HbKudos
          config={moduleConfig.hbKudos}
          identity={identity}
          assetBaseUrl={assetBaseUrl}
          getGraphToken={getGraphToken}
        />
      </section>
    </ZoneErrorBoundary>
  );
}
