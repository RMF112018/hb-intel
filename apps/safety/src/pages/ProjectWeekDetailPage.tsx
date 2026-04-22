import { useMemo, type ReactNode } from 'react';
import { Link, useParams } from '@tanstack/react-router';
import { HbcTypography, WorkspacePageShell } from '@hbc/ui-kit';
import { useInspections, useProjectWeek, useReportingPeriods } from '@hbc/features-safety';

const OFFICE_ONLY: Array<'office'> = ['office'];

function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return `${Math.round(value * 100)}%`;
}

export function ProjectWeekDetailPage(): ReactNode {
  const { projectNumber, weekStartDate } = useParams({
    from: '/projects/$projectNumber/weeks/$weekStartDate',
  });
  const periodsQuery = useReportingPeriods();
  const periods = periodsQuery.data ?? [];
  const period = useMemo(
    () => periods.find((p) => p.weekStartDate === weekStartDate) ?? periods[0],
    [periods, weekStartDate],
  );
  const projectWeekQuery = useProjectWeek(period?.id ?? '', projectNumber);
  const projectWeek = projectWeekQuery.data;
  const inspectionsQuery = useInspections({
    reportingPeriodId: period?.id,
    projectNumber,
  });
  const inspections = inspectionsQuery.data ?? [];

  // Per plan §4: not-found → isError.
  const isLoading = periodsQuery.isPending || projectWeekQuery.isPending;
  const isNotFound =
    !isLoading && !projectWeekQuery.isError && projectWeekQuery.data === null;
  const isError = periodsQuery.isError || projectWeekQuery.isError || isNotFound;
  const errorMessage = isNotFound
    ? 'Project-week record not found.'
    : 'Failed to load project-week record.';

  return (
    <WorkspacePageShell
      layout="detail"
      title={`${projectNumber} — week of ${weekStartDate}`}
      supportedModes={OFFICE_ONLY}
      isLoading={isLoading}
      isError={isError}
      errorMessage={errorMessage}
      onRetry={() => {
        void projectWeekQuery.refetch();
        void inspectionsQuery.refetch();
      }}
    >
      {projectWeek && (
        <section style={{ display: 'grid', gap: '1rem' }}>
          <header style={{ display: 'grid' }}>
            <HbcTypography intent="heading3">
              {projectWeek.projectNameSnapshot ?? '…'}
            </HbcTypography>
            <HbcTypography intent="bodySmall">
              {projectWeek.projectLocationSnapshot}
            </HbcTypography>
          </header>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
            <Stat label="Inspections" value={String(projectWeek.inspectionCount ?? 0)} />
            <Stat
              label="Average score"
              value={formatPercent(projectWeek.averageInspectionScore ?? null)}
            />
            <Stat label="Highest risk" value={projectWeek.highestRiskFindingLevel ?? '—'} />
            <Stat label="Status" value={projectWeek.publishStatus ?? '—'} />
          </div>

          {projectWeek.weeklySummary && (
            <section>
              <HbcTypography intent="heading3">Weekly summary</HbcTypography>
              <HbcTypography intent="body">{projectWeek.weeklySummary}</HbcTypography>
            </section>
          )}

          <section>
            <HbcTypography intent="heading3">Inspection events</HbcTypography>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Inspection</th>
                  <th style={{ textAlign: 'left' }}>Date</th>
                  <th style={{ textAlign: 'left' }}>Score</th>
                  <th style={{ textAlign: 'left' }}>Status</th>
                  <th style={{ textAlign: 'left' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {inspections.map((ie) => (
                  <tr key={ie.id}>
                    <td>{ie.title}</td>
                    <td>{ie.inspectionDate}</td>
                    <td>{formatPercent(ie.inspectionScore)}</td>
                    <td>{ie.ingestionStatus}</td>
                    <td>
                      <Link
                        to="/inspections/$inspectionEventId"
                        params={{ inspectionEventId: ie.id }}
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
                {inspections.length === 0 && (
                  <tr>
                    <td colSpan={5}>
                      <HbcTypography intent="bodySmall">
                        No inspection events recorded yet.
                      </HbcTypography>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        </section>
      )}
    </WorkspacePageShell>
  );
}

function Stat({ label, value }: { label: string; value: string }): ReactNode {
  return (
    <div style={{ display: 'grid' }}>
      <HbcTypography intent="bodySmall">{label}</HbcTypography>
      <HbcTypography intent="heading3">{value}</HbcTypography>
    </div>
  );
}
