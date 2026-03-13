import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { HealthMetricInlineEdit } from '../components/HealthMetricInlineEdit.js';
import { renderWithTheme } from './testUtils.js';

const metricFixture = {
  key: 'pending-change-order-aging',
  label: 'Pending change order aging',
  value: null,
  isStale: true,
  isManualEntry: false,
  lastUpdatedAt: null,
  weight: 'lagging' as const,
  manualOverride: null,
};

describe('ManualOverrideGovernance', () => {
  it('captures manual metadata and clears stale state on save', () => {
    const onSave = vi.fn();
    renderWithTheme(
      <HealthMetricInlineEdit
        metric={metricFixture}
        open
        onClose={() => {}}
        onSave={onSave}
        requiresApproval
        maxOverrideAgeDays={14}
        actorId="estimator-1"
        now={() => new Date('2026-03-12T00:00:00.000Z')}
      />
    );

    const [metricValueInput, reasonInput] = screen.getAllByRole('textbox');
    fireEvent.change(metricValueInput, { target: { value: '41' } });
    fireEvent.change(reasonInput, {
      target: { value: 'Manual correction from validated forecast.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Save override/i }));

    expect(onSave).toHaveBeenCalledTimes(1);
    const savedMetric = onSave.mock.calls[0]?.[0].metric;
    expect(savedMetric.value).toBe(41);
    expect(savedMetric.isStale).toBe(false);
    expect(savedMetric.isManualEntry).toBe(true);
    expect(savedMetric.manualOverride?.enteredBy).toBe('estimator-1');
    expect(savedMetric.manualOverride?.requiresApproval).toBe(true);
  });

  it('requires reason when governance requires it', () => {
    const onSave = vi.fn();
    renderWithTheme(
      <HealthMetricInlineEdit
        metric={metricFixture}
        open
        onClose={() => {}}
        onSave={onSave}
        requiresApproval
        maxOverrideAgeDays={14}
        actorId="estimator-1"
      />
    );

    const [metricValueInput, reasonInput] = screen.getAllByRole('textbox');
    fireEvent.change(metricValueInput, { target: { value: '41' } });
    fireEvent.change(reasonInput, { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /Save override/i }));

    expect(onSave).not.toHaveBeenCalled();
    expect(
      screen.getByText(/A reason is required for governed manual overrides./i)
    ).toBeInTheDocument();
  });

  it('supports cancel/reset path', () => {
    const onClose = vi.fn();
    renderWithTheme(
      <HealthMetricInlineEdit
        metric={metricFixture}
        open
        onClose={onClose}
        onSave={() => {}}
        requiresApproval={false}
        maxOverrideAgeDays={14}
        actorId="estimator-1"
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('allows reason-optional save when approval is not required and handles null metric', () => {
    const onSave = vi.fn();
    renderWithTheme(
      <HealthMetricInlineEdit
        metric={metricFixture}
        open
        onClose={() => {}}
        onSave={onSave}
        requiresApproval={false}
        maxOverrideAgeDays={14}
        actorId="estimator-1"
        now={() => new Date('2026-03-12T00:00:00.000Z')}
      />
    );

    const [metricValueInput, reasonInput] = screen.getAllByRole('textbox');
    fireEvent.change(metricValueInput, { target: { value: '33' } });
    fireEvent.change(reasonInput, { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /Save override/i }));
    expect(onSave).toHaveBeenCalledTimes(1);

    const onSaveNull = vi.fn();
    renderWithTheme(
      <HealthMetricInlineEdit
        metric={null}
        open
        onClose={() => {}}
        onSave={onSaveNull}
        requiresApproval={false}
        maxOverrideAgeDays={14}
        actorId="estimator-1"
      />
    );
    fireEvent.click(screen.getAllByRole('button', { name: /Save override/i })[1]);
    expect(onSaveNull).not.toHaveBeenCalled();
  });

  it('rejects non-finite metric values with explicit validation feedback', () => {
    const onSave = vi.fn();
    renderWithTheme(
      <HealthMetricInlineEdit
        metric={metricFixture}
        open
        onClose={() => {}}
        onSave={onSave}
        requiresApproval={false}
        maxOverrideAgeDays={14}
        actorId="estimator-1"
      />
    );

    const [metricValueInput] = screen.getAllByRole('textbox');
    fireEvent.change(metricValueInput, { target: { value: 'abc' } });
    fireEvent.click(screen.getByRole('button', { name: /Save override/i }));

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText(/Metric value must be a finite number/i)).toBeInTheDocument();
  });
});
