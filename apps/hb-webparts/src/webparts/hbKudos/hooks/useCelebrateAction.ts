/**
 * useCelebrateAction — celebrate mutation hook.
 *
 * Owns the single concern of incrementing the celebrate count on a
 * kudos entry via the governance writer and refreshing the data
 * source after the write. Pinned loading state prevents double-taps
 * while the write is in flight.
 */
import * as React from 'react';
import { submitKudosGovernanceAction } from '../../../homepage/data/kudosGovernanceWriter.js';
import { getKudosListHostUrl } from '../../../homepage/data/spContext.js';
import type { KudosEntry } from '../../../homepage/webparts/kudosContracts.js';

export interface UseCelebrateActionOptions {
  actorEmail?: string;
  onRefresh: () => void;
}

export interface UseCelebrateActionResult {
  celebrating: boolean;
  celebrate: (kudosId: string, entries: KudosEntry[]) => void;
}

export function useCelebrateAction({
  actorEmail,
  onRefresh,
}: UseCelebrateActionOptions): UseCelebrateActionResult {
  const [celebrating, setCelebrating] = React.useState(false);

  const celebrate = React.useCallback(
    (kudosId: string, entries: KudosEntry[]): void => {
      const entry = entries.find((e) => e.id === kudosId);
      if (!entry || celebrating) return;
      const siteUrl = getKudosListHostUrl();
      if (!siteUrl) return;
      setCelebrating(true);
      const current = entry.celebrateCount ?? 0;
      void submitKudosGovernanceAction(
        siteUrl,
        { kind: 'celebrate', kudosId: entry.id, nextCount: current + 1 },
        { actorEmail },
      )
        .then(() => onRefresh())
        .finally(() => setCelebrating(false));
    },
    [celebrating, actorEmail, onRefresh],
  );

  return { celebrating, celebrate };
}
