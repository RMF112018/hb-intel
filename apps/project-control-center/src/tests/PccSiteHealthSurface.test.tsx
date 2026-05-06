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
    <PccBentoGrid forceMode="desktop">
      <PccSiteHealthSurface />
    </PccBentoGrid>,
  );
}

describe('PccSiteHealthSurface (Wave 2 / Prompt 06)', () => {
  it('renders 5 cards as direct children of the bento grid (4 site-health + 1 Procore sync & repair posture, Wave 13 / Prompt 13E)', () => {
    const { container } = renderSurface();
    const grid = container.querySelector('[data-pcc-bento-grid]');
    expect(grid).not.toBeNull();
    const cards = container.querySelectorAll('[data-pcc-card]');
    expect(cards).toHaveLength(5);
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
    // surface.description is shell-hero-owned (PccProjectHeroBand) post wave-b2
    // Prompt 03; not asserted in the surface panel.
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
      // Each row carries a product-grade administrator-tooling cue that
      // points the user to where repair runs are actually managed.
      expect(row.textContent).toContain('Repair runs are managed in SharePoint admin tooling.');
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

  it('overview card emits data-pcc-card-hierarchy="primary" (Prompt 08 promotion)', () => {
    const { container } = renderSurface();
    const overviewPanel = container.querySelector('[data-pcc-active-surface-panel="site-health"]');
    expect(overviewPanel, 'overview card should render').not.toBeNull();
    expect(overviewPanel?.getAttribute('data-pcc-card-hierarchy')).toBe('primary');
  });

  it('repair requests card emits data-pcc-footprint="wide" (Prompt 08 promotion)', () => {
    const { container } = renderSurface();
    const body = container.querySelector('[data-pcc-site-health-repair-requests-body]');
    expect(body, 'repair requests body should render').not.toBeNull();
    const card = body?.closest('[data-pcc-card]');
    expect(card?.getAttribute('data-pcc-footprint')).toBe('wide');
  });

  // Wave 15A wave-b3 Prompt 05 — tier/region contract assertions per
  // 02_SURFACE_CARD_INVENTORY_MATRIX.md. Existing footprint and
  // hierarchy assertions are preserved above.

  it('overview card emits Tier 1 command markers and an h2 heading', () => {
    const { container } = renderSurface();
    const overviewPanel = container.querySelector('[data-pcc-active-surface-panel="site-health"]');
    expect(overviewPanel, 'overview card should render').not.toBeNull();
    expect(overviewPanel!.getAttribute('data-pcc-card-tier')).toBe('tier1');
    expect(overviewPanel!.getAttribute('data-pcc-card-region')).toBe('command');
    expect(overviewPanel!.querySelector('h2'), 'tier1 command card renders an h2').not.toBeNull();
  });

  it('checks card is Tier 2 operational', () => {
    const { container } = renderSurface();
    const card = container
      .querySelector('[data-pcc-site-health-checks-body]')!
      .closest('[data-pcc-card]')!;
    expect(card.getAttribute('data-pcc-card-tier')).toBe('tier2');
    expect(card.getAttribute('data-pcc-card-region')).toBe('operational');
  });

  it('drift card is Tier 2 operational and was promoted to footprint="wide"', () => {
    const { container } = renderSurface();
    const card = container.querySelector('[data-pcc-drift-key]')!.closest('[data-pcc-card]')!;
    expect(card.getAttribute('data-pcc-card-tier')).toBe('tier2');
    expect(card.getAttribute('data-pcc-card-region')).toBe('operational');
    expect(card.getAttribute('data-pcc-footprint')).toBe('wide');
  });

  it('repair-requests card is Tier 3 deferred', () => {
    const { container } = renderSurface();
    const card = container
      .querySelector('[data-pcc-site-health-repair-requests-body]')!
      .closest('[data-pcc-card]')!;
    expect(card.getAttribute('data-pcc-card-tier')).toBe('tier3');
    expect(card.getAttribute('data-pcc-card-region')).toBe('deferred');
  });

  it('procore sync & repair card is Tier 3 deferred', () => {
    const { container } = renderSurface();
    const card = container
      .querySelector('[data-pcc-card-id="procore-sync-repair"]')!
      .closest('[data-pcc-card]')!;
    expect(card.getAttribute('data-pcc-card-tier')).toBe('tier3');
    expect(card.getAttribute('data-pcc-card-region')).toBe('deferred');
  });

  it('every check row emits a data-pcc-site-health-check-severity-tier marker (Prompt 08 additive marker)', () => {
    const { container } = renderSurface();
    const checksBody = container.querySelector('[data-pcc-site-health-checks-body]');
    expect(checksBody, 'checks body should render').not.toBeNull();
    const rows = checksBody!.querySelectorAll('[data-pcc-site-health-check-id]');
    expect(rows.length).toBeGreaterThan(0);
    const allowedTiers = new Set(['security', 'repair', 'warning', 'info', 'other']);
    for (const row of Array.from(rows)) {
      const tier = row.getAttribute('data-pcc-site-health-check-severity-tier');
      expect(
        tier,
        `check row '${row.getAttribute('data-pcc-site-health-check-id')}' should emit a severity-tier marker`,
      ).not.toBeNull();
      expect(allowedTiers.has(tier ?? '')).toBe(true);
    }
  });
});
