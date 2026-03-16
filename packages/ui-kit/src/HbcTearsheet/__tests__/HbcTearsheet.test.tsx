import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('../../hooks/useFocusTrap.js', () => ({
  useFocusTrap: () => {},
}));

import { HbcTearsheet } from '../index.js';
import type { TearsheetStep } from '../types.js';

const makeSteps = (count: number): TearsheetStep[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `step-${i + 1}`,
    label: `Step ${i + 1}`,
    content: <div>Step {i + 1} content</div>,
  }));

describe('HbcTearsheet', () => {
  it('does not render when open=false', () => {
    render(
      <HbcTearsheet open={false} onClose={vi.fn()} title="Tearsheet" steps={makeSteps(2)} />,
    );
    expect(document.querySelector('[data-hbc-ui="tearsheet"]')).not.toBeInTheDocument();
  });

  it('renders with data-hbc-ui="tearsheet" when open=true', () => {
    render(
      <HbcTearsheet open={true} onClose={vi.fn()} title="Tearsheet" steps={makeSteps(2)} />,
    );
    expect(document.querySelector('[data-hbc-ui="tearsheet"]')).toBeInTheDocument();
  });

  it('role="dialog" present', () => {
    render(
      <HbcTearsheet open={true} onClose={vi.fn()} title="Tearsheet" steps={makeSteps(2)} />,
    );
    const el = document.querySelector('[data-hbc-ui="tearsheet"]');
    expect(el).toHaveAttribute('role', 'dialog');
  });

  it('aria-modal="true" present', () => {
    render(
      <HbcTearsheet open={true} onClose={vi.fn()} title="Tearsheet" steps={makeSteps(2)} />,
    );
    const el = document.querySelector('[data-hbc-ui="tearsheet"]');
    expect(el).toHaveAttribute('aria-modal', 'true');
  });

  it('aria-labelledby points to title element with id="hbc-tearsheet-title"', () => {
    render(
      <HbcTearsheet open={true} onClose={vi.fn()} title="Tearsheet" steps={makeSteps(2)} />,
    );
    const el = document.querySelector('[data-hbc-ui="tearsheet"]');
    expect(el).toHaveAttribute('aria-labelledby', 'hbc-tearsheet-title');
    expect(document.getElementById('hbc-tearsheet-title')).toBeInTheDocument();
  });

  it('title displayed', () => {
    render(
      <HbcTearsheet open={true} onClose={vi.fn()} title="My Tearsheet" steps={makeSteps(2)} />,
    );
    expect(screen.getByText('My Tearsheet')).toBeInTheDocument();
  });

  it('step indicator shows "Step 1 of N"', () => {
    render(
      <HbcTearsheet open={true} onClose={vi.fn()} title="Tearsheet" steps={makeSteps(3)} />,
    );
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();
  });

  it('step indicator has aria-live="polite"', () => {
    render(
      <HbcTearsheet open={true} onClose={vi.fn()} title="Tearsheet" steps={makeSteps(2)} />,
    );
    const indicator = screen.getByText('Step 1 of 2');
    expect(indicator).toHaveAttribute('aria-live', 'polite');
  });

  it('close button has aria-label="Close"', () => {
    render(
      <HbcTearsheet open={true} onClose={vi.fn()} title="Tearsheet" steps={makeSteps(2)} />,
    );
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('Previous button disabled on first step', () => {
    render(
      <HbcTearsheet open={true} onClose={vi.fn()} title="Tearsheet" steps={makeSteps(2)} />,
    );
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
  });

  it('Next button present (not "Complete") on non-last step', () => {
    render(
      <HbcTearsheet open={true} onClose={vi.fn()} title="Tearsheet" steps={makeSteps(2)} />,
    );
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Complete' })).not.toBeInTheDocument();
  });

  it('Complete button shows on last step (single-step tearsheet)', () => {
    render(
      <HbcTearsheet open={true} onClose={vi.fn()} title="Tearsheet" steps={makeSteps(1)} />,
    );
    expect(screen.getByRole('button', { name: 'Complete' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument();
  });
});
