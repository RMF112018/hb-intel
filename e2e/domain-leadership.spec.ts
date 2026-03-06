import { test } from '@playwright/test';
import { assertWorkspacePageShellRoute, isPwaProject } from './helpers/workspacePageShell.js';

test.describe('Domain smoke — leadership', () => {
  test.beforeEach(async ({ baseURL }) => {
    test.skip(!isPwaProject(baseURL), 'Leadership smoke runs in the PWA project.');
  });

  test('renders WorkspacePageShell at /leadership', async ({ page }) => {
    await assertWorkspacePageShellRoute(page, '/leadership', 'Leadership');
  });
});

