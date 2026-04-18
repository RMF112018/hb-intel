// =============================================================================
// Entry-stack orchestration seam — shared, production-adjacent
// -----------------------------------------------------------------------------
// Purpose: a single, governance-focused reference point that names the three
// canonical homepage entry-stack stages (hero, actions, first shell lane)
// and ties each of them to the shared entry-stack policy. This seam is
// intentionally NOT a runtime component: it does not merge stages into
// one renderer.
//
// Stage independence vs flagship composition:
//   - Each stage is defined as an independently mountable SPFx webpart so
//     non-flagship hosts (article pages, non-HBCentral pages) can mount
//     any stage on its own through `mount.tsx`.
//   - The flagship HBCentral homepage runtime, however, composes the
//     actions stage as a wrapper-owned React surface embedded inside
//     `HbHomepage` (see `HbHomepageEntryStack`). It is NOT dispatched as
//     a separate SPFx webpart on the flagship page.
//   - The shell remains shell-only; it never becomes a command-band host.
//
// This seam names the canonical stage sequence so both paths — the
// flagship wrapper composition and standalone stage dispatch — can
// point at the same policy and the same budget values without drift.
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
 * Manifest id for the flagship hero webpart. Dispatched standalone on
 * HBCentral and reusable on non-flagship pages.
 */
export const HERO_ENTRY_WEBPART_ID = '28acd6a7-2582-4d8a-86d4-b52bfbeb375c' as const;

/**
 * Manifest id for the standalone priority actions webpart.
 *
 * On the flagship homepage, the actions stage is composed as a wrapper-
 * owned React surface inside `HbHomepage` (see `HbHomepageEntryStack`)
 * and is NOT dispatched through this manifest id. This id remains the
 * authoritative standalone-dispatch id for non-flagship hosts that want
 * the rail as its own webpart.
 */
export const PRIORITY_ACTIONS_ENTRY_WEBPART_ID =
  'b3f07190-79cf-437d-a1d6-ecbf3f77e616' as const;

/**
 * Manifest id for the HB Homepage wrapper/shell webpart. Owns the
 * post-hero runtime: wrapper-owned actions region (embedded rail) and
 * `HbHomepageShell` (first shell lane and beyond).
 */
export const SHELL_ENTRY_WEBPART_ID = HB_HOMEPAGE_WEBPART_ID;

/**
 * Descriptor for a single entry-stack stage. Describes the canonical
 * stage sequence, the standalone SPFx webpart id that can render the
 * stage on its own, and how the stage appears on the flagship homepage
 * runtime. This is a governance artifact, not a runtime composer.
 */
export interface EntryStackSurfaceDescriptor {
  readonly position: EntryStackPosition;
  /**
   * Manifest id used when the stage is dispatched as its own SPFx
   * webpart (non-flagship hosts, or — for the hero and shell — on the
   * flagship page itself).
   */
  readonly webPartId: string;
  readonly surfaceName: string;
  /**
   * How this stage renders on the flagship HBCentral homepage runtime:
   *   - 'standalone-webpart' → dispatched through `mount.tsx` as its
   *     own webpart on the flagship page.
   *   - 'wrapper-embedded' → composed as a React surface inside the
   *     HbHomepage wrapper (no separate webpart dispatch on the
   *     flagship page), while the standalone webpart remains available
   *     for non-flagship hosts.
   */
  readonly flagshipComposition: 'standalone-webpart' | 'wrapper-embedded';
  /**
   * Human-readable explanation of the stage's composition rationale.
   */
  readonly compositionRationale: string;
}

