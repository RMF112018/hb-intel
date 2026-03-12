import { fireEvent, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HealthDimensionTab } from '../components/HealthDimensionTab.js';
import type { IHealthDimension } from '../types/index.js';
import { renderWithTheme } from './testUtils.js';

const mockUsePermission = vi.fn<(action: string) => boolean>();

vi.mock('@hbc/auth', () => ({
  usePermission: (action: string) => mockUsePermission(action),
}));

const dimensionFixture: IHealthDimension = {
  score: 55,
  status: 'at-risk',
  label: 'Cost',
  leadingScore: 62,
  laggingScore: 38,
  keyMetric: 'forecast-confidence',
  trend: 'declining',
  hasExcludedMetrics: true,
  confidence: {
    tier: 'low',
    score: 40,
    reasons: ['excluded metric ratio'],
  },
  metrics: [
    {
      key: 'forecast-confidence',
      label: 'Forecast confidence',
      value: 62,
      isStale: false,
      isManualEntry: false,
      lastUpdatedAt: '2026-03-10T00:00:00.000Z',
      weight: 'leading',
    },
    {
      key: 'pending-change-order-aging',
      label: 'Pending change order aging',
      value: null,
      isStale: true,
      isManualEntry: true,
      lastUpdatedAt: '2026-02-01T00:00:00.000Z',
      weight: 'lagging',
      manualOverride: {
        reason: 'Field update pending sync',
        enteredBy: 'estimator-1',
        enteredAt: '2026-02-10T00:00:00.000Z',
        requiresApproval: true,
      },
    },
  ],
};

describe('HealthDimensionTab', () => {
  beforeEach(() => {
    mockUsePermission.mockImplementation((action) => action === 'project-health:write');
  });

  it('renders leading/lagging groups, exclusions, metadata, and edit affordances', () => {
    renderWithTheme(
      <HealthDimensionTab
        dimensionKey="cost"
        dimension={dimensionFixture}
        governance={{
          approvalRequiredMetricKeys: ['pending-change-order-aging'],
          maxManualInfluencePercent: 30,
          maxOverrideAgeDays: 14,
        }}
        sensitiveMetricKeys={['pending-change-order-aging']}
        now={() => new Date('2026-03-12T00:00:00.000Z')}
      />
    );

    expect(screen.getByText('Leading metrics')).toBeInTheDocument();
    expect(screen.getByText('Lagging metrics')).toBeInTheDocument();
    expect(screen.getByText(/Excluded metrics detected/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Jump to affected metrics/i })).toBeInTheDocument();
    expect(screen.getByText(/Override: Field update pending sync/i)).toBeInTheDocument();
    expect(screen.getByText(/Approval required/i)).toBeInTheDocument();
    expect(screen.getByText(/Override aging warning/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
  });

  it('renders read-only mode for unauthorized users', () => {
    mockUsePermission.mockReturnValue(false);
    renderWithTheme(
      <HealthDimensionTab
        dimensionKey="cost"
        dimension={dimensionFixture}
        governance={{
          approvalRequiredMetricKeys: [],
          maxManualInfluencePercent: 30,
          maxOverrideAgeDays: 14,
        }}
      />
    );

    expect(screen.getByText(/Read-only mode/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
  });

  it('opens inline edit and emits save payload', () => {
    const onMetricSave = vi.fn();
    renderWithTheme(
      <HealthDimensionTab
        dimensionKey="cost"
        dimension={dimensionFixture}
        governance={{
          approvalRequiredMetricKeys: ['pending-change-order-aging'],
          maxManualInfluencePercent: 30,
          maxOverrideAgeDays: 14,
        }}
        onMetricSave={onMetricSave}
        now={() => new Date('2026-03-12T00:00:00.000Z')}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    const [metricValueInput, reasonInput] = screen.getAllByRole('textbox');
    fireEvent.change(metricValueInput, { target: { value: '48' } });
    fireEvent.change(reasonInput, {
      target: { value: 'Validated with latest estimate' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Save override/i }));

    expect(onMetricSave).toHaveBeenCalledTimes(1);
    expect(onMetricSave.mock.calls[0]?.[0].value).toBe(48);
    expect(onMetricSave.mock.calls[0]?.[0].isStale).toBe(false);
    expect(onMetricSave.mock.calls[0]?.[0].manualOverride?.reason).toBe(
      'Validated with latest estimate'
    );
  });
});
