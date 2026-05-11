import { test, expect } from '@playwright/test';
import { skipIfMissingPccLiveEnv } from './pcc-live.env';
import { PCC_LIVE_SURFACES, type PccLiveSurfaceId } from './pcc-live.surfaces';
import { PccLivePageObject } from './pcc-live.page-object';

/**
 * Phase 06 Prompt 14 — focused live hard-gate spec.
 *
 * Complements the existing pcc-live.surface-smoke.spec.ts (which keeps
 * shell-owned active panel as evidence-only) by asserting Phase 06
 * invariants as HARD gates against the deployed 1.0.0.218 tenant
 * package:
 *
 *   - Phase 06 analytics card titles render on each analytics-owning
 *     surface (Project Home + the five primary-dashboard tabs);
 *   - expected direct-bento-child card count per surface;
 *   - shell-owned `main[role="tabpanel"][data-pcc-active-surface-panel]`
 *     for each surface (not card-level);
 *   - zero card-level [data-pcc-active-surface-panel];
 *   - zero nested [data-pcc-card] [data-pcc-card];
 *   - no Project Intelligence card text;
 *   - no developer/TODO copy in rendered grid text;
 *   - Project Home canonical 12-card spine + analytics order
 *     (slicing the first twelve direct cards on either fixture or
 *     read-model path);
 *   - Project Home gateway actions are <button>, never <a href>;
 *   - Recent Activity gateway is disabled with a visible reason via
 *     aria-describedby.
 *
 * Self-skips via skipIfMissingPccLiveEnv when the live lane is not
 * ready (missing storage state, missing env, invalid config, or local
 * package-version-mismatch). When the local resolver returns `ready`
 * but the tenant serves a build older than Phase 06, the assertions
 * here fail as DOM regressions — that is the deploy-lag signal, not
 * a resolver status (see the local-only version check note in
 * pcc-live.env.ts).
 */

const check = skipIfMissingPccLiveEnv(test);
const env = check.env!;

// Phase 06 expected direct-bento-child card count per surface. project-home
// admits either the 12-card fixture path or the 18-card read-model path
// (operational spine + analytics + unified-lifecycle tail). documents is
// its own Document Control surface and is intentionally outside the
// Phase 06 analytics matrix; assert `> 0` direct cards and the same
// shell/no-card-active-panel/no-nested invariants only.
const PHASE_06_CARD_COUNT: Record<PccLiveSurfaceId, readonly number[] | 'open'> = {
  'project-home': [12, 18],
  'core-tools': [3],
  documents: 'open',
  'estimating-preconstruction': [5],
  'startup-closeout': [6],
  'project-controls': [6],
  'cost-time': [6],
  'systems-administration': [6],
};

const PHASE_06_ANALYTICS_BY_SURFACE: Partial<Record<PccLiveSurfaceId, readonly string[]>> = {
  'project-home': ['Action Exposure Mix', 'Project Health Trend', 'Readiness / Approval Rollup'],
  'estimating-preconstruction': ['Handoff Continuity Preview', 'Estimate Exposure Preview'],
  'startup-closeout': [
    'Startup Readiness Completion',
    'Responsibility Coverage',
    'Closeout & Warranty Readiness',
  ],
  'project-controls': [
    'Constraints Aging',
    'Permit / Inspection Readiness',
    'Risk / Issue Severity Distribution',
  ],
  'cost-time': [
    'Schedule Milestone Posture',
    'Procurement / Buyout Exposure',
    'Commitment / Cost Exposure Preview',
  ],
  'systems-administration': [
    'Integration Health Summary',
    'Configuration Severity',
    'Procore Mapping / Sync Posture',
  ],
};

const PROJECT_HOME_CANONICAL_ORDER: readonly string[] = [
  'Priority Actions',
  'Site Health Summary',
  'Document Control Center',
  'Action Exposure Mix',
  'Project Health Trend',
  'Project Readiness',
  'Approvals & Checkpoints',
  'Readiness / Approval Rollup',
  'Missing Configurations',
  'External Platforms',
  'Team Snapshot',
  'Recent Activity',
];

