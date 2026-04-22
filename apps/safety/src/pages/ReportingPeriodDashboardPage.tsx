import { useMemo, useState, type ReactNode } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import {
  HbcBanner,
  HbcSelect,
  HbcTypography,
  WorkspacePageShell,
} from '@hbc/ui-kit';
import { useProjectWeeks, useReportingPeriods } from '@hbc/features-safety';

const OFFICE_ONLY: Array<'office'> = ['office'];

function formatPercent(value: number | null): string {
  if (value === null) return '—';
  return `${Math.round(value * 100)}%`;
}

export function ReportingPeriodDashboardPage(): ReactNode {
  const periodsQuery = useReportingPeriods();
  const periods = periodsQuery.data ?? [];
  const [selected, setSelected] = useState<string>('');
  const activePeriod = useMemo(
    () => periods.find((p) => p.id === selected) ?? periods[0],
    [periods, selected],
  );
  const projectWeeksQuery = useProjectWeeks({ reportingPeriodId: activePeriod?.id });
  const projectWeeks = projectWeeksQuery.data ?? [];

  // G-11: `/incidents` redirects here with `?from=incidents`. Show a one-time
  // banner explaining the redirect. Dismissible; clears on next navigation.
  const location = useLocation();
  const search = location.search as Record<string, unknown> | string;
  const fromIncidents =
    typeof search === 'string'
      ? /(?:^|[?&])from=incidents(?:&|$)/.test(search)
      : search?.from === 'incidents';
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const showRedirectBanner = Boolean(fromIncidents) && !bannerDismissed;

  const isLoading = periodsQuery.isPending || projectWeeksQuery.isPending;
  const isError = periodsQuery.isError || projectWeeksQuery.isError;
  const isTrulyEmpty = !isLoading && !isError && projectWeeks.length === 0;

  return (
    <WorkspacePageShell
      layout="dashboard"
      title="Reporting period dashboard"
      supportedModes={OFFICE_ONLY}
      isLoading={isLoading}
      isError={isError}
      errorMessage="Failed to load reporting periods."
      onRetry={() => {
        void periodsQuery.refetch();
        void projectWeeksQuery.refetch();
      }}
      isEmpty={isTrulyEmpty}
      emptyMessage="No project-week records have been generated yet for this period."
    >
      <section style={{ display: 'grid', gap: '1rem' }}>
        {showRedirectBanner && (
          <HbcBanner
            variant="info"
            onDismiss={() => setBannerDismissed(true)}
          >
            Incidents tracking is not available in this release. You&apos;ve been redirected to the
            reporting-period dashboard.
          </HbcBanner>
        )}

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
          </tbody>
        </table>
      </section>
    </WorkspacePageShell>
  );
}
