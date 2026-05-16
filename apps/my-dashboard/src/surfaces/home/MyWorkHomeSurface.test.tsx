import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { MY_PROJECT_LINKS_AVAILABLE, MY_WORK_HOME_AVAILABLE } from '@hbc/models/myWork/fixtures';
import { MyWorkBentoGrid } from '../../layout/MyWorkBentoGrid.js';
import { MyWorkReadModelClientProvider } from '../../runtime/MyWorkReadModelClientProvider.js';
import { MyWorkHomeSurface } from './MyWorkHomeSurface.js';
import type { MyWorkResponsiveMode } from '../../layout/useMyWorkContainerBreakpoint.js';

afterEach(() => {
  cleanup();
});

function renderHome(
  props: React.ComponentProps<typeof MyWorkHomeSurface> = {},
  mode: MyWorkResponsiveMode = 'desktop',
) {
  const client: any = {
    getMyWorkHome: async () => MY_WORK_HOME_AVAILABLE,
    getAdobeSignActionQueue: async () => {
      throw new Error('unused');
    },
    getAdobeSignRecentCompletions: async () => {
      throw new Error('unused');
    },
    getMyProjectLinks: async () => MY_PROJECT_LINKS_AVAILABLE,
    startAdobeSignOAuth: async () => {
      throw new Error('unused');
    },
  };
  return render(
    <MyWorkReadModelClientProvider client={client}>
      <MyWorkBentoGrid mode={mode}>
        <MyWorkHomeSurface {...props} />
      </MyWorkBentoGrid>
    </MyWorkReadModelClientProvider>,
  );
}

function getCardRoles(container: HTMLElement): string[] {
  return Array.from(
    container.querySelectorAll('[data-my-work-bento-grid] [data-my-work-card-role]'),
  ).map((el) => el.getAttribute('data-my-work-card-role') ?? '');
}

function spanOf(container: HTMLElement, role: string): string | null {
  return (
    container
      .querySelector(`[data-my-work-card-role="${role}"]`)
      ?.getAttribute('data-my-work-column-span') ?? null
  );
}

function spanSourceOf(container: HTMLElement, role: string): string | null {
  return (
    container
      .querySelector(`[data-my-work-card-role="${role}"]`)
      ?.getAttribute('data-my-work-span-source') ?? null
  );
}

describe('MyWorkHomeSurface — default (non-ready) variant', () => {
  it('emits exactly two cards in order on the non-ready variant: My Projects then Adobe Sign', () => {
    const { container } = renderHome();
    expect(getCardRoles(container)).toEqual(['my-projects-home', 'adobe-sign-action-queue']);
    // Retired surface cards must not appear.
    expect(container.querySelector('[data-my-work-card-role="work-summary"]')).toBeNull();
    expect(container.querySelector('[data-my-work-card-role="source-readiness"]')).toBeNull();
    expect(
      container.querySelector('[data-my-work-card-role="adobe-sign-action-queue-home"]'),
    ).toBeNull();
    expect(container.querySelector('[data-my-work-card-role="adobe-sign-queue-state"]')).toBeNull();
  });

  it('clamps both production cards to 1 column on phone and renders no other card roles', () => {
    const { container } = renderHome({}, 'phone');
    expect(spanOf(container, 'my-projects-home')).toBe('1');
    expect(spanOf(container, 'adobe-sign-action-queue')).toBe('1');
    expect(container.querySelector('[data-my-work-card-role="work-summary"]')).toBeNull();
    expect(container.querySelector('[data-my-work-card-role="source-readiness"]')).toBeNull();
  });
});

describe('MyWorkHomeSurface — ready variant', () => {
  it('emits exactly two cards in order on the ready variant: My Projects then Adobe Sign', () => {
    const { container } = renderHome({ readinessVariant: 'ready' });
    expect(getCardRoles(container)).toEqual(['my-projects-home', 'adobe-sign-action-queue']);
    expect(container.querySelector('[data-my-work-card-role="work-summary"]')).toBeNull();
    expect(container.querySelector('[data-my-work-card-role="source-readiness"]')).toBeNull();
    expect(
      container.querySelector('[data-my-work-card-role="adobe-sign-action-queue-home"]'),
    ).toBeNull();
  });
});

