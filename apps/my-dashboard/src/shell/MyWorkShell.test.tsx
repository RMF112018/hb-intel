import type { ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, waitFor } from '@testing-library/react';
import {
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
import { _resetConfig, setRuntimeConfig } from '../config/runtimeConfig.js';
import { MyWorkReadModelClientProvider } from '../runtime/MyWorkReadModelClientProvider.js';
import { MY_WORK_ACTIVE_PANEL_ID, MyWorkShell } from './MyWorkShell.js';

afterEach(() => {
  cleanup();
});

function getMissingConfigAttr(container: HTMLElement): string | null {
  return (
    container
      .querySelector('[data-my-work-active-surface-panel]')
      ?.getAttribute('data-my-work-runtime-config-missing') ?? null
  );
}

const NOOP_TOKEN_PROVIDER = async (): Promise<string> => 'token';

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
  it('renders the shell root with shell + mode markers (no route-aware view-state)', () => {
    const { container } = renderShell(<MyWorkShell />);
    const shell = container.querySelector('[data-my-work-shell]') as HTMLElement;
    expect(shell).not.toBeNull();
    expect(shell.getAttribute('data-my-work-shell')).toBe('thin');
    // Initial mode is the hook's default (no ResizeObserver in jsdom).
    expect(shell.getAttribute('data-my-work-shell-mode')).toBe('standardLaptop');
    // Single primary-page command surface — the route-aware view-state attribute is retired.
    expect(shell.hasAttribute('data-my-work-view-state')).toBe(false);
  });

  it('renders exactly one active-surface-panel marker, on a non-tabpanel <main>', () => {
    const { container } = renderShell(<MyWorkShell />);
    const panels = container.querySelectorAll('[data-my-work-active-surface-panel]');
    expect(panels).toHaveLength(1);
    const main = panels[0] as HTMLElement;
    expect(main.tagName).toBe('MAIN');
    expect(main.id).toBe(MY_WORK_ACTIVE_PANEL_ID);
    // Tab ARIA is retired with the tablist; the single primary page is labeled directly.
    expect(main.hasAttribute('role')).toBe(false);
    expect(main.hasAttribute('aria-labelledby')).toBe(false);
    expect(main.getAttribute('aria-label')).toBe('My Work');
    expect(main.getAttribute('data-my-work-active-surface-panel')).toBe('my-work-home');
  });

  it('renders the command-surface region and canvas wrapper exactly once each', () => {
    const { container } = renderShell(<MyWorkShell />);
    expect(container.querySelectorAll('[data-my-work-command-surface]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-my-work-canvas]')).toHaveLength(1);
  });

  it('does not mount a primary navigation tablist or module launcher inside the live shell', () => {
    const { container } = renderShell(<MyWorkShell />);
    expect(container.querySelector('[data-my-work-primary-navigation]')).toBeNull();
    expect(container.querySelector('[data-my-work-module-launcher]')).toBeNull();
    expect(container.querySelector('[role="tablist"]')).toBeNull();
  });

  it('forwards forceMode to the shell mode marker', () => {
    const { container } = renderShell(<MyWorkShell forceMode="phone" />);
    const shell = container.querySelector('[data-my-work-shell]') as HTMLElement;
    expect(shell.getAttribute('data-my-work-shell-mode')).toBe('phone');
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

const SHELL_FIXTURE_SPFX_CONTEXT = {
  pageContext: {
    user: {
      loginName: 'bfetting@example.com',
      displayName: 'Bobby Fetting',
      email: 'bfetting@example.com',
    },
  },
};

function shellDateAt(hour: number, minute = 0): Date {
  return new Date(2026, 4, 15, hour, minute, 0, 0);
}

describe('MyWorkShell — page header composition', () => {
  it('mounts the page header inside the command surface', () => {
    const { container } = renderShell(<MyWorkShell now={shellDateAt(9)} />);
    const commandSurface = container.querySelector('[data-my-work-command-surface]')!;
    const header = commandSurface.querySelector('[data-my-work-page-header]');
    expect(header).not.toBeNull();
  });

  it('renders the personalized greeting for the authenticated SPFx user at a morning timestamp', () => {
    const { container } = renderShell(
      <MyWorkShell spfxContext={SHELL_FIXTURE_SPFX_CONTEXT} now={shellDateAt(9)} />,
    );
    expect(container.querySelector('[data-my-work-page-header-greeting]')?.textContent).toBe(
      'Good morning, Bobby.',
    );
    expect(container.querySelector('[data-my-work-page-header-support]')?.textContent).toBe(
      'Your personal launch pad for project access and work requiring attention.',
    );
  });

  it('falls back to "there" when no SPFx context is supplied', () => {
    const { container } = renderShell(<MyWorkShell now={shellDateAt(9)} />);
    expect(container.querySelector('[data-my-work-page-header-greeting]')?.textContent).toBe(
      'Good morning, there.',
    );
  });

  it('the live shell does not leak retired identity copy "My Dashboard" / "My Work" into the header text', () => {
    const { container } = renderShell(
      <MyWorkShell spfxContext={SHELL_FIXTURE_SPFX_CONTEXT} now={shellDateAt(9)} />,
    );
    const headerText = container.querySelector('[data-my-work-page-header]')?.textContent ?? '';
    expect(headerText).not.toContain('My Dashboard');
    expect(headerText).not.toContain('My Work');
  });

  it('emits no retired hero markers and no retired Prompt-02 static-identity markers under the live shell', () => {
    const { container } = renderShell(
      <MyWorkShell spfxContext={SHELL_FIXTURE_SPFX_CONTEXT} now={shellDateAt(9)} />,
    );
    expect(container.querySelector('[data-my-work-hero]')).toBeNull();
    expect(container.querySelector('[data-my-work-hero-highlight]')).toBeNull();
    expect(container.querySelector('[data-my-work-hero-governance-copy]')).toBeNull();
    expect(container.querySelector('[data-my-work-hero-secondary-title]')).toBeNull();
    expect(container.querySelector('[data-my-work-page-header-eyebrow]')).toBeNull();
    expect(container.querySelector('[data-my-work-page-header-title]')).toBeNull();
  });

  it('renders the greeting synchronously even when the home envelope is stalled (header is envelope-agnostic)', () => {
    // Stalled envelope client: if the page header consumed the envelope
    // context, the header would block on `loading` rather than rendering its
    // greeting synchronously.
    const stub = makeStubClient({
      getMyWorkHome: vi.fn<IMyWorkReadModelClient['getMyWorkHome']>(() => new Promise(() => {})),
    });
    const { container } = renderShellWithStub(
      stub,
      <MyWorkShell spfxContext={SHELL_FIXTURE_SPFX_CONTEXT} now={shellDateAt(9)} />,
    );
    expect(container.querySelector('[data-my-work-page-header-greeting]')?.textContent).toBe(
      'Good morning, Bobby.',
    );
    expect(container.querySelector('[data-my-work-page-header-support]')?.textContent).toBe(
      'Your personal launch pad for project access and work requiring attention.',
    );
  });
});

describe('MyWorkShell — bento grid + surface router composition', () => {
  it('mounts exactly one bento grid inside the main panel', () => {
    const { container } = renderShell(<MyWorkShell />);
    const main = container.querySelector(`#${MY_WORK_ACTIVE_PANEL_ID}`) as HTMLElement;
    expect(main.querySelectorAll('[data-my-work-bento-grid]')).toHaveLength(1);
  });

  it("routes to the home surface (two-card tree under the default provider's backend-unavailable envelope)", async () => {
    const { container } = renderShell(<MyWorkShell />);
    await waitFor(() => {
      const grid = container.querySelector('[data-my-work-bento-grid]') as HTMLElement;
      const roles = Array.from(grid.querySelectorAll('[data-my-work-card-role]')).map((el) =>
        el.getAttribute('data-my-work-card-role'),
      );
      expect(roles).toEqual(['my-projects-home', 'adobe-sign-action-queue']);
    });
    const grid = container.querySelector('[data-my-work-bento-grid]') as HTMLElement;
    // Retired Adobe card roles must not appear under the live shell.
    expect(grid.querySelector('[data-my-work-card-role="adobe-sign-queue-summary"]')).toBeNull();
    expect(
      grid.querySelector('[data-my-work-card-role="adobe-sign-action-queue-home"]'),
    ).toBeNull();
    expect(grid.querySelector('[data-my-work-card-role="adobe-sign-queue-state"]')).toBeNull();
    expect(
      grid.querySelector('[data-my-work-card-role="adobe-sign-connection-guidance"]'),
    ).toBeNull();
    // Retired surface cards (Work Summary, Source Readiness) must not appear.
    expect(grid.querySelector('[data-my-work-card-role="work-summary"]')).toBeNull();
    expect(grid.querySelector('[data-my-work-card-role="source-readiness"]')).toBeNull();
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
    // Wait for the home tree to mount so the my-projects-home positional anchor exists.
    await waitFor(() =>
      expect(grid.querySelector('[data-my-work-card-role="my-projects-home"]')).not.toBeNull(),
    );
    const firstCard = grid.querySelector('[data-my-work-card-role="my-projects-home"]');
    const position = firstCard!.compareDocumentPosition(child!);
    expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeGreaterThan(0);
  });

  it('forwards forceMode to the bento grid mode marker', () => {
    const { container } = renderShell(<MyWorkShell forceMode="phone" />);
    const grid = container.querySelector('[data-my-work-bento-grid]') as HTMLElement;
    expect(grid.getAttribute('data-my-work-mode')).toBe('phone');
  });
});

describe('MyWorkShell — data-path DOM marker', () => {
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
});

describe('MyWorkShell — runtime-config-missing DOM marker', () => {
  beforeEach(() => {
    _resetConfig();
    vi.stubEnv('VITE_BACKEND_MODE', '');
    vi.stubEnv('VITE_FUNCTION_APP_URL', '');
    vi.stubEnv('VITE_API_AUDIENCE', '');
  });

  afterEach(() => {
    _resetConfig();
    vi.unstubAllEnvs();
  });

  it('omits the marker entirely in ui-review posture, regardless of getApiToken', () => {
    setRuntimeConfig({ backendMode: 'ui-review' });
    const stub = makeStubClient();
    const { container } = renderShellWithStub(stub, <MyWorkShell />);
    expect(getMissingConfigAttr(container)).toBeNull();
  });

  it('lists all three keys in deterministic order when production posture is fully unconfigured', () => {
    setRuntimeConfig({ backendMode: 'production' });
    const stub = makeStubClient();
    const { container } = renderShellWithStub(stub, <MyWorkShell />);
    expect(getMissingConfigAttr(container)).toBe(
      'function-app-url,api-audience,api-token-provider',
    );
  });

  it('drops function-app-url from the list when only the URL is configured', () => {
    setRuntimeConfig({
      backendMode: 'production',
      functionAppUrl: 'https://hb-intel.example.invalid',
    });
    const stub = makeStubClient();
    const { container } = renderShellWithStub(stub, <MyWorkShell />);
    expect(getMissingConfigAttr(container)).toBe('api-audience,api-token-provider');
  });

  it('reports api-token-provider only when URL and audience are set but no getApiToken prop is provided', () => {
    setRuntimeConfig({
      backendMode: 'production',
      functionAppUrl: 'https://hb-intel.example.invalid',
      apiAudience: 'api://example',
    });
    const stub = makeStubClient();
    const { container } = renderShellWithStub(stub, <MyWorkShell />);
    expect(getMissingConfigAttr(container)).toBe('api-token-provider');
  });

  it('omits the marker when production posture is fully configured', () => {
    setRuntimeConfig({
      backendMode: 'production',
      functionAppUrl: 'https://hb-intel.example.invalid',
      apiAudience: 'api://example',
    });
    const stub = makeStubClient();
    const { container } = renderShellWithStub(
      stub,
      <MyWorkShell getApiToken={NOOP_TOKEN_PROVIDER} />,
    );
    expect(getMissingConfigAttr(container)).toBeNull();
  });

  it('preserves the data-my-work-data-path marker independently of the missing-config marker', () => {
    setRuntimeConfig({ backendMode: 'production' });
    const stub = makeStubClient({
      getMyWorkHome: vi.fn<IMyWorkReadModelClient['getMyWorkHome']>(() => new Promise(() => {})),
    });
    const { container } = renderShellWithStub(stub, <MyWorkShell />);
    expect(getActivePanelDataPath(container)).toBe('unknown');
    expect(getMissingConfigAttr(container)).toBe(
      'function-app-url,api-audience,api-token-provider',
    );
  });
});
