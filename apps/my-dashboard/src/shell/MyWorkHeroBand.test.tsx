import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { MyWorkHeroBand } from './MyWorkHeroBand.js';
import {
  MY_WORK_FOCUSED_ADOBE_HERO_PREVIEW_VIEW_MODEL,
  MY_WORK_HOME_HERO_PREVIEW_VIEW_MODEL,
} from '../preview/myWorkHeroPreview.js';

afterEach(() => {
  cleanup();
});

const HOME_DESCRIPTION =
  'Your personal command surface for work requiring attention across connected HB systems.';
const FOCUSED_DESCRIPTION =
  'Agreements in Adobe Sign that require your review, signature, approval, or other source-defined action.';
const HOME_GOVERNANCE =
  'Read-only work visibility · Source actions remain in their governing systems.';
const FOCUSED_GOVERNANCE = 'Queue visibility only · Agreement actions remain in Adobe Sign.';

describe('MyWorkHeroBand — home view model', () => {
  it('renders all six required data attributes for the home state', () => {
    const { container } = render(
      <MyWorkHeroBand mode="standardLaptop" viewModel={MY_WORK_HOME_HERO_PREVIEW_VIEW_MODEL} />,
    );
    expect(container.querySelector('[data-my-work-hero]')).not.toBeNull();
    expect(container.querySelectorAll('[data-my-work-hero-primary-title]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-my-work-hero-secondary-title]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-my-work-hero-description]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-my-work-hero-highlight]')).toHaveLength(4);
    expect(container.querySelectorAll('[data-my-work-hero-governance-copy]')).toHaveLength(1);
  });

  it('renders the exact home identity copy', () => {
    const { container } = render(
      <MyWorkHeroBand mode="standardLaptop" viewModel={MY_WORK_HOME_HERO_PREVIEW_VIEW_MODEL} />,
    );
    expect(container.querySelector('[data-my-work-hero-primary-title]')?.textContent).toBe(
      'My Dashboard',
    );
    expect(container.querySelector('[data-my-work-hero-secondary-title]')?.textContent).toBe(
      'My Work',
    );
    expect(container.querySelector('[data-my-work-hero-description]')?.textContent).toBe(
      HOME_DESCRIPTION,
    );
  });

  it('renders the four home highlight slots in order with locked labels', () => {
    const { container } = render(
      <MyWorkHeroBand mode="standardLaptop" viewModel={MY_WORK_HOME_HERO_PREVIEW_VIEW_MODEL} />,
    );
    const highlights = Array.from(container.querySelectorAll('[data-my-work-hero-highlight]'));
    expect(highlights.map((h) => h.getAttribute('data-my-work-hero-highlight'))).toEqual([
      'actionable-items',
      'connected-sources',
      'source-health',
      'last-refreshed',
    ]);
    expect(highlights.map((h) => h.children[0].textContent)).toEqual([
      'Actionable items',
      'Connected sources',
      'Source health',
      'Last refreshed',
    ]);
  });

  it('sources Connected sources value from the @hbc/models/myWork registry (Adobe Sign)', () => {
    const { container } = render(
      <MyWorkHeroBand mode="standardLaptop" viewModel={MY_WORK_HOME_HERO_PREVIEW_VIEW_MODEL} />,
    );
    const connected = container.querySelector(
      '[data-my-work-hero-highlight="connected-sources"]',
    );
    expect(connected?.children[1].textContent).toBe('Adobe Sign');
  });

  it('renders the home governance microcopy verbatim', () => {
    const { container } = render(
      <MyWorkHeroBand mode="standardLaptop" viewModel={MY_WORK_HOME_HERO_PREVIEW_VIEW_MODEL} />,
    );
    const items = container.querySelectorAll('[data-my-work-hero-governance-copy]');
    expect(items).toHaveLength(1);
    expect(items[0].getAttribute('data-my-work-hero-governance-copy')).toBe('home-read-only');
    expect(items[0].textContent).toBe(HOME_GOVERNANCE);
  });
});

