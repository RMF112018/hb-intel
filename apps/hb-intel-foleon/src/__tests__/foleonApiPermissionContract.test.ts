import { readFileSync } from 'fs';
import { resolve } from 'path';
import { describe, expect, it } from 'vitest';

const repoRoot = resolve(__dirname, '../../../..');

describe('Foleon API permission contract', () => {
  it('requests delegated access_as_user for HB SharePoint Creator', () => {
    const packageSolutionPath = resolve(repoRoot, 'apps/hb-intel-foleon/config/package-solution.json');
    const packageSolution = JSON.parse(readFileSync(packageSolutionPath, 'utf-8')) as {
      solution?: {
        webApiPermissionRequests?: Array<{ resource?: string; scope?: string }>;
      };
    };
    const permissionRequests = packageSolution.solution?.webApiPermissionRequests ?? [];

    expect(permissionRequests).toContainEqual({
      resource: 'HB SharePoint Creator',
      scope: 'access_as_user',
    });
    expect(permissionRequests).not.toContainEqual({
      resource: 'HB SharePoint Creator',
      scope: 'user_impersonation',
    });
  });
});