describe('MyWorkHomeSurface — locked bento choreography', () => {
  it('applies locked My Projects + Adobe Sign spans on desktop (7 + 5) sourced from overrides', () => {
    const { container } = renderHome({}, 'desktop');
    expect(spanOf(container, 'my-projects-home')).toBe('7');
    expect(spanOf(container, 'adobe-sign-action-queue')).toBe('5');
    expect(spanSourceOf(container, 'my-projects-home')).toBe('override');
    expect(spanSourceOf(container, 'adobe-sign-action-queue')).toBe('override');
  });

  it('applies locked spans on standardLaptop (6 + 4)', () => {
    const { container } = renderHome({}, 'standardLaptop');
    expect(spanOf(container, 'my-projects-home')).toBe('6');
    expect(spanOf(container, 'adobe-sign-action-queue')).toBe('4');
  });

  it('applies locked spans on largeLaptop and ultrawide (7 + 5)', () => {
    const large = renderHome({}, 'largeLaptop');
    expect(spanOf(large.container, 'my-projects-home')).toBe('7');
    expect(spanOf(large.container, 'adobe-sign-action-queue')).toBe('5');
    large.unmount();

    const ultra = renderHome({}, 'ultrawide');
    expect(spanOf(ultra.container, 'my-projects-home')).toBe('7');
    expect(spanOf(ultra.container, 'adobe-sign-action-queue')).toBe('5');
  });

  it('applies full-mode-width spans on tabletPortrait (2 + 2), tabletLandscape (6 + 6), and smallLaptop (8 + 8)', () => {
    const tabletPortrait = renderHome({}, 'tabletPortrait');
    expect(spanOf(tabletPortrait.container, 'my-projects-home')).toBe('2');
    expect(spanOf(tabletPortrait.container, 'adobe-sign-action-queue')).toBe('2');
    tabletPortrait.unmount();

    const tabletLandscape = renderHome({}, 'tabletLandscape');
    expect(spanOf(tabletLandscape.container, 'my-projects-home')).toBe('6');
    expect(spanOf(tabletLandscape.container, 'adobe-sign-action-queue')).toBe('6');
    tabletLandscape.unmount();

    const small = renderHome({}, 'smallLaptop');
    expect(spanOf(small.container, 'my-projects-home')).toBe('8');
    expect(spanOf(small.container, 'adobe-sign-action-queue')).toBe('8');
  });
});

describe('MyWorkHomeSurface — Adobe consolidation', () => {
  it('renders the Connect CTA on non-ready + authorization-required when onConnectAdobeSign is supplied', async () => {
    const { MY_WORK_HOME_AUTHORIZATION_REQUIRED } = await import('@hbc/models/myWork/fixtures');
    const onConnectAdobeSign = vi.fn().mockResolvedValue(undefined);
    const { container } = renderHome({
      readinessVariant: 'non-ready',
      homeEnvelope: MY_WORK_HOME_AUTHORIZATION_REQUIRED,
      sourceStatus: 'authorization-required',
      onConnectAdobeSign,
    });
    expect(container.querySelector('[data-adobe-sign-connect-action="start"]')).not.toBeNull();
  });

  it('suppresses the Connect CTA when onConnectAdobeSign is not supplied (fixture posture)', async () => {
    const { MY_WORK_HOME_AUTHORIZATION_REQUIRED } = await import('@hbc/models/myWork/fixtures');
    const { container } = renderHome({
      readinessVariant: 'non-ready',
      homeEnvelope: MY_WORK_HOME_AUTHORIZATION_REQUIRED,
      sourceStatus: 'authorization-required',
    });
    expect(container.querySelector('[data-adobe-sign-connect-action="start"]')).toBeNull();
  });

  it('keeps My Projects + Adobe composition intact when Adobe header toggle is visible', () => {
    const { container } = renderHome({
      readinessVariant: 'ready',
      homeEnvelope: MY_WORK_HOME_AVAILABLE,
    });
    expect(getCardRoles(container)).toEqual(['my-projects-home', 'adobe-sign-action-queue']);
    expect(container.querySelector('[data-adobe-sign-card-view-toggle]')).not.toBeNull();
  });
});

