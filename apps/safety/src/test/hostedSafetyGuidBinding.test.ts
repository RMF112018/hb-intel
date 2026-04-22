import { afterEach, describe, expect, it } from 'vitest';
import {
  createSafetyInspectionRepository,
  currentSafetyGuidOverlay,
  resetSafetyListGuidOverlay,
  type SpHttpClient,
} from '@hbc/features-safety';
import {
  bindHostedSafetyGuidOverlay,
  findMissingHostedSafetyGuidBindings,
  hostedSafetyGuidOverlay,
} from '../runtime/hostedSafetyGuidBinding.js';

describe('hostedSafetyGuidBinding', () => {
  afterEach(() => {
    resetSafetyListGuidOverlay();
  });

  it('returns the authoritative seven-list overlay for hosted HBCentral reads', () => {
    const overlay = hostedSafetyGuidOverlay();
    expect(overlay).toEqual({
      SafetyReportingPeriods: 'c30e6f0f-44be-49bd-ad14-46701f96cedb',
      SafetyProjectWeekRecords: '404546f4-c827-4d87-816b-fa526c15852b',
      SafetyInspectionEvents: 'dca4537f-7f3a-4159-b48f-f06f2944dc59',
      SafetyFindings: '8140e59a-0fed-4681-8e8d-8360c93d2d08',
      SafetyIngestionRuns: '965d5b6a-6bec-425a-b19c-6fb56c717c30',
      SafetyChecklistUploads: 'ad498f9c-d0dd-4dd5-ba85-fe36d585adc6',
      Projects: '1ac57cbb-9f0a-457f-9c97-081a29f45b12',
      LegacyProjectFallbackRegistry: '2c24aa84-38f4-4793-9576-2ee23bedd74a',
    });
  });

  it('binds the hosted overlay into the shared descriptor runtime state', () => {
    bindHostedSafetyGuidOverlay();
    const overlay = currentSafetyGuidOverlay();
    expect(findMissingHostedSafetyGuidBindings(overlay)).toEqual([]);
  });

  it('reports exactly which hosted keys are missing', () => {
    const missing = findMissingHostedSafetyGuidBindings({
      SafetyReportingPeriods: 'c30e6f0f-44be-49bd-ad14-46701f96cedb',
      SafetyChecklistUploads: 'ad498f9c-d0dd-4dd5-ba85-fe36d585adc6',
      Projects: '1ac57cbb-9f0a-457f-9c97-081a29f45b12',
    });
    expect(missing).toEqual([
      'SafetyProjectWeekRecords',
      'SafetyInspectionEvents',
      'SafetyFindings',
      'SafetyIngestionRuns',
      'LegacyProjectFallbackRegistry',
    ]);
  });

  it('supports hosted sharepoint repository creation after binding', async () => {
    bindHostedSafetyGuidOverlay();
    const calls: string[] = [];
    const client: SpHttpClient = {
      get: async (url) => {
        calls.push(url);
        return {
          ok: true,
          status: 200,
          json: async () => ({ value: [] }),
          text: async () => '',
        } as unknown as Response;
      },
      post: async () =>
        ({
          ok: true,
          status: 200,
          json: async () => ({}),
          text: async () => '',
        }) as unknown as Response,
    };
    const repository = createSafetyInspectionRepository({
      mode: 'sharepoint',
      sharepoint: { client },
    });
    await repository.listReportingPeriods();
    expect(calls[0]).toContain("lists(guid'c30e6f0f-44be-49bd-ad14-46701f96cedb')");
  });
});
