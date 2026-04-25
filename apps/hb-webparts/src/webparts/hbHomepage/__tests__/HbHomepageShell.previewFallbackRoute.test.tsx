import * as React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, waitFor, within } from '@testing-library/react';
import type { ShellContainerState } from '../shell/useShellContainer.js';

// This file proves the Wave 07 wiring end-to-end through the homepage
// runtime path: HbHomepageShell → SafetyFieldExcellenceZone →
// SafetyFieldExcellenceDynamicProvider → SafetyFieldExcellenceDataAdapter →
// fetch → preview-fallback render. Neither the safety zone, the dynamic
// provider, the adapter, nor the ui-kit preview surface is mocked here —
// the rendered DOM and the runtime-proof state reflect the real wiring
// path that ships in `hb-intel-homepage.sppkg`.
//
// HbHomepage and HbHomepageEntryStack are intentionally NOT mounted from
// this file: both are typed `{...props}` spread wrappers whose forwarding
// is already proven by the TypeScript signature (HbHomepageProps) and by
// the existing `hbHomepageEntryStack.test.tsx`. The missing wiring this
// remediation addresses is at the shell→zone seam and below; that is what
// these tests cover.

vi.mock('../zones/CompanyPulseZone.js', () => ({
  CompanyPulseZone: (): React.JSX.Element => React.createElement('div', { 'data-test-mock': 'company-pulse' }),
}));
vi.mock('../zones/LeadershipMessageZone.js', () => ({
  LeadershipMessageZone: (): React.JSX.Element => React.createElement('div', { 'data-test-mock': 'leadership-message' }),
}));
vi.mock('../zones/ProjectPortfolioSpotlightZone.js', () => ({
  ProjectPortfolioSpotlightZone: (): React.JSX.Element => React.createElement('div', { 'data-test-mock': 'project-portfolio-spotlight' }),
}));
vi.mock('../zones/PeopleCulturePublicZone.js', () => ({
  PeopleCulturePublicZone: (): React.JSX.Element => React.createElement('div', { 'data-test-mock': 'people-culture-public' }),
}));
vi.mock('../zones/HbKudosZone.js', () => ({
  HbKudosZone: (): React.JSX.Element => React.createElement('div', { 'data-test-mock': 'hb-kudos' }),
}));

// Imported AFTER vi.mock so the mocked modules take effect.
// eslint-disable-next-line import/first
import { HbHomepageShell } from '../HbHomepageShell.js';
// eslint-disable-next-line import/first
import {
  clearSafetyFieldExcellenceRuntimeProof,
  readSafetyFieldExcellenceRuntimeProof,
} from '../../safetyFieldExcellence/safetyFieldExcellenceRuntimeProof.js';

function makeStubContainer(): ShellContainerState {
  // Wide enough that the secondary "safety-field-excellence" slot gets at
  // least its preferred width (~720px) and renders in standard mode rather
  // than the constrained/compact path that swaps in compactSummary.
  return {
    width: 2200,
    authoritativeWidth: 2200,
    shellInlineInsetTotal: 0,
    height: 900,
    entryState: {
      id: 'ultrawide-desktop',
      label: 'Premium wide composition',
      minWidth: 1600,
      maxWidth: 2400,
      firstLaneColumns: 2,
      firstLanePairingAllowed: true,
      dominanceRule: 'left-dominant',
    },
    entryStateReason: 'width-match',
    shortHeightConstrained: false,
  };
}

