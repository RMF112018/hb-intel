/**
 * KudosFeedPanel — "View all recognition" feed flyout.
 *
 * Phase-27 Prompt-04 closure: uses the new `KudosFeedShell` instead
 * of the composer flyout. The feed shell gives the list a
 * full-width dense-scan body (no reading-width constraint) so the
 * browse surface stops borrowing composer-oriented layout rules.
 *
 * Feed entries combine the current public kudos with any archive
 * entries not already in the public list, preserving the prior
 * in-file behavior.
 */
import * as React from 'react';
import { KudosFeedBody } from './KudosFeedBody.js';
import { KudosFeedShell } from '../../homepage/shared/kudosShells.js';
import { sortByRecency } from './hooks/kudosFeatured.js';
import type { KudosEntry } from '../../homepage/webparts/kudosContracts.js';

export interface KudosFeedPanelProps {
  open: boolean;
  publicKudos: KudosEntry[];
  archiveKudos: KudosEntry[];
  hydrate: (entries: KudosEntry[]) => KudosEntry[];
  onClose: () => void;
  onOpenDetail: (entry: KudosEntry) => void;
}

export function KudosFeedPanel({
  open,
  publicKudos,
  archiveKudos,
  hydrate,
  onClose,
  onOpenDetail,
}: KudosFeedPanelProps): React.JSX.Element {
  const entries = React.useMemo(
    () =>
      hydrate([
        ...sortByRecency(publicKudos),
        ...archiveKudos.filter((a) => !publicKudos.some((p) => p.id === a.id)),
      ]),
    [publicKudos, archiveKudos, hydrate],
  );

  return (
    <KudosFeedShell
      open={open}
      onClose={onClose}
      title="HB Kudos"
      subtitle="All recognition across the company"
      testId="hb-kudos-view-all-panel"
      ariaLabel="All HB Kudos recognition"
    >
      <KudosFeedBody entries={entries} onOpenDetail={onOpenDetail} />
    </KudosFeedShell>
  );
}
