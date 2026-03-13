import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { HealthPulseAdminPanel } from '../components/HealthPulseAdminPanel.js';
import type {
  IUseHealthPulseAdminConfigResult,
  IHealthPulseAdminConfigValidationIssue,
} from '../hooks/index.js';
import { renderWithTheme } from './testUtils.js';

const mockUsePermission = vi.fn<(action: string) => boolean>();
const mockUseHealthPulseAdminConfig = vi.fn<() => IUseHealthPulseAdminConfigResult>();

vi.mock('@hbc/auth', () => ({
  usePermission: (action: string) => mockUsePermission(action),
}));

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
  };
});

vi.mock('../hooks/index.js', async () => {
  const actual = await vi.importActual<typeof import('../hooks/index.js')>('../hooks/index.js');
  return {
    ...actual,
    useHealthPulseAdminConfig: () => mockUseHealthPulseAdminConfig(),
  };
});

const baseConfig = {
  weights: { field: 0.4, time: 0.3, cost: 0.15, office: 0.15 },
  stalenessThresholdDays: 14,
  metricStalenessOverrides: { 'forecast-confidence': 7 },
  manualEntryGovernance: {
    approvalRequiredMetricKeys: ['forecast-confidence'],
    maxManualInfluencePercent: 35,
    maxOverrideAgeDays: 21,
  },
  officeHealthSuppression: {
    lowImpactSuppressionEnabled: true,
    duplicateClusterWindowHours: 24,
    severityWeights: { minor: 1, major: 2, critical: 3 },
  },
  portfolioTriageDefaults: {
    defaultBucket: 'attention-now' as const,
    defaultSort: 'deterioration-velocity' as const,
  },
};

const baseIssues: IHealthPulseAdminConfigValidationIssue[] = [];

