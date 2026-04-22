/**
 * Phase-04 audit G-04 — SafetyPeriodHealthPanel (behavior-first).
 *
 * Verifies the panel renders the canonical health-state label, the
 * headline/rationale, and the signal chip list with list semantics.
 */
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SafetyPeriodHealthPanel } from '../components/SafetyPeriodHealthPanel.js';
import type { SafetyPeriodHealth } from '../pages/reportingPeriodDashboardDerivation.js';

const health = (overrides: Partial<SafetyPeriodHealth> = {}): SafetyPeriodHealth => ({
  state: 'attention-needed',
  headline: 'Attention needed',
  rationale: 'Several projects show signals.',
  signals: [
    { id: 'high-risk', label: '2 projects with high-risk findings', tone: 'critical' },
    { id: 'below-75', label: '3 scored below 75%', tone: 'critical' },
  ],
  ...overrides,
});

describe('SafetyPeriodHealthPanel — canonical state rendering', () => {
  it('renders the state label, headline, rationale, and period label', () => {
    render(<SafetyPeriodHealthPanel health={health()} periodLabel="Week of 2026-04-20" />);
    // The state label "Attention needed" may appear as both badge label and heading.
    expect(screen.getAllByText('Attention needed').length).toBeGreaterThan(0);
    expect(
      screen.getByRole('heading', { name: /^Attention needed$/ }),
    ).toBeInTheDocument();
    expect(screen.getByText(/several projects show signals/i)).toBeInTheDocument();
    expect(screen.getByText('Week of 2026-04-20')).toBeInTheDocument();
  });

  it('exposes the signal chips as a labeled list', () => {
    render(<SafetyPeriodHealthPanel health={health()} periodLabel="Week of 2026-04-20" />);
    const list = screen.getByRole('list', { name: /period signals/i });
    expect(within(list).getAllByRole('listitem')).toHaveLength(2);
    expect(within(list).getByText(/2 projects with high-risk findings/i)).toBeInTheDocument();
    expect(within(list).getByText(/3 scored below 75%/i)).toBeInTheDocument();
  });

  it('renders the canonical on-track label for state="on-track"', () => {
    render(
      <SafetyPeriodHealthPanel
        health={health({ state: 'on-track', headline: 'On track', signals: [] })}
        periodLabel="Week of 2026-04-20"
      />,
    );
    expect(screen.getAllByText('On track').length).toBeGreaterThan(0);
  });

  it('renders the canonical watchlist label for state="watchlist"', () => {
    render(
      <SafetyPeriodHealthPanel
        health={health({ state: 'watchlist', headline: 'Watchlist', signals: [] })}
        periodLabel="Week of 2026-04-20"
      />,
    );
    expect(screen.getAllByText('Watchlist').length).toBeGreaterThan(0);
  });

  it('renders the canonical critical label for state="critical"', () => {
    render(
      <SafetyPeriodHealthPanel
        health={health({ state: 'critical', headline: 'Critical', signals: [] })}
        periodLabel="Week of 2026-04-20"
      />,
    );
    // The headline heading is "Critical"; the badge label is also "Critical".
    expect(screen.getAllByText('Critical').length).toBeGreaterThan(0);
  });

  it('omits the signal list when there are no signals', () => {
    render(
      <SafetyPeriodHealthPanel
        health={health({ signals: [] })}
        periodLabel="Week of 2026-04-20"
      />,
    );
    expect(screen.queryByRole('list', { name: /period signals/i })).toBeNull();
  });

  it('attaches the canonical data-health-state attribute', () => {
    const { container } = render(
      <SafetyPeriodHealthPanel
        health={health({ state: 'critical', signals: [] })}
        periodLabel="Week of 2026-04-20"
      />,
    );
    const panel = container.querySelector('[data-safety-ui="period-health-panel"]');
    expect(panel?.getAttribute('data-health-state')).toBe('critical');
  });
});
