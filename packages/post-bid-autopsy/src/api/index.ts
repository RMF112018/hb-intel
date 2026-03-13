import { AUTOPSY_SLA_BUSINESS_DAYS } from '../constants/index.js';
import {
  createAutopsyCommitMetadata,
  createAutopsyQueueState,
  createAutopsyQueryInvalidationResult,
} from '../hooks/selectors.js';
import {
  addBusinessDays,
  appendAutopsyVersionEnvelope,
  applyAutopsyTransition,
  buildAutopsyPublishProjections,
  consumeAutopsyReplayResult,
  createInitialAutopsyVersionEnvelope,
  createPostBidAutopsyRecord,
  createPublicationBlockerSummary,
  createPublicationGate,
  InMemoryAutopsyQueueStore,
  isBusinessDayOverdue,
  normalizeAutopsyMutationQueue,
  queueAutopsyMutation,
} from '../model/index.js';
import type {
  AutopsyOutcome,
  AutopsyQueueStatus,
  IAutopsyEscalationEvent,
  IAutopsyNotificationPayload,
  IAutopsyPublishResult,
  IAutopsyRecordSnapshot,
  IAutopsyReplayResult,
  IAutopsyStorageMutation,
  IAutopsyStorageReceipt,
  IAutopsyStalenessEvaluation,
  IAutopsyTransitionCommand,
  IAutopsyTransitionResult,
  IAutopsyTriggerInput,
  IAutopsyTriggerResult,
  IAutopsyVersionEnvelope,
  IPostBidAutopsyApiSurface,
} from '../types/index.js';
import type { IAutopsyQueueStoreAdapter } from '../model/storage/index.js';

interface IPostBidAutopsyRuntimeState {
  records: Map<string, IAutopsyRecordSnapshot>;
  versions: Map<string, IAutopsyVersionEnvelope>;
  triggerIndex: Map<string, string>;
  queue: IAutopsyStorageMutation[];
}

const clone = <T>(value: T): T => structuredClone(value);

const mapTerminalStatusToOutcome = (status: IAutopsyTriggerInput['status']): AutopsyOutcome => {
  switch (status) {
    case 'Won':
      return 'won';
    case 'Lost':
      return 'lost';
    case 'No-Bid':
      return 'no-bid';
  }
};

const createTriggerKey = (input: Pick<IAutopsyTriggerInput, 'pursuitId' | 'status'>): string =>
  `${input.pursuitId}:${input.status}`;

const createAutopsyId = (input: Pick<IAutopsyTriggerInput, 'pursuitId' | 'scorecardId' | 'status'>): string =>
  `autopsy:${input.scorecardId}:${input.pursuitId}:${input.status.toLowerCase()}`;

const createTriggerNotifications = (
  input: IAutopsyTriggerInput,
  autopsyId: string
): IAutopsyNotificationPayload[] => {
  const recipientEntries: Array<readonly [string, string]> = [
    [input.primaryAuthor.userId, input.primaryAuthor.displayName],
    ...((input.coAuthors ?? []).map(
      (author): readonly [string, string] => [author.userId, author.displayName]
    )),
    [input.chiefEstimator.userId, input.chiefEstimator.displayName],
  ];
  const recipients = new Map<string, string>(recipientEntries);

  return [...recipients.entries()].map(([recipientUserId, displayName]) => ({
    notificationId: `notification:${autopsyId}:${recipientUserId}`,
    autopsyId,
    recipientUserId,
    type: 'autopsy-created',
    createdAt: input.triggeredAt,
    title: 'Post-bid autopsy created',
    message: `Autopsy ${autopsyId} assigned to ${displayName}.`,
  }));
};

const createEscalationNotification = (
  event: IAutopsyEscalationEvent
): IAutopsyNotificationPayload => ({
  notificationId: `notification:${event.escalationId}:${event.target.userId}`,
  autopsyId: event.autopsyId,
  recipientUserId: event.target.userId,
  type: event.eventType === 'overdue' ? 'autopsy-overdue' : 'disagreement-escalated',
  createdAt: event.createdAt,
  title: event.eventType === 'overdue' ? 'Autopsy overdue escalation' : 'Autopsy disagreement escalation',
  message: event.reason,
});

