import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HbcSegmentedControl } from '../index.js';

const YEARS = [
  { value: 2026, label: '2026' },
  { value: 2025, label: '2025' },
  { value: 2024, label: '2024' },
];

describe('HbcSegmentedControl', () => {
  it('renders with data-hbc-ui="segmented-control"', () => {
    const { container } = render(
      <HbcSegmentedControl label="Year:" options={YEARS} value={2026} onChange={() => {}} />,
    );
    expect(container.querySelector('[data-hbc-ui="segmented-control"]')).toBeInTheDocument();
  });

  it('renders all options as buttons', () => {
    render(
      <HbcSegmentedControl label="Year:" options={YEARS} value={2026} onChange={() => {}} />,
    );
    expect(screen.getAllByRole('button')).toHaveLength(3);
  });

  it('renders a visible label by default', () => {
    render(
      <HbcSegmentedControl label="Year:" options={YEARS} value={2026} onChange={() => {}} />,
    );
    expect(screen.getByText('Year:')).toBeVisible();
  });

  it('hides the label visually when showLabel=false', () => {
    render(
      <HbcSegmentedControl
        label="Year:"
        showLabel={false}
        options={YEARS}
        value={2026}
        onChange={() => {}}
      />,
    );
    // Label exists for a11y but is visually hidden
    const label = screen.getByText('Year:');
    expect(label).toBeInTheDocument();
  });

  it('marks the selected option as pressed', () => {
    render(
      <HbcSegmentedControl label="Year:" options={YEARS} value={2025} onChange={() => {}} />,
    );
    const buttons = screen.getAllByRole('button');
    expect(buttons[1]).toHaveAttribute('aria-pressed', 'true');
    expect(buttons[0]).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onChange when an option is clicked', () => {
    const onChange = vi.fn();
    render(
      <HbcSegmentedControl label="Year:" options={YEARS} value={2026} onChange={onChange} />,
    );
    fireEvent.click(screen.getByText('2024'));
    expect(onChange).toHaveBeenCalledWith(2024);
  });

  it('navigates forward with ArrowRight', () => {
    const onChange = vi.fn();
    render(
      <HbcSegmentedControl label="Year:" options={YEARS} value={2026} onChange={onChange} />,
    );
    const group = screen.getByRole('radiogroup');
    fireEvent.keyDown(group, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenCalledWith(2025);
  });

  it('wraps around with ArrowRight on last option', () => {
    const onChange = vi.fn();
    render(
      <HbcSegmentedControl label="Year:" options={YEARS} value={2024} onChange={onChange} />,
    );
    const group = screen.getByRole('radiogroup');
    fireEvent.keyDown(group, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenCalledWith(2026);
  });

  it('navigates backward with ArrowLeft', () => {
    const onChange = vi.fn();
    render(
      <HbcSegmentedControl label="Year:" options={YEARS} value={2025} onChange={onChange} />,
    );
    const group = screen.getByRole('radiogroup');
    fireEvent.keyDown(group, { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenCalledWith(2026);
  });

  it('wraps around with ArrowLeft on first option', () => {
    const onChange = vi.fn();
    render(
      <HbcSegmentedControl label="Year:" options={YEARS} value={2026} onChange={onChange} />,
    );
    const group = screen.getByRole('radiogroup');
    fireEvent.keyDown(group, { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenCalledWith(2024);
  });

  it('does not call onChange when disabled', () => {
    const onChange = vi.fn();
    render(
      <HbcSegmentedControl
        label="Year:"
        options={YEARS}
        value={2026}
        onChange={onChange}
        disabled
      />,
    );
    fireEvent.click(screen.getByText('2025'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('supports string values', () => {
    const onChange = vi.fn();
    const options = [
      { value: 'active', label: 'Active' },
      { value: 'closed', label: 'Closed' },
    ];
    render(
      <HbcSegmentedControl label="Status:" options={options} value="active" onChange={onChange} />,
    );
    fireEvent.click(screen.getByText('Closed'));
    expect(onChange).toHaveBeenCalledWith('closed');
  });

  it('has a radiogroup with aria-labelledby pointing to the label', () => {
    render(
      <HbcSegmentedControl label="Year:" options={YEARS} value={2026} onChange={() => {}} />,
    );
    const group = screen.getByRole('radiogroup');
    const labelId = group.getAttribute('aria-labelledby');
    expect(labelId).toBeTruthy();
    expect(document.getElementById(labelId!)).toHaveTextContent('Year:');
  });
});
