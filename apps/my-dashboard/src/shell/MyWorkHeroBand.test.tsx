import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { MY_WORK_PAGE_HEADER_SUPPORT, MyWorkHeroBand } from './MyWorkHeroBand.js';

afterEach(() => {
  cleanup();
});

const BOBBY_IDENTITY = {
  displayName: 'Bobby Fetting',
  email: 'bfetting@example.com',
};

function dateAt(hour: number, minute = 0): Date {
  const d = new Date(2026, 4, 15, hour, minute, 0, 0);
  return d;
}

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

const RETIRED_STATIC_IDENTITY_PHRASES: readonly string[] = ['My Dashboard', 'My Work'];

describe('MyWorkHeroBand — personalized greeting copy', () => {
  it('renders the morning greeting for an identity with displayName', () => {
    const { container } = render(
      <MyWorkHeroBand mode="standardLaptop" identity={BOBBY_IDENTITY} now={dateAt(9)} />,
    );
    expect(container.querySelector('[data-my-work-page-header-greeting]')?.textContent).toBe(
      'Good morning, Bobby.',
    );
  });

  it('renders the afternoon greeting at 13:00', () => {
    const { container } = render(
      <MyWorkHeroBand mode="standardLaptop" identity={BOBBY_IDENTITY} now={dateAt(13)} />,
    );
    expect(container.querySelector('[data-my-work-page-header-greeting]')?.textContent).toBe(
      'Good afternoon, Bobby.',
    );
  });

  it('renders the evening greeting at 18:00', () => {
    const { container } = render(
      <MyWorkHeroBand mode="standardLaptop" identity={BOBBY_IDENTITY} now={dateAt(18)} />,
    );
    expect(container.querySelector('[data-my-work-page-header-greeting]')?.textContent).toBe(
      'Good evening, Bobby.',
    );
  });

  it('treats 03:00 as morning (lower boundary)', () => {
    const { container } = render(
      <MyWorkHeroBand mode="standardLaptop" identity={BOBBY_IDENTITY} now={dateAt(3, 0)} />,
    );
    expect(container.querySelector('[data-my-work-page-header-greeting]')?.textContent).toBe(
      'Good morning, Bobby.',
    );
  });

  it('treats 17:01 as evening (upper boundary)', () => {
    const { container } = render(
      <MyWorkHeroBand mode="standardLaptop" identity={BOBBY_IDENTITY} now={dateAt(17, 1)} />,
    );
    expect(container.querySelector('[data-my-work-page-header-greeting]')?.textContent).toBe(
      'Good evening, Bobby.',
    );
  });

  it('falls back to "there" when no identity is provided', () => {
    const { container } = render(<MyWorkHeroBand mode="standardLaptop" now={dateAt(9)} />);
    expect(container.querySelector('[data-my-work-page-header-greeting]')?.textContent).toBe(
      'Good morning, there.',
    );
  });

  it('uses email local-part first token when display name is absent', () => {
    const { container } = render(
      <MyWorkHeroBand
        mode="standardLaptop"
        identity={{ email: 'taylor.hale@hb.com' }}
        now={dateAt(13)}
      />,
    );
    expect(container.querySelector('[data-my-work-page-header-greeting]')?.textContent).toBe(
      'Good afternoon, taylor.',
    );
  });

  it('renders the locked support sentence verbatim alongside the greeting', () => {
    const { container } = render(
      <MyWorkHeroBand mode="standardLaptop" identity={BOBBY_IDENTITY} now={dateAt(9)} />,
    );
    expect(container.querySelector('[data-my-work-page-header-support]')?.textContent).toBe(
      'Your personal launch pad for project access and work requiring attention.',
    );
    expect(MY_WORK_PAGE_HEADER_SUPPORT).toBe(
      'Your personal launch pad for project access and work requiring attention.',
    );
  });
});

