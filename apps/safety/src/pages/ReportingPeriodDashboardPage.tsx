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
import {
  SafetyMasthead,
  SafetyPeriodHealthPanel,
  SafetyPriorityProjects,
  SafetySectionHeader,
  SafetyStatStrip,
  SafetyStatusPanel,
} from '../components/index.js';
import {
  derivePeriodsDashboardState,
  type PeriodsDashboardState,
} from './periodsDashboardState.js';
import {
  classifyPeriodHealth,
  rankProjectWeeks,
} from './reportingPeriodDashboardDerivation.js';
import {
  readFailureMessage,
  supportDetailLines,
  type SupportDetails,
} from './supportTruth.js';

const OFFICE_ONLY: Array<'office'> = ['office'];

function formatPercent(value: number | null): string {
  if (value === null) return '—';
  return `${Math.round(value * 100)}%`;
}

function publishStatusVariantFor(status: string): StatusVariant {
  switch (status) {
    case 'published':
      return 'success';
    case 'review-required':
      return 'atRisk';
    case 'completed':
      return 'info';
    case 'in-progress':
      return 'info';
    case 'awaiting-upload':
      return 'pending';
    case 'not-started':
      return 'neutral';
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
 * ReportingPeriodDashboardPage — Phase-04 audit G-04 dashboard recomposition.
 *
 * Layout order (top → bottom), when state.variant === 'ready':
 *   1. Masthead (period-health chip in meta)
 *   2. SafetyPeriodHealthPanel (authored operational summary)
 *   3. SafetyPriorityProjects (attention list, drill-in cards)
 *   4. SafetyStatStrip (supporting KPI layer, in body — the previous
 *      dashboardConfig-based KPI row is removed so KPIs support the
 *      story rather than lead it)
 *   5. HbcDataTable under "All project-weeks in this reporting period"
 *      (supporting coverage)
 *
 * Empty-state split (locked):
 *   - state.variant === 'empty': render SafetyStatusPanel intent="empty"
 *     only; health panel / priority projects / stat strip / table are
 *     not rendered.
 *   - Priority-list secondary-empty ("Nothing flagged…") renders inside
 *     SafetyPriorityProjects only when project-weeks exist but none cross
 *     prioritization thresholds — never stacks with the page-empty posture.
 *
 * WorkspacePageShell continues to own fatal / loading state via
 * derivePeriodsDashboardState. SafetyStatusPanel continues to govern
 * in-page non-fatal states (subordinate project-weeks failure, empty,
 * incidents advisory).
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
  const projectWeeks = (projectWeeksQuery.data ?? []) as SafetyProjectWeekRecord[];

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

  const health = useMemo(
    () => classifyPeriodHealth(projectWeeks),
    [projectWeeks],
  );
  const priorityItems = useMemo(
    () => rankProjectWeeks(projectWeeks),
    [projectWeeks],
  );

  const kpiCards = useMemo<KpiCardData[]>(() => {
    if (projectWeeks.length === 0) return [];
    const totalInspections = projectWeeks.reduce(
      (acc, pw) => acc + (pw.inspectionCount ?? 0),
      0,
    );
    const scored = projectWeeks.filter(
      (pw) => pw.averageInspectionScore !== null,
    );
    const avgScore =
      scored.length === 0
        ? null
        : scored.reduce(
            (acc, pw) => acc + (pw.averageInspectionScore ?? 0),
            0,
          ) / scored.length;
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
            variant={publishStatusVariantFor(row.original.publishStatus)}
            label={row.original.publishStatus}
            size="small"
          />
        ),
      },
      {
        id: 'drillIn',
        header: 'Drill-in',
        cell: ({ row }) =>
          activePeriod && row.original.projectNumber && activePeriod.weekStartDate ? (
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

  const isFatal = state.variant === 'fatal-periods' || state.variant === 'fatal-both';
  const periodsFailure = readFailureMessage(periodsQuery.error, 'reporting-periods');
  const projectWeeksFailure = readFailureMessage(projectWeeksQuery.error, 'project-weeks');
  const errorMessage =
    state.variant === 'fatal-periods'
      ? `${periodsFailure.headline} ${periodsFailure.detail}`
      : state.variant === 'fatal-both'
        ? `${periodsFailure.headline} ${projectWeeksFailure.headline}`
        : undefined;

  const isReady = state.variant === 'ready';
  const isEmpty = state.variant === 'empty';

  const healthStateLabel: Record<typeof health.state, string> = {
    'on-track': 'On track',
    watchlist: 'Watchlist',
    'attention-needed': 'Attention needed',
    critical: 'Critical',
  };

  return (
    <WorkspacePageShell
      layout="dashboard"
      title="Reporting period dashboard"
      supportedModes={OFFICE_ONLY}
      isLoading={state.variant === 'loading'}
      isError={isFatal}
      errorMessage={errorMessage}
      onRetry={retryPeriods}
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
          description="Project-week rollups for the selected reporting period. Drill into any priority card or table row for inspection detail."
          meta={
            activePeriod
              ? [
                  { key: 'week', label: `Week of ${activePeriod.weekStartDate}` },
                  { key: 'status', label: `Period status: ${activePeriod.status}` },
                  ...(isReady
                    ? [{ key: 'health', label: `Health: ${healthStateLabel[health.state]}` }]
                    : []),
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

          {state.variant === 'subordinate-project-weeks' && (
            <>
              <SafetyStatusPanel
                intent="partial-failure"
                data-safety-ui="project-weeks-subordinate-error"
                description={projectWeeksFailure.headline}
                detail={projectWeeksFailure.detail}
                role="alert"
                ariaLive="assertive"
                ariaAtomic={true}
                action={{
                  label: 'Retry project-week records',
                  pendingLabel: 'Retrying…',
                  isPending: projectWeeksQuery.isPending,
                  variant: 'secondary',
                  onClick: retryProjectWeeks,
                }}
              />
              <DashboardSupportDetails details={projectWeeksFailure.support} />
            </>
          )}

          {isEmpty && (
            <SafetyStatusPanel
              intent="empty"
              data-safety-ui="project-weeks-empty"
              title="No project-week records for this reporting period"
              description="Project-week records are generated after checklist uploads commit against this period."
            />
          )}

          {isReady && (
            <>
              <SafetyPeriodHealthPanel
                health={health}
                periodLabel={
                  activePeriod?.periodLabel ?? 'Selected reporting period'
                }
              />

              <SafetyPriorityProjects
                items={priorityItems}
                activePeriod={activePeriod}
                hasProjectWeeks={projectWeeks.length > 0}
              />

              <section
                className="safety-dashboard-stat-layer"
                data-safety-ui="dashboard-stat-layer"
                aria-label="Supporting KPIs"
              >
                <SafetyStatStrip cards={kpiCards} />
              </section>

              <section
                className="safety-section"
                data-safety-ui="dashboard-all-project-weeks"
                aria-labelledby="safety-dashboard-all-project-weeks-heading"
              >
                <SafetySectionHeader
                  title="All project-weeks in this reporting period"
                  description="Supporting table view of every project-week in this period. The priority list above surfaces the most attention-worthy entries first."
                />
                <HbcDataTable<SafetyProjectWeekRecord>
                  data={projectWeeks}
                  columns={columns}
                  toolId="safety-periods-table"
                />
              </section>
            </>
          )}
        </section>
      </div>
    </WorkspacePageShell>
  );
}

function DashboardSupportDetails({
  details,
}: {
  readonly details: SupportDetails;
}): ReactNode {
  const bounded = supportDetailLines(details);
  if (bounded.length === 0) return null;
  return (
    <details data-safety-ui="dashboard-support-details">
      <summary>Support details</summary>
      <ul>
        {bounded.map((item) => (
          <li key={item}>
            <HbcTypography intent="bodySmall">{item}</HbcTypography>
          </li>
        ))}
      </ul>
    </details>
  );
}
