import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { HbcTypography, WorkspacePageShell } from '@hbc/ui-kit';
import { useReviewQueue } from '@hbc/features-safety';

export function ReviewQueuePage(): ReactNode {
  const { data: entries = [] } = useReviewQueue();

  return (
    <WorkspacePageShell layout="list" title="Review queue">
      <section style={{ display: 'grid', gap: '1rem' }}>
        <HbcTypography intent="bodySmall">
          Uploads that ended in review-required, invalid-template, or commit-failed. Retry action
          depends on the source workbook remaining in Safety Checklist Uploads.
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
            {entries.map((entry) => (
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
                <td>
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
            ))}
            {entries.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <HbcTypography intent="bodySmall">
                    Nothing awaiting review — weekly ingestion is clean.
                  </HbcTypography>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </WorkspacePageShell>
  );
}
