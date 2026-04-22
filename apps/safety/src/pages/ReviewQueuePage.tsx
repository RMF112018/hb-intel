import { useState, type ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { HbcButton, HbcTypography, WorkspacePageShell } from '@hbc/ui-kit';
import { useReplayIngestion, useReviewQueue } from '@hbc/features-safety';

const OFFICE_ONLY: Array<'office'> = ['office'];

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
    >
      <section style={{ display: 'grid', gap: '1rem' }}>
        <HbcTypography intent="bodySmall">
          Uploads that ended in review-required, invalid-template, parse-error,
          reporting-period-mismatch, unresolved-project, or commit-failed. Retry replays against
          the retained source workbook in Safety Checklist Uploads.
        </HbcTypography>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Run</th>
              <th style={{ textAlign: 'left' }}>File</th>
              <th style={{ textAlign: 'left' }}>Project</th>
              <th style={{ textAlign: 'left' }}>Terminal</th>
              <th style={{ textAlign: 'left' }}>Reason</th>
              <th style={{ textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => {
              const isPending = pendingRunId === entry.run.id && replay.isPending;
              const isDuplicate = entry.run.errorClass === 'duplicate-suspected';
              return (
                <tr key={entry.run.id}>
                  <td>{entry.run.id}</td>
                  <td>{entry.run.uploadFileName}</td>
                  <td>
                    <HbcTypography intent="body">{entry.projectNumber ?? '—'}</HbcTypography>
                    {entry.projectNameSnapshot && (
                      <HbcTypography intent="bodySmall">{entry.projectNameSnapshot}</HbcTypography>
                    )}
                  </td>
                  <td>{entry.run.terminalStatus}</td>
                  <td>{entry.reason}</td>
                  <td style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <HbcButton
                      variant="secondary"
                      disabled={isPending}
                      onClick={() => handleRetry(entry.run.id, false)}
                    >
                      {isPending ? 'Replaying…' : 'Retry'}
                    </HbcButton>
                    {isDuplicate && (
                      <HbcButton
                        variant="secondary"
                        disabled={isPending}
                        onClick={() => handleRetry(entry.run.id, true)}
                      >
                        Supersede & commit
                      </HbcButton>
                    )}
                    {entry.inspectionEventId && (
                      <Link
                        to="/inspections/$inspectionEventId"
                        params={{ inspectionEventId: entry.inspectionEventId }}
                      >
                        Open
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </WorkspacePageShell>
  );
}