describe('MyWorkHomeSurface — copy posture', () => {
  it('never renders developer-facing strings (TODO / mock / placeholder / fake)', () => {
    const { container } = renderHome();
    const text = container.textContent ?? '';
    expect(/\bTODO\b/.test(text)).toBe(false);
    expect(/\bmock\b/i.test(text)).toBe(false);
    expect(/\bplaceholder\b/i.test(text)).toBe(false);
    expect(/\bfake\b/i.test(text)).toBe(false);
  });

  it('renders the My Projects header and purpose statement', () => {
    const { container } = renderHome();
    const myProjects = container.querySelector('[data-my-work-card-role="my-projects-home"]');
    expect(myProjects?.textContent).toContain('My Projects');
    expect(myProjects?.textContent).toContain('My Portfolio');
    expect(myProjects?.textContent).toContain(
      'Open assigned projects across SharePoint, Procore, BuildingConnected, and Document Crunch.',
    );
  });
});

describe('MyWorkHomeSurface — envelope-state variants', () => {
  it('loading variant renders the loading marker plus both primary cards; Adobe card reports loading state', () => {
    const { container } = renderHome({ readinessVariant: 'loading' });
    expect(container.querySelector('[data-my-work-readiness-state="loading"]')).not.toBeNull();
    // Both primary cards mount in every readiness state so the page surface is
    // fully composed and My Projects' /project-links request can start in
    // parallel with /home.
    expect(getCardRoles(container)).toEqual(['my-projects-home', 'adobe-sign-action-queue']);
    const adobeCard = container.querySelector(
      '[data-my-work-card-role="adobe-sign-action-queue"]',
    ) as HTMLElement;
    expect(adobeCard.getAttribute('data-adobe-sign-action-queue-state')).toBe('loading');
    expect(container.querySelector('[data-my-work-card-role="my-projects-home"]')).not.toBeNull();
    // Legacy-scaffold regression guard.
    expect(container.querySelector('[data-my-work-card-role="work-summary"]')).toBeNull();
    expect(container.querySelector('[data-my-work-card-role="source-readiness"]')).toBeNull();
  });

  it('error variant renders the error marker plus both primary cards; Adobe card reports backend-unavailable state', () => {
    const { container } = renderHome({ readinessVariant: 'error' });
    expect(container.querySelector('[data-my-work-readiness-state="error"]')).not.toBeNull();
    expect(getCardRoles(container)).toEqual(['my-projects-home', 'adobe-sign-action-queue']);
    const adobeCard = container.querySelector(
      '[data-my-work-card-role="adobe-sign-action-queue"]',
    ) as HTMLElement;
    expect(adobeCard.getAttribute('data-adobe-sign-action-queue-state')).toBe(
      'backend-unavailable',
    );
    expect(container.querySelector('[data-my-work-card-role="my-projects-home"]')).not.toBeNull();
    expect(container.querySelector('[data-my-work-card-role="work-summary"]')).toBeNull();
    expect(container.querySelector('[data-my-work-card-role="source-readiness"]')).toBeNull();
  });

  it('ready + sourceStatus="partial" emits the two-card tree plus a hidden source-status marker', () => {
    const { container } = renderHome({
      readinessVariant: 'ready',
      sourceStatus: 'partial',
    });
    expect(getCardRoles(container)).toEqual(['my-projects-home', 'adobe-sign-action-queue']);
    expect(container.querySelector('[data-my-work-source-status="partial"]')).not.toBeNull();
  });
});
