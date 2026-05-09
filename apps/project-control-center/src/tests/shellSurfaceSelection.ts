import { fireEvent } from '@testing-library/react';
import type { PccModuleId, PccMvpSurfaceId, PccPrimaryTabId } from '@hbc/models/pcc';

/**
 * Phase 05 wave-b10 Prompt 03 — temporary compatibility bridge for the
 * legacy `getSurfaceSelectionControl` helper. Existing surface tests
 * iterate `PCC_MVP_SURFACE_IDS` and call this helper to navigate by
 * tab click. The Phase 05 navigation no longer renders most legacy
 * surface ids as primary tabs — half are now modules under various
 * primary tabs. This map routes each legacy id to the Phase 05 control
 * that, when clicked, drives `usePccShellState.setActiveSurface(id)`
 * via the bridge wired in `PccApp` → `PccShell` → `PccHorizontalTabs`.
 *
 * Removed when Prompt 04 retires the legacy surface id from the
 * runtime path and the surface tests migrate to Phase 05 patterns.
 */
type LegacyControlMapping =
  | { kind: 'primary'; tabId: PccPrimaryTabId }
  | { kind: 'module'; moduleId: PccModuleId; parentTabId: PccPrimaryTabId };

const LEGACY_TO_PHASE05_NAV: Record<PccMvpSurfaceId, LegacyControlMapping> = {
  'project-home': { kind: 'primary', tabId: 'project-home' },
  documents: { kind: 'primary', tabId: 'documents' },
  'team-and-access': {
    kind: 'module',
    moduleId: 'team-access',
    parentTabId: 'core-tools',
  },
  'external-systems': {
    kind: 'module',
    moduleId: 'external-platforms',
    parentTabId: 'core-tools',
  },
  'control-center-settings': {
    kind: 'module',
    moduleId: 'control-center-settings',
    parentTabId: 'systems-administration',
  },
  'site-health': {
    kind: 'module',
    moduleId: 'site-health',
    parentTabId: 'systems-administration',
  },
  approvals: {
    kind: 'module',
    moduleId: 'approvals-checkpoints',
    parentTabId: 'core-tools',
  },
  'project-readiness': {
    kind: 'module',
    moduleId: 'startup-center',
    parentTabId: 'startup-closeout',
  },
};

export function getSurfaceSelectionControl(
  container: HTMLElement,
  surfaceId: PccMvpSurfaceId,
): HTMLButtonElement | null {
  const mapping = LEGACY_TO_PHASE05_NAV[surfaceId];
  if (!mapping) {
    return null;
  }
  if (mapping.kind === 'primary') {
    return container.querySelector(
      `[data-pcc-tab-id="${mapping.tabId}"]`,
    ) as HTMLButtonElement | null;
  }
  // module — open the parent dropdown if not already open, then return
  // the module item button.
  const existingMenu = container.querySelector(`[data-pcc-module-menu="${mapping.parentTabId}"]`);
  if (!existingMenu) {
    const toggle = container.querySelector(
      `[data-pcc-nav-toggle="${mapping.parentTabId}"]`,
    ) as HTMLButtonElement | null;
    if (!toggle) {
      return null;
    }
    fireEvent.click(toggle);
  }
  return container.querySelector(
    `[data-pcc-module-nav-item="${mapping.moduleId}"]`,
  ) as HTMLButtonElement | null;
}

/**
 * Phase 05 wave-b10 Prompt 03 — locate a primary tab button in the
 * registry-driven horizontal navigation.
 */
export function getPrimaryTabSelectionControl(
  container: HTMLElement,
  id: PccPrimaryTabId,
): HTMLButtonElement | null {
  return container.querySelector(
    `[data-pcc-horizontal-tabs] [data-pcc-tab-id="${id}"]`,
  ) as HTMLButtonElement | null;
}

/**
 * Phase 05 — locate a primary tab's dropdown toggle.
 */
export function getPrimaryNavToggle(
  container: HTMLElement,
  id: PccPrimaryTabId,
): HTMLButtonElement | null {
  return container.querySelector(
    `[data-pcc-horizontal-tabs] [data-pcc-nav-toggle="${id}"]`,
  ) as HTMLButtonElement | null;
}

/**
 * Phase 05 — open the module dropdown for a primary tab via its toggle
 * button. Returns the menu element, or null when the toggle is missing.
 * Idempotent: if the menu is already open, no toggle click is dispatched.
 */
export function openPrimaryModuleMenu(
  container: HTMLElement,
  id: PccPrimaryTabId,
): HTMLElement | null {
  const existingMenu = container.querySelector(
    `[data-pcc-module-menu="${id}"]`,
  ) as HTMLElement | null;
  if (existingMenu) {
    return existingMenu;
  }
  const toggle = getPrimaryNavToggle(container, id);
  if (!toggle) {
    return null;
  }
  fireEvent.click(toggle);
  return container.querySelector(`[data-pcc-module-menu="${id}"]`) as HTMLElement | null;
}

/**
 * Phase 05 — locate a module item in any currently open module menu.
 */
export function getModuleSelectionControl(
  container: HTMLElement,
  id: PccModuleId,
): HTMLButtonElement | null {
  return container.querySelector(`[data-pcc-module-nav-item="${id}"]`) as HTMLButtonElement | null;
}
