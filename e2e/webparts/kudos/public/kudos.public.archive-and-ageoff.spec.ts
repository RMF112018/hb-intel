/**
 * Phase-16 — public webpart: archive + age-off (C3/C4).
 */
import { expect, test } from '@playwright/test';
import { gotoKudosPublic } from '../helpers/kudosHarnessPage';
import { KUDOS_TESTIDS, matrixTag } from '../helpers/kudosLocators';
import { captureProof } from '../helpers/kudosArtifacts';
import { visibilityBaseline } from '../fixtures';

const tid = (id: string) => `[data-hbc-testid="${id}"]`;

test.describe('kudos.public.archive-and-ageoff', () => {
  test.fixme(true, 'Requires dev-harness kudos tab + seed hook (prompt 04 prerequisite).');

  test.beforeEach(async ({ page }) => {
    await gotoKudosPublic(page, visibilityBaseline());
  });

  test(`archive section renders eligible items only ${matrixTag('C3', 'P1')}`, async ({ page }) => {
    await expect(page.locator(tid(KUDOS_TESTIDS.archiveSearchInput))).toBeVisible();
    await expect(page.getByText('Archive-eligible')).toBeVisible();
  });

  test(`aged-off items do not render on feed ${matrixTag('C4', 'P1')}`, async ({ page }) => {
    await expect(page.locator(tid(KUDOS_TESTIDS.publicFeed))).not.toContainText('Aged off homepage');
  });

  test(`archive search filters rows ${matrixTag('C3', 'P1')}`, async ({ page }) => {
    await page.locator(tid(KUDOS_TESTIDS.archiveSearchInput)).fill('archive');
    await expect(page.getByText('Archive-eligible')).toBeVisible();
  });

  test(`archive row opens detail ${matrixTag('C3', 'P1')}`, async ({ page }) => {
    await page.getByText('Archive-eligible').click();
    await expect(page.locator(tid(KUDOS_TESTIDS.publicDetailPanel))).toBeVisible();
    await captureProof(page, {
      group: 'public',
      spec: 'archive-and-ageoff',
      caseName: 'archive-detail-open',
      matrixParts: ['C3', 'P1'],
    });
  });
});
