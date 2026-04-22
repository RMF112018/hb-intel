import { useMemo, type ReactNode } from 'react';
import { Link, useParams } from '@tanstack/react-router';
import {
  HbcCard,
  HbcDataTable,
  HbcStatusBadge,
  HbcTypography,
  WorkspacePageShell,
} from '@hbc/ui-kit';
import type { ColumnDef, StatusVariant } from '@hbc/ui-kit';
import type { KpiCardData } from '@hbc/models';
import { useInspections, useProjectWeek, useReportingPeriods } from '@hbc/features-safety';
import type { SafetyInspectionEvent } from '@hbc/features-safety';
import { SafetySectionHeader, SafetyStatStrip } from '../components/index.js';

const OFFICE_ONLY: Array<'office'> = ['office'];

function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return `${Math.round(value * 100)}%`;
}

function statusVariantFor(status: string): StatusVariant {
  switch (status) {
    case 'committed':
      return 'completed';
    case 'superseded':
      return 'neutral';
    case 'replayed-success':
      return 'success';
    case 'review-required':
      return 'atRisk';
    case 'parse-error':
    case 'invalid-template':
    case 'commit-failed':
      return 'error';
    default:
      return 'draft';
  }
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

  const isLoading = periodsQuery.isPending || projectWeekQuery.isPending;
  const isNotFound =
    !isLoading && !projectWeekQuery.isError && projectWeekQuery.data === null;
  const isError = periodsQuery.isError || projectWeekQuery.isError || isNotFound;
  const errorMessage = isNotFound
    ? 'Project-week record not found.'
    : 'Failed to load project-week record.';

  const kpiCards = useMemo<KpiCardData[]>(() => {
    if (!projectWeek) return [];
    return [
      {
        id: 'inspections',
        label: 'Inspections',
        value: projectWeek.inspectionCount ?? 0,
      },
      {
        id: 'avg-score',
        label: 'Average score',
        value: formatPercent(projectWeek.averageInspectionScore ?? null),
      },
      {
        id: 'highest-risk',
        label: 'Highest risk',
        value: projectWeek.highestRiskFindingLevel ?? '—',
      },
      {
        id: 'status',
        label: 'Status',
        value: projectWeek.publishStatus ?? '—',
      },
    ];
  }, [projectWeek]);

  const columns = useMemo<ColumnDef<SafetyInspectionEvent, unknown>[]>(
    () => [
      { accessorKey: 'title', header: 'Inspection' },
      { accessorKey: 'inspectionDate', header: 'Date' },
      {
        id: 'score',
        header: 'Score',
        cell: ({ row }) => formatPercent(row.original.inspectionScore),
      },
      {
        accessorKey: 'ingestionStatus',
        header: 'Status',
        cell: ({ row }) => (
          <HbcStatusBadge
            variant={statusVariantFor(row.original.ingestionStatus)}
            label={row.original.ingestionStatus}
            size="small"
          />
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <Link
            className="safety-link"
            to="/inspections/$inspectionEventId"
            params={{ inspectionEventId: row.original.id }}
          >
            Open
          </Link>
        ),
      },
    ],
    [],
  );

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
        <div className="safety-page">
          <header className="safety-detail-header">
            <HbcTypography intent="heading3">
              {projectWeek.projectNameSnapshot ?? '…'}
            </HbcTypography>
            <div className="safety-detail-header__meta">
              <HbcTypography intent="bodySmall">
                {projectWeek.projectLocationSnapshot}
              </HbcTypography>
              <HbcTypography intent="bodySmall">
                Week of {weekStartDate}
              </HbcTypography>
            </div>
          </header>

          <SafetyStatStrip cards={kpiCards} />

          {projectWeek.weeklySummary && (
            <HbcCard
              header={<SafetySectionHeader title="Weekly summary" />}
              weight="supporting"
            >
              <HbcTypography intent="body">{projectWeek.weeklySummary}</HbcTypography>
            </HbcCard>
          )}

          <section className="safety-section">
            <SafetySectionHeader
              title="Inspection events"
              description={`${inspections.length} recorded`}
            />
            <HbcDataTable<SafetyInspectionEvent>
              data={inspections as SafetyInspectionEvent[]}
              columns={columns}
              toolId="safety-project-week-inspections"
              emptyStateConfig={{
                title: 'No inspection events recorded yet',
                description:
                  'Uploads committed against this project-week will appear here.',
              }}
            />
          </section>
        </div>
      )}
    </WorkspacePageShell>
  );
}
