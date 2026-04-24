import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  HbcDataTable,
  HbcStatusBadge,
  HbcTypography,
  WorkspacePageShell,
} from '@hbc/ui-kit';
import type { ColumnDef, StatusVariant } from '@hbc/ui-kit';
import { useReplayIngestion, useReviewQueue } from '@hbc/features-safety';
import type { ReviewQueueEntry } from '@hbc/features-safety';
import { isSafetyBackendCommandError } from '@hbc/features-safety';
import {
  SafetyMasthead,
  SafetyReviewActions,
  SafetyReviewEntryCard,
  SafetySectionHeader,
  SafetyStatusPanel,
  SafetyTriageGroup,
  SafetyTriageSummary,
} from '../components/index.js';
import {
  bucketEntries,
  classifyQueueState,
  narrativeForQueueState,
} from './reviewQueueTriage.js';

const OFFICE_ONLY: Array<'office'> = ['office'];

function terminalVariantFor(status: string): StatusVariant {
  switch (status) {
    case 'review-required':
      return 'atRisk';
    case 'parse-error':
    case 'invalid-template':
    case 'commit-failed':
      return 'error';
    case 'unresolved-project':
    case 'reporting-period-mismatch':
      return 'warning';
    case 'replayed-success':
    case 'committed':
      return 'success';
    case 'replayed-failed':
      return 'critical';
    default:
      return 'neutral';
  }
}

/**
 * ReviewQueuePage — Phase-04 audit G-05 triage-framing redesign.
 *
 * Triage workspace rather than passive table:
 *   1. Masthead with queue-state meta
 *   2. SafetyTriageSummary — authored queue-state panel (clean / light /
 *      active / backed-up / duplicate-heavy / failure-heavy)
 *   3. SafetyTriageGroup sections in priority order — each holds
 *      SafetyReviewEntryCard instances with authored why-here /
 *      what-the-action-does framing
 *   4. All entries table retained as supporting structure
 *
 * Fatal page states remain owned by WorkspacePageShell (isLoading, isError,
 * isEmpty, onRetry). The triage summary + groups render only inside the
 * page body when there are entries (or the clean-state narrative).
 */
