/**
 * HubTertiaryZone — P2-D2 §2: utility zone below Insights in the right panel.
 *
 * ARC-01 / 2-C: Renders tiles via HbcProjectCanvas (replaced direct
 * RecentActivityCard render). Uses separate projectId from secondary zone
 * per P2-D2 Gate 3 zone boundary enforcement (two isolated canvas instances).
 *
 * Hidden at essential tier. All roles have access per P2-D1 §5.
 */
import type { ReactNode } from 'react';
import { useComplexity } from '@hbc/complexity';
import { HbcProjectCanvas } from '@hbc/project-canvas';
import { useCurrentSession } from '@hbc/auth';

export function HubTertiaryZone(): ReactNode {
  const { tier } = useComplexity();
  const session = useCurrentSession();
  const primaryRole = session?.resolvedRoles[0] ?? 'Member';

  if (tier === 'essential') return null;

  // P2-D2 Gate 3: Separate projectId from secondary zone ensures zone isolation.
  return (
    <HbcProjectCanvas
      projectId="my-work-hub-tertiary"
      userId={session?.user?.id ?? ''}
      role={primaryRole}
      complexityTier={tier}
      editable
    />
  );
}
