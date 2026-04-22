/**
 * Phase-04 audit G-04 — SafetyPriorityProjectCard (behavior-first).
 *
 * Verifies the drill-in route-honesty rule: the CTA renders only when both
 * projectWeek.projectNumber and activePeriod.weekStartDate are non-empty.
 * No inferred params, no synthesized fallbacks.
 */
import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type {
  SafetyProjectWeekRecord,
  SafetyReportingPeriod,
} from '@hbc/features-safety';

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    to,
    params,
    ...rest
  }: {
    children: ReactNode;
    to?: string;
    params?: Record<string, string>;
  } & Record<string, unknown>) => (
    <a
      href="#"
      data-to={to ?? ''}
      data-params={params ? JSON.stringify(params) : ''}
      {...rest}
    >
      {children}
    </a>
  ),
}));

import { SafetyPriorityProjectCard } from '../components/SafetyPriorityProjectCard.js';
import type { SafetyPriorityProjectItem } from '../pages/reportingPeriodDashboardDerivation.js';

function pw(overrides: Partial<SafetyProjectWeekRecord>): SafetyProjectWeekRecord {
  return {
    id: `pwr-${overrides.projectNumber ?? 'P'}`,
    spItemId: 1,
    title: 'Project-week',
    reportingPeriodId: 'period-1',
    reportingPeriodSpItemId: 1,
    projectNumber: 'P-1234',
    projectNameSnapshot: 'HB Tower A',
    projectLocationSnapshot: '',
    projectStageSnapshot: '',
    projectSourceClassification: 'project',
    expectedInspectionThisWeek: true,
    inspectionCount: 2,
    averageInspectionScore: 0.62,
    highestRiskFindingLevel: 'high',
    weeklySummary: '',
    managerReviewStatus: 'not-required',
    publishStatus: 'review-required',
    ...overrides,
  } as SafetyProjectWeekRecord;
}

function item(overrides: Partial<SafetyProjectWeekRecord> = {}): SafetyPriorityProjectItem {
  return {
    projectWeek: pw(overrides),
    priorityScore: 9,
    reasons: ['High-risk finding', 'Average score below 75%', 'Review required'],
    topReason: 'High-risk finding',
  };
}

const period: SafetyReportingPeriod = {
  id: 'period-1',
  spItemId: 1,
  title: 'Week 17',
  weekStartDate: '2026-04-20',
  weekEndDate: '2026-04-26',
  periodLabel: 'Week of 2026-04-20',
  status: 'open',
} as SafetyReportingPeriod;

describe('SafetyPriorityProjectCard — authored framing + route-honest drill-in', () => {
  it('renders project identity and the top-reason line', () => {
    render(<SafetyPriorityProjectCard item={item()} activePeriod={period} />);
    expect(screen.getByRole('heading', { name: 'P-1234' })).toBeInTheDocument();
    expect(screen.getByText('HB Tower A')).toBeInTheDocument();
    expect(screen.getByText(/high-risk finding/i)).toBeInTheDocument();
    expect(screen.getByText(/average score below 75%/i)).toBeInTheDocument();
  });

  it('renders the drill-in CTA with correct to and params when data is present', () => {
    render(<SafetyPriorityProjectCard item={item()} activePeriod={period} />);
    const cta = screen.getByRole('link', { name: /open project-week detail/i });
    expect(cta).toHaveAttribute('data-to', '/projects/$projectNumber/weeks/$weekStartDate');
    const params = JSON.parse(cta.getAttribute('data-params') ?? '{}');
    expect(params).toEqual({ projectNumber: 'P-1234', weekStartDate: '2026-04-20' });
  });

  it('omits the drill-in CTA entirely when activePeriod is undefined (no weekStartDate)', () => {
    render(<SafetyPriorityProjectCard item={item()} activePeriod={undefined} />);
    expect(
      screen.queryByRole('link', { name: /open project-week detail/i }),
    ).toBeNull();
  });

  it('omits the drill-in CTA when activePeriod.weekStartDate is empty', () => {
    render(
      <SafetyPriorityProjectCard
        item={item()}
        activePeriod={{ ...period, weekStartDate: '' } as SafetyReportingPeriod}
      />,
    );
    expect(
      screen.queryByRole('link', { name: /open project-week detail/i }),
    ).toBeNull();
  });

  it('omits the drill-in CTA when projectNumber is empty', () => {
    render(
      <SafetyPriorityProjectCard item={item({ projectNumber: '' })} activePeriod={period} />,
    );
    expect(
      screen.queryByRole('link', { name: /open project-week detail/i }),
    ).toBeNull();
    // Identity falls back to "Unknown project".
    expect(screen.getByRole('heading', { name: /unknown project/i })).toBeInTheDocument();
  });

  it('renders stat chips (avg score, inspections, publish status) as a labeled list', () => {
    render(<SafetyPriorityProjectCard item={item()} activePeriod={period} />);
    const list = screen.getByRole('list', { name: /stats for P-1234/i });
    expect(list).toBeInTheDocument();
    expect(screen.getByText('62%')).toBeInTheDocument();
    expect(screen.getByText('review-required')).toBeInTheDocument();
  });
});
