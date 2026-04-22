/**
 * Phase-04 audit G-04 — SafetyPriorityProjects (behavior-first).
 *
 * Verifies list semantics, the order it delegates to the derivation helper,
 * and the empty-state ownership split: the primitive renders nothing when
 * hasProjectWeeks=false (the page-empty posture is owned elsewhere); it
 * renders the secondary-empty posture only when hasProjectWeeks=true and
 * items.length === 0.
 */
import type { ReactNode } from 'react';
import { render, screen, within } from '@testing-library/react';
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

import { SafetyPriorityProjects } from '../components/SafetyPriorityProjects.js';
import type { SafetyPriorityProjectItem } from '../pages/reportingPeriodDashboardDerivation.js';

function pw(projectNumber: string): SafetyProjectWeekRecord {
  return {
    id: `pwr-${projectNumber}`,
    spItemId: 1,
    title: 'Project-week',
    reportingPeriodId: 'period-1',
    reportingPeriodSpItemId: 1,
    projectNumber,
    projectNameSnapshot: `${projectNumber} name`,
    projectLocationSnapshot: '',
    projectStageSnapshot: '',
    projectSourceClassification: 'project',
    expectedInspectionThisWeek: true,
    inspectionCount: 1,
    averageInspectionScore: 0.9,
    highestRiskFindingLevel: 'medium',
    weeklySummary: '',
    managerReviewStatus: 'not-required',
    publishStatus: 'published',
  } as SafetyProjectWeekRecord;
}

function asItem(projectNumber: string, score: number): SafetyPriorityProjectItem {
  return {
    projectWeek: pw(projectNumber),
    priorityScore: score,
    reasons: ['Medium-risk finding'],
    topReason: 'Medium-risk finding',
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

describe('SafetyPriorityProjects — list + empty-state split', () => {
  it('renders one card per item in the supplied order', () => {
    const items = [asItem('P-01', 4), asItem('P-02', 3), asItem('P-03', 2)];
    render(
      <SafetyPriorityProjects items={items} activePeriod={period} hasProjectWeeks={true} />,
    );
    // The labeled outer list is programmatically exposed; the cards inside
    // each render their own (inner) stats list, so we count cards via the
    // <article role="article"> that SafetyPriorityProjectCard emits — one
    // per item — rather than via listitem, which would also match the
    // nested stats rows.
    const list = screen.getByRole('list', { name: /^priority projects$/i });
    const cards = within(list).getAllByRole('article');
    expect(cards).toHaveLength(3);
    const headings = cards.map(
      (el) => within(el).getAllByRole('heading')[0]?.textContent?.trim() ?? '',
    );
    expect(headings).toEqual(['P-01', 'P-02', 'P-03']);
  });

  it('renders nothing when hasProjectWeeks=false (no double-empty stacking)', () => {
    const { container } = render(
      <SafetyPriorityProjects items={[]} activePeriod={period} hasProjectWeeks={false} />,
    );
    expect(container.firstChild).toBeNull();
    expect(
      screen.queryByText(/nothing flagged for this period/i),
    ).toBeNull();
  });

  it('renders the section-scoped secondary-empty posture when hasProjectWeeks=true and items is empty', () => {
    render(
      <SafetyPriorityProjects items={[]} activePeriod={period} hasProjectWeeks={true} />,
    );
    expect(screen.getByRole('heading', { name: /priority projects/i })).toBeInTheDocument();
    expect(screen.getByText(/nothing flagged for this period/i)).toBeInTheDocument();
    // The full list should NOT render.
    expect(screen.queryByRole('list', { name: /^priority projects$/i })).toBeNull();
  });
});