function buildNoPublishedResponse(): Response {
  return new Response(JSON.stringify({ state: 'no-published-highlight' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('HbHomepageShell — full-route preview fallback proof (Wave 07 wiring)', () => {
  beforeEach(() => {
    clearSafetyFieldExcellenceRuntimeProof();
  });

  afterEach(() => {
    clearSafetyFieldExcellenceRuntimeProof();
    vi.restoreAllMocks();
  });

  it('renders the preview fallback when sourceMode=dynamic-only and the backend returns no-published', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockImplementation(async () => buildNoPublishedResponse());
    const shellRef = React.createRef<HTMLDivElement>();
    const container = makeStubContainer();
    const config = {
      safetyFieldExcellenceDynamic: {
        sourceMode: 'dynamic-only',
        functionAppBaseUrl: 'https://function-app.example',
        includeStale: false,
        diagnosticsEnabled: false,
        emergencyUseCuratedFallback: false,
        safetyHubUrl: 'https://contoso.sharepoint.com/sites/Safety',
      },
    };
    const fakeToken = vi.fn(async () => 'fake-token');

    const { container: rendered } = render(
      <HbHomepageShell
        config={config}
        identity={{ displayName: 'Test', email: 'test@example.com' }}
        siteUrl="https://contoso.sharepoint.com/sites/HBCentral"
        getGraphToken={async () => 'graph-token'}
        getFunctionAppToken={fakeToken}
        functionAppBaseUrl="https://function-app.example"
        container={container}
        shellRef={shellRef}
      />,
    );

    // Adapter fetched the homepage/current endpoint with the configured base URL.
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalled();
    });
    const requestedUrl = String(fetchSpy.mock.calls[0]?.[0] ?? '');
    expect(requestedUrl).toContain('/api/safety-field-excellence/homepage/current');
    expect(requestedUrl).toContain('https://function-app.example');

    // Preview fallback DOM is reachable through the homepage path. Use the
    // ui-kit's stable surface-root selector first (always present once the
    // surface renders), then assert the preview/fallback attributes (only
    // set when isPreview=true / fallbackReason='preview').
    await waitFor(() => {
      const surface = rendered.querySelector('[data-hbc-premium="safety-homepage-surface"]');
      expect(surface).not.toBeNull();
      expect(surface?.getAttribute('data-hbc-safety-preview')).toBe('true');
    });
    const surface = rendered.querySelector(
      '[data-hbc-premium="safety-homepage-surface"]',
    ) as HTMLElement | null;
    expect(surface).not.toBeNull();
    expect(surface!.getAttribute('data-hbc-safety-fallback-reason')).toBe('preview');
    expect(within(surface!).getAllByText(/Preview/i).length).toBeGreaterThan(0);

    // Runtime proof reflects the preview fallback through the homepage wiring.
    await waitFor(() => {
      const proof = readSafetyFieldExcellenceRuntimeProof();
      expect(proof?.sourceMode).toBe('dynamic-only');
      expect(proof?.dataSource).toBe('preview-fallback');
      expect(proof?.previewFallbackRendered).toBe(true);
      expect(proof?.backendFunctionAppUrlConfigured).toBe(true);
      expect(proof?.currentEndpointConfigured).toBe(true);
      expect(proof?.fallbackReason).toBe('no-published-highlight');
      // Wave 07.1 diagnostic: page config carried a usable dynamic block.
      expect(proof?.safetyFieldExcellenceDynamicConfigSeen).toBe(true);
      expect(proof?.safetyFieldExcellenceDynamicConfigResolved).toBe(true);
    });
  });

  it('renders the preview fallback when sourceMode=dynamic-only and the Function App token is missing', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockImplementation(async () => buildNoPublishedResponse());
    const shellRef = React.createRef<HTMLDivElement>();
    const container = makeStubContainer();
    const config = {
      safetyFieldExcellenceDynamic: {
        sourceMode: 'dynamic-only',
        functionAppBaseUrl: 'https://function-app.example',
        includeStale: false,
        diagnosticsEnabled: false,
        emergencyUseCuratedFallback: false,
        safetyHubUrl: 'https://contoso.sharepoint.com/sites/Safety',
      },
    };

    const { container: rendered } = render(
      <HbHomepageShell
        config={config}
        identity={{ displayName: 'Test', email: 'test@example.com' }}
        siteUrl="https://contoso.sharepoint.com/sites/HBCentral"
        getGraphToken={async () => 'graph-token'}
        getFunctionAppToken={undefined}
        functionAppBaseUrl="https://function-app.example"
        container={container}
        shellRef={shellRef}
      />,
    );

    // Without a token provider the adapter must NOT call /homepage/current.
    expect(fetchSpy).not.toHaveBeenCalled();

    // Preview fallback still renders via the unconfigured branch. Same
    // attribute selectors as the configured-no-published case above.
    try {
      await waitFor(
        () => {
          const surface = rendered.querySelector('[data-hbc-safety-preview="true"]');
          expect(surface).not.toBeNull();
        },
        { timeout: 3000 },
      );
    } catch (e) {
      throw e;
    }
    const surface = rendered.querySelector('[data-hbc-safety-preview="true"]') as HTMLElement | null;
    expect(surface).not.toBeNull();
    expect(surface!.getAttribute('data-hbc-safety-fallback-reason')).toBe('preview');
    expect(within(surface!).getAllByText(/Preview/i).length).toBeGreaterThan(0);

    await waitFor(() => {
      const proof = readSafetyFieldExcellenceRuntimeProof();
      expect(proof?.sourceMode).toBe('dynamic-only');
      expect(proof?.dataSource).toBe('preview-fallback');
      expect(proof?.previewFallbackRendered).toBe(true);
      expect(proof?.backendFunctionAppUrlConfigured).toBe(true);
      expect(proof?.currentEndpointConfigured).toBe(false);
      expect(proof?.fallbackReason).toBe('function-app-token-not-configured');
      // Wave 07.1 diagnostic: page config carried a usable dynamic block;
      // the missing piece is the token provider, not the dynamic config.
      expect(proof?.safetyFieldExcellenceDynamicConfigSeen).toBe(true);
      expect(proof?.safetyFieldExcellenceDynamicConfigResolved).toBe(true);
    });
  });

  it('Wave 07.1 diagnostic: page config has the safetyFieldExcellenceDynamic key but its value is null → seen=true, resolved=false; zone falls back to curated-only render path', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const shellRef = React.createRef<HTMLDivElement>();
    const container = makeStubContainer();
    // Key is present on the config but its value is null. SafetyFieldExcellenceZone
    // sees the key (raw candidate !== undefined) but readDynamicConfig rejects
    // the non-object value, so the resolved dynamic config stays undefined.
    const config: Record<string, unknown> = {
      safetyFieldExcellenceDynamic: null,
    };

    render(
      <HbHomepageShell
        config={config}
        identity={{ displayName: 'Test', email: 'test@example.com' }}
        siteUrl="https://contoso.sharepoint.com/sites/HBCentral"
        getGraphToken={async () => 'graph-token'}
        getFunctionAppToken={undefined}
        functionAppBaseUrl={undefined}
        container={container}
        shellRef={shellRef}
      />,
    );

    // No dynamic resolution → no fetch.
    expect(fetchSpy).not.toHaveBeenCalled();

    await waitFor(() => {
      const proof = readSafetyFieldExcellenceRuntimeProof();
      expect(proof?.safetyFieldExcellenceDynamicConfigSeen).toBe(true);
      expect(proof?.safetyFieldExcellenceDynamicConfigResolved).toBe(false);
      // The zone falls back to curated-only because the dynamic block could
      // not be resolved. This is the exact disambiguation the Wave 07.1
      // diagnostic is designed to surface.
      expect(proof?.sourceMode).toBe('curated-only');
      expect(proof?.dataSource).toBe('curated');
    });
  });
});
