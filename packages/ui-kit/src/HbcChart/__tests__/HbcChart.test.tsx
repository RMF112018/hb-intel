import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HbcChart } from '../index.js';

/**
 * HbcChart uses React.lazy + Suspense to load ECharts.
 * In jsdom, the lazy module will not resolve, so the Suspense fallback
 * renders instead. Tests focus on the container/wrapper behavior.
 */

const MINIMAL_OPTION = { xAxis: { type: 'category' as const }, series: [] };

describe('HbcChart', () => {
  it('renders with data-hbc-ui="chart"', () => {
    const { container } = render(<HbcChart option={MINIMAL_OPTION} />);
    expect(container.querySelector('[data-hbc-ui="chart"]')).toBeInTheDocument();
  });

  it('shows default loading fallback with correct height', () => {
    render(<HbcChart option={MINIMAL_OPTION} />);
    // The Suspense fallback renders because the lazy module does not resolve in jsdom.
    // Default fallback text is "Loading chart..."
    const fallback = screen.getByText('Loading chart...');
    expect(fallback).toBeInTheDocument();
    expect(fallback).toHaveStyle({ height: '400px' });
  });

  it('applies custom height to default fallback', () => {
    render(<HbcChart option={MINIMAL_OPTION} height="250px" />);
    const fallback = screen.getByText('Loading chart...');
    expect(fallback).toHaveStyle({ height: '250px' });
  });

  it('renders custom loadingFallback when provided', () => {
    render(
      <HbcChart
        option={MINIMAL_OPTION}
        loadingFallback={<div data-testid="custom-loader">Please wait</div>}
      />,
    );
    expect(screen.getByTestId('custom-loader')).toBeInTheDocument();
    expect(screen.getByText('Please wait')).toBeInTheDocument();
  });

  it('merges custom className on the container', () => {
    const { container } = render(
      <HbcChart option={MINIMAL_OPTION} className="my-chart-class" />,
    );
    const chartEl = container.querySelector('[data-hbc-ui="chart"]');
    expect(chartEl?.className).toContain('my-chart-class');
  });
});
