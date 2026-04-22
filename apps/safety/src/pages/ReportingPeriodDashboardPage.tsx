import { useMemo, useState, type ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { HbcSelect, HbcTypography, WorkspacePageShell } from '@hbc/ui-kit';
import { useProjectWeeks, useReportingPeriods } from '@hbc/features-safety';

function formatPercent(value: number | null): string {
  if (value === null) return '—';
  return `${Math.round(value * 100)}%`;
}

export function ReportingPeriodDashboardPage(): ReactNode {
  const { data: periods = [] } = useReportingPeriods();
  const [selected, setSelected] = useState<string>('');
  const activePeriod = useMemo(
    () => periods.find((p) => p.id === selected) ?? periods[0],
    [periods, selected],
  );
  const { data: projectWeeks = [] } = useProjectWeeks({
    reportingPeriodId: activePeriod?.id,
  });

  return (
    <WorkspacePageShell layout="dashboard" title="Reporting period dashboard">
      <section style={{ display: 'grid', gap: '1rem' }}>
        <div style={{ maxWidth: '20rem' }}>
          <HbcSelect
            label="Reporting period"
            value={activePeriod?.id ?? ''}
            onChange={(value) => setSelected(value)}
            options={periods.map((p) => ({ value: p.id, label: p.periodLabel }))}
          />
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Project</th>
              <th style={{ textAlign: 'left' }}>Inspections</th>
              <th style={{ textAlign: 'left' }}>Average score</th>
              <th style={{ textAlign: 'left' }}>Highest risk</th>
              <th style={{ textAlign: 'left' }}>Status</th>
              <th style={{ textAlign: 'left' }}>Drill-in</th>
            </tr>
          </thead>
          <tbody>
            {projectWeeks.map((pw) => (
              <tr key={pw.id}>
                <td>
                  <HbcTypography intent="body">{pw.projectNumber}</HbcTypography>
                  <HbcTypography intent="bodySmall">{pw.projectNameSnapshot}</HbcTypography>
                </td>
                <td>{pw.inspectionCount}</td>
                <td>{formatPercent(pw.averageInspectionScore)}</td>
                <td>{pw.highestRiskFindingLevel ?? '—'}</td>
                <td>{pw.publishStatus}</td>
                <td>
                  {activePeriod && (
                    <Link
                      to="/projects/$projectNumber/weeks/$weekStartDate"
                      params={{
                        projectNumber: pw.projectNumber,
                        weekStartDate: activePeriod.weekStartDate,
                      }}
                    >
                      Open
                    </Link>
                  )}
                </td>
              </tr>
            ))}
            {projectWeeks.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <HbcTypography intent="bodySmall">
                    No project-week records yet for this period.
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
