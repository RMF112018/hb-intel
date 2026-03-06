import { test } from '@playwright/test';
import { assertWorkspacePageShellRoute, isPwaProject } from './helpers/workspacePageShell.js';

test.describe('Domain smoke — estimating', () => {
  test.beforeEach(async ({ baseURL }) => {
    test.skip(!isPwaProject(baseURL), 'Estimating smoke runs in the PWA project.');
  });

  test('renders WorkspacePageShell at /estimating', async ({ page }) => {
    await assertWorkspacePageShellRoute(page, '/estimating', 'Estimating');
  });
});

