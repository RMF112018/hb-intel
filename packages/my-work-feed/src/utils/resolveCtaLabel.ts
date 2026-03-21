/**
 * resolveCtaLabel — UIF-014: Context-sensitive CTA labels.
 *
 * Single source of truth for work item primary action labels.
 * Replaces generic "Open" with context-aware labels based on
 * item state, class, and module.
 *
 * Resolution priority (first match wins):
 *   1. Blocked items → "Resolve Block"
 *   2. Pending approval → "Approve"
 *   3. Module-specific labels (BD scorecard, health pulse)
 *   4. do-now lane → "Take Action"
 *   5. Fallback → "Open"
 */
import type { IMyWorkItem } from '../types/index.js';

const MODULE_CTA_LABELS: Record<string, string> = {
  'bd-scorecard': 'Review Score',
  'project-hub-health-pulse': 'View Health',
};

export function resolveCtaLabel(item: IMyWorkItem): string {
  // Blocked takes highest priority — user needs to unblock
  if (item.isBlocked) return 'Resolve Block';

  // Pending approval — action is to approve
  if (item.class === 'pending-approval') return 'Approve';

  // Module-specific labels
  const moduleLabel = MODULE_CTA_LABELS[item.context.moduleKey];
  if (moduleLabel) return moduleLabel;

  // do-now lane — active action required
  if (item.lane === 'do-now') return 'Take Action';

  // Default fallback
  return 'Open';
}
