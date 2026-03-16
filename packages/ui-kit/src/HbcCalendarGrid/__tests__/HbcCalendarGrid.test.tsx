import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HbcCalendarGrid } from '../index.js';

// March 2026 — starts on Sunday, 31 days
const defaultProps = {
  year: 2026,
  month: 2, // 0-indexed: March
  days: [],
};

describe('HbcCalendarGrid', () => {
  it('renders with data-hbc-ui="calendar-grid"', () => {
    const { container } = render(<HbcCalendarGrid {...defaultProps} />);
    expect(
      container.querySelector('[data-hbc-ui="calendar-grid"]'),
    ).toBeInTheDocument();
  });

  it('renders month/year header title', () => {
    render(<HbcCalendarGrid {...defaultProps} />);
    expect(screen.getByText('March 2026')).toBeInTheDocument();
  });

  it('renders 7 weekday column headers', () => {
    render(<HbcCalendarGrid {...defaultProps} />);
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(7);
    expect(headers[0]).toHaveTextContent('Sun');
    expect(headers[6]).toHaveTextContent('Sat');
  });

  it('renders day cells with correct day numbers', () => {
    render(<HbcCalendarGrid {...defaultProps} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('31')).toBeInTheDocument();
  });

  it('fires onDayClick when day cell clicked', async () => {
    const user = userEvent.setup();
    const onDayClick = vi.fn();
    render(<HbcCalendarGrid {...defaultProps} onDayClick={onDayClick} />);

    await user.click(screen.getByText('15'));
    expect(onDayClick).toHaveBeenCalledWith('2026-03-15');
  });

  it('fires onMonthChange on nav button click', async () => {
    const user = userEvent.setup();
    const onMonthChange = vi.fn();
    render(<HbcCalendarGrid {...defaultProps} onMonthChange={onMonthChange} />);

    await user.click(screen.getByLabelText('Previous month'));
    expect(onMonthChange).toHaveBeenCalledWith(-1);

    await user.click(screen.getByLabelText('Next month'));
    expect(onMonthChange).toHaveBeenCalledWith(1);
  });
});