// Forbidden developer/TODO copy regex set — scoped to rendered grid
// textContent only (source files legitimately carry these tokens in
// approved JSDoc/comments per stored feedback
// `feedback_todo_copy_regex_scope_rendered_dom.md`).
const FORBIDDEN_RENDERED_PATTERNS: readonly { name: string; pattern: RegExp }[] = [
  { name: 'TODO(post-mvp)', pattern: /TODO\(post-mvp\)/i },
  { name: 'Prompt NN', pattern: /\bPrompt\s+\d{2}\b/i },
  { name: 'wave-XX', pattern: /\bwave-[a-z0-9]+\b/i },
  { name: 'phase-NN', pattern: /\bphase[-\s]?\d{2}\b/i },
  { name: 'coming soon', pattern: /coming soon/i },
];

test.describe('PCC Phase 06 live evidence — Prompt 14 hard gates', () => {
  for (const surface of PCC_LIVE_SURFACES) {
    test(`'${surface.id}' Phase 06 invariants on live 1.0.0.218 deploy`, async ({ page }) => {
      const po = new PccLivePageObject(page);
      await po.goto(env.pageUrl);
      await po.waitForPccRoot();
      await po.navigateToSurface(surface);
      const result = await po.assertSurfaceActive(surface);

      // Shell-owned active-panel (hard gate in Prompt 14; evidence-only
      // in pcc-live.surface-smoke.spec.ts).
      expect(
        result.shellActivePanelCount,
        `'${surface.id}' must have exactly one shell-owned tabpanel`,
      ).toBe(1);
      expect(
        result.activePanelIsShellMain,
        `'${surface.id}' active panel must be the shell main`,
      ).toBe(true);

      // No card-level active-panel marker inside the bento grid.
      const cardLevelActivePanels = await page
        .locator('[data-pcc-bento-grid] [data-pcc-card][data-pcc-active-surface-panel]')
        .count();
      expect(
        cardLevelActivePanels,
        `'${surface.id}' must not declare card-level active-panel marker`,
      ).toBe(0);

      // No nested cards.
      const nestedCards = await page.locator('[data-pcc-card] [data-pcc-card]').count();
      expect(nestedCards, `'${surface.id}' must not nest cards`).toBe(0);

      // Direct card count.
      const directCardCount = await page.locator('[data-pcc-bento-grid] > [data-pcc-card]').count();
      const expected = PHASE_06_CARD_COUNT[surface.id];
      if (expected === 'open') {
        expect(
          directCardCount,
          `'${surface.id}' must render at least one direct bento card`,
        ).toBeGreaterThan(0);
      } else {
        expect(
          expected.includes(directCardCount),
          `'${surface.id}' direct card count ${directCardCount} must be one of [${expected.join(', ')}]`,
        ).toBe(true);
      }

      // No Project Intelligence card text.
      const grid = page.locator('[data-pcc-bento-grid]').first();
      const gridText = (await grid.innerText()) ?? '';
      expect(gridText, `'${surface.id}' must not render "Project Intelligence"`).not.toContain(
        'Project Intelligence',
      );

      // No developer/TODO copy in rendered grid text.
      for (const { name, pattern } of FORBIDDEN_RENDERED_PATTERNS) {
        expect(
          pattern.test(gridText),
          `'${surface.id}' must not render developer/TODO copy matching '${name}'`,
        ).toBe(false);
      }

      // Phase 06 analytics card titles.
      const analytics = PHASE_06_ANALYTICS_BY_SURFACE[surface.id] ?? [];
      for (const title of analytics) {
        await expect(
          page.getByRole('heading', { name: title }).first(),
          `'${surface.id}' must render analytics card '${title}'`,
        ).toBeVisible();
      }

      // Analytics structural markers (only for analytics-owning surfaces).
      if (analytics.length > 0) {
        const analyticsCardCount = await page.locator('[data-pcc-analytics-card]').count();
        expect(
          analyticsCardCount,
          `'${surface.id}' analytics card count must equal ${analytics.length}`,
        ).toBe(analytics.length);
        const chartCount = await page.locator('[data-pcc-analytics-chart]').count();
        expect(
          chartCount,
          `'${surface.id}' analytics chart container count must equal ${analytics.length}`,
        ).toBe(analytics.length);

        await expect(
          page.getByText('Preview analytics · sample project data').first(),
          `'${surface.id}' must show preview-label copy`,
        ).toBeVisible();
        await expect(
          page
            .getByText(
              'This preview uses deterministic sample project data until the source read model is connected.',
            )
            .first(),
          `'${surface.id}' must show preview-description copy`,
        ).toBeVisible();

        const sourceLabelCount = await page
          .locator('[data-pcc-analytics-card-source-label]')
          .count();
        expect(
          sourceLabelCount,
          `'${surface.id}' must render a source label on every analytics card`,
        ).toBe(analytics.length);

        // Fallback summary rows must live outside the chart canvas.
        const summaryRowsInsideChart = await page
          .locator('[data-pcc-analytics-chart] [data-pcc-analytics-card-summary-row]')
          .count();
        expect(
          summaryRowsInsideChart,
          `'${surface.id}' summary rows must live outside chart canvas`,
        ).toBe(0);
      }
    });
  }

  test('Project Home canonical 12-card order is preserved on the live deploy', async ({ page }) => {
    const po = new PccLivePageObject(page);
    await po.goto(env.pageUrl);
    await po.waitForPccRoot();
    const projectHome = PCC_LIVE_SURFACES.find((s) => s.id === 'project-home')!;
    await po.navigateToSurface(projectHome);
    await po.assertSurfaceActive(projectHome);
    const allTitles = await page
      .locator('[data-pcc-bento-grid] > [data-pcc-card] :is(h2, h3, h4)')
      .allInnerTexts();
    const firstTwelve = allTitles.map((t) => t.trim()).slice(0, 12);
    expect(firstTwelve).toEqual([...PROJECT_HOME_CANONICAL_ORDER]);
  });

  test('Project Home gateway actions are <button>, never <a href>', async ({ page }) => {
    const po = new PccLivePageObject(page);
    await po.goto(env.pageUrl);
    await po.waitForPccRoot();
    const projectHome = PCC_LIVE_SURFACES.find((s) => s.id === 'project-home')!;
    await po.navigateToSurface(projectHome);
    await po.assertSurfaceActive(projectHome);
    const actions = page.locator('[data-pcc-project-home-gateway-action]');
    const count = await actions.count();
    expect(count, 'expected at least one Project Home gateway action affordance').toBeGreaterThan(
      0,
    );
    for (let i = 0; i < count; i += 1) {
      const action = actions.nth(i);
      const tagName = await action.evaluate((node) => node.tagName);
      expect(tagName, `gateway action #${i} tagName`).toBe('BUTTON');
      const href = await action.getAttribute('href');
      expect(href, `gateway action #${i} must not declare href`).toBeNull();
      const nestedAnchors = await action.locator('a[href]').count();
      expect(nestedAnchors, `gateway action #${i} must not nest <a href>`).toBe(0);
    }
  });

  test('Recent Activity gateway is disabled with a visible reason via aria-describedby', async ({
    page,
  }) => {
    const po = new PccLivePageObject(page);
    await po.goto(env.pageUrl);
    await po.waitForPccRoot();
    const projectHome = PCC_LIVE_SURFACES.find((s) => s.id === 'project-home')!;
    await po.navigateToSurface(projectHome);
    await po.assertSurfaceActive(projectHome);
    const recentRow = page.locator('[data-pcc-card]', {
      has: page.getByRole('heading', { name: 'Recent Activity' }),
    });
    const gateway = recentRow.locator('[data-pcc-project-home-gateway-action]').first();
    await expect(gateway).toBeDisabled();
    const reasonId = await gateway.getAttribute('aria-describedby');
    expect(
      reasonId,
      'disabled Recent Activity gateway must reference a visible reason via aria-describedby',
    ).toBeTruthy();
    // React's useId() produces colon-bearing IDs (e.g. ":rr:") that break
    // CSS `#id` selectors. Use the attribute selector form instead.
    const reasonText = await page.locator(`[id="${reasonId}"]`).innerText();
    expect(
      reasonText.trim().length,
      'disabled Recent Activity reason text must be non-empty and visible',
    ).toBeGreaterThan(0);
  });
});
