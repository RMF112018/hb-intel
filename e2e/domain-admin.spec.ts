import { test } from '@playwright/test';
import { assertWorkspacePageShellRoute, isPwaProject } from './helpers/workspacePageShell.js';

test.describe('Domain smoke — admin', () => {
  test.beforeEach(async ({ baseURL }) => {
    test.skip(!isPwaProject(baseURL), 'Admin smoke runs in the PWA project.');
  });

  test('renders WorkspacePageShell at /admin', async ({ page }) => {
    await assertWorkspacePageShellRoute(page, '/admin', 'Admin');
  });
});

