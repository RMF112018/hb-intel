import * as React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import type { HbHomepageZoneProps } from '../../hbHomepageContract.js';
import {
  OccupantContentStateProvider,
  useOccupantContentStateReport,
  type OccupantContentStateReport,
} from '../../shell/occupantContentState.js';
import { FoleonHomepageLaneHost } from '../FoleonHomepageLaneHost.js';

const mocks = vi.hoisted(() => ({
  laneSpy: vi.fn(),
  contractSpy: vi.fn(),
  status: {
    value: undefined as unknown,
  },
}));

vi.mock('@hbc/foleon-reader', async () => {
  const ReactModule = await import('react');
  interface MockContractParams {
    readonly hasSpfxContext?: boolean;
    readonly siteUrl?: string;
    readonly config?: Record<string, unknown>;
    readonly packageIdentity: {
      readonly manifestId: string;
      readonly packageVersion: string;
    };
    readonly getAccessToken?: () => Promise<string>;
    readonly telemetryIdentity?: Record<string, unknown>;
  }
  interface MockLaneProps {
    readonly lane?: string;
    readonly onStatusChange?: (status: unknown) => void;
  }
  return {
    createEmbeddedFoleonRuntimeContract: vi.fn((params: MockContractParams) => {
      mocks.contractSpy(params);
      const canInitialize = Boolean(params.config?.contentRegistryListId);
      return {
        hostMode: params.hasSpfxContext ? 'sharepoint' : 'mock',
        route: params.config?.foleonRoute ?? 'highlights',
        docId: null,
        siteUrl: params.siteUrl ?? null,
        listIds: {
          contentRegistry: params.config?.contentRegistryListId ?? null,
          placements: params.config?.placementsListId ?? null,
          events: params.config?.eventsListId ?? null,
        },
        originPolicy: { allowedOrigins: params.config?.acceptedFoleonOrigins ?? [], allowPreview: false, requireHttps: true },
        governed: {
          expectedManifestId: params.packageIdentity.manifestId,
          expectedPackageVersion: params.packageIdentity.packageVersion,
          manifestIdMatchesExpected: true,
          packageVersionMatchesExpected: true,
        },
        readerRoutePath: null,
        apiBaseUrl: params.config?.foleonApiBaseUrl ?? null,
        apiResource: params.config?.foleonApiResource ?? null,
        getAccessToken: params.getAccessToken,
        telemetry: params.telemetryIdentity ?? { correlationId: '', sessionId: '' },
        canInitialize,
        issues: canInitialize ? [] : ['missing-content-registry-list-id'],
        blockingReasons: canInitialize ? [] : ['missing-content-registry-list-id'],
      };
    }),
    FoleonEmbeddedReaderLane: (props: MockLaneProps): React.ReactElement => {
      mocks.laneSpy(props);
      ReactModule.useEffect(() => {
        props.onStatusChange?.(mocks.status.value);
      }, [props]);
      return ReactModule.createElement('div', {
        'data-test-foleon-lane': props.lane,
      });
    },
  };
});

function makeZoneProps(): HbHomepageZoneProps {
  return {
    moduleConfig: {},
    siteUrl: 'https://contoso.sharepoint.com/sites/HBCentral',
    getFoleonApiToken: async () => 'foleon-token',
    foleonConfig: {
      foleonContentRegistryListId: 'content-list',
      foleonPlacementsListId: 'placements-list',
      foleonEventsListId: 'events-list',
      foleonAcceptedOrigins: ['https://viewer.us.foleon.com'],
      foleonAllowPreview: false,
      foleonExpectedManifestId: '2160edb3-675e-4451-92bb-8345f9d1c71e',
      foleonExpectedPackageVersion: '1.0.23.0',
      foleonApiBaseUrl: 'https://functions.example/api',
      foleonApiResource: 'api://foleon-api',
    },
  };
}

function ContentStateInspector({
  occupantId,
  onRead,
}: {
  occupantId: 'project-portfolio-spotlight' | 'company-pulse';
  onRead: (report: OccupantContentStateReport | undefined) => void;
}): null {
  const report = useOccupantContentStateReport(occupantId);
  React.useEffect(() => onRead(report), [onRead, report]);
  return null;
}

describe('FoleonHomepageLaneHost', () => {
  beforeEach(() => {
    mocks.laneSpy.mockClear();
    mocks.contractSpy.mockClear();
    mocks.status.value = {
      kind: 'preview',
      resolution: { kind: 'preview', reason: 'no-active-record', warnings: [] },
    };
  });

  it('maps homepage config into the embedded Project Spotlight reader lane', async () => {
    let latest: OccupantContentStateReport | undefined;
    const { container } = render(
      <OccupantContentStateProvider>
        <FoleonHomepageLaneHost
          {...makeZoneProps()}
          lane="projectSpotlight"
          occupantId="project-portfolio-spotlight"
        />
        <ContentStateInspector
          occupantId="project-portfolio-spotlight"
          onRead={(report) => {
            latest = report;
          }}
        />
      </OccupantContentStateProvider>,
    );

    await waitFor(() => expect(mocks.laneSpy).toHaveBeenCalled());
    expect(container.querySelector('[data-test-foleon-lane="projectSpotlight"]')).not.toBeNull();
    expect(mocks.contractSpy.mock.calls[0][0].config).toEqual(
      expect.objectContaining({
        contentRegistryListId: 'content-list',
        placementsListId: 'placements-list',
        eventsListId: 'events-list',
        expectedPackageVersion: '1.0.23.0',
        foleonRoute: 'projectSpotlight',
        foleonApiResource: 'api://foleon-api',
      }),
    );
    await waitFor(() => expect(latest?.kind).toBe('empty'));
    expect(latest?.summary).toBe('no-active-record');
  });

  it('reports strong content state for a ready Company Pulse lane', async () => {
    mocks.status.value = {
      kind: 'ready',
      resolution: {
        kind: 'ready',
        record: { id: 1, title: 'Company Pulse' },
        embedUrl: 'https://viewer.us.foleon.com/embed/pulse',
        warnings: [],
      },
    };
    let latest: OccupantContentStateReport | undefined;

    render(
      <OccupantContentStateProvider>
        <FoleonHomepageLaneHost
          {...makeZoneProps()}
          lane="companyPulse"
          occupantId="company-pulse"
        />
        <ContentStateInspector
          occupantId="company-pulse"
          onRead={(report) => {
            latest = report;
          }}
        />
      </OccupantContentStateProvider>,
    );

    await waitFor(() => expect(latest?.kind).toBe('strong'));
    expect(latest?.summary).toBe('live-reader');
    expect(mocks.laneSpy.mock.calls[0][0].lane).toBe('companyPulse');
  });

  it('reports invalid and does not render the reader lane when required config is missing', async () => {
    let latest: OccupantContentStateReport | undefined;
    const props = makeZoneProps();
    render(
      <OccupantContentStateProvider>
        <FoleonHomepageLaneHost
          {...props}
          foleonConfig={{
            ...props.foleonConfig!,
            foleonContentRegistryListId: undefined,
          }}
          lane="projectSpotlight"
          occupantId="project-portfolio-spotlight"
        />
        <ContentStateInspector
          occupantId="project-portfolio-spotlight"
          onRead={(report) => {
            latest = report;
          }}
        />
      </OccupantContentStateProvider>,
    );

    await waitFor(() => expect(latest?.kind).toBe('invalid'));
    expect(latest?.summary).toBe('missing-content-registry-list-id');
    expect(mocks.laneSpy).not.toHaveBeenCalled();
  });
});
