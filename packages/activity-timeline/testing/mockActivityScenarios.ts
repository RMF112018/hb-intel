/**
 * SF28-T08 — 10 canonical scenario fixtures.
 *
 * Each scenario is self-contained and usable in unit tests and Storybook.
 */
import { createMockActivityEvent } from './createMockActivityEvent.js';

export const mockActivityScenarios = {
  /** 1. User-originated event with authoritative persistence */
  userOriginated: createMockActivityEvent({
    eventId: 'scenario-user-001',
    type: 'field-changed',
    actor: { type: 'user', initiatedByUpn: 'pm@example.com', initiatedByName: 'Jane Smith' },
    confidence: 'trusted-authoritative',
    syncState: 'authoritative',
  }),

  /** 2. System-originated event with explicit system label */
  systemOriginated: createMockActivityEvent({
    eventId: 'scenario-system-001',
    type: 'system-alert',
    actor: { type: 'system', initiatedByUpn: 'system', initiatedByName: 'System' },
    summary: 'Automated schedule sync completed.',
  }),

  /** 3. Workflow-originated event with correlation */
  workflowOriginated: createMockActivityEvent({
    eventId: 'scenario-workflow-001',
    type: 'workflow-triggered',
    actor: {
      type: 'workflow',
      initiatedByUpn: 'exec@example.com',
      initiatedByName: 'Alice Exec',
      executedByUpn: 'pm@example.com',
      executedByName: 'Jane Smith',
      serviceIdentity: 'publish-workflow-svc',
    },
    context: { sourceModuleKey: 'reports', emission: 'remote', correlationId: 'wf-chain-001' },
  }),

  /** 4. Service-account event with on-behalf-of attribution */
  serviceAccount: createMockActivityEvent({
    eventId: 'scenario-service-001',
    type: 'published',
    actor: {
      type: 'service',
      initiatedByUpn: 'exec@example.com',
      initiatedByName: 'Alice Exec',
      onBehalfOfUpn: 'exec@example.com',
      onBehalfOfName: 'Alice Exec',
      serviceIdentity: 'report-publisher-svc',
    },
  }),

  /** 5. Field-level diff event */
  fieldDiff: createMockActivityEvent({
    eventId: 'scenario-diff-001',
    type: 'field-changed',
    summary: 'Estimated GMP updated.',
    diffEntries: [
      { fieldLabel: 'Estimated GMP', from: '$12,500,000', to: '$13,100,000' },
      { fieldLabel: 'Variance', from: '$0', to: '-$600,000' },
    ],
  }),

  /** 6. Related-record event correlated across refs */
  relatedRecord: createMockActivityEvent({
    eventId: 'scenario-related-001',
    type: 'handoff-completed',
    relatedRefs: [
      { moduleKey: 'estimating', recordId: 'est-001', relationshipLabel: 'source-pursuit' },
    ],
  }),

  /** 7. Replayed event after queued-local emission */
  replayed: createMockActivityEvent({
    eventId: 'scenario-replayed-001',
    syncState: 'replayed',
    confidence: 'replayed-awaiting-confirmation',
  }),

  /** 8. Deduplicated projection retaining raw evidence */
  deduplicated: createMockActivityEvent({
    eventId: 'scenario-dedup-001',
    dedupe: {
      rawEvidenceRetained: true,
      projectionAction: 'suppressed',
      reason: 'duplicate-within-threshold',
    },
  }),

  /** 9. Degraded-source event with confidence downgrade */
  degradedSource: createMockActivityEvent({
    eventId: 'scenario-degraded-001',
    syncState: 'degraded',
    confidence: 'degraded-source-context',
  }),

  /** 10. Workspace-mode projection */
  workspaceProjection: createMockActivityEvent({
    eventId: 'scenario-workspace-001',
    type: 'status-changed',
    primaryRef: { moduleKey: 'schedule', recordId: 'ms-001', projectId: 'proj-001' },
    summary: 'Milestone "Foundation Complete" marked done.',
  }),
} as const;
