import { test } from '@playwright/test';
import { assertWorkspacePageShellRoute, isPwaProject } from './helpers/workspacePageShell.js';

test.describe('Domain smoke — project-hub', () => {
  test.beforeEach(async ({ baseURL }) => {
    test.skip(!isPwaProject(baseURL), 'Project Hub smoke runs in the PWA project.');
  });

  test('renders WorkspacePageShell at /project-hub', async ({ page }) => {
    await assertWorkspacePageShellRoute(page, '/project-hub', 'Project Hub');
  });
});

