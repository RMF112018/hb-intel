import { describe, expect, it } from 'vitest';
import { buildParityEvidence } from './verify-functions-live-parity';

const BASE = {
  appName: 'hb-intel-function-app',
  resourceGroup: 'hb-intel',
  hostName: 'hb-intel-function-app-gbd6ecgrh7fsgscm.eastus2-01.azurewebsites.net',
  checkedAtUtc: '2026-04-23T20:30:31.704Z',
  expectedIdentity: {
    version: '00.000.145',
    commitSha: 'c621aee82bc9ec0dc0434225726b83a632ace5c7',
  },
  routeStatuses: [
    { route: '/api/safety-records/ingest', method: 'POST' as const, status: 401 },
    { route: '/api/safety-records/ingest/preview', method: 'POST' as const, status: 401 },
    { route: '/api/safety-records/replay', method: 'POST' as const, status: 401 },
  ],
  healthReadyStatus: 401,
  appSettings: {
    HBC_FUNCTIONS_BUILD_VERSION: '00.000.145',
    HBC_FUNCTIONS_BUILD_SHA: 'c621aee82bc9ec0dc0434225726b83a632ace5c7',
    HBC_FUNCTIONS_BUILD_TIMESTAMP: '2026-04-23T20:29:59.604Z',
  },
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
      },
    });

    expect(evidence.overallPass).toBe(true);
    expect(evidence.identityParity.issues).toHaveLength(0);
    expect(evidence.routeTruth.issues).toHaveLength(0);
    expect(evidence.healthReadyTruth.issues).toHaveLength(0);
    expect(evidence.deployStampTruth.issues).toHaveLength(0);
  });
});
