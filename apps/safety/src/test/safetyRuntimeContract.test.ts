import { afterEach, describe, expect, it } from 'vitest';
import { configureSafetyListGuids, resetSafetyListGuidOverlay } from '@hbc/features-safety';
import { resolveSafetyRuntimeContract } from '../runtime/safetyRuntimeContract.js';
import { hostedSafetyGuidOverlayFingerprint } from '../runtime/hostedSafetyGuidBinding.js';

const COMPLETE_HOSTED_OVERLAY = {
  SafetyReportingPeriods: 'c30e6f0f-44be-49bd-ad14-46701f96cedb',
  SafetyProjectWeekRecords: '404546f4-c827-4d87-816b-fa526c15852b',
  SafetyInspectionEvents: 'dca4537f-7f3a-4159-b48f-f06f2944dc59',
  SafetyFindings: '8140e59a-0fed-4681-8e8d-8360c93d2d08',
  SafetyIngestionRuns: '965d5b6a-6bec-425a-b19c-6fb56c717c30',
  SafetyChecklistUploads: 'ad498f9c-d0dd-4dd5-ba85-fe36d585adc6',
  Projects: '1ac57cbb-9f0a-457f-9c97-081a29f45b12',
  LegacyProjectFallbackRegistry: '2c24aa84-38f4-4793-9576-2ee23bedd74a',
} as const;

