/**
 * HubTertiaryZone — P2-D2 §2: utility zone below Insights in the right panel.
 *
 * UIF-050-addl: Simplified to render RecentActivityCard directly. The old
 * canvas tile indirection (MyWorkCanvas with two utility tiles) was removed
 * because QuickActionsMenu moved to the desktop tab-row strip (UIF-048-addl)
 * and mobile bottom sheet (UIF-049-addl). The tertiary zone now contains
 * only the Recent Activity card.
 *
 * Hidden at essential tier. All roles have access per P2-D1 §5.
 */
import type { ReactNode } from 'react';
import { useComplexity } from '@hbc/complexity';
import { RecentActivityCard } from './cards/RecentActivityCard.js';

export function HubTertiaryZone(): ReactNode {
  const { tier } = useComplexity();

  if (tier === 'essential') return null;

  return <RecentActivityCard />;
}
