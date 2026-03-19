/**
 * E1 Task 8: Critical-path smoke tests against staging.
 *
 * These tests run real HTTP requests against a deployed staging instance.
 * They are env-gated: skip locally when SMOKE_TEST_BASE_URL is absent,
 * hard-fail in CI if env vars are missing (Decision 14).
 *
 * Prerequisites (all currently blocked):
 * - C1: Domain route handlers deployed (leads, projects, estimating)
 * - C2: Auth middleware (withAuth) active on staging
 * - Platform: Staging Azure Functions instance available
 *
 * Usage:
 *   # Local (skips if env vars absent)
 *   pnpm --filter @hbc/functions test:contract-smoke
 *
 *   # Against staging
 *   export SMOKE_TEST_BASE_URL=https://hb-intel-stage.azurewebsites.net
 *   export AUTH_TOKEN=$(az account get-access-token --resource api://<CLIENT_ID> --query accessToken -o tsv)
 *   pnpm --filter @hbc/functions test:contract-smoke
 */

import { describe, it, expect, beforeAll } from 'vitest';

const BASE_URL = process.env.SMOKE_TEST_BASE_URL;
const AUTH_TOKEN = process.env.AUTH_TOKEN;
const IS_CI = process.env.CI === 'true';

// Decision 14: CI must hard-fail on missing env vars
if (IS_CI && (!BASE_URL || !AUTH_TOKEN)) {
  throw new Error(
    'CI pipeline error: SMOKE_TEST_BASE_URL and AUTH_TOKEN must be set. ' +
      'Ensure the staging URL and a valid API-scoped Bearer token are configured as pipeline secrets.',
  );
}

function apiUrl(path: string): string {
  return `${BASE_URL}/api${path}`;
}

function authHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${AUTH_TOKEN}`,
    'Content-Type': 'application/json',
  };
}

// All tests skip when BASE_URL is absent (local dev without staging)
describe.runIf(!!BASE_URL)('E1 Critical-Path Smoke Tests', () => {
  let createdLeadId: number | undefined;

  // ─── Leads Domain ────────────────────────────────────────────────────────

  it('GET /api/leads returns paged response', async () => {
    const res = await fetch(apiUrl('/leads'), { headers: authHeaders() });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('items');
    expect(body).toHaveProperty('total');
    expect(body).toHaveProperty('page');
    expect(body).toHaveProperty('pageSize');
    expect(Array.isArray(body.items)).toBe(true);
  });

  it('POST /api/leads creates a lead (201)', async () => {
    const res = await fetch(apiUrl('/leads'), {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        title: 'Smoke Test Lead',
        stage: 'Identified',
        clientName: 'Smoke Test Client',
        estimatedValue: 100000,
      }),
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toHaveProperty('data');
    expect(body.data).toHaveProperty('id');
    expect(body.data.title).toBe('Smoke Test Lead');
    createdLeadId = body.data.id;
  });

  it('GET /api/leads/:id returns single lead', async () => {
    if (!createdLeadId) return;
    const res = await fetch(apiUrl(`/leads/${createdLeadId}`), {
      headers: authHeaders(),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('data');
    expect(body.data.id).toBe(createdLeadId);
  });

  it('PUT /api/leads/:id updates a lead', async () => {
    if (!createdLeadId) return;
    const res = await fetch(apiUrl(`/leads/${createdLeadId}`), {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({
        title: 'Updated Smoke Lead',
        stage: 'Qualifying',
        clientName: 'Smoke Test Client',
        estimatedValue: 200000,
      }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.title).toBe('Updated Smoke Lead');
  });

  it('DELETE /api/leads/:id removes a lead (204)', async () => {
    if (!createdLeadId) return;
    const res = await fetch(apiUrl(`/leads/${createdLeadId}`), {
      method: 'DELETE',
      headers: authHeaders(),
    });
    expect(res.status).toBe(204);
    const text = await res.text();
    expect(text).toBe('');
  });

  it('unauthenticated request returns 401 error envelope', async () => {
    const res = await fetch(apiUrl('/leads'));
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toHaveProperty('message');
    // D3: error envelope uses 'message' field
  });

  it('GET /api/leads?q= returns search results', async () => {
    const res = await fetch(apiUrl('/leads?q=smoke'), {
      headers: authHeaders(),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('items');
    expect(body).toHaveProperty('total');
  });

  // ─── Projects Domain ─────────────────────────────────────────────────────

  it('GET /api/projects returns paged response', async () => {
    const res = await fetch(apiUrl('/projects'), { headers: authHeaders() });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('items');
    expect(body).toHaveProperty('total');
  });

  it('GET /api/projects/summary returns portfolio summary', async () => {
    const res = await fetch(apiUrl('/projects/summary'), {
      headers: authHeaders(),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('data');
    expect(body.data).toHaveProperty('totalProjects');
    expect(body.data).toHaveProperty('activeProjects');
  });

  // ─── Estimating Domain ────────────────────────────────────────────────────

  it('GET /api/estimating/trackers returns paged response', async () => {
    const res = await fetch(apiUrl('/estimating/trackers'), {
      headers: authHeaders(),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('items');
    expect(body).toHaveProperty('total');
  });
});
