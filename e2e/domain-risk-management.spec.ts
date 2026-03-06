import { test } from '@playwright/test';
import { assertWorkspacePageShellRoute, isPwaProject } from './helpers/workspacePageShell.js';

test.describe('Domain smoke — risk-management', () => {
  test.beforeEach(async ({ baseURL }) => {
    test.skip(!isPwaProject(baseURL), 'Risk Management smoke runs in the PWA project.');
  });

  test('renders WorkspacePageShell at /risk-management', async ({ page }) => {
    await assertWorkspacePageShellRoute(page, '/risk-management', 'Risk Management');
  });
});

