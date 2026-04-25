import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const repoRoot = resolve(__dirname, '../../../..');

describe('Safety API permission contract', () => {
  it('owns delegated access_as_user permission request in Safety package', () => {
    const packageSolutionPath = resolve(repoRoot, 'apps/safety/config/package-solution.json');
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
  });
});
