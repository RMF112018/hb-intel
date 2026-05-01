import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, renderHook, waitFor } from '@testing-library/react';
import {
  SAMPLE_PROJECT_PROFILE,
  type IProjectDocumentSourceRegistryEntry,
  type PccDocumentControlReadModel,
  type PccProjectId,
  type PccReadModelEnvelope,
  type PccReadModelSourceStatus,
} from '@hbc/models/pcc';
import { PccBentoGrid } from '../layout/PccBentoGrid';
import { PccDocumentsSurface } from '../surfaces/documents/PccDocumentsSurface';
import {
  HB_DOCUMENT_CONTROL_CENTER_TITLE,
  MY_PROJECT_FILES_WARNING_TEXT,
  type IPccDocumentsReadModelClient,
} from '../surfaces/documents/documentControlViewModel';
import { useDocumentControlReadModel } from '../surfaces/documents/useDocumentControlReadModel';
import { createPccFixtureReadModelClient } from '../api/pccFixtureReadModelClient';

const KNOWN_PROJECT_ID = SAMPLE_PROJECT_PROFILE.projectId;
const UNKNOWN_PROJECT_ID = '99999999-0000-0000-0000-000000000000' as PccProjectId;

function fixtureClient(): IPccDocumentsReadModelClient {
  const base = createPccFixtureReadModelClient();
  return {
    getDocumentControl: (id, persona) => base.getDocumentControl(id, persona),
  };
}

function unavailableClient(): IPccDocumentsReadModelClient {
  const base = createPccFixtureReadModelClient({ simulateBackendUnavailable: true });
  return {
    getDocumentControl: (id, persona) => base.getDocumentControl(id, persona),
  };
}

function unknownProjectClient(): IPccDocumentsReadModelClient {
  return {
    getDocumentControl: (id, persona) => {
      const base = createPccFixtureReadModelClient();
      return base.getDocumentControl(UNKNOWN_PROJECT_ID, persona ?? id ? undefined : undefined);
    },
  };
}

async function renderWithClient(client?: IPccDocumentsReadModelClient) {
  const utils = render(
    <PccBentoGrid forceMode="wideDesktop">
      <PccDocumentsSurface readModelClient={client} />
    </PccBentoGrid>,
  );
  if (client) {
    await waitFor(() => {
      const lanes = utils.container.querySelectorAll('[data-pcc-doc-lane]');
      expect(lanes.length).toBeGreaterThanOrEqual(3);
    });
  }
  return utils;
}