describe('resolveSafetyRuntimeContract', () => {
  afterEach(() => {
    resetSafetyListGuidOverlay();
  });

  it('fails closed in sharepoint mode when backend config is missing', () => {
    const contract = resolveSafetyRuntimeContract({
      hasSpfxContext: true,
      config: {},
    });

    expect(contract.hostMode).toBe('sharepoint');
    expect(contract.backend.baseUrlPresent).toBe(false);
    expect(contract.backend.apiAudiencePresent).toBe(false);
    expect(contract.canInitializeCommands).toBe(false);
    expect(contract.blockingReasons).toEqual(
      expect.arrayContaining([
        'Backend base URL is missing.',
        'API audience is missing.',
        'Accepted backend origin is missing.',
        'Expected manifest ID is missing.',
        'Expected package version is missing.',
        'Expected API audience is missing.',
        'Expected hosted GUID overlay fingerprint is missing.',
      ]),
    );
  });

  it('passes sharepoint mode when backend config and hosted overlay are complete', () => {
    configureSafetyListGuids(COMPLETE_HOSTED_OVERLAY);

    const contract = resolveSafetyRuntimeContract({
      hasSpfxContext: true,
      config: {
        functionAppUrl: 'https://functions.example.com/',
        apiAudience: 'api://safety-functions',
        acceptedBackendOrigin: 'https://functions.example.com',
        expectedManifestId: 'ba2cd939-ed9e-4aea-bb8c-324ed1d67e9e',
        expectedPackageVersion: '1.2.44.0',
        expectedApiAudience: 'api://safety-functions',
        expectedHostedGuidOverlayFingerprint: hostedSafetyGuidOverlayFingerprint(),
      },
    });

    expect(contract.canInitializeCommands).toBe(true);
    expect(contract.backend.baseUrl).toBe('https://functions.example.com');
    expect(contract.hostedGuidOverlay.known).toBe(true);
    expect(contract.governed.backendOriginMatchesAccepted).toBe(true);
    expect(contract.governed.manifestIdMatchesExpected).toBe(true);
    expect(contract.governed.packageVersionMatchesExpected).toBe(true);
    expect(contract.hostedGuidOverlay.fingerprintMatchesExpected).toBe(true);
    expect(contract.blockingReasons).toEqual([]);
  });

  it('fails closed when shell-hosted Safety omits the hosting webpart manifest ID', () => {
    configureSafetyListGuids(COMPLETE_HOSTED_OVERLAY);

    const contract = resolveSafetyRuntimeContract({
      hasSpfxContext: true,
      hostSource: 'shell-webpart',
      config: {
        functionAppUrl: 'https://functions.example.com/',
        apiAudience: 'api://safety-functions',
        acceptedBackendOrigin: 'https://functions.example.com',
        expectedManifestId: 'ba2cd939-ed9e-4aea-bb8c-324ed1d67e9e',
        expectedPackageVersion: '1.2.44.0',
        expectedApiAudience: 'api://safety-functions',
        expectedHostedGuidOverlayFingerprint: hostedSafetyGuidOverlayFingerprint(),
      },
    });

    expect(contract.canInitializeCommands).toBe(false);
    expect(contract.blockingReasons).toContain(
      'Shell-hosted Safety must declare the hosting webpart manifest ID.',
    );
    expect(contract.governed.webPartIdPresent).toBe(false);
    expect(contract.governed.webPartIdMatchesManifest).toBe(false);
  });

  it('fails closed when shell-hosted Safety declares a mismatched webPartId', () => {
    configureSafetyListGuids(COMPLETE_HOSTED_OVERLAY);

    const contract = resolveSafetyRuntimeContract({
      hasSpfxContext: true,
      hostSource: 'shell-webpart',
      config: {
        functionAppUrl: 'https://functions.example.com/',
        apiAudience: 'api://safety-functions',
        acceptedBackendOrigin: 'https://functions.example.com',
        expectedManifestId: 'ba2cd939-ed9e-4aea-bb8c-324ed1d67e9e',
        expectedPackageVersion: '1.2.44.0',
        expectedApiAudience: 'api://safety-functions',
        expectedHostedGuidOverlayFingerprint: hostedSafetyGuidOverlayFingerprint(),
        webPartId: '00000000-0000-0000-0000-000000000000',
      },
    });

    expect(contract.canInitializeCommands).toBe(false);
    expect(contract.blockingReasons).toContain(
      'Shell-hosted Safety webPartId does not match Safety webpart authority.',
    );
    expect(contract.governed.webPartIdPresent).toBe(true);
    expect(contract.governed.webPartIdMatchesManifest).toBe(false);
  });

  it('passes shell-hosted Safety with matching webPartId and complete governance', () => {
    configureSafetyListGuids(COMPLETE_HOSTED_OVERLAY);

    const fnUrl = 'https://hb-intel-function-app-gbd6ecgrh7fsgscm.eastus2-01.azurewebsites.net';
    const audience = 'api://08c399eb-a394-4087-b859-659d493f8dc7';
    const contract = resolveSafetyRuntimeContract({
      hasSpfxContext: true,
      hostSource: 'shell-webpart',
      config: {
        functionAppUrl: fnUrl,
        apiAudience: audience,
        acceptedBackendOrigin: fnUrl,
        expectedManifestId: 'ba2cd939-ed9e-4aea-bb8c-324ed1d67e9e',
        expectedPackageVersion: '1.2.44.0',
        expectedApiAudience: audience,
        expectedHostedGuidOverlayFingerprint: hostedSafetyGuidOverlayFingerprint(),
        webPartId: 'ba2cd939-ed9e-4aea-bb8c-324ed1d67e9e',
      },
    });

    expect(contract.canInitializeCommands).toBe(true);
    expect(contract.blockingReasons).toEqual([]);
    expect(contract.governed.webPartIdPresent).toBe(true);
    expect(contract.governed.webPartIdMatchesManifest).toBe(true);
    expect(contract.governed.webPartId).toBe('ba2cd939-ed9e-4aea-bb8c-324ed1d67e9e');
  });

  it('fails closed when backend URL origin does not match accepted backend origin', () => {
    configureSafetyListGuids(COMPLETE_HOSTED_OVERLAY);
    const contract = resolveSafetyRuntimeContract({
      hasSpfxContext: true,
      config: {
        functionAppUrl: 'https://functions.example.com',
        apiAudience: 'api://safety-functions',
        acceptedBackendOrigin: 'https://other-functions.example.com',
        expectedManifestId: 'ba2cd939-ed9e-4aea-bb8c-324ed1d67e9e',
        expectedPackageVersion: '1.2.44.0',
        expectedApiAudience: 'api://safety-functions',
        expectedHostedGuidOverlayFingerprint: hostedSafetyGuidOverlayFingerprint(),
      },
    });

    expect(contract.canInitializeCommands).toBe(false);
    expect(contract.blockingReasons).toContain('Backend base URL origin does not match accepted backend origin.');
  });

  it('fails closed when governed package or manifest authority values mismatch', () => {
    configureSafetyListGuids(COMPLETE_HOSTED_OVERLAY);
    const contract = resolveSafetyRuntimeContract({
      hasSpfxContext: true,
      config: {
        functionAppUrl: 'https://functions.example.com',
        apiAudience: 'api://safety-functions',
        acceptedBackendOrigin: 'https://functions.example.com',
        expectedManifestId: 'bad-manifest-id',
        expectedPackageVersion: '9.9.9.9',
        expectedHostedGuidOverlayFingerprint: hostedSafetyGuidOverlayFingerprint(),
      },
    });

    expect(contract.canInitializeCommands).toBe(false);
    expect(contract.blockingReasons).toEqual(
      expect.arrayContaining([
        'Expected manifest ID does not match Safety webpart authority.',
        'Expected package version does not match governed Safety package version.',
      ]),
    );
  });

  it('fails closed when property-pane API audience drifts from governed expected audience', () => {
    configureSafetyListGuids(COMPLETE_HOSTED_OVERLAY);
    const contract = resolveSafetyRuntimeContract({
      hasSpfxContext: true,
      config: {
        functionAppUrl: 'https://functions.example.com',
        apiAudience: 'api://operator-typo',
        acceptedBackendOrigin: 'https://functions.example.com',
        expectedManifestId: 'ba2cd939-ed9e-4aea-bb8c-324ed1d67e9e',
        expectedPackageVersion: '1.2.44.0',
        expectedApiAudience: 'api://safety-functions',
        expectedHostedGuidOverlayFingerprint: hostedSafetyGuidOverlayFingerprint(),
      },
    });

    expect(contract.canInitializeCommands).toBe(false);
    expect(contract.governed.apiAudienceMatchesExpected).toBe(false);
    expect(contract.blockingReasons).toContain(
      'API audience does not match governed expected audience.',
    );
  });

  it('fails closed when acceptedBackendOrigin is governed separately from functionAppUrl', () => {
    configureSafetyListGuids(COMPLETE_HOSTED_OVERLAY);
    // Operator pastes a typo; governed accepted origin is the real allowlist
    // and does NOT track the property-pane value.
    const contract = resolveSafetyRuntimeContract({
      hasSpfxContext: true,
      config: {
        functionAppUrl: 'https://attacker.example.com',
        apiAudience: 'api://safety-functions',
        acceptedBackendOrigin: 'https://functions.example.com',
        expectedManifestId: 'ba2cd939-ed9e-4aea-bb8c-324ed1d67e9e',
        expectedPackageVersion: '1.2.44.0',
        expectedApiAudience: 'api://safety-functions',
        expectedHostedGuidOverlayFingerprint: hostedSafetyGuidOverlayFingerprint(),
      },
    });

    expect(contract.canInitializeCommands).toBe(false);
    expect(contract.governed.backendOriginMatchesAccepted).toBe(false);
    expect(contract.blockingReasons).toContain(
      'Backend base URL origin does not match accepted backend origin.',
    );
  });

  it('fails closed when hosted GUID overlay fingerprint mismatches expected value', () => {
    configureSafetyListGuids(COMPLETE_HOSTED_OVERLAY);
    const contract = resolveSafetyRuntimeContract({
      hasSpfxContext: true,
      config: {
        functionAppUrl: 'https://functions.example.com',
        apiAudience: 'api://safety-functions',
        acceptedBackendOrigin: 'https://functions.example.com',
        expectedManifestId: 'ba2cd939-ed9e-4aea-bb8c-324ed1d67e9e',
        expectedPackageVersion: '1.2.44.0',
        expectedHostedGuidOverlayFingerprint: 'fnv1a32:deadbeef',
      },
    });

    expect(contract.canInitializeCommands).toBe(false);
    expect(contract.blockingReasons).toContain(
      'Hosted GUID overlay fingerprint does not match expected governance value.',
    );
  });

  it('produces fully governed contract for SharePoint-hosted Safety with Prompt 02 tenant values', () => {
    configureSafetyListGuids(COMPLETE_HOSTED_OVERLAY);
    const fnUrl = 'https://hb-intel-function-app-gbd6ecgrh7fsgscm.eastus2-01.azurewebsites.net';
    const audience = 'api://08c399eb-a394-4087-b859-659d493f8dc7';
    const contract = resolveSafetyRuntimeContract({
      hasSpfxContext: true,
      config: {
        functionAppUrl: fnUrl,
        apiAudience: audience,
        acceptedBackendOrigin: fnUrl,
        expectedManifestId: 'ba2cd939-ed9e-4aea-bb8c-324ed1d67e9e',
        expectedPackageVersion: '1.2.44.0',
        expectedApiAudience: audience,
        expectedHostedGuidOverlayFingerprint: hostedSafetyGuidOverlayFingerprint(),
      },
    });

    expect(contract.canInitializeCommands).toBe(true);
    expect(contract.blockingReasons).toEqual([]);
    expect(contract.backend.baseUrl).toBe(fnUrl);
    expect(contract.backend.apiAudience).toBe(audience);
    expect(contract.governed.acceptedBackendOrigin).toBe(fnUrl);
    expect(contract.governed.expectedManifestId).toBe('ba2cd939-ed9e-4aea-bb8c-324ed1d67e9e');
    expect(contract.governed.expectedPackageVersion).toBe('1.2.44.0');
    expect(contract.governed.expectedApiAudience).toBe(audience);
    expect(contract.hostedGuidOverlay.expectedFingerprint).toBe('fnv1a32:36b2f764');
  });
});
