import type { IPriorityAction, PccModuleId } from '@hbc/models/pcc';
import type { PccCardSpanOverrides } from '../../layout/footprints';

/**
 * Wave 2 / Prompt 05 — shared types and helpers for the Project Home
 * bento dashboard cards.
 *
 * Phase 06 Prompt 02 extension: every Project Home operational card
 * accepts `spanOverrides` (forwarded to `PccDashboardCard`), `gateway`
 * (rendered through the existing `action` slot via
 * `PccProjectHomeGatewayAction`), and `onSelectModule` (callback that
 * fires `shell.selectModule` when a gateway is clicked).
 */

export type PccCardState =
  | 'preview'
  | 'empty'
  | 'missing-config'
  | 'unavailable-fixture'
  | 'error'
  | 'unauthorized-persona';

export const PCC_CARD_STATES: readonly PccCardState[] = [
  'preview',
  'empty',
  'missing-config',
  'unavailable-fixture',
  'error',
  'unauthorized-persona',
] as const;

export interface PccProjectHomeGatewayConfig {
  readonly label: string;
  readonly moduleId?: PccModuleId;
  readonly disabledReason?: string;
}

export interface PccProjectHomeCardProps {
  /** Default `'preview'`. Test override or future Wave 3 wiring may set
   *  alternate states. */
  state?: PccCardState;
  /** Phase 06 Prompt 02 — per-card span override matrix forwarded to
   *  `PccDashboardCard.spanOverrides`. */
  spanOverrides?: PccCardSpanOverrides;
  /** Phase 06 Prompt 02 — gateway action config rendered through
   *  `PccDashboardCard.action`. */
  gateway?: PccProjectHomeGatewayConfig;
  /** Phase 06 Prompt 02 — callback invoked when an enabled gateway is
   *  clicked; expected to be `shell.selectModule`. */
  onSelectModule?: (moduleId: PccModuleId) => void;
}

export type PccPriorityTone = 'high' | 'medium' | 'low';

/**
 * Presentation-only tone derivation for `IPriorityAction`. NOT a record
 * field. `IPriorityAction` does not have a `priority` field; tone is
 * derived from the existing record-backed `severity` value.
 *
 *   Blocking | Security Risk | Repair Required → 'high'
 *   Warning                                    → 'medium'
 *   Info                                       → 'low'
 *   undefined                                  → 'medium'
 */
export function priorityToneForAction(action: IPriorityAction): PccPriorityTone {
  switch (action.severity) {
    case 'Blocking':
    case 'Security Risk':
    case 'Repair Required':
      return 'high';
    case 'Warning':
      return 'medium';
    case 'Info':
      return 'low';
    case undefined:
    default:
      return 'medium';
  }
}