export const ENTRY_STACK_SURFACES: readonly EntryStackSurfaceDescriptor[] = [
  {
    position: 'hero',
    webPartId: HERO_ENTRY_WEBPART_ID,
    surfaceName: 'HbSignatureHero',
    flagshipComposition: 'standalone-webpart',
    compositionRationale:
      'Hero runs as its own SPFx webpart on the flagship page so authors can place it above the shell host, and so article-mode hosts (non-HBCentral) can reuse it without dragging the shell runtime along.',
  },
  {
    position: 'actions',
    webPartId: PRIORITY_ACTIONS_ENTRY_WEBPART_ID,
    surfaceName: 'PriorityActionsRail',
    flagshipComposition: 'wrapper-embedded',
    compositionRationale:
      'On the flagship homepage, the rail is composed as a wrapper-owned React surface inside HbHomepage (see HbHomepageEntryStack). The standalone SPFx webpart remains available so non-flagship hosts can still mount the rail on its own and so the authoring/admin surface can own its list schema without shell coupling.',
  },
  {
    position: 'first-lane',
    webPartId: SHELL_ENTRY_WEBPART_ID,
    surfaceName: 'HbHomepage (wrapper + shell)',
    flagshipComposition: 'standalone-webpart',
    compositionRationale:
      'HbHomepage owns the post-hero runtime: the wrapper-owned actions region and the HbHomepageShell. It is dispatched as its own webpart so authoring the flagship page never requires editing hero or rail internals, and so the shell remains shell-only (never a command-band host).',
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

// -----------------------------------------------------------------------------
// PriorityActionsRail device-class alignment
// -----------------------------------------------------------------------------
// The rail carries its own coarse DeviceClass vocabulary
// ('desktop' | 'laptop' | 'tabletLandscape' | 'tabletPortrait' | 'phone')
// in `homepage/data/priorityActionsNormalization.ts`. That vocabulary is
// author-facing (visibility flags + maxVisible<Device> counts on each item)
// and must remain stable for content authoring. To close the Prompt-04
// gap — no independent breakpoint vocabulary on any entry surface — the
// rail's DeviceClass is explicitly aligned to the shell entry-state id
// set here. Width thresholds on either side are intentionally allowed to
// differ (author budgets vs shell layout); the shared vocabulary is the
// governance anchor.
//
// Type duplicated (not imported) to avoid a feature→shell-adjacent cycle.
// A test in `shell/__tests__/entryStackPolicy.test.ts` guarantees this
// string union matches the rail's exported `DeviceClass`.
// -----------------------------------------------------------------------------

export type PriorityActionsDeviceClass =
  | 'desktop'
  | 'laptop'
  | 'tabletLandscape'
  | 'tabletPortrait'
  | 'phone';

/**
 * Governance alignment: rail `DeviceClass` → shell entry-state id.
 * When multiple shell states collapse onto one device class, the
 * inverse map picks the closest equivalent (see
 * {@link SHELL_ENTRY_STATE_TO_PRIORITY_ACTIONS_DEVICE_CLASS}).
 */
export const PRIORITY_ACTIONS_DEVICE_CLASS_TO_SHELL_STATE: Readonly<
  Record<PriorityActionsDeviceClass, ShellEntryStateId>
> = Object.freeze({
  desktop: 'ultrawide-desktop',
  laptop: 'standard-laptop',
  tabletLandscape: 'tablet-landscape',
  tabletPortrait: 'tablet-portrait',
  phone: 'phone-portrait',
});

/**
 * Governance alignment: shell entry-state id → rail `DeviceClass`.
 * Several shell states collapse onto the same rail class because the
 * rail does not distinguish portrait-large vs portrait, nor ultrawide
 * vs landscape beyond 'desktop'/'laptop'. Phone-landscape is treated
 * as `phone` at the author-facing layer; shell-owned short-height
 * posture is still governed by `entryStackPolicy.shortHeightPosture`.
 */
export const SHELL_ENTRY_STATE_TO_PRIORITY_ACTIONS_DEVICE_CLASS: Readonly<
  Record<ShellEntryStateId, PriorityActionsDeviceClass>
> = Object.freeze({
  'ultrawide-desktop': 'desktop',
  'standard-laptop': 'laptop',
  'tablet-landscape': 'tabletLandscape',
  'tablet-portrait-large': 'tabletPortrait',
  'tablet-portrait': 'tabletPortrait',
  'phone-portrait': 'phone',
  'phone-landscape': 'phone',
});

export function mapPriorityActionsDeviceClassToShellState(
  dc: PriorityActionsDeviceClass,
): ShellEntryStateId {
  return PRIORITY_ACTIONS_DEVICE_CLASS_TO_SHELL_STATE[dc];
}

export function mapShellEntryStateToPriorityActionsDeviceClass(
  id: ShellEntryStateId,
): PriorityActionsDeviceClass {
  return SHELL_ENTRY_STATE_TO_PRIORITY_ACTIONS_DEVICE_CLASS[id];
}

// Re-export sequence so consumers can import everything from a single seam.
export { ENTRY_STACK_SEQUENCE };
export type { EntryStackBudget, EntryStackDeviceClass, EntryStackPosition };