describe('MyWorkHeroBand — marker contract', () => {
  it('renders root + density + greeting + support markers (no eyebrow / no static title)', () => {
    const { container } = render(
      <MyWorkHeroBand mode="standardLaptop" identity={BOBBY_IDENTITY} now={dateAt(9)} />,
    );
    expect(container.querySelectorAll('[data-my-work-page-header]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-my-work-page-header-greeting]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-my-work-page-header-support]')).toHaveLength(1);
    const header = container.querySelector('[data-my-work-page-header]') as HTMLElement;
    expect(header.getAttribute('data-my-work-page-header-density')).toBe('comfortable');
    // The retired Prompt 02 static-identity markers must be absent.
    expect(container.querySelector('[data-my-work-page-header-eyebrow]')).toBeNull();
    expect(container.querySelector('[data-my-work-page-header-title]')).toBeNull();
  });

  it('does NOT emit any retired hero markers (clean marker migration)', () => {
    const { container } = render(
      <MyWorkHeroBand mode="standardLaptop" identity={BOBBY_IDENTITY} now={dateAt(9)} />,
    );
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
    const { container } = render(
      <MyWorkHeroBand mode="standardLaptop" identity={BOBBY_IDENTITY} now={dateAt(9)} />,
    );
    const html = container.innerHTML;
    expect(html.includes('data-pcc-')).toBe(false);
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
    const { container } = render(
      <MyWorkHeroBand mode="standardLaptop" identity={BOBBY_IDENTITY} now={dateAt(9)} />,
    );
    const text = container.textContent ?? '';
    expect(/\bTODO\b/.test(text)).toBe(false);
    expect(/\bmock\b/i.test(text)).toBe(false);
    expect(/\bplaceholder\b/i.test(text)).toBe(false);
  });

  // Hardening: marker-absence catches direct structural regressions but not a
  // reintroduction of the same telemetry / governance / module-identity message
  // layer under different markup. Anchor on the header's visible textContent so
  // the assertions cover only what users see (not aria-label attribute values).
  it.each(RETIRED_TELEMETRY_AND_GOVERNANCE_PHRASES)(
    'does not render the retired telemetry / governance phrase "%s"',
    (phrase) => {
      const { container } = render(
        <MyWorkHeroBand mode="standardLaptop" identity={BOBBY_IDENTITY} now={dateAt(9)} />,
      );
      const headerText = container.querySelector('[data-my-work-page-header]')?.textContent ?? '';
      expect(headerText).not.toContain(phrase);
    },
  );

  it.each(RETIRED_STATIC_IDENTITY_PHRASES)(
    'does not render the retired static-identity phrase "%s" inside the header text',
    (phrase) => {
      const { container } = render(
        <MyWorkHeroBand mode="standardLaptop" identity={BOBBY_IDENTITY} now={dateAt(9)} />,
      );
      const headerText = container.querySelector('[data-my-work-page-header]')?.textContent ?? '';
      expect(headerText).not.toContain(phrase);
    },
  );
});

describe('MyWorkHeroBand — density', () => {
  it('flips density to "compact" for phone mode', () => {
    const { container } = render(
      <MyWorkHeroBand mode="phone" identity={BOBBY_IDENTITY} now={dateAt(9)} />,
    );
    const header = container.querySelector('[data-my-work-page-header]');
    expect(header?.getAttribute('data-my-work-page-header-density')).toBe('compact');
    expect(header?.getAttribute('data-my-work-mode')).toBe('phone');
  });

  it('keeps density "comfortable" for standardLaptop mode', () => {
    const { container } = render(
      <MyWorkHeroBand mode="standardLaptop" identity={BOBBY_IDENTITY} now={dateAt(9)} />,
    );
    const header = container.querySelector('[data-my-work-page-header]');
    expect(header?.getAttribute('data-my-work-page-header-density')).toBe('comfortable');
  });
});

describe('MyWorkHeroBand — accessibility', () => {
  it('uses role="region" and the personalized greeting default aria-label, overridable via prop', () => {
    const { container, rerender } = render(
      <MyWorkHeroBand mode="standardLaptop" identity={BOBBY_IDENTITY} now={dateAt(9)} />,
    );
    const header = container.querySelector('[data-my-work-page-header]')!;
    expect(header.getAttribute('role')).toBe('region');
    expect(header.getAttribute('aria-label')).toBe('Personalized greeting header');

    rerender(
      <MyWorkHeroBand
        mode="standardLaptop"
        identity={BOBBY_IDENTITY}
        now={dateAt(9)}
        ariaLabel="Custom greeting label"
      />,
    );
    const reHeader = container.querySelector('[data-my-work-page-header]')!;
    expect(reHeader.getAttribute('aria-label')).toBe('Custom greeting label');
  });

  it('does not leak the retired "My Work" module identity into the default accessibility label', () => {
    const { container } = render(
      <MyWorkHeroBand mode="standardLaptop" identity={BOBBY_IDENTITY} now={dateAt(9)} />,
    );
    const ariaLabel =
      container.querySelector('[data-my-work-page-header]')?.getAttribute('aria-label') ?? '';
    expect(ariaLabel).not.toContain('My Work');
    expect(ariaLabel).not.toContain('My Dashboard');
  });
});
