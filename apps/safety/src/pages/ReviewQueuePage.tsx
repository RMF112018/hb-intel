import { useMemo, useState, type ReactNode } from 'react';
import {
  HbcDataTable,
  HbcStatusBadge,
  HbcTypography,
  WorkspacePageShell,
} from '@hbc/ui-kit';
import type { ColumnDef, StatusVariant } from '@hbc/ui-kit';
import { useReplayIngestion, useReviewQueue } from '@hbc/features-safety';
import type { ReviewQueueEntry } from '@hbc/features-safety';
import { SafetyReviewActions, SafetySectionHeader } from '../components/index.js';

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

export function ReviewQueuePage(): ReactNode {
  const reviewQueue = useReviewQueue();
  const entries = reviewQueue.data ?? [];
  const replay = useReplayIngestion();
  const [pendingRunId, setPendingRunId] = useState<string | null>(null);

  const handleRetry = (runId: string, supersedePrior: boolean) => {
    setPendingRunId(runId);
    replay.mutate(
      { parentRunId: runId, supersedePrior },
      { onSettled: () => setPendingRunId(null) },
    );
  };

  const columns = useMemo<ColumnDef<ReviewQueueEntry, unknown>[]>(
    () => [
      {
        id: 'file',
        header: 'File',
        cell: ({ row }) => (
          <div>
            <HbcTypography intent="body">{row.original.run.uploadFileName}</HbcTypography>
            <HbcTypography intent="bodySmall">Run {row.original.run.id}</HbcTypography>
          </div>
        ),
      },
      {
        id: 'project',
        header: 'Project',
        cell: ({ row }) => (
          <div>
            <HbcTypography intent="body">{row.original.projectNumber ?? '—'}</HbcTypography>
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
        <section className="safety-section">
          <SafetySectionHeader
            title="Uploads awaiting action"
            description="Uploads that ended in review-required, invalid-template, parse-error, reporting-period-mismatch, unresolved-project, or commit-failed. Retry replays against the retained source workbook in Safety Checklist Uploads."
          />
          <HbcDataTable<ReviewQueueEntry>
            data={entries as ReviewQueueEntry[]}
            columns={columns}
            toolId="safety-review-queue-table"
          />
        </section>
      </div>
    </WorkspacePageShell>
  );
}
