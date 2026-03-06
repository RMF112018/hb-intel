import { test } from '@playwright/test';
import { assertWorkspacePageShellRoute, isPwaProject } from './helpers/workspacePageShell.js';

test.describe('Domain smoke — human-resources', () => {
  test.beforeEach(async ({ baseURL }) => {
    test.skip(!isPwaProject(baseURL), 'Human Resources smoke runs in the PWA project.');
  });

  test('renders WorkspacePageShell at /human-resources', async ({ page }) => {
    await assertWorkspacePageShellRoute(page, '/human-resources', 'Human Resources');
  });
});

