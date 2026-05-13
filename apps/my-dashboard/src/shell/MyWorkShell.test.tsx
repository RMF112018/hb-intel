import type { ReactElement } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { MyWorkReadModelClientProvider } from '../runtime/MyWorkReadModelClientProvider.js';
import { MY_WORK_ACTIVE_PANEL_ID, MyWorkShell } from './MyWorkShell.js';

afterEach(() => {
  cleanup();
});

/**
 * Wraps shell renders with the read-model provider so the surface router's
 * envelope hooks resolve. With no `client` prop the provider falls through
 * to the factory's default fixture client (ui-review / available envelopes),
 * which matches the shell's intended preview posture in tests.
 */
function renderShell(node: ReactElement) {
  return render(<MyWorkReadModelClientProvider>{node}</MyWorkReadModelClientProvider>);
}

describe('MyWorkShell — composition and data-attribute contract', () => {
  it('renders the shell root with shell + mode + view-state markers', () => {
    const { container } = renderShell(<MyWorkShell />);
    const shell = container.querySelector('[data-my-work-shell]') as HTMLElement;
    expect(shell).not.toBeNull();
    expect(shell.getAttribute('data-my-work-shell')).toBe('thin');
    // Initial mode is the hook's default (no ResizeObserver in jsdom).
    expect(shell.getAttribute('data-my-work-shell-mode')).toBe('standardLaptop');
    expect(shell.getAttribute('data-my-work-view-state')).toBe('home');
  });

  it('renders exactly one active-surface-panel marker, on a <main role="tabpanel">', () => {
    const { container } = renderShell(<MyWorkShell />);
    const panels = container.querySelectorAll('[data-my-work-active-surface-panel]');
    expect(panels).toHaveLength(1);
    const main = panels[0] as HTMLElement;
    expect(main.tagName).toBe('MAIN');
    expect(main.id).toBe(MY_WORK_ACTIVE_PANEL_ID);
    expect(main.getAttribute('role')).toBe('tabpanel');
    expect(main.getAttribute('aria-labelledby')).toBe('my-work-tab-my-work-home');
    expect(main.getAttribute('data-my-work-active-surface-panel')).toBe('my-work-home');
  });

  it('renders the command-surface region and canvas wrapper exactly once each', () => {
    const { container } = renderShell(<MyWorkShell />);
    expect(container.querySelectorAll('[data-my-work-command-surface]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-my-work-canvas]')).toHaveLength(1);
  });

  it('mounts the primary navigation inside the command surface', () => {
    const { container } = renderShell(<MyWorkShell />);
    const commandSurface = container.querySelector('[data-my-work-command-surface]')!;
    expect(commandSurface.querySelector('[data-my-work-primary-navigation]')).not.toBeNull();
  });

  it('forwards forceMode to the breakpoint marker and density', () => {
    const { container } = renderShell(<MyWorkShell forceMode="phone" />);
    const shell = container.querySelector('[data-my-work-shell]') as HTMLElement;
    expect(shell.getAttribute('data-my-work-shell-mode')).toBe('phone');
    const tablist = container.querySelector('[data-my-work-primary-navigation]')!;
    expect(tablist.getAttribute('data-my-work-tabs-density')).toBe('compact');
  });

  it('flips view-state to "focused-module" once the Adobe module is selected', () => {
    const { container } = renderShell(<MyWorkShell />);
    const shell = container.querySelector('[data-my-work-shell]') as HTMLElement;
    expect(shell.getAttribute('data-my-work-view-state')).toBe('home');

    const launcher = container.querySelector(
      '[data-my-work-module-launcher="my-work-home"]',
    ) as HTMLButtonElement;
    fireEvent.click(launcher);

    const item = container.querySelector(
      '[data-my-work-module-menu-item="adobe-sign-action-queue"]',
    ) as HTMLButtonElement;
    fireEvent.click(item);

    expect(shell.getAttribute('data-my-work-view-state')).toBe('focused-module');
    // active surface panel stays anchored to my-work-home (still the only surface).
    const main = container.querySelector('[data-my-work-active-surface-panel]') as HTMLElement;
    expect(main.getAttribute('data-my-work-active-surface-panel')).toBe('my-work-home');
    expect(main.getAttribute('aria-labelledby')).toBe('my-work-tab-my-work-home');
  });

  it('renders provided active-panel children', () => {
    const { container } = renderShell(
      <MyWorkShell>
        <div data-test-child="">child content</div>
      </MyWorkShell>,
    );
    const main = container.querySelector(`#${MY_WORK_ACTIVE_PANEL_ID}`) as HTMLElement;
    expect(main.querySelector('[data-test-child]')?.textContent).toBe('child content');
  });
});

