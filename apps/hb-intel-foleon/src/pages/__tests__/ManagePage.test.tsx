import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { ManagePage } from '../ManagePage.js';
import { createFoleonOriginPolicy } from '../../services/FoleonOriginPolicy.js';
import type { IFoleonRuntimeContract } from '../../runtime/foleonRuntimeContract.js';
import type {
  FoleonManagedContent,
  FoleonPlacement,
} from '../../types/foleon-management.types.js';
import { FOLEON_PACKAGE_VERSION, FOLEON_WEBPART_ID } from '../../webparts/foleon/runtimeContract.js';

function managedContent(overrides: Partial<FoleonManagedContent> = {}): FoleonManagedContent {
  return {
    id: 'content-1',
    sharePointItemId: 1,
    etag: '"1"',
    title: 'Managed Foleon record',
    foleonDocId: 12345,
    contentTypeKey: 'Project Highlight',
    publishStatus: 'Published',
    isVisible: true,
    isHomepageEligible: true,
    summary: 'Managed content summary.',
    validationStatus: 'valid',
    blockingReasons: [],
    openMode: 'Inline Reader',
    allowEmbed: true,
    requiresExternalOpen: false,
    ...overrides,
  };
}

function managedPlacement(overrides: Partial<FoleonPlacement> = {}): FoleonPlacement {
  return {
    id: 'placement-1',
    sharePointItemId: 10,
    etag: '"1"',
    title: 'Project Spotlight active placement',
    placementKey: 'Project Spotlight Active',
    contentItemId: 1,
    foleonDocId: 12345,
    isActive: true,
    sortRank: 1,
    layoutVariant: 'Large Feature',
    validationStatus: 'valid',
    blockingReasons: [],
    ...overrides,
  };
}

function mockContract(overrides: Partial<IFoleonRuntimeContract> = {}): IFoleonRuntimeContract {
  return {
    hostMode: 'mock',
    route: 'manage',
    docId: null,
    siteUrl: null,
    listIds: { contentRegistry: null, placements: null, events: null },
    originPolicy: createFoleonOriginPolicy(),
    governed: {
      expectedManifestId: FOLEON_WEBPART_ID,
      expectedPackageVersion: FOLEON_PACKAGE_VERSION,
      manifestIdMatchesExpected: true,
      packageVersionMatchesExpected: true,
    },
    readerRoutePath: null,
    apiBaseUrl: 'https://functions.test',
    apiResource: null,
    getAccessToken: async () => 'token',
    telemetry: { correlationId: 'corr', sessionId: 'sess' },
    canInitialize: true,
    issues: [],
    blockingReasons: [],
    ...overrides,
  };
}

function hostedContract(overrides: Partial<IFoleonRuntimeContract> = {}): IFoleonRuntimeContract {
  return mockContract({
    hostMode: 'sharepoint',
    siteUrl: 'https://tenant.sharepoint.com/sites/HBCentral',
    listIds: {
      contentRegistry: '11111111-1111-1111-1111-111111111111',
      placements: '22222222-2222-2222-2222-222222222222',
      events: '33333333-3333-3333-3333-333333333333',
    },
    apiBaseUrl: 'https://functions.test',
    apiResource: 'api://foleon',
    foleonReadiness: {
      registryReady: true,
      listBindingsReady: true,
      backendUrlReady: true,
      authResourceReady: true,
      tokenProviderReady: true,
      tokenAcquisitionReady: true,
      backendSafeConfigReady: false,
      backendRouteAuthorizationReady: false,
      readPathReady: false,
      writePathReady: false,
      syncPathReady: false,
    },
    foleonConfigDiagnostics: { blockers: [] },
    ...overrides,
  });
}