export const POST_BID_AUTOPSY_API_SURFACES: readonly IPostBidAutopsyApiSurface[] = Object.freeze([
  {
    surfaceId: 'post-bid-autopsy.runtime',
    ownership: 'primitive',
    responsibilities: Object.freeze([
      'trigger-processing',
      'lifecycle-transitions',
      'append-only-storage',
      'offline-replay',
      'publish-projections',
    ]),
  },
  {
    surfaceId: 'post-bid-autopsy.testing',
    ownership: 'primitive',
    responsibilities: Object.freeze(['fixture-creation', 'public-test-entrypoint']),
  },
]);

export const createPostBidAutopsyApiScaffold = () => ({
  surfaces: POST_BID_AUTOPSY_API_SURFACES,
});

export const createPostBidAutopsyRuntimeState = (): IPostBidAutopsyRuntimeState => ({
  records: new Map(),
  versions: new Map(),
  triggerIndex: new Map(),
  queue: [],
});

export class PostBidAutopsyApi {
  private readonly state: IPostBidAutopsyRuntimeState;

  constructor(private readonly queueStore: IAutopsyQueueStoreAdapter = new InMemoryAutopsyQueueStore()) {
    this.state = createPostBidAutopsyRuntimeState();
  }

  getRecord(autopsyId: string): IAutopsyRecordSnapshot | null {
    return clone(this.state.records.get(autopsyId) ?? null);
  }

  getRecordByPursuitId(pursuitId: string): IAutopsyRecordSnapshot | null {
    const record = [...this.state.records.values()].find(
      (candidate) => candidate.autopsy.pursuitId === pursuitId
    );
    return clone(record ?? null);
  }

  listRecords(): IAutopsyRecordSnapshot[] {
    return [...this.state.records.values()].map((record) => clone(record));
  }

  getVersionEnvelope(autopsyId: string): IAutopsyVersionEnvelope | null {
    return clone(this.state.versions.get(autopsyId) ?? null);
  }

  getVersionEnvelopeByPursuitId(pursuitId: string): IAutopsyVersionEnvelope | null {
    const record = this.getRecordByPursuitId(pursuitId);
    if (!record) {
      return null;
    }

    return this.getVersionEnvelope(record.autopsy.autopsyId);
  }

  listQueuedMutations(autopsyId?: string): IAutopsyStorageMutation[] {
    const queue = autopsyId
      ? this.state.queue.filter((mutation) => mutation.autopsyId === autopsyId)
      : this.state.queue;
    return queue.map((mutation) => clone(mutation));
  }

  setRecordForTesting(record: IAutopsyRecordSnapshot): void {
    const clonedRecord = clone(record);
    this.state.records.set(clonedRecord.autopsy.autopsyId, clonedRecord);

    if (!this.state.versions.has(clonedRecord.autopsy.autopsyId)) {
      const actor = clonedRecord.assignments.primaryAuthor;
      this.state.versions.set(
        clonedRecord.autopsy.autopsyId,
        createInitialAutopsyVersionEnvelope(
          clonedRecord,
          clonedRecord.auditTrail.at(-1)?.occurredAt ?? clonedRecord.sla.startedAt,
          actor,
          'Testing seed record'
        )
      );
    }
  }

