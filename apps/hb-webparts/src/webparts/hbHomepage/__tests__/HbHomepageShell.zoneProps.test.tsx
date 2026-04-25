import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import type { ShellContainerState } from '../shell/useShellContainer.js';

const safetyZoneSpy = vi.fn();
const companyPulseZoneSpy = vi.fn();
const leadershipMessageZoneSpy = vi.fn();
const projectPortfolioSpotlightZoneSpy = vi.fn();

// Module-level mock: capture every prop SafetyFieldExcellenceZone receives
// so we can assert the new Function App seams reach the zone via zoneProps.
vi.mock('../zones/SafetyFieldExcellenceZone.js', () => ({
  SafetyFieldExcellenceZone: (props: Record<string, unknown>): React.JSX.Element => {
    safetyZoneSpy(props);
    return React.createElement('div', {
      'data-test-mock': 'safety-zone',
      'data-test-has-function-app-base-url':
        typeof props.functionAppBaseUrl === 'string' ? 'true' : 'false',
      'data-test-function-app-base-url':
        typeof props.functionAppBaseUrl === 'string' ? props.functionAppBaseUrl : '',
      'data-test-has-function-app-token':
        typeof props.getFunctionAppToken === 'function' ? 'true' : 'false',
    });
  },
}));

// Stub the other zones so the preset can render without exercising
// their internals — this test is scoped to forwarding, not zone behavior.
vi.mock('../zones/CompanyPulseZone.js', () => ({
  CompanyPulseZone: (props: Record<string, unknown>): React.JSX.Element => {
    companyPulseZoneSpy(props);
    return React.createElement('div', { 'data-test-mock': 'company-pulse' });
  },
}));
vi.mock('../zones/LeadershipMessageZone.js', () => ({
  LeadershipMessageZone: (props: Record<string, unknown>): React.JSX.Element => {
    leadershipMessageZoneSpy(props);
    return React.createElement('div', { 'data-test-mock': 'leadership-message' });
  },
}));
vi.mock('../zones/ProjectPortfolioSpotlightZone.js', () => ({
  ProjectPortfolioSpotlightZone: (props: Record<string, unknown>): React.JSX.Element => {
    projectPortfolioSpotlightZoneSpy(props);
    return React.createElement('div', { 'data-test-mock': 'project-portfolio-spotlight' });
  },
}));
vi.mock('../zones/PeopleCulturePublicZone.js', () => ({
  PeopleCulturePublicZone: (): React.JSX.Element => React.createElement('div', { 'data-test-mock': 'people-culture-public' }),
}));
vi.mock('../zones/HbKudosZone.js', () => ({
  HbKudosZone: (): React.JSX.Element => React.createElement('div', { 'data-test-mock': 'hb-kudos' }),
}));

// Imported after vi.mock so the mocked modules take effect.
import { HbHomepageShell } from '../HbHomepageShell.js';

function makeStubContainer(): ShellContainerState {
  return {
    width: 1300,
    authoritativeWidth: 1300,
    shellInlineInsetTotal: 0,
    height: 900,
    entryState: {
      id: 'standard-laptop',
      label: 'Compressed flagship desktop (primary baseline)',
      minWidth: 1180,
      maxWidth: 1599,
      firstLaneColumns: 2,
      firstLanePairingAllowed: true,
      dominanceRule: 'left-dominant',
    },
    entryStateReason: 'width-match',
    shortHeightConstrained: false,
  };
}