export function ReviewQueuePage(): ReactNode {
  const reviewQueue = useReviewQueue();
  const entries = (reviewQueue.data ?? []) as ReviewQueueEntry[];
  const replay = useReplayIngestion();
  const [pendingRunId, setPendingRunId] = useState<string | null>(null);
  const replayAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      replayAbortRef.current?.abort();
      replayAbortRef.current = null;
    };
  }, []);

  const handleRetry = (runId: string, supersedePrior: boolean): void => {
    replayAbortRef.current?.abort();
    const controller = new AbortController();
    replayAbortRef.current = controller;
    setPendingRunId(runId);
    replay.mutate(
      {
        parentRunId: runId,
        supersedePrior,
        commandOptions: {
          signal: controller.signal,
        },
      },
      { onSettled: () => setPendingRunId(null) },
    );
  };

  const queueState = useMemo(() => classifyQueueState(entries), [entries]);
  const categories = useMemo(() => bucketEntries(entries), [entries]);
  const narrative = useMemo(
    () => narrativeForQueueState(queueState, entries.length),
    [queueState, entries.length],
  );

  const columns = useMemo<ColumnDef<ReviewQueueEntry, unknown>[]>(
    () => [
      {
        id: 'file',
        header: 'File',
        cell: ({ row }) => (
          <div>
            <HbcTypography intent="body">
              {row.original.run.uploadFileName}
            </HbcTypography>
            <HbcTypography intent="bodySmall">Run {row.original.run.id}</HbcTypography>
          </div>
        ),
      },
      {
        id: 'project',
        header: 'Project',
        cell: ({ row }) => (
          <div>
            <HbcTypography intent="body">
              {row.original.projectNumber ?? '—'}
            </HbcTypography>
            {row.original.projectNameSnapshot && (
              <HbcTypography intent="bodySmall">
                {row.original.projectNameSnapshot}
              </HbcTypography>
            )}
          </div>
        ),
      },
      {
        id: 'terminal',
        header: 'Terminal',
        cell: ({ row }) => (
          <HbcStatusBadge
            variant={terminalVariantFor(row.original.run.terminalStatus)}
            label={row.original.run.terminalStatus}
            size="small"
          />
        ),
      },
      {
        accessorKey: 'reason',
        header: 'Reason',
        cell: ({ row }) => (
          <HbcTypography intent="bodySmall">{row.original.reason}</HbcTypography>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <SafetyReviewActions
            runId={row.original.run.id}
            inspectionEventId={row.original.inspectionEventId}
            isDuplicate={row.original.run.errorClass === 'duplicate-suspected'}
            isPending={pendingRunId === row.original.run.id && replay.isPending}
            onRetry={handleRetry}
          />
        ),
      },
    ],
    [pendingRunId, replay.isPending],
  );

  const isClean = queueState === 'clean';

  return (
    <WorkspacePageShell
      layout="list"
      title="Review queue"
      supportedModes={OFFICE_ONLY}
      isLoading={reviewQueue.isPending}
      isError={reviewQueue.isError}
      errorMessage="Failed to load the review queue."
      onRetry={() => reviewQueue.refetch()}
      isEmpty={!reviewQueue.isPending && !reviewQueue.isError && entries.length === 0}
      emptyMessage="Nothing awaiting review — weekly ingestion is clean."
      listConfig={{
        filterStoreKey: 'safety-review-queue',
      }}
    >
      <div className="safety-page">
        <SafetyMasthead
          eyebrow="Safety · Review"
          title="Review queue"
          description="Uploads that ended in review-required, invalid-template, parse-error, reporting-period-mismatch, unresolved-project, or commit-failed. Retry replays against the retained source workbook; supersede is governed and confirmed."
          meta={[
            { key: 'state', label: narrative.headline },
            {
              key: 'count',
              label: `${entries.length} awaiting action`,
            },
          ]}
        />

        <SafetyTriageSummary
          narrative={narrative}
          categories={categories}
          totalEntries={entries.length}
        />
        {replay.error && (
          <SafetyStatusPanel
            intent="partial-failure"
            description="Replay command failed before completion."
            detail={replayErrorMessage(replay.error)}
            action={{
              label: 'Dismiss',
              variant: 'secondary',
              onClick: () => replay.reset(),
            }}
          />
        )}

        {!isClean && (
          <div className="safety-triage-groups" data-safety-ui="triage-groups">
            {categories.map((cat) => (
              <SafetyTriageGroup key={cat.id} category={cat}>
                <div
                  className="safety-triage-group__cards"
                  role="list"
                  aria-label={`${cat.title} entries`}
                >
                  {cat.entries.map((entry) => (
                    <div
                      key={entry.run.id}
                      role="listitem"
                      className="safety-triage-group__card-slot"
                    >
                      <SafetyReviewEntryCard
                        entry={entry}
                        isPending={
                          pendingRunId === entry.run.id && replay.isPending
                        }
                        onRetry={handleRetry}
                      />
                    </div>
                  ))}
                </div>
              </SafetyTriageGroup>
            ))}
          </div>
        )}

        {!isClean && (
          <section
            className="safety-section"
            data-safety-ui="review-all-entries"
            aria-labelledby="safety-review-all-entries-heading"
          >
            <SafetySectionHeader
              title="All entries in this queue"
              description="Supporting table view of every entry above. Actions mirror the per-card affordances."
            />
            <HbcDataTable<ReviewQueueEntry>
              data={entries}
              columns={columns}
              toolId="safety-review-queue-table"
            />
          </section>
        )}
      </div>
    </WorkspacePageShell>
  );
}

function replayErrorMessage(error: unknown): string {
  if (isSafetyBackendCommandError(error)) {
    if (error.errorKind === 'timeout') {
      return 'Replay timed out before the backend could finish. Retry when service responsiveness improves.';
    }
    if (error.errorKind === 'aborted') {
      return 'Replay was cancelled before completion.';
    }
    if (error.requestId) {
      return `${error.message} (requestId: ${error.requestId})`;
    }
  }
  return error instanceof Error ? error.message : 'Replay failed due to an unexpected error.';
}
