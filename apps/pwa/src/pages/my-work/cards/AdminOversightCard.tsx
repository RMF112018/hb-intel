/**
 * AdminOversightCard — P2-D1 §6: Administrator-only.
 * Admin oversight metrics (placeholder for first release).
 */
import type { ReactNode } from 'react';
import { HbcCard } from '@hbc/ui-kit';
import { RoleGate } from '@hbc/auth';

export function AdminOversightCard(): ReactNode {
  return (
    <RoleGate requiredRole="Administrator">
      <HbcCard weight="supporting" header={<span>Admin Oversight</span>}>
        <p>System-wide oversight metrics and escalation queues will appear here.</p>
      </HbcCard>
    </RoleGate>
  );
}
