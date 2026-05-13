import type { ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import {
  ADOBE_SIGN_QUEUE_AUTHORIZATION_REQUIRED,
  ADOBE_SIGN_QUEUE_AVAILABLE,
  MY_WORK_HOME_AUTHORIZATION_REQUIRED,
  MY_WORK_HOME_AVAILABLE,
} from '@hbc/models/myWork/fixtures';
import type {
  MyProjectLinksReadModel,
  MyWorkReadModelDataPath,
  MyWorkReadModelEnvelope,
} from '@hbc/models/myWork';
import type { IMyWorkReadModelClient } from '../api/myWorkReadModelClient.js';
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

const PROJECT_LINKS_AVAILABLE: MyWorkReadModelEnvelope<MyProjectLinksReadModel> = {
  mode: 'fixture',
  sourceStatus: 'available',
  readOnly: true,
  warnings: [],
  generatedAtUtc: '2026-05-13T00:00:00Z',
  data: { items: [], paging: { hasMore: false } } as unknown as MyProjectLinksReadModel,
};

function makeStubClient(overrides: Partial<IMyWorkReadModelClient> = {}): IMyWorkReadModelClient {
  return {
    getMyWorkHome: vi.fn().mockResolvedValue(MY_WORK_HOME_AVAILABLE),
    getAdobeSignActionQueue: vi.fn().mockResolvedValue(ADOBE_SIGN_QUEUE_AVAILABLE),
    getMyProjectLinks: vi.fn().mockResolvedValue(PROJECT_LINKS_AVAILABLE),
    startAdobeSignOAuth: vi.fn(),
    ...overrides,
  };
}

function renderShellWithStub(stub: IMyWorkReadModelClient, node: ReactElement = <MyWorkShell />) {
  return render(
    <MyWorkReadModelClientProvider client={stub}>{node}</MyWorkReadModelClientProvider>,
  );
}

function openAdobeFocusedModule(container: HTMLElement): void {
  const launcher = container.querySelector(
    '[data-my-work-module-launcher="my-work-home"]',
  ) as HTMLButtonElement;
  fireEvent.click(launcher);
  const item = container.querySelector(
    '[data-my-work-module-menu-item="adobe-sign-action-queue"]',
  ) as HTMLButtonElement;
  fireEvent.click(item);
}

function getHeroHighlightValue(container: HTMLElement, id: string): string | null {
  const node = container.querySelector(`[data-my-work-hero-highlight="${id}"]`);
  // The second span is the value (label is first).
  return node?.children[1]?.textContent ?? null;
}

function withDataPath<T>(
  env: MyWorkReadModelEnvelope<T>,
  dataPath: MyWorkReadModelDataPath,
): MyWorkReadModelEnvelope<T> {
  return { ...env, dataPath };
}

function getActivePanelDataPath(container: HTMLElement): string | null {
  return (
    container
      .querySelector('[data-my-work-active-surface-panel]')
      ?.getAttribute('data-my-work-data-path') ?? null
  );
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

describe('MyWorkShell — envelope-derived hero band (Prompt 01 remediation)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('home + `available` envelope drives the live actionable-items count and Connected source-health', async () => {
    const stub = makeStubClient();
    const { container } = renderShellWithStub(stub);
    await waitFor(() => {
      expect(getHeroHighlightValue(container, 'actionable-items')).toBe('6');
    });
    expect(getHeroHighlightValue(container, 'source-health')).toBe('Connected');
    expect(getHeroHighlightValue(container, 'connected-sources')).toBe('Adobe Sign');
    // The active-route envelope is the only fetch on the home view.
    expect(stub.getMyWorkHome).toHaveBeenCalledTimes(1);
    expect(stub.getAdobeSignActionQueue).not.toHaveBeenCalled();
  });

  it('home + `authorization-required` envelope drives status-derived hero highlights', async () => {
    const stub = makeStubClient({
      getMyWorkHome: vi.fn().mockResolvedValue(MY_WORK_HOME_AUTHORIZATION_REQUIRED),
    });
    const { container } = renderShellWithStub(stub);
    await waitFor(() => {
      expect(getHeroHighlightValue(container, 'actionable-items')).toBe('Authorization required');
    });
    expect(getHeroHighlightValue(container, 'source-health')).toBe('Authorization required');
  });

  it('focused Adobe + `available` envelope drives Connected queue-state and the live pending count', async () => {
    const stub = makeStubClient();
    const { container } = renderShellWithStub(stub);
    openAdobeFocusedModule(container);
    await waitFor(() => {
      expect(getHeroHighlightValue(container, 'queue-state')).toBe('Connected');
    });
    expect(getHeroHighlightValue(container, 'pending-items')).toBe(
      String(ADOBE_SIGN_QUEUE_AVAILABLE.data.summary.totalActionItemCount),
    );
    expect(getHeroHighlightValue(container, 'action-system')).toBe('Adobe Sign');
    expect(stub.getAdobeSignActionQueue).toHaveBeenCalledTimes(1);
  });

  it('focused Adobe + `authorization-required` envelope drives Authorization required queue-state copy', async () => {
    const stub = makeStubClient({
      getAdobeSignActionQueue: vi.fn().mockResolvedValue(ADOBE_SIGN_QUEUE_AUTHORIZATION_REQUIRED),
    });
    const { container } = renderShellWithStub(stub);
    openAdobeFocusedModule(container);
    await waitFor(() => {
      expect(getHeroHighlightValue(container, 'queue-state')).toBe('Authorization required');
    });
    expect(getHeroHighlightValue(container, 'pending-items')).toBe('Authorization required');
  });

  it('never emits the legacy "Pending source connection" copy in hero highlights when the envelope has resolved', async () => {
    const stub = makeStubClient();
    const { container } = renderShellWithStub(stub);
    await waitFor(() => {
      expect(getHeroHighlightValue(container, 'actionable-items')).toBe('6');
    });
    const heroText = container.querySelector('[data-my-work-hero]')?.textContent ?? '';
    expect(heroText.includes('Pending source connection')).toBe(false);

    openAdobeFocusedModule(container);
    await waitFor(() => {
      expect(getHeroHighlightValue(container, 'queue-state')).toBe('Connected');
    });
    const focusedHeroText = container.querySelector('[data-my-work-hero]')?.textContent ?? '';
    expect(focusedHeroText.includes('Pending source connection')).toBe(false);
  });

  it('the focused Adobe route shares one envelope fetch between the hero and the surface body', async () => {
    const stub = makeStubClient();
    // Re-render so the shell mounts directly in the focused Adobe state would
    // require shell-level state injection; instead, mount focused via the
    // provider/router directly to assert single-fetch under the focused route.
    const { container } = renderShellWithStub(stub);
    openAdobeFocusedModule(container);
    await waitFor(() => {
      expect(getHeroHighlightValue(container, 'queue-state')).toBe('Connected');
    });
    // Hero band and surface body share the focused Adobe envelope via the
    // provider context — exactly one fetch for the active focused route.
    expect(stub.getAdobeSignActionQueue).toHaveBeenCalledTimes(1);
  });
});

