import { describe, expect, it } from 'vitest';
import {
  createLivingStrategicIntelligenceEntry,
  createStrategicIntelligenceState,
  StrategicIntelligenceApi,
  StrategicIntelligenceLifecycleApi,
} from '../index.js';
import { useStrategicIntelligenceState } from './useStrategicIntelligenceState.js';

describe('strategic intelligence primitive integrations', () => {
  it('keeps index/search outputs policy-safe with approved-only eligibility', () => {
    const scorecardId = 'si-primitive-integrations-1';
    const state = createStrategicIntelligenceState({ scorecardId });

    state.livingEntries = [
      createLivingStrategicIntelligenceEntry({
        entryId: 'entry-approved-public',
        lifecycleState: 'approved',
        sensitivity: 'public-internal',
      }),
      createLivingStrategicIntelligenceEntry({
        entryId: 'entry-approved-restricted',
        lifecycleState: 'approved',
        sensitivity: 'restricted-role',
      }),
      createLivingStrategicIntelligenceEntry({
        entryId: 'entry-pending',
        lifecycleState: 'pending-approval',
      }),
      createLivingStrategicIntelligenceEntry({
        entryId: 'entry-rejected',
        lifecycleState: 'rejected',
      }),
    ];

    const api = new StrategicIntelligenceApi([state]);
    const lifecycleApi = new StrategicIntelligenceLifecycleApi(api);

    const result = useStrategicIntelligenceState(
      {
        projectId: scorecardId,
        visibilityContext: 'bd-panel',
        scorecardId,
      },
      {
        api,
        lifecycleApi,
      }
    );

    expect(result.policy.indexableEntryIds).toEqual([
      'entry-approved-public',
      'entry-approved-restricted',
    ]);
    expect(result.policy.excludedEntryIds).toEqual(['entry-pending', 'entry-rejected']);

    const restrictedProjection = result.policy.redactedProjections.find(
      (item) => item.entryId === 'entry-approved-restricted'
    );
    expect(restrictedProjection?.summary).toBe('Redacted due to sensitivity policy.');
    expect(restrictedProjection?.redactionReason).toContain('restricted-role');
  });

  it('emits provenance-safe integration payloads from lifecycle API', () => {
    const scorecardId = 'si-primitive-integrations-2';
    const state = createStrategicIntelligenceState({ scorecardId });

    state.livingEntries = [
      createLivingStrategicIntelligenceEntry({
        entryId: 'entry-approved-1',
        lifecycleState: 'approved',
        metadata: {
          client: 'Harbor District',
          sector: 'infrastructure',
        },
      }),
      createLivingStrategicIntelligenceEntry({
        entryId: 'entry-pending-2',
        lifecycleState: 'pending-approval',
        metadata: {
          client: 'Pending Client',
        },
      }),
    ];

    const api = new StrategicIntelligenceApi([state]);
    const lifecycleApi = new StrategicIntelligenceLifecycleApi(api);

    const payload = lifecycleApi.emitProvenanceSafeProjectionPayload(scorecardId);

    expect(payload.indexingPayload.indexableEntries.map((entry) => entry.entryId)).toEqual([
      'entry-approved-1',
    ]);
    expect(payload.indexingPayload.excludedEntryIds).toContain('entry-pending-2');
    expect(payload.suggestionFactors[0]?.factors.some((factor) => factor.startsWith('provenance:'))).toBe(
      true
    );
  });
});
