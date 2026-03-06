import { test } from '@playwright/test';
import { assertWorkspacePageShellRoute, isPwaProject } from './helpers/workspacePageShell.js';

test.describe('Domain smoke — hb-site-control', () => {
  test.beforeEach(async ({ baseURL }) => {
    test.skip(!isPwaProject(baseURL), 'HB Site Control smoke runs in the PWA project.');
  });

  test('renders WorkspacePageShell at /site-control', async ({ page }) => {
    await assertWorkspacePageShellRoute(page, '/site-control', 'Site Control');
  });
});

