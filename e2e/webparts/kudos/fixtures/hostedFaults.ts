/**
 * Fault-injection fixtures for hosted-runtime adversarial paths.
 *
 * Each fault toggles a writer-seam behavior the suite must prove the UI
 * handles gracefully. Applied via `setHostedFault(page, fault)` which
 * writes to `window.__hbKudosHostedFault` consumed by the harness's
 * simulated `submitKudosGovernanceAction()`.
 */
import type { Page } from '@playwright/test';

export type HostedFault =
  | 'none'
  | 'stale-after-action' // cache not invalidated; next read returns pre-mutation shape
  | 'pin-slot-collision' // writer denies because pin slot is full
  | 'feature-slot-collision' // writer denies because feature slot is full
  | 'role-capability-denied' // current user lacks capability for this action
  | 'list-item-not-found' // target item was concurrently deleted
  | 'audit-write-failure' // mutation ok, audit write fails
  | 'patch-rejected-etag'; // etag mismatch -> 412

export interface StaleAfterActionProbe {
  invalidated: boolean;
}

export async function setHostedFault(page: Page, fault: HostedFault): Promise<void> {
  await page.evaluate((f) => {
    const w = window as unknown as { __hbKudosHostedFault?: string };
    w.__hbKudosHostedFault = f;
  }, fault);
}

export async function clearHostedFault(page: Page): Promise<void> {
  await setHostedFault(page, 'none');
}
