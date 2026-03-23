/**
 * SF23-T08 — Mock factory for IRecordFormState.
 */
import type { IRecordFormState } from '../src/types/index.js';

export function createMockRecordFormState(
  overrides?: Partial<IRecordFormState>,
): IRecordFormState {
  return {
    draft: {
      draftId: 'draft-mock-001',
      recordId: null,
      projectId: 'proj-001',
      moduleKey: 'financial',
      mode: 'create',
      isDirty: false,
      lastSavedAtIso: null,
      createdAtIso: '2026-03-23T14:00:00.000Z',
      authorUpn: 'pm@example.com',
      schemaVersion: '1.0',
    },
    explanation: {
      isBlocked: false,
      blockReasons: [],
      hasWarnings: false,
      warnings: [],
      isRecoveryActive: false,
      summaryMessage: 'Ready to begin',
      deferReason: null,
    },
    validation: {
      isValid: true,
      errorCount: 0,
      errorFields: [],
      warningCount: 0,
      warnings: [],
    },
    complexityTier: 'standard',
    reviewSteps: [],
    nextRecommendedAction: null,
    failure: null,
    retry: null,
    telemetry: {
      openTimestampIso: '2026-03-23T14:00:00.000Z',
      submitStartTimestampIso: null,
      submitCompleteTimestampIso: null,
      timeToSubmitMs: null,
      abandonedBeforeSubmit: false,
      validationErrorCount: 0,
      draftSaveCount: 0,
      recoveryTriggered: false,
      formMode: 'create',
    },
    sync: { state: 'local-only', queuePosition: null, lastSyncAttemptIso: null },
    confidence: { level: 'local-unsynced', reasons: [] },
    ...overrides,
  };
}
