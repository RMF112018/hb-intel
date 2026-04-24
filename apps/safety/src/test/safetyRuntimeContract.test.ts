import { afterEach, describe, expect, it } from 'vitest';
import { configureSafetyListGuids, resetSafetyListGuidOverlay } from '@hbc/features-safety';
import { resolveSafetyRuntimeContract } from '../runtime/safetyRuntimeContract.js';

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
      ]),
    );
  });

  it('passes sharepoint mode when backend config and hosted overlay are complete', () => {
    configureSafetyListGuids({
      SafetyReportingPeriods: 'c30e6f0f-44be-49bd-ad14-46701f96cedb',
      SafetyProjectWeekRecords: '404546f4-c827-4d87-816b-fa526c15852b',
      SafetyInspectionEvents: 'dca4537f-7f3a-4159-b48f-f06f2944dc59',
      SafetyFindings: '8140e59a-0fed-4681-8e8d-8360c93d2d08',
      SafetyIngestionRuns: '965d5b6a-6bec-425a-b19c-6fb56c717c30',
      SafetyChecklistUploads: 'ad498f9c-d0dd-4dd5-ba85-fe36d585adc6',
      Projects: '1ac57cbb-9f0a-457f-9c97-081a29f45b12',
      LegacyProjectFallbackRegistry: '2c24aa84-38f4-4793-9576-2ee23bedd74a',
    });

    const contract = resolveSafetyRuntimeContract({
      hasSpfxContext: true,
      config: {
        functionAppUrl: 'https://functions.example.com/',
        apiAudience: 'api://safety-functions',
      },
    });

    expect(contract.canInitializeCommands).toBe(true);
    expect(contract.backend.baseUrl).toBe('https://functions.example.com');
    expect(contract.hostedGuidOverlay.known).toBe(true);
    expect(contract.blockingReasons).toEqual([]);
  });
});
