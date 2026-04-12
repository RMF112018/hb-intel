/**
 * Phase-16 — public webpart: composer lifecycle (F1–F10).
 *
 * Exercises the Give Kudos flyout composer: pristine → dirty →
 * discard-dialog; validation errors; typed people-picker success /
 * empty / error; submit-success with Send Another + Done;
 * submit-error surfacing.
 */
import { expect, test } from '@playwright/test';
import { gotoKudosPublic } from '../helpers/kudosHarnessPage';
import { KUDOS_TESTIDS, matrixTag } from '../helpers/kudosLocators';
import { captureProof } from '../helpers/kudosArtifacts';
import {
  workflowBaseline,
  setPeopleSearchMode,
  setHostedFault,
  clearHostedFault,
} from '../fixtures';

const tid = (id: string) => `[data-hbc-testid="${id}"]`;

async function openComposer(page: import('@playwright/test').Page) {
  await page.locator(tid(KUDOS_TESTIDS.giveKudosFlyoutTrigger)).click();
  await expect(page.locator(tid(KUDOS_TESTIDS.composerForm))).toBeVisible();
}

test.describe('kudos.public.composer-lifecycle', () => {
  test.fixme(true, 'Requires dev-harness kudos tab + seed hook (prompt 04 prerequisite).');

  test.beforeEach(async ({ page }) => {
    await gotoKudosPublic(page, workflowBaseline());
  });

  test(`pristine open (F1) + dirty draft (F2) + discard dialog (F3) ${matrixTag('F1', 'F2', 'F3', 'P0')}`, async ({ page }) => {
    await openComposer(page);
    await expect(page.locator(tid(KUDOS_TESTIDS.composerPreview))).toBeVisible();
    // pristine close: no discard dialog
    await page.keyboard.press('Escape');
    await expect(page.locator(tid(KUDOS_TESTIDS.composerDiscardDialog))).toHaveCount(0);

    await openComposer(page);
    await page.getByRole('textbox', { name: /headline/i }).fill('Great work');
    await page.keyboard.press('Escape');
    await expect(page.locator(tid(KUDOS_TESTIDS.composerDiscardDialog))).toBeVisible();
  });

  test(`validation error (F4) ${matrixTag('F4', 'P1')}`, async ({ page }) => {
    await openComposer(page);
    await page.locator(tid(KUDOS_TESTIDS.composerSubmit)).click();
    await expect(page.getByRole('alert')).toBeVisible();
    await captureProof(page, {
      group: 'public',
      spec: 'composer-lifecycle',
      caseName: 'validation-error',
      matrixParts: ['F4', 'P1'],
    });
  });

  test(`typed people search success (F8) ${matrixTag('F8', 'P0')}`, async ({ page }) => {
    await setPeopleSearchMode(page, 'exact-match');
    await openComposer(page);
    await page.locator(tid(KUDOS_TESTIDS.peoplePickerInput)).fill('ren');
    await expect(page.locator(tid(KUDOS_TESTIDS.peoplePickerResults))).toContainText('Ren Recipient');
  });

  test(`typed people search empty (F9) ${matrixTag('F9', 'P1')}`, async ({ page }) => {
    await setPeopleSearchMode(page, 'zero-matches');
    await openComposer(page);
    await page.locator(tid(KUDOS_TESTIDS.peoplePickerInput)).fill('zzz');
    await expect(page.locator(tid(KUDOS_TESTIDS.peoplePickerEmpty))).toBeVisible();
  });

  test(`typed people search error (F10) ${matrixTag('F10', 'P1')}`, async ({ page }) => {
    await setPeopleSearchMode(page, 'directory-error');
    await openComposer(page);
    await page.locator(tid(KUDOS_TESTIDS.peoplePickerInput)).fill('ren');
    await expect(page.locator(tid(KUDOS_TESTIDS.peoplePickerError))).toBeVisible();
  });

  test(`submit success + send another (F5/F7) ${matrixTag('F5', 'F7', 'P0')}`, async ({ page }) => {
    await setPeopleSearchMode(page, 'exact-match');
    await openComposer(page);
    await page.locator(tid(KUDOS_TESTIDS.peoplePickerInput)).fill('ren');
    await page.locator(tid(KUDOS_TESTIDS.peoplePickerResults)).getByText('Ren Recipient').click();
    await page.getByRole('textbox', { name: /headline/i }).fill('Well done');
    await page.getByRole('textbox', { name: /excerpt/i }).fill('Nailed the estimate review.');
    await page.locator(tid(KUDOS_TESTIDS.composerSubmit)).click();
    await expect(page.getByText(/sent|thanks|submitted/i)).toBeVisible();
    await captureProof(page, {
      group: 'public',
      spec: 'composer-lifecycle',
      caseName: 'submit-success',
      matrixParts: ['F5', 'P0'],
    });
    await page.locator(tid(KUDOS_TESTIDS.composerSendAnother)).click();
    await expect(page.locator(tid(KUDOS_TESTIDS.composerForm))).toBeVisible();
  });

  test(`submit error (F6) ${matrixTag('F6', 'P1')}`, async ({ page }) => {
    await setHostedFault(page, 'patch-rejected-etag');
    await setPeopleSearchMode(page, 'exact-match');
    await openComposer(page);
    await page.locator(tid(KUDOS_TESTIDS.peoplePickerInput)).fill('ren');
    await page.locator(tid(KUDOS_TESTIDS.peoplePickerResults)).getByText('Ren Recipient').click();
    await page.getByRole('textbox', { name: /headline/i }).fill('Well done');
    await page.getByRole('textbox', { name: /excerpt/i }).fill('Nailed the estimate review.');
    await page.locator(tid(KUDOS_TESTIDS.composerSubmit)).click();
    await expect(page.getByRole('alert')).toBeVisible();
    await clearHostedFault(page);
  });
});
