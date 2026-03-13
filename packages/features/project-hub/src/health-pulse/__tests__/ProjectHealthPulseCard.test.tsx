import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { ProjectHealthPulseCard } from '../components/ProjectHealthPulseCard.js';
import type { IUseProjectHealthPulseResult } from '../hooks/index.js';
import type { IHealthMetric } from '../types/index.js';

vi.mock('@hbc/complexity', () => ({
  useComplexity: vi.fn(() => ({ tier: 'standard' })),
}));

vi.mock('@hbc/ui-kit', async () => {
  const actual = await vi.importActual<typeof import('@hbc/ui-kit')>('@hbc/ui-kit');
  return {
    ...actual,
    HbcLineChart: () => <div data-testid="mock-line-chart" />,
  };
});

const mockUseProjectHealthPulse = vi.fn<() => IUseProjectHealthPulseResult>();

vi.mock('../hooks/index.js', async () => {
  const actual = await vi.importActual<typeof import('../hooks/index.js')>('../hooks/index.js');
  return {
    ...actual,
    useProjectHealthPulse: () => mockUseProjectHealthPulse(),
  };
});

const metric = (key: string, value: number): IHealthMetric => ({
  key,
  label: key,
  value,
  isStale: false,
  isManualEntry: false,
  lastUpdatedAt: '2026-03-12T00:00:00.000Z',
  weight: 'leading',
});

const hookResult: IUseProjectHealthPulseResult = {
  isLoading: false,
  error: null,
  refresh: async () => {},
  telemetry: null,
  derivation: {
    confidenceReasonCodes: ['stale trend-history'],
    governanceReasonCodes: [],
    hasManualInfluence: false,
    evaluatedAt: '2026-03-12T00:00:00.000Z',
  },
  pulse: {
    projectId: 'p-card',
    computedAt: '2026-03-12T00:00:00.000Z',
    overallScore: 67,
    overallStatus: 'watch',
    overallConfidence: {
      tier: 'low',
      score: 52,
      reasons: ['stale source for office feed'],
    },
    dimensions: {
      cost: {
        score: 62,
        status: 'at-risk',
        label: 'Cost',
        leadingScore: 65,
        laggingScore: 55,
        metrics: [metric('forecast-confidence', 62)],
        keyMetric: 'Forecast Confidence',
        trend: 'declining',
        hasExcludedMetrics: true,
        confidence: { tier: 'low', score: 50, reasons: ['excluded metrics'] },
      },
      time: {
        score: 74,
        status: 'watch',
        label: 'Time',
        leadingScore: 72,
        laggingScore: 75,
        metrics: [metric('look-ahead-reliability', 74)],
        keyMetric: 'Look Ahead Reliability',
        trend: 'stable',
        hasExcludedMetrics: false,
        confidence: { tier: 'moderate', score: 70, reasons: [] },
      },
      field: {
        score: 80,
        status: 'watch',
        label: 'Field',
        leadingScore: 81,
        laggingScore: 78,
        metrics: [metric('production-throughput-reliability', 80)],
        keyMetric: 'Production Throughput',
        trend: 'improving',
        hasExcludedMetrics: false,
        confidence: { tier: 'high', score: 84, reasons: [] },
      },
      office: {
        score: 50,
        status: 'at-risk',
        label: 'Office',
        leadingScore: 47,
        laggingScore: 58,
        metrics: [metric('severity-weighted-overdue-signals', 50)],
        keyMetric: 'Overdue Signals',
        trend: 'declining',
        hasExcludedMetrics: true,
        confidence: { tier: 'unreliable', score: 30, reasons: ['stale feed'] },
      },
    },
    compoundRisks: [
      {
        code: 'time-field-deterioration',
        severity: 'high',
        affectedDimensions: ['time', 'field'],
        summary: 'Time and Field are deteriorating together.',
      },
    ],
    topRecommendedAction: {
      actionText: 'Escalate critical path blockers.',
      actionLink: 'https://example.com/action',
      reasonCode: 'CRITICAL_PATH_BLOCKERS',
      owner: 'PM',
      urgency: 92,
      impact: 88,
      confidenceWeight: 0.7,
    },
    explainability: {
      whyThisStatus: ['Cost exclusions and office backlog'],
      whatChanged: ['Office signal declined'],
      topContributors: ['Pending change orders'],
      whatMattersMost: 'Clear blockers before next look-ahead cycle.',
    },
    triage: {
      bucket: 'attention-now',
      sortScore: 80,
      triageReasons: ['compound risk'],
    },
  },
};

