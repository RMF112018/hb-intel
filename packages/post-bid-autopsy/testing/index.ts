import type {
  IBenchmarkDatasetEnrichmentSignal,
  IBicOwner,
  IAutopsyStorageMutation,
  IAutopsyTransitionCommand,
  IAutopsyTriggerInput,
  IAutopsyRecordSnapshot,
  IPostBidAutopsy,
} from '../src/index.js';
import {
  createPostBidAutopsyApiScaffold,
  createPostBidAutopsyRecord,
  createPostBidAutopsyRecordQueryKey,
} from '../src/index.js';

export const createMockPostBidAutopsyRecord = (
  overrides: Partial<IPostBidAutopsy> = {}
): IPostBidAutopsy =>
  createPostBidAutopsyRecord({
    autopsyId: 'autopsy-mock',
    pursuitId: 'pursuit-mock',
    scorecardId: 'scorecard-mock',
    ...overrides,
  });

export const createMockBenchmarkDatasetSignal = (
  overrides: Partial<IBenchmarkDatasetEnrichmentSignal> = {}
): IBenchmarkDatasetEnrichmentSignal => ({
  signalType: 'benchmark-dataset-enrichment',
  signalId: overrides.signalId ?? 'signal-mock',
  autopsyId: overrides.autopsyId ?? 'autopsy-mock',
  pursuitId: overrides.pursuitId ?? 'pursuit-mock',
  scorecardId: overrides.scorecardId ?? 'scorecard-mock',
  status: overrides.status ?? 'published',
  outcome: overrides.outcome ?? 'lost',
  confidenceTier: overrides.confidenceTier ?? 'moderate',
  confidenceScore: overrides.confidenceScore ?? 0.72,
  evidenceCoverage: overrides.evidenceCoverage ?? 0.88,
  sensitivityVisibility: overrides.sensitivityVisibility ?? 'internal',
  reasonCodes: overrides.reasonCodes ?? ['scaffold-signal'],
  publishedAt: overrides.publishedAt ?? '2026-03-13T00:00:00.000Z',
  benchmarkDimensionKeys: overrides.benchmarkDimensionKeys ?? ['delivery-model'],
  criterionImpacts:
    overrides.criterionImpacts ??
    [
      {
        criterionId: 'criterion-default',
        impactDirection: 'neutral',
        weight: 0.15,
      },
    ],
});

export const createMockPostBidAutopsyApi = () => createPostBidAutopsyApiScaffold();

export const createMockAutopsyOwner = (overrides: Partial<IBicOwner> = {}): IBicOwner => ({
  userId: overrides.userId ?? 'owner-1',
  displayName: overrides.displayName ?? 'Owner One',
  role: overrides.role ?? 'Estimator',
  groupContext: overrides.groupContext,
});

export const createMockAutopsyTriggerInput = (
  overrides: Partial<IAutopsyTriggerInput> = {}
): IAutopsyTriggerInput => ({
  pursuitId: overrides.pursuitId ?? 'pursuit-mock',
  scorecardId: overrides.scorecardId ?? 'scorecard-mock',
  status: overrides.status ?? 'Lost',
  triggeredAt: overrides.triggeredAt ?? '2026-03-13T00:00:00.000Z',
  triggeredBy: overrides.triggeredBy ?? createMockAutopsyOwner({ userId: 'trigger-1', role: 'BD Lead' }),
  primaryAuthor: overrides.primaryAuthor ?? createMockAutopsyOwner({ userId: 'primary-1', role: 'Primary Author' }),
  coAuthors: overrides.coAuthors ?? [createMockAutopsyOwner({ userId: 'co-1', role: 'Co-Author' })],
  chiefEstimator:
    overrides.chiefEstimator ?? createMockAutopsyOwner({ userId: 'chief-1', role: 'Chief Estimator' }),
  sectionTemplates:
    overrides.sectionTemplates ??
    [
      {
        sectionKey: 'pricing',
        title: 'Pricing Review',
        owner: createMockAutopsyOwner({ userId: 'pricing-1', role: 'Pricing Lead' }),
      },
      {
        sectionKey: 'strategy',
        title: 'Strategy Review',
        owner: createMockAutopsyOwner({ userId: 'strategy-1', role: 'Strategy Lead' }),
      },
    ],
});