function installManageFetchMock(args: {
  readonly content?: ReadonlyArray<FoleonManagedContent>;
  readonly placements?: ReadonlyArray<FoleonPlacement>;
  readonly safeConfig?: { readonly graphConfigured: boolean; readonly foleonApiConfigured: boolean; readonly sharePointSiteConfigured: boolean };
  readonly status?: number;
  readonly failOn?: 'all' | 'config' | 'content' | 'placements';
  readonly message?: string;
} = {}): void {
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
    const url = String(input);
    const failOn = args.failOn ?? 'all';
    const shouldFail =
      args.status &&
      args.status >= 400 &&
      (failOn === 'all' ||
        (failOn === 'config' && url.includes('/foleon/config')) ||
        (failOn === 'content' && url.includes('/foleon/content')) ||
        (failOn === 'placements' && url.includes('/foleon/placements')));
    if (shouldFail) {
      return {
        ok: false,
        status: args.status,
        json: async () => ({
          message: args.message ?? 'Manager API failed.',
          code: 'foleon.manager.test',
          requestId: 'corr-test',
        }),
      } as Response;
    }
    const ok = { ok: true as const, status: 200 };
    if (url.includes('/foleon/config')) {
      return {
        ...ok,
        json: async () => ({
          data: args.safeConfig ?? {
            graphConfigured: true,
            foleonApiConfigured: true,
            sharePointSiteConfigured: true,
          },
        }),
      } as Response;
    }
    if (url.includes('/foleon/content')) {
      return { ...ok, json: async () => ({ data: args.content ?? [] }) } as Response;
    }
    if (url.includes('/foleon/placements')) {
      return { ...ok, json: async () => ({ data: args.placements ?? [] }) } as Response;
    }
    if (url.includes('/foleon/sync/status')) {
      return {
        ...ok,
        json: async () => ({
          data: {
            health: 'ready',
            config: { graphConfigured: true, foleonApiConfigured: true, sharePointSiteConfigured: true },
          },
        }),
      } as Response;
    }
    return { ...ok, json: async () => ({ data: [] }) } as Response;
  });
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('ManagePage — Foleon Feed Manager shell', () => {
  it('wraps the entire Feed Manager surface in an inner shell chrome wrapper', async () => {
    installManageFetchMock({ content: [] });

    render(<ManagePage contract={mockContract()} onBack={(): void => undefined} />);

    const banner = await screen.findByRole('banner', { name: 'Foleon Feed Manager' });
    const chrome = document.querySelector('[data-feed-manager-shell="chrome"]') as HTMLElement | null;
    expect(chrome).toBeTruthy();
    // Chrome must NOT carry the canvas-escape attribute — width concerns and
    // padding concerns live on distinct elements so the negative-margin
    // canvas escape never collides with interior padding.
    expect(chrome?.getAttribute('data-foleon-manager-canvas')).toBeNull();
    // The canvas-escape root must be an ancestor of the chrome wrapper.
    expect(chrome?.closest('[data-foleon-manager-canvas="wide"]')).toBeTruthy();
    // The chrome wrapper must contain the full Feed Manager surface: header,
    // nav, and the active tabpanel.
    expect(chrome?.contains(banner)).toBe(true);
    const nav = within(chrome as HTMLElement).getByRole('tablist', {
      name: 'Foleon Feed Manager workspaces',
    });
    expect(nav).toBeTruthy();
    const tabs = within(chrome as HTMLElement).getAllByRole('tab');
    expect(tabs.length).toBe(4);
    const activePanel = within(chrome as HTMLElement).getByRole('tabpanel');
    expect(activePanel).toBeTruthy();
  });

  it('renders the four feed-manager tabs in order with Feed Desk selected by default', async () => {
    installManageFetchMock({ content: [] });

    render(<ManagePage contract={mockContract()} onBack={(): void => undefined} />);

    const tabs = await screen.findAllByRole('tab');
    expect(tabs.map((tab) => tab.textContent)).toEqual([
      'Feed Desk',
      'Schedule',
      'Preview',
      'Admin',
    ]);
    const feedDesk = screen.getByRole('tab', { name: 'Feed Desk' });
    expect(feedDesk.getAttribute('aria-selected')).toBe('true');
    expect(feedDesk.getAttribute('aria-controls')).toBe('foleon-feed-manager-panel-feed-desk');
    const panel = screen.getByRole('tabpanel', { name: 'Feed Desk' });
    expect(panel.getAttribute('id')).toBe('foleon-feed-manager-panel-feed-desk');
    expect(panel.getAttribute('data-feed-manager-workspace')).toBe('feed-desk');
  });

  it('does not expose retired Lane Board or Content Operations tabs', async () => {
    installManageFetchMock({ content: [] });

    render(<ManagePage contract={mockContract()} onBack={(): void => undefined} />);

    await screen.findByRole('tab', { name: 'Feed Desk' });
    expect(screen.queryByRole('tab', { name: 'Lane Board' })).toBeNull();
    expect(screen.queryByRole('tab', { name: 'Content Operations' })).toBeNull();
    expect(screen.queryByRole('tab', { name: 'Admin / Config' })).toBeNull();
  });

  it('renders the Feed Desk target structure: Feed Slots, Editorial Queue, Feed Inspector', async () => {
    installManageFetchMock({ content: [] });

    render(<ManagePage contract={mockContract()} onBack={(): void => undefined} />);

    const panel = await screen.findByRole('tabpanel', { name: 'Feed Desk' });
    expect(within(panel).getByRole('region', { name: 'Feed Slots' })).toBeTruthy();
    expect(within(panel).getByRole('region', { name: 'Editorial Queue' })).toBeTruthy();
    expect(within(panel).getByRole('complementary', { name: 'Feed Inspector' })).toBeTruthy();
    expect(panel.querySelector('[data-feed-slot="project-spotlight"]')).toBeTruthy();
    expect(panel.querySelector('[data-feed-slot="company-pulse"]')).toBeTruthy();
    expect(panel.querySelector('[data-feed-slot="leadership-message"]')).toBeTruthy();
  });

  it('feed slots render with three lanes and surface live/next/status copy from record-backed data', async () => {
    installManageFetchMock({
      content: [
        managedContent({
          title: 'Active PS edition',
          contentTypeKey: 'Project Spotlight',
          readerKey: 'project-spotlight',
          activeEdition: true,
          publishStatus: 'Published',
          isVisible: true,
          isHomepageEligible: true,
          publishedUrl: 'https://viewer.us.foleon.com/ps/live',
          embedUrl: 'https://viewer.us.foleon.com/ps/live/embed',
        }),
      ],
    });

    render(<ManagePage contract={mockContract()} onBack={(): void => undefined} />);

    await screen.findByRole('tabpanel', { name: 'Feed Desk' });
    const psSlot = document.querySelector('[data-feed-slot="project-spotlight"]') as HTMLElement | null;
    expect(psSlot).toBeTruthy();
    expect(psSlot?.textContent).toContain('Project Spotlight');
    expect(psSlot?.textContent).toContain('Active PS edition');
  });

  it('editorial queue renders rows from synced content with the Display window column', async () => {
    installManageFetchMock({
      content: [
        managedContent({
          title: 'Project edition with window',
          contentTypeKey: 'Project Spotlight',
          readerKey: 'project-spotlight',
          publishStatus: 'Published',
          isVisible: true,
          isHomepageEligible: true,
          displayFrom: '2026-04-01T00:00:00.000Z',
          displayThrough: '2026-04-30T23:59:00.000Z',
        }),
      ],
    });

    render(<ManagePage contract={mockContract()} onBack={(): void => undefined} />);

    const queue = await screen.findByRole('region', { name: 'Editorial Queue' });
    const rows = queue.querySelectorAll('[data-editorial-queue-row]');
    expect(rows.length).toBe(1);
    expect(rows[0]?.textContent).toContain('Project edition with window');
    expect(rows[0]?.textContent).toMatch(/Apr/);
  });

  it('selecting an editorial queue row populates the inspector with summary and readiness sections', async () => {
    installManageFetchMock({
      content: [
        managedContent({
          title: 'Inspectable record',
          contentTypeKey: 'Project Spotlight',
          readerKey: 'project-spotlight',
          publishStatus: 'Published',
          isVisible: true,
          isHomepageEligible: true,
        }),
      ],
    });

    render(<ManagePage contract={mockContract()} onBack={(): void => undefined} />);

    const queue = await screen.findByRole('region', { name: 'Editorial Queue' });
    const row = queue.querySelector('[data-editorial-queue-row]') as HTMLElement | null;
    expect(row).toBeTruthy();
    fireEvent.click(row!);

    const inspector = screen.getByRole('complementary', { name: 'Feed Inspector' });
    expect(within(inspector).getByRole('heading', { name: 'Inspectable record' })).toBeTruthy();
    expect(inspector.querySelector('[data-feed-inspector-section="summary"]')).toBeTruthy();
    expect(inspector.querySelector('[data-feed-inspector-section="readiness"]')).toBeTruthy();
    expect(inspector.querySelector('[data-feed-inspector-section="placement"]')).toBeTruthy();
    expect(inspector.querySelector('[data-feed-inspector-section="schedule"]')).toBeTruthy();
    expect(inspector.querySelector('[data-feed-inspector-section="preview"]')).toBeTruthy();
    expect(inspector.querySelector('[data-feed-inspector-section="publish"]')).toBeTruthy();
  });

  it('feed desk shows a "Sync from Foleon" setup callout when no content has been synced yet', async () => {
    installManageFetchMock({ content: [] });
    render(<ManagePage contract={mockContract()} onBack={(): void => undefined} />);

    const callout = await screen.findByRole('region', { name: 'Feed Desk setup' });
    expect(callout.getAttribute('data-feed-desk-callout')).toBe('empty');
    expect(callout.textContent).toContain('No Foleon content has been synced yet');
    expect(within(callout).getByRole('button', { name: 'Sync from Foleon' })).toBeTruthy();
  });

  it('editorial queue surfaces a structured empty state alongside the setup callout when content is empty', async () => {
    installManageFetchMock({ content: [] });
    render(<ManagePage contract={mockContract()} onBack={(): void => undefined} />);

    await screen.findByRole('region', { name: 'Feed Desk setup' });
    const queueEmpty = screen.getByRole('status', { name: 'Editorial Queue empty' });
    expect(queueEmpty.getAttribute('data-editorial-queue-empty')).toBe('content');
    expect(queueEmpty.textContent).toContain('No Foleon content is available yet.');
    expect(queueEmpty.textContent).toContain('Resolve sync readiness to import Foleon content.');
    expect(within(queueEmpty).getByRole('button', { name: 'Sync from Foleon' })).toBeTruthy();
  });

  it('editorial queue empty state routes to admin diagnostics when sync is blocked', async () => {
    render(
      <ManagePage
        contract={hostedContract({
          getAccessToken: undefined,
          foleonReadiness: {
            registryReady: true,
            listBindingsReady: true,
            backendUrlReady: true,
            authResourceReady: true,
            tokenProviderReady: true,
            tokenAcquisitionReady: false,
            backendSafeConfigReady: false,
            backendRouteAuthorizationReady: false,
            readPathReady: false,
            writePathReady: false,
            syncPathReady: false,
          },
          foleonConfigDiagnostics: {
            blockers: [{ code: 'token-acquisition-failed', message: 'consent_required: redacted' }],
          },
        })}
        onBack={(): void => undefined}
      />,
    );

    const queueEmpty = await screen.findByRole('status', { name: 'Editorial Queue empty' });
    expect(queueEmpty.getAttribute('data-editorial-queue-empty')).toBe('content');
    fireEvent.click(within(queueEmpty).getByRole('button', { name: 'Open admin diagnostics' }));
    expect(screen.getByRole('tab', { name: 'Admin' }).getAttribute('aria-selected')).toBe('true');
  });

  it('feed desk routes the setup callout to admin diagnostics when token is degraded', async () => {
    render(
      <ManagePage
        contract={hostedContract({
          getAccessToken: undefined,
          foleonReadiness: {
            registryReady: true,
            listBindingsReady: true,
            backendUrlReady: true,
            authResourceReady: true,
            tokenProviderReady: true,
            tokenAcquisitionReady: false,
            backendSafeConfigReady: false,
            backendRouteAuthorizationReady: false,
            readPathReady: false,
            writePathReady: false,
            syncPathReady: false,
          },
          foleonConfigDiagnostics: {
            blockers: [{ code: 'token-acquisition-failed', message: 'consent_required: redacted' }],
          },
        })}
        onBack={(): void => undefined}
      />,
    );

    const callout = await screen.findByRole('region', { name: 'Feed Desk setup' });
    expect(callout.getAttribute('data-feed-desk-callout')).toBe('token-degraded');
    fireEvent.click(within(callout).getByRole('button', { name: 'Open admin diagnostics' }));
    expect(screen.getByRole('tab', { name: 'Admin' }).getAttribute('aria-selected')).toBe('true');
  });

  it('filtering editorial queue to Unassigned shows only records without any placement', async () => {
    installManageFetchMock({
      content: [
        managedContent({
          id: 'content-1',
          sharePointItemId: 1,
          foleonDocId: 1001,
          title: 'Assigned record',
          contentTypeKey: 'Project Spotlight',
          readerKey: 'project-spotlight',
        }),
        managedContent({
          id: 'content-2',
          sharePointItemId: 2,
          foleonDocId: 1002,
          title: 'Unassigned record',
          contentTypeKey: 'Company Pulse',
          readerKey: 'company-pulse',
        }),
      ],
      placements: [
        managedPlacement({ contentItemId: 1, foleonDocId: 1001, isActive: true }),
      ],
    });

    render(<ManagePage contract={mockContract()} onBack={(): void => undefined} />);

    const queue = await screen.findByRole('region', { name: 'Editorial Queue' });
    expect(queue.querySelectorAll('[data-editorial-queue-row]').length).toBe(2);
    fireEvent.click(within(queue).getByRole('radio', { name: /Unassigned/ }));
    const filteredRows = queue.querySelectorAll('[data-editorial-queue-row]');
    expect(filteredRows.length).toBe(1);
    expect(filteredRows[0]?.textContent).toContain('Unassigned record');
  });

  it('inspector preview section disables Open Foleon with a structured reason when no safe origin is configured', async () => {
    installManageFetchMock({
      content: [
        managedContent({
          title: 'No-origin record',
          contentTypeKey: 'Project Spotlight',
          readerKey: 'project-spotlight',
        }),
      ],
    });

    render(
      <ManagePage
        contract={mockContract({ originPolicy: createFoleonOriginPolicy([]) })}
        onBack={(): void => undefined}
      />,
    );

    const queue = await screen.findByRole('region', { name: 'Editorial Queue' });
    fireEvent.click(queue.querySelector('[data-editorial-queue-row]') as HTMLElement);
    const inspector = screen.getByRole('complementary', { name: 'Feed Inspector' });
    const previewSection = inspector.querySelector(
      '[data-feed-inspector-section="preview"]',
    ) as HTMLElement;
    const openFoleon = within(previewSection).getByRole('button', { name: /Open Foleon/i }) as HTMLButtonElement;
    expect(openFoleon.disabled).toBe(true);
    const reasonId = openFoleon.getAttribute('aria-describedby');
    expect(reasonId).toBeTruthy();
    expect(document.getElementById(reasonId ?? '')?.textContent).toMatch(/HTTPS viewer origin/i);
  });

  it('inspector publish section embeds the editor and surfaces write-block reason on Save when write path is blocked', async () => {
    installManageFetchMock({
      content: [
        managedContent({
          title: 'Hosted record',
          contentTypeKey: 'Project Spotlight',
          readerKey: 'project-spotlight',
        }),
      ],
    });

    render(<ManagePage contract={hostedContract()} onBack={(): void => undefined} />);

    const queue = await screen.findByRole('region', { name: 'Editorial Queue' });
    fireEvent.click(queue.querySelector('[data-editorial-queue-row]') as HTMLElement);
    const inspector = screen.getByRole('complementary', { name: 'Feed Inspector' });
    const publishSection = inspector.querySelector(
      '[data-feed-inspector-section="publish"]',
    ) as HTMLElement;
    const save = within(publishSection).getByRole('button', { name: /^Save$/i }) as HTMLButtonElement;
    expect(save.disabled).toBe(true);
    const reasonId = save.getAttribute('aria-describedby');
    expect(reasonId).toBe('foleon-manage-write-actions-reason');
    expect(document.getElementById(reasonId ?? '')?.textContent).toMatch(/Write actions are disabled/i);
  });

  it('header renders the Foleon Feed Manager title, subtitle, and exactly one primary action', async () => {
    installManageFetchMock({ content: [] });

    render(<ManagePage contract={mockContract()} onBack={(): void => undefined} />);

    const header = await screen.findByRole('banner', { name: 'Foleon Feed Manager' });
    expect(within(header).getByRole('heading', { name: 'Foleon Feed Manager' })).toBeTruthy();
    expect(header.textContent).toContain(
      'Place Foleon-produced content into HB Central feeds, schedule display windows, and validate what employees will see.',
    );
    const primaryGroup = within(header).getByRole('group', { name: 'Header actions' });
    const primaryNodes = primaryGroup.querySelectorAll('[data-feed-manager-primary-action]');
    expect(primaryNodes.length).toBe(1);
  });

  it('default primary action is "Sync from Foleon" when sync is ready', async () => {
    installManageFetchMock({ content: [] });

    render(
      <ManagePage
        contract={hostedContract({
          foleonReadiness: {
            registryReady: true,
            listBindingsReady: true,
            backendUrlReady: true,
            authResourceReady: true,
            tokenProviderReady: true,
            tokenAcquisitionReady: true,
            backendSafeConfigReady: true,
            backendRouteAuthorizationReady: true,
            readPathReady: true,
            writePathReady: true,
            syncPathReady: true,
          },
        })}
        onBack={(): void => undefined}
      />,
    );

    const header = await screen.findByRole('banner', { name: 'Foleon Feed Manager' });
    const primary = within(header).getByRole('button', { name: 'Sync from Foleon' });
    expect(primary.closest('[data-feed-manager-primary-action="sync-foleon"]')).toBeTruthy();
  });

  it('token-degraded path changes the primary action to "Open admin diagnostics"', async () => {
    render(
      <ManagePage
        contract={hostedContract({
          getAccessToken: undefined,
          foleonReadiness: {
            registryReady: true,
            listBindingsReady: true,
            backendUrlReady: true,
            authResourceReady: true,
            tokenProviderReady: true,
            tokenAcquisitionReady: false,
            backendSafeConfigReady: false,
            backendRouteAuthorizationReady: false,
            readPathReady: false,
            writePathReady: false,
            syncPathReady: false,
          },
          foleonConfigDiagnostics: {
            blockers: [
              {
                code: 'token-acquisition-failed',
                message: 'consent_required: Approve HB SharePoint Creator / access_as_user.',
              },
            ],
          },
        })}
        onBack={(): void => undefined}
      />,
    );

    const header = await screen.findByRole('banner', { name: 'Foleon Feed Manager' });
    const primary = within(header).getByRole('button', { name: 'Open admin diagnostics' });
    expect(primary.closest('[data-feed-manager-primary-action="open-admin-diagnostics"]')).toBeTruthy();
  });

  it('renders sanitized token-degraded banner without raw diagnostics or token fragments', async () => {
    const rawPreflight = 'AADSTS7000218: eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1Ni';
    render(
      <ManagePage
        contract={hostedContract({
          foleonReadiness: {
            registryReady: true,
            listBindingsReady: true,
            backendUrlReady: true,
            authResourceReady: true,
            tokenProviderReady: true,
            tokenAcquisitionReady: false,
            backendSafeConfigReady: true,
            backendRouteAuthorizationReady: true,
            readPathReady: true,
            writePathReady: false,
            syncPathReady: false,
          },
          foleonConfigDiagnostics: {
            blockers: [{ code: 'token-acquisition-failed', message: rawPreflight }],
          },
        })}
        onBack={(): void => undefined}
      />,
    );

    const banner = await screen.findByRole('status', { name: 'API access required' });
    expect(banner.textContent).not.toContain(rawPreflight);
    expect(banner.textContent).not.toContain('eyJ');
    expect(banner.textContent).not.toContain('consent_required');
    const technical = within(banner).getByText('Technical reference').closest('details');
    expect(technical?.textContent).toContain('token-acquisition-failed');
    expect(within(banner).getByRole('button', { name: 'Retry API readiness' })).toBeTruthy();
  });

  it('shell does not leak raw API base URL, API resource, or list GUIDs into the visible header or banners', async () => {
    installManageFetchMock({ content: [] });
    const rawBackendUrl = 'https://functions.secret.example.test';
    const rawApiResource = 'api://08c399eb-a394-4087-b859-659d493f8dc7';
    const rawListGuid = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

    render(
      <ManagePage
        contract={hostedContract({
          apiBaseUrl: rawBackendUrl,
          apiResource: rawApiResource,
          listIds: { contentRegistry: rawListGuid, placements: rawListGuid, events: rawListGuid },
        })}
        onBack={(): void => undefined}
      />,
    );

    const header = await screen.findByRole('banner', { name: 'Foleon Feed Manager' });
    expect(header.textContent).not.toContain(rawBackendUrl);
    expect(header.textContent).not.toContain(rawApiResource);
    expect(header.textContent).not.toContain(rawListGuid);
    expect(header.textContent).not.toMatch(/token-/i);
  });

  it('utility cluster surfaces a structured disabled reason when Open Foleon has no safe origin', async () => {
    installManageFetchMock({ content: [] });

    render(
      <ManagePage
        contract={mockContract({ originPolicy: createFoleonOriginPolicy([]) })}
        onBack={(): void => undefined}
      />,
    );

    const header = await screen.findByRole('banner', { name: 'Foleon Feed Manager' });
    const utility = within(header).getByRole('group', { name: 'Utility actions' });
    const openFoleon = within(utility).getByRole('button', { name: 'Open Foleon' }) as HTMLButtonElement;
    expect(openFoleon.disabled).toBe(true);
    const reasonId = openFoleon.getAttribute('aria-describedby');
    expect(reasonId).toBeTruthy();
    expect(document.getElementById(reasonId ?? '')?.textContent).toMatch(/HTTPS viewer origin/i);
  });

  it('Back utility action invokes onBack', async () => {
    installManageFetchMock({ content: [] });
    const onBack = vi.fn();
    render(<ManagePage contract={mockContract()} onBack={onBack} />);

    const header = await screen.findByRole('banner', { name: 'Foleon Feed Manager' });
    fireEvent.click(within(header).getByRole('button', { name: 'Back' }));
    expect(onBack).toHaveBeenCalled();
  });

  it('supports keyboard tab switching across the four feed-manager keys', async () => {
    installManageFetchMock({ content: [] });
    render(<ManagePage contract={mockContract()} onBack={(): void => undefined} />);

    const feedDesk = await screen.findByRole('tab', { name: 'Feed Desk' });
    const schedule = screen.getByRole('tab', { name: 'Schedule' });
    const preview = screen.getByRole('tab', { name: 'Preview' });
    const admin = screen.getByRole('tab', { name: 'Admin' });

    (feedDesk as HTMLButtonElement).focus();
    fireEvent.keyDown(feedDesk, { key: 'ArrowRight' });
    expect(schedule.getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(schedule);
    fireEvent.keyDown(schedule, { key: 'End' });
    expect(admin.getAttribute('aria-selected')).toBe('true');
    fireEvent.keyDown(admin, { key: 'Home' });
    expect(feedDesk.getAttribute('aria-selected')).toBe('true');
    fireEvent.keyDown(feedDesk, { key: 'ArrowLeft' });
    expect(admin.getAttribute('aria-selected')).toBe('true');
    fireEvent.keyDown(admin, { key: 'ArrowLeft' });
    expect(preview.getAttribute('aria-selected')).toBe('true');
  });

  it('Schedule and Preview render product-safe blocked-state copy without dev/process language', async () => {
    installManageFetchMock({ content: [] });
    render(<ManagePage contract={mockContract()} onBack={(): void => undefined} />);

    fireEvent.click(await screen.findByRole('tab', { name: 'Schedule' }));
    const schedule = screen.getByRole('tabpanel', { name: 'Schedule' });
    expect(schedule.textContent).toContain('Display windows for placed Foleon content appear here.');
    expect(schedule.textContent).toContain('No scheduled content yet.');
    expect(schedule.textContent).not.toMatch(/coming soon|prompt|wave|next prompt|TODO/i);

    fireEvent.click(screen.getByRole('tab', { name: 'Preview' }));
    const preview = screen.getByRole('tabpanel', { name: 'Preview' });
    expect(preview.textContent).toContain(
      'Employee-facing preview of placed Foleon content. Preview is unavailable until a placement is scheduled.',
    );
    expect(preview.textContent).not.toMatch(/coming soon|prompt|wave|next prompt|TODO/i);
    expect(preview.querySelector('iframe')).toBeNull();
  });

  it('Admin tab renders FoleonConfigTab diagnostics surface', async () => {
    installManageFetchMock({ content: [] });

    render(
      <ManagePage
        contract={hostedContract({
          foleonReadiness: {
            registryReady: true,
            listBindingsReady: true,
            backendUrlReady: true,
            authResourceReady: true,
            tokenProviderReady: true,
            tokenAcquisitionReady: true,
            backendSafeConfigReady: true,
            backendRouteAuthorizationReady: true,
            readPathReady: true,
            writePathReady: true,
            syncPathReady: true,
          },
          foleonConfigDiagnostics: { blockers: [] },
        })}
        onBack={(): void => undefined}
      />,
    );

    fireEvent.click(await screen.findByRole('tab', { name: 'Admin' }));
    const adminPanel = screen.getByRole('tabpanel', { name: 'Admin' });
    expect(within(adminPanel).getByRole('region', { name: /System health summary/i })).toBeTruthy();
  });

  it('Admin diagnostics show/hide toggle exposes redacted proof and sync history', async () => {
    installManageFetchMock({ content: [] });

    render(<ManagePage contract={mockContract()} onBack={(): void => undefined} />);

    fireEvent.click(await screen.findByRole('tab', { name: 'Admin' }));
    expect(screen.queryByRole('button', { name: 'Copy redacted proof' })).toBeNull();
    fireEvent.click(
      screen.getByRole('button', {
        name: /Show redacted diagnostics, sync history, and technical proof/i,
      }),
    );
    expect(screen.getByRole('button', { name: 'Copy redacted proof' })).toBeTruthy();
    expect(screen.getByRole('region', { name: /Sync run history/i })).toBeTruthy();
  });

  it('opening admin diagnostics from the header primary action selects the Admin tab and expands diagnostics', async () => {
    installManageFetchMock({ content: [] });
    render(
      <ManagePage
        contract={hostedContract({
          getAccessToken: undefined,
          foleonReadiness: {
            registryReady: true,
            listBindingsReady: true,
            backendUrlReady: true,
            authResourceReady: true,
            tokenProviderReady: true,
            tokenAcquisitionReady: false,
            backendSafeConfigReady: false,
            backendRouteAuthorizationReady: false,
            readPathReady: false,
            writePathReady: false,
            syncPathReady: false,
          },
          foleonConfigDiagnostics: {
            blockers: [{ code: 'token-acquisition-failed', message: 'consent_required: redacted' }],
          },
        })}
        onBack={(): void => undefined}
      />,
    );

    const header = await screen.findByRole('banner', { name: 'Foleon Feed Manager' });
    fireEvent.click(within(header).getByRole('button', { name: 'Open admin diagnostics' }));
    expect(screen.getByRole('tab', { name: 'Admin' }).getAttribute('aria-selected')).toBe('true');
    expect(
      screen.getByRole('button', {
        name: /Hide redacted diagnostics, sync history, and technical proof/i,
      }).getAttribute('aria-expanded'),
    ).toBe('true');
  });

  it('does not surface raw config values in the Admin diagnostics tab', async () => {
    installManageFetchMock({ content: [] });
    const rawBackendUrl = 'https://functions.secret.example.test';
    const rawApiResource = 'api://08c399eb-a394-4087-b859-659d493f8dc7';
    const rawListGuid = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

    render(
      <ManagePage
        contract={hostedContract({
          apiBaseUrl: rawBackendUrl,
          apiResource: rawApiResource,
          listIds: { contentRegistry: rawListGuid, placements: rawListGuid, events: rawListGuid },
        })}
        onBack={(): void => undefined}
      />,
    );

    fireEvent.click(await screen.findByRole('tab', { name: 'Admin' }));
    const text = screen.getByRole('tabpanel', { name: 'Admin' }).textContent ?? '';
    expect(text).not.toContain(rawBackendUrl);
    expect(text).not.toContain(rawApiResource);
    expect(text).not.toContain(rawListGuid);
    expect(text).not.toContain('FoleonContentRegistryListGuid');
  });

  it('renders blocked state for backend-url-missing preflight without exposing manager controls', async () => {
    render(
      <ManagePage
        contract={hostedContract({
          apiBaseUrl: null,
          getAccessToken: undefined,
          foleonReadiness: {
            registryReady: true,
            listBindingsReady: true,
            backendUrlReady: false,
            authResourceReady: true,
            tokenProviderReady: false,
            tokenAcquisitionReady: false,
            backendSafeConfigReady: false,
            backendRouteAuthorizationReady: false,
            readPathReady: false,
            writePathReady: false,
            syncPathReady: false,
          },
        })}
        onBack={(): void => undefined}
      />,
    );

    expect((await screen.findByRole('alert')).textContent).toContain('Foleon Manager cannot load yet');
    expect(screen.getByRole('alert').textContent).toContain('backend-url-missing');
    expect(screen.queryByRole('tab', { name: 'Feed Desk' })).toBeNull();
  });

  it('renders blocked state for auth-resource-missing preflight', async () => {
    render(
      <ManagePage
        contract={hostedContract({
          apiResource: null,
          foleonReadiness: {
            registryReady: true,
            listBindingsReady: true,
            backendUrlReady: true,
            authResourceReady: false,
            tokenProviderReady: false,
            tokenAcquisitionReady: false,
            backendSafeConfigReady: false,
            backendRouteAuthorizationReady: false,
            readPathReady: false,
            writePathReady: false,
            syncPathReady: false,
          },
        })}
        onBack={(): void => undefined}
      />,
    );

    expect((await screen.findByRole('alert')).textContent).toContain('auth-resource-missing');
  });

  it('renders backend-route-authorization-failed error when content read is rejected', async () => {
    installManageFetchMock({
      status: 403,
      failOn: 'content',
      message: 'You are not authorized to manage Foleon content.',
    });

    render(<ManagePage contract={hostedContract()} onBack={(): void => undefined} />);

    expect((await screen.findByRole('alert')).textContent).toContain('backend-route-authorization-failed');
    expect(screen.queryByRole('tab', { name: 'Feed Desk' })).toBeNull();
  });

  it('keeps the canvas escape attribute on the manager root only', async () => {
    installManageFetchMock({ content: [] });
    render(<ManagePage contract={mockContract()} onBack={(): void => undefined} />);

    await screen.findByRole('heading', { name: 'Foleon Feed Manager' });
    document.querySelectorAll('[data-foleon-manager-canvas="wide"]').forEach((node) => {
      expect((node as HTMLElement).classList.contains('foleonManageRoot')).toBe(true);
    });
  });

  it('copies redacted diagnostics JSON when Copy redacted proof is used', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(globalThis.navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
      writable: true,
    });
    installManageFetchMock({ content: [] });
    render(<ManagePage contract={mockContract()} onBack={(): void => undefined} />);

    await screen.findByRole('heading', { name: 'Foleon Feed Manager' });
    fireEvent.click(screen.getByRole('tab', { name: 'Admin' }));
    fireEvent.click(
      screen.getByRole('button', {
        name: /Show redacted diagnostics, sync history, and technical proof/i,
      }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Copy redacted proof' }));
    await waitFor(() => {
      expect(writeText).toHaveBeenCalled();
    });
    const payload = writeText.mock.calls[0]?.[0] as string;
    expect(payload).toContain('"hostMode"');
    expect(payload).not.toContain('https://functions.test');
    delete (globalThis.navigator as { clipboard?: unknown }).clipboard;
  });

  it('ranks API approval actions above list binding actions in Required admin actions', async () => {
    installManageFetchMock({ content: [] });
    render(
      <ManagePage
        contract={mockContract({
          foleonReadiness: {
            registryReady: true,
            listBindingsReady: false,
            backendUrlReady: true,
            authResourceReady: true,
            tokenProviderReady: true,
            tokenAcquisitionReady: false,
            backendSafeConfigReady: false,
            backendRouteAuthorizationReady: false,
            readPathReady: false,
            writePathReady: false,
            syncPathReady: false,
          },
          foleonConfigDiagnostics: {
            blockers: [
              {
                code: 'token-acquisition-failed',
                message: 'consent_required: Approve HB SharePoint Creator / access_as_user.',
              },
              { code: 'list-bindings-missing', message: 'List bindings are missing for this site.' },
            ],
          },
        })}
        onBack={(): void => undefined}
      />,
    );

    fireEvent.click(await screen.findByRole('tab', { name: 'Admin' }));
    const list = screen.getByRole('region', { name: /Required admin actions/i }).querySelector('ol');
    expect(list).toBeTruthy();
    const items = within(list as HTMLElement).getAllByRole('listitem');
    expect(items.length).toBeGreaterThanOrEqual(2);
    expect(items[0]?.textContent).toMatch(/Approve API access|API token/i);
    expect(items.some((li) => li.textContent?.includes('Bind required SharePoint lists'))).toBe(true);
  });
});

