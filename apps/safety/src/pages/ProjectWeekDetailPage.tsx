import { useMemo, type ReactNode } from 'react';
import { Link, useParams } from '@tanstack/react-router';
import {
  HbcBanner,
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
import { SafetyMasthead, SafetySectionHeader, SafetyStatStrip } from '../components/index.js';

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

  // Page-level state: project-week record is fatal. Inspections list failure
  // is a partial failure — the rollup stats still render; only the events
  // table degrades (Task C honesty rule).
  const isLoading = periodsQuery.isPending || projectWeekQuery.isPending;
  const isNotFound =
    !isLoading && !projectWeekQuery.isError && projectWeekQuery.data === null;
  const isError = periodsQuery.isError || projectWeekQuery.isError || isNotFound;
  const errorMessage = isNotFound
    ? 'Project-week record not found.'
    : 'Failed to load project-week record.';

  const inspectionsPartialFailure =
    !isError && inspectionsQuery.isError;

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
          <SafetyMasthead
            eyebrow={`Safety · Project Week`}
            title={projectWeek.projectNameSnapshot ?? projectNumber}
            description={`Project-week rollup for ${projectNumber}.`}
            meta={[
              { key: 'location', label: projectWeek.projectLocationSnapshot },
              { key: 'week', label: `Week of ${weekStartDate}` },
              {
                key: 'stage',
                label: projectWeek.projectStageSnapshot
                  ? `Stage: ${projectWeek.projectStageSnapshot}`
                  : 'Stage: —',
              },
            ]}
          />

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
            {inspectionsPartialFailure && (
              <HbcBanner variant="warning" className="safety-partial-banner">
                Inspection events could not be loaded. The rollup stats above are from the cached
                project-week record and may be stale.{' '}
                <button
                  type="button"
                  className="safety-link"
                  onClick={() => void inspectionsQuery.refetch()}
                >
                  Retry inspections
                </button>
              </HbcBanner>
            )}
            <HbcDataTable<SafetyInspectionEvent>
              data={inspections as SafetyInspectionEvent[]}
              columns={columns}
              toolId="safety-project-week-inspections"
              isLoading={inspectionsQuery.isPending}
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
