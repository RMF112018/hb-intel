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
  // Azure returns app-prefixed names; the verifier suffix-matches against /<name>.
  myWorkFunctionInventory: [
    'hb-intel-function-app/getMyWorkHome',
    'hb-intel-function-app/getMyWorkAdobeSignActionQueue',
    'hb-intel-function-app/getMyWorkProjectLinks',
    'hb-intel-function-app/startAdobeSignOAuth',
    'hb-intel-function-app/completeAdobeSignOAuthCallback',
  ],
  myWorkRouteStatuses: [
    { route: '/api/my-work/me/home', method: 'GET' as const, status: 401 },
    { route: '/api/my-work/me/project-links', method: 'GET' as const, status: 401 },
    { route: '/api/my-work/me/adobe-sign/action-queue', method: 'GET' as const, status: 401 },
    { route: '/api/my-work/me/adobe-sign/oauth/start', method: 'POST' as const, status: 401 },
    { route: '/api/my-work/adobe-sign/oauth/callback', method: 'GET' as const, status: 302 },
  ],
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

  describe('My Dashboard / My Work route registration truth', () => {
    it('passes when My Work inventory and route probes are all healthy', () => {
      const evidence = buildParityEvidence({ ...BASE });

      expect(evidence.overallPass).toBe(true);
      expect(evidence.myWorkRouteTruth.functionInventory.allPresent).toBe(true);
      expect(evidence.myWorkRouteTruth.functionInventory.missing).toHaveLength(0);
      expect(evidence.myWorkRouteTruth.routeProbes.allPresent).toBe(true);
    });

    it('fails when a required My Work function registration is missing from the live inventory', () => {
      const evidence = buildParityEvidence({
        ...BASE,
        myWorkFunctionInventory: [
          'hb-intel-function-app/getMyWorkHome',
          'hb-intel-function-app/getMyWorkAdobeSignActionQueue',
          'hb-intel-function-app/getMyWorkProjectLinks',
          'hb-intel-function-app/startAdobeSignOAuth',
        ],
      });

      expect(evidence.overallPass).toBe(false);
      expect(evidence.myWorkRouteTruth.functionInventory.missing).toContain(
        'completeAdobeSignOAuthCallback',
      );
      expect(evidence.myWorkRouteTruth.functionInventory.issues).toContain(
        'my_work.function_inventory.missing(completeAdobeSignOAuthCallback)',
      );
    });

    it('fails when a protected My Work route returns 404', () => {
      const evidence = buildParityEvidence({
        ...BASE,
        myWorkRouteStatuses: [
          { route: '/api/my-work/me/home', method: 'GET', status: 404 },
          { route: '/api/my-work/me/project-links', method: 'GET', status: 401 },
          { route: '/api/my-work/me/adobe-sign/action-queue', method: 'GET', status: 401 },
          { route: '/api/my-work/me/adobe-sign/oauth/start', method: 'POST', status: 401 },
          { route: '/api/my-work/adobe-sign/oauth/callback', method: 'GET', status: 302 },
        ],
      });

      expect(evidence.overallPass).toBe(false);
      expect(evidence.myWorkRouteTruth.routeProbes.issues).toContain(
        'my_work.route.missing(GET /api/my-work/me/home status=404)',
      );
    });

    it('passes the public OAuth callback on a 302 redirect but fails it on a 404', () => {
      const passing = buildParityEvidence({ ...BASE });
      expect(passing.myWorkRouteTruth.routeProbes.issues).toHaveLength(0);

      const failing = buildParityEvidence({
        ...BASE,
        myWorkRouteStatuses: [
          { route: '/api/my-work/me/home', method: 'GET', status: 401 },
          { route: '/api/my-work/me/project-links', method: 'GET', status: 401 },
          { route: '/api/my-work/me/adobe-sign/action-queue', method: 'GET', status: 401 },
          { route: '/api/my-work/me/adobe-sign/oauth/start', method: 'POST', status: 401 },
          { route: '/api/my-work/adobe-sign/oauth/callback', method: 'GET', status: 404 },
        ],
      });
      expect(failing.overallPass).toBe(false);
      expect(failing.myWorkRouteTruth.routeProbes.issues).toContain(
        'my_work.route.missing(GET /api/my-work/adobe-sign/oauth/callback status=404)',
      );
    });

    it('forces overallPass false when My Work inventory and route truth fail together', () => {
      const evidence = buildParityEvidence({
        ...BASE,
        myWorkFunctionInventory: [],
        myWorkRouteStatuses: [
          { route: '/api/my-work/me/home', method: 'GET', status: 404 },
          { route: '/api/my-work/me/project-links', method: 'GET', status: 404 },
          { route: '/api/my-work/me/adobe-sign/action-queue', method: 'GET', status: 404 },
          { route: '/api/my-work/me/adobe-sign/oauth/start', method: 'POST', status: 404 },
          { route: '/api/my-work/adobe-sign/oauth/callback', method: 'GET', status: 404 },
        ],
      });

      expect(evidence.overallPass).toBe(false);
      expect(evidence.myWorkRouteTruth.functionInventory.missing).toHaveLength(5);
      expect(evidence.myWorkRouteTruth.routeProbes.issues).toHaveLength(5);
    });
  });
});
