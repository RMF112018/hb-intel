import { useMemo, useState, type ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import {
  HbcDataTable,
  HbcSelect,
  HbcStatusBadge,
  HbcTextField,
  HbcTypography,
  WorkspacePageShell,
} from '@hbc/ui-kit';
import type { ColumnDef, StatusVariant } from '@hbc/ui-kit';
import { useInspections, useReportingPeriods } from '@hbc/features-safety';
import type { SafetyInspectionEvent } from '@hbc/features-safety';
import { SafetyMasthead } from '../components/index.js';

const OFFICE_ONLY: Array<'office'> = ['office'];

function formatPercent(value: number | null): string {
  if (value === null) return '—';
  return `${Math.round(value * 100)}%`;
}

function statusVariantFor(status: string): StatusVariant {
  switch (status) {
    case 'committed':
      return 'completed';
    case 'replayed-success':
      return 'success';
    case 'review-required':
      return 'atRisk';
    case 'parse-error':
    case 'invalid-template':
    case 'commit-failed':
      return 'error';
    case 'superseded':
      return 'neutral';
    default:
      return 'draft';
  }
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

  const columns = useMemo<ColumnDef<SafetyInspectionEvent, unknown>[]>(
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
      { accessorKey: 'inspectionDate', header: 'Date' },
      { accessorKey: 'inspectionNumber', header: 'Insp #' },
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
        header: 'Open',
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
      listConfig={{
        filterStoreKey: 'safety-inspections',
      }}
    >
      <div className="safety-page">
        <SafetyMasthead
          eyebrow="Safety · Inspections"
          title="Committed inspections"
          description="Authoritative per-inspection records for the selected reporting period. Filter by project number; open any row for findings, section scores, and the source workbook."
        />
        <section className="safety-section">
          <div className="safety-filter-bar">
            <div className="safety-filter-bar__field">
              <HbcSelect
                label="Reporting period"
                value={activePeriodId}
                onChange={(value) => setSelectedPeriodId(value)}
                options={periods.map((p) => ({ value: p.id, label: p.periodLabel }))}
              />
            </div>
            <div className="safety-filter-bar__field">
              <HbcTextField
                label="Project number"
                value={projectFilter}
                onChange={(value) => setProjectFilter(value)}
                placeholder="e.g. 2024-118"
              />
            </div>
          </div>

          <HbcDataTable<SafetyInspectionEvent>
            data={filtered as SafetyInspectionEvent[]}
            columns={columns}
            toolId="safety-inspections-table"
          />
        </section>
      </div>
    </WorkspacePageShell>
  );
}
