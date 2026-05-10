import { fireEvent } from '@testing-library/react';
import type { PccModuleId, PccPrimaryTabId } from '@hbc/models/pcc';

/**
 * Phase 05 — locate a primary tab button in the registry-driven
 * horizontal navigation.
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
