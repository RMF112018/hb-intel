import { describe, expect, it } from 'vitest';
import { buildParityEvidence } from '../../../../scripts/verify-functions-live-parity.ts';

const BASE = {
  appName: 'hb-intel-function-app',
  resourceGroup: 'hb-intel',
  hostName: 'example.azurewebsites.net',
  checkedAtUtc: '2026-04-24T00:00:00.000Z',
  expectedIdentity: {
    version: '00.000.149',
    commitSha: 'c621aee82bc9ec0dc0434225726b83a632ace5c7',
  },
  routeStatuses: [
    { route: '/api/safety-records/ingest', method: 'POST' as const, status: 401 },
    { route: '/api/safety-records/ingest/preview', method: 'POST' as const, status: 401 },
    { route: '/api/safety-records/replay', method: 'POST' as const, status: 401 },
    { route: '/api/safety-records/provision-sharepoint', method: 'POST' as const, status: 401 },
  ],
  malformedRouteStatuses: [
    { route: '/api/safety-records/ingest', method: 'POST' as const, status: 401 },
    { route: '/api/safety-records/ingest/preview', method: 'POST' as const, status: 401 },
    { route: '/api/safety-records/replay', method: 'POST' as const, status: 401 },
    { route: '/api/safety-records/provision-sharepoint', method: 'POST' as const, status: 401 },
  ],
  healthReadyNoAuthStatus: 401,
  healthReadyMalformedAuthStatus: 401,
  appSettings: {
    HBC_FUNCTIONS_BUILD_VERSION: '00.000.149',
    HBC_FUNCTIONS_BUILD_SHA: 'c621aee82bc9ec0dc0434225726b83a632ace5c7',
    HBC_FUNCTIONS_BUILD_TIMESTAMP: '2026-04-23T20:29:59.604Z',
  },
  healthBody: {
    status: 'healthy',
    artifact: {
      version: '00.000.149',
      commitSha: 'c621aee82bc9ec0dc0434225726b83a632ace5c7',
      buildTimestamp: '2026-04-23T20:29:59.604Z',
    },
    timestamp: '2026-04-24T00:00:00.000Z',
  },
};

describe('verify-functions-live-parity contract', () => {
  it('fails when unauthenticated preview route is not 401', () => {
    const evidence = buildParityEvidence({
      ...BASE,
      routeStatuses: [
        { route: '/api/safety-records/ingest', method: 'POST', status: 401 },
        { route: '/api/safety-records/ingest/preview', method: 'POST', status: 400 },
        { route: '/api/safety-records/replay', method: 'POST', status: 401 },
        { route: '/api/safety-records/provision-sharepoint', method: 'POST', status: 401 },
      ],
    });
    expect(evidence.overallPass).toBe(false);
    expect(evidence.commandAuthTruth.noAuth.issues).toContain(
      'command_auth.no_auth.preview.unexpected_status(expected=401,live=400)',
    );
  });

  it('does not fail overall parity when malformed preview returns 401 without X-Request-Id (Flex gateway variance)', () => {
    const evidence = buildParityEvidence({
      ...BASE,
      malformedRouteProbes: [
        { route: '/api/safety-records/ingest', method: 'POST', status: 401, exists: true, responseRequestIdPresent: true },
        { route: '/api/safety-records/ingest/preview', method: 'POST', status: 401, exists: true, responseRequestIdPresent: false },
        { route: '/api/safety-records/replay', method: 'POST', status: 401, exists: true, responseRequestIdPresent: true },
        { route: '/api/safety-records/provision-sharepoint', method: 'POST', status: 401, exists: true, responseRequestIdPresent: true },
      ],
    });
    expect(evidence.overallPass).toBe(true);
    expect(evidence.commandAuthTruth.malformedBearer.issues).not.toContain(
      'command_auth.malformed_bearer.preview.missing_x_request_id',
    );
  });

  it('fails when non-admin can access provisioning route', () => {
    const evidence = buildParityEvidence({
      ...BASE,
      healthReadyNonAdminStatus: 403,
      nonAdminRouteStatuses: [
        { route: '/api/safety-records/ingest', method: 'POST', status: 422 },
        { route: '/api/safety-records/ingest/preview', method: 'POST', status: 400 },
        { route: '/api/safety-records/replay', method: 'POST', status: 422 },
        { route: '/api/safety-records/provision-sharepoint', method: 'POST', status: 200 },
      ],
    });
    expect(evidence.overallPass).toBe(false);
    expect(evidence.commandAuthTruth.nonAdminBearer.issues).toContain(
      'command_auth.non_admin_bearer.provisioning.unexpected_status(expected=403,live=200)',
    );
  });
});
