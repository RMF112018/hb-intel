import type { IPriorityAction } from '@hbc/models/pcc';

/**
 * Wave 2 / Prompt 05 — shared types and helpers for the Project Home
 * bento dashboard cards.
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

export interface PccProjectHomeCardProps {
  /** Default `'preview'`. Test override or future Wave 3 wiring may set
   *  alternate states. */
  state?: PccCardState;
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
