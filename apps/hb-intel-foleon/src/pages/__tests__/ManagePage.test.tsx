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

function installManageFetchMock(args: {
  readonly content?: ReadonlyArray<FoleonManagedContent>;
  readonly placements?: ReadonlyArray<FoleonPlacement>;
  readonly status?: number;
  readonly message?: string;
} = {}): void {
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
    if (args.status && args.status >= 400) {
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

    const url = String(input);
    const ok = { ok: true as const, status: 200 };
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
  it('renders manage shell, workflows, and preview guidance for zero content without iframe hosts', async () => {
    installManageFetchMock({ content: [] });

    render(<ManagePage contract={mockContract()} onBack={(): void => undefined} />);

    expect((await screen.findByRole('heading', { name: /Foleon Connector/i })).textContent).toMatch(/Foleon Connector/i);
    expect(screen.getByRole('complementary', { name: /Foleon content registry/i })).toBeTruthy();
    expect(screen.getByText('Published')).toBeTruthy();
    expect(screen.getByRole('region', { name: /Public preview layouts may still be visible/i })).toBeTruthy();
    expect(screen.getByText(/public routes do not yet have renderable published content/i)).toBeTruthy();
    expect(screen.getByText(/do not create records, open readers, call external links, or emit production content telemetry/i)).toBeTruthy();
    expect(screen.getByRole('region', { name: /Placement manager/i })).toBeTruthy();
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
    expect(screen.getByRole('region', { name: /Sync run history/i })).toBeTruthy();
  });

  it('does not render preview guidance in backend-blocked state', async () => {
    render(
      <ManagePage
        contract={mockContract({ hostMode: 'sharepoint', apiBaseUrl: null, getAccessToken: undefined })}
        onBack={(): void => undefined}
      />,
    );

    expect((await screen.findByRole('alert')).textContent).toContain('Foleon Connector is blocked');
    expect(screen.queryByRole('region', { name: /Public preview layouts may still be visible/i })).toBeNull();
  });

  it('does not expose manager controls when the runtime authorization check is rejected', async () => {
    installManageFetchMock({ status: 403, message: 'You are not authorized to manage Foleon content.' });

    render(<ManagePage contract={mockContract()} onBack={(): void => undefined} />);

    expect((await screen.findByRole('alert')).textContent).toContain(
      'You are not authorized to manage Foleon content.',
    );
    expect(screen.queryByRole('complementary', { name: /Foleon content registry/i })).toBeNull();
    expect(screen.queryByRole('region', { name: /Public preview layouts may still be visible/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /Sync Foleon/i })).toBeNull();
    expect(document.querySelector('iframe')).toBeNull();
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

    expect(await screen.findByText('More than one active Project Spotlight edition is configured.')).toBeTruthy();
    expect(screen.getByText('Active reader editions should be published, visible, homepage eligible, and have a reader URL.')).toBeTruthy();
    expect(screen.getByText('Project Spotlight active editions should include Archive Group.')).toBeTruthy();
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
