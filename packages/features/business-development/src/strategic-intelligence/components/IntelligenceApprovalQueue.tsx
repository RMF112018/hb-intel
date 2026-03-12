import React, { useState } from 'react';
import type {
  IStrategicIntelligenceApprovalQueueItem,
  IStrategicIntelligenceEntry,
  ProvenanceClass,
} from '@hbc/strategic-intelligence';
import {
  getComplexityFlags,
  getDisplayDate,
  getReliabilityLabel,
  type StrategicIntelligenceComplexityMode,
} from './displayModel.js';

export interface IntelligenceApprovalQueueProps {
  complexity: StrategicIntelligenceComplexityMode;
  isApprover: boolean;
  queue: IStrategicIntelligenceApprovalQueueItem[];
  entries: IStrategicIntelligenceEntry[];
  onApprove?: (queueItemId: string) => void;
  onReject?: (queueItemId: string, reason: string) => void;
  onRequestRevision?: (queueItemId: string, reason: string) => void;
  onRenewStaleReview?: (entryId: string) => void;
  onResolveConflict?: (conflictId: string, note: string) => void;
  onOpenConfigureApprovers?: () => void;
}

const getProvenanceCopy = (provenance: ProvenanceClass): string => {
  switch (provenance) {
    case 'ai-assisted-draft':
      return 'AI-assisted draft';
    case 'firsthand-observation':
      return 'Firsthand observation';
    case 'meeting-summary':
      return 'Meeting summary';
    case 'project-outcome-learning':
      return 'Project outcome learning';
    default:
      return 'Inferred observation';
  }
};

export const IntelligenceApprovalQueue = ({
  complexity,
  isApprover,
  queue,
  entries,
  onApprove,
  onReject,
  onRequestRevision,
  onRenewStaleReview,
  onResolveConflict,
  onOpenConfigureApprovers,
}: IntelligenceApprovalQueueProps) => {
  const flags = getComplexityFlags(complexity);
  const [reasonByQueueItem, setReasonByQueueItem] = useState<Record<string, string>>({});
  const [errorByQueueItem, setErrorByQueueItem] = useState<Record<string, string>>({});

  if (flags.isEssential) {
    return null;
  }

  const pendingCount = queue.filter((item) => item.approvalStatus === 'pending').length;

  if (flags.isStandard) {
    return (
      <section aria-label="Intelligence approval queue summary" data-testid="intelligence-approval-queue-summary">
        <h3>Approval Queue</h3>
        <p>{isApprover ? `Pending approvals: ${pendingCount}` : 'Queue available to approvers only.'}</p>
      </section>
    );
  }

  if (!isApprover) {
    return (
      <section aria-label="Intelligence approval queue" data-testid="intelligence-approval-queue-unauthorized">
        <h3>Approval Queue</h3>
        <p>You do not have approver permissions.</p>
      </section>
    );
  }

  const staleEntries = entries.filter((entry) => entry.trust.isStale);
  const openConflicts = entries.flatMap((entry) =>
    entry.conflicts
      .filter((conflict) => conflict.resolutionStatus === 'open')
      .map((conflict) => ({
        entryId: entry.entryId,
        conflictId: conflict.conflictId,
        type: conflict.type,
      }))
  );

  const requireReason = (queueItemId: string): string | null => {
    const reason = reasonByQueueItem[queueItemId]?.trim() ?? '';
    if (reason.length === 0) {
      setErrorByQueueItem((current) => ({
        ...current,
        [queueItemId]: 'Reason is required for rejection and revision requests.',
      }));
      return null;
    }

    setErrorByQueueItem((current) => ({ ...current, [queueItemId]: '' }));
    return reason;
  };

  return (
    <section aria-label="Intelligence approval queue" data-testid="intelligence-approval-queue">
      <header>
        <h3>Approval Queue</h3>
        <p>Pending items: {pendingCount}</p>
        <button type="button" onClick={onOpenConfigureApprovers} aria-label="Configure approvers route">
          Configure approvers
        </button>
      </header>

      <ul>
        {queue.map((item) => {
          const entry = entries.find((candidate) => candidate.entryId === item.entryId);
          if (!entry) {
            return null;
          }

          return (
            <li key={item.queueItemId} data-testid={`approval-queue-item-${item.queueItemId}`}>
              <article>
                <h4>{entry.title}</h4>
                <p>Type: {entry.type}</p>
                <p>Contributor: {entry.createdBy}</p>
                <p>Submitted: {getDisplayDate(item.submittedAt)}</p>
                <p>Provenance: {getProvenanceCopy(entry.trust.provenanceClass)}</p>
                <p>Trust: {getReliabilityLabel(entry.trust.reliabilityTier)}</p>
                {entry.trust.isStale ? <p>Stale review required</p> : null}
                {entry.conflicts.length > 0 ? <p>Conflict flags: {entry.conflicts.length}</p> : null}
                <p>
                  Decision trail: {item.approvalStatus}
                  {item.reviewedBy ? ` by ${item.reviewedBy}` : ''}
                  {item.reviewedAt ? ` on ${getDisplayDate(item.reviewedAt)}` : ''}
                </p>

                <label>
                  Review reason
                  <textarea
                    aria-label={`Reason for ${item.queueItemId}`}
                    value={reasonByQueueItem[item.queueItemId] ?? ''}
                    onChange={(event) =>
                      setReasonByQueueItem((current) => ({
                        ...current,
                        [item.queueItemId]: event.target.value,
                      }))
                    }
                    aria-invalid={Boolean(errorByQueueItem[item.queueItemId])}
                    aria-describedby={
                      errorByQueueItem[item.queueItemId]
                        ? `approval-reason-error-${item.queueItemId}`
                        : undefined
                    }
                  />
                </label>
                {errorByQueueItem[item.queueItemId] ? (
                  <p id={`approval-reason-error-${item.queueItemId}`} role="alert">
                    {errorByQueueItem[item.queueItemId]}
                  </p>
                ) : null}

                <div>
                  <button type="button" onClick={() => onApprove?.(item.queueItemId)}>
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const reason = requireReason(item.queueItemId);
                      if (reason) onReject?.(item.queueItemId, reason);
                    }}
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const reason = requireReason(item.queueItemId);
                      if (reason) onRequestRevision?.(item.queueItemId, reason);
                    }}
                  >
                    Request revision
                  </button>
                </div>
              </article>
            </li>
          );
        })}
      </ul>

      <section aria-label="Stale review renewal actions" data-testid="stale-review-actions">
        <h4>Stale Review Renewal</h4>
        {staleEntries.length === 0 ? (
          <p>No stale entries.</p>
        ) : (
          <ul>
            {staleEntries.map((entry) => (
              <li key={entry.entryId}>
                <button
                  type="button"
                  onClick={() => onRenewStaleReview?.(entry.entryId)}
                  aria-label={`Renew stale review for ${entry.entryId}`}
                >
                  Renew review: {entry.title}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-label="Conflict resolution actions" data-testid="conflict-resolution-actions">
        <h4>Conflict Resolution</h4>
        {openConflicts.length === 0 ? (
          <p>No open conflicts.</p>
        ) : (
          <ul>
            {openConflicts.map((item) => (
              <li key={item.conflictId}>
                <button
                  type="button"
                  onClick={() => onResolveConflict?.(item.conflictId, 'Resolved from approval queue')}
                  aria-label={`Resolve conflict ${item.conflictId}`}
                >
                  Resolve {item.type} for {item.entryId}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
};
