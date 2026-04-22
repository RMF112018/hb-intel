/**
 * Phase-04 audit G-03 — authored readiness model (behavior-first).
 *
 * Verifies that SafetyIntakeReadiness renders each input row with the
 * right status badge + label + optional detail and exposes list semantics.
 */
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  SafetyIntakeReadiness,
  type SafetyIntakeReadinessRow,
} from '../components/SafetyIntakeReadiness.js';

const baseRows: SafetyIntakeReadinessRow[] = [
  { id: 'period', label: 'Reporting period selected', status: 'ready', detail: 'Week of 2026-04-20' },
  { id: 'file', label: 'Checklist workbook chosen', status: 'pending', detail: 'No workbook selected yet.' },
  { id: 'submit', label: 'Submission ready', status: 'blocked', detail: 'No workbook chosen yet.' },
];

describe('SafetyIntakeReadiness — authored readiness model', () => {
  it('exposes programmatic list semantics', () => {
    render(<SafetyIntakeReadiness rows={baseRows} />);
    const list = screen.getByRole('list', { name: /readiness/i });
    expect(list).toBeInTheDocument();
    expect(within(list).getAllByRole('listitem')).toHaveLength(3);
  });

  it('renders each row label and detail', () => {
    render(<SafetyIntakeReadiness rows={baseRows} />);
    expect(screen.getByText('Reporting period selected')).toBeInTheDocument();
    expect(screen.getByText('Week of 2026-04-20')).toBeInTheDocument();
    expect(screen.getByText('Checklist workbook chosen')).toBeInTheDocument();
    expect(screen.getByText('No workbook selected yet.')).toBeInTheDocument();
    expect(screen.getByText('Submission ready')).toBeInTheDocument();
  });

  it('renders the correct status badge for each row status', () => {
    render(<SafetyIntakeReadiness rows={baseRows} />);
    // The three badges are the only HbcStatusBadge instances in this render;
    // assert by visible label text.
    expect(screen.getByText('Ready')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Blocked')).toBeInTheDocument();
  });

  it('keys row status on data-row-status attribute so CSS can style each posture', () => {
    render(<SafetyIntakeReadiness rows={baseRows} />);
    const listItems = screen.getAllByRole('listitem');
    const statuses = listItems.map((el) => el.getAttribute('data-row-status'));
    expect(statuses).toEqual(['ready', 'pending', 'blocked']);
  });

  it('supports a custom ariaLabel for the list', () => {
    render(
      <SafetyIntakeReadiness
        rows={[baseRows[0]!]}
        ariaLabel="Upload submission readiness"
      />,
    );
    expect(
      screen.getByRole('list', { name: /upload submission readiness/i }),
    ).toBeInTheDocument();
  });
});
