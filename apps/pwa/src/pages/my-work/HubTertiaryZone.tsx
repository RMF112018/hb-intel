/**
 * HubTertiaryZone — P2-D2 §2: utility zone below Insights in the right panel.
 *
 * ARC-01 / 2-C: Renders tiles via HbcProjectCanvas (replaced direct
 * RecentActivityCard render). Uses separate projectId from secondary zone
 * per P2-D2 Gate 3 zone boundary enforcement (two isolated canvas instances).
 *
 * ADR-0118: Tertiary zone is reserved for hub:recent-context only.
 * editable={false} is intentional — P2-D2 §5.3 EditMode superseded for this zone.
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

  // P2-D2 Gate 3: Separate projectId + tertiary role key for zone isolation.
  // ADR-0118: Tertiary zone reserved for Recent Activity only; editable={false} intentional.
  return (
    <HbcProjectCanvas
      projectId="my-work-hub-tertiary"
      userId={session?.user?.id ?? ''}
      role={`${primaryRole}:tertiary`}
      complexityTier={tier}
      editable={false}
      title=""
    />
  );
}
