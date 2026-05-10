/**
 * Phase 05 wave-b10 Prompt 04 — surface-context-de-duplication invariants.
 *
 * Two structural invariants that prevent regressions of the shell-vs-surface
 * boundary:
 *
 *   (a) Shell hero markers do not leak into any active primary-tab panel.
 *       The shell hero band carries project / surface identity once at
 *       the shell level; a primary-tab dashboard must never re-render
 *       the same hero markers inside its `[data-pcc-active-surface-panel]`.
 *   (b) Team & Access first view is never empty when rendered directly
 *       inside `<PccBentoGrid>` across every supported persona /
 *       project-site-access branch (the legacy surface remains
 *       reachable via the Core Tools `team-access` module dropdown
 *       under Phase 05; the structural invariant lives on the surface
 *       component itself, exercised here in isolation).
 *
 * Both invariants use marker names from current `PccProjectHeroBand.tsx`
 * repo truth. Assertions are structural, not aesthetic.
 */

import { describe, it, expect } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { PCC_PRIMARY_TAB_IDS, type PccPersona } from '@hbc/models/pcc';
import { PccApp } from '../PccApp';
import { PccBentoGrid } from '../layout/PccBentoGrid';
import { PccTeamAccessSurface } from '../surfaces/teamAccess/PccTeamAccessSurface';
import { getPrimaryTabSelectionControl } from './shellSurfaceSelection';

// Shell-owned hero markers per current PccProjectHeroBand.tsx. If any of
// these are renamed, follow repo truth and update this list.
const SHELL_HERO_MARKERS = [
  '[data-pcc-project-hero-band]',
  '[data-pcc-hero-surface]',
  '[data-pcc-hero-primary-title]',
  '[data-pcc-hero-secondary-title]',
  '[data-pcc-hero-surface-description]',
  '[data-pcc-hero-facts]',
  '[data-pcc-hero-fact-location]',
  '[data-pcc-hero-fact-estimated-value]',
  '[data-pcc-hero-fact-scheduled-completion]',
  '[data-pcc-hero-fact-project-stage]',
  '[data-pcc-hero-tab-seam]',
  '[data-pcc-hero-command-search]',
] as const;

describe("Shell-hero-doesn't-leak-into-active-panel invariant (Phase 05 wave-b10 Prompt 04)", () => {
  for (const tabId of PCC_PRIMARY_TAB_IDS) {
    it(`'${tabId}' panel does not contain any shell-owned hero marker`, () => {
      const { container } = render(<PccApp forceMode="standardLaptop" />);
      const tab = getPrimaryTabSelectionControl(container, tabId);
      expect(tab, `primary tab '${tabId}' should render`).not.toBeNull();
      fireEvent.click(tab!);

      const panel = container.querySelector('[data-pcc-active-surface-panel]');
      expect(panel, `active surface panel must render for '${tabId}'`).not.toBeNull();
      expect(panel!.getAttribute('data-pcc-active-surface-panel')).toBe(tabId);

      for (const marker of SHELL_HERO_MARKERS) {
        const leaked = panel!.querySelector(marker);
        expect(
          leaked,
          `shell hero marker '${marker}' must not render inside the '${tabId}' panel`,
        ).toBeNull();
      }
    });
  }
});

describe('Team & Access first-view non-empty invariant (rendered in isolation under Phase 05)', () => {
  // Each branch: persona + project-site-access flag. Cover all three observable
  // branches the surface owns: access-manager, non-manager-with-access,
  // non-manager-without-access.
  const branches: ReadonlyArray<{
    readonly label: string;
    readonly persona: PccPersona;
    readonly hasProjectSiteAccess: boolean;
  }> = [
    {
      label: 'access-manager',
      persona: 'pcc-admin',
      hasProjectSiteAccess: true,
    },
    {
      label: 'non-manager with project-site access',
      persona: 'project-manager',
      hasProjectSiteAccess: true,
    },
    {
      label: 'non-manager without project-site access',
      persona: 'project-manager',
      hasProjectSiteAccess: false,
    },
  ];

  for (const branch of branches) {
    it(`renders ≥1 structural card with non-empty text for '${branch.label}'`, () => {
      const { container } = render(
        <PccBentoGrid forceMode="desktop">
          <PccTeamAccessSurface
            previewPersona={branch.persona}
            previewHasProjectSiteAccess={branch.hasProjectSiteAccess}
          />
        </PccBentoGrid>,
      );

      const cards = container.querySelectorAll('[data-pcc-card]');
      expect(
        cards.length,
        `Team & Access (${branch.label}) must render at least one [data-pcc-card]`,
      ).toBeGreaterThan(0);

      const anyCardHasText = Array.from(cards).some(
        (card) => (card.textContent?.trim().length ?? 0) > 0,
      );
      expect(
        anyCardHasText,
        `Team & Access (${branch.label}) must render visible text in at least one card`,
      ).toBe(true);
    });
  }
});

/**
 * Phase 05 wave-b10 Prompt 04 — active tab / panel marker / aria-labelledby
 * consistency invariant, scoped to the eight primary tabs. Hero migration
 * to the Phase 05 axis is Prompt 06 territory; this invariant only locks
 * the tab + panel + label triple, not the hero secondary title.
 */
describe('Active primary tab + panel marker + aria-labelledby consistency (Phase 05 wave-b10 Prompt 04)', () => {
  for (const tabId of PCC_PRIMARY_TAB_IDS) {
    it(`'${tabId}': active tab, panel marker, and aria-labelledby agree after click`, () => {
      const { container } = render(<PccApp forceMode="standardLaptop" />);
      const tab = getPrimaryTabSelectionControl(container, tabId);
      expect(tab, `primary tab for '${tabId}' should render`).not.toBeNull();
      fireEvent.click(tab!);

      expect(tab!.textContent?.trim().length ?? 0).toBeGreaterThan(0);

      const panel = container.querySelector('[data-pcc-active-surface-panel]');
      expect(panel?.getAttribute('data-pcc-active-surface-panel')).toBe(tabId);

      const main = container.querySelector('[data-pcc-canvas]');
      expect(main?.getAttribute('aria-labelledby')).toBe(`pcc-tab-${tabId}`);
    });
  }

  it('no primary tab text equals "Apps" or contains a standalone "Systems" product token by itself', () => {
    const { container } = render(<PccApp forceMode="standardLaptop" />);
    const tabs = Array.from(container.querySelectorAll('[data-pcc-horizontal-tabs] [role="tab"]'));
    expect(tabs.length).toBe(PCC_PRIMARY_TAB_IDS.length);
    for (const tab of tabs) {
      const text = (tab.textContent ?? '').trim();
      expect(text, `tab '${tab.getAttribute('data-pcc-tab-id')}' must not equal 'Apps'`).not.toBe(
        'Apps',
      );
      // Phase 05 'Systems Administration' is allowed; a bare 'Systems'
      // token alone is not.
      expect(
        text,
        `tab '${tab.getAttribute('data-pcc-tab-id')}' must not be the bare 'Systems' token`,
      ).not.toBe('Systems');
    }
  });
});
