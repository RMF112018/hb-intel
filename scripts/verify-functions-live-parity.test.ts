import { describe, expect, it } from 'vitest';
import { buildParityEvidence } from './verify-functions-live-parity';

const BASE = {
  appName: 'hb-intel-function-app',
  resourceGroup: 'hb-intel',
  hostName: 'hb-intel-function-app-gbd6ecgrh7fsgscm.eastus2-01.azurewebsites.net',
  checkedAtUtc: '2026-04-23T20:30:31.704Z',
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
};

const HEALTHY_BODY = {
  status: 'healthy',
  artifact: {
    version: BASE.expectedIdentity.version,
    commitSha: BASE.expectedIdentity.commitSha,
    buildTimestamp: '2026-04-23T20:29:59.604Z',
  },
  timestamp: '2026-04-23T20:30:31.704Z',
};

describe('verify-functions-live-parity', () => {
  it('fails when /api/health is missing artifact identity', () => {
    const evidence = buildParityEvidence({
      ...BASE,
      healthBody: { status: 'healthy' },
    });

    expect(evidence.overallPass).toBe(false);
    expect(evidence.identityParity.hasArtifactBlock).toBe(false);
    expect(evidence.identityParity.issues).toContain('health.artifact.missing');
  });

  it('fails when artifact commit/version mismatch expected identity', () => {
    const evidence = buildParityEvidence({
      ...BASE,
      healthBody: {
        status: 'healthy',
        artifact: {
          version: '00.000.100',
          commitSha: 'deadbeef',
          buildTimestamp: '2026-04-23T20:29:59.604Z',
        },
      },
    });

    expect(evidence.overallPass).toBe(false);
    expect(evidence.identityParity.versionMatch).toBe(false);
    expect(evidence.identityParity.commitShaMatch).toBe(false);
  });

  it('fails when preview/replay route probes return 404', () => {
    const evidence = buildParityEvidence({
      ...BASE,
      healthBody: {
        status: 'healthy',
        artifact: {
          version: BASE.expectedIdentity.version,
          commitSha: BASE.expectedIdentity.commitSha,
          buildTimestamp: '2026-04-23T20:29:59.604Z',
        },
      },
      routeStatuses: [
        { route: '/api/safety-records/ingest', method: 'POST', status: 401 },
        { route: '/api/safety-records/ingest/preview', method: 'POST', status: 404 },
        { route: '/api/safety-records/replay', method: 'POST', status: 404 },
        { route: '/api/safety-records/provision-sharepoint', method: 'POST', status: 404 },
      ],
    });

    expect(evidence.overallPass).toBe(false);
    expect(evidence.routeTruth.allPresent).toBe(false);
    expect(evidence.routeTruth.issues.some((issue) => issue.includes('ingest/preview'))).toBe(true);
    expect(evidence.routeTruth.issues.some((issue) => issue.includes('/replay'))).toBe(true);
  });

  it('fails when deploy-stamped identity settings are missing', () => {
    const evidence = buildParityEvidence({
      ...BASE,
      healthBody: {
        status: 'healthy',
        artifact: {
          version: BASE.expectedIdentity.version,
          commitSha: BASE.expectedIdentity.commitSha,
          buildTimestamp: '2026-04-23T20:29:59.604Z',
        },
      },
      appSettings: {},
    });

    expect(evidence.overallPass).toBe(false);
    expect(evidence.deployStampTruth.present).toBe(false);
    expect(evidence.deployStampTruth.issues).toContain('appsettings.HBC_FUNCTIONS_BUILD_VERSION.missing');
    expect(evidence.deployStampTruth.issues).toContain('appsettings.HBC_FUNCTIONS_BUILD_SHA.missing');
    expect(evidence.deployStampTruth.issues).toContain('appsettings.HBC_FUNCTIONS_BUILD_TIMESTAMP.missing');
  });

  it('passes when identity, routes, health-ready, and stamp settings all match', () => {
    const evidence = buildParityEvidence({
      ...BASE,
      healthBody: {
        status: 'healthy',
        artifact: {
          version: BASE.expectedIdentity.version,
          commitSha: BASE.expectedIdentity.commitSha,
          buildTimestamp: '2026-04-23T20:29:59.604Z',
        },
        timestamp: '2026-04-23T20:30:31.704Z',
      },
    });

    expect(evidence.overallPass).toBe(true);
    expect(evidence.identityParity.issues).toHaveLength(0);
    expect(evidence.routeTruth.issues).toHaveLength(0);
    expect(evidence.commandAuthTruth.malformedBearer.issues).toHaveLength(0);
    expect(evidence.healthReadyTruth.issues).toHaveLength(0);
    expect(evidence.readinessAuthTruth.noAuth.issues).toHaveLength(0);
    expect(evidence.readinessAuthTruth.malformedBearer.issues).toHaveLength(0);
    expect(evidence.readinessAuthTruth.nonAdminBearer.attempted).toBe(false);
    expect(evidence.healthPublicContract.issues).toHaveLength(0);
    expect(evidence.deployStampTruth.issues).toHaveLength(0);
  });

  it('fails when malformed bearer does not return 401', () => {
    const evidence = buildParityEvidence({
      ...BASE,
      healthBody: {
        status: 'healthy',
        artifact: {
          version: BASE.expectedIdentity.version,
          commitSha: BASE.expectedIdentity.commitSha,
          buildTimestamp: '2026-04-23T20:29:59.604Z',
        },
        timestamp: '2026-04-23T20:30:31.704Z',
      },
      healthReadyMalformedAuthStatus: 404,
    });

    expect(evidence.overallPass).toBe(false);
    expect(evidence.readinessAuthTruth.malformedBearer.issues).toContain(
      'readiness.malformed_bearer.unexpected_status(expected=401,live=404)',
    );
  });

  it('fails admin probe when status is 200 but readiness contract keys are missing', () => {
    const evidence = buildParityEvidence({
      ...BASE,
      healthBody: {
        status: 'healthy',
        artifact: {
          version: BASE.expectedIdentity.version,
          commitSha: BASE.expectedIdentity.commitSha,
          buildTimestamp: '2026-04-23T20:29:59.604Z',
        },
        timestamp: '2026-04-23T20:30:31.704Z',
      },
      healthReadyAdminStatus: 200,
      healthReadyAdminBody: { status: 'healthy' },
    });

    expect(evidence.overallPass).toBe(false);
    expect(evidence.readinessAuthTruth.adminBearer.attempted).toBe(true);
    expect(evidence.readinessAuthTruth.adminBearer.passed).toBe(false);
    expect(evidence.readinessAuthTruth.adminBearer.issues).toContain(
      'readiness.admin_bearer.contract_missing(operationalReadiness)',
    );
  });

  it('fails non-admin probe when status is not 403', () => {
    const evidence = buildParityEvidence({
      ...BASE,
      healthBody: {
        status: 'healthy',
        artifact: {
          version: BASE.expectedIdentity.version,
          commitSha: BASE.expectedIdentity.commitSha,
          buildTimestamp: '2026-04-23T20:29:59.604Z',
        },
        timestamp: '2026-04-23T20:30:31.704Z',
      },
      healthReadyNonAdminStatus: 401,
    });

    expect(evidence.overallPass).toBe(false);
    expect(evidence.readinessAuthTruth.nonAdminBearer.attempted).toBe(true);
    expect(evidence.readinessAuthTruth.nonAdminBearer.passed).toBe(false);
    expect(evidence.readinessAuthTruth.nonAdminBearer.issues).toContain(
      'readiness.non_admin_bearer.unexpected_status(expected=403,live=401)',
    );
  });

  it('fails when malformed command bearer auth is not denied', () => {
    const evidence = buildParityEvidence({
      ...BASE,
      healthBody: {
        status: 'healthy',
        artifact: {
          version: BASE.expectedIdentity.version,
          commitSha: BASE.expectedIdentity.commitSha,
          buildTimestamp: '2026-04-23T20:29:59.604Z',
        },
        timestamp: '2026-04-23T20:30:31.704Z',
      },
      malformedRouteStatuses: [
        { route: '/api/safety-records/ingest', method: 'POST', status: 400 },
        { route: '/api/safety-records/ingest/preview', method: 'POST', status: 401 },
        { route: '/api/safety-records/replay', method: 'POST', status: 401 },
        { route: '/api/safety-records/provision-sharepoint', method: 'POST', status: 401 },
      ],
    });

    expect(evidence.overallPass).toBe(false);
    expect(evidence.commandAuthTruth.malformedBearer.issues).toContain(
      'command_auth.malformed_bearer.unexpected_status(/api/safety-records/ingest expected=401,live=400)',
    );
  });

  it('fails when preview route without auth is not 401', () => {
    const evidence = buildParityEvidence({
      ...BASE,
      healthBody: {
        status: 'healthy',
        artifact: {
          version: BASE.expectedIdentity.version,
          commitSha: BASE.expectedIdentity.commitSha,
          buildTimestamp: '2026-04-23T20:29:59.604Z',
        },
        timestamp: '2026-04-23T20:30:31.704Z',
      },
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

  it('fails when malformed preview response omits x-request-id', () => {
    const evidence = buildParityEvidence({
      ...BASE,
      healthBody: {
        status: 'healthy',
        artifact: {
          version: BASE.expectedIdentity.version,
          commitSha: BASE.expectedIdentity.commitSha,
          buildTimestamp: '2026-04-23T20:29:59.604Z',
        },
        timestamp: '2026-04-23T20:30:31.704Z',
      },
      malformedRouteProbes: [
        {
          route: '/api/safety-records/ingest',
          method: 'POST',
          status: 401,
          exists: true,
          responseRequestIdPresent: true,
        },
        {
          route: '/api/safety-records/ingest/preview',
          method: 'POST',
          status: 401,
          exists: true,
          responseRequestIdPresent: false,
        },
        {
          route: '/api/safety-records/replay',
          method: 'POST',
          status: 401,
          exists: true,
          responseRequestIdPresent: true,
        },
        {
          route: '/api/safety-records/provision-sharepoint',
          method: 'POST',
          status: 401,
          exists: true,
          responseRequestIdPresent: true,
        },
      ],
    });

    expect(evidence.overallPass).toBe(false);
    expect(evidence.commandAuthTruth.malformedBearer.issues).toContain(
      'command_auth.malformed_bearer.preview.missing_x_request_id',
    );
  });

  it('fails when non-admin token can call provisioning route', () => {
    const evidence = buildParityEvidence({
      ...BASE,
      healthBody: {
        status: 'healthy',
        artifact: {
          version: BASE.expectedIdentity.version,
          commitSha: BASE.expectedIdentity.commitSha,
          buildTimestamp: '2026-04-23T20:29:59.604Z',
        },
        timestamp: '2026-04-23T20:30:31.704Z',
      },
      healthReadyNonAdminStatus: 403,
      nonAdminRouteStatuses: [
        { route: '/api/safety-records/ingest', method: 'POST', status: 400 },
        { route: '/api/safety-records/ingest/preview', method: 'POST', status: 200 },
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
    it('passes when all required function inventory and route probes are healthy', () => {
      const evidence = buildParityEvidence({ ...BASE, healthBody: HEALTHY_BODY });

      expect(evidence.overallPass).toBe(true);
      expect(evidence.myWorkRouteTruth.functionInventory.allPresent).toBe(true);
      expect(evidence.myWorkRouteTruth.functionInventory.found).toHaveLength(5);
      expect(evidence.myWorkRouteTruth.functionInventory.missing).toHaveLength(0);
      expect(evidence.myWorkRouteTruth.routeProbes.allPresent).toBe(true);
      expect(evidence.myWorkRouteTruth.routeProbes.issues).toHaveLength(0);
    });

    it('fails when a required function registration is missing from the live inventory', () => {
      const evidence = buildParityEvidence({
        ...BASE,
        healthBody: HEALTHY_BODY,
        myWorkFunctionInventory: [
          'hb-intel-function-app/getMyWorkHome',
          'hb-intel-function-app/getMyWorkAdobeSignActionQueue',
          'hb-intel-function-app/getMyWorkProjectLinks',
          'hb-intel-function-app/startAdobeSignOAuth',
          // completeAdobeSignOAuthCallback intentionally absent
        ],
      });

      expect(evidence.overallPass).toBe(false);
      expect(evidence.myWorkRouteTruth.functionInventory.allPresent).toBe(false);
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
        healthBody: HEALTHY_BODY,
        myWorkRouteStatuses: [
          { route: '/api/my-work/me/home', method: 'GET', status: 404 },
          { route: '/api/my-work/me/project-links', method: 'GET', status: 401 },
          { route: '/api/my-work/me/adobe-sign/action-queue', method: 'GET', status: 401 },
          { route: '/api/my-work/me/adobe-sign/oauth/start', method: 'POST', status: 401 },
          { route: '/api/my-work/adobe-sign/oauth/callback', method: 'GET', status: 302 },
        ],
      });

      expect(evidence.overallPass).toBe(false);
      expect(evidence.myWorkRouteTruth.routeProbes.allPresent).toBe(false);
      expect(evidence.myWorkRouteTruth.routeProbes.issues).toContain(
        'my_work.route.missing(GET /api/my-work/me/home status=404)',
      );
    });

    it('fails when a protected My Work route returns a non-401 denial status', () => {
      const evidence = buildParityEvidence({
        ...BASE,
        healthBody: HEALTHY_BODY,
        myWorkRouteStatuses: [
          { route: '/api/my-work/me/home', method: 'GET', status: 200 },
          { route: '/api/my-work/me/project-links', method: 'GET', status: 401 },
          { route: '/api/my-work/me/adobe-sign/action-queue', method: 'GET', status: 401 },
          { route: '/api/my-work/me/adobe-sign/oauth/start', method: 'POST', status: 401 },
          { route: '/api/my-work/adobe-sign/oauth/callback', method: 'GET', status: 302 },
        ],
      });

      expect(evidence.overallPass).toBe(false);
      expect(evidence.myWorkRouteTruth.routeProbes.issues).toContain(
        'my_work.route.unexpected_auth_status(GET /api/my-work/me/home expected=401,live=200)',
      );
    });

    it('passes the public OAuth callback on a 302 redirect response', () => {
      const evidence = buildParityEvidence({ ...BASE, healthBody: HEALTHY_BODY });

      expect(evidence.myWorkRouteTruth.routeProbes.issues).toHaveLength(0);
      const callback = evidence.myWorkRouteTruth.routeProbes.routes.find(
        (r) => r.route === '/api/my-work/adobe-sign/oauth/callback',
      );
      expect(callback?.status).toBe(302);
      expect(callback?.exists).toBe(true);
    });

    it('fails when the public OAuth callback returns 404', () => {
      const evidence = buildParityEvidence({
        ...BASE,
        healthBody: HEALTHY_BODY,
        myWorkRouteStatuses: [
          { route: '/api/my-work/me/home', method: 'GET', status: 401 },
          { route: '/api/my-work/me/project-links', method: 'GET', status: 401 },
          { route: '/api/my-work/me/adobe-sign/action-queue', method: 'GET', status: 401 },
          { route: '/api/my-work/me/adobe-sign/oauth/start', method: 'POST', status: 401 },
          { route: '/api/my-work/adobe-sign/oauth/callback', method: 'GET', status: 404 },
        ],
      });

      expect(evidence.overallPass).toBe(false);
      expect(evidence.myWorkRouteTruth.routeProbes.issues).toContain(
        'my_work.route.missing(GET /api/my-work/adobe-sign/oauth/callback status=404)',
      );
    });

    it('forces overallPass false when My Work inventory and route truth fail together', () => {
      const evidence = buildParityEvidence({
        ...BASE,
        healthBody: HEALTHY_BODY,
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
