import * as React from 'react';
import { LeadershipMessage } from '../../leadershipMessage/LeadershipMessage.js';
import { ZoneErrorBoundary } from '../ZoneErrorBoundary.js';
import type { HbHomepageZoneProps } from '../hbHomepageContract.js';

export function LeadershipMessageZone({ moduleConfig }: HbHomepageZoneProps): React.JSX.Element {
  return (
    <ZoneErrorBoundary zoneName="leadership-message">
      <section aria-label="Leadership Message">
        <LeadershipMessage config={moduleConfig.leadershipMessage} />
      </section>
    </ZoneErrorBoundary>
  );
}