describe('HbHomepageShell — zoneProps forwarding (Wave 07 wiring)', () => {
  it('forwards getFunctionAppToken and functionAppBaseUrl into zoneProps for the safety zone', () => {
    safetyZoneSpy.mockClear();
    const fakeToken = vi.fn(async () => 'fake-token');
    const shellRef = React.createRef<HTMLDivElement>();
    const container = makeStubContainer();

    act(() => {
      render(
        <HbHomepageShell
          config={undefined}
          identity={{ displayName: 'Test', email: 'test@example.com' }}
          assetBaseUrl="https://assets.example/"
          siteUrl="https://contoso.sharepoint.com/sites/HBCentral"
          getGraphToken={async () => 'graph-token'}
          getFunctionAppToken={fakeToken}
          functionAppBaseUrl="https://function-app.example"
          container={container}
          shellRef={shellRef}
        />,
      );
    });

    expect(safetyZoneSpy).toHaveBeenCalled();
    const propsReceived = safetyZoneSpy.mock.calls[0][0] as Record<string, unknown>;
    expect(propsReceived.functionAppBaseUrl).toBe('https://function-app.example');
    expect(propsReceived.getFunctionAppToken).toBe(fakeToken);
  });

  it('still forwards undefined seams cleanly when the host did not configure them', () => {
    safetyZoneSpy.mockClear();
    const shellRef = React.createRef<HTMLDivElement>();
    const container = makeStubContainer();

    act(() => {
      render(
        <HbHomepageShell
          config={undefined}
          identity={{ displayName: 'Test', email: 'test@example.com' }}
          siteUrl="https://contoso.sharepoint.com/sites/HBCentral"
          getGraphToken={async () => 'graph-token'}
          container={container}
          shellRef={shellRef}
        />,
      );
    });

    expect(safetyZoneSpy).toHaveBeenCalled();
    const propsReceived = safetyZoneSpy.mock.calls[0][0] as Record<string, unknown>;
    expect(propsReceived.functionAppBaseUrl).toBeUndefined();
    expect(propsReceived.getFunctionAppToken).toBeUndefined();
  });

  it('forwards homepage Foleon config and token seams into all three communications zones', () => {
    companyPulseZoneSpy.mockClear();
    leadershipMessageZoneSpy.mockClear();
    projectPortfolioSpotlightZoneSpy.mockClear();
    const fakeFoleonToken = vi.fn(async () => 'foleon-token');
    const shellRef = React.createRef<HTMLDivElement>();
    const container = makeStubContainer();
    const foleonConfig = {
      foleonContentRegistryListId: 'content-list-id',
      foleonPlacementsListId: 'placements-list-id',
      foleonEventsListId: 'events-list-id',
      foleonAcceptedOrigins: 'https://viewer.us.foleon.com, https://viewer.eu.foleon.com',
      foleonAllowPreview: false,
      foleonExpectedManifestId: '2160edb3-675e-4451-92bb-8345f9d1c71e',
      foleonExpectedPackageVersion: '1.0.23.0',
      foleonApiBaseUrl: 'https://functions.example/api',
      foleonApiResource: 'api://foleon-api',
    };

    let rendered: ReturnType<typeof render> | undefined;
    act(() => {
      rendered = render(
        <HbHomepageShell
          config={foleonConfig}
          identity={{ displayName: 'Test', email: 'test@example.com' }}
          siteUrl="https://contoso.sharepoint.com/sites/HBCentral"
          getGraphToken={async () => 'graph-token'}
          getFoleonApiToken={fakeFoleonToken}
          container={container}
          shellRef={shellRef}
        />,
      );
    });

    const shell = rendered?.container.querySelector('[data-shell-post-hero="true"]');
    expect(shell?.getAttribute('data-shell-prohibited-pairing-diagnostics')).toBe('0');
    for (const spy of [companyPulseZoneSpy, leadershipMessageZoneSpy, projectPortfolioSpotlightZoneSpy]) {
      expect(spy).toHaveBeenCalled();
      const propsReceived = spy.mock.calls[0][0] as Record<string, unknown>;
      expect(propsReceived.getFoleonApiToken).toBe(fakeFoleonToken);
      expect(propsReceived.foleonConfig).toEqual({
        foleonContentRegistryListId: 'content-list-id',
        foleonPlacementsListId: 'placements-list-id',
        foleonEventsListId: 'events-list-id',
        foleonAcceptedOrigins: ['https://viewer.us.foleon.com', 'https://viewer.eu.foleon.com'],
        foleonAllowPreview: false,
        foleonExpectedManifestId: '2160edb3-675e-4451-92bb-8345f9d1c71e',
        foleonExpectedPackageVersion: '1.0.23.0',
        foleonApiBaseUrl: 'https://functions.example/api',
        foleonApiResource: 'api://foleon-api',
      });
    }
  });
});
