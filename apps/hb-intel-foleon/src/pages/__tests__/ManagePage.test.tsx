import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { ManagePage } from '../ManagePage.js';
import { createFoleonOriginPolicy } from '../../services/FoleonOriginPolicy.js';
import type { IFoleonRuntimeContract } from '../../runtime/foleonRuntimeContract.js';
import type { FoleonManagedContent, FoleonPlacement } from '../../types/foleon-management.types.js';
import { FOLEON_PACKAGE_VERSION, FOLEON_WEBPART_ID } from '../../webparts/foleon/runtimeContract.js';

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

describe('ManagePage', () => {
  it('renders four primary nav entries with Content Operations selected by default', async () => {
    installManageFetchMock({ content: [] });

    render(<ManagePage contract={mockContract()} onBack={(): void => undefined} />);

    const contentTab = await screen.findByRole('tab', { name: 'Content Operations' });
    const laneBoardTab = screen.getByRole('tab', { name: 'Lane Board' });
    const previewTab = screen.getByRole('tab', { name: 'Preview' });
    const adminTab = screen.getByRole('tab', { name: 'Admin / Config' });
    expect(contentTab.getAttribute('aria-selected')).toBe('true');
    expect(laneBoardTab.getAttribute('aria-selected')).toBe('false');
    expect(previewTab.getAttribute('aria-selected')).toBe('false');
    expect(adminTab.getAttribute('aria-selected')).toBe('false');
    expect((laneBoardTab as HTMLButtonElement).disabled).toBe(false);
    expect((previewTab as HTMLButtonElement).disabled).toBe(false);
    expect(contentTab.getAttribute('aria-controls')).toBe('foleon-manage-panel-content-operations');
    expect(adminTab.getAttribute('aria-controls')).toBe('foleon-manage-panel-admin-config');
    expect(screen.getByRole('tabpanel', { name: 'Content Operations' }).getAttribute('id')).toBe('foleon-manage-panel-content-operations');
  });

  it('supports keyboard tab switching with Arrow/Home/End keys across the four-key nav', async () => {
    installManageFetchMock({ content: [] });
    render(<ManagePage contract={mockContract()} onBack={(): void => undefined} />);

    const contentTab = await screen.findByRole('tab', { name: 'Content Operations' });
    const laneBoardTab = screen.getByRole('tab', { name: 'Lane Board' });
    const previewTab = screen.getByRole('tab', { name: 'Preview' });
    const adminTab = screen.getByRole('tab', { name: 'Admin / Config' });
    (contentTab as HTMLButtonElement).focus();
    fireEvent.keyDown(contentTab, { key: 'ArrowRight' });
    expect(laneBoardTab.getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(laneBoardTab);
    fireEvent.keyDown(laneBoardTab, { key: 'ArrowRight' });
    expect(previewTab.getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(previewTab);
    fireEvent.keyDown(previewTab, { key: 'End' });
    expect(adminTab.getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(adminTab);
    fireEvent.keyDown(adminTab, { key: 'Home' });
    expect(contentTab.getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(contentTab);
    fireEvent.keyDown(contentTab, { key: 'ArrowLeft' });
    expect(adminTab.getAttribute('aria-selected')).toBe('true');
  });

  it('renders the three homepage lane columns on the Lane Board', async () => {
    installManageFetchMock({
      content: [
        managedContent({ title: 'Project Spotlight edition', readerKey: 'project-spotlight', contentTypeKey: 'Project Spotlight', activeEdition: true }),
        managedContent({ id: 'content-2', sharePointItemId: 2, title: 'Company Pulse edition', readerKey: 'company-pulse', contentTypeKey: 'Company Pulse', activeEdition: true }),
        managedContent({ id: 'content-3', sharePointItemId: 3, title: 'Leadership edition', readerKey: 'leadership-message', contentTypeKey: 'Leadership', activeEdition: true }),
      ],
    });

    render(<ManagePage contract={mockContract()} onBack={(): void => undefined} />);

    fireEvent.click(await screen.findByRole('tab', { name: 'Lane Board' }));
    const board = screen.getByRole('tabpanel', { name: 'Lane Board' });
    const columns = board.querySelectorAll('[data-lane-key]');
    expect(columns.length).toBe(3);
    expect(within(board).getByRole('listitem', { name: /Project Spotlight lane/i })).toBeTruthy();
    expect(within(board).getByRole('listitem', { name: /Company Pulse lane/i })).toBeTruthy();
    expect(within(board).getByRole('listitem', { name: /Leadership Message lane/i })).toBeTruthy();
  });

  it('renders the content-operations workspace markers and inbox panel by default', async () => {
    installManageFetchMock({
      content: [managedContent({ readerKey: 'project-spotlight', contentTypeKey: 'Project Spotlight', activeEdition: true })],
      placements: [managedPlacement()],
    });

    render(<ManagePage contract={mockContract()} onBack={(): void => undefined} />);

    const workspace = await screen.findByRole('tabpanel', { name: 'Content Operations' });
    expect(workspace.getAttribute('data-manager-workspace')).toBe('content-operations');
    expect(within(workspace).getByRole('region', { name: 'Content inbox' })).toBeTruthy();
    expect(document.querySelector('[data-manager-layout]')).toBeTruthy();
  });

  it('opens the contextual workflow panel when an inbox row is selected', async () => {
    installManageFetchMock({
      content: [
        managedContent({ title: 'Project edition', readerKey: 'project-spotlight', contentTypeKey: 'Project Spotlight', activeEdition: true }),
      ],
    });

    render(<ManagePage contract={mockContract()} onBack={(): void => undefined} />);

    const inbox = await screen.findByRole('region', { name: 'Content inbox' });
    const row = within(inbox).getByRole('button', { name: /Project edition/ });
    fireEvent.click(row);
    const panel = screen.getByRole('dialog', { name: 'Project edition' });
    expect(panel.getAttribute('data-foleon-workflow-panel')).toBe('open');
  });

  it('renders six system health regions with split readiness on the Config tab', async () => {
    installManageFetchMock({ content: [managedContent()] });

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
            backendSafeConfigReady: false,
            backendRouteAuthorizationReady: false,
            readPathReady: true,
            writePathReady: false,
            syncPathReady: false,
          },
          foleonConfigDiagnostics: {
            registryFetchStatus: 'available',
            registrySecretHygieneStatus: 'pass',
            registryDuplicateActiveKeysDetected: false,
            configSourceByKey: {
              FoleonContentRegistryListGuid: 'override',
              FoleonHomepagePlacementsListGuid: 'registry',
              FoleonInteractionEventsListGuid: 'default',
              FoleonSyncRunsListGuid: 'missing',
              FoleonApiBaseUrl: 'blocked',
            },
            configStatusByKey: {
              FoleonContentRegistryListGuid: 'override',
              FoleonHomepagePlacementsListGuid: 'registry',
              FoleonInteractionEventsListGuid: 'default',
              FoleonSyncRunsListGuid: 'missing',
              FoleonApiBaseUrl: 'blocked',
            },
            blockers: [],
          },
        })}
        onBack={(): void => undefined}
      />,
    );

    await screen.findByRole('region', { name: 'Content inbox' });
    fireEvent.click(screen.getByRole('tab', { name: 'Admin / Config' }));

    expect(screen.getByRole('tabpanel', { name: 'Admin / Config' })).toBeTruthy();
    expect(screen.getByRole('region', { name: /System health summary/i })).toBeTruthy();
    expect(screen.getByRole('region', { name: /^API approval and tokens$/i })).toBeTruthy();
    expect(screen.getByRole('region', { name: /^Backend connection$/i })).toBeTruthy();
    expect(screen.getByRole('region', { name: /^Registry connection$/i })).toBeTruthy();
    expect(screen.getByRole('region', { name: /^SharePoint lists$/i })).toBeTruthy();
    expect(screen.getByRole('region', { name: /^Route authorization and publishing access$/i })).toBeTruthy();
    expect(screen.getByRole('region', { name: /^Sync access and packaging$/i })).toBeTruthy();
    expect(screen.getByText('API token acquisition')).toBeTruthy();
    expect(screen.getByText('Safe configuration probe')).toBeTruthy();
    expect(screen.getByText('Route authorization')).toBeTruthy();
    expect(screen.getByText('Read access')).toBeTruthy();
    expect(screen.getByText('Publishing (write) access')).toBeTruthy();
    expect(screen.getByText('Sync access')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /Show redacted diagnostics, sync history, and technical proof/i }));
    await waitFor(() => {
      expect(screen.getByText('Config source by setting (technical names)')).toBeTruthy();
    });
    fireEvent.click(screen.getByText('Config source by setting (technical names)'));
    expect(screen.getAllByText('Override').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Registry').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Default').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Missing').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Blocked').length).toBeGreaterThan(0);
  });

  it('keeps apiBaseUrl-only and backend readiness gaps from showing write readiness', async () => {
    installManageFetchMock({ content: [managedContent()] });

    render(
      <ManagePage
        contract={hostedContract({
          foleonReadiness: {
            registryReady: true,
            listBindingsReady: true,
            backendUrlReady: true,
            authResourceReady: false,
            tokenProviderReady: false,
            tokenAcquisitionReady: false,
            backendSafeConfigReady: false,
            backendRouteAuthorizationReady: false,
            readPathReady: true,
            writePathReady: false,
            syncPathReady: false,
          },
        })}
        onBack={(): void => undefined}
      />,
    );

    expect((await screen.findByRole('alert')).textContent).toContain('auth-resource-missing');
  });

  it('keeps Save and Publish disabled when the workflow panel opens for a live record on a write-blocked tenant', async () => {
    installManageFetchMock({
      content: [managedContent({
        title: 'Live Project Spotlight',
        contentTypeKey: 'Project Spotlight',
        readerKey: 'project-spotlight',
        homepageSlot: 'Project Spotlight Reader',
        activeEdition: true,
        publishedUrl: 'https://viewer.us.foleon.com/project/live',
        embedUrl: 'https://viewer.us.foleon.com/project/live/embed',
      })],
      placements: [managedPlacement()],
    });

    render(<ManagePage contract={hostedContract()} onBack={(): void => undefined} />);

    const inbox = await screen.findByRole('region', { name: 'Content inbox' });
    fireEvent.click(within(inbox).getByRole('button', { name: /Live Project Spotlight/ }));
    const panel = screen.getByRole('dialog', { name: 'Live Project Spotlight' });
    expect((within(panel).getByRole('button', { name: /^Save$/i }) as HTMLButtonElement).disabled).toBe(true);
    expect(
      within(panel)
        .getAllByRole('button', { name: /Publish/i })
        .filter((button) => /^(Publish|Publish blocked)$/.test(button.textContent?.trim() ?? ''))
        .every((button) => (button as HTMLButtonElement).disabled),
    ).toBe(true);
  });

  it('shows lane state microcopy on the Lane Board for a live lane', async () => {
    installManageFetchMock({
      content: [managedContent({
        title: 'Live Project Spotlight',
        contentTypeKey: 'Project Spotlight',
        readerKey: 'project-spotlight',
        homepageSlot: 'Project Spotlight Reader',
        activeEdition: true,
        archiveGroup: '2026-Q1',
        publishedUrl: 'https://viewer.us.foleon.com/project/live',
        embedUrl: 'https://viewer.us.foleon.com/project/live/embed',
      })],
      placements: [managedPlacement()],
    });

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

    fireEvent.click(await screen.findByRole('tab', { name: 'Lane Board' }));
    const psColumn = screen.getByRole('listitem', { name: /Project Spotlight lane/i });
    expect(psColumn.textContent).toContain('Shown to visitors');
  });

  it('does not surface raw token acquisition diagnostics in the primary API banner', async () => {
    installManageFetchMock({ content: [] });
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
  });

  it('does not render unsafe raw config values in the normal Config UI', async () => {
    installManageFetchMock({ content: [managedContent()] });
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

    await screen.findByRole('region', { name: 'Content inbox' });
    fireEvent.click(screen.getByRole('tab', { name: 'Admin / Config' }));
    const normalConfigText = screen.getByRole('tabpanel', { name: 'Admin / Config' }).textContent ?? '';

    expect(normalConfigText).not.toContain(rawBackendUrl);
    expect(normalConfigText).not.toContain(rawApiResource);
    expect(normalConfigText).not.toContain(rawListGuid);
    expect(normalConfigText).not.toContain('token-');
    expect(normalConfigText).not.toContain('FoleonContentRegistryListGuid');
    expect(normalConfigText).not.toContain('HB_Foleon');
    expect(normalConfigText).not.toContain('Config key');
  });

  it('renders manage shell and inbox for zero content without iframe hosts and keeps sync history under Admin diagnostics', async () => {
    installManageFetchMock({ content: [] });

    render(<ManagePage contract={mockContract()} onBack={(): void => undefined} />);

    expect((await screen.findByRole('heading', { name: /Foleon Content Operations/i })).textContent).toMatch(/Foleon Content Operations/i);
    const inbox = screen.getByRole('region', { name: 'Content inbox' });
    expect(inbox.textContent).toContain('No content yet');
    expect(screen.queryByRole('region', { name: /Sync run history/i })).toBeNull();
    fireEvent.click(screen.getByRole('tab', { name: 'Admin / Config' }));
    fireEvent.click(screen.getByRole('button', { name: /Show redacted diagnostics, sync history, and technical proof/i }));
    expect(screen.getByRole('region', { name: /Sync run history/i })).toBeTruthy();
    expect(document.querySelector('iframe')).toBeNull();
  });

  it('routes a draft record into the staged or unassigned inbox bucket without inventing reader output', async () => {
    installManageFetchMock({
      content: [managedContent({ publishStatus: 'Draft', isVisible: true, isHomepageEligible: true })],
    });

    render(<ManagePage contract={mockContract()} onBack={(): void => undefined} />);

    const inbox = await screen.findByRole('region', { name: 'Content inbox' });
    expect(inbox.querySelector('[data-bucket-id="unassigned"]')?.textContent).toContain('Managed Foleon record');
    expect(inbox.querySelector('iframe')).toBeNull();
  });

  it('routes a published-eligible placed record into the live or published-eligible bucket', async () => {
    installManageFetchMock({
      content: [managedContent({ publishStatus: 'Published', isVisible: true, isHomepageEligible: true })],
    });

    render(<ManagePage contract={mockContract()} onBack={(): void => undefined} />);

    const inbox = await screen.findByRole('region', { name: 'Content inbox' });
    expect(inbox.textContent).toContain('Managed Foleon record');
    expect(screen.queryByRole('region', { name: /Sync run history/i })).toBeNull();
    fireEvent.click(screen.getByRole('tab', { name: 'Admin / Config' }));
    fireEvent.click(screen.getByRole('button', { name: /Show redacted diagnostics, sync history, and technical proof/i }));
    expect(screen.getByRole('region', { name: /Sync run history/i })).toBeTruthy();
  });

  it('does not render preview guidance in backend-blocked state', async () => {
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
    expect(screen.queryByText('Preview structure active')).toBeNull();
  });

  it('blocks hosted Manager when apiBaseUrl is present without an API resource', async () => {
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

  it('renders Manager shell in API consent required degraded mode', async () => {
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
                message: 'consent_required: Approve HB SharePoint Creator / access_as_user in SharePoint Admin Center API access.',
              },
            ],
          },
        })}
        onBack={(): void => undefined}
      />,
    );

    expect(await screen.findByRole('heading', { name: /Foleon Content Operations/i })).toBeTruthy();
    expect(screen.getByRole('status', { name: 'Limited mode' })).toBeTruthy();
    expect(screen.getByRole('status', { name: 'API access required' })).toBeTruthy();
    const apiBanner = screen.getByRole('status', { name: 'API access required' });
    expect(apiBanner.textContent).toContain('API access for the Foleon integration');
    expect(apiBanner.textContent).toContain('Admin Center API access');
    expect(apiBanner.textContent).not.toContain('consent_required');
    const technical = within(apiBanner).getByText('Technical reference').closest('details');
    expect(technical?.textContent).toContain('token-acquisition-failed');
    const syncPrimary = screen.getByRole('button', { name: 'Sync blocked' }) as HTMLButtonElement;
    const syncReadinessId = syncPrimary.getAttribute('aria-describedby');
    expect(syncReadinessId).toBe('foleon-manage-sync-readiness');
    expect(document.getElementById(syncReadinessId ?? '')?.textContent).toMatch(/approved API access|API access/i);
    expect(screen.getByRole('list', { name: 'Manager status' })).toBeTruthy();
    expect(screen.getByRole('tab', { name: 'Content Operations' })).toBeTruthy();
    expect(screen.getByRole('tab', { name: 'Lane Board' })).toBeTruthy();
    expect(screen.getByRole('tab', { name: 'Preview' })).toBeTruthy();
    expect(screen.getByRole('tab', { name: 'Admin / Config' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Retry API readiness' })).toBeTruthy();
    expect((screen.getByRole('button', { name: 'Sync blocked' }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('renders Config consent_required state without raw secrets or tokens', async () => {
    const rawToken = 'ey.secret-token-value';
    const rawSecret = 'client-secret-value';
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
                message: `consent_required: approve access_as_user. ${rawToken} ${rawSecret}`,
              },
            ],
          },
        })}
        onBack={(): void => undefined}
      />,
    );

    await screen.findByRole('tab', { name: 'Admin / Config' });
    fireEvent.click(screen.getByRole('tab', { name: 'Admin / Config' }));

    const configText = screen.getByRole('tabpanel', { name: 'Admin / Config' }).textContent ?? '';
    expect(screen.getByRole('region', { name: 'API approval required' })).toBeTruthy();
    expect(configText).toContain('API approval required');
    expect(configText).toContain('Tenant approval needed for the Foleon API');
    expect(configText).toMatch(/Approve API access for the Foleon integration/i);
    expect(configText).not.toContain(rawToken);
    expect(configText).not.toContain(rawSecret);
  });

  it('does not expose manager controls when the runtime authorization check is rejected', async () => {
    installManageFetchMock({
      status: 403,
      failOn: 'content',
      message: 'You are not authorized to manage Foleon content.',
    });

    render(<ManagePage contract={hostedContract()} onBack={(): void => undefined} />);

    expect((await screen.findByRole('alert')).textContent).toContain(
      'backend-route-authorization-failed',
    );
    expect(screen.queryByRole('complementary', { name: /Foleon content registry/i })).toBeNull();
    expect(screen.queryByText('Preview structure active')).toBeNull();
    expect(screen.queryByRole('button', { name: /Sync Foleon/i })).toBeNull();
    expect(document.querySelector('iframe')).toBeNull();
  });

  it('blocks hosted Manager when backend safe config cannot be proven', async () => {
    installManageFetchMock({
      status: 500,
      failOn: 'config',
      message: 'Safe config unavailable.',
    });

    render(<ManagePage contract={hostedContract()} onBack={(): void => undefined} />);

    expect((await screen.findByRole('alert')).textContent).toContain('backend-safe-config-unavailable');
  });

  it('loads hosted Manager reads after token readiness and read-only backend probes pass', async () => {
    installManageFetchMock({
      content: [managedContent({ publishStatus: 'Published', isVisible: true, isHomepageEligible: true })],
    });

    render(<ManagePage contract={hostedContract()} onBack={(): void => undefined} />);

    expect(await screen.findByRole('region', { name: 'Content inbox' })).toBeTruthy();
    const calls = (globalThis.fetch as unknown as { readonly mock: { readonly calls: ReadonlyArray<ReadonlyArray<unknown>> } }).mock.calls;
    expect(calls.filter((call) => String(call[0]).includes('/foleon/content')).length).toBe(1);
    expect(calls.filter((call) => String(call[0]).includes('/foleon/placements')).length).toBe(1);
  });

  it('keeps sync readiness separate from content and placement reads', async () => {
    installManageFetchMock({
      safeConfig: {
        graphConfigured: true,
        foleonApiConfigured: false,
        sharePointSiteConfigured: true,
      },
      content: [managedContent({ publishStatus: 'Published', isVisible: true, isHomepageEligible: true })],
    });

    render(<ManagePage contract={hostedContract()} onBack={(): void => undefined} />);

    expect(await screen.findByRole('region', { name: 'Content inbox' })).toBeTruthy();
    expect(screen.getAllByRole('status').some((entry) =>
      entry.textContent?.includes('backend Foleon OAuth configuration is incomplete')
    )).toBe(true);
  });

  it('keeps the Preview placeholder read-only without fake admin actions or invented reader output', async () => {
    installManageFetchMock({ content: [] });

    render(<ManagePage contract={mockContract()} onBack={(): void => undefined} />);

    fireEvent.click(await screen.findByRole('tab', { name: 'Preview' }));
    const panel = screen.getByRole('tabpanel', { name: 'Preview' });
    expect(panel.querySelector('iframe')).toBeNull();
    expect(panel.querySelector('input, textarea, select')).toBeNull();
    expect(panel.textContent).not.toContain('Sync Docs');
    expect(panel.textContent).not.toContain('Create placement');
  });

  it('loads and saves reader lane fields without silent field loss when the workflow panel is open', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    installManageFetchMock({
      content: [managedContent({
        contentTypeKey: 'Company Pulse',
        readerKey: 'company-pulse',
        cadence: 'Frequent',
        homepageSlot: 'Company Pulse Reader',
        archiveGroup: '2026-Q2',
        activeEdition: true,
        primaryAudience: 'Operations',
        lastEditorialUpdate: '2026-04-25T12:00:00.000Z',
      })],
    });

    render(<ManagePage contract={mockContract()} onBack={(): void => undefined} />);

    const inbox = await screen.findByRole('region', { name: 'Content inbox' });
    fireEvent.click(within(inbox).getByRole('button', { name: /Managed Foleon record/ }));
    const panel = screen.getByRole('dialog', { name: 'Managed Foleon record' });

    expect(within(panel).getByDisplayValue('company-pulse')).toBeTruthy();
    expect(within(panel).getByDisplayValue('Frequent')).toBeTruthy();
    expect(within(panel).getByDisplayValue('Company Pulse Reader')).toBeTruthy();
    expect(within(panel).getByDisplayValue('2026-Q2')).toBeTruthy();
    expect(within(panel).getByDisplayValue('Operations')).toBeTruthy();
    expect(within(panel).getByDisplayValue('2026-04-25T12:00:00.000Z')).toBeTruthy();

    fireEvent.click(within(panel).getByRole('button', { name: /^Save$/i }));

    await waitFor(() => {
      const patch = fetchSpy.mock.calls.find((call) => String(call[0]).includes('/foleon/content/content-1') && (call[1] as RequestInit | undefined)?.method === 'PATCH');
      expect(patch).toBeTruthy();
      const body = JSON.parse(String((patch?.[1] as RequestInit).body));
      expect(body).toMatchObject({
        contentTypeKey: 'Company Pulse',
        readerKey: 'company-pulse',
        cadence: 'Frequent',
        homepageSlot: 'Company Pulse Reader',
        archiveGroup: '2026-Q2',
        activeEdition: true,
        primaryAudience: 'Operations',
        lastEditorialUpdate: '2026-04-25T12:00:00.000Z',
      });
    });
  });

  it('applies reader presets to local draft only until Save inside the workflow panel', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    installManageFetchMock({ content: [managedContent({ publishStatus: 'Draft' })] });

    render(<ManagePage contract={mockContract()} onBack={(): void => undefined} />);

    const inbox = await screen.findByRole('region', { name: 'Content inbox' });
    fireEvent.click(within(inbox).getByRole('button', { name: /Managed Foleon record/ }));
    const panel = screen.getByRole('dialog', { name: 'Managed Foleon record' });

    fireEvent.click(within(panel).getByRole('button', { name: 'Configure as Project Spotlight' }));

    expect(within(panel).getByDisplayValue('Project Spotlight')).toBeTruthy();
    expect(within(panel).getByDisplayValue('project-spotlight')).toBeTruthy();
    expect(within(panel).getByDisplayValue('Monthly')).toBeTruthy();
    expect(within(panel).getByDisplayValue('Project Spotlight Reader')).toBeTruthy();
    expect(fetchSpy.mock.calls.some((call) => (call[1] as RequestInit | undefined)?.method === 'PATCH')).toBe(false);
  });

  it('surfaces reader lane governance warnings in the workflow panel', async () => {
    installManageFetchMock({
      content: [
        managedContent({
          readerKey: 'project-spotlight',
          contentTypeKey: 'Project Spotlight',
          activeEdition: true,
          publishStatus: 'Draft',
          archiveGroup: '',
        }),
        managedContent({
          id: 'content-2',
          sharePointItemId: 2,
          readerKey: 'project-spotlight',
          contentTypeKey: 'Project Spotlight',
          activeEdition: true,
        }),
      ],
    });

    render(<ManagePage contract={mockContract()} onBack={(): void => undefined} />);

    const inbox = await screen.findByRole('region', { name: 'Content inbox' });
    fireEvent.click(within(inbox).getAllByRole('button', { name: /Managed Foleon record/ })[0]!);
    const panel = screen.getByRole('dialog');
    const validationSection = within(panel).getByRole('region', { name: 'Validation and blockers' });
    expect(within(validationSection).getByText('More than one active Project Spotlight edition is configured.')).toBeTruthy();
    expect(within(validationSection).getByText('Active reader editions should be published, visible, homepage eligible, and have a reader URL.')).toBeTruthy();
    expect(within(validationSection).getByText('Project Spotlight active editions should include Archive Group.')).toBeTruthy();
  });

  it('surfaces placement lane alignment warnings inside the workflow panel for mismatched content', async () => {
    installManageFetchMock({
      content: [managedContent({
        contentTypeKey: 'Company Pulse',
        readerKey: 'company-pulse',
        publishStatus: 'Draft',
        isVisible: false,
      })],
    });

    render(<ManagePage contract={mockContract()} onBack={(): void => undefined} />);

    const inbox = await screen.findByRole('region', { name: 'Content inbox' });
    fireEvent.click(within(inbox).getByRole('button', { name: /Managed Foleon record/ }));
    const panel = screen.getByRole('dialog');

    fireEvent.change(within(panel).getByLabelText('Placement'), {
      target: { value: 'Project Spotlight Active' },
    });

    expect(within(panel).getByText('Project Spotlight Active should point to Project Spotlight content.')).toBeTruthy();
    expect(within(panel).getByText('Project Spotlight Active points to content that is not public-ready.')).toBeTruthy();
  });

  it('opens the workflow panel for a Lane Board record candidate and selects Content Operations', async () => {
    installManageFetchMock({
      content: [
        managedContent({ title: 'PS', readerKey: 'project-spotlight', contentTypeKey: 'Project Spotlight', activeEdition: true }),
        managedContent({
          id: 'content-2',
          sharePointItemId: 2,
          title: 'LM',
          readerKey: 'leadership-message',
          contentTypeKey: 'Leadership',
          activeEdition: true,
        }),
      ],
    });

    render(<ManagePage contract={mockContract()} onBack={(): void => undefined} />);

    fireEvent.click(await screen.findByRole('tab', { name: 'Lane Board' }));
    const lmColumn = screen.getByRole('listitem', { name: /Leadership Message lane/i });
    fireEvent.click(within(lmColumn).getByRole('button', { name: 'Open live in workflow' }));
    expect(screen.getByRole('tab', { name: 'Content Operations' }).getAttribute('aria-selected')).toBe('true');
    expect(screen.getByRole('dialog', { name: 'LM' })).toBeTruthy();
  });

  it('shows plain-language write guidance in the workflow panel editor when write path is disabled', async () => {
    installManageFetchMock({
      content: [managedContent({ readerKey: 'project-spotlight', contentTypeKey: 'Project Spotlight', activeEdition: true })],
    });

    render(<ManagePage contract={hostedContract()} onBack={(): void => undefined} />);

    const inbox = await screen.findByRole('region', { name: 'Content inbox' });
    fireEvent.click(within(inbox).getByRole('button', { name: /Managed Foleon record/ }));
    const panel = screen.getByRole('dialog', { name: 'Managed Foleon record' });
    const editor = within(panel).getByRole('region', { name: /Content detail editor/i });
    expect(editor.textContent).toMatch(/Write actions are disabled/i);
    expect(editor.textContent).not.toMatch(/backend-route-authorization-unproven/);
    expect(editor.textContent).not.toMatch(/token-acquisition-failed/);
    const save = within(panel).getByRole('button', { name: /^Save$/i }) as HTMLButtonElement;
    const saveReasonId = save.getAttribute('aria-describedby');
    expect(saveReasonId).toBe('foleon-manage-write-actions-reason');
    expect(document.getElementById(saveReasonId ?? '')?.textContent).toMatch(/Write actions are disabled/i);
    const placement = within(panel).getByRole('button', { name: /Create placement blocked/i }) as HTMLButtonElement;
    const placementReasonId = placement.getAttribute('aria-describedby');
    expect(placementReasonId).toBe('foleon-manage-placement-write-reason');
    expect(document.getElementById(placementReasonId ?? '')?.textContent).toMatch(/Placement writes are disabled/i);
  });

  it('does not send PATCH when Save is disabled for write path inside the workflow panel', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    installManageFetchMock({
      content: [managedContent({ readerKey: 'project-spotlight', contentTypeKey: 'Project Spotlight', activeEdition: true })],
    });

    render(<ManagePage contract={hostedContract()} onBack={(): void => undefined} />);

    const inbox = await screen.findByRole('region', { name: 'Content inbox' });
    fireEvent.click(within(inbox).getByRole('button', { name: /Managed Foleon record/ }));
    const panel = screen.getByRole('dialog');
    const save = within(panel).getByRole('button', { name: /^Save$/i }) as HTMLButtonElement;
    expect(save.disabled).toBe(true);
    fireEvent.click(save);

    expect(
      fetchSpy.mock.calls.filter(
        (call) => String(call[0]).includes('/foleon/content/') && (call[1] as RequestInit | undefined)?.method === 'PATCH',
      ).length,
    ).toBe(0);
  });

  it('renders Foleon Content Operations title, plain-language status chips, and keeps sync history under Admin diagnostics', async () => {
    installManageFetchMock({ content: [] });

    render(<ManagePage contract={mockContract()} onBack={(): void => undefined} />);

    await screen.findByRole('heading', { name: 'Foleon Content Operations' });
    expect(screen.getByText('Marketing Operations')).toBeTruthy();
    expect(screen.getByRole('list', { name: 'Manager status' })).toBeTruthy();
    expect(screen.getByText('Content lanes')).toBeTruthy();
    expect(screen.getByText('API connection')).toBeTruthy();
    expect(screen.getByText('Registry status')).toBeTruthy();
    expect(screen.getByText('Last sync')).toBeTruthy();

    const contentPanel = screen.getByRole('tabpanel', { name: 'Content Operations' });
    expect(contentPanel.textContent).not.toMatch(/TOKEN ACQUISITIONBlocked/i);

    expect(screen.queryByRole('region', { name: /Sync run history/i })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Admin diagnostics' }));
    expect(screen.getByRole('tabpanel', { name: 'Admin / Config' })).toBeTruthy();
    expect(
      screen.getByRole('button', { name: /Hide redacted diagnostics, sync history, and technical proof/i }).getAttribute('aria-expanded'),
    ).toBe('true');
    expect(screen.getByRole('region', { name: /Sync run history/i })).toBeTruthy();
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
                message: 'consent_required: Approve HB SharePoint Creator / access_as_user in SharePoint Admin Center API access.',
              },
              { code: 'list-bindings-missing', message: 'List bindings are missing for this site.' },
            ],
          },
        })}
        onBack={(): void => undefined}
      />,
    );

    await screen.findByRole('tab', { name: 'Admin / Config' });
    fireEvent.click(screen.getByRole('tab', { name: 'Admin / Config' }));
    const list = screen.getByRole('region', { name: /Required admin actions/i }).querySelector('ol');
    expect(list).toBeTruthy();
    const items = within(list as HTMLElement).getAllByRole('listitem');
    expect(items.length).toBeGreaterThanOrEqual(2);
    expect(items[0]?.textContent).toMatch(/Approve API access|API token/i);
    expect(items[0]?.textContent).not.toMatch(/Bind required SharePoint lists/i);
    expect(items.some((li) => li.textContent?.includes('Bind required SharePoint lists'))).toBe(true);
  });

  it('does not mount diagnostics bodies until diagnostics are opened', async () => {
    installManageFetchMock({ content: [] });
    render(<ManagePage contract={mockContract()} onBack={(): void => undefined} />);

    await screen.findByRole('heading', { name: 'Foleon Content Operations' });
    fireEvent.click(screen.getByRole('tab', { name: 'Admin / Config' }));
    expect(screen.queryByRole('button', { name: 'Copy redacted proof' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /Show redacted diagnostics, sync history, and technical proof/i }));
    expect(screen.getByRole('button', { name: 'Copy redacted proof' })).toBeTruthy();
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

    await screen.findByRole('heading', { name: 'Foleon Content Operations' });
    fireEvent.click(screen.getByRole('tab', { name: 'Admin / Config' }));
    fireEvent.click(screen.getByRole('button', { name: /Show redacted diagnostics, sync history, and technical proof/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Copy redacted proof' }));
    await waitFor(() => {
      expect(writeText).toHaveBeenCalled();
    });
    const payload = writeText.mock.calls[0]?.[0] as string;
    expect(payload).toContain('"hostMode"');
    expect(payload).not.toContain('https://functions.test');
    delete (globalThis.navigator as { clipboard?: unknown }).clipboard;
  });

  it('prefers publish validation copy over write-path messaging when saves are allowed', async () => {
    installManageFetchMock({
      content: [
        managedContent({
          readerKey: 'company-pulse',
          contentTypeKey: 'Company Pulse',
          homepageSlot: 'Company Pulse Reader',
          publishStatus: 'Published',
          isVisible: true,
          isHomepageEligible: true,
          publishedUrl: 'https://viewer.us.foleon.com/org/published',
          openMode: 'Inline Reader',
          embedUrl: '',
          lastEditorialUpdate: '2026-04-25T12:00:00.000Z',
        }),
      ],
    });

    render(<ManagePage contract={mockContract()} onBack={(): void => undefined} />);

    const inbox = await screen.findByRole('region', { name: 'Content inbox' });
    fireEvent.click(within(inbox).getByRole('button', { name: /Managed Foleon record/ }));
    const panel = screen.getByRole('dialog', { name: 'Managed Foleon record' });
    expect(within(panel).queryByText(/Write actions are disabled/i)).toBeNull();
    const publishHint = within(panel).getByText(/Publish is blocked:/i);
    expect(publishHint.textContent).toMatch(/embed URL|Inline Reader/i);
    expect((within(panel).getByRole('button', { name: /^Save$/i }) as HTMLButtonElement).disabled).toBe(false);
    const publishBtn = within(panel).getByRole('button', { name: /Publish blocked/i }) as HTMLButtonElement;
    expect(publishBtn.disabled).toBe(true);
    const publishDescId = publishBtn.getAttribute('aria-describedby');
    expect(publishDescId).toBe('foleon-manage-publish-reason');
    expect(document.getElementById(publishDescId ?? '')?.textContent).toMatch(/embed URL|Inline Reader/i);
  });

  it('shows a short blocker-code hint in expanded diagnostics when blockers exist', async () => {
    installManageFetchMock({ content: [] });
    render(
      <ManagePage
        contract={mockContract({
          foleonConfigDiagnostics: {
            blockers: [{ code: 'token-acquisition-failed', message: 'consent_required: redacted detail' }],
          },
        })}
        onBack={(): void => undefined}
      />,
    );

    await screen.findByRole('heading', { name: 'Foleon Content Operations' });
    fireEvent.click(screen.getByRole('tab', { name: 'Admin / Config' }));
    fireEvent.click(screen.getByRole('button', { name: /Show redacted diagnostics, sync history, and technical proof/i }));
    const note = screen.getByRole('note');
    expect(note.textContent).toMatch(/aligns with readiness codes on record for support/i);
    expect(note.textContent).toContain('token-acquisition-failed');
    expect(note.textContent).not.toContain('consent_required');
  });

  it('renders the operations summary strip with derivable counts', async () => {
    installManageFetchMock({
      content: [
        managedContent({
          title: 'Live PS',
          readerKey: 'project-spotlight',
          contentTypeKey: 'Project Spotlight',
          activeEdition: true,
          publishedUrl: 'https://viewer.us.foleon.com/ps/live',
          embedUrl: 'https://viewer.us.foleon.com/ps/live/embed',
        }),
        managedContent({
          id: 'content-2',
          sharePointItemId: 2,
          title: 'Orphan content',
          foleonDocId: 99999,
          readerKey: 'company-pulse',
          contentTypeKey: 'Company Pulse',
          activeEdition: true,
          publishStatus: 'Draft',
          isVisible: false,
          isHomepageEligible: false,
        }),
      ],
      placements: [managedPlacement()],
    });

    render(<ManagePage contract={mockContract()} onBack={(): void => undefined} />);

    const summary = await screen.findByRole('region', { name: 'Operations summary' });
    const live = within(summary).getByText('Live').parentElement?.querySelector(`[data-summary-id="live"], [aria-label="Live count"]`);
    expect(within(summary).getByText('Live')).toBeTruthy();
    expect(within(summary).getByText('Staged')).toBeTruthy();
    expect(within(summary).getByText('Blocked')).toBeTruthy();
    expect(within(summary).getByText('Unassigned')).toBeTruthy();
    expect(summary.querySelector('[data-summary-id="unassigned"]')?.textContent).toContain('1');
    expect(live).not.toBeNull();
  });

  it('renders the real Lane Board with the derivable per-lane sections and a candidate when present', async () => {
    installManageFetchMock({
      content: [
        managedContent({
          title: 'Active PS edition',
          readerKey: 'project-spotlight',
          contentTypeKey: 'Project Spotlight',
          activeEdition: true,
          publishedUrl: 'https://viewer.us.foleon.com/ps/live',
          embedUrl: 'https://viewer.us.foleon.com/ps/live/embed',
        }),
        managedContent({
          id: 'content-staged',
          sharePointItemId: 2,
          title: 'PS staged edition',
          readerKey: 'project-spotlight',
          contentTypeKey: 'Project Spotlight',
          activeEdition: false,
          publishStatus: 'Draft',
        }),
        managedContent({
          id: 'content-candidate',
          sharePointItemId: 3,
          title: 'PS candidate edition',
          foleonDocId: 12346,
          readerKey: 'project-spotlight',
          contentTypeKey: 'Project Spotlight',
          activeEdition: false,
          publishStatus: 'Published',
          isVisible: true,
          isHomepageEligible: true,
        }),
      ],
      placements: [managedPlacement()],
    });

    render(<ManagePage contract={mockContract()} onBack={(): void => undefined} />);

    fireEvent.click(await screen.findByRole('tab', { name: 'Lane Board' }));
    const psColumn = screen.getByRole('listitem', { name: /Project Spotlight lane/i });
    expect(within(psColumn).getByRole('region', { name: 'Live edition' })).toBeTruthy();
    expect(within(psColumn).getByRole('region', { name: 'Staged or draft' })).toBeTruthy();
    expect(within(psColumn).getByRole('region', { name: 'Next recommended action' })).toBeTruthy();
    expect(within(psColumn).getByRole('region', { name: 'Available content candidates' })).toBeTruthy();
    expect(within(psColumn).getByRole('button', { name: /PS candidate edition/ })).toBeTruthy();
  });

  it('Lane Board candidate selection opens the workflow panel in Content Operations', async () => {
    installManageFetchMock({
      content: [
        managedContent({
          title: 'Active PS edition',
          readerKey: 'project-spotlight',
          contentTypeKey: 'Project Spotlight',
          activeEdition: true,
        }),
        managedContent({
          id: 'content-staged',
          sharePointItemId: 2,
          title: 'PS staged',
          readerKey: 'project-spotlight',
          contentTypeKey: 'Project Spotlight',
          activeEdition: false,
          publishStatus: 'Draft',
        }),
        managedContent({
          id: 'content-candidate',
          sharePointItemId: 3,
          title: 'PS candidate',
          foleonDocId: 12346,
          readerKey: 'project-spotlight',
          contentTypeKey: 'Project Spotlight',
          activeEdition: false,
          publishStatus: 'Published',
          isVisible: true,
          isHomepageEligible: true,
        }),
      ],
    });

    render(<ManagePage contract={mockContract()} onBack={(): void => undefined} />);

    fireEvent.click(await screen.findByRole('tab', { name: 'Lane Board' }));
    const psColumn = screen.getByRole('listitem', { name: /Project Spotlight lane/i });
    fireEvent.click(within(psColumn).getByRole('button', { name: /PS candidate/ }));
    expect(screen.getByRole('tab', { name: 'Content Operations' }).getAttribute('aria-selected')).toBe('true');
    expect(screen.getByRole('dialog', { name: 'PS candidate' })).toBeTruthy();
  });

  it('renders the Recommended next action band with action id derivable from current operations counts', async () => {
    installManageFetchMock({ content: [] });

    render(<ManagePage contract={mockContract()} onBack={(): void => undefined} />);

    const band = await screen.findByRole('region', { name: 'Recommended next action' });
    expect(band.getAttribute('data-action-id')).toBeTruthy();
    expect(['no-content', 'all-stable']).toContain(band.getAttribute('data-action-id'));
  });

  it('keeps the canvas escape attribute on the manager root only', async () => {
    installManageFetchMock({ content: [] });
    render(<ManagePage contract={mockContract()} onBack={(): void => undefined} />);

    await screen.findByRole('heading', { name: 'Foleon Content Operations' });
    const manageRoots = document.querySelectorAll('.foleonManageRoot');
    expect(manageRoots.length).toBeGreaterThan(0);
    manageRoots.forEach((root) => {
      expect((root as HTMLElement).getAttribute('data-foleon-manager-canvas')).toBe('wide');
    });
    // Reader / highlights / embed routes are not mounted by ManagePage at all,
    // so the attribute must not exist outside the manage root.
    document.querySelectorAll('[data-foleon-manager-canvas="wide"]').forEach((node) => {
      expect((node as HTMLElement).classList.contains('foleonManageRoot')).toBe(true);
    });
  });

  it('focuses the unassigned bucket when "Review new content" header action is invoked', async () => {
    installManageFetchMock({
      content: [managedContent({ title: 'Drifting', publishStatus: 'Draft' })],
    });

    render(<ManagePage contract={mockContract()} onBack={(): void => undefined} />);

    await screen.findByRole('region', { name: 'Content inbox' });
    fireEvent.click(screen.getByRole('button', { name: 'Review new content' }));
    const inbox = screen.getByRole('region', { name: 'Content inbox' });
    expect(inbox.querySelector('[data-bucket-id="unassigned"]')).toBeTruthy();
    expect(within(inbox).getByRole('button', { name: 'Show all buckets' })).toBeTruthy();
  });

  it('returns focus to the originating row when the workflow panel closes via Esc', async () => {
    installManageFetchMock({
      content: [managedContent({ title: 'Focus row' })],
    });

    render(<ManagePage contract={mockContract()} onBack={(): void => undefined} />);

    const inbox = await screen.findByRole('region', { name: 'Content inbox' });
    const row = within(inbox).getByRole('button', { name: /Focus row/ }) as HTMLButtonElement;
    row.focus();
    fireEvent.click(row);
    const panel = screen.getByRole('dialog', { name: 'Focus row' });
    expect(panel).toBeTruthy();

    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Focus row' })).toBeNull();
    });
    expect(document.activeElement).toBe(row);
  });

  it('renders Preview placeholder workspace and reuses safe-origin Open Foleon behavior', async () => {
    installManageFetchMock({ content: [] });
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(null);

    render(<ManagePage contract={mockContract()} onBack={(): void => undefined} />);

    fireEvent.click(await screen.findByRole('tab', { name: 'Preview' }));
    const panel = screen.getByRole('tabpanel', { name: 'Preview' });
    expect(panel.getAttribute('id')).toBe('foleon-manage-panel-preview');
    expect(panel.textContent).toContain(
      'This workspace will provide employee-facing reader previews before content is activated on HB Central.',
    );
    expect(panel.textContent).toContain('Preview routing is not active in this wave.');
    expect(panel.textContent).toContain(
      'Use Open Foleon for source review and Content Operations for readiness validation until the governed reader preview workflow is implemented.',
    );
    expect(panel.querySelector('iframe')).toBeNull();

    fireEvent.click(within(panel).getByRole('button', { name: /Open Foleon/i }));
    expect(openSpy).toHaveBeenCalledWith('https://viewer.us.foleon.com', '_blank', 'noopener,noreferrer');

    fireEvent.click(within(panel).getByRole('button', { name: 'Open Content Operations' }));
    expect(screen.getByRole('tab', { name: 'Content Operations' }).getAttribute('aria-selected')).toBe('true');
  });

  it('disables Preview Open Foleon when no safe origin is configured and surfaces the unavailable reason', async () => {
    installManageFetchMock({ content: [] });

    render(
      <ManagePage
        contract={mockContract({ originPolicy: createFoleonOriginPolicy([]) })}
        onBack={(): void => undefined}
      />,
    );

    fireEvent.click(await screen.findByRole('tab', { name: 'Preview' }));
    const panel = screen.getByRole('tabpanel', { name: 'Preview' });
    const openButton = within(panel).getByRole('button', { name: /Open Foleon/i }) as HTMLButtonElement;
    expect(openButton.disabled).toBe(true);
    expect(panel.textContent).toMatch(/approved HTTPS viewer origin/i);
  });

  it('Review new content header action selects Content Operations and emits a status hint', async () => {
    installManageFetchMock({ content: [] });

    render(<ManagePage contract={mockContract()} onBack={(): void => undefined} />);

    fireEvent.click(await screen.findByRole('tab', { name: 'Lane Board' }));
    expect(screen.getByRole('tab', { name: 'Lane Board' }).getAttribute('aria-selected')).toBe('true');

    fireEvent.click(screen.getByRole('button', { name: 'Review new content' }));

    expect(screen.getByRole('tab', { name: 'Content Operations' }).getAttribute('aria-selected')).toBe('true');
    expect(
      screen.getAllByRole('status').some((entry) => /Review new content in the Content Operations workspace/i.test(entry.textContent ?? '')),
    ).toBe(true);
  });

  it('Manage placements header action selects Content Operations and emits a status hint', async () => {
    installManageFetchMock({ content: [] });

    render(<ManagePage contract={mockContract()} onBack={(): void => undefined} />);

    fireEvent.click(await screen.findByRole('tab', { name: 'Admin / Config' }));
    expect(screen.getByRole('tab', { name: 'Admin / Config' }).getAttribute('aria-selected')).toBe('true');

    fireEvent.click(screen.getByRole('button', { name: 'Manage placements' }));

    expect(screen.getByRole('tab', { name: 'Content Operations' }).getAttribute('aria-selected')).toBe('true');
    expect(
      screen.getAllByRole('status').some((entry) => /Manage placements from the Content Operations workspace/i.test(entry.textContent ?? '')),
    ).toBe(true);
  });
});

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
