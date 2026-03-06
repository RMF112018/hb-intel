import { test } from '@playwright/test';
import { assertWorkspacePageShellRoute, isPwaProject } from './helpers/workspacePageShell.js';

test.describe('Domain smoke — operational-excellence', () => {
  test.beforeEach(async ({ baseURL }) => {
    test.skip(!isPwaProject(baseURL), 'Operational Excellence smoke runs in the PWA project.');
  });

  test('renders WorkspacePageShell at /operational-excellence', async ({ page }) => {
    await assertWorkspacePageShellRoute(page, '/operational-excellence', 'Operational Excellence');
  });
});

