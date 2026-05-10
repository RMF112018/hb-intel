import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { PCC_PRIMARY_TAB_IDS } from '@hbc/models/pcc';
import { PccApp } from '../PccApp';
import { getPrimaryNavToggle, getPrimaryTabSelectionControl } from './shellSurfaceSelection';

// Phase 05 wave-b10 Prompt 07 — cross-cutting a11y / no-routing /
// no-sidebar regression coverage. Component-level coverage lives in
// PccHorizontalTabs.test.tsx; per-primary-tab axis coverage lives in
// PccShell.navigation.test.tsx and PccShell.invariants.test.tsx.
// This file locks the integration-level guarantees that span hero +
// active panel + opened module menu under a single PccApp render.

afterEach(() => {
  cleanup();
});

const FORBIDDEN_DEVELOPER_TERMS: readonly string[] = [
  'todo',
  'tbd',
  'placeholder',
  'stub',
  'mock',
  'fixture',
  'debug',
  'dev-only',
  'not implemented',
  'lorem',
  'developer',
  'code agent',
  'prompt',
  'repo',
  'test selector',
  'internal only',
];

const escapeRegex = (input: string): string => input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const FORBIDDEN_NAV_ALTERNATIVE_SELECTORS: readonly string[] = [
  '[data-pcc-sidebar]',
  '[data-pcc-navigation-sidebar]',
  '[data-pcc-module-launcher]',
  '[data-pcc-module-drawer]',
  '[data-pcc-side-rail]',
  '[aria-label="Module Launcher"]',
  '[aria-label="PCC sidebar"]',
];

describe('Phase 05 a11y regression — no persistent navigation alternative markers', () => {
  it('PccApp renders zero sidebar / drawer / module-launcher / side-rail markers across every primary tab click', () => {
    const { container } = render(<PccApp forceMode="standardLaptop" />);
    for (const selector of FORBIDDEN_NAV_ALTERNATIVE_SELECTORS) {
      expect(
        container.querySelectorAll(selector),
        `default render must not contain "${selector}"`,
      ).toHaveLength(0);
    }
    for (const tabId of PCC_PRIMARY_TAB_IDS) {
      const tab = getPrimaryTabSelectionControl(container, tabId);
      expect(tab, `primary tab ${tabId} should render`).not.toBeNull();
      fireEvent.click(tab!);
      for (const selector of FORBIDDEN_NAV_ALTERNATIVE_SELECTORS) {
        expect(
          container.querySelectorAll(selector),
          `after clicking ${tabId}, render must not contain "${selector}"`,
        ).toHaveLength(0);
      }
    }
  });
});

describe('Phase 05 a11y regression — no anchors in primary-tab/dropdown navigation', () => {
  it('zero <a> elements render inside [data-pcc-horizontal-tabs] in either default or any-menu-open state', () => {
    const { container } = render(<PccApp forceMode="standardLaptop" />);
    expect(
      container.querySelectorAll('[data-pcc-horizontal-tabs] a'),
      'default render must contain zero anchors inside the horizontal tabs',
    ).toHaveLength(0);

    for (const tabId of PCC_PRIMARY_TAB_IDS) {
      const toggle = getPrimaryNavToggle(container, tabId);
      expect(toggle, `dropdown toggle for ${tabId} should render`).not.toBeNull();
      fireEvent.click(toggle!);
      expect(
        container.querySelectorAll('[data-pcc-horizontal-tabs] a'),
        `with ${tabId} dropdown open, [data-pcc-horizontal-tabs] must contain zero <a> elements`,
      ).toHaveLength(0);
      // Close before next iteration so only one menu is open at a time.
      fireEvent.click(toggle!);
    }
  });
});

describe('Phase 05 a11y regression — no forbidden developer-facing copy in rendered hero + active panel + opened module menu', () => {
  // Per `feedback_word_blocklists_break_on_corrected_copy`, this scan
  // is scoped to rendered textContent of the three integration scopes
  // (hero band, active <main role="tabpanel">, opened module menu) — it
  // does NOT scan source, comments, data-* attributes, or aria-* values.
  // Unlike the metadata-level scan in projectShellViewModel.test.ts
  // (which legitimately allows 'fixture' / 'mock' as the Project Home
  // source posture label), this guard asserts that none of those terms
  // are user-visible end-user copy in product DOM at any time.
  it('every primary tab renders no forbidden developer-facing terms in hero + active panel + opened menu', () => {
    for (const tabId of PCC_PRIMARY_TAB_IDS) {
      const { container, unmount } = render(<PccApp forceMode="standardLaptop" />);
      const tab = getPrimaryTabSelectionControl(container, tabId);
      fireEvent.click(tab!);
      const toggle = getPrimaryNavToggle(container, tabId);
      fireEvent.click(toggle!);

      const hero = container.querySelector('[data-pcc-project-hero-band]');
      const main = container.querySelector('main[role="tabpanel"]');
      const menu = container.querySelector(
        `[data-pcc-horizontal-tabs] [data-pcc-module-menu="${tabId}"]`,
      );
      expect(hero, `hero band must render for ${tabId}`).not.toBeNull();
      expect(main, `active panel must render for ${tabId}`).not.toBeNull();
      expect(menu, `dropdown menu must mount for ${tabId}`).not.toBeNull();

      const text = [hero?.textContent ?? '', main?.textContent ?? '', menu?.textContent ?? '']
        .join(' ')
        .replace(/\s+/g, ' ')
        .toLowerCase();

      for (const term of FORBIDDEN_DEVELOPER_TERMS) {
        const re = new RegExp(`\\b${escapeRegex(term)}\\b`, 'i');
        expect(
          re.test(text),
          `primary tab '${tabId}' rendered hero + main + menu text must not contain forbidden developer term '${term}'`,
        ).toBe(false);
      }

      unmount();
      cleanup();
    }
  });
});
