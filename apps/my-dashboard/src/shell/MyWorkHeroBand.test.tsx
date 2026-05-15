import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import {
  MY_WORK_PAGE_HEADER_EYEBROW,
  MY_WORK_PAGE_HEADER_SUPPORT,
  MY_WORK_PAGE_HEADER_TITLE,
  MyWorkHeroBand,
} from './MyWorkHeroBand.js';

afterEach(() => {
  cleanup();
});

const RETIRED_TELEMETRY_AND_GOVERNANCE_PHRASES: readonly string[] = [
  'Actionable items',
  'Connected sources',
  'Source health',
  'Last refreshed',
  'Queue state',
  'Pending items',
  'Action system',
  'Read-only work visibility',
  'Queue visibility only',
  'Pending source connection',
];

describe('MyWorkHeroBand — locked compact header copy', () => {
  it('renders the locked eyebrow / title / support line content exactly', () => {
    const { container } = render(<MyWorkHeroBand mode="standardLaptop" />);
    expect(container.querySelector('[data-my-work-page-header-eyebrow]')?.textContent).toBe(
      'My Dashboard',
    );
    expect(container.querySelector('[data-my-work-page-header-title]')?.textContent).toBe(
      'My Work',
    );
    expect(container.querySelector('[data-my-work-page-header-support]')?.textContent).toBe(
      'Your personal launch pad for project access and work requiring attention.',
    );
  });

  it('exports the locked copy constants matching the rendered text', () => {
    expect(MY_WORK_PAGE_HEADER_EYEBROW).toBe('My Dashboard');
    expect(MY_WORK_PAGE_HEADER_TITLE).toBe('My Work');
    expect(MY_WORK_PAGE_HEADER_SUPPORT).toBe(
      'Your personal launch pad for project access and work requiring attention.',
    );
  });

  it('renders the new root marker and child markers (no envelope-derived slots)', () => {
    const { container } = render(<MyWorkHeroBand mode="standardLaptop" />);
    expect(container.querySelector('[data-my-work-page-header]')).not.toBeNull();
    expect(container.querySelectorAll('[data-my-work-page-header-eyebrow]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-my-work-page-header-title]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-my-work-page-header-support]')).toHaveLength(1);
  });

  it('does NOT emit any retired hero markers (clean marker migration)', () => {
    const { container } = render(<MyWorkHeroBand mode="standardLaptop" />);
    expect(container.querySelector('[data-my-work-hero]')).toBeNull();
    expect(container.querySelector('[data-my-work-hero-primary-title]')).toBeNull();
    expect(container.querySelector('[data-my-work-hero-secondary-title]')).toBeNull();
    expect(container.querySelector('[data-my-work-hero-description]')).toBeNull();
    expect(container.querySelector('[data-my-work-hero-highlight]')).toBeNull();
    expect(container.querySelector('[data-my-work-hero-governance-copy]')).toBeNull();
    expect(container.querySelector('[data-my-work-hero-density]')).toBeNull();
  });
});

describe('MyWorkHeroBand — locked-out content', () => {
  it('does not render PCC-style markers, project facts, command search, or tab seam', () => {
    const { container } = render(<MyWorkHeroBand mode="standardLaptop" />);
    const html = container.innerHTML;
    // No PCC-prefixed attributes anywhere in the header subtree.
    expect(html.includes('data-pcc-')).toBe(false);
    // No facts row, command-search slot, or tab seam (PCC- or page-header-prefixed,
    // including the retired hero-prefixed variants).
    expect(container.querySelector('[data-my-work-page-header-facts]')).toBeNull();
    expect(container.querySelector('[data-pcc-hero-facts]')).toBeNull();
    expect(container.querySelector('[data-my-work-page-header-command-search]')).toBeNull();
    expect(container.querySelector('[data-pcc-hero-command-search]')).toBeNull();
    expect(container.querySelector('[data-my-work-page-header-tab-seam]')).toBeNull();
    expect(container.querySelector('[data-my-work-hero-facts]')).toBeNull();
    expect(container.querySelector('[data-my-work-hero-command-search]')).toBeNull();
    expect(container.querySelector('[data-my-work-hero-tab-seam]')).toBeNull();
  });

  it('contains no developer-facing copy markers (TODO / mock / placeholder)', () => {
    const { container } = render(<MyWorkHeroBand mode="standardLaptop" />);
    const text = container.textContent ?? '';
    expect(/\bTODO\b/.test(text)).toBe(false);
    expect(/\bmock\b/i.test(text)).toBe(false);
    expect(/\bplaceholder\b/i.test(text)).toBe(false);
  });

  // Hardening per operator review: marker-absence catches a direct structural
  // regression but not a reintroduction of the same telemetry / governance
  // message layer under different markup. Asserting on the rendered header's
  // textContent prevents the retired phrases from sneaking back in.
  it.each(RETIRED_TELEMETRY_AND_GOVERNANCE_PHRASES)(
    'does not render the retired telemetry / governance phrase "%s"',
    (phrase) => {
      const { container } = render(<MyWorkHeroBand mode="standardLaptop" />);
      const headerText = container.querySelector('[data-my-work-page-header]')?.textContent ?? '';
      expect(headerText).not.toContain(phrase);
    },
  );
});

describe('MyWorkHeroBand — density', () => {
  it('flips density to "compact" for phone mode', () => {
    const { container } = render(<MyWorkHeroBand mode="phone" />);
    const header = container.querySelector('[data-my-work-page-header]');
    expect(header?.getAttribute('data-my-work-page-header-density')).toBe('compact');
    expect(header?.getAttribute('data-my-work-mode')).toBe('phone');
  });

  it('keeps density "comfortable" for standardLaptop mode', () => {
    const { container } = render(<MyWorkHeroBand mode="standardLaptop" />);
    const header = container.querySelector('[data-my-work-page-header]');
    expect(header?.getAttribute('data-my-work-page-header-density')).toBe('comfortable');
  });
});

describe('MyWorkHeroBand — accessibility', () => {
  it('uses role="region" and a default aria-label, overridable via prop', () => {
    const { container, rerender } = render(<MyWorkHeroBand mode="standardLaptop" />);
    const header = container.querySelector('[data-my-work-page-header]')!;
    expect(header.getAttribute('role')).toBe('region');
    expect(header.getAttribute('aria-label')).toBe('My Work page header');

    rerender(<MyWorkHeroBand mode="standardLaptop" ariaLabel="Custom page header label" />);
    const reHeader = container.querySelector('[data-my-work-page-header]')!;
    expect(reHeader.getAttribute('aria-label')).toBe('Custom page header label');
  });
});
