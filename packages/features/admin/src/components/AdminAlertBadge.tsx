import type { FC } from 'react';
import { HbcStatusBadge, HbcTooltip } from '@hbc/ui-kit';
import type { IAdminAlertBadge } from '../types/IAdminAlertBadge.js';

export interface AdminAlertBadgeProps {
  readonly badge: IAdminAlertBadge;
  readonly onOpenDashboard: () => void;
}

/**
 * Badge component displaying unacknowledged admin alert count with severity indicator.
 *
 * @design D-07, SF17-T05
 */
export const AdminAlertBadge: FC<AdminAlertBadgeProps> = ({ badge, onOpenDashboard }) => {
  if (badge.totalCount === 0) {
    return null;
  }

  const variant = badge.criticalCount > 0 || badge.highCount > 0 ? 'error' : 'warning';

  const tooltipContent = [
    badge.criticalCount > 0 && `Critical: ${badge.criticalCount}`,
    badge.highCount > 0 && `High: ${badge.highCount}`,
    badge.mediumCount > 0 && `Medium: ${badge.mediumCount}`,
    badge.lowCount > 0 && `Low: ${badge.lowCount}`,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <HbcTooltip content={tooltipContent}>
      <div
        role="status"
        aria-label={`${badge.totalCount} admin alert${badge.totalCount === 1 ? '' : 's'}`}
        aria-live="polite"
        onClick={onOpenDashboard}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpenDashboard();
          }
        }}
        tabIndex={0}
        style={{ cursor: 'pointer', display: 'inline-flex' }}
      >
        <HbcStatusBadge variant={variant} label={String(badge.totalCount)} />
      </div>
    </HbcTooltip>
  );
};
