/**
 * KudosFeedPanel — "View all recognition" feed flyout.
 *
 * Extracted from HbKudos.tsx (phase-19 Wave 2). Composes the flyout
 * shell (HbcKudosComposerFlyout) over KudosFeedBody so the top-level
 * runtime does not own the shell wiring. Feed entries combine the
 * current public kudos with any archive entries not already in the
 * public list, preserving the prior in-file behavior.
 */
import * as React from 'react';
import { HbcKudosComposerFlyout } from '@hbc/ui-kit/homepage';
import { KudosFeedBody } from './KudosFeedBody.js';
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
    <HbcKudosComposerFlyout
      open={open}
      onClose={onClose}
      title="HB Kudos"
      subtitle="All recognition across the company"
      primaryAction={{ label: 'Close', onClick: onClose }}
    >
      <div data-hbc-testid="hb-kudos-view-all-panel">
        <KudosFeedBody entries={entries} onOpenDetail={onOpenDetail} />
      </div>
    </HbcKudosComposerFlyout>
  );
}
