/**
 * SF28-T08 — Mock factory for IActivityEvent.
 */
import type { IActivityEvent } from '../src/types/index.js';

export function createMockActivityEvent(
  overrides?: Partial<IActivityEvent>,
): IActivityEvent {
  return {
    eventId: 'evt-mock-001',
    type: 'field-changed',
    actor: {
      type: 'user',
      initiatedByUpn: 'pm@example.com',
      initiatedByName: 'Jane Smith',
    },
    primaryRef: {
      moduleKey: 'financial',
      recordId: 'fc-001',
      projectId: 'proj-001',
    },
    relatedRefs: [],
    timestampIso: '2026-03-23T14:00:00.000Z',
    summary: 'Q3 forecast updated with revised GC/GR model.',
    details: null,
    diffEntries: [],
    context: {
      sourceModuleKey: 'financial',
      emission: 'remote',
    },
    confidence: 'trusted-authoritative',
    syncState: 'authoritative',
    recommendedOpenAction: null,
    dedupe: null,
    ...overrides,
  };
}
