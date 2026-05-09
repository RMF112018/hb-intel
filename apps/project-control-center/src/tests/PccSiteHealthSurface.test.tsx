import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import {
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
  it('renders 4 cards as direct children of the bento grid (Wave 15A wave-b9 Prompt 4B-08 — `PccSiteHealthOverviewCard` removed; metrics absorbed into `PccSiteHealthChecksCard`; was 5 cards including overview)', () => {
    const { container } = renderSurface();
    const grid = container.querySelector('[data-pcc-bento-grid]');
    expect(grid).not.toBeNull();
    const cards = container.querySelectorAll('[data-pcc-card]');
    expect(cards).toHaveLength(4);
    for (const card of cards) {
      expect(card.parentElement === grid).toBe(true);
    }
  });

  it('zero in-grid `[data-pcc-active-surface-panel="site-health"]` card-level markers exist (Wave 15A wave-b9 Prompt 4B-08 — site-health moved to SURFACES_WITH_SHELL_ONLY_PANEL; the shell `<main role="tabpanel">` is the sole carrier of the marker, asserted in PccShell.responsive.test.tsx and PccShell.surfaceSmoke.test.tsx)', () => {
    const { container } = renderSurface();
    const panels = container.querySelectorAll('[data-pcc-active-surface-panel]');
    expect(panels).toHaveLength(0);
  });

  it('Checks card body absorbs the four overview metrics (Overall severity / Failing / Warnings / Last run), preserving the existing `data-pcc-site-health-*` markers; the dropped body cue does not appear inside the bento (the SharePoint admin tooling reminder lives in the shell hero `repair-posture` heroHighlight after Prompt 4B-02)', () => {
    const { container } = renderSurface();
    const checksBody = container.querySelector('[data-pcc-site-health-checks-body]');
    expect(checksBody, 'checks card body must render').not.toBeNull();

    // The absorbed metric row lives inside the Checks card body and
    // exposes a stable parent marker for scoped queries.
    const metrics = checksBody!.querySelector('[data-pcc-site-health-checks-metrics]');
    expect(metrics, 'absorbed metric row must render in Checks card body').not.toBeNull();

    // Each metric reuses the canonical `data-pcc-site-health-*` markers
    // from the deleted overview card so that prior consumer queries stay
    // valid in the new parent.
    expect(metrics!.querySelector('[data-pcc-site-health-overall]')?.textContent).toContain(
      SAMPLE_SITE_HEALTH_SUMMARY.overallSeverity,
    );
    expect(metrics!.querySelector('[data-pcc-site-health-failing]')?.textContent).toContain(
      String(SAMPLE_SITE_HEALTH_SUMMARY.failingChecks),
    );
    expect(metrics!.querySelector('[data-pcc-site-health-warning]')?.textContent).toContain(
      String(SAMPLE_SITE_HEALTH_SUMMARY.warningChecks),
    );
    // Last run preserves the prior overview format
    // (`summary.lastRunUtc ?? 'Not listed'`) — no formatter change.
    expect(metrics!.querySelector('[data-pcc-site-health-last-run]')?.textContent).toContain(
      SAMPLE_SITE_HEALTH_SUMMARY.lastRunUtc ?? 'Not listed',
    );

    // Scoped negative — the dropped body cue does not appear inside the
    // Site Health bento area. Per
    // `feedback_word_blocklists_break_on_corrected_copy` the scan is
    // scoped to the bento grid so an equivalent SharePoint admin tooling
    // reminder rendered elsewhere (e.g. a sibling card or the shell hero)
    // does not false-positive.
    const grid = container.querySelector('[data-pcc-bento-grid]');
    expect(grid).not.toBeNull();
    expect(
      grid!.textContent ?? '',
      'dropped body cue must not appear inside the Site Health bento grid',
    ).not.toContain(
      'Site health summary. Scans and repairs are managed in SharePoint admin tooling.',
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

  // Wave 15A wave-b9 Prompt 4B-08 — the prior "overview card emits
  // data-pcc-card-hierarchy='primary'" and "overview card emits
  // Tier 1 command markers" assertions are removed because
  // `PccSiteHealthOverviewCard` was deleted and no remaining Site Health
  // card carries `hierarchy="primary"` or tier1/command. Same shape as
  // the Project Home Prompt 4B-01 and Approvals Prompt 4B-05 migrations.

  it('repair requests card emits data-pcc-footprint="wide" (Prompt 08 promotion)', () => {
    const { container } = renderSurface();
    const body = container.querySelector('[data-pcc-site-health-repair-requests-body]');
    expect(body, 'repair requests body should render').not.toBeNull();
    const card = body?.closest('[data-pcc-card]');
    expect(card?.getAttribute('data-pcc-footprint')).toBe('wide');
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
