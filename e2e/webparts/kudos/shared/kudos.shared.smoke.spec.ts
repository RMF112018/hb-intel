/**
 * Phase-16 stress suite — shared-seam group smoke spec.
 * Detailed per-seam specs (cache invalidation, writer contract, people
 * search adapter, workflow enum drift guard, list-host override) land
 * in prompt 07.
 */
import { test } from '@playwright/test';
import { gotoKudosPublic } from '../helpers/kudosHarnessPage';
import { workflowBaseline } from '../fixtures/baseline';
import { matrixTag } from '../helpers/kudosLocators';
import { assertWorkflowEnumLocked } from '../helpers/kudosAssertions';

test.describe('kudos.shared.smoke', () => {
  // Activated phase-16a/04 — dev-harness probe landed in phase-16a/02,
  // 03a-Locator-Coverage-Note § hb-kudos-public-root.

  test(`workflow enum drift guard ${matrixTag('DRIFT', 'P0')}`, async ({ page }) => {
    await gotoKudosPublic(page, workflowBaseline());
    await assertWorkflowEnumLocked(page);
  });
});
