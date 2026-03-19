/**
 * E1 Task 9: Telemetry baseline verification — traffic generation.
 *
 * These tests produce HTTP traffic against staging to generate C3 telemetry events.
 * Post-run verification is manual: use KQL queries in Application Insights to confirm
 * correlated signals across requests, dependencies, and traces tables.
 *
 * Telemetry events expected per scenario:
 * - Successful GET:  handler.invoke → auth.bearer.success → handler.success
 * - Not-found GET:   handler.invoke → auth.bearer.success → handler.error (404)
 * - Unauthorized:    handler.invoke → auth.bearer.error → handler.error (401)
 * - Validation error: handler.invoke → auth.bearer.success → handler.error (422)
 *
 * Same env-var gating as critical-paths.smoke.test.ts (Decision 14).
 */

import { describe, it, expect } from 'vitest';

const BASE_URL = process.env.SMOKE_TEST_BASE_URL;
const AUTH_TOKEN = process.env.AUTH_TOKEN;
const IS_CI = process.env.CI === 'true';

if (IS_CI && (!BASE_URL || !AUTH_TOKEN)) {
  throw new Error(
    'CI pipeline error: SMOKE_TEST_BASE_URL and AUTH_TOKEN must be set for telemetry baseline tests.',
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

describe.runIf(!!BASE_URL)('E1 Telemetry Baseline — Traffic Generation', () => {
  it('Scenario 1: successful GET produces handler.success telemetry', async () => {
    const res = await fetch(apiUrl('/leads'), { headers: authHeaders() });
    expect(res.status).toBe(200);
    // Post-run: verify handler.invoke + auth.bearer.success + handler.success in App Insights
  });

  it('Scenario 2: not-found GET produces handler.error (404) telemetry', async () => {
    const res = await fetch(apiUrl('/leads/99999999'), {
      headers: authHeaders(),
    });
    expect(res.status).toBe(404);
    // Post-run: verify handler.invoke + auth.bearer.success + handler.error in App Insights
  });

  it('Scenario 3: unauthorized request produces auth.bearer.error telemetry', async () => {
    const res = await fetch(apiUrl('/leads'));
    expect(res.status).toBe(401);
    // Post-run: verify handler.invoke + auth.bearer.error + handler.error in App Insights
  });

  it('Scenario 4: validation error produces handler.error (422) telemetry', async () => {
    const res = await fetch(apiUrl('/leads'), {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({}), // empty body → validation failure
    });
    // Expect 422 (validation error) or 400 (bad request) depending on backend implementation
    expect([400, 422]).toContain(res.status);
    const body = await res.json();
    expect(body).toHaveProperty('message');
    // Post-run: verify handler.invoke + auth.bearer.success + handler.error in App Insights
  });
});