  async processTrigger(input: IAutopsyTriggerInput): Promise<IAutopsyTriggerResult> {
    const triggerKey = createTriggerKey(input);
    const existingAutopsyId = this.state.triggerIndex.get(triggerKey);
    if (existingAutopsyId) {
      return {
        created: false,
        autopsyId: existingAutopsyId,
        record: clone(this.state.records.get(existingAutopsyId)!),
        version: clone(this.state.versions.get(existingAutopsyId)!),
        notifications: clone(this.state.records.get(existingAutopsyId)!.notifications),
      };
    }

    const autopsyId = createAutopsyId(input);
    const publicationGate = createPublicationGate({
      publishable: false,
      blockers: ['review-approval-pending'],
      requiredEvidenceCount: 2,
    });
    const autopsy = createPostBidAutopsyRecord({
      autopsyId,
      pursuitId: input.pursuitId,
      scorecardId: input.scorecardId,
      outcome: mapTerminalStatusToOutcome(input.status),
      status: 'draft',
      publicationGate,
      reviewDecisions: [],
      disagreements: [],
      evidence: [],
    });

    const dueAt = addBusinessDays(input.triggeredAt, AUTOPSY_SLA_BUSINESS_DAYS);
    const sectionBicRecords = input.sectionTemplates.map((template) => ({
      bicRecordId: `bic:${autopsyId}:${template.sectionKey}`,
      autopsyId,
      sectionKey: template.sectionKey,
      title: template.title,
      currentOwner: template.owner,
      nextOwner: template.nextOwner ?? null,
      escalationOwner: input.chiefEstimator,
      expectedAction: `Complete ${template.title} autopsy section`,
      dueDate: dueAt,
      blockedReason: template.blockedReason ?? null,
      createdAt: input.triggeredAt,
    }));

    const notifications = createTriggerNotifications(input, autopsyId);
    const record: IAutopsyRecordSnapshot = {
      autopsy,
      assignments: {
        primaryAuthor: input.primaryAuthor,
        coAuthors: input.coAuthors ?? [],
        chiefEstimator: input.chiefEstimator,
      },
      sectionBicRecords,
      sla: {
        startedAt: input.triggeredAt,
        dueAt,
        businessDays: AUTOPSY_SLA_BUSINESS_DAYS,
      },
      auditTrail: [
        {
          auditId: `${autopsyId}:draft:${input.triggeredAt}`,
          autopsyId,
          fromStatus: null,
          toStatus: 'draft',
          occurredAt: input.triggeredAt,
          actor: input.triggeredBy,
          reason: `Triggered from pursuit terminal status ${input.status}`,
          changeSummary: `Autopsy created for ${input.status}`,
        },
      ],
      escalationEvents: [],
      notifications,
      syncStatus: 'synced',
    };

    record.autopsy.publicationGate = {
      ...record.autopsy.publicationGate,
      ...createPublicationBlockerSummary(record),
    };

    const version = createInitialAutopsyVersionEnvelope(
      record,
      input.triggeredAt,
      input.triggeredBy,
      `Trigger processed for ${input.status}`
    );

    this.state.records.set(autopsyId, clone(record));
    this.state.versions.set(autopsyId, clone(version));
    this.state.triggerIndex.set(triggerKey, autopsyId);

    return {
      created: true,
      autopsyId,
      record,
      version,
      notifications,
    };
  }

  transitionAutopsy(command: IAutopsyTransitionCommand): IAutopsyTransitionResult {
    const current = this.state.records.get(command.autopsyId);
    const envelope = this.state.versions.get(command.autopsyId);
    if (!current || !envelope) {
      return {
        ok: false,
        reason: 'autopsy-not-found',
        message: `Autopsy ${command.autopsyId} was not found.`,
      };
    }

    const transitionResult = applyAutopsyTransition(current, command);
    if (!transitionResult.ok) {
      return transitionResult;
    }

    const appended = appendAutopsyVersionEnvelope(
      envelope,
      transitionResult.record,
      command.occurredAt,
      command.actor,
      command.changeSummary ?? command.reason
    );

    this.state.records.set(command.autopsyId, clone(appended.record));
    this.state.versions.set(command.autopsyId, clone(appended.version));

    return {
      ok: true,
      record: appended.record,
      version: appended.version,
    };
  }

  async persistDraft(
    autopsyId: string,
    snapshot: IAutopsyRecordSnapshot,
    actor: IAutopsyStorageMutation['payload']['actor'],
    queuedAt: string
  ): Promise<IAutopsyStorageReceipt> {
    const envelope = this.state.versions.get(autopsyId);
    if (!envelope) {
      throw new Error(`Autopsy ${autopsyId} was not found.`);
    }

    const nextRecord = {
      ...clone(snapshot),
      syncStatus: 'saved-locally' as AutopsyQueueStatus,
    };
    const appended = appendAutopsyVersionEnvelope(
      envelope,
      nextRecord,
      queuedAt,
      actor,
      'Draft persisted locally'
    );

    this.state.records.set(autopsyId, clone(appended.record));
    this.state.versions.set(autopsyId, clone(appended.version));

    return {
      record: appended.record,
      version: appended.version,
      queueStatus: createAutopsyQueueState({
        status: 'saved-locally',
        pendingMutationCount: this.state.queue.length,
      }),
      commitMetadata: createAutopsyCommitMetadata({
        committedAt: queuedAt,
        committedBy: actor.userId,
        source: 'direct-write',
      }),
    };
  }

  async enqueueMutation(mutation: IAutopsyStorageMutation): Promise<IAutopsyStorageReceipt> {
    const record = this.state.records.get(mutation.autopsyId);
    const envelope = this.state.versions.get(mutation.autopsyId);
    if (!record || !envelope) {
      throw new Error(`Autopsy ${mutation.autopsyId} was not found.`);
    }

    const queued = queueAutopsyMutation(this.state.queue, mutation);
    this.state.queue = queued.queue;
    await this.queueStore.saveQueue(this.state.queue);

    const nextRecord = {
      ...clone(record),
      syncStatus: mutation.localStatus,
    };
    this.state.records.set(mutation.autopsyId, clone(nextRecord));

    return {
      record: nextRecord,
      version: clone(envelope),
      queueStatus: queued.queueState,
      commitMetadata: createAutopsyCommitMetadata({
        committedAt: mutation.queuedAt,
        committedBy: mutation.payload.actor.userId,
        source: 'offline-queue',
      }),
    };
  }

