import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { HbcThemeProvider } from '@hbc/ui-kit/homepage';
import { PnpOps } from '../../webparts/pnp/PnpOps.js';
import { ReferenceHomepageComposition } from '../ReferenceHomepageComposition.js';

const { renderMock, unmountMock, createRootMock } = vi.hoisted(() => {
  const render = vi.fn<(node: ReactNode) => void>();
  const unmount = vi.fn();
  const createRoot = vi.fn(() => ({
    render,
    unmount,
  }));
  return { renderMock: render, unmountMock: unmount, createRootMock: createRoot };
});

vi.mock('react-dom/client', () => ({
  createRoot: createRootMock,
}));

/**
 * Mount/dispatch seam tests.
 *
 * These tests verify that the WEBPART_RENDERERS map in mount.tsx covers
 * all 10 production webpart manifest IDs and that the global API is
 * correctly published. They do NOT mount React roots — they test the
 * dispatch table and module contract structurally.
 */

// The mount module publishes its API on globalThis, so importing it
// has the side effect of registering __hbIntel_hbWebparts.
import '../../mount.js';

const EXPECTED_WEBPART_IDS = [
  '46bfde64-f0cb-4f62-9f6b-a466f8fadc1f', // PersonalizedWelcomeHeader
  '39762a4d-c7fd-44a6-a11e-4f8de9f5778d', // HbHeroBanner
  'b3f07190-79cf-437d-a1d6-ecbf3f77e616', // PriorityActionsRail
  'cb7060f5-b852-4600-b912-a5f6f7221ce2', // ToolLauncherWorkHub
  '0b53f651-fd92-4f7f-a9da-f7797017f5eb', // CompanyPulse
  'e8fa8a84-a48a-41d2-85a6-b7c7df70aeca', // LeadershipMessage
  '27ac10f4-4054-4dd2-bd53-3b4ef4379ab4', // PeopleCulture
  '8370ab0c-b6df-4db0-82f1-24b54750f508', // ProjectPortfolioSpotlight
  '89ca5ff3-21f4-4b23-a953-4b7306ea1029', // SafetyFieldExcellence
  '11d72b36-a92f-4e2d-9918-75df2cb0d11e', // SmartSearchWayfinding
];

describe('mount/dispatch seam', () => {
  beforeEach(() => {
    createRootMock.mockClear();
    renderMock.mockClear();
    unmountMock.mockClear();
  });

  it('publishes mount and unmount on globalThis', () => {
    const api = (globalThis as Record<string, unknown>).__hbIntel_hbWebparts as
      | { mount: unknown; unmount: unknown }
      | undefined;

    expect(api).toBeDefined();
    expect(typeof api?.mount).toBe('function');
    expect(typeof api?.unmount).toBe('function');
  });

  it('mount function accepts the SPFx loader contract signature', () => {
    const api = (globalThis as Record<string, unknown>).__hbIntel_hbWebparts as {
      mount: (...args: unknown[]) => unknown;
    };

    // mount(el, spfxContext?, config?) — at least 1 param
    expect(api.mount.length).toBeGreaterThanOrEqual(1);
  });

  it('wraps the PnP branch in HbcThemeProvider with forceTheme=light', async () => {
    const api = (globalThis as Record<string, unknown>).__hbIntel_hbWebparts as {
      mount: (el: HTMLElement, spfxContext?: unknown, config?: unknown) => Promise<void>;
    };
    await api.mount({} as HTMLElement, undefined, {
      webPartId: '9e2dd84a-a121-4fb3-a964-f43a94abf9fd',
      webPartProperties: {},
    });

    expect(createRootMock).toHaveBeenCalledTimes(1);
    expect(renderMock).toHaveBeenCalledTimes(1);
    const renderedRoot = renderMock.mock.calls[0]?.[0] as {
      type: unknown;
      props: { forceTheme?: unknown; children?: { type?: unknown } };
    };
    expect(renderedRoot?.type).toBe(HbcThemeProvider);
    expect(renderedRoot?.props?.forceTheme).toBe('light');
    expect(renderedRoot?.props?.children?.type).toBe(PnpOps);
  });

  it('wraps the no-ID composition path in HbcThemeProvider with forceTheme=light', async () => {
    const api = (globalThis as Record<string, unknown>).__hbIntel_hbWebparts as {
      mount: (el: HTMLElement, spfxContext?: unknown, config?: unknown) => Promise<void>;
    };
    await api.mount({} as HTMLElement, undefined, {});

    expect(createRootMock).toHaveBeenCalledTimes(1);
    expect(renderMock).toHaveBeenCalledTimes(1);
    const renderedRoot = renderMock.mock.calls[0]?.[0] as {
      type: unknown;
      props: { forceTheme?: unknown; children?: { type?: unknown } };
    };
    expect(renderedRoot?.type).toBe(HbcThemeProvider);
    expect(renderedRoot?.props?.forceTheme).toBe('light');
    expect(renderedRoot?.props?.children?.type).toBe(ReferenceHomepageComposition);
  });
});

describe('webpart renderer registry', () => {
  // We can't directly import WEBPART_RENDERERS (not exported), but we can
  // verify the mount module loads all 10 webpart components by checking
  // that the expected IDs are present in the module source. This is a
  // structural test — the authoritative runtime test is the SPFx tenant
  // validation protocol.

  it('mount module references all 10 production webpart manifest IDs', async () => {
    // Read the mount module source to verify all IDs are wired
    const { readFileSync } = await import('fs');
    const { resolve } = await import('path');
    const mountSource = readFileSync(
      resolve(__dirname, '../../mount.tsx'),
      'utf8',
    );

    for (const id of EXPECTED_WEBPART_IDS) {
      expect(
        mountSource.includes(id),
        `mount.tsx must reference webpart ID ${id}`,
      ).toBe(true);
    }
  });

  it('mount module does not reference the excluded scaffold manifest ID', async () => {
    const { readFileSync } = await import('fs');
    const { resolve } = await import('path');
    const mountSource = readFileSync(
      resolve(__dirname, '../../mount.tsx'),
      'utf8',
    );

    const EXCLUDED_SCAFFOLD_ID = '535f5a17-fc49-40ea-ac16-5d68895884f7';
    expect(
      mountSource.includes(EXCLUDED_SCAFFOLD_ID),
      'mount.tsx must NOT reference the excluded scaffold manifest ID',
    ).toBe(false);
  });

  it('mount module wires HbcThemeProvider at the render boundary', async () => {
    const { readFileSync } = await import('fs');
    const { resolve } = await import('path');
    const mountSource = readFileSync(
      resolve(__dirname, '../../mount.tsx'),
      'utf8',
    );

    expect(
      mountSource.includes('HbcThemeProvider'),
      'mount.tsx must include HbcThemeProvider wiring for ui-kit homepage consumers',
    ).toBe(true);
    expect(
      mountSource.includes("forceTheme: 'light'"),
      'mount.tsx must enforce SharePoint light-mode theme context',
    ).toBe(true);
  });
});
