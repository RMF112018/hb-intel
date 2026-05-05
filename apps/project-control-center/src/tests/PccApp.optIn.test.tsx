import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, waitFor } from '@testing-library/react';
import {
  DOCUMENT_CONTROL_SOURCES,
  DOCUMENT_CONTROL_SOURCE_IDS,
  SAMPLE_APPROVALS_READ_MODEL,
  SAMPLE_EXTERNAL_SYSTEM_MISSING_CONFIGS,
  SAMPLE_PRIORITY_ACTIONS,
  SAMPLE_PROCORE_PROJECT_MAPPING_READ_MODEL,
  SAMPLE_PROCORE_SYNC_HEALTH_READ_MODEL,
  SAMPLE_PROJECT_PROFILE,
  SAMPLE_SITE_HEALTH_SUMMARY,
  SAMPLE_UNIFIED_LIFECYCLE_READ_MODEL,
} from '@hbc/models/pcc';
import { mount as mountPcc, unmount as unmountPcc } from '../mount';
import { PccApp } from '../PccApp';
import { PccBentoGrid } from '../layout/PccBentoGrid';
import { PccSurfaceRouter } from '../shell/PccSurfaceRouter';
import { createPccFixtureReadModelClient } from '../api/pccFixtureReadModelClient';

const ENCODED_ID = encodeURIComponent(SAMPLE_PROJECT_PROFILE.projectId);
const HOME_URL = `https://example.invalid/api/pcc/projects/${ENCODED_ID}/home`;
const PRIORITY_URL = `https://example.invalid/api/pcc/projects/${ENCODED_ID}/priority-actions`;
const DOC_URL = `https://example.invalid/api/pcc/projects/${ENCODED_ID}/document-control`;
const TEAM_ACCESS_URL = `https://example.invalid/api/pcc/projects/${ENCODED_ID}/team-access`;
const UNIFIED_LIFECYCLE_URL = `https://example.invalid/api/pcc/projects/${ENCODED_ID}/unified-lifecycle`;
const PROCORE_MAPPING_URL = `https://example.invalid/api/pcc/projects/${ENCODED_ID}/procore-project-mapping`;
const PROCORE_SYNC_URL = `https://example.invalid/api/pcc/projects/${ENCODED_ID}/procore-sync-health`;
const APPROVALS_URL = `https://example.invalid/api/pcc/projects/${ENCODED_ID}/approvals`;

function unifiedLifecycleOk() {
  return {
    projectId: SAMPLE_PROJECT_PROFILE.projectId,
    mode: 'mock',
    sourceStatus: 'available',
    readOnly: true,
    warnings: [],
    generatedAtUtc: '2026-04-30T00:00:00.000Z',
    data: SAMPLE_UNIFIED_LIFECYCLE_READ_MODEL,
  };
}

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

function priorityOk() {
  return {
    projectId: SAMPLE_PROJECT_PROFILE.projectId,
    mode: 'mock',
    sourceStatus: 'available',
    readOnly: true,
    warnings: [],
    generatedAtUtc: '2026-04-30T00:00:00.000Z',
    data: { actions: SAMPLE_PRIORITY_ACTIONS },
  };
}

function procoreMappingOk() {
  return {
    projectId: SAMPLE_PROJECT_PROFILE.projectId,
    mode: 'mock',
    sourceStatus: 'available',
    readOnly: true,
    warnings: [],
    generatedAtUtc: '2026-04-30T00:00:00.000Z',
    data: SAMPLE_PROCORE_PROJECT_MAPPING_READ_MODEL,
  };
}

function procoreSyncOk() {
  return {
    projectId: SAMPLE_PROJECT_PROFILE.projectId,
    mode: 'mock',
    sourceStatus: 'available',
    readOnly: true,
    warnings: [],
    generatedAtUtc: '2026-04-30T00:00:00.000Z',
    data: SAMPLE_PROCORE_SYNC_HEALTH_READ_MODEL,
  };
}