describe('MyWorkShell — data-path DOM marker (Prompt 02 remediation)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('stamps data-my-work-data-path="unknown" before the envelope resolves', () => {
    const stub = makeStubClient({
      getMyWorkHome: vi.fn<IMyWorkReadModelClient['getMyWorkHome']>(() => new Promise(() => {})),
    });
    const { container } = renderShellWithStub(stub);
    // Initial paint, before any envelope resolves.
    expect(getActivePanelDataPath(container)).toBe('unknown');
  });

  it('stamps data-my-work-data-path="backend-live" when the home envelope arrives stamped backend-live', async () => {
    const stub = makeStubClient({
      getMyWorkHome: vi
        .fn()
        .mockResolvedValue(withDataPath(MY_WORK_HOME_AVAILABLE, 'backend-live')),
    });
    const { container } = renderShellWithStub(stub);
    await waitFor(() => {
      expect(getActivePanelDataPath(container)).toBe('backend-live');
    });
  });

  it('stamps data-my-work-data-path="backend-unavailable-fallback" when the production fallback fixture is in play', async () => {
    const stub = makeStubClient({
      getMyWorkHome: vi
        .fn()
        .mockResolvedValue(
          withDataPath(MY_WORK_HOME_AUTHORIZATION_REQUIRED, 'backend-unavailable-fallback'),
        ),
    });
    const { container } = renderShellWithStub(stub);
    await waitFor(() => {
      expect(getActivePanelDataPath(container)).toBe('backend-unavailable-fallback');
    });
  });

  it('stamps data-my-work-data-path="fixture-ui-review" when the explicit fixture posture envelope arrives', async () => {
    const stub = makeStubClient({
      getMyWorkHome: vi
        .fn()
        .mockResolvedValue(withDataPath(MY_WORK_HOME_AVAILABLE, 'fixture-ui-review')),
    });
    const { container } = renderShellWithStub(stub);
    await waitFor(() => {
      expect(getActivePanelDataPath(container)).toBe('fixture-ui-review');
    });
  });

  it('flips the data-path marker when the focused Adobe route mounts and its envelope resolves', async () => {
    const stub = makeStubClient({
      getMyWorkHome: vi
        .fn()
        .mockResolvedValue(withDataPath(MY_WORK_HOME_AVAILABLE, 'backend-live')),
      getAdobeSignActionQueue: vi
        .fn()
        .mockResolvedValue(
          withDataPath(ADOBE_SIGN_QUEUE_AUTHORIZATION_REQUIRED, 'backend-unavailable-fallback'),
        ),
    });
    const { container } = renderShellWithStub(stub);
    await waitFor(() => {
      expect(getActivePanelDataPath(container)).toBe('backend-live');
    });
    openAdobeFocusedModule(container);
    await waitFor(() => {
      expect(getActivePanelDataPath(container)).toBe('backend-unavailable-fallback');
    });
  });
});
