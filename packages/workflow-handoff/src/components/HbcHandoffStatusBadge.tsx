import { useComplexity } from '@hbc/complexity';
import type { HandoffStatus } from '../types/IWorkflowHandoff';
import {
  handoffStatusLabel,
  handoffStatusColorClass,
} from '../constants/handoffDefaults';

export interface HbcHandoffStatusBadgeProps {
  /** The handoff ID — used to find the package for the timestamp (Expert mode, D-08) */
  handoffId: string | null;
  /** Current handoff status */
  status: HandoffStatus | null;
  /** ISO 8601 of the most recent status transition — displayed in Expert mode (D-08) */
  lastUpdatedAt?: string | null;
  /** Force a complexity variant */
  forceVariant?: 'standard' | 'expert';
}

/**
 * Passive status indicator shown on the source record after a handoff is sent.
 *
 * Complexity gating (D-08):
 * - Essential: hidden (returns null)
 * - Standard: badge label only
 * - Expert: badge label + last-update timestamp
 *
 * Returns null when status is null (no handoff initiated).
 */
export function HbcHandoffStatusBadge({
  handoffId,
  status,
  lastUpdatedAt,
  forceVariant,
}: HbcHandoffStatusBadgeProps) {
  const { tier: contextVariant } = useComplexity();
  const variant = forceVariant ?? contextVariant;

  // Essential mode: hidden (D-08)
  if (variant === 'essential') return null;

  // No handoff initiated
  if (!status) return null;

  const label = handoffStatusLabel[status];
  const colorClass = handoffStatusColorClass[status];

  return (
    <div
      className={`hbc-handoff-status-badge hbc-handoff-status-badge--${colorClass}`}
      aria-label={label}
      data-handoff-id={handoffId}
      data-status={status}
    >
      <span className="hbc-handoff-status-badge__label">{label}</span>

      {/* Expert mode: last-update timestamp (D-08) */}
      {variant === 'expert' && lastUpdatedAt && (
        <time
          className="hbc-handoff-status-badge__timestamp"
          dateTime={lastUpdatedAt}
          title={new Date(lastUpdatedAt).toLocaleString()}
        >
          {new Date(lastUpdatedAt).toLocaleDateString()}
        </time>
      )}
    </div>
  );
}
