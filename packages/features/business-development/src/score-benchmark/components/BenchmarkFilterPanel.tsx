import React, { useMemo, useState } from 'react';
import type {
  IBenchmarkFilterContext,
  IScoreBenchmarkFiltersResult,
} from '@hbc/score-benchmark';
import {
  getComplexityFlags,
  type ScoreBenchmarkComplexityMode,
} from './displayModel.js';

export interface BenchmarkFilterPanelProps {
  readonly complexity: ScoreBenchmarkComplexityMode;
  readonly filters: IScoreBenchmarkFiltersResult;
  readonly onOneCycleRefresh?: () => void;
}

const toNumberOrUndefined = (value: string): number | undefined => {
  if (value.trim().length === 0) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const normalizeValueRange = (
  minValue?: number,
  maxValue?: number,
): [number, number] | undefined => {
  if (minValue === undefined || maxValue === undefined) {
    return undefined;
  }

  return minValue <= maxValue ? [minValue, maxValue] : [maxValue, minValue];
};

const changeSummary = (context: IBenchmarkFilterContext): string => {
  const keys = Object.entries(context)
    .filter(([, value]) => value !== undefined)
    .map(([key]) => key);

  return keys.length === 0 ? 'No active benchmark filters.' : `Active benchmark filters: ${keys.join(', ')}`;
};

export function BenchmarkFilterPanel({
  complexity,
  filters,
  onOneCycleRefresh,
}: BenchmarkFilterPanelProps): JSX.Element | null {
  const flags = getComplexityFlags(complexity);
  const [warning, setWarning] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState<string>('');

  const initial = filters.filterContext;
  const [projectType, setProjectType] = useState(initial.projectType ?? '');
  const [deliveryMethod, setDeliveryMethod] = useState(initial.deliveryMethod ?? '');
  const [procurementType, setProcurementType] = useState(initial.procurementType ?? '');
  const [valueMin, setValueMin] = useState(initial.valueRange?.[0]?.toString() ?? '');
  const [valueMax, setValueMax] = useState(initial.valueRange?.[1]?.toString() ?? '');
  const [geography, setGeography] = useState(initial.geography ?? '');
  const [ownerType, setOwnerType] = useState(initial.ownerType ?? '');
  const [incumbentRelationship, setIncumbentRelationship] = useState<
    NonNullable<IBenchmarkFilterContext['incumbentRelationship']>
  >(initial.incumbentRelationship ?? 'unknown');
  const [competitorCount, setCompetitorCount] = useState(initial.competitorCount?.toString() ?? '');
  const [scheduleComplexity, setScheduleComplexity] = useState<
    NonNullable<IBenchmarkFilterContext['scheduleComplexity']>
  >(initial.scheduleComplexity ?? 'moderate');

  const readOnlySummary = useMemo(
    () => changeSummary(filters.filterContext),
    [filters.filterContext],
  );

  if (flags.isEssential) {
    return null;
  }

  if (flags.isStandard) {
    return (
      <section aria-label="Benchmark Filter Panel" data-testid="benchmark-filter-panel-standard-summary">
        <h3>Benchmark Filter Context</h3>
        <p>{readOnlySummary}</p>
      </section>
    );
  }

  const applyChanges = (): void => {
    const minParsed = toNumberOrUndefined(valueMin);
    const maxParsed = toNumberOrUndefined(valueMax);
    const normalizedRange = normalizeValueRange(minParsed, maxParsed);

    const nextContext: IBenchmarkFilterContext = {
      ...filters.filterContext,
      projectType: projectType || undefined,
      deliveryMethod: deliveryMethod || undefined,
      procurementType: procurementType || undefined,
      valueRange: normalizedRange,
      geography: geography || undefined,
      ownerType: ownerType || undefined,
      incumbentRelationship,
      competitorCount: toNumberOrUndefined(competitorCount),
      scheduleComplexity: scheduleComplexity as IBenchmarkFilterContext['scheduleComplexity'],
    };

    try {
      filters.applyFilterContext(nextContext);
      setWarning(null);
      setAnnouncement(`Filters updated. ${changeSummary(nextContext)}`);
      onOneCycleRefresh?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Guardrail warning requires explicit confirmation.';
      setWarning(message);
      setAnnouncement(`Guardrail warning: ${message}`);
    }
  };

  return (
    <section aria-label="Benchmark Filter Panel" data-testid="benchmark-filter-panel-expert">
      <h3>Benchmark Filter Panel</h3>
      <p data-testid="benchmark-filter-summary">{readOnlySummary}</p>

      <div role="status" aria-live="polite" data-testid="benchmark-filter-announcement">
        {announcement}
      </div>

      {warning ? (
        <div role="alert" data-testid="benchmark-filter-guardrail-warning">
          {warning}
        </div>
      ) : null}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          applyChanges();
        }}
      >
        <label>
          Project Type
          <input value={projectType} onChange={(e) => setProjectType(e.target.value)} data-testid="filter-projectType" />
        </label>

        <label>
          Delivery Method
          <input value={deliveryMethod} onChange={(e) => setDeliveryMethod(e.target.value)} data-testid="filter-deliveryMethod" />
        </label>

        <label>
          Procurement Type
          <input value={procurementType} onChange={(e) => setProcurementType(e.target.value)} data-testid="filter-procurementType" />
        </label>

        <label>
          Value Range Min
          <input value={valueMin} onChange={(e) => setValueMin(e.target.value)} data-testid="filter-valueRange-min" />
        </label>

        <label>
          Value Range Max
          <input value={valueMax} onChange={(e) => setValueMax(e.target.value)} data-testid="filter-valueRange-max" />
        </label>

        <label>
          Geography
          <input value={geography} onChange={(e) => setGeography(e.target.value)} data-testid="filter-geography" />
        </label>

        <label>
          Owner Type
          <input value={ownerType} onChange={(e) => setOwnerType(e.target.value)} data-testid="filter-ownerType" />
        </label>

        <label>
          Incumbent Relationship
          <select
            value={incumbentRelationship}
            onChange={(e) =>
              setIncumbentRelationship(
                e.target.value as NonNullable<IBenchmarkFilterContext['incumbentRelationship']>
              )
            }
            data-testid="filter-incumbentRelationship"
          >
            <option value="incumbent">incumbent</option>
            <option value="new-client">new-client</option>
            <option value="unknown">unknown</option>
          </select>
        </label>

        <label>
          Competitor Count
          <input value={competitorCount} onChange={(e) => setCompetitorCount(e.target.value)} data-testid="filter-competitorCount" />
        </label>

        <label>
          Schedule Complexity
          <select
            value={scheduleComplexity}
            onChange={(e) =>
              setScheduleComplexity(e.target.value as NonNullable<IBenchmarkFilterContext['scheduleComplexity']>)
            }
            data-testid="filter-scheduleComplexity"
          >
            <option value="low">low</option>
            <option value="moderate">moderate</option>
            <option value="high">high</option>
          </select>
        </label>

        <div>
          <button type="submit" data-testid="filter-apply">Apply Filters</button>
          <button
            type="button"
            data-testid="filter-reset-defaults"
            onClick={() => {
              try {
                filters.resetToDefaultCohort();
                setWarning(null);
                setAnnouncement('Filter context reset to governed defaults.');
                onOneCycleRefresh?.();
              } catch (error) {
                const message = error instanceof Error ? error.message : 'Unable to reset defaults.';
                setWarning(message);
                setAnnouncement(`Guardrail warning: ${message}`);
              }
            }}
          >
            Reset to Defaults
          </button>
        </div>
      </form>
    </section>
  );
}
