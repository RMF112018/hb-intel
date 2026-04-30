import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, waitFor } from '@testing-library/react';
import {
  DOCUMENT_CONTROL_SOURCES,
  DOCUMENT_CONTROL_SOURCE_IDS,
  SAMPLE_EXTERNAL_SYSTEM_MISSING_CONFIGS,
  SAMPLE_PRIORITY_ACTIONS,
  SAMPLE_PROJECT_PROFILE,
  SAMPLE_SITE_HEALTH_SUMMARY,
} from '@hbc/models/pcc';
import { mount as mountPcc, unmount as unmountPcc } from '../mount';
import { PccApp } from '../PccApp';
import { PccBentoGrid } from '../layout/PccBentoGrid';
import { PccSurfaceRouter } from '../shell/PccSurfaceRouter';
import { createPccFixtureReadModelClient } from '../api/pccFixtureReadModelClient';

const ENCODED_ID = encodeURIComponent(SAMPLE_PROJECT_PROFILE.projectId);
const HOME_URL = `https://example.invalid/api/pcc/projects/${ENCODED_ID}/home`;
const DOC_URL = `https://example.invalid/api/pcc/projects/${ENCODED_ID}/document-control`;

function homeOk() {
  return {
    projectId: SAMPLE_PROJECT_PROFILE.projectId,
    mode: 'mock',
    sourceStatus: 'available',
    readOnly: true,
    warnings: [],
    generatedAtUtc: '2026-04-30T00:00:00.000Z',
    data: {
      profile: SAMPLE_PROJECT_PROFILE,
      priorityActions: SAMPLE_PRIORITY_ACTIONS,
      missingConfigurations: SAMPLE_EXTERNAL_SYSTEM_MISSING_CONFIGS,
      siteHealth: SAMPLE_SITE_HEALTH_SUMMARY,
    },
  };
}

function docOk() {
  return {
    projectId: SAMPLE_PROJECT_PROFILE.projectId,
    mode: 'mock',
    sourceStatus: 'available',
    readOnly: true,
    warnings: [],
    generatedAtUtc: '2026-04-30T00:00:00.000Z',
    data: {
      sources: DOCUMENT_CONTROL_SOURCE_IDS.map((id) => DOCUMENT_CONTROL_SOURCES[id]),
    },
  };
}

function jsonResponse(body: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: async () => body,
  } as unknown as Response;
}

let host: HTMLElement;
let fetchSpy: ReturnType<typeof vi.fn>;

beforeEach(() => {
  host = document.createElement('div');
  document.body.appendChild(host);
  fetchSpy = vi.fn();
  vi.stubGlobal('fetch', fetchSpy);
});

afterEach(() => {
  unmountPcc();
  host.remove();
  vi.unstubAllGlobals();
});

describe('PccApp default fixture path', () => {
  it('renders all 10 cards without invoking fetch when no readModelClient is supplied', async () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    const cards = container.querySelectorAll('[data-pcc-card]');
    expect(cards).toHaveLength(10);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe('mount(...) opt-in', () => {
  it('mount(el, ctx, { readModel: { readModelMode: "fixture" } }) does not invoke fetch', async () => {
    fetchSpy.mockImplementation(() => {
      throw new Error('fetch must not be called for fixture mode');
    });
    await act(async () => {
      mountPcc(host, undefined, { readModel: { readModelMode: 'fixture' } });
    });
    await waitFor(() => {
      const cards = host.querySelectorAll('[data-pcc-card]');
      expect(cards.length).toBe(10);
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('mount(el, ctx, { readModel: { readModelMode: "backend", backendBaseUrl } }) invokes fetch with the canonical URLs (GET only)', async () => {
    fetchSpy.mockImplementation((url: string) => {
      if (url === HOME_URL) return Promise.resolve(jsonResponse({ data: homeOk() }));
      if (url === DOC_URL) return Promise.resolve(jsonResponse({ data: docOk() }));
      throw new Error(`unexpected fetch URL: ${url}`);
    });
    await act(async () => {
      mountPcc(host, undefined, {
        readModel: {
          readModelMode: 'backend',
          backendBaseUrl: 'https://example.invalid',
        },
      });
    });
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });
    const calls = fetchSpy.mock.calls.map((c) => ({ url: c[0], init: c[1] }));
    const urls = calls.map((c) => c.url).sort();
    expect(urls).toEqual([DOC_URL, HOME_URL].sort());
    for (const c of calls) {
      expect(c.init?.method).toBe('GET');
    }

    const cards = host.querySelectorAll('[data-pcc-card]');
    expect(cards).toHaveLength(10);
    const grid = host.querySelector('[data-pcc-bento-grid]');
    expect(grid).not.toBeNull();
    for (const card of cards) {
      expect(card.parentElement === grid).toBe(true);
    }
    const panels = host.querySelectorAll('[data-pcc-active-surface-panel]');
    expect(panels).toHaveLength(1);
    expect(panels[0]!.getAttribute('data-pcc-active-surface-panel')).toBe('project-home');
  });

  it('mount(el, ctx, { readModel: { readModelMode: "backend" } }) without baseUrl does not invoke fetch and renders error states', async () => {
    fetchSpy.mockImplementation(() => {
      throw new Error('fetch must not be called when backend baseUrl is missing');
    });
    await act(async () => {
      mountPcc(host, undefined, { readModel: { readModelMode: 'backend' } });
    });
    await waitFor(() => {
      const errorMarkers = host.querySelectorAll('[data-pcc-state="error"]');
      expect(errorMarkers.length).toBeGreaterThan(0);
    });
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(host.querySelectorAll('[data-pcc-card]')).toHaveLength(10);
  });
});

describe('PccSurfaceRouter — non-Project-Home surfaces ignore the read-model client', () => {
  it('does not invoke client methods for non-project-home surfaces', async () => {
    const client = createPccFixtureReadModelClient();
    const homeSpy = vi.spyOn(client, 'getProjectHome');
    const docSpy = vi.spyOn(client, 'getDocumentControl');

    render(
      <PccBentoGrid forceMode="wideDesktop">
        <PccSurfaceRouter activeSurfaceId="documents" readModelClient={client} />
      </PccBentoGrid>,
    );

    await new Promise((r) => setTimeout(r, 0));
    expect(homeSpy).not.toHaveBeenCalled();
    expect(docSpy).not.toHaveBeenCalled();
  });
});
