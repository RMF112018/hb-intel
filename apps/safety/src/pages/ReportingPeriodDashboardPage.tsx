import { useMemo, useState, type ReactNode } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import {
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
import { SafetyMasthead, SafetyStatusPanel } from '../components/index.js';
import {
  derivePeriodsDashboardState,
  type PeriodsDashboardState,
} from './periodsDashboardState.js';

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

/**
 * ReportingPeriodDashboardPage — Phase-3 root-cause remediation.
 *
 * The page no longer collapses `periods.isError || projectWeeks.isError`
 * into one lie ("Failed to load reporting periods."). It consumes the
 * pure `derivePeriodsDashboardState` helper to distinguish fatal-parent,
 * subordinate-dependent, true-empty, and ready states, and routes retries
 * to the actual failing seam.
 */
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

  // G-11: `/incidents` redirects here with `?from=incidents`. One-time banner.
  const location = useLocation();
  const search = location.search as Record<string, unknown> | string;
  const fromIncidents =
    typeof search === 'string'
      ? /(?:^|[?&])from=incidents(?:&|$)/.test(search)
      : search?.from === 'incidents';
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const showRedirectBanner = Boolean(fromIncidents) && !bannerDismissed;

  const state: PeriodsDashboardState = derivePeriodsDashboardState(
    periodsQuery,
    projectWeeksQuery,
    projectWeeks.length,
  );

  const retryPeriods = (): void => {
    void periodsQuery.refetch();
    void projectWeeksQuery.refetch();
  };
  const retryProjectWeeks = (): void => {
    void projectWeeksQuery.refetch();
  };

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

  // WorkspacePageShell-level state: only page-fatal variants collapse the
  // full page. Subordinate failures stay *inside* the page body so the
  // period selector and redirect banner remain interactive and honest.
  const isFatal = state.variant === 'fatal-periods' || state.variant === 'fatal-both';
  const errorMessage =
    state.variant === 'fatal-periods'
      ? state.message
      : state.variant === 'fatal-both'
        ? state.message
        : undefined;

  return (
    <WorkspacePageShell
      layout="dashboard"
      title="Reporting period dashboard"
      supportedModes={OFFICE_ONLY}
      isLoading={state.variant === 'loading'}
      isError={isFatal}
      errorMessage={errorMessage}
      onRetry={retryPeriods}
      dashboardConfig={{ kpiCards }}
    >
      <div className="safety-page">
        {showRedirectBanner && (
          <SafetyStatusPanel
            intent="advisory"
            data-safety-ui="dashboard-incidents-redirect"
            description="Incidents tracking is not available in this release. You’ve been redirected to the reporting-period dashboard."
            onDismiss={() => setBannerDismissed(true)}
          />
        )}

        <SafetyMasthead
          eyebrow="Safety · Dashboard"
          title={activePeriod ? activePeriod.periodLabel : 'Reporting period dashboard'}
          description="Project-week rollups for the selected reporting period. Drill into any row for inspection detail."
          meta={
            activePeriod
              ? [
                  { key: 'week', label: `Week of ${activePeriod.weekStartDate}` },
                  { key: 'status', label: `Period status: ${activePeriod.status}` },
                ]
              : undefined
          }
        />

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

          {state.variant === 'subordinate-project-weeks' ? (
            <SafetyStatusPanel
              intent="partial-failure"
              data-safety-ui="project-weeks-subordinate-error"
              description={state.message}
              detail={state.detail}
              action={{
                label: 'Retry project-week records',
                pendingLabel: 'Retrying…',
                isPending: projectWeeksQuery.isPending,
                variant: 'secondary',
                onClick: retryProjectWeeks,
              }}
            />
          ) : state.variant === 'empty' ? (
            <SafetyStatusPanel
              intent="empty"
              data-safety-ui="project-weeks-empty"
              title="No project-week records for this reporting period"
              description="Project-week records are generated after checklist uploads commit against this period."
            />
          ) : (
            <HbcDataTable<SafetyProjectWeekRecord>
              data={projectWeeks as SafetyProjectWeekRecord[]}
              columns={columns}
              toolId="safety-periods-table"
            />
          )}
        </section>
      </div>
    </WorkspacePageShell>
  );
}

