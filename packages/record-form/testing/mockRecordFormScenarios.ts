/**
 * SF23-T08 — 11 canonical scenario fixtures.
 */
import { createMockRecordFormState } from './createMockRecordFormState.js';

export const mockRecordFormScenarios = {
  /** 1. Create lifecycle — new record, not-started state */
  createLifecycle: createMockRecordFormState({ draft: { draftId: 's1', recordId: null, projectId: 'proj-001', moduleKey: 'financial', mode: 'create', isDirty: false, lastSavedAtIso: null, createdAtIso: '2026-03-23T14:00:00.000Z', authorUpn: 'pm@example.com', schemaVersion: '1.0' } }),
  /** 2. Blocked state with reason */
  blockedState: createMockRecordFormState({
    explanation: { isBlocked: true, blockReasons: [{ reasonCode: 'required-fields-missing', message: '3 required fields missing', affectedFields: ['name', 'status', 'date'] }], hasWarnings: false, warnings: [], isRecoveryActive: false, summaryMessage: 'Cannot submit — 3 required fields missing', deferReason: null },
    nextRecommendedAction: { actionKind: 'complete-required', reason: 'Fill in name, status, and date', side: 'author', category: 'data-completion' },
  }),
  /** 3. Valid with warnings */
  validWithWarnings: createMockRecordFormState({
    explanation: { isBlocked: false, blockReasons: [], hasWarnings: true, warnings: [{ fieldPath: 'budget', reasonCode: 'approaching-deadline', message: 'Budget deadline approaching' }], isRecoveryActive: false, summaryMessage: 'Valid with warnings', deferReason: null },
  }),
  /** 4. Stale restored draft */
  staleRestoredDraft: createMockRecordFormState({
    explanation: { isBlocked: false, blockReasons: [], hasWarnings: false, warnings: [], isRecoveryActive: true, summaryMessage: 'Draft recovered — review before continuing', deferReason: null },
    sync: { state: 'partially-recovered', queuePosition: null, lastSyncAttemptIso: null },
    confidence: { level: 'recovered-needs-review', reasons: ['Draft restored from offline cache'] },
  }),
  /** 5. Offline queued */
  offlineQueued: createMockRecordFormState({
    sync: { state: 'queued-to-sync', queuePosition: 2, lastSyncAttemptIso: null },
    confidence: { level: 'local-unsynced', reasons: [] },
  }),
  /** 6. Replay conflict */
  replayConflict: createMockRecordFormState({
    explanation: { isBlocked: true, blockReasons: [{ reasonCode: 'validation-errors', message: 'Conflict detected with server version', affectedFields: ['status'] }], hasWarnings: false, warnings: [], isRecoveryActive: true, summaryMessage: 'Replay conflict — resolve before continuing', deferReason: null },
  }),
  /** 7. Review handoff */
  reviewHandoff: createMockRecordFormState({
    reviewSteps: [{ stepId: 'review-1', blocking: true, phase: 'pre-submit', ownerUpn: 'exec@example.com', ownerName: 'Alice Executive', status: 'pending', reassignmentHistory: [] }],
    nextRecommendedAction: { actionKind: 'review', reason: 'Awaiting executive review', side: 'downstream-owner', category: 'review-completion' },
  }),
  /** 8. Deep-link projection */
  deepLinkProjection: createMockRecordFormState({ draft: { draftId: 's8', recordId: 'rec-001', projectId: 'proj-001', moduleKey: 'financial', mode: 'edit', isDirty: false, lastSavedAtIso: '2026-03-23T14:00:00.000Z', createdAtIso: '2026-03-23T13:00:00.000Z', authorUpn: 'pm@example.com', schemaVersion: '1.0' } }),
  /** 9. Complexity tier differences */
  essentialTier: createMockRecordFormState({ complexityTier: 'essential' }),
  /** 10. Admin governance */
  adminGovernance: createMockRecordFormState({
    explanation: { isBlocked: false, blockReasons: [], hasWarnings: false, warnings: [], isRecoveryActive: false, summaryMessage: 'Approved configuration active', deferReason: null },
    sync: { state: 'synced', queuePosition: null, lastSyncAttemptIso: '2026-03-23T14:05:00.000Z' },
    confidence: { level: 'trusted-synced', reasons: [] },
  }),
  /** 11. Telemetry KPIs */
  telemetryKpis: createMockRecordFormState({
    telemetry: { openTimestampIso: '2026-03-23T14:00:00.000Z', submitStartTimestampIso: '2026-03-23T14:10:00.000Z', submitCompleteTimestampIso: '2026-03-23T14:10:05.000Z', timeToSubmitMs: 600000, abandonedBeforeSubmit: false, validationErrorCount: 2, draftSaveCount: 5, recoveryTriggered: false, formMode: 'edit' },
  }),
} as const;
