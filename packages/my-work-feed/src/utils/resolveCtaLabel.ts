/**
 * resolveCtaAction / resolveCtaLabel — UIF-007 + UIF-014
 *
 * Single source of truth for work item primary CTA label AND button variant.
 *
 * UIF-007: CTA variant (primary / secondary / ghost / danger) is now
 * differentiated by item lane and status, giving field PMs an immediate
 * action hierarchy without reading item detail.
 *
 * UIF-014: Context-sensitive CTA labels replace the generic "Open" with
 * operationally specific labels based on item state, class, and module.
 *
 * Resolution priority (first match wins):
 *   1. Blocked items        → "Resolve Block"  (danger)
 *   2. Pending approval     → "Approve"         (primary)
 *   3. Module-specific label (inherits lane variant)
 *   4. Lane-based label + variant
 *   5. Fallback             → "Open"            (secondary)
 */
import type { IMyWorkItem } from '../types/index.js';

/**
 * Structural mirror of ButtonVariant from @hbc/ui-kit, kept local so this
 * pure domain utility stays free of UI-library coupling while remaining
 * structurally type-compatible with HbcButton's variant prop.
 */
export type CtaVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface CtaAction {
  label: string;
  variant: CtaVariant;
}

/** Module-specific label overrides. Variant is inherited from lane. */
const MODULE_CTA_LABELS: Record<string, string> = {
  'bd-scorecard':             'Review Score',
  'project-hub-health-pulse': 'View Health',
};

/**
 * Lane-to-CTA mapping.
 *
 * Variant hierarchy:
 *   danger    — immediate remediation required (blocked, escalation)
 *   primary   — primary workflow action (do-now, approvals)
 *   secondary — monitoring / follow-up action (delegated)
 *   secondary — monitoring / follow-up / low-urgency (watch, deferred, delegated, default)
 *
 * UIF-017-addl: watch/deferred/default upgraded from ghost → secondary so all
 * row-level actions have visible button affordance (background fill). Ghost
 * variant was visually indistinguishable from plain text, breaking T04 hierarchy.
 */
function resolveLaneCta(lane: string): CtaAction {
  switch (lane) {
    case 'do-now':         return { label: 'Take Action', variant: 'primary'   };
    case 'waiting-blocked': return { label: 'Escalate',  variant: 'danger'    };
    case 'watch':          return { label: 'View',       variant: 'secondary' };
    case 'delegated-team': return { label: 'Follow Up',  variant: 'secondary' };
    case 'deferred':       return { label: 'Resume',     variant: 'secondary' };
    default:               return { label: 'Open',       variant: 'secondary' };
  }
}

/**
 * Resolves the primary CTA label AND button variant for a work item.
 *
 * Use this in component renderers so both the label and visual style are
 * consistent and sourced from one place.
 */
export function resolveCtaAction(item: IMyWorkItem): CtaAction {
  // 1. Blocked — highest urgency, always red danger
  if (item.isBlocked) return { label: 'Resolve Block', variant: 'danger' };

  // 2. Pending approval — primary workflow action
  if (item.class === 'pending-approval') return { label: 'Approve', variant: 'primary' };

  // 3. Module-specific label override — inherits lane variant for correct hierarchy
  const moduleLabel = MODULE_CTA_LABELS[item.context.moduleKey];
  if (moduleLabel) {
    return { label: moduleLabel, variant: resolveLaneCta(item.lane).variant };
  }

  // 4. Lane-based label + variant
  return resolveLaneCta(item.lane);
}

/**
 * Convenience wrapper that returns only the CTA label.
 * Kept for backward compatibility; prefer resolveCtaAction in new callers.
 */
export function resolveCtaLabel(item: IMyWorkItem): string {
  return resolveCtaAction(item).label;
}