function approvalsOk() {
  return {
    projectId: SAMPLE_PROJECT_PROFILE.projectId,
    mode: 'mock',
    sourceStatus: 'available',
    readOnly: true,
    warnings: [],
    generatedAtUtc: '2026-04-30T00:00:00.000Z',
    data: SAMPLE_APPROVALS_READ_MODEL,
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
      // Wave 99 / Prompts 05B + 06C — read-model-driven Project Home
      // renders 10 existing cards + 4 unified-lifecycle cards + 1
      // Ask-HBI card = 15. Wave 13 / Prompt 13E — adds 1 Procore
      // snapshot card (16 total). The Ask-HBI card mounts in idle
      // posture (initialQuery={null}), so its presence does not
      // introduce a getUnifiedSearch fetch on initial mount.
      expect(cards.length).toBe(16);
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('mount(el, ctx, { readModel: { readModelMode: "backend", backendBaseUrl } }) invokes fetch with the canonical URLs (GET only)', async () => {
    fetchSpy.mockImplementation((url: string) => {
      if (url === HOME_URL) return Promise.resolve(jsonResponse({ data: homeOk() }));
      if (url === PRIORITY_URL) return Promise.resolve(jsonResponse({ data: priorityOk() }));
      if (url === DOC_URL) return Promise.resolve(jsonResponse({ data: docOk() }));
      // Wave 99 / Prompt 05B — Project Home now also drives a
      // getUnifiedLifecycle call via PccProjectHomeUnifiedLifecycleSection.
      if (url === UNIFIED_LIFECYCLE_URL)
        return Promise.resolve(jsonResponse({ data: unifiedLifecycleOk() }));
      // Wave 13 / Prompt 13E — Project Home drives two additional
      // calls (procore-project-mapping, procore-sync-health) for the
      // Procore snapshot card.
      if (url === PROCORE_MAPPING_URL)
        return Promise.resolve(jsonResponse({ data: procoreMappingOk() }));
      if (url === PROCORE_SYNC_URL) return Promise.resolve(jsonResponse({ data: procoreSyncOk() }));
      // Wave 14 / Prompt 06 — Project Home now also drives a getApprovals
      // call (per-call .catch in the hook gracefully degrades on failure;
      // the call still goes out and contributes to the canonical URL set).
      if (url === APPROVALS_URL) return Promise.resolve(jsonResponse({ data: approvalsOk() }));
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
      expect(fetchSpy).toHaveBeenCalledTimes(7);
    });
    const calls = fetchSpy.mock.calls.map((c) => ({ url: c[0], init: c[1] }));
    const urls = calls.map((c) => c.url).sort();
    expect(urls).toEqual(
      [
        DOC_URL,
        HOME_URL,
        PRIORITY_URL,
        UNIFIED_LIFECYCLE_URL,
        PROCORE_MAPPING_URL,
        PROCORE_SYNC_URL,
        APPROVALS_URL,
      ].sort(),
    );
    for (const c of calls) {
      expect(c.init?.method).toBe('GET');
    }

    const cards = host.querySelectorAll('[data-pcc-card]');
    // Wave 99 / Prompts 05B + 06C — 10 existing + 4 unified-lifecycle
    // + 1 Ask-HBI = 15. Wave 13 / Prompt 13E — +1 Procore snapshot
    // = 16. Ask-HBI mounts in idle posture, so the canonical
    // backend-mode URL set above is unchanged (no extra unified-search
    // request added until the user clicks a sample query).
    expect(cards).toHaveLength(16);
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
    // Wave 13 / Prompt 13E — Procore snapshot card adds 1 (15 → 16).
    expect(host.querySelectorAll('[data-pcc-card]')).toHaveLength(16);
  });

  it('mount(...) returns a thenable that resolves so the SPFx shell can chain .catch()', async () => {
    const result = mountPcc(host, undefined, { readModel: { readModelMode: 'fixture' } });
    expect(typeof (result as Promise<void> | undefined)?.then).toBe('function');
    await expect(result).resolves.toBeUndefined();
  });

  it('mount(host) without a readModel config defaults to the fixture client and renders the read-model-driven surfaces', async () => {
    fetchSpy.mockImplementation(() => {
      throw new Error('fetch must not be called when mount() defaults to the fixture client');
    });
    await act(async () => {
      await mountPcc(host);
    });
    await waitFor(() => {
      const cards = host.querySelectorAll('[data-pcc-card]');
      // Decisive assertion (primary): no-config mount must produce the same
      // card count as the explicit fixture-mode mount above (line 171). The
      // number itself is governed by that sibling test — this is intentionally
      // mirroring the canonical fixture-mode contract, NOT an independent
      // magic number. If the canonical fixture-mode count changes, both
      // tests move together.
      expect(cards.length).toBe(16);
    });
    // Secondary guard: confirms the new path stays inside the no-runtime
    // posture (fixture client is synchronous/in-memory). Decisive proof of
    // the fix is the card count above; this assertion only proves the fix
    // didn't accidentally introduce a network call.
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('mount(host) renders resolved Project Home fixture content (skeleton/busy markers cleared)', async () => {
    // Wave 99: this test closes the resolved-content gap — prior tests
    // counted cards (`length === 16`) but never asserted that the cards
    // had actually exited skeleton state with fixture data populated.
    // A regression that left `useProjectHomeReadModel` stuck at
    // `'loading'` would still produce 16 card containers (each rendering
    // `viewModel?.* ?? 'preview'`) and pass the count test, while the
    // tenant rendered placeholder content. This assertion anchors to
    // canonical fixture text from `@hbc/models/pcc` (project name and
    // number) so the check moves with the canonical sample, not invented
    // strings.
    fetchSpy.mockImplementation(() => {
      throw new Error('fetch must not be called when mount() defaults to the fixture client');
    });
    await act(async () => {
      await mountPcc(host);
    });
    await waitFor(() => {
      const text = host.textContent ?? '';
      // Decisive primary: canonical Project Home fixture identifiers are
      // visible in the rendered DOM. If the hook is stuck at `'loading'`
      // (the prior bug), `viewModel` is undefined, the intelligence card
      // renders no profile data, and these strings are absent.
      expect(text).toContain(SAMPLE_PROJECT_PROFILE.projectName);
      expect(text).toContain(SAMPLE_PROJECT_PROFILE.projectNumber);
    });
    // Decisive secondary: no element is left in `aria-busy="true"`
    // posture. PccPreviewState renders `aria-busy` while in `'loading'`
    // posture; once slots resolve, those flags clear.
    expect(host.querySelectorAll('[aria-busy="true"]').length).toBe(0);
  });
});

describe('PccSurfaceRouter — non-opted surfaces ignore the read-model client', () => {
  it('does not invoke any client methods for genuinely non-opted surfaces (e.g. site-health)', async () => {
    const client = createPccFixtureReadModelClient();
    const homeSpy = vi.spyOn(client, 'getProjectHome');
    const prioritySpy = vi.spyOn(client, 'getPriorityActions');
    const docSpy = vi.spyOn(client, 'getDocumentControl');
    const teamAccessSpy = vi.spyOn(client, 'getTeamAccess');

    render(
      <PccBentoGrid forceMode="wideDesktop">
        <PccSurfaceRouter activeSurfaceId="site-health" readModelClient={client} />
      </PccBentoGrid>,
    );

    await new Promise((r) => setTimeout(r, 0));
    expect(homeSpy).not.toHaveBeenCalled();
    expect(prioritySpy).not.toHaveBeenCalled();
    expect(docSpy).not.toHaveBeenCalled();
    expect(teamAccessSpy).not.toHaveBeenCalled();
  });

  it('Wave 7 / Prompt 03B — when activeSurfaceId is documents, only getDocumentControl is called', async () => {
    const client = createPccFixtureReadModelClient();
    const homeSpy = vi.spyOn(client, 'getProjectHome');
    const prioritySpy = vi.spyOn(client, 'getPriorityActions');
    const docSpy = vi.spyOn(client, 'getDocumentControl');
    const teamAccessSpy = vi.spyOn(client, 'getTeamAccess');

    render(
      <PccBentoGrid forceMode="wideDesktop">
        <PccSurfaceRouter activeSurfaceId="documents" readModelClient={client} />
      </PccBentoGrid>,
    );

    await new Promise((r) => setTimeout(r, 0));
    expect(docSpy).toHaveBeenCalledTimes(1);
    expect(homeSpy).not.toHaveBeenCalled();
    expect(prioritySpy).not.toHaveBeenCalled();
    expect(teamAccessSpy).not.toHaveBeenCalled();
  });
});

describe('PccSurfaceRouter — Team & Access opt-in (Wave 6 / Prompt 06)', () => {
  it('does not invoke getTeamAccess when activeSurfaceId is project-home', async () => {
    const client = createPccFixtureReadModelClient();
    const teamAccessSpy = vi.spyOn(client, 'getTeamAccess');

    render(
      <PccBentoGrid forceMode="wideDesktop">
        <PccSurfaceRouter activeSurfaceId="project-home" readModelClient={client} />
      </PccBentoGrid>,
    );

    await new Promise((r) => setTimeout(r, 0));
    expect(teamAccessSpy).not.toHaveBeenCalled();
  });

  it('invokes getTeamAccess exactly once when activeSurfaceId is team-and-access (no Project Home calls)', async () => {
    const client = createPccFixtureReadModelClient();
    const homeSpy = vi.spyOn(client, 'getProjectHome');
    const prioritySpy = vi.spyOn(client, 'getPriorityActions');
    const docSpy = vi.spyOn(client, 'getDocumentControl');
    const teamAccessSpy = vi.spyOn(client, 'getTeamAccess');

    render(
      <PccBentoGrid forceMode="wideDesktop">
        <PccSurfaceRouter activeSurfaceId="team-and-access" readModelClient={client} />
      </PccBentoGrid>,
    );

    await new Promise((r) => setTimeout(r, 0));
    expect(teamAccessSpy).toHaveBeenCalledTimes(1);
    expect(teamAccessSpy).toHaveBeenCalledWith(SAMPLE_PROJECT_PROFILE.projectId);
    expect(homeSpy).not.toHaveBeenCalled();
    expect(prioritySpy).not.toHaveBeenCalled();
    expect(docSpy).not.toHaveBeenCalled();
  });

  it('renders safe error state for team-and-access when the read-model client is backend-unavailable (Wave 6 / Prompt 07)', async () => {
    const client = createPccFixtureReadModelClient({ simulateBackendUnavailable: true });

    const { container } = render(
      <PccBentoGrid forceMode="wideDesktop">
        <PccSurfaceRouter activeSurfaceId="team-and-access" readModelClient={client} />
      </PccBentoGrid>,
    );

    await waitFor(() => {
      const marker = container.querySelector('[data-pcc-team-access-read-model-content]');
      expect(marker?.getAttribute('data-pcc-team-access-read-model-content')).toBe('error');
    });
    expect(container.querySelector('[data-pcc-state="error"]')).not.toBeNull();
    expect(container.querySelector('[data-pcc-team-access-lane]')).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
