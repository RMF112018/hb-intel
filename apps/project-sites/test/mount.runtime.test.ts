import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const createdRoots: Array<{ render: ReturnType<typeof vi.fn>; unmount: ReturnType<typeof vi.fn> }> = [];
  const queryClients: Array<{ clear: ReturnType<typeof vi.fn> }> = [];

  const createRoot = vi.fn(() => {
    const root = {
      render: vi.fn(),
      unmount: vi.fn(),
    };
    createdRoots.push(root);
    return root;
  });

  const QueryClient = vi.fn().mockImplementation(() => {
    const client = {
      clear: vi.fn(),
    };
    queryClients.push(client);
    return client;
  });

  const resolveSpfxPermissions = vi.fn(async () => ['scope']);
  const bootstrapSpfxAuth = vi.fn(async () => undefined);

  const normalizeProjectSitesRuntimeConfig = vi.fn((config: unknown) => config);
  const ProjectSitesRoot = vi.fn(() => null);

  const HbcThemeProvider = ({ children }: { children?: unknown }) => children ?? null;
  const QueryClientProvider = ({ children }: { children?: unknown }) => children ?? null;

  return {
    createdRoots,
    queryClients,
    createRoot,
    QueryClient,
    resolveSpfxPermissions,
    bootstrapSpfxAuth,
    normalizeProjectSitesRuntimeConfig,
    ProjectSitesRoot,
    HbcThemeProvider,
    QueryClientProvider,
  };
});

vi.mock('react-dom/client', () => ({
  createRoot: mocks.createRoot,
}));

vi.mock('@tanstack/react-query', () => ({
  QueryClient: mocks.QueryClient,
  QueryClientProvider: mocks.QueryClientProvider,
}));

vi.mock('@hbc/auth/spfx', () => ({
  resolveSpfxPermissions: mocks.resolveSpfxPermissions,
  bootstrapSpfxAuth: mocks.bootstrapSpfxAuth,
}));

vi.mock('@hbc/ui-kit/app-shell', () => ({
  HbcThemeProvider: mocks.HbcThemeProvider,
}));

vi.mock('@hbc/spfx/project-sites', () => ({
  ProjectSitesRoot: mocks.ProjectSitesRoot,
  normalizeProjectSitesRuntimeConfig: mocks.normalizeProjectSitesRuntimeConfig,
}));

async function loadMountModule() {
  return import('../src/mount.tsx');
}

describe('project-sites mount runtime lifecycle', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mocks.createdRoots.length = 0;
    mocks.queryClients.length = 0;
  });

  it('is idempotent on repeated mount calls for the same host element', async () => {
    const { mount } = await loadMountModule();
    const host = document.createElement('div');
    const context = { pageContext: {} } as unknown;

    await mount(host, context as never, { hostPageYear: 2025 });
    await mount(host, context as never, { hostPageYear: 2026 });

    expect(mocks.createRoot).toHaveBeenCalledTimes(1);
    expect(mocks.QueryClient).toHaveBeenCalledTimes(1);
    expect(mocks.resolveSpfxPermissions).toHaveBeenCalledTimes(1);
    expect(mocks.bootstrapSpfxAuth).toHaveBeenCalledTimes(1);
    expect(mocks.createdRoots[0]?.render).toHaveBeenCalledTimes(2);
    expect(mocks.normalizeProjectSitesRuntimeConfig).toHaveBeenNthCalledWith(1, { hostPageYear: 2025 });
    expect(mocks.normalizeProjectSitesRuntimeConfig).toHaveBeenNthCalledWith(2, { hostPageYear: 2026 });
  });

  it('tears down prior instance when host element changes without explicit unmount', async () => {
    const { mount } = await loadMountModule();
    const context = { pageContext: {} } as unknown;
    const hostA = document.createElement('div');
    const hostB = document.createElement('div');

    await mount(hostA, context as never, { webPartId: 'a' });
    await mount(hostB, context as never, { webPartId: 'b' });

    expect(mocks.createRoot).toHaveBeenCalledTimes(2);
    expect(mocks.QueryClient).toHaveBeenCalledTimes(2);
    expect(mocks.createdRoots[0]?.unmount).toHaveBeenCalledTimes(1);
    expect(mocks.queryClients[0]?.clear).toHaveBeenCalledTimes(1);
  });

  it('supports unmount followed by a clean remount', async () => {
    const { mount, unmount } = await loadMountModule();
    const context = { pageContext: {} } as unknown;
    const host = document.createElement('div');

    await mount(host, context as never, { webPartId: 'first' });
    unmount();
    await mount(host, context as never, { webPartId: 'second' });

    expect(mocks.createRoot).toHaveBeenCalledTimes(2);
    expect(mocks.QueryClient).toHaveBeenCalledTimes(2);
    expect(mocks.createdRoots[0]?.unmount).toHaveBeenCalledTimes(1);
    expect(mocks.queryClients[0]?.clear).toHaveBeenCalledTimes(1);
    expect(mocks.resolveSpfxPermissions).toHaveBeenCalledTimes(2);
    expect(mocks.bootstrapSpfxAuth).toHaveBeenCalledTimes(2);
  });
});
