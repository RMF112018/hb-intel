import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { ProjectHealthPulseDetail } from '../components/ProjectHealthPulseDetail.js';
import type { IUseProjectHealthPulseResult } from '../hooks/index.js';
import type { IHealthMetric } from '../types/index.js';

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

const metric = (key: string, value: number, overrides?: Partial<IHealthMetric>): IHealthMetric => ({
  key,
  label: key,
  value,
  isStale: false,
  isManualEntry: false,
  lastUpdatedAt: '2026-03-12T00:00:00.000Z',
  weight: 'leading',
  ...overrides,
});

const hookResult: IUseProjectHealthPulseResult = {
  isLoading: false,
  error: null,
  refresh: async () => {},
  telemetry: null,
  derivation: {
    confidenceReasonCodes: ['stale source for office feed'],
    governanceReasonCodes: ['governance signal'],
    hasManualInfluence: true,
    evaluatedAt: '2026-03-12T00:00:00.000Z',
  },
  pulse: {
    projectId: 'p-detail',
    computedAt: '2026-03-12T00:00:00.000Z',
    overallScore: 54,
    overallStatus: 'at-risk',
    overallConfidence: {
      tier: 'unreliable',
      score: 22,
      reasons: ['stale source for office feed'],
    },
    dimensions: {
      cost: {
        score: 62,
        status: 'watch',
        label: 'Cost',
        leadingScore: 64,
        laggingScore: 55,
        metrics: [
          metric('forecast-confidence', 62),
          metric('pending-change-order-aging', 40, { value: null, isStale: true }),
        ],
        keyMetric: 'Forecast confidence',
        trend: 'declining',
        hasExcludedMetrics: true,
        confidence: { tier: 'low', score: 43, reasons: ['excluded metrics'] },
      },
      time: {
        score: 49,
        status: 'at-risk',
        label: 'Time',
        leadingScore: 45,
        laggingScore: 56,
        metrics: [metric('look-ahead-reliability', 49)],
        keyMetric: 'Look-ahead reliability',
        trend: 'declining',
        hasExcludedMetrics: false,
        confidence: { tier: 'low', score: 48, reasons: ['volatility'] },
      },
      field: {
        score: 70,
        status: 'watch',
        label: 'Field',
        leadingScore: 73,
        laggingScore: 62,
        metrics: [metric('production-throughput-reliability', 70)],
        keyMetric: 'Throughput reliability',
        trend: 'stable',
        hasExcludedMetrics: false,
        confidence: { tier: 'moderate', score: 68, reasons: [] },
      },
      office: {
        score: 35,
        status: 'critical',
        label: 'Office',
        leadingScore: 30,
        laggingScore: 42,
        metrics: [metric('severity-weighted-overdue-signals', 35)],
        keyMetric: 'Overdue signals',
        trend: 'declining',
        hasExcludedMetrics: true,
        confidence: { tier: 'unreliable', score: 25, reasons: ['stale office feed'] },
      },
    },
    compoundRisks: [
      {
        code: 'office-field-amplification',
        severity: 'critical',
        affectedDimensions: ['office', 'field'],
        summary: 'Office backlog is amplifying field risk.',
      },
    ],
    topRecommendedAction: {
      actionText: 'Resolve office backlog escalation.',
      actionLink: null,
      reasonCode: 'OFFICE_BACKLOG_ESCALATION',
      owner: 'Ops Director',
      urgency: 95,
      impact: 84,
      confidenceWeight: 0.5,
    },
    explainability: {
      whyThisStatus: ['Office backlog and time volatility'],
      whatChanged: ['Office confidence degraded'],
      topContributors: ['Overdue office actions'],
      whatMattersMost: 'Reduce overdue office backlog.',
    },
    triage: {
      bucket: 'attention-now',
      sortScore: 95,
      triageReasons: ['critical office-field amplification'],
    },
  },
};