describe('ProjectHealthPulseCard', () => {
  beforeEach(() => {
    mockUseProjectHealthPulse.mockReturnValue(hookResult);
  });

  it('renders overall badge, dimension grid, confidence, top action, and compound risk callout', () => {
    render(
      <ProjectHealthPulseCard
        projectId="p-card"
        metricsByDimension={{ cost: [], time: [], field: [], office: [] }}
      />
    );

    expect(screen.getByText('Project Health Pulse')).toBeInTheDocument();
    expect(screen.getByText(/Overall: watch/i)).toBeInTheDocument();
    const confidenceButton = screen
      .getAllByRole('button')
      .find((button) => button.textContent?.trim() === 'Confidence: Low');
    expect(confidenceButton).toBeDefined();
    expect(screen.getByText(/Escalate critical path blockers./i)).toBeInTheDocument();
    expect(screen.getByText(/Reason code: CRITICAL_PATH_BLOCKERS/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cost: 62/i })).toBeInTheDocument();
    expect(screen.getByText(/Compound risk active/i)).toBeInTheDocument();
  });

  it('renders essential mode without full dimension grid', () => {
    render(
      <ProjectHealthPulseCard
        projectId="p-card"
        metricsByDimension={{ cost: [], time: [], field: [], office: [] }}
        complexityTier="essential"
      />
    );

    expect(screen.queryByRole('button', { name: /Cost: 62/i })).not.toBeInTheDocument();
    expect(screen.getByText(/Escalate critical path blockers./i)).toBeInTheDocument();
  });

  it('opens detail and explainability surfaces from card interactions', async () => {
    render(
      <ProjectHealthPulseCard
        projectId="p-card"
        metricsByDimension={{ cost: [], time: [], field: [], office: [] }}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Overall: watch/i }));
    await waitFor(() => {
      expect(screen.getByText('Project Health Pulse Detail')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Time: 74/i }));
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Time' })).toHaveAttribute('aria-selected', 'true');
    });

    const confidenceButton = screen
      .getAllByRole('button')
      .find((button) => button.textContent?.trim() === 'Confidence: Low');
    expect(confidenceButton).toBeDefined();
    fireEvent.click(confidenceButton!);
    await waitFor(() => {
      expect(screen.getByText('Health Explainability')).toBeInTheDocument();
      expect(screen.getByText(/Current confidence tier: Low./i)).toBeInTheDocument();
    });
  });

  it('renders loading, error, and empty states with stable output', () => {
    mockUseProjectHealthPulse.mockReturnValueOnce({
      ...hookResult,
      isLoading: true,
      pulse: null,
    });

    const { rerender } = render(
      <ProjectHealthPulseCard
        projectId="p-card"
        metricsByDimension={{ cost: [], time: [], field: [], office: [] }}
      />
    );

    expect(screen.getByText('Loading project health pulse')).toBeInTheDocument();

    mockUseProjectHealthPulse.mockReturnValueOnce({
      ...hookResult,
      isLoading: false,
      pulse: null,
      error: new Error('boom'),
    });

    rerender(
      <ProjectHealthPulseCard
        projectId="p-card"
        metricsByDimension={{ cost: [], time: [], field: [], office: [] }}
      />
    );

    expect(screen.getByText(/Unable to load pulse summary: boom/i)).toBeInTheDocument();

    mockUseProjectHealthPulse.mockReturnValueOnce({
      ...hookResult,
      isLoading: false,
      pulse: null,
      error: null,
    });

    rerender(
      <ProjectHealthPulseCard
        projectId="p-card"
        metricsByDimension={{ cost: [], time: [], field: [], office: [] }}
      />
    );

    expect(screen.getByText('Health data pending')).toBeInTheDocument();
  });

  it('renders no-action fallback when recommendation is unavailable', () => {
    mockUseProjectHealthPulse.mockReturnValue({
      ...hookResult,
      pulse: {
        ...hookResult.pulse!,
        topRecommendedAction: null,
      },
    });

    render(
      <ProjectHealthPulseCard
        projectId="p-card"
        metricsByDimension={{ cost: [], time: [], field: [], office: [] }}
      />
    );

    expect(screen.getByText(/No top recommendation is currently available./i)).toBeInTheDocument();
    expect(screen.queryByText(/Open action link/i)).not.toBeInTheDocument();
  });

  it('renders governance warning and omits deep-link text when action link is missing', () => {
    mockUseProjectHealthPulse.mockReturnValue({
      ...hookResult,
      derivation: {
        ...hookResult.derivation,
        governanceReasonCodes: ['manual-influence-cap'],
      },
      pulse: {
        ...hookResult.pulse!,
        dimensions: {
          ...hookResult.pulse!.dimensions,
          cost: { ...hookResult.pulse!.dimensions.cost, hasExcludedMetrics: false },
          time: { ...hookResult.pulse!.dimensions.time, hasExcludedMetrics: false },
          field: { ...hookResult.pulse!.dimensions.field, hasExcludedMetrics: false },
          office: { ...hookResult.pulse!.dimensions.office, hasExcludedMetrics: false },
        },
        topRecommendedAction: {
          ...hookResult.pulse!.topRecommendedAction!,
          actionLink: null,
        },
      },
    });

    render(
      <ProjectHealthPulseCard
        projectId="p-card"
        metricsByDimension={{ cost: [], time: [], field: [], office: [] }}
      />
    );

    expect(
      screen.getByText(/Excluded or governance-impacted metrics detected/i)
    ).toBeInTheDocument();
    expect(screen.queryByText(/Open action link/i)).not.toBeInTheDocument();
  });

  it('invokes open callbacks when detail and explainability triggers are used', async () => {
    const onOpenDetail = vi.fn();
    const onOpenExplainability = vi.fn();

    render(
      <ProjectHealthPulseCard
        projectId="p-card"
        metricsByDimension={{ cost: [], time: [], field: [], office: [] }}
        onOpenDetail={onOpenDetail}
        onOpenExplainability={onOpenExplainability}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Overall: watch/i }));
    expect(onOpenDetail).toHaveBeenCalledWith('cost');

    const confidenceButton = screen
      .getAllByRole('button')
      .find((button) => button.textContent?.trim() === 'Confidence: Low');
    fireEvent.click(confidenceButton!);
    expect(onOpenExplainability).toHaveBeenCalledWith('confidence');
  });
});
