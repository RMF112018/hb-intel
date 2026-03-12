import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type {
  IBenchmarkFilterContext,
  IScoreBenchmarkFiltersResult,
} from '@hbc/score-benchmark';
import { BenchmarkFilterPanel } from './BenchmarkFilterPanel.js';

const createFilters = (
  overrides?: Partial<IScoreBenchmarkFiltersResult>,
): IScoreBenchmarkFiltersResult => {
  const context: IBenchmarkFilterContext = {
    projectType: 'Office',
    cohortPolicy: {
      defaultLocked: true,
      approvedCohortId: 'default',
      auditRequired: true,
    },
  };

  return {
    cacheKey: ['score-benchmark', 'filters', 'entity-1'],
    filterContext: context,
    invalidatedQueryKeys: [],
    applyFilterContext: vi.fn(() => createFilters({ filterContext: context })),
    resetToDefaultCohort: vi.fn(() => createFilters({ filterContext: context })),
    ...overrides,
  };
};

describe('BenchmarkFilterPanel', () => {
  it('hides in essential mode and renders read-only summary in standard mode', () => {
    const { rerender } = render(
      <BenchmarkFilterPanel
        complexity="Essential"
        filters={createFilters()}
      />,
    );

    expect(screen.queryByTestId('benchmark-filter-panel-expert')).not.toBeInTheDocument();

    rerender(
      <BenchmarkFilterPanel
        complexity="Standard"
        filters={createFilters()}
      />,
    );

    expect(screen.getByTestId('benchmark-filter-panel-standard-summary')).toHaveTextContent('Active benchmark filters');
  });

  it('applies governed filter changes with one-cycle refresh and accessible announcement', () => {
    const apply = vi.fn((next: IBenchmarkFilterContext) => createFilters({ filterContext: next }));
    const onOneCycleRefresh = vi.fn();

    render(
      <BenchmarkFilterPanel
        complexity="Expert"
        filters={createFilters({ applyFilterContext: apply })}
        onOneCycleRefresh={onOneCycleRefresh}
      />,
    );

    fireEvent.change(screen.getByTestId('filter-valueRange-min'), { target: { value: '900' } });
    fireEvent.change(screen.getByTestId('filter-valueRange-max'), { target: { value: '100' } });
    fireEvent.click(screen.getByTestId('filter-apply'));

    expect(apply).toHaveBeenCalledTimes(1);
    expect(apply.mock.calls[0]?.[0].valueRange).toEqual([100, 900]);
    expect(onOneCycleRefresh).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('benchmark-filter-announcement')).toHaveTextContent('Filters updated');
  });

  it('surfaces guardrail warning and supports reset-to-defaults flow', () => {
    const reset = vi.fn(() => createFilters());
    render(
      <BenchmarkFilterPanel
        complexity="Expert"
        filters={createFilters({
          applyFilterContext: vi.fn(() => {
            throw new Error('Default cohort cannot be silently changed while lock is enabled.');
          }),
          resetToDefaultCohort: reset,
        })}
      />,
    );

    fireEvent.click(screen.getByTestId('filter-apply'));
    expect(screen.getByTestId('benchmark-filter-guardrail-warning')).toHaveTextContent('Default cohort cannot be silently changed');

    fireEvent.click(screen.getByTestId('filter-reset-defaults'));
    expect(reset).toHaveBeenCalledTimes(1);
  });
});
