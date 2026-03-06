import { test } from '@playwright/test';
import { assertWorkspacePageShellRoute, isPwaProject } from './helpers/workspacePageShell.js';

test.describe('Domain smoke — safety', () => {
  test.beforeEach(async ({ baseURL }) => {
    test.skip(!isPwaProject(baseURL), 'Safety smoke runs in the PWA project.');
  });

  test('renders WorkspacePageShell at /safety', async ({ page }) => {
    await assertWorkspacePageShellRoute(page, '/safety', 'Safety');
  });
});

