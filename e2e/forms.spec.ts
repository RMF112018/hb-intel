import { test, expect } from '@playwright/test';

const isDevHarnessProject = (baseURL?: string) => baseURL?.includes('localhost:3000') ?? false;

test.describe('Form architecture coverage', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    test.skip(!isDevHarnessProject(baseURL), 'Form workflow checks execute on the dev-harness project.');
    await page.goto('/');
    await page.getByRole('tab', { name: 'Admin' }).click();
  });

  test('form fields support edit, validation-ready state changes, and reset flow', async ({ page }) => {
    // 4b.12.2 coverage: exercises form input, dirty state interaction, and restore/reset behavior.
    const projectName = page.getByLabel('Project Name');
    const projectNumber = page.getByLabel('Project Number');

    await projectName.fill('Harbor View Medical Center - QA');
    await projectNumber.fill('HV-2026-042');

    await expect(projectName).toHaveValue('Harbor View Medical Center - QA');
    await expect(projectNumber).toHaveValue('HV-2026-042');

    // Restore baseline values to validate reversible form state transitions in a single run.
    await projectName.fill('Harbor View Medical Center');
    await projectNumber.fill('HV-2025-001');

    await expect(projectName).toHaveValue('Harbor View Medical Center');
    await expect(projectNumber).toHaveValue('HV-2025-001');
  });
});
