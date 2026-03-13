import type {
  IAutopsyLifecycleAuditEntry,
  IAutopsyRecordSnapshot,
  IAutopsyTransitionCommand,
  IAutopsyTransitionFailure,
  IAutopsyTransitionResult,
} from '../../types/index.js';
import { createPublicationBlockerSummary, hasOpenDisagreements, requiresOverrideApproval } from '../governance/blockers.js';
import { isAutopsyTransitionAllowed } from './stateMachine.js';

const clone = <T>(value: T): T => structuredClone(value);

const createFailure = (
  reason: IAutopsyTransitionFailure['reason'],
  message: string
): IAutopsyTransitionFailure => ({
  ok: false,
  reason,
  message,
});

export const applyAutopsyTransition = (
  record: IAutopsyRecordSnapshot,
  command: IAutopsyTransitionCommand
): IAutopsyTransitionResult => {
  const current = record.autopsy;

  if (!isAutopsyTransitionAllowed(current.status, command.toStatus)) {
    return createFailure(
      'invalid-transition',
      `Cannot transition autopsy ${current.autopsyId} from ${current.status} to ${command.toStatus}.`
    );
  }

  if (command.toStatus === 'approved' && hasOpenDisagreements(record)) {
    return createFailure(
      'open-disagreements',
      `Autopsy ${current.autopsyId} has open disagreements and cannot be approved.`
    );
  }

  if (command.overrideGovernance && requiresOverrideApproval(command.overrideGovernance)) {
    return createFailure(
      'override-approval-required',
      `Autopsy ${current.autopsyId} override requires approval metadata before transition.`
    );
  }

  const next = clone(record);
  next.autopsy.status = command.toStatus;

  if (command.overrideGovernance !== undefined) {
    next.autopsy.overrideGovernance = command.overrideGovernance;
  }

  if (command.toStatus === 'superseded') {
    next.autopsy.supersession = {
      ...next.autopsy.supersession,
      supersededByAutopsyId: command.relatedAutopsyId,
      reason: command.reason,
    };
  }

  const blockers = createPublicationBlockerSummary(next);
  next.autopsy.publicationGate = {
    ...next.autopsy.publicationGate,
    publishable: blockers.publishable,
    blockers: blockers.blockers,
  };

  if (command.toStatus === 'published' && !blockers.publishable) {
    return createFailure(
      'publication-gate-failed',
      `Autopsy ${current.autopsyId} is not publishable: ${blockers.blockers.join(', ')}.`
    );
  }

  if (
    command.toStatus === 'published' &&
    next.autopsy.sensitivity.visibility === 'confidential' &&
    next.autopsy.overrideGovernance === null
  ) {
    return createFailure(
      'sensitivity-policy-blocked',
      `Autopsy ${current.autopsyId} requires override metadata for confidential publication.`
    );
  }

  const auditEntry: IAutopsyLifecycleAuditEntry = {
    auditId: `${current.autopsyId}:${command.toStatus}:${command.occurredAt}`,
    autopsyId: current.autopsyId,
    fromStatus: current.status,
    toStatus: command.toStatus,
    occurredAt: command.occurredAt,
    actor: command.actor,
    reason: command.reason,
    changeSummary: command.changeSummary ?? command.reason,
  };

  next.auditTrail = [...next.auditTrail, auditEntry];

  return {
    ok: true,
    record: next,
    version: {
      recordType: 'post-bid-autopsy',
      recordId: current.autopsyId,
      currentVersion: record.auditTrail.length
        ? {
            snapshotId: `${current.autopsyId}-transition-preview`,
            version: record.auditTrail.length + 1,
            createdAt: command.occurredAt,
            createdBy: command.actor,
            changeSummary: auditEntry.changeSummary,
            tag: 'submitted',
          }
        : {
            snapshotId: `${current.autopsyId}-transition-preview`,
            version: 1,
            createdAt: command.occurredAt,
            createdBy: command.actor,
            changeSummary: auditEntry.changeSummary,
            tag: 'submitted',
          },
      versions: [],
      snapshots: [],
    },
  };
};