  async replayQueuedMutations(): Promise<IAutopsyReplayResult> {
    const queue = normalizeAutopsyMutationQueue(await this.queueStore.loadQueue());
    let conflictsCreated = 0;

    for (const mutation of queue) {
      const envelope = this.state.versions.get(mutation.autopsyId);
      if (!envelope) {
        continue;
      }

      if (mutation.baseVersion < envelope.currentVersion.version) {
        conflictsCreated += 1;
        const conflictedSnapshot = clone(mutation.payload.snapshot);
        conflictedSnapshot.autopsy.status = 'review';
        conflictedSnapshot.syncStatus = 'queued-to-sync';
        conflictedSnapshot.auditTrail = [
          ...conflictedSnapshot.auditTrail,
          {
            auditId: `${mutation.autopsyId}:conflict:${mutation.queuedAt}`,
            autopsyId: mutation.autopsyId,
            fromStatus: mutation.payload.snapshot.autopsy.status,
            toStatus: 'review',
            occurredAt: mutation.queuedAt,
            actor: mutation.payload.actor,
            reason: 'Replay conflict detected; review required',
            changeSummary: 'Conflict created during replay',
          },
        ];
        const conflictVersion = appendAutopsyVersionEnvelope(
          envelope,
          conflictedSnapshot,
          mutation.queuedAt,
          mutation.payload.actor,
          'Conflict created during replay'
        );
        this.state.records.set(mutation.autopsyId, clone(conflictVersion.record));
        this.state.versions.set(mutation.autopsyId, clone(conflictVersion.version));
        continue;
      }

      const syncedSnapshot = {
        ...clone(mutation.payload.snapshot),
        syncStatus: 'synced' as AutopsyQueueStatus,
      };
      const appended = appendAutopsyVersionEnvelope(
        envelope,
        syncedSnapshot,
        mutation.queuedAt,
        mutation.payload.actor,
        `Replayed ${mutation.mutationType}`
      );
      this.state.records.set(mutation.autopsyId, clone(appended.record));
      this.state.versions.set(mutation.autopsyId, clone(appended.version));
    }

    this.state.queue = [];
    await this.queueStore.saveQueue([]);

    const invalidated = queue.flatMap((mutation) =>
      createAutopsyQueryInvalidationResult(
        this.state.records.get(mutation.autopsyId)?.autopsy.pursuitId ?? mutation.autopsyId
      ).invalidatedQueryKeys
    );

    return consumeAutopsyReplayResult(
      queue.map((mutation) => mutation.mutationId),
      conflictsCreated,
      invalidated
    );
  }

  evaluateOverdueAutopsies(currentAt: string): IAutopsyEscalationEvent[] {
    const escalations: IAutopsyEscalationEvent[] = [];

    for (const [autopsyId, record] of this.state.records.entries()) {
      if (
        !['draft', 'review', 'approved', 'published'].includes(record.autopsy.status) ||
        !isBusinessDayOverdue(record.sla.dueAt, currentAt)
      ) {
        continue;
      }

      const escalationId = `overdue:${autopsyId}:${record.sla.dueAt}`;
      if (record.escalationEvents.some((event) => event.escalationId === escalationId)) {
        continue;
      }

      record.autopsy.status = 'overdue';
      const event: IAutopsyEscalationEvent = {
        escalationId,
        autopsyId,
        eventType: 'overdue',
        target: record.assignments.chiefEstimator,
        createdAt: currentAt,
        reason: `Autopsy ${autopsyId} breached the ${AUTOPSY_SLA_BUSINESS_DAYS}-business-day SLA.`,
        sectionKeys: record.sectionBicRecords.map((section) => section.sectionKey),
      };
      record.escalationEvents = [...record.escalationEvents, event];
      record.notifications = [...record.notifications, createEscalationNotification(event)];
      this.state.records.set(autopsyId, clone(record));
      escalations.push(event);
    }

    return escalations.map((event) => clone(event));
  }

