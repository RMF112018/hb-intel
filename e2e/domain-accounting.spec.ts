import { test } from '@playwright/test';
import { assertWorkspacePageShellRoute, isPwaProject } from './helpers/workspacePageShell.js';

test.describe('Domain smoke — accounting', () => {
  test.beforeEach(async ({ baseURL }) => {
    test.skip(!isPwaProject(baseURL), 'Accounting smoke runs in the PWA project.');
  });

  test('renders WorkspacePageShell at /accounting', async ({ page }) => {
    // Phase 4b.16 acceptance: one WorkspacePageShell smoke spec per domain app.
    await assertWorkspacePageShellRoute(page, '/accounting', 'Accounting');
  });
});

