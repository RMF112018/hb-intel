import { useMemo, useState, type ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { HbcSelect, HbcTextField, HbcTypography, WorkspacePageShell } from '@hbc/ui-kit';
import { useInspections, useReportingPeriods } from '@hbc/features-safety';

const OFFICE_ONLY: Array<'office'> = ['office'];

function formatPercent(value: number | null): string {
  if (value === null) return '—';
  return `${Math.round(value * 100)}%`;
}

export function InspectionsPage(): ReactNode {
  const periodsQuery = useReportingPeriods();
  const periods = periodsQuery.data ?? [];
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('');
  const [projectFilter, setProjectFilter] = useState<string>('');

  const activePeriodId = selectedPeriodId || periods[0]?.id || '';
  const inspectionsQuery = useInspections({ reportingPeriodId: activePeriodId });
  const inspections = inspectionsQuery.data ?? [];

  const filtered = useMemo(
    () =>
      projectFilter
        ? inspections.filter((ie) => ie.projectNumber.includes(projectFilter))
        : inspections,
    [inspections, projectFilter],
  );

  const isLoading = periodsQuery.isPending || inspectionsQuery.isPending;
  const isError = periodsQuery.isError || inspectionsQuery.isError;
  const hasAnyInspections = inspections.length > 0;
  const isFilteredEmpty = hasAnyInspections && filtered.length === 0;
  const isTrulyEmpty = !isLoading && !isError && inspections.length === 0;

  return (
    <WorkspacePageShell
      layout="list"
      title="Inspections"
      supportedModes={OFFICE_ONLY}
      isLoading={isLoading}
      isError={isError}
      errorMessage="Failed to load inspections."
      onRetry={() => {
        void periodsQuery.refetch();
        void inspectionsQuery.refetch();
      }}
      isEmpty={isTrulyEmpty || isFilteredEmpty}
      emptyMessage={
        isFilteredEmpty
          ? 'No inspections match the current filter.'
          : 'No inspections recorded for this period.'
      }
    >
      <section style={{ display: 'grid', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ minWidth: '16rem' }}>
            <HbcSelect
              label="Reporting period"
              value={activePeriodId}
              onChange={(value) => setSelectedPeriodId(value)}
              options={periods.map((p) => ({ value: p.id, label: p.periodLabel }))}
            />
          </div>
          <div style={{ minWidth: '16rem' }}>
            <HbcTextField
              label="Project number"
              value={projectFilter}
              onChange={(value) => setProjectFilter(value)}
              placeholder="e.g. 2024-118"
            />
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Project</th>
              <th style={{ textAlign: 'left' }}>Date</th>
              <th style={{ textAlign: 'left' }}>Insp #</th>
              <th style={{ textAlign: 'left' }}>Score</th>
              <th style={{ textAlign: 'left' }}>Status</th>
              <th style={{ textAlign: 'left' }}>Open</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((ie) => (
              <tr key={ie.id}>
                <td>
                  <HbcTypography intent="body">{ie.projectNumber}</HbcTypography>
                  <HbcTypography intent="bodySmall">{ie.projectNameSnapshot}</HbcTypography>
                </td>
                <td>{ie.inspectionDate}</td>
                <td>{ie.inspectionNumber}</td>
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
          </tbody>
        </table>
      </section>
    </WorkspacePageShell>
  );
}
