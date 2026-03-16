import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HbcKpiCard } from '../index.js';

describe('HbcKpiCard', () => {
  it('renders with data-hbc-ui="kpi-card"', () => {
    const { container } = render(<HbcKpiCard label="Revenue" value="$1.2M" />);
    expect(container.querySelector('[data-hbc-ui="kpi-card"]')).toBeInTheDocument();
  });

  it('renders label text', () => {
    render(<HbcKpiCard label="Total Orders" value={42} />);
    expect(screen.getByText('Total Orders')).toBeInTheDocument();
  });

  it('renders a string value', () => {
    render(<HbcKpiCard label="Revenue" value="$1.2M" />);
    expect(screen.getByText('$1.2M')).toBeInTheDocument();
  });

  it('renders a numeric value', () => {
    render(<HbcKpiCard label="Count" value={1234} />);
    expect(screen.getByText('1234')).toBeInTheDocument();
  });

  it('renders trend indicator with up arrow when trend direction is up', () => {
    render(
      <HbcKpiCard
        label="Revenue"
        value="$1.2M"
        trend={{ direction: 'up', label: '+12%' }}
      />,
    );
    // U+25B2 = black up-pointing triangle
    expect(screen.getByText(/\u25B2/)).toBeInTheDocument();
  });

  it('renders trend indicator with down arrow when trend direction is down', () => {
    render(
      <HbcKpiCard
        label="Revenue"
        value="$800K"
        trend={{ direction: 'down', label: '-5%' }}
      />,
    );
    // U+25BC = black down-pointing triangle
    expect(screen.getByText(/\u25BC/)).toBeInTheDocument();
  });

  it('renders trend label text', () => {
    render(
      <HbcKpiCard
        label="Revenue"
        value="$1.2M"
        trend={{ direction: 'up', label: '+12% vs last month' }}
      />,
    );
    expect(screen.getByText(/\+12% vs last month/)).toBeInTheDocument();
  });

  it('fires click handler when onClick is provided', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<HbcKpiCard label="Revenue" value="$1.2M" onClick={handleClick} />);
    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('applies active state class when isActive=true', () => {
    const { container } = render(
      <HbcKpiCard label="Revenue" value="$1.2M" isActive onClick={() => {}} />,
    );
    const card = container.querySelector('[data-hbc-ui="kpi-card"]');
    // The active card gets the cardActive class merged — verify via className containing the active style token
    expect(card?.className).toBeTruthy();
    // We cannot check the exact Griffel class name, but we can verify the element exists with merged classes
    // The key observable: when isActive=false (default), className is shorter
    const { container: inactiveContainer } = render(
      <HbcKpiCard label="Revenue" value="$1.2M" onClick={() => {}} />,
    );
    const inactiveCard = inactiveContainer.querySelector('[data-hbc-ui="kpi-card"]');
    expect(card?.className).not.toBe(inactiveCard?.className);
  });

  it('merges custom className', () => {
    const { container } = render(
      <HbcKpiCard label="Revenue" value="$1.2M" className="my-custom-class" />,
    );
    const card = container.querySelector('[data-hbc-ui="kpi-card"]');
    expect(card?.className).toContain('my-custom-class');
  });
});
