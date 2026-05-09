import { fireEvent } from '@testing-library/react';
import type { PccMvpSurfaceId } from '@hbc/models/pcc';

const PROJECT_HOME_CHILD_IDS: readonly PccMvpSurfaceId[] = [
  'team-and-access',
  'external-systems',
  'control-center-settings',
  'site-health',
];

export function getSurfaceSelectionControl(
  container: HTMLElement,
  surfaceId: PccMvpSurfaceId,
): HTMLButtonElement | null {
  if (!PROJECT_HOME_CHILD_IDS.includes(surfaceId)) {
    return container.querySelector(`[data-pcc-tab-id="${surfaceId}"]`) as HTMLButtonElement | null;
  }
  const childControl = container.querySelector(
    `[data-pcc-surface-nav-child="${surfaceId}"]`,
  ) as HTMLButtonElement | null;
  if (childControl) {
    return childControl;
  }
  const toggle = container.querySelector(
    '[data-pcc-nav-toggle="project-home"]',
  ) as HTMLButtonElement | null;
  if (!toggle) {
    return null;
  }
  fireEvent.click(toggle);
  return container.querySelector(
    `[data-pcc-surface-nav-child="${surfaceId}"]`,
  ) as HTMLButtonElement | null;
}
