import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { YearSelector } from './YearSelector.js';

describe('YearSelector', () => {
  const years = [2026, 2025, 2024];
  const onChange = vi.fn();

  it('renders "Year:" label and a button for each year', () => {
    render(<YearSelector years={years} selectedYear={2025} onYearChange={onChange} />);
    expect(screen.getByText('Year:')).toBeInTheDocument();
    expect(screen.getByText('2026')).toBeInTheDocument();
    expect(screen.getByText('2025')).toBeInTheDocument();
    expect(screen.getByText('2024')).toBeInTheDocument();
  });

  it('marks the selected year as pressed', () => {
    render(<YearSelector years={years} selectedYear={2025} onYearChange={onChange} />);
    const btn2025 = screen.getByText('2025').closest('button');
    expect(btn2025).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onYearChange when a different year is clicked', () => {
    render(<YearSelector years={years} selectedYear={2025} onYearChange={onChange} />);
    fireEvent.click(screen.getByText('2024'));
    expect(onChange).toHaveBeenCalledWith(2024);
  });

  it('has radiogroup role with label', () => {
    render(<YearSelector years={years} selectedYear={2025} onYearChange={onChange} />);
    const group = screen.getByRole('radiogroup');
    expect(group).toBeInTheDocument();
  });

  it('renders each year as accessible button text', () => {
    render(<YearSelector years={years} selectedYear={2025} onYearChange={onChange} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
    expect(buttons[0]).toHaveTextContent('2026');
    expect(buttons[1]).toHaveTextContent('2025');
    expect(buttons[2]).toHaveTextContent('2024');
  });

  it('supports arrow key navigation', () => {
    render(<YearSelector years={years} selectedYear={2025} onYearChange={onChange} />);
    const group = screen.getByRole('radiogroup');
    fireEvent.keyDown(group, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenCalledWith(2024);
  });
});