describe('HealthPulseAdminPanel', () => {
  beforeEach(() => {
    mockUsePermission.mockImplementation((action) => action === 'hbc-admin');
    mockUseHealthPulseAdminConfig.mockReturnValue({
      config: baseConfig,
      draft: baseConfig,
      isLoading: false,
      isSaving: false,
      isValid: true,
      error: null,
      validationIssues: baseIssues,
      save: vi.fn(async () => {}),
      reset: vi.fn(),
      refresh: vi.fn(async () => {}),
    });
  });

  it('renders denied state for non-admin users', () => {
    mockUsePermission.mockReturnValue(false);
    renderWithTheme(<HealthPulseAdminPanel initialConfig={baseConfig} />);
    expect(screen.getByText('Admin access required')).toBeInTheDocument();
  });

  it('enforces sum-to-100 locally and blocks save when invalid', async () => {
    renderWithTheme(<HealthPulseAdminPanel initialConfig={baseConfig} />);

    fireEvent.change(screen.getByLabelText('Field %'), {
      target: { value: '50' },
    });
    fireEvent.change(screen.getByLabelText('Time %'), {
      target: { value: '30' },
    });
    fireEvent.change(screen.getByLabelText('Cost %'), {
      target: { value: '15' },
    });
    fireEvent.change(screen.getByLabelText('Office %'), {
      target: { value: '15' },
    });

    await waitFor(() => {
      expect(screen.getByText(/Weight percentages must sum to 100/i)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /Save configuration/i })).toBeDisabled();
  });

  it('converts percent weights to decimals on save and supports reset', async () => {
    const save = vi.fn(async () => {});
    const reset = vi.fn();
    mockUseHealthPulseAdminConfig.mockReturnValue({
      config: baseConfig,
      draft: baseConfig,
      isLoading: false,
      isSaving: false,
      isValid: true,
      error: null,
      validationIssues: [],
      save,
      reset,
      refresh: vi.fn(async () => {}),
    });

    renderWithTheme(<HealthPulseAdminPanel initialConfig={baseConfig} />);

    fireEvent.change(screen.getByLabelText('Field %'), {
      target: { value: '50' },
    });
    fireEvent.change(screen.getByLabelText('Time %'), {
      target: { value: '30' },
    });
    fireEvent.change(screen.getByLabelText('Cost %'), {
      target: { value: '10' },
    });
    fireEvent.change(screen.getByLabelText('Office %'), {
      target: { value: '10' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Save configuration/i }));

    await waitFor(() => {
      expect(save).toHaveBeenCalledTimes(1);
    });

    expect(save.mock.calls[0]?.[0].weights).toEqual({
      field: 0.5,
      time: 0.3,
      cost: 0.1,
      office: 0.1,
    });

    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it('renders loading and error states and supports panel mode close', () => {
    const onClose = vi.fn();
    mockUseHealthPulseAdminConfig.mockReturnValue({
      config: null,
      draft: null,
      isLoading: true,
      isSaving: false,
      isValid: false,
      error: new Error('admin load failed'),
      validationIssues: [],
      save: vi.fn(async () => {}),
      reset: vi.fn(),
      refresh: vi.fn(async () => {}),
    });

    renderWithTheme(<HealthPulseAdminPanel initialConfig={baseConfig} open onClose={onClose} />);

    expect(screen.getByText('Loading admin configuration')).toBeInTheDocument();
    expect(screen.getByText(/Unable to load admin configuration: admin load failed/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('updates all policy inputs and forwards saved callback', async () => {
    const onSaved = vi.fn();
    const save = vi.fn(async () => {});
    mockUseHealthPulseAdminConfig.mockReturnValue({
      config: baseConfig,
      draft: baseConfig,
      isLoading: false,
      isSaving: false,
      isValid: true,
      error: null,
      validationIssues: [],
      save,
      reset: vi.fn(),
      refresh: vi.fn(async () => {}),
    });

    renderWithTheme(<HealthPulseAdminPanel initialConfig={baseConfig} onSaved={onSaved} />);

    fireEvent.change(screen.getByLabelText('Per-metric staleness overrides'), {
      target: { value: 'forecast-confidence=10' },
    });
    fireEvent.change(screen.getByLabelText('Approval-required metric keys'), {
      target: { value: 'forecast-confidence, pending-change-order-aging' },
    });
    fireEvent.change(screen.getByLabelText('Max manual influence %'), {
      target: { value: '40' },
    });
    fireEvent.change(screen.getByLabelText('Max override age days'), {
      target: { value: '30' },
    });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.change(screen.getByLabelText('Duplicate cluster window hours'), {
      target: { value: '36' },
    });
    fireEvent.change(screen.getByLabelText('Minor severity weight'), {
      target: { value: '2' },
    });
    fireEvent.change(screen.getByLabelText('Major severity weight'), {
      target: { value: '3' },
    });
    fireEvent.change(screen.getByLabelText('Critical severity weight'), {
      target: { value: '4' },
    });
    fireEvent.change(screen.getByLabelText('Default bucket'), {
      target: { value: 'recovering' },
    });
    fireEvent.change(screen.getByLabelText('Default sort'), {
      target: { value: 'compound-risk-severity' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Save configuration/i }));

    await waitFor(() => {
      expect(save).toHaveBeenCalledTimes(1);
      expect(onSaved).toHaveBeenCalledTimes(1);
    });
  });

  it('shows hook validation issues and blocks save while invalid/saving', () => {
    mockUseHealthPulseAdminConfig.mockReturnValue({
      config: baseConfig,
      draft: baseConfig,
      isLoading: false,
      isSaving: true,
      isValid: false,
      error: null,
      validationIssues: [
        { path: 'weights', message: 'weights must sum to 1.0', severity: 'error' },
      ],
      save: vi.fn(async () => {}),
      reset: vi.fn(),
      refresh: vi.fn(async () => {}),
    });

    renderWithTheme(<HealthPulseAdminPanel initialConfig={baseConfig} />);
    expect(screen.getByText(/weights: weights must sum to 1.0/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save configuration/i })).toBeDisabled();
  });

  it('supports panel mode close fallback when onClose is not provided', () => {
    renderWithTheme(<HealthPulseAdminPanel initialConfig={baseConfig} open />);
    expect(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    }).not.toThrow();
  });

  it('parses non-numeric weight edits to zero via deterministic parser path', async () => {
    renderWithTheme(<HealthPulseAdminPanel initialConfig={baseConfig} />);
    fireEvent.change(screen.getByLabelText('Field %'), {
      target: { value: 'not-a-number' },
    });

    await waitFor(() => {
      expect(screen.getByText(/Current sum: 60%/i)).toBeInTheDocument();
    });
  });
});
