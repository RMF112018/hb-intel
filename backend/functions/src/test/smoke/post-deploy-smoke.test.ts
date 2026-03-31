/**
 * P5-03: Post-deploy smoke checks for the Project Setup deployment.
 *
 * These tests run against a deployed staging/production instance.
 * They are env-gated: skip locally when SMOKE_TEST_BASE_URL is absent.
 *
 * Evidence Classification (P5-09):
 *   - Category: Environment-gated, post-deploy verification
 *   - Repo status: Present and version-controlled
 *   - Operationalized: NO — requires live staging/production instance
 *   - What this proves: Test definitions are correct and ready to execute
 *   - What this does NOT prove: That a live deployment has been validated
 *   - The existence of this file is NOT proof that smoke checks have passed
 *     against any environment. Proof requires a recorded execution log.
 *
 * Usage:
 *   # Local (skips)
 *   pnpm --filter @hbc/functions test:contract-smoke
 *
 *   # Against staging
 *   export SMOKE_TEST_BASE_URL=https://hb-intel-stage.azurewebsites.net
 *   export AUTH_TOKEN=$(az account get-access-token --resource api://<CLIENT_ID> --query accessToken -o tsv)
 *   pnpm --filter @hbc/functions test:contract-smoke
 *
 * Closes P5-01 blocker A2: No smoke test script for post-deploy validation.
 */

import { describe, it, expect, beforeAll } from 'vitest';

const BASE_URL = process.env.SMOKE_TEST_BASE_URL;
const AUTH_TOKEN = process.env.AUTH_TOKEN;
const IS_CI = process.env.CI === 'true';

if (IS_CI && !BASE_URL) {
  throw new Error(
    'CI pipeline error: SMOKE_TEST_BASE_URL must be set for post-deploy smoke checks.',
  );
}

function apiUrl(path: string): string {
  return `${BASE_URL}/api${path}`;
}

describe.runIf(!!BASE_URL)('P5-03 Post-deploy smoke checks', () => {
  // --- Health probe (unauthenticated) ---

  it('health endpoint returns 200 with operational readiness', async () => {
    const res = await fetch(apiUrl('/health'));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body).toHaveProperty('status', 'healthy');
    expect(body).toHaveProperty('operationalReadiness');
    expect(['ready', 'degraded', 'blocked']).toContain(body.operationalReadiness);
  });

  it('health endpoint reports tiered config status', async () => {
    const res = await fetch(apiUrl('/health'));
    const body = await res.json();

    expect(body).toHaveProperty('configTiers');
    expect(body.configTiers).toHaveProperty('core');
    expect(body.configTiers).toHaveProperty('sharepoint');
    expect(body.configTiers).toHaveProperty('provisioning');
  });

  it('health endpoint reports provisioning prerequisites', async () => {
    const res = await fetch(apiUrl('/health'));
    const body = await res.json();

    expect(body).toHaveProperty('provisioningPrereqs');
    expect(body.provisioningPrereqs).toHaveProperty('graphPermission');
    expect(body.provisioningPrereqs).toHaveProperty('hubSite');
    expect(body.provisioningPrereqs).toHaveProperty('appCatalog');
    expect(body.provisioningPrereqs).toHaveProperty('spfxAppId');
    expect(body.provisioningPrereqs).toHaveProperty('opexManager');
  });

  // --- Auth enforcement (unauthenticated rejection) ---

  it('project-setup-requests rejects unauthenticated GET', async () => {
    const res = await fetch(apiUrl('/project-setup-requests'));
    expect(res.status).toBe(401);
  });

  it('provisioning-status rejects unauthenticated GET', async () => {
    const res = await fetch(apiUrl('/provisioning-status/test-project'));
    expect(res.status).toBe(401);
  });

  // --- Authenticated paths (only when AUTH_TOKEN is provided) ---

  describe.runIf(!!AUTH_TOKEN)('Authenticated smoke checks', () => {
    const authHeaders = (): Record<string, string> => ({
      Authorization: `Bearer ${AUTH_TOKEN}`,
      'Content-Type': 'application/json',
    });

    it('project-setup-requests returns list with valid token', async () => {
      const res = await fetch(apiUrl('/project-setup-requests'), {
        headers: authHeaders(),
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty('items');
    });

    it('provisioning-negotiate rejects without projectId', async () => {
      const res = await fetch(apiUrl('/provisioning-negotiate'), {
        method: 'POST',
        headers: authHeaders(),
      });
      // Should return 400 (missing projectId) not 401 (auth passes)
      expect(res.status).toBe(400);
    });
  });
});
