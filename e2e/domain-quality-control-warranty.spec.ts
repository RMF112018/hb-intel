import { test } from '@playwright/test';
import { assertWorkspacePageShellRoute, isPwaProject } from './helpers/workspacePageShell.js';

test.describe('Domain smoke — quality-control-warranty', () => {
  test.beforeEach(async ({ baseURL }) => {
    test.skip(!isPwaProject(baseURL), 'Quality Control & Warranty smoke runs in the PWA project.');
  });

  test('renders WorkspacePageShell at /quality-control-warranty', async ({ page }) => {
    await assertWorkspacePageShellRoute(page, '/quality-control-warranty', 'Quality Control & Warranty');
  });
});

