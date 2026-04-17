import * as React from 'react';
import { HbKudos } from '../../hbKudos/HbKudos.js';
import { ZoneErrorBoundary } from '../ZoneErrorBoundary.js';
import type { HbHomepageZoneProps } from '../hbHomepageContract.js';

export function HbKudosZone({
  config,
  identity,
  assetBaseUrl,
  getGraphToken,
}: HbHomepageZoneProps): React.JSX.Element {
  const zoneConfig = config?.hbKudos as Record<string, unknown> | undefined;

  return (
    <ZoneErrorBoundary zoneName="hb-kudos">
      <section aria-label="HB Kudos">
        <HbKudos
          config={zoneConfig}
          identity={identity}
          assetBaseUrl={assetBaseUrl}
          getGraphToken={getGraphToken}
        />
      </section>
    </ZoneErrorBoundary>
  );
}