  escalateDisagreementDeadlock(autopsyId: string, createdAt: string, reason: string): IAutopsyEscalationEvent {
    const record = this.state.records.get(autopsyId);
    if (!record) {
      throw new Error(`Autopsy ${autopsyId} was not found.`);
    }

    const event: IAutopsyEscalationEvent = {
      escalationId: `deadlock:${autopsyId}:${createdAt}`,
      autopsyId,
      eventType: 'disagreement-deadlock',
      target: record.assignments.chiefEstimator,
      createdAt,
      reason,
      sectionKeys: record.sectionBicRecords.map((section) => section.sectionKey),
    };
    record.escalationEvents = [...record.escalationEvents, event];
    record.notifications = [...record.notifications, createEscalationNotification(event)];
    this.state.records.set(autopsyId, clone(record));
    return clone(event);
  }

  evaluateStaleness(autopsyId: string, evaluatedAt: string, staleAfterDays = 30): IAutopsyStalenessEvaluation {
    const envelope = this.state.versions.get(autopsyId);
    const record = this.state.records.get(autopsyId);
    if (!record || !envelope || record.autopsy.status !== 'published') {
      return {
        autopsyId,
        isStale: false,
        requiresRevalidation: false,
        publishedVersion: null,
        evaluatedAt,
        reason: null,
      };
    }

    const publishedAudit = [...record.auditTrail].reverse().find((entry) => entry.toStatus === 'published');
    if (!publishedAudit) {
      return {
        autopsyId,
        isStale: false,
        requiresRevalidation: false,
        publishedVersion: envelope.currentVersion.version,
        evaluatedAt,
        reason: null,
      };
    }

    const msSincePublish =
      new Date(evaluatedAt).getTime() - new Date(publishedAudit.occurredAt).getTime();
    const staleThresholdMs = staleAfterDays * 24 * 60 * 60 * 1000;
    const isStale = msSincePublish > staleThresholdMs;

    return {
      autopsyId,
      isStale,
      requiresRevalidation: isStale,
      publishedVersion: envelope.currentVersion.version,
      evaluatedAt,
      reason: isStale ? 'published-version-stale' : null,
    };
  }

  revalidatePublishedAutopsy(
    autopsyId: string,
    actor: IAutopsyStorageMutation['payload']['actor'],
    revalidatedAt: string
  ): IAutopsyStorageReceipt {
    const record = this.state.records.get(autopsyId);
    const envelope = this.state.versions.get(autopsyId);
    if (!record || !envelope) {
      throw new Error(`Autopsy ${autopsyId} was not found.`);
    }

    const nextRecord = clone(record);
    nextRecord.autopsy.status = 'review';
    nextRecord.autopsy.supersession = {
      ...nextRecord.autopsy.supersession,
      supersedesAutopsyId: autopsyId,
      reason: 'Revalidation required',
    };
    nextRecord.notifications = [
      ...nextRecord.notifications,
      {
        notificationId: `notification:${autopsyId}:revalidation:${revalidatedAt}`,
        autopsyId,
        recipientUserId: nextRecord.assignments.primaryAuthor.userId,
        type: 'revalidation-required',
        createdAt: revalidatedAt,
        title: 'Autopsy revalidation required',
        message: `Autopsy ${autopsyId} requires a new validated version.`,
      },
    ];
    nextRecord.auditTrail = [
      ...nextRecord.auditTrail,
      {
        auditId: `${autopsyId}:revalidation:${revalidatedAt}`,
        autopsyId,
        fromStatus: record.autopsy.status,
        toStatus: 'review',
        occurredAt: revalidatedAt,
        actor,
        reason: 'Published record flagged as stale',
        changeSummary: 'Revalidation version created',
      },
    ];

    const appended = appendAutopsyVersionEnvelope(
      envelope,
      nextRecord,
      revalidatedAt,
      actor,
      'Revalidation version created'
    );
    this.state.records.set(autopsyId, clone(appended.record));
    this.state.versions.set(autopsyId, clone(appended.version));

    return {
      record: appended.record,
      version: appended.version,
      queueStatus: createAutopsyQueueState({
        status: 'saved-locally',
        pendingMutationCount: this.state.queue.length,
      }),
      commitMetadata: createAutopsyCommitMetadata({
        committedAt: revalidatedAt,
        committedBy: actor.userId,
        source: 'direct-write',
      }),
    };
  }

  generatePublishOutputs(autopsyId: string): IAutopsyPublishResult {
    const record = this.state.records.get(autopsyId);
    if (!record) {
      return {
        publishable: false,
        benchmarkProjection: null,
        intelligenceDraft: null,
        redactedDraft: null,
      };
    }

    return buildAutopsyPublishProjections(record);
  }
}
