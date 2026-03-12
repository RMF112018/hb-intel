import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type React from 'react';

import { PortfolioHealthTable } from '../components/PortfolioHealthTable.js';
import type { PortfolioHealthRow } from '../components/displayModel.js';
import { renderWithTheme } from './testUtils.js';

vi.mock('@hbc/ui-kit', async () => {
  const actual = await vi.importActual<typeof import('@hbc/ui-kit')>('@hbc/ui-kit');
  return {
    ...actual,
    HbcSelect: ({
      label,
      value,
      onChange,
      options,
    }: {
      label: string;
      value: string;
      onChange: (value: string) => void;
      options: Array<{ value: string; label: string }>;
    }) => (
      <label>
        {label}
        <select
          aria-label={label}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    ),
    HbcDataTable: ({
      data,
      columns,
      emptyStateConfig,
    }: {
      data: PortfolioHealthRow[];
      columns: Array<{
        id?: string;
        header?: string;
        accessorKey?: string;
        cell?: (args: { row: { original: PortfolioHealthRow } }) => React.ReactNode;
      }>;
      emptyStateConfig?: { title: string };
    }) => (
      <div>
        <div>
          {columns.map((column) => (
            <span key={column.id ?? column.accessorKey}>{column.header}</span>
          ))}
        </div>
        {data.length === 0 && emptyStateConfig ? <div>{emptyStateConfig.title}</div> : null}
        {data.map((row) => (
          <div key={row.projectId}>
            {columns.map((column) => (
              <div key={`${row.projectId}-${column.id ?? column.accessorKey}`}>
                {column.cell
                  ? column.cell({ row: { original: row } })
                  : column.accessorKey
                    ? (row as Record<string, unknown>)[column.accessorKey]
                    : null}
              </div>
            ))}
          </div>
        ))}
      </div>
    ),
  };
});

const rowsFixture: PortfolioHealthRow[] = [
  {
    projectId: 'p-1',
    projectName: 'Atlas Medical',
    overallStatus: 'watch',
    overallScore: 72,
    confidenceTier: 'moderate',
    confidenceScore: 66,
    dimensions: { cost: 70, time: 74, field: 73, office: 69 },
    compoundRiskActive: false,
    compoundRiskSeverity: 'none',
    topActionSummary: 'Review schedule variance.',
    triageBucket: 'trending-down',
    triageReasons: ['watch on time'],
    manualInfluenceHeavy: false,
    deteriorationVelocity: 4,
    compoundRiskSeverityScore: 0,
    unresolvedActionBacklog: 2,
  },
  {
    projectId: 'p-2',
    projectName: 'Riverfront Tower',
    overallStatus: 'at-risk',
    overallScore: 51,
    confidenceTier: 'low',
    confidenceScore: 38,
    dimensions: { cost: 48, time: 52, field: 55, office: 49 },
    compoundRiskActive: true,
    compoundRiskSeverity: 'high',
    topActionSummary: 'Escalate field blockers.',
    triageBucket: 'attention-now',
    triageReasons: ['compound risk high', 'low confidence'],
    manualInfluenceHeavy: true,
    deteriorationVelocity: 11,
    compoundRiskSeverityScore: 3,
    unresolvedActionBacklog: 7,
  },
];

describe('PortfolioHealthTable', () => {
  it('renders required columns and triage reasons', () => {
    renderWithTheme(<PortfolioHealthTable rows={rowsFixture} onOpenProject={() => {}} />);

    expect(screen.getByText('Project')).toBeInTheDocument();
    expect(screen.getByText('Overall')).toBeInTheDocument();
    expect(screen.getByText('Confidence')).toBeInTheDocument();
    expect(screen.getByText('Dimensions')).toBeInTheDocument();
    expect(screen.getByText('Compound risk')).toBeInTheDocument();
    expect(screen.getByText('Top action summary')).toBeInTheDocument();
    expect(screen.getByText('Triage reasons')).toBeInTheDocument();
    expect(screen.getByText(/compound risk high/i)).toBeInTheDocument();
  });

  it('supports filters and project drill-in actions', () => {
    const onOpenProject = vi.fn();
    renderWithTheme(<PortfolioHealthTable rows={rowsFixture} onOpenProject={onOpenProject} />);

    const [lowConfidenceCheckbox, compoundRiskCheckbox] = screen.getAllByRole('checkbox');
    fireEvent.click(lowConfidenceCheckbox);
    expect(screen.getByText('Riverfront Tower')).toBeInTheDocument();
    expect(screen.queryByText('Atlas Medical')).not.toBeInTheDocument();

    fireEvent.click(compoundRiskCheckbox);
    expect(screen.getByText('Riverfront Tower')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Riverfront Tower' }));
    expect(onOpenProject).toHaveBeenCalledWith('p-2');
  });

  it('supports sort mode changes and loading/empty states', () => {
    const { rerender } = renderWithTheme(
      <PortfolioHealthTable rows={rowsFixture} onOpenProject={() => {}} />
    );

    fireEvent.change(screen.getByLabelText('Sort mode'), {
      target: { value: 'unresolved-action-backlog' },
    });
    expect(screen.getByText('Atlas Medical')).toBeInTheDocument();

    rerender(<PortfolioHealthTable rows={[]} isLoading onOpenProject={() => {}} />);
    expect(screen.getByText('Loading portfolio health table')).toBeInTheDocument();

    rerender(<PortfolioHealthTable rows={[]} onOpenProject={() => {}} />);
    expect(screen.getByText('No portfolio health rows')).toBeInTheDocument();
  });
});
