import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import {
  PCC_MVP_SURFACES,
  SAMPLE_DRIFT_INDICATORS,
  SAMPLE_REPAIR_REQUESTS,
  SAMPLE_SITE_HEALTH_CHECKS,
  SAMPLE_SITE_HEALTH_SUMMARY,
} from '@hbc/models/pcc';
import { PccBentoGrid } from '../layout/PccBentoGrid';
import { PccSiteHealthSurface } from '../surfaces/siteHealth/PccSiteHealthSurface';

function renderSurface() {
  return render(
    <PccBentoGrid forceMode="wideDesktop">
      <PccSiteHealthSurface />
    </PccBentoGrid>,
  );
}

describe('PccSiteHealthSurface (Wave 2 / Prompt 06)', () => {
  it('renders 4 cards as direct children of the bento grid', () => {
    const { container } = renderSurface();
    const grid = container.querySelector('[data-pcc-bento-grid]');
    expect(grid).not.toBeNull();
    const cards = container.querySelectorAll('[data-pcc-card]');
    expect(cards).toHaveLength(4);
    for (const card of cards) {
      expect(card.parentElement === grid).toBe(true);
    }
  });

  it('exactly one [data-pcc-active-surface-panel="site-health"] exists, on the overview card', () => {
    const { container } = renderSurface();
    const panels = container.querySelectorAll('[data-pcc-active-surface-panel]');
    expect(panels).toHaveLength(1);
    expect(panels[0].getAttribute('data-pcc-active-surface-panel')).toBe('site-health');
    expect(panels[0].textContent).toContain(PCC_MVP_SURFACES['site-health'].displayName);
    expect(panels[0].textContent).toContain(PCC_MVP_SURFACES['site-health'].description);
  });

  it('overview card displays SAMPLE_SITE_HEALTH_SUMMARY values', () => {
    const { container } = renderSurface();
    const overview = container.querySelector('[data-pcc-site-health-overview-body]');
    expect(overview).not.toBeNull();
    expect(overview!.textContent).toContain(SAMPLE_SITE_HEALTH_SUMMARY.overallSeverity);
    expect(overview!.querySelector('[data-pcc-site-health-failing]')?.textContent).toContain(
      String(SAMPLE_SITE_HEALTH_SUMMARY.failingChecks),
    );
    expect(overview!.querySelector('[data-pcc-site-health-warning]')?.textContent).toContain(
      String(SAMPLE_SITE_HEALTH_SUMMARY.warningChecks),
    );
  });

  it('checks card renders SAMPLE_SITE_HEALTH_CHECKS.length rows', () => {
    const { container } = renderSurface();
    const rows = container.querySelectorAll('[data-pcc-site-health-check-id]');
    expect(rows).toHaveLength(SAMPLE_SITE_HEALTH_CHECKS.length);
  });

  it('drift card renders SAMPLE_DRIFT_INDICATORS.length rows', () => {
    const { container } = renderSurface();
    const rows = container.querySelectorAll('[data-pcc-drift-key]');
    expect(rows).toHaveLength(SAMPLE_DRIFT_INDICATORS.length);
  });

  it('repair-requests card renders SAMPLE_REPAIR_REQUESTS.length rows; every row carries a placeholder cue and contains no buttons', () => {
    const { container } = renderSurface();
    const repairBody = container.querySelector('[data-pcc-site-health-repair-requests-body]');
    expect(repairBody).not.toBeNull();
    const rows = repairBody!.querySelectorAll('[data-pcc-repair-request-id]');
    expect(rows).toHaveLength(SAMPLE_REPAIR_REQUESTS.length);
    for (const row of rows) {
      // placeholder cue substring is present per row
      expect(row.textContent).toContain('Preview placeholder');
    }
    // Repair-requests card body has no <button> elements (no operational affordances).
    const buttons = repairBody!.querySelectorAll('button');
    expect(buttons.length).toBe(0);
  });

  it('renders no <a href="http(s)://"> elements anywhere on the surface', () => {
    const { container } = renderSurface();
    const anchors = container.querySelectorAll('a[href]');
    for (const a of anchors) {
      const href = a.getAttribute('href') ?? '';
      expect(href).not.toMatch(/^https?:\/\//);
    }
  });
});