describe('MyWorkHeroBand — focused Adobe view model', () => {
  it('renders the exact focused Adobe identity copy', () => {
    const { container } = render(
      <MyWorkHeroBand
        mode="standardLaptop"
        viewModel={MY_WORK_FOCUSED_ADOBE_HERO_PREVIEW_VIEW_MODEL}
      />,
    );
    expect(container.querySelector('[data-my-work-hero-primary-title]')?.textContent).toBe(
      'My Dashboard',
    );
    expect(container.querySelector('[data-my-work-hero-secondary-title]')?.textContent).toBe(
      'Adobe Sign Action Queue',
    );
    expect(container.querySelector('[data-my-work-hero-description]')?.textContent).toBe(
      FOCUSED_DESCRIPTION,
    );
  });

  it('renders the four focused Adobe highlight slots in order with locked labels', () => {
    const { container } = render(
      <MyWorkHeroBand
        mode="standardLaptop"
        viewModel={MY_WORK_FOCUSED_ADOBE_HERO_PREVIEW_VIEW_MODEL}
      />,
    );
    const highlights = Array.from(container.querySelectorAll('[data-my-work-hero-highlight]'));
    expect(highlights.map((h) => h.getAttribute('data-my-work-hero-highlight'))).toEqual([
      'queue-state',
      'pending-items',
      'last-refreshed',
      'action-system',
    ]);
    expect(highlights.map((h) => h.children[0].textContent)).toEqual([
      'Queue state',
      'Pending items',
      'Last refreshed',
      'Action system',
    ]);
  });

  it('sources Action system value from the @hbc/models/myWork registry (Adobe Sign)', () => {
    const { container } = render(
      <MyWorkHeroBand
        mode="standardLaptop"
        viewModel={MY_WORK_FOCUSED_ADOBE_HERO_PREVIEW_VIEW_MODEL}
      />,
    );
    const action = container.querySelector('[data-my-work-hero-highlight="action-system"]');
    expect(action?.children[1].textContent).toBe('Adobe Sign');
  });

  it('renders the focused Adobe governance microcopy verbatim', () => {
    const { container } = render(
      <MyWorkHeroBand
        mode="standardLaptop"
        viewModel={MY_WORK_FOCUSED_ADOBE_HERO_PREVIEW_VIEW_MODEL}
      />,
    );
    const items = container.querySelectorAll('[data-my-work-hero-governance-copy]');
    expect(items).toHaveLength(1);
    expect(items[0].getAttribute('data-my-work-hero-governance-copy')).toBe(
      'focused-queue-visibility',
    );
    expect(items[0].textContent).toBe(FOCUSED_GOVERNANCE);
  });
});

describe('MyWorkHeroBand — locked-out content', () => {
  it('does not render PCC-style markers, project facts, command search, or tab seam', () => {
    const { container } = render(
      <MyWorkHeroBand mode="standardLaptop" viewModel={MY_WORK_HOME_HERO_PREVIEW_VIEW_MODEL} />,
    );
    const html = container.innerHTML;
    // No PCC-prefixed attributes anywhere in the hero subtree.
    expect(html.includes('data-pcc-')).toBe(false);
    // No facts row, command-search slot, or tab seam (PCC or My Work-prefixed).
    expect(container.querySelector('[data-my-work-hero-facts]')).toBeNull();
    expect(container.querySelector('[data-pcc-hero-facts]')).toBeNull();
    expect(container.querySelector('[data-my-work-hero-command-search]')).toBeNull();
    expect(container.querySelector('[data-pcc-hero-command-search]')).toBeNull();
    expect(container.querySelector('[data-my-work-hero-tab-seam]')).toBeNull();
  });

  it('contains no developer-facing copy markers (TODO / mock / placeholder)', () => {
    const { container } = render(
      <MyWorkHeroBand
        mode="standardLaptop"
        viewModel={MY_WORK_FOCUSED_ADOBE_HERO_PREVIEW_VIEW_MODEL}
      />,
    );
    const text = container.textContent ?? '';
    expect(/\bTODO\b/.test(text)).toBe(false);
    expect(/\bmock\b/i.test(text)).toBe(false);
    expect(/\bplaceholder\b/i.test(text)).toBe(false);
  });
});

describe('MyWorkHeroBand — density', () => {
  it('flips density to "compact" for phone mode', () => {
    const { container } = render(
      <MyWorkHeroBand mode="phone" viewModel={MY_WORK_HOME_HERO_PREVIEW_VIEW_MODEL} />,
    );
    const hero = container.querySelector('[data-my-work-hero]');
    expect(hero?.getAttribute('data-my-work-hero-density')).toBe('compact');
    expect(hero?.getAttribute('data-my-work-mode')).toBe('phone');
  });

  it('keeps density "comfortable" for standardLaptop mode', () => {
    const { container } = render(
      <MyWorkHeroBand mode="standardLaptop" viewModel={MY_WORK_HOME_HERO_PREVIEW_VIEW_MODEL} />,
    );
    const hero = container.querySelector('[data-my-work-hero]');
    expect(hero?.getAttribute('data-my-work-hero-density')).toBe('comfortable');
  });
});

describe('MyWorkHeroBand — accessibility', () => {
  it('uses role="region" and a default aria-label, overridable via prop', () => {
    const { container, rerender } = render(
      <MyWorkHeroBand mode="standardLaptop" viewModel={MY_WORK_HOME_HERO_PREVIEW_VIEW_MODEL} />,
    );
    const hero = container.querySelector('[data-my-work-hero]')!;
    expect(hero.getAttribute('role')).toBe('region');
    expect(hero.getAttribute('aria-label')).toBe('My Work hero band');

    rerender(
      <MyWorkHeroBand
        mode="standardLaptop"
        viewModel={MY_WORK_HOME_HERO_PREVIEW_VIEW_MODEL}
        ariaLabel="Custom hero label"
      />,
    );
    const reHero = container.querySelector('[data-my-work-hero]')!;
    expect(reHero.getAttribute('aria-label')).toBe('Custom hero label');
  });
});