describe('PccDocumentsSurface — Wave 7 three-lane shell', () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('renders the HB Document Control Center header title', async () => {
    const { container } = await renderWithClient(fixtureClient());
    expect(container.textContent).toContain(HB_DOCUMENT_CONTROL_CENTER_TITLE);
  });

  it('renders exactly three lane cards: project-record, my-project-files, external-systems', async () => {
    const { container } = await renderWithClient(fixtureClient());
    const projectRecord = container.querySelectorAll('[data-pcc-doc-lane="project-record"]');
    const myProjectFiles = container.querySelectorAll('[data-pcc-doc-lane="my-project-files"]');
    const externalSystems = container.querySelectorAll('[data-pcc-doc-lane="external-systems"]');
    expect(projectRecord.length).toBe(1);
    expect(myProjectFiles.length).toBe(1);
    expect(externalSystems.length).toBe(1);
    const all = container.querySelectorAll('[data-pcc-doc-lane]');
    expect(all.length).toBe(3);
  });

  it('header card does NOT emit any data-pcc-doc-lane marker (only lane cards do)', async () => {
    const { container } = await renderWithClient(fixtureClient());
    const headerPanel = container.querySelector('[data-pcc-active-surface-panel="documents"]');
    expect(headerPanel).not.toBeNull();
    expect(headerPanel!.querySelector('[data-pcc-doc-lane]')).toBeNull();
  });

  it('Project Record lane renders the SharePoint project record source displayName', async () => {
    const { container } = await renderWithClient(fixtureClient());
    const lane = container.querySelector('[data-pcc-doc-lane="project-record"]');
    expect(lane).not.toBeNull();
    const entries = lane!.querySelectorAll('[data-pcc-document-source-id]');
    expect(entries.length).toBeGreaterThan(0);
    const sharepointEntry = lane!.querySelector(
      '[data-pcc-document-source-id="project-record-primary"]',
    );
    expect(sharepointEntry).not.toBeNull();
    expect(sharepointEntry!.textContent).toContain('Project Record Library');
  });

  it('My Project Files lane renders the required warning text verbatim', async () => {
    const { container } = await renderWithClient(fixtureClient());
    const lane = container.querySelector('[data-pcc-doc-lane="my-project-files"]');
    expect(lane).not.toBeNull();
    const warning = lane!.querySelector('[data-pcc-doc-lane-warning="my-project-files"]');
    expect(warning).not.toBeNull();
    expect(warning!.textContent).toBe(MY_PROJECT_FILES_WARNING_TEXT);
  });

  it('My Project Files lane renders only the current project folder path', async () => {
    const { container } = await renderWithClient(fixtureClient());
    const lane = container.querySelector('[data-pcc-doc-lane="my-project-files"]');
    expect(lane).not.toBeNull();
    const pathEls = lane!.querySelectorAll('[data-pcc-doc-source-path]');
    expect(pathEls.length).toBeGreaterThan(0);
    for (const el of pathEls) {
      const path = el.getAttribute('data-pcc-doc-source-path') ?? '';
      expect(path.startsWith('/My Project Files/26-000-00-')).toBe(true);
      expect(path).not.toBe('/My Project Files');
      expect(path).not.toBe('/My Project Files/');
    }
  });

  it('My Project Files lane drops sentinel root paths via the adapter (custom envelope)', async () => {
    const tamperedClient: IPccDocumentsReadModelClient = {
      async getDocumentControl(): Promise<PccReadModelEnvelope<PccDocumentControlReadModel>> {
        return {
          projectId: KNOWN_PROJECT_ID,
          mode: 'fixture',
          sourceStatus: 'available' as PccReadModelSourceStatus,
          readOnly: true,
          warnings: [],
          generatedAtUtc: '2026-04-30T00:00:00.000Z',
          data: {
            sources: [],
            wave7LaneVocabulary: ['project-record', 'my-project-files', 'external-systems'],
            sourceRegistry: [
              {
                sourceKey: 'tampered-mpf-root',
                displayName: 'Tampered Root',
                wave7Lane: 'my-project-files',
                sourceKind: 'my-project-files',
                enabled: true,
                binding: {
                  kind: 'my-project-files',
                  rootFolderName: 'My Project Files',
                  userObjectId: 'user-x',
                  projectId: KNOWN_PROJECT_ID,
                  projectFolderName: '',
                  projectFolderPath: '/My Project Files',
                },
              },
              {
                sourceKey: 'tampered-mpf-cross-project',
                displayName: 'Other Project Leak',
                wave7Lane: 'my-project-files',
                sourceKind: 'my-project-files',
                enabled: true,
                binding: {
                  kind: 'my-project-files',
                  rootFolderName: 'My Project Files',
                  userObjectId: 'user-x',
                  projectId: UNKNOWN_PROJECT_ID,
                  projectFolderName: '99-999-99-Other Project',
                  projectFolderPath: '/My Project Files/99-999-99-Other Project',
                },
              },
            ],
          },
        };
      },
    };
    const { container } = await renderWithClient(tamperedClient);
    const lane = container.querySelector('[data-pcc-doc-lane="my-project-files"]');
    expect(lane).not.toBeNull();
    const entries = lane!.querySelectorAll('[data-pcc-document-source-id]');
    expect(entries.length).toBe(0);
    expect(lane!.querySelector('[data-pcc-doc-lane-empty="true"]')).not.toBeNull();
    expect(container.textContent).not.toContain('99-999-99');
    expect(container.textContent).not.toContain('Other Project Leak');
  });

  it('External Systems lane renders Procore, Document Crunch, and Adobe Sign as launch/status only', async () => {
    const { container } = await renderWithClient(fixtureClient());
    const lane = container.querySelector('[data-pcc-doc-lane="external-systems"]');
    expect(lane).not.toBeNull();
    const procore = lane!.querySelector('[data-pcc-document-source-id="external-procore"]');
    const docCrunch = lane!.querySelector('[data-pcc-document-source-id="external-document-crunch"]');
    const adobeSign = lane!.querySelector('[data-pcc-document-source-id="external-adobe-sign"]');
    expect(procore).not.toBeNull();
    expect(docCrunch).not.toBeNull();
    expect(adobeSign).not.toBeNull();
    const externalAnchors = lane!.querySelectorAll('a[href]');
    for (const a of externalAnchors) {
      const href = a.getAttribute('href') ?? '';
      expect(href).not.toMatch(/^https?:\/\//);
    }
  });

  it('renders no <a href="http(s)://"> elements anywhere on the surface', async () => {
    const { container } = await renderWithClient(fixtureClient());
    const anchors = container.querySelectorAll('a[href]');
    for (const a of anchors) {
      const href = a.getAttribute('href') ?? '';
      expect(href).not.toMatch(/^https?:\/\//);
    }
  });

  it('preview action chips are inert (disabled, aria-disabled, marked preview-disabled)', async () => {
    const { container } = await renderWithClient(fixtureClient());
    const chips = container.querySelectorAll(
      '[data-pcc-doc-action-execution-state="preview-disabled"]',
    );
    expect(chips.length).toBeGreaterThan(0);
    for (const chip of chips) {
      expect(chip.tagName).toBe('BUTTON');
      const btn = chip as HTMLButtonElement;
      expect(btn.disabled).toBe(true);
      expect(btn.getAttribute('aria-disabled')).toBe('true');
      expect(btn.getAttribute('onclick')).toBeNull();
    }
  });

  it('preserves bento direct-child invariant (every card is a direct child of the bento grid)', async () => {
    const { container } = await renderWithClient(fixtureClient());
    const grid = container.querySelector('[data-pcc-bento-grid]');
    expect(grid).not.toBeNull();
    const cards = container.querySelectorAll('[data-pcc-card]');
    expect(cards.length).toBe(4);
    for (const card of cards) {
      expect(card.parentElement === grid).toBe(true);
    }
  });

  it('emits exactly one [data-pcc-active-surface-panel="documents"] (on the header card)', async () => {
    const { container } = await renderWithClient(fixtureClient());
    const panels = container.querySelectorAll('[data-pcc-active-surface-panel]');
    expect(panels.length).toBe(1);
    expect(panels[0]!.getAttribute('data-pcc-active-surface-panel')).toBe('documents');
  });

  it('renders the same three-lane shell when no readModelClient is supplied (fallback path)', async () => {
    const { container } = await renderWithClient(undefined);
    const lanes = container.querySelectorAll('[data-pcc-doc-lane]');
    expect(lanes.length).toBe(3);
    const empty = container.querySelectorAll('[data-pcc-doc-lane-empty="true"]');
    expect(empty.length).toBe(3);
    expect(container.textContent).toContain(HB_DOCUMENT_CONTROL_CENTER_TITLE);
  });

  it('renders safely when the envelope is backend-unavailable (header + three empty lanes, no crash)', async () => {
    const { container } = await renderWithClient(unavailableClient());
    expect(container.textContent).toContain(HB_DOCUMENT_CONTROL_CENTER_TITLE);
    const lanes = container.querySelectorAll('[data-pcc-doc-lane]');
    expect(lanes.length).toBe(3);
    for (const lane of lanes) {
      expect(lane.querySelectorAll('[data-pcc-document-source-id]').length).toBe(0);
    }
  });

  it('renders safely when the envelope is source-unavailable (unknown project, MPF lane stays empty)', async () => {
    const { container } = await renderWithClient(unknownProjectClient());
    const mpfLane = container.querySelector('[data-pcc-doc-lane="my-project-files"]');
    expect(mpfLane).not.toBeNull();
    expect(mpfLane!.querySelectorAll('[data-pcc-document-source-id]').length).toBe(0);
  });

  it('does not call fetch (read-only / fixture-only)', async () => {
    await renderWithClient(fixtureClient());
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('legacy sources compatibility: surface still renders three lanes when sourceRegistry is missing', async () => {
    const legacyOnlyClient: IPccDocumentsReadModelClient = {
      async getDocumentControl() {
        return {
          projectId: KNOWN_PROJECT_ID,
          mode: 'fixture',
          sourceStatus: 'available' as PccReadModelSourceStatus,
          readOnly: true,
          warnings: [],
          generatedAtUtc: '2026-04-30T00:00:00.000Z',
          data: { sources: [] },
        };
      },
    };
    const { container } = await renderWithClient(legacyOnlyClient);
    const lanes = container.querySelectorAll('[data-pcc-doc-lane]');
    expect(lanes.length).toBe(3);
  });
});

// ─── Wave 7 03B follow-up: deterministic MPF allow-path enforcement ───
// All three cases use the legitimate Wave 7 fixture path
// `/My Project Files/26-000-00-Stadium Enclave` and a tampered path
// `/My Project Files/99-999-99-Other Project`. Both bindings carry the
// legitimate `binding.projectId` (KNOWN_PROJECT_ID) so cross-project
// projectId checks alone cannot drop the tamper. The deterministic
// constant in the adapter is the only barrier.

const LEGIT_MPF_PATH = '/My Project Files/26-000-00-Stadium Enclave';
const TAMPER_MPF_PATH = '/My Project Files/99-999-99-Other Project';

function legitMpfEntry(): IProjectDocumentSourceRegistryEntry {
  return {
    sourceKey: 'my-project-files-current-user',
    displayName: 'My Project Files',
    wave7Lane: 'my-project-files',
    sourceKind: 'my-project-files',
    enabled: true,
    binding: {
      kind: 'my-project-files',
      rootFolderName: 'My Project Files',
      userObjectId: 'user-project-manager',
      projectId: KNOWN_PROJECT_ID,
      projectFolderName: '26-000-00-Stadium Enclave',
      projectFolderPath: LEGIT_MPF_PATH,
    },
  };
}

function tamperedSameProjectIdEntry(): IProjectDocumentSourceRegistryEntry {
  return {
    sourceKey: 'tampered-mpf-same-projectid-wrong-folder',
    displayName: 'Other Project Leak',
    wave7Lane: 'my-project-files',
    sourceKind: 'my-project-files',
    enabled: true,
    binding: {
      kind: 'my-project-files',
      rootFolderName: 'My Project Files',
      userObjectId: 'user-project-manager',
      projectId: KNOWN_PROJECT_ID,
      projectFolderName: '99-999-99-Other Project',
      projectFolderPath: TAMPER_MPF_PATH,
    },
  };
}

function envelopeWithRegistry(
  registry: readonly IProjectDocumentSourceRegistryEntry[],
): PccReadModelEnvelope<PccDocumentControlReadModel> {
  return {
    projectId: KNOWN_PROJECT_ID,
    mode: 'fixture',
    sourceStatus: 'available',
    readOnly: true,
    warnings: [],
    generatedAtUtc: '2026-04-30T00:00:00.000Z',
    data: {
      sources: [],
      wave7LaneVocabulary: ['project-record', 'my-project-files', 'external-systems'],
      sourceRegistry: registry,
    },
  };
}

function clientReturning(
  envelope: PccReadModelEnvelope<PccDocumentControlReadModel>,
): IPccDocumentsReadModelClient {
  return {
    async getDocumentControl() {
      return envelope;
    },
  };
}

describe('PccDocumentsSurface — MPF deterministic allow-path enforcement (Wave 7 03B follow-up)', () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('Case 1 — legitimate first, then same-projectId wrong-folder tamper: tamper dropped', async () => {
    const client = clientReturning(
      envelopeWithRegistry([legitMpfEntry(), tamperedSameProjectIdEntry()]),
    );
    const { container } = render(
      <PccBentoGrid forceMode="wideDesktop">
        <PccDocumentsSurface readModelClient={client} />
      </PccBentoGrid>,
    );
    await waitFor(() => {
      const lane = container.querySelector('[data-pcc-doc-lane="my-project-files"]');
      expect(lane?.querySelectorAll('[data-pcc-document-source-id]').length).toBe(1);
    });
    const lane = container.querySelector('[data-pcc-doc-lane="my-project-files"]')!;
    const entries = lane.querySelectorAll('[data-pcc-document-source-id]');
    expect(entries.length).toBe(1);
    expect(entries[0]!.getAttribute('data-pcc-document-source-id')).toBe(
      'my-project-files-current-user',
    );
    expect(lane.textContent).toContain(LEGIT_MPF_PATH);
    expect(lane.textContent).not.toContain('99-999-99-Other Project');
    expect(lane.textContent).not.toContain('Other Project Leak');
  });

  it('Case 2 — tamper first, then legitimate: tamper dropped, legitimate retained', async () => {
    const client = clientReturning(
      envelopeWithRegistry([tamperedSameProjectIdEntry(), legitMpfEntry()]),
    );
    const { container } = render(
      <PccBentoGrid forceMode="wideDesktop">
        <PccDocumentsSurface readModelClient={client} />
      </PccBentoGrid>,
    );
    await waitFor(() => {
      const lane = container.querySelector('[data-pcc-doc-lane="my-project-files"]');
      expect(lane?.querySelectorAll('[data-pcc-document-source-id]').length).toBe(1);
    });
    const lane = container.querySelector('[data-pcc-doc-lane="my-project-files"]')!;
    const entries = lane.querySelectorAll('[data-pcc-document-source-id]');
    expect(entries.length).toBe(1);
    expect(entries[0]!.getAttribute('data-pcc-document-source-id')).toBe(
      'my-project-files-current-user',
    );
    expect(lane.textContent).toContain(LEGIT_MPF_PATH);
    expect(lane.textContent).not.toContain('99-999-99-Other Project');
    expect(lane.textContent).not.toContain('Other Project Leak');
  });

  it('Case 3 — tamper-only registry: MPF lane renders empty, tamper text absent', async () => {
    const client = clientReturning(envelopeWithRegistry([tamperedSameProjectIdEntry()]));
    const { container } = render(
      <PccBentoGrid forceMode="wideDesktop">
        <PccDocumentsSurface readModelClient={client} />
      </PccBentoGrid>,
    );
    await waitFor(() => {
      const lane = container.querySelector('[data-pcc-doc-lane="my-project-files"]');
      expect(lane?.querySelector('[data-pcc-doc-lane-empty="true"]')).not.toBeNull();
    });
    const lane = container.querySelector('[data-pcc-doc-lane="my-project-files"]')!;
    expect(lane.querySelectorAll('[data-pcc-document-source-id]').length).toBe(0);
    expect(lane.querySelector('[data-pcc-doc-lane-empty="true"]')).not.toBeNull();
    expect(lane.textContent).not.toContain('99-999-99-Other Project');
    expect(lane.textContent).not.toContain('Other Project Leak');
  });
});

// ─── Wave 7 03B follow-up: hook degraded-state posture ───
// Backend-unavailable and source-unavailable envelopes flow through the
// 'preview' path with a safe-empty view model. Only thrown rejections
// yield 'error'. Tested at the hook level (decoupled from DOM) so the
// preview-vs-error distinction is observable directly on result.status.

function backendUnavailableEnvelope(): PccReadModelEnvelope<PccDocumentControlReadModel> {
  return {
    projectId: KNOWN_PROJECT_ID,
    mode: 'fixture',
    sourceStatus: 'backend-unavailable',
    readOnly: true,
    warnings: [{ code: 'backend-unavailable', message: 'simulated' }],
    generatedAtUtc: '2026-04-30T00:00:00.000Z',
    data: {
      sources: [],
      wave7LaneVocabulary: ['project-record', 'my-project-files', 'external-systems'],
      sourceRegistry: [],
    },
  };
}

function sourceUnavailableEnvelope(): PccReadModelEnvelope<PccDocumentControlReadModel> {
  return {
    projectId: KNOWN_PROJECT_ID,
    mode: 'fixture',
    sourceStatus: 'source-unavailable',
    readOnly: true,
    warnings: [{ code: 'source-unavailable', message: 'simulated' }],
    generatedAtUtc: '2026-04-30T00:00:00.000Z',
    data: {
      sources: [],
      wave7LaneVocabulary: ['project-record', 'my-project-files', 'external-systems'],
      sourceRegistry: [],
    },
  };
}

describe('useDocumentControlReadModel — degraded-state posture (Wave 7 03B follow-up)', () => {
  it('available envelope → status "preview" with viewModel and sourceStatus "available"', async () => {
    const client = clientReturning(envelopeWithRegistry([legitMpfEntry()]));
    const { result } = renderHook(() => useDocumentControlReadModel(client, KNOWN_PROJECT_ID));
    await waitFor(() => expect(result.current.status).toBe('preview'));
    expect(result.current.sourceStatus).toBe('available');
    expect(result.current.viewModel).toBeDefined();
    expect(result.current.viewModel!.lanes['my-project-files'].entries.length).toBe(1);
  });

  it('backend-unavailable envelope → status "preview" with safe-empty viewModel and sourceStatus "backend-unavailable"', async () => {
    const client = clientReturning(backendUnavailableEnvelope());
    const { result } = renderHook(() => useDocumentControlReadModel(client, KNOWN_PROJECT_ID));
    await waitFor(() => expect(result.current.status).toBe('preview'));
    expect(result.current.sourceStatus).toBe('backend-unavailable');
    expect(result.current.viewModel).toBeDefined();
    expect(result.current.viewModel!.lanes['project-record'].entries.length).toBe(0);
    expect(result.current.viewModel!.lanes['my-project-files'].entries.length).toBe(0);
    expect(result.current.viewModel!.lanes['external-systems'].entries.length).toBe(0);
  });

  it('source-unavailable envelope → status "preview" with safe-empty viewModel and sourceStatus "source-unavailable"', async () => {
    const client = clientReturning(sourceUnavailableEnvelope());
    const { result } = renderHook(() => useDocumentControlReadModel(client, KNOWN_PROJECT_ID));
    await waitFor(() => expect(result.current.status).toBe('preview'));
    expect(result.current.sourceStatus).toBe('source-unavailable');
    expect(result.current.viewModel).toBeDefined();
    expect(result.current.viewModel!.lanes['project-record'].entries.length).toBe(0);
    expect(result.current.viewModel!.lanes['my-project-files'].entries.length).toBe(0);
    expect(result.current.viewModel!.lanes['external-systems'].entries.length).toBe(0);
  });

  it('thrown / rejected client → status "error" with no viewModel and no sourceStatus', async () => {
    const client: IPccDocumentsReadModelClient = {
      async getDocumentControl() {
        throw new Error('boom');
      },
    };
    const { result } = renderHook(() => useDocumentControlReadModel(client, KNOWN_PROJECT_ID));
    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.viewModel).toBeUndefined();
    expect(result.current.sourceStatus).toBeUndefined();
  });
});
