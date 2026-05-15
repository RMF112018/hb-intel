import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { MyWorkBentoGrid } from '../../layout/MyWorkBentoGrid.js';
import { MyWorkHomeSurface } from './MyWorkHomeSurface.js';
import type { MyWorkResponsiveMode } from '../../layout/useMyWorkContainerBreakpoint.js';

afterEach(() => {
  cleanup();
});

function renderHome(
  props: React.ComponentProps<typeof MyWorkHomeSurface> = {},
  mode: MyWorkResponsiveMode = 'desktop',
) {
  return render(
    <MyWorkBentoGrid mode={mode}>
      <MyWorkHomeSurface {...props} />
    </MyWorkBentoGrid>,
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

describe('MyWorkHomeSurface — default (non-ready) variant', () => {
  it('emits the four non-ready cards in order with My Projects first and the consolidated Adobe card', () => {
    const { container } = renderHome();
    expect(getCardRoles(container)).toEqual([
      'my-projects-home',
      'work-summary',
      'adobe-sign-action-queue',
      'source-readiness',
    ]);
    // Retired Adobe card roles must not appear.
    expect(
      container.querySelector('[data-my-work-card-role="adobe-sign-action-queue-home"]'),
    ).toBeNull();
    expect(container.querySelector('[data-my-work-card-role="adobe-sign-queue-state"]')).toBeNull();
  });

  it('clamps every card to 1 column on phone', () => {
    const { container } = renderHome({}, 'phone');
    expect(spanOf(container, 'my-projects-home')).toBe('1');
    expect(spanOf(container, 'work-summary')).toBe('1');
    expect(spanOf(container, 'adobe-sign-action-queue')).toBe('1');
    expect(spanOf(container, 'source-readiness')).toBe('1');
  });
});

describe('MyWorkHomeSurface — ready variant', () => {
  it('emits the three ready cards in order with My Projects first and the consolidated Adobe card', () => {
    const { container } = renderHome({ readinessVariant: 'ready' });
    expect(getCardRoles(container)).toEqual([
      'my-projects-home',
      'work-summary',
      'adobe-sign-action-queue',
    ]);
    expect(container.querySelector('[data-my-work-card-role="adobe-sign-queue-state"]')).toBeNull();
    expect(container.querySelector('[data-my-work-card-role="source-readiness"]')).toBeNull();
    // Retired ready-variant Adobe card role must not appear.
    expect(
      container.querySelector('[data-my-work-card-role="adobe-sign-action-queue-home"]'),
    ).toBeNull();
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
    expect(myProjects?.textContent).toContain(
      'Your assigned projects, ready to open in SharePoint and Procore.',
    );
  });
});

describe('MyWorkHomeSurface — data-driven content via homeEnvelope', () => {
  it('renders the action item count from the home envelope in the work-summary card (ready)', async () => {
    const { MY_WORK_HOME_AVAILABLE } = await import('@hbc/models/myWork/fixtures');
    const { container } = renderHome({
      readinessVariant: 'ready',
      homeEnvelope: MY_WORK_HOME_AVAILABLE,
    });
    const workSummary = container.querySelector(
      '[data-my-work-card-role="work-summary"]',
    ) as HTMLElement;
    expect(workSummary.getAttribute('data-my-work-card')).toBe('');
    expect(workSummary.querySelector('[data-my-work-action-item-count="6"]')).not.toBeNull();
    // The consolidated Adobe card publishes its own metrics under the new card role.
    const adobeCard = container.querySelector(
      '[data-my-work-card-role="adobe-sign-action-queue"]',
    ) as HTMLElement;
    expect(adobeCard.querySelector('[data-adobe-queue-summary-pending]')?.textContent).toBe('6');
  });

  it('renders distinct source-readiness copy for authorization-required vs configuration-required (non-ready)', async () => {
    const { MY_WORK_HOME_AUTHORIZATION_REQUIRED, MY_WORK_HOME_CONFIGURATION_REQUIRED } =
      await import('@hbc/models/myWork/fixtures');
    const auth = renderHome({
      readinessVariant: 'non-ready',
      sourceStatus: 'authorization-required',
      homeEnvelope: MY_WORK_HOME_AUTHORIZATION_REQUIRED,
    });
    const authCard = auth.container.querySelector(
      '[data-my-work-card-role="source-readiness"]',
    ) as HTMLElement;
    expect(
      authCard.querySelector('[data-source-readiness-status="authorization-required"]'),
    ).not.toBeNull();
    expect(authCard.textContent).toContain('Authorization required');
    auth.unmount();

    const config = renderHome({
      readinessVariant: 'non-ready',
      sourceStatus: 'configuration-required',
      homeEnvelope: MY_WORK_HOME_CONFIGURATION_REQUIRED,
    });
    const configCard = config.container.querySelector(
      '[data-my-work-card-role="source-readiness"]',
    ) as HTMLElement;
    expect(
      configCard.querySelector('[data-source-readiness-status="configuration-required"]'),
    ).not.toBeNull();
    expect(configCard.textContent).toContain('Configuration required');
    expect(configCard.textContent).not.toContain('Authorization required');
  });
});

describe('MyWorkHomeSurface — envelope-state variants', () => {
  it('loading variant renders the loading marker AND the consolidated Adobe card (the card owns its loading state)', () => {
    const { container } = renderHome({ readinessVariant: 'loading' });
    expect(container.querySelector('[data-my-work-readiness-state="loading"]')).not.toBeNull();
    // The Adobe card mounts in every readiness state so it owns its full state matrix.
    expect(getCardRoles(container)).toEqual(['adobe-sign-action-queue']);
    const adobeCard = container.querySelector(
      '[data-my-work-card-role="adobe-sign-action-queue"]',
    ) as HTMLElement;
    expect(adobeCard.getAttribute('data-adobe-sign-action-queue-state')).toBe('loading');
    // Other cards do not render in loading state.
    expect(container.querySelector('[data-my-work-card-role="my-projects-home"]')).toBeNull();
    expect(container.querySelector('[data-my-work-card-role="source-readiness"]')).toBeNull();
  });

  it('error variant renders the error marker AND the consolidated Adobe card with backend-unavailable state', () => {
    const { container } = renderHome({ readinessVariant: 'error' });
    expect(container.querySelector('[data-my-work-readiness-state="error"]')).not.toBeNull();
    expect(getCardRoles(container)).toEqual(['adobe-sign-action-queue']);
    const adobeCard = container.querySelector(
      '[data-my-work-card-role="adobe-sign-action-queue"]',
    ) as HTMLElement;
    expect(adobeCard.getAttribute('data-adobe-sign-action-queue-state')).toBe(
      'backend-unavailable',
    );
  });

  it('ready + sourceStatus="partial" emits the ready tree plus a hidden source-status marker', () => {
    const { container } = renderHome({
      readinessVariant: 'ready',
      sourceStatus: 'partial',
    });
    expect(getCardRoles(container)).toEqual([
      'my-projects-home',
      'work-summary',
      'adobe-sign-action-queue',
    ]);
    expect(container.querySelector('[data-my-work-source-status="partial"]')).not.toBeNull();
  });
});