export const createMockAutopsyRecordSnapshot = (
  overrides: Partial<IAutopsyRecordSnapshot> = {}
): IAutopsyRecordSnapshot => ({
  autopsy: overrides.autopsy ?? createMockPostBidAutopsyRecord(),
  assignments:
    overrides.assignments ?? {
      primaryAuthor: createMockAutopsyOwner({ userId: 'primary-1', role: 'Primary Author' }),
      coAuthors: [createMockAutopsyOwner({ userId: 'co-1', role: 'Co-Author' })],
      chiefEstimator: createMockAutopsyOwner({ userId: 'chief-1', role: 'Chief Estimator' }),
    },
  sectionBicRecords:
    overrides.sectionBicRecords ??
    [
      {
        bicRecordId: 'bic:autopsy-mock:pricing',
        autopsyId: 'autopsy-mock',
        sectionKey: 'pricing',
        title: 'Pricing Review',
        currentOwner: createMockAutopsyOwner({ userId: 'pricing-1', role: 'Pricing Lead' }),
        nextOwner: null,
        escalationOwner: createMockAutopsyOwner({ userId: 'chief-1', role: 'Chief Estimator' }),
        expectedAction: 'Complete Pricing Review autopsy section',
        dueDate: '2026-03-20T00:00:00.000Z',
        blockedReason: null,
        createdAt: '2026-03-13T00:00:00.000Z',
      },
    ],
  sla:
    overrides.sla ?? {
      startedAt: '2026-03-13T00:00:00.000Z',
      dueAt: '2026-03-20T00:00:00.000Z',
      businessDays: 5,
    },
  auditTrail: overrides.auditTrail ?? [],
  escalationEvents: overrides.escalationEvents ?? [],
  notifications: overrides.notifications ?? [],
  syncStatus: overrides.syncStatus ?? 'synced',
});

export const createMockAutopsyTransitionCommand = (
  overrides: Partial<IAutopsyTransitionCommand> = {}
): IAutopsyTransitionCommand => ({
  autopsyId: overrides.autopsyId ?? 'autopsy-mock',
  toStatus: overrides.toStatus ?? 'review',
  actor: overrides.actor ?? createMockAutopsyOwner({ userId: 'actor-1', role: 'Reviewer' }),
  occurredAt: overrides.occurredAt ?? '2026-03-14T00:00:00.000Z',
  reason: overrides.reason ?? 'Transition requested',
  changeSummary: overrides.changeSummary,
  relatedAutopsyId: overrides.relatedAutopsyId,
  overrideGovernance: overrides.overrideGovernance,
});

export const createMockAutopsyStorageMutation = (
  overrides: Partial<IAutopsyStorageMutation> = {}
): IAutopsyStorageMutation => ({
  mutationId: overrides.mutationId ?? 'mutation-1',
  mutationType: overrides.mutationType ?? 'save-draft',
  autopsyId: overrides.autopsyId ?? 'autopsy-mock',
  sequence: overrides.sequence ?? 1,
  queuedAt: overrides.queuedAt ?? '2026-03-14T00:00:00.000Z',
  replaySafe: overrides.replaySafe ?? true,
  localStatus: overrides.localStatus ?? 'queued-to-sync',
  idempotencyKey: overrides.idempotencyKey ?? 'idem-1',
  baseVersion: overrides.baseVersion ?? 1,
  payload:
    overrides.payload ?? {
      snapshot: createMockAutopsyRecordSnapshot(),
      actor: createMockAutopsyOwner({ userId: 'actor-1', role: 'Reviewer' }),
    },
});

export const createMockAutopsyQueryInvalidation = (autopsyId = 'autopsy-mock') =>
  createPostBidAutopsyRecordQueryKey(autopsyId);