describe('ProjectHealthPulseDetail', () => {
  beforeEach(() => {
    mockUseProjectHealthPulse.mockReturnValue(hookResult);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders tabs, top action, confidence caution, and escalation callout', () => {
    render(
      <ProjectHealthPulseDetail
        open
        onClose={() => {}}
        projectId="p-detail"
        metricsByDimension={{ cost: [], time: [], field: [], office: [] }}
      />
    );

    expect(screen.getByText('Project Health Pulse Detail')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Cost' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Time' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Field' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Office' })).toBeInTheDocument();
    expect(screen.getByText(/Resolve office backlog escalation./i)).toBeInTheDocument();
    expect(screen.getByText(/Caution: pulse confidence is unreliable/i)).toBeInTheDocument();
    expect(screen.getByText(/Compound-risk escalation detected/i)).toBeInTheDocument();
  });

  it('supports tab switching, history expansion, and excluded jump-link rendering', async () => {
    const scrollIntoView = vi.fn();
    vi.spyOn(document, 'getElementById').mockReturnValue({
      scrollIntoView,
    } as unknown as HTMLElement);

    render(
      <ProjectHealthPulseDetail
        open
        onClose={() => {}}
        projectId="p-detail"
        metricsByDimension={{ cost: [], time: [], field: [], office: [] }}
        initialTab="cost"
      />
    );

    fireEvent.click(screen.getByRole('tab', { name: 'Cost' }));
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Cost' })).toHaveAttribute('aria-selected', 'true');
    });

    fireEvent.click(screen.getByRole('button', { name: /Show 90-day history/i }));
    expect(screen.getByRole('button', { name: /Hide 90-day history/i })).toBeInTheDocument();
    expect(screen.getAllByTestId('mock-line-chart').length).toBeGreaterThan(0);

    expect(screen.getByText(/Excluded metrics are present for this dimension./i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Jump to excluded metrics/i }));
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
  });

  it('renders loading, error, and empty states with stable output', () => {
    mockUseProjectHealthPulse.mockReturnValueOnce({
      ...hookResult,
      isLoading: true,
      pulse: null,
    });

    const { rerender } = render(
      <ProjectHealthPulseDetail
        open
        onClose={() => {}}
        projectId="p-detail"
        metricsByDimension={{ cost: [], time: [], field: [], office: [] }}
      />
    );

    expect(screen.getByText('Loading project health pulse detail')).toBeInTheDocument();

    mockUseProjectHealthPulse.mockReturnValueOnce({
      ...hookResult,
      isLoading: false,
      pulse: null,
      error: new Error('detail failed'),
    });

    rerender(
      <ProjectHealthPulseDetail
        open
        onClose={() => {}}
        projectId="p-detail"
        metricsByDimension={{ cost: [], time: [], field: [], office: [] }}
      />
    );
    expect(screen.getByText(/Unable to render detail view: detail failed/i)).toBeInTheDocument();

    mockUseProjectHealthPulse.mockReturnValueOnce({
      ...hookResult,
      isLoading: false,
      pulse: null,
      error: null,
    });

    rerender(
      <ProjectHealthPulseDetail
        open
        onClose={() => {}}
        projectId="p-detail"
        metricsByDimension={{ cost: [], time: [], field: [], office: [] }}
      />
    );
    expect(screen.getByText('Health data pending')).toBeInTheDocument();
  });

  it('opens explainability and renders no-action fallback', async () => {
    mockUseProjectHealthPulse.mockReturnValue({
      ...hookResult,
      pulse: {
        ...hookResult.pulse!,
        topRecommendedAction: null,
      },
    });

    render(
      <ProjectHealthPulseDetail
        open
        onClose={() => {}}
        projectId="p-detail"
        metricsByDimension={{ cost: [], time: [], field: [], office: [] }}
      />
    );

    expect(screen.getByText(/No top action recommendation is currently available./i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /View confidence context/i }));
    await waitFor(() => {
      expect(screen.getByText('Health Explainability')).toBeInTheDocument();
    });
  });
});
