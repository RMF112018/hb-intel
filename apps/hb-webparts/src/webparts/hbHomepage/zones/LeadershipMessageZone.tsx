import * as React from 'react';
import { LeadershipMessage } from '../../leadershipMessage/LeadershipMessage.js';
import { ZoneErrorBoundary } from '../ZoneErrorBoundary.js';
import type { HbHomepageZoneProps } from '../hbHomepageContract.js';
import { normalizeLeadershipMessageConfig } from '../../../homepage/helpers/communicationsConfig.js';
import { useReportOccupantContentState } from '../shell/occupantContentState.js';
import type { OccupantContentStateReport } from '../shell/occupantContentState.js';

function buildLeadershipMessageReport(
  config: unknown,
): OccupantContentStateReport {
  const normalized = normalizeLeadershipMessageConfig(config as Record<string, unknown> | undefined);
  const featuredCount = normalized.featured ? 1 : 0;
  const secondaryCount = normalized.secondary.length;
  const itemCount = featuredCount + secondaryCount;

  if (itemCount === 0) {
    return {
      occupantId: 'leadership-message',
      kind: 'empty',
      summary: 'no-entries',
      itemCount: 0,
      reportedAt: Date.now(),
    };
  }

  const kind = featuredCount > 0 ? 'strong' : 'low-signal';
  return {
    occupantId: 'leadership-message',
    kind,
    summary: `featured=${featuredCount} secondary=${secondaryCount}`,
    itemCount,
    reportedAt: Date.now(),
  };
}

export function LeadershipMessageZone({ moduleConfig }: HbHomepageZoneProps): React.JSX.Element {
  const report = React.useMemo(
    () => buildLeadershipMessageReport(moduleConfig.leadershipMessage),
    [moduleConfig.leadershipMessage],
  );
  useReportOccupantContentState(report);

  return (
    <ZoneErrorBoundary zoneName="leadership-message">
      <section aria-label="Leadership Message">
        <LeadershipMessage config={moduleConfig.leadershipMessage} />
      </section>
    </ZoneErrorBoundary>
  );
}
