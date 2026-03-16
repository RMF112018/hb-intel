import { useMemo, useState } from 'react';
import { HbcSmartEmptyState } from '@hbc/smart-empty-state';
import type { ISmartEmptyStateConfig } from '@hbc/smart-empty-state';
import {
  HbcCheckbox,
  HbcDataTable,
  HbcFormRow,
  HbcSelect,
  HbcSpinner,
  HbcStatusBadge,
  HbcTypography,
  HbcButton,
} from '@hbc/ui-kit';
import type { ColumnDef } from '@hbc/ui-kit';

import {
  DEFAULT_PORTFOLIO_FILTERS,
  filterPortfolioRows,
  getConfidenceLabel,
  getConfidenceVariant,
  getStatusVariant,
  getCompoundSeverityScore,
  sortPortfolioRows,
  type PortfolioHealthRow,
  type PortfolioHealthSortMode,
} from './displayModel.js';
import type { HealthStatus } from '../types/index.js';

export interface PortfolioHealthTableProps {
  rows: PortfolioHealthRow[];
  isLoading?: boolean;
  onOpenProject: (projectId: string) => void;
}

const STATUS_OPTIONS: Array<{ value: HealthStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All statuses' },
  { value: 'on-track', label: 'On track' },
  { value: 'watch', label: 'Watch' },
  { value: 'at-risk', label: 'At risk' },
  { value: 'critical', label: 'Critical' },
  { value: 'data-pending', label: 'Data pending' },
];

const SORT_OPTIONS: Array<{ value: PortfolioHealthSortMode; label: string }> = [
  { value: 'deterioration-velocity', label: 'Deterioration velocity' },
  { value: 'compound-risk-severity', label: 'Compound risk severity' },
  { value: 'unresolved-action-backlog', label: 'Unresolved action backlog' },
];

const PORTFOLIO_EMPTY_CONFIG: ISmartEmptyStateConfig = {
  resolve: (context) => ({
    module: context.module,
    view: context.view,
    classification: 'truly-empty',
    heading: 'No portfolio health rows',
    description: 'Portfolio triage data is not available.',
    coachingTip: 'Portfolio health data populates once project health pulses are configured and collected.',
  }),
};

export const PortfolioHealthTable = ({
  rows,
  isLoading = false,
  onOpenProject,
}: PortfolioHealthTableProps) => {
  const [filters, setFilters] = useState(DEFAULT_PORTFOLIO_FILTERS);
  const [sortMode, setSortMode] =
    useState<PortfolioHealthSortMode>('deterioration-velocity');

  const filteredRows = useMemo(
    () => filterPortfolioRows(rows, filters),
    [filters, rows]
  );
  const tableRows = useMemo(
    () =>
      sortPortfolioRows(filteredRows, sortMode).map((row) => ({
        ...row,
        compoundRiskSeverityScore: getCompoundSeverityScore(
          row.compoundRiskSeverity
        ),
      })),
    [filteredRows, sortMode]
  );

  const columns = useMemo<ColumnDef<PortfolioHealthRow>[]>(
    () => [
      {
        id: 'project',
        accessorKey: 'projectName',
        header: 'Project',
        cell: ({ row }) => (
          <HbcButton
            variant="ghost"
            size="sm"
            onClick={() => onOpenProject(row.original.projectId)}
          >
            {row.original.projectName}
          </HbcButton>
        ),
      },
      {
        id: 'overall',
        header: 'Overall',
        cell: ({ row }) => (
          <HbcStatusBadge
            variant={getStatusVariant(row.original.overallStatus)}
            label={`${row.original.overallStatus} (${row.original.overallScore})`}
          />
        ),
      },
      {
        id: 'confidence',
        header: 'Confidence',
        cell: ({ row }) => (
          <HbcStatusBadge
            variant={getConfidenceVariant(row.original.confidenceTier)}
            label={`${getConfidenceLabel(row.original.confidenceTier)} (${row.original.confidenceScore})`}
          />
        ),
      },
      {
        id: 'dimensions',
        header: 'Dimensions',
        cell: ({ row }) => (
          <HbcTypography intent="bodySmall">
            C:{row.original.dimensions.cost} T:{row.original.dimensions.time} F:
            {row.original.dimensions.field} O:{row.original.dimensions.office}
          </HbcTypography>
        ),
      },
      {
        id: 'compound-risk',
        header: 'Compound risk',
        cell: ({ row }) => (
          <HbcTypography intent="bodySmall">
            {row.original.compoundRiskActive
              ? row.original.compoundRiskSeverity
              : 'none'}
          </HbcTypography>
        ),
      },
      {
        id: 'top-action',
        header: 'Top action summary',
        cell: ({ row }) => (
          <HbcTypography intent="bodySmall">
            {row.original.topActionSummary}
          </HbcTypography>
        ),
      },
      {
        id: 'triage',
        header: 'Triage reasons',
        cell: ({ row }) => (
          <HbcTypography intent="bodySmall">
            {row.original.triageReasons.join(' | ')}
          </HbcTypography>
        ),
      },
    ],
    [onOpenProject]
  );

  if (isLoading) {
    return <HbcSpinner size="lg" label="Loading portfolio health table" />;
  }

  if (rows.length === 0) {
    return (
      <HbcSmartEmptyState
        config={PORTFOLIO_EMPTY_CONFIG}
        context={{
          module: 'project-hub',
          view: 'portfolio-health',
          hasActiveFilters: false,
          hasPermission: true,
          isFirstVisit: false,
          currentUserRole: 'user',
          isLoadError: false,
        }}
        variant="inline"
      />
    );
  }

  return (
    <div>
      <HbcTypography intent="heading3">Portfolio Health Table</HbcTypography>
      <HbcFormRow>
        <HbcSelect
          label="Status filter"
          value={filters.status}
          onChange={(value) =>
            setFilters((current) => ({
              ...current,
              status: value as HealthStatus | 'all',
            }))
          }
          options={STATUS_OPTIONS}
        />
        <HbcSelect
          label="Sort mode"
          value={sortMode}
          onChange={(value) => setSortMode(value as PortfolioHealthSortMode)}
          options={SORT_OPTIONS}
        />
      </HbcFormRow>
      <HbcFormRow>
        <HbcCheckbox
          label="Low-confidence only"
          checked={filters.lowConfidenceOnly}
          onChange={(checked) =>
            setFilters((current) => ({ ...current, lowConfidenceOnly: checked }))
          }
        />
        <HbcCheckbox
          label="Compound-risk active only"
          checked={filters.compoundRiskActiveOnly}
          onChange={(checked) =>
            setFilters((current) => ({
              ...current,
              compoundRiskActiveOnly: checked,
            }))
          }
        />
        <HbcCheckbox
          label="Manual-influence-heavy only"
          checked={filters.manualInfluenceHeavyOnly}
          onChange={(checked) =>
            setFilters((current) => ({
              ...current,
              manualInfluenceHeavyOnly: checked,
            }))
          }
        />
      </HbcFormRow>
      <HbcDataTable<PortfolioHealthRow>
        data={tableRows}
        columns={columns}
        enableSorting
        emptyStateConfig={{
          title: 'No matching projects',
          description: 'No portfolio rows match current triage filters.',
        }}
      />
    </div>
  );
};
