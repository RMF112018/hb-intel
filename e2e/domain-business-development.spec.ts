import { test } from '@playwright/test';
import { assertWorkspacePageShellRoute, isPwaProject } from './helpers/workspacePageShell.js';

test.describe('Domain smoke — business-development', () => {
  test.beforeEach(async ({ baseURL }) => {
    test.skip(!isPwaProject(baseURL), 'Business Development smoke runs in the PWA project.');
  });

  test('renders WorkspacePageShell at /business-development', async ({ page }) => {
    await assertWorkspacePageShellRoute(page, '/business-development', 'Business Development');
  });
});

