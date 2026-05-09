/**
 * Wave-b2 Prompt 03 — surface-context-de-duplication invariants.
 *
 * Two structural invariants that prevent regressions of the shell-vs-surface
 * boundary established by the wave-b2 add-on:
 *
 *   (a) Shell hero markers do not leak into any surface panel. The shell
 *       hero band carries project / surface identity once at the shell
 *       level; a surface must never re-render the same hero markers inside
 *       its `[data-pcc-active-surface-panel]`.
 *   (b) Team & Access first view is never empty: across every supported
 *       persona / project-site-access branch, the active panel always
 *       contains at least one structural primitive (a dashboard card body)
 *       with non-empty visible text.
 *
 * Both invariants use marker names from current `PccProjectHeroBand.tsx`
 * repo truth. Assertions are structural, not aesthetic.
 */

import { describe, it, expect } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { PCC_MVP_SURFACE_IDS, PCC_MVP_SURFACES, type PccPersona } from '@hbc/models/pcc';
import { PccApp } from '../PccApp';
import { PccBentoGrid } from '../layout/PccBentoGrid';
import { PccTeamAccessSurface } from '../surfaces/teamAccess/PccTeamAccessSurface';
import { getSurfaceSelectionControl } from './shellSurfaceSelection';

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

describe("Shell-hero-doesn't-leak-into-surface-panel invariant (wave-b2 Prompt 03)", () => {
  for (const surfaceId of PCC_MVP_SURFACE_IDS) {
    it(`'${surfaceId}' panel does not contain any shell-owned hero marker`, () => {
      const { container } = render(<PccApp forceMode="standardLaptop" />);
      const tab = getSurfaceSelectionControl(container, surfaceId);
      expect(tab).not.toBeNull();
      fireEvent.click(tab!);

      const panel = container.querySelector('[data-pcc-active-surface-panel]');
      expect(panel, `active surface panel must render for '${surfaceId}'`).not.toBeNull();
      expect(panel!.getAttribute('data-pcc-active-surface-panel')).toBe(surfaceId);

      for (const marker of SHELL_HERO_MARKERS) {
        const leaked = panel!.querySelector(marker);
        expect(
          leaked,
          `shell hero marker '${marker}' must not render inside the '${surfaceId}' panel`,
        ).toBeNull();
      }
    });
  }
});

describe('Team & Access first-view non-empty invariant (wave-b2 Prompt 03)', () => {
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

      // Primary structural assertion: at least one PccDashboardCard renders.
      const cards = container.querySelectorAll('[data-pcc-card]');
      expect(
        cards.length,
        `Team & Access (${branch.label}) must render at least one [data-pcc-card]`,
      ).toBeGreaterThan(0);

      // Secondary structural assertion: at least one rendered card carries
      // visible text (guards against an empty wrapper element passing the
      // structural check).
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
 * Wave-b2 Prompt 05 — External Platforms taxonomy and active tab / hero /
 * panel label-consistency invariants. Locks the External Platforms / Launch
 * Pad copy landed by Prompts 03A + 04 and the per-surface aria-labelledby
 * update wired by Prompt 04, scoped across every one of the eight surfaces.
 */
describe('External Platforms taxonomy and active tab/hero/panel consistency (wave-b2 Prompt 05)', () => {
  for (const surfaceId of PCC_MVP_SURFACE_IDS) {
    it(`'${surfaceId}': active tab, hero secondary title, panel marker, and aria-labelledby agree after click`, () => {
      const { container } = render(<PccApp forceMode="standardLaptop" />);
      const tab = getSurfaceSelectionControl(container, surfaceId);
      expect(tab, `tab for '${surfaceId}' should render`).not.toBeNull();
      fireEvent.click(tab!);

      const expectedDisplayName = PCC_MVP_SURFACES[surfaceId].displayName;

      // Tab labels in PccHorizontalTabs are intentionally shorter than
      // displayName for some surfaces (for example 'Team' for
      // 'Team & Access'); hero carries the canonical full displayName.
      expect(tab!.textContent?.trim().length ?? 0).toBeGreaterThan(0);

      // Hero secondary title is the canonical full display name.
      const heroSecondary = container.querySelector('[data-pcc-hero-secondary-title]');
      expect(heroSecondary?.textContent ?? '').toContain(expectedDisplayName);

      // Active panel marker matches the active surface id.
      const panel = container.querySelector('[data-pcc-active-surface-panel]');
      expect(panel?.getAttribute('data-pcc-active-surface-panel')).toBe(surfaceId);

      // <main data-pcc-canvas> aria-labelledby points at this tab's id.
      const main = container.querySelector('[data-pcc-canvas]');
      expect(main?.getAttribute('aria-labelledby')).toBe(`pcc-tab-${surfaceId}`);
    });
  }

  it('no tab text equals "Apps" or contains a standalone "Systems" product token', () => {
    const { container } = render(<PccApp forceMode="standardLaptop" />);
    const tabs = [
      container.querySelector('[data-pcc-tab-id="project-home"]'),
      container.querySelector('[data-pcc-tab-id="documents"]'),
      container.querySelector('[data-pcc-tab-id="project-readiness"]'),
      container.querySelector('[data-pcc-tab-id="approvals"]'),
    ];
    expect(tabs.filter(Boolean).length).toBe(4);
    for (const tab of tabs) {
      expect(tab).not.toBeNull();
      const text = (tab.textContent ?? '').trim();
      expect(text, `tab '${tab.getAttribute('data-pcc-tab-id')}' must not equal 'Apps'`).not.toBe(
        'Apps',
      );
      expect(
        /\bSystems\b/.test(text),
        `tab '${tab.getAttribute('data-pcc-tab-id')}' text '${text}' must not contain a standalone 'Systems' product token`,
      ).toBe(false);
    }
  });

  it('External Platforms active panel renders the surface displayName via shell hero (Wave 15A wave-b9 Prompt 04 — Launch Pad header card removed)', () => {
    const { container } = render(<PccApp forceMode="standardLaptop" />);
    const tab = getSurfaceSelectionControl(container, 'external-systems');
    expect(tab).not.toBeNull();
    fireEvent.click(tab!);

    // Wave 15A wave-b9 Prompt 04 — `PccExternalSystemsLaunchPadHeaderCard`
    // (which composed eyebrow="External Platforms" + title="Launch Pad")
    // was removed; External Systems is uniformly shell-only across all
    // branches. The shell hero (rendered as a sibling of <main>, not
    // inside it) carries the displayName as its secondary title; the
    // "Launch Pad" page-title coupling is intentionally dropped because
    // it lived only on the doomed header card.
    const shellPanel = container.querySelector(
      'main[role="tabpanel"][data-pcc-active-surface-panel="external-systems"]',
    );
    expect(shellPanel).not.toBeNull();
    expect(container.textContent ?? '').toContain('External Platforms');
  });
});
