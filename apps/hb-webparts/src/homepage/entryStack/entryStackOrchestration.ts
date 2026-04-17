// =============================================================================
// Entry-stack orchestration seam — shared, production-adjacent
// -----------------------------------------------------------------------------
// Purpose: a single, governance-focused reference point that names the three
// independently mounted homepage entry surfaces and ties each of them to the
// shared entry-stack policy. This seam is intentionally NOT a runtime
// component: it does not merge hero, actions, and shell into one renderer.
// SPFx hosts them as separate webparts at separate seams in `mount.tsx`.
//
// What this seam guarantees:
//   - production (`mount.tsx`) and the reference composition
//     (`homepage/ReferenceHomepageComposition.tsx`) can both point to the
//     SAME entry-stack policy and the SAME canonical surface sequence.
//   - a future unified entry-stack governance layer (a control panel, a
//     policy inspector, a harness) can consume this seam without having to
//     walk the webpart registry or reproduce doctrine.
//   - drift between the production dispatch path and the reference
//     composition path is detectable because both reference this module.
//
// Related governance artifacts:
//   - `src/homepage/entryStack/entryStackContract.ts` — canonical budget
//     values (hero height, actions budget, gaps, first-lane columns).
//   - `src/webparts/hbHomepage/shell/entryStackPolicy.ts` — the shell-facing
//     policy mirror used by the shell orchestrator itself. The shell-facing
//     policy uses `ShellEntryStateId` names; this seam uses
//     `EntryStackDeviceClass`. The two enums are semantically aligned
//     (see `SHELL_ENTRY_STATE_TO_DEVICE_CLASS` below).
//   - `docs/reference/shell/HB-Shell-Entry-Breakpoint-Spec.md` — spec.
// =============================================================================

import { HB_HOMEPAGE_WEBPART_ID } from '../../webparts/hbHomepage/hbHomepageContract.js';
import type { ShellEntryStateId } from '../../webparts/hbHomepage/shell/shellTypes.js';
import {
  ENTRY_STACK_SEQUENCE,
  type EntryStackBudget,
  type EntryStackDeviceClass,
  type EntryStackPosition,
  resolveEntryStackBudget,
} from './entryStackContract.js';

/**
 * Manifest id for the independently mounted flagship hero webpart.
 * Centralized here so `mount.tsx` and any future control surface
 * reference the same literal.
 */
export const HERO_ENTRY_WEBPART_ID = '28acd6a7-2582-4d8a-86d4-b52bfbeb375c' as const;

/**
 * Manifest id for the independently mounted priority actions webpart.
 */
export const PRIORITY_ACTIONS_ENTRY_WEBPART_ID =
  'b3f07190-79cf-437d-a1d6-ecbf3f77e616' as const;

/**
 * Manifest id for the HB Homepage shell (first-lane owner).
 * Re-exported for alignment with the other two entry surfaces — new
 * consumers should prefer this alias when the context is "the shell's
 * role in the entry stack" rather than "the shell itself."
 */
export const SHELL_ENTRY_WEBPART_ID = HB_HOMEPAGE_WEBPART_ID;

/**
 * Descriptor for a single independently mounted entry-stack surface.
 * The shell does not render these — SPFx does. This descriptor is a
 * governance artifact only.
 */
export interface EntryStackSurfaceDescriptor {
  readonly position: EntryStackPosition;
  readonly webPartId: string;
  readonly surfaceName: string;
  /**
   * Human-readable explanation of why this surface remains mounted
   * independently rather than composed into one runtime component.
   */
  readonly independenceRationale: string;
}

export const ENTRY_STACK_SURFACES: readonly EntryStackSurfaceDescriptor[] = [
  {
    position: 'hero',
    webPartId: HERO_ENTRY_WEBPART_ID,
    surfaceName: 'HbSignatureHero',
    independenceRationale:
      'Hero runs as its own SPFx webpart so authors can place it above or outside the shell host, and so article-mode hosts (non-HBCentral) can reuse it without dragging the shell runtime along.',
  },
  {
    position: 'actions',
    webPartId: PRIORITY_ACTIONS_ENTRY_WEBPART_ID,
    surfaceName: 'PriorityActionsRail',
    independenceRationale:
      'Priority actions runs as its own SPFx webpart so authors may place it on non-HBCentral pages and so its authoring/admin surface can own its list schema without shell coupling.',
  },
  {
    position: 'first-lane',
    webPartId: SHELL_ENTRY_WEBPART_ID,
    surfaceName: 'HbHomepage (shell)',
    independenceRationale:
      'The shell owns everything after the hero and actions. It remains a separate webpart so that authoring the flagship page never requires editing hero or actions internals.',
  },
] as const;

/**
 * Alignment map: shell-facing entry-state ids → production-adjacent
 * device classes. Used when code on either side of the seam needs to
 * consume the shared budget model. Tablet-landscape and the fine-grained
 * phone/tablet-portrait splits differ in naming; the shell collapses two
 * pairs (phone portrait large vs standard, tablet portrait large vs
 * tablet portrait) onto the same policy values, so the map uses the
 * closest equivalent device class.
 */
export const SHELL_ENTRY_STATE_TO_DEVICE_CLASS: Readonly<
  Record<ShellEntryStateId, EntryStackDeviceClass>
> = Object.freeze({
  'ultrawide-desktop': 'ultrawide-desktop',
  'standard-laptop': 'standard-laptop',
  'tablet-landscape': 'tablet-landscape',
  'tablet-portrait-large': 'tablet-portrait',
  'tablet-portrait': 'tablet-portrait',
  'phone-portrait': 'phone-portrait-standard',
  'phone-landscape': 'phone-landscape',
});

/**
 * Resolve the production-adjacent entry-stack budget for a given
 * shell-facing entry-state id. This is the one helper that lets the
 * shell, the hero webpart, the priority-actions webpart, and the
 * reference composition all consume the SAME budget values without
 * duplicating policy lookups.
 */
export function getEntryStackBudgetForShellState(
  id: ShellEntryStateId,
): EntryStackBudget {
  const deviceClass = SHELL_ENTRY_STATE_TO_DEVICE_CLASS[id];
  // entryStackContract guarantees a budget for every declared device
  // class, so this is a total lookup by construction.
  const budget = resolveEntryStackBudget({ width: deviceClassApproxWidth(deviceClass) });
  return budget.deviceClass === deviceClass ? budget : budget;
}

/**
 * Internal: approximate width used only to route into
 * `resolveEntryStackBudget` by device-class. Centralized so future
 * updates to the device-class → width mapping stay in one place.
 */
function deviceClassApproxWidth(dc: EntryStackDeviceClass): number {
  switch (dc) {
    case 'ultrawide-desktop':
      return 1800;
    case 'standard-laptop':
      return 1300;
    case 'tablet-landscape':
      return 1050;
    case 'tablet-portrait':
      return 800;
    case 'phone-portrait-large':
      return 420;
    case 'phone-portrait-standard':
      return 390;
    case 'phone-landscape':
      return 600;
    default: {
      const _exhaustive: never = dc;
      return _exhaustive;
    }
  }
}

// Re-export sequence so consumers can import everything from a single seam.
export { ENTRY_STACK_SEQUENCE };
export type { EntryStackBudget, EntryStackDeviceClass, EntryStackPosition };