describe('MyWorkShell — hero band composition', () => {
  it('mounts the hero band inside the command surface, after the primary navigation', () => {
    const { container } = renderShell(<MyWorkShell />);
    const commandSurface = container.querySelector('[data-my-work-command-surface]')!;
    const nav = commandSurface.querySelector('[data-my-work-primary-navigation]');
    const hero = commandSurface.querySelector('[data-my-work-hero]');
    expect(nav).not.toBeNull();
    expect(hero).not.toBeNull();
    // DOM order: navigation must precede hero inside the command surface.
    const position = nav!.compareDocumentPosition(hero!);
    expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeGreaterThan(0);
  });

  it('shows the home hero copy when no module is active', () => {
    const { container } = renderShell(<MyWorkShell />);
    expect(container.querySelector('[data-my-work-hero-secondary-title]')?.textContent).toBe(
      'My Work',
    );
    const governance = container.querySelector('[data-my-work-hero-governance-copy]');
    expect(governance?.textContent).toBe(
      'Read-only work visibility · Source actions remain in their governing systems.',
    );
  });

  it('flips the hero identity and governance copy when the Adobe module is selected', () => {
    const { container } = renderShell(<MyWorkShell />);
    const launcher = container.querySelector(
      '[data-my-work-module-launcher="my-work-home"]',
    ) as HTMLButtonElement;
    fireEvent.click(launcher);
    const item = container.querySelector(
      '[data-my-work-module-menu-item="adobe-sign-action-queue"]',
    ) as HTMLButtonElement;
    fireEvent.click(item);

    expect(container.querySelector('[data-my-work-hero-secondary-title]')?.textContent).toBe(
      'Adobe Sign Action Queue',
    );
    expect(container.querySelector('[data-my-work-hero-description]')?.textContent).toBe(
      'Agreements in Adobe Sign that require your review, signature, approval, or other source-defined action.',
    );
    expect(container.querySelector('[data-my-work-hero-governance-copy]')?.textContent).toBe(
      'Queue visibility only · Agreement actions remain in Adobe Sign.',
    );
  });
});

describe('MyWorkShell — bento grid + surface router composition', () => {
  it('mounts exactly one bento grid inside the main panel', () => {
    const { container } = renderShell(<MyWorkShell />);
    const main = container.querySelector(`#${MY_WORK_ACTIVE_PANEL_ID}`) as HTMLElement;
    expect(main.querySelectorAll('[data-my-work-bento-grid]')).toHaveLength(1);
  });

  it("routes to the home surface (non-ready cards under the default provider's backend-unavailable envelope)", async () => {
    const { container } = renderShell(<MyWorkShell />);
    await waitFor(() => {
      const grid = container.querySelector('[data-my-work-bento-grid]') as HTMLElement;
      const roles = Array.from(grid.querySelectorAll('[data-my-work-card-role]')).map((el) =>
        el.getAttribute('data-my-work-card-role'),
      );
      expect(roles).toEqual([
        'my-projects-home',
        'work-summary',
        'adobe-sign-queue-state',
        'source-readiness',
      ]);
    });
    const grid = container.querySelector('[data-my-work-bento-grid]') as HTMLElement;
    expect(grid.querySelector('[data-my-work-card-role="adobe-sign-queue-summary"]')).toBeNull();
  });

  it('routes to the Adobe focused-module surface after the module is selected (non-ready cards under default backend-unavailable envelope)', async () => {
    const { container } = renderShell(<MyWorkShell />);
    const launcher = container.querySelector(
      '[data-my-work-module-launcher="my-work-home"]',
    ) as HTMLButtonElement;
    fireEvent.click(launcher);
    const item = container.querySelector(
      '[data-my-work-module-menu-item="adobe-sign-action-queue"]',
    ) as HTMLButtonElement;
    fireEvent.click(item);

    await waitFor(() => {
      const grid = container.querySelector('[data-my-work-bento-grid]') as HTMLElement;
      const roles = Array.from(grid.querySelectorAll('[data-my-work-card-role]')).map((el) =>
        el.getAttribute('data-my-work-card-role'),
      );
      expect(roles).toEqual(['adobe-sign-queue-state', 'adobe-sign-connection-guidance']);
    });
    const grid = container.querySelector('[data-my-work-bento-grid]') as HTMLElement;
    expect(grid.querySelector('[data-my-work-card-role="work-summary"]')).toBeNull();
  });

  it('keeps the active-panel marker exclusively on the shell <main>', () => {
    const { container } = renderShell(<MyWorkShell />);
    const panels = container.querySelectorAll('[data-my-work-active-surface-panel]');
    expect(panels).toHaveLength(1);
    expect((panels[0] as HTMLElement).tagName).toBe('MAIN');
  });

  it('continues to render `children` inside the bento grid after the router output', async () => {
    const { container } = renderShell(
      <MyWorkShell>
        <div data-test-child="">child</div>
      </MyWorkShell>,
    );
    const grid = container.querySelector('[data-my-work-bento-grid]') as HTMLElement;
    const child = grid.querySelector('[data-test-child]');
    expect(child?.textContent).toBe('child');
    // Wait for the ready home tree to mount so the work-summary positional anchor exists.
    await waitFor(() =>
      expect(grid.querySelector('[data-my-work-card-role="work-summary"]')).not.toBeNull(),
    );
    const firstCard = grid.querySelector('[data-my-work-card-role="work-summary"]');
    const position = firstCard!.compareDocumentPosition(child!);
    expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeGreaterThan(0);
  });

  it('forwards forceMode to the bento grid mode marker', () => {
    const { container } = renderShell(<MyWorkShell forceMode="phone" />);
    const grid = container.querySelector('[data-my-work-bento-grid]') as HTMLElement;
    expect(grid.getAttribute('data-my-work-mode')).toBe('phone');
  });
});
