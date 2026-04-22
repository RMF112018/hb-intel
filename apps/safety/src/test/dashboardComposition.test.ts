/**
 * Phase-04 audit G-04 — dashboard composition (SUPPORTING, SECONDARY).
 *
 * This file is a structural guard, NOT the primary closure proof for G-04.
 * The primary closure proof is the rendered behavior of the new primitives
 * (safetyPeriodHealthPanel.test.tsx, safetyPriorityProjects.test.tsx,
 * safetyPriorityProjectCard.test.tsx) and the pure derivation proof
 * (reportingPeriodDashboardDerivation.test.ts).
 *
 * Assertions here exist only to lock composition invariants that are not
 * cleanly observable through behavior alone — in particular, that
 * dashboardConfig={{ kpiCards }} is no longer passed to WorkspacePageShell
 * (KPI integration moved into the body), and the layer ordering.
 */
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(
  path.resolve(__dirname, '../pages/ReportingPeriodDashboardPage.tsx'),
  'utf-8',
);

describe('ReportingPeriodDashboardPage — supporting composition guard (secondary)', () => {
  it('composes the new authored dashboard primitives', () => {
    expect(source).toContain('SafetyPeriodHealthPanel');
    expect(source).toContain('SafetyPriorityProjects');
    expect(source).toContain('SafetyStatStrip');
  });

  it('retains the data-table as supporting structure under an explicit heading', () => {
    expect(source).toContain('HbcDataTable');
    expect(source).toContain('All project-weeks in this reporting period');
  });

  it('no longer passes dashboardConfig KPI cards to WorkspacePageShell (KPI moved into body)', () => {
    expect(source).not.toContain('dashboardConfig=');
  });

  it('renders the authored layers in order: health panel → priority projects → stat strip → table', () => {
    const healthIdx = source.indexOf('<SafetyPeriodHealthPanel');
    const priorityIdx = source.indexOf('<SafetyPriorityProjects');
    const statIdx = source.indexOf('<SafetyStatStrip');
    const tableIdx = source.indexOf('<HbcDataTable');
    expect(healthIdx).toBeGreaterThan(-1);
    expect(priorityIdx).toBeGreaterThan(healthIdx);
    expect(statIdx).toBeGreaterThan(priorityIdx);
    expect(tableIdx).toBeGreaterThan(statIdx);
  });

  it('preserves WorkspacePageShell fatal-state ownership (loading/error/onRetry routed through WPS)', () => {
    expect(source).toMatch(/isLoading=\{state\.variant\s*===\s*'loading'/);
    expect(source).toMatch(/isError=\{isFatal\}/);
    expect(source).toMatch(/onRetry=\{retryPeriods\}/);
  });

  it('preserves the page/body-empty branch via SafetyStatusPanel intent="empty" and suppresses dashboard layers in that branch', () => {
    // The empty branch is rendered from {isEmpty && ...} and the ready
    // branch (which renders health/priority/stat/table) is gated by
    // {isReady && ...}. The two gates are mutually exclusive at the
    // derivation helper level.
    expect(source).toContain('isEmpty &&');
    expect(source).toContain('isReady &&');
    expect(source).toMatch(/<SafetyStatusPanel[\s\S]*?intent="empty"/);
  });

  it('delegates derivation to the pure helper functions', () => {
    expect(source).toContain('classifyPeriodHealth');
    expect(source).toContain('rankProjectWeeks');
  });

  it('preserves the incidents-redirect advisory posture', () => {
    expect(source).toMatch(/<SafetyStatusPanel[\s\S]*?intent="advisory"/);
    expect(source).toContain('dashboard-incidents-redirect');
  });
});
