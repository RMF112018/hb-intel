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
  it('renders two tabs with Homepage Foleon Content selected by default', async () => {
    installManageFetchMock({ content: [] });

    render(<ManagePage contract={mockContract()} onBack={(): void => undefined} />);

    expect((await screen.findByRole('tab', { name: 'Homepage Foleon Content' })).getAttribute('aria-selected')).toBe('true');
    expect(screen.getByRole('tab', { name: 'Config' }).getAttribute('aria-selected')).toBe('false');
    expect(screen.getByRole('tabpanel', { name: 'Homepage Foleon Content' })).toBeTruthy();
  });

  it('renders the three homepage lane cards in the content tab', async () => {
    installManageFetchMock({
      content: [
        managedContent({ title: 'Project Spotlight edition', readerKey: 'project-spotlight', contentTypeKey: 'Project Spotlight', activeEdition: true }),
        managedContent({ id: 'content-2', sharePointItemId: 2, title: 'Company Pulse edition', readerKey: 'company-pulse', contentTypeKey: 'Company Pulse', activeEdition: true }),
        managedContent({ id: 'content-3', sharePointItemId: 3, title: 'Leadership edition', readerKey: 'leadership-message', contentTypeKey: 'Leadership', activeEdition: true }),
      ],
    });

    render(<ManagePage contract={mockContract()} onBack={(): void => undefined} />);

    expect((await screen.findAllByText('Project Spotlight')).length).toBeGreaterThan(0);
    expect(screen.getAllByText('Company Pulse').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Leadership Message').length).toBeGreaterThan(0);
    const laneSummary = screen.getByRole('region', { name: /Homepage lane summary/i });
    expect(laneSummary).toBeTruthy();
    expect(within(laneSummary).getAllByRole('listitem').length).toBe(3);
    expect(laneSummary.textContent).not.toMatch(/project-spotlight|company-pulse|leadership-message/);
    expect(laneSummary.textContent).not.toMatch(/Project Spotlight Active|Company Pulse Active|Leadership Message Active/);
  });

  it('renders split readiness states and source labels on the Config tab', async () => {
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

    await screen.findByRole('region', { name: /Content detail editor/i });
    fireEvent.click(screen.getByRole('tab', { name: 'Config' }));

    expect(screen.getByRole('tabpanel', { name: 'Config' })).toBeTruthy();
    expect(screen.getByRole('region', { name: /Runtime readiness summary/i })).toBeTruthy();
    expect(screen.getByText('Token Provider')).toBeTruthy();
    expect(screen.getByText('Token Acquisition')).toBeTruthy();
    expect(screen.getByText('Backend Safe Config')).toBeTruthy();
    expect(screen.getByText('Route Authorization')).toBeTruthy();
    expect(screen.getByText('Write Path')).toBeTruthy();
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

  it('renders a live readable lane while write actions stay disabled', async () => {
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

    expect((await screen.findAllByText('Live Project Spotlight')).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: 'Open Foleon' })).toBeTruthy();
    expect((screen.getByRole('button', { name: /^Save$/i }) as HTMLButtonElement).disabled).toBe(true);
    expect(
      screen.getAllByRole('button', { name: /Publish/i })
        .filter((button) => /^(Publish|Publish blocked)$/.test(button.textContent?.trim() ?? ''))
        .every((button) => (button as HTMLButtonElement).disabled),
    ).toBe(true);
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

    await screen.findByRole('region', { name: /Content detail editor/i });
    fireEvent.click(screen.getByRole('tab', { name: 'Config' }));
    const normalConfigText = screen.getByRole('tabpanel', { name: 'Config' }).textContent ?? '';

    expect(normalConfigText).not.toContain(rawBackendUrl);
    expect(normalConfigText).not.toContain(rawApiResource);
    expect(normalConfigText).not.toContain(rawListGuid);
    expect(normalConfigText).not.toContain('token-');
  });

  it('renders manage shell, workflows, and preview guidance for zero content without iframe hosts', async () => {
    installManageFetchMock({ content: [] });

    render(<ManagePage contract={mockContract()} onBack={(): void => undefined} />);

    expect((await screen.findByRole('heading', { name: /Foleon Manager/i })).textContent).toMatch(/Foleon Manager/i);
    expect(screen.getByRole('complementary', { name: /Foleon content registry/i })).toBeTruthy();
    expect(screen.getByText('Published')).toBeTruthy();
    expect(screen.getByRole('region', { name: /Public preview layouts may still be visible/i })).toBeTruthy();
    expect(screen.getByText(/public routes do not yet have renderable published content/i)).toBeTruthy();
    expect(screen.getByText(/do not create records, open readers, call external links, or emit production content telemetry/i)).toBeTruthy();
    expect(screen.getByRole('region', { name: /Placement manager/i })).toBeTruthy();
    expect(screen.queryByRole('region', { name: /Sync run history/i })).toBeNull();
    fireEvent.click(screen.getByRole('tab', { name: 'Config' }));
    fireEvent.click(screen.getByText('Redacted diagnostics and sync run history'));
    expect(screen.getByRole('region', { name: /Sync run history/i })).toBeTruthy();
    expect(document.querySelector('iframe')).toBeNull();
  });

  it('renders preview guidance when content exists but no records are public-ready', async () => {
    installManageFetchMock({
      content: [managedContent({ publishStatus: 'Draft', isVisible: true, isHomepageEligible: true })],
    });

    render(<ManagePage contract={mockContract()} onBack={(): void => undefined} />);

    expect(await screen.findByRole('region', { name: /Public preview layouts may still be visible/i })).toBeTruthy();
    expect(screen.getByText(/Draft, hidden, unpublished, archived, suppressed, or non-homepage-ready records/i)).toBeTruthy();
    expect(screen.getByRole('region', { name: /Content detail editor/i })).toBeTruthy();
  });

  it('hides preview guidance when records are public and homepage ready', async () => {
    installManageFetchMock({
      content: [managedContent({ publishStatus: 'Published', isVisible: true, isHomepageEligible: true })],
    });

    render(<ManagePage contract={mockContract()} onBack={(): void => undefined} />);

    expect(await screen.findByRole('region', { name: /Content detail editor/i })).toBeTruthy();
    expect(screen.queryByRole('region', { name: /Public preview layouts may still be visible/i })).toBeNull();
    expect(screen.getByRole('complementary', { name: /Foleon content registry/i })).toBeTruthy();
    expect(screen.getByRole('region', { name: /Placement manager/i })).toBeTruthy();
    expect(screen.queryByRole('region', { name: /Sync run history/i })).toBeNull();
    fireEvent.click(screen.getByRole('tab', { name: 'Config' }));
    fireEvent.click(screen.getByText('Redacted diagnostics and sync run history'));
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
    expect(screen.queryByRole('region', { name: /Public preview layouts may still be visible/i })).toBeNull();
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

    expect(await screen.findByRole('heading', { name: /Foleon Manager/i })).toBeTruthy();
    const laneSummary = screen.getByRole('region', { name: /Homepage lane summary/i });
    expect(within(laneSummary).getAllByText('Needs setup').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('list', { name: 'Manager status' })).toBeTruthy();
    expect(screen.getByRole('tab', { name: 'Homepage Foleon Content' })).toBeTruthy();
    expect(screen.getByRole('tab', { name: 'Config' })).toBeTruthy();
    expect(
      screen.getAllByRole('status').some((entry) =>
        entry.textContent?.includes('Approve HB SharePoint Creator / access_as_user')
      ),
    ).toBe(true);
    expect(screen.getByRole('button', { name: 'Retry API readiness' })).toBeTruthy();
    expect((screen.getByRole('button', { name: 'Sync blocked' }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole('button', { name: 'Create placement blocked' }) as HTMLButtonElement).disabled).toBe(true);
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

    await screen.findByRole('tab', { name: 'Config' });
    fireEvent.click(screen.getByRole('tab', { name: 'Config' }));

    const configText = screen.getByRole('tabpanel', { name: 'Config' }).textContent ?? '';
    expect(screen.getByRole('region', { name: 'API approval required' })).toBeTruthy();
    expect(configText).toContain('API Consent Missing');
    expect(configText).toContain('Blocked: consent_required');
    expect(configText).toContain('Backend read path, write path, and sync path are unavailable');
    expect(configText).toContain('Approve HB SharePoint Creator / access_as_user');
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
    expect(screen.queryByRole('region', { name: /Public preview layouts may still be visible/i })).toBeNull();
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

    expect(await screen.findByRole('region', { name: /Content detail editor/i })).toBeTruthy();
    expect(screen.getByRole('region', { name: /Placement manager/i })).toBeTruthy();
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

    expect(await screen.findByRole('region', { name: /Content detail editor/i })).toBeTruthy();
    expect(screen.getAllByRole('status').some((entry) =>
      entry.textContent?.includes('backend Foleon OAuth configuration is incomplete')
    )).toBe(true);
  });

  it('keeps preview guidance read-only without fake admin actions or editable preview content', async () => {
    installManageFetchMock({ content: [] });

    render(<ManagePage contract={mockContract()} onBack={(): void => undefined} />);

    const guidance = await screen.findByRole('region', { name: /Public preview layouts may still be visible/i });
    expect(within(guidance).queryByRole('link')).toBeNull();
    expect(within(guidance).queryByRole('button')).toBeNull();
    expect(guidance.querySelector('iframe')).toBeNull();
    expect(guidance.querySelector('input, textarea, select')).toBeNull();
    expect(guidance.querySelector('[aria-disabled="true"], [disabled]')).toBeNull();
    expect(guidance.textContent).not.toContain('Sync Docs');
    expect(guidance.textContent).not.toContain('Create placement');
    expect(guidance.textContent).not.toContain('Read');
  });

  it('loads and saves reader lane fields without silent field loss', async () => {
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

    expect(await screen.findByDisplayValue('company-pulse')).toBeTruthy();
    expect(screen.getByDisplayValue('Frequent')).toBeTruthy();
    expect(screen.getByDisplayValue('Company Pulse Reader')).toBeTruthy();
    expect(screen.getByDisplayValue('2026-Q2')).toBeTruthy();
    expect(screen.getByDisplayValue('Operations')).toBeTruthy();
    expect(screen.getByDisplayValue('2026-04-25T12:00:00.000Z')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /^Save$/i }));

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

  it('applies reader presets to local draft only until Save', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    installManageFetchMock({ content: [managedContent({ publishStatus: 'Draft' })] });

    render(<ManagePage contract={mockContract()} onBack={(): void => undefined} />);

    fireEvent.click(await screen.findByRole('button', { name: 'Configure as Project Spotlight' }));

    expect(screen.getByDisplayValue('Project Spotlight')).toBeTruthy();
    expect(screen.getByDisplayValue('project-spotlight')).toBeTruthy();
    expect(screen.getByDisplayValue('Monthly')).toBeTruthy();
    expect(screen.getByDisplayValue('Project Spotlight Reader')).toBeTruthy();
    expect(fetchSpy.mock.calls.some((call) => (call[1] as RequestInit | undefined)?.method === 'PATCH')).toBe(false);
  });

  it('shows reader lane governance warnings', async () => {
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

    expect((await screen.findAllByText('More than one active Project Spotlight edition is configured.')).length).toBeGreaterThan(0);
    expect(screen.getAllByText('Active reader editions should be published, visible, homepage eligible, and have a reader URL.').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Project Spotlight active editions should include Archive Group.').length).toBeGreaterThan(0);
  });

  it('shows placement lane alignment warnings for mismatched content', async () => {
    installManageFetchMock({
      content: [managedContent({
        contentTypeKey: 'Company Pulse',
        readerKey: 'company-pulse',
        publishStatus: 'Draft',
        isVisible: false,
      })],
    });

    render(<ManagePage contract={mockContract()} onBack={(): void => undefined} />);

    fireEvent.change(await screen.findByLabelText('Placement'), {
      target: { value: 'Project Spotlight Active' },
    });

    expect(screen.getByText('Project Spotlight Active should point to Project Spotlight content.')).toBeTruthy();
    expect(screen.getByText('Project Spotlight Active points to content that is not public-ready.')).toBeTruthy();
  });

  it('updates selected-lane workspace when a different lane card is selected', async () => {
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

    await screen.findByRole('region', { name: /Project Spotlight workspace/i });
    const laneSummary = screen.getByRole('region', { name: /Homepage lane summary/i });
    const laneCards = within(laneSummary).getAllByRole('listitem');
    expect(laneCards.length).toBe(3);
    fireEvent.click(laneCards[2]!);
    expect(await screen.findByRole('region', { name: /Leadership Message workspace/i })).toBeTruthy();
  });

  it('shows plain-language write guidance when write path is disabled', async () => {
    installManageFetchMock({
      content: [managedContent({ readerKey: 'project-spotlight', contentTypeKey: 'Project Spotlight', activeEdition: true })],
    });

    render(<ManagePage contract={hostedContract()} onBack={(): void => undefined} />);

    const editor = await screen.findByRole('region', { name: /Content detail editor/i });
    expect(editor.textContent).toMatch(/Write actions are disabled/i);
    expect(editor.textContent).not.toMatch(/backend-route-authorization-unproven/);
    expect(editor.textContent).not.toMatch(/token-acquisition-failed/);
  });

  it('does not send PATCH when Save is disabled for write path', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    installManageFetchMock({
      content: [managedContent({ readerKey: 'project-spotlight', contentTypeKey: 'Project Spotlight', activeEdition: true })],
    });

    render(<ManagePage contract={hostedContract()} onBack={(): void => undefined} />);

    await screen.findByRole('region', { name: /Content detail editor/i });
    const save = screen.getByRole('button', { name: /^Save$/i }) as HTMLButtonElement;
    expect(save.disabled).toBe(true);
    fireEvent.click(save);

    expect(
      fetchSpy.mock.calls.filter(
        (call) => String(call[0]).includes('/foleon/content/') && (call[1] as RequestInit | undefined)?.method === 'PATCH',
      ).length,
    ).toBe(0);
  });

  it('renders Foleon Manager title, plain-language status chips, and keeps sync history under Config diagnostics', async () => {
    installManageFetchMock({ content: [] });

    render(<ManagePage contract={mockContract()} onBack={(): void => undefined} />);

    await screen.findByRole('heading', { name: 'Foleon Manager' });
    expect(screen.getByText('Marketing Operations')).toBeTruthy();
    expect(screen.getByRole('list', { name: 'Manager status' })).toBeTruthy();
    expect(screen.getByText('Content lanes')).toBeTruthy();
    expect(screen.getByText('API connection')).toBeTruthy();
    expect(screen.getByText('Registry status')).toBeTruthy();
    expect(screen.getByText('Last sync')).toBeTruthy();

    const contentPanel = screen.getByRole('tabpanel', { name: 'Homepage Foleon Content' });
    expect(contentPanel.textContent).not.toMatch(/TOKEN ACQUISITIONBlocked/i);

    expect(screen.queryByRole('region', { name: /Sync run history/i })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'View diagnostics' }));
    expect(screen.getByRole('tabpanel', { name: 'Config' })).toBeTruthy();
    const details = screen.getByText('Redacted diagnostics and sync run history').closest('details');
    expect(details?.hasAttribute('open')).toBe(true);
    expect(screen.getByRole('region', { name: /Sync run history/i })).toBeTruthy();
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
