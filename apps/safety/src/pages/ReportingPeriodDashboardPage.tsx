import { useMemo, useState, type ReactNode } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import {
  HbcBanner,
  HbcDataTable,
  HbcSelect,
  HbcStatusBadge,
  HbcTypography,
  WorkspacePageShell,
} from '@hbc/ui-kit';
import type { ColumnDef, StatusVariant } from '@hbc/ui-kit';
import type { KpiCardData } from '@hbc/models';
import { useProjectWeeks, useReportingPeriods } from '@hbc/features-safety';
import type { SafetyProjectWeekRecord } from '@hbc/features-safety';

const OFFICE_ONLY: Array<'office'> = ['office'];

function formatPercent(value: number | null): string {
  if (value === null) return '—';
  return `${Math.round(value * 100)}%`;
}

function statusVariantFor(status: string): StatusVariant {
  switch (status) {
    case 'published':
      return 'success';
    case 'pending':
      return 'pending';
    case 'in-review':
      return 'atRisk';
    case 'draft':
      return 'draft';
    default:
      return 'neutral';
  }
}

function riskVariantFor(level: string | null): StatusVariant {
  switch (level) {
    case 'high':
      return 'critical';
    case 'medium':
      return 'atRisk';
    case 'info':
      return 'info';
    default:
      return 'neutral';
  }
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

  const kpiCards = useMemo<KpiCardData[]>(() => {
    if (projectWeeks.length === 0) return [];
    const totalInspections = projectWeeks.reduce((acc, pw) => acc + (pw.inspectionCount ?? 0), 0);
    const scored = projectWeeks.filter((pw) => pw.averageInspectionScore !== null);
    const avgScore =
      scored.length === 0
        ? null
        : scored.reduce((acc, pw) => acc + (pw.averageInspectionScore ?? 0), 0) / scored.length;
    const atRisk = projectWeeks.filter(
      (pw) =>
        pw.highestRiskFindingLevel === 'high' ||
        (pw.averageInspectionScore !== null && pw.averageInspectionScore < 0.85),
    ).length;
    return [
      { id: 'projects', label: 'Project-weeks', value: projectWeeks.length },
      { id: 'inspections', label: 'Inspections', value: totalInspections },
      { id: 'avg-score', label: 'Avg score', value: formatPercent(avgScore) },
      { id: 'at-risk', label: 'At-risk projects', value: atRisk },
    ];
  }, [projectWeeks]);

  const columns = useMemo<ColumnDef<SafetyProjectWeekRecord, unknown>[]>(
    () => [
      {
        accessorKey: 'projectNumber',
        header: 'Project',
        cell: ({ row }) => (
          <div>
            <HbcTypography intent="body">{row.original.projectNumber}</HbcTypography>
            <HbcTypography intent="bodySmall">{row.original.projectNameSnapshot}</HbcTypography>
          </div>
        ),
      },
      { accessorKey: 'inspectionCount', header: 'Inspections' },
      {
        id: 'avgScore',
        header: 'Avg score',
        cell: ({ row }) => formatPercent(row.original.averageInspectionScore),
      },
      {
        id: 'highestRisk',
        header: 'Highest risk',
        cell: ({ row }) =>
          row.original.highestRiskFindingLevel ? (
            <HbcStatusBadge
              variant={riskVariantFor(row.original.highestRiskFindingLevel)}
              label={row.original.highestRiskFindingLevel}
              size="small"
            />
          ) : (
            '—'
          ),
      },
      {
        accessorKey: 'publishStatus',
        header: 'Status',
        cell: ({ row }) => (
          <HbcStatusBadge
            variant={statusVariantFor(row.original.publishStatus)}
            label={row.original.publishStatus}
            size="small"
          />
        ),
      },
      {
        id: 'drillIn',
        header: 'Drill-in',
        cell: ({ row }) =>
          activePeriod ? (
            <Link
              className="safety-link"
              to="/projects/$projectNumber/weeks/$weekStartDate"
              params={{
                projectNumber: row.original.projectNumber,
                weekStartDate: activePeriod.weekStartDate,
              }}
            >
              Open
            </Link>
          ) : null,
      },
    ],
    [activePeriod],
  );

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
      dashboardConfig={{ kpiCards }}
    >
      <div className="safety-page">
        {showRedirectBanner && (
          <HbcBanner variant="info" onDismiss={() => setBannerDismissed(true)}>
            Incidents tracking is not available in this release. You&apos;ve been redirected to the
            reporting-period dashboard.
          </HbcBanner>
        )}

        <section className="safety-section">
          <div className="safety-filter-bar">
            <div className="safety-filter-bar__field">
              <HbcSelect
                label="Reporting period"
                value={activePeriod?.id ?? ''}
                onChange={(value) => setSelected(value)}
                options={periods.map((p) => ({ value: p.id, label: p.periodLabel }))}
              />
            </div>
          </div>

          <HbcDataTable<SafetyProjectWeekRecord>
            data={projectWeeks as SafetyProjectWeekRecord[]}
            columns={columns}
            toolId="safety-periods-table"
          />
        </section>
      </div>
    </WorkspacePageShell>
  );
}
