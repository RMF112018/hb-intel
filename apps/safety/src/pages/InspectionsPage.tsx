import { useMemo, useState, type ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { HbcSelect, HbcTextField, HbcTypography, WorkspacePageShell } from '@hbc/ui-kit';
import { useInspections, useReportingPeriods } from '@hbc/features-safety';

function formatPercent(value: number | null): string {
  if (value === null) return '—';
  return `${Math.round(value * 100)}%`;
}

export function InspectionsPage(): ReactNode {
  const { data: periods = [] } = useReportingPeriods();
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('');
  const [projectFilter, setProjectFilter] = useState<string>('');

  const activePeriodId = selectedPeriodId || periods[0]?.id || '';
  const { data: inspections = [] } = useInspections({ reportingPeriodId: activePeriodId });

  const filtered = useMemo(
    () =>
      projectFilter
        ? inspections.filter((ie) => ie.projectNumber.includes(projectFilter))
        : inspections,
    [inspections, projectFilter],
  );

  return (
    <WorkspacePageShell layout="list" title="Inspections">
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
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <HbcTypography intent="bodySmall">
                    No inspections match the current filter.
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
