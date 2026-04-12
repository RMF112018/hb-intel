/**
 * Phase-16 stress suite — public webpart group smoke spec.
 *
 * This spec anchors the `e2e/webparts/kudos/public/` group against the
 * harness architecture defined in 10-Harness-Architecture.md. Detailed
 * per-matrix specs land in prompt 05.
 *
 * Preconditions (see harness doc §Prerequisites):
 *   - dev-harness tab `?tab=kudos` is mounted
 *   - `window.__hbKudosSeed` seed hook is attached
 *
 * Until both are present, this smoke runs as `fixme` so CI does not
 * report a false red while the harness wiring lands.
 */
import { test, expect } from '@playwright/test';
import { gotoKudosPublic } from '../helpers/kudosHarnessPage';
import { workflowBaseline } from '../fixtures/baseline';
import { matrixTag } from '../helpers/kudosLocators';
import { assertNoDeadCta } from '../helpers/kudosAssertions';

test.describe('kudos.public.smoke', () => {
  test.fixme(true, 'Requires dev-harness kudos tab + seed hook (prompt 04 dependency).');

  test(`renders public root with workflow baseline ${matrixTag('A3', 'C1', 'H1', 'P0')}`, async ({
    page,
  }) => {
    await gotoKudosPublic(page, workflowBaseline());
    await expect(page.locator('[data-hbc-testid="hb-kudos-public-root"]')).toBeVisible();
    await assertNoDeadCta(page);
  });
});
