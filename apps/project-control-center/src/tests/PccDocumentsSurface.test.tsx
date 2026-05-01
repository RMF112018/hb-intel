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
    // Wave 7 / Prompt 04: 5 cards = header + 3 lanes + permissions card.
    expect(cards.length).toBe(5);
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

// ─── Wave 7 / Prompt 04 — Permissions & Guardrails ───
// Render permission/action availability and hard-no guardrails as
// read-model rendering only. No runtime authorization, no buttons,
// no anchors, no persona-driven filtering.

const FIXTURE_ROLE_ACTION_ROWS = [
  'R05-PR01',
  'R05-MP02',
  'R14-PR10',
  'R14-WF01',
  'R01-SB06',
  'R03-EX02',
  'R01-EX04',
];

describe('PccDocumentsSurface — permissions & guardrails (Wave 7 / Prompt 04)', () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('action catalog renders grouped by family with PR / MP / SB / EX / WF families and all six action codes', async () => {
    const { container } = await renderWithClient(fixtureClient());
    const card = container.querySelector('[data-pcc-doc-permissions-card="true"]');
    expect(card).not.toBeNull();
    for (const family of ['PR', 'MP', 'SB', 'EX', 'WF']) {
      expect(
        card!.querySelector(`[data-pcc-doc-action-family="${family}"]`),
        `family ${family} group should render`,
      ).not.toBeNull();
    }
    for (const code of ['PR01', 'MP01', 'SB01', 'EX01', 'EX04', 'WF01']) {
      expect(
        card!.querySelector(`[data-pcc-doc-action="${code}"]`),
        `action ${code} should render`,
      ).not.toBeNull();
    }
  });

  it('availability values render with safe labels (Y → Allowed, N → Not allowed)', async () => {
    const { container } = await renderWithClient(fixtureClient());
    const card = container.querySelector('[data-pcc-doc-permissions-card="true"]')!;
    const r05Pr01 = card.querySelector('[data-pcc-doc-role-action-row="R05-PR01"]');
    expect(r05Pr01).not.toBeNull();
    expect(r05Pr01!.getAttribute('data-pcc-doc-role-action-availability')).toBe('Y');
    expect(r05Pr01!.textContent).toContain('Allowed');

    const r01Ex04 = card.querySelector('[data-pcc-doc-role-action-row="R01-EX04"]');
    expect(r01Ex04).not.toBeNull();
    expect(r01Ex04!.getAttribute('data-pcc-doc-role-action-availability')).toBe('N');
    expect(r01Ex04!.textContent).toContain('Not allowed');
  });

  it('availability code legend renders all 9 codes with safe labels', async () => {
    const { container } = await renderWithClient(fixtureClient());
    const card = container.querySelector('[data-pcc-doc-permissions-card="true"]')!;
    for (const code of ['Y', 'A', 'O', 'R', 'C', 'S', 'D', 'N', 'HARD-NO']) {
      const el = card.querySelector(`[data-pcc-doc-availability-legend-code="${code}"]`);
      expect(el, `legend code ${code} should render`).not.toBeNull();
    }
  });

  it('hard-no rules render: HN-01, HN-02, HN-03 from envelope viewModel', async () => {
    const { container } = await renderWithClient(fixtureClient());
    const card = container.querySelector('[data-pcc-doc-permissions-card="true"]')!;
    for (const id of ['HN-01', 'HN-02', 'HN-03']) {
      const rule = card.querySelector(`[data-pcc-doc-hard-no-id="${id}"]`);
      expect(rule, `hard-no rule ${id} should render`).not.toBeNull();
    }
  });

  it('EX04 renders as forbidden / not allowed in the action catalog (text + marker; not executable)', async () => {
    const { container } = await renderWithClient(fixtureClient());
    const card = container.querySelector('[data-pcc-doc-permissions-card="true"]')!;
    const ex04 = card.querySelector('[data-pcc-doc-action="EX04"]');
    expect(ex04).not.toBeNull();
    expect(ex04!.getAttribute('data-pcc-doc-action-forbidden')).toBe('true');
    expect(ex04!.textContent).toContain('Not allowed');
    // Not executable: not a button, not an anchor with href.
    expect(ex04!.tagName).not.toBe('BUTTON');
    expect(ex04!.querySelector('button')).toBeNull();
    expect(ex04!.querySelector('a[href]')).toBeNull();
  });

  it('Project Coordinator (R14) appears in role legend AND in availability rows', async () => {
    const { container } = await renderWithClient(fixtureClient());
    const card = container.querySelector('[data-pcc-doc-permissions-card="true"]')!;
    const r14Legend = card.querySelector('[data-pcc-doc-role-legend-code="R14"]');
    expect(r14Legend).not.toBeNull();
    expect(r14Legend!.textContent).toContain('Project Coordinator');
    expect(card.querySelector('[data-pcc-doc-role-action-row="R14-PR10"]')).not.toBeNull();
    expect(card.querySelector('[data-pcc-doc-role-action-row="R14-WF01"]')).not.toBeNull();
  });

  it('R04 Project Executive appears in the role legend (no fixture availability row required)', async () => {
    const { container } = await renderWithClient(fixtureClient());
    const card = container.querySelector('[data-pcc-doc-permissions-card="true"]')!;
    const r04 = card.querySelector('[data-pcc-doc-role-legend-code="R04"]');
    expect(r04).not.toBeNull();
    expect(r04!.textContent).toContain('Project Executive');
  });

  it('"Project Engineer" string is absent from the rendered surface', async () => {
    const { container } = await renderWithClient(fixtureClient());
    expect(container.outerHTML).not.toContain('Project Engineer');
  });

  it('all 7 fixture roleActionAvailability rows render — proves no local persona / authorization filtering', async () => {
    const { container } = await renderWithClient(fixtureClient());
    const card = container.querySelector('[data-pcc-doc-permissions-card="true"]')!;
    for (const id of FIXTURE_ROLE_ACTION_ROWS) {
      expect(
        card.querySelector(`[data-pcc-doc-role-action-row="${id}"]`),
        `availability row ${id} should render`,
      ).not.toBeNull();
    }
    const allRows = card.querySelectorAll('[data-pcc-doc-role-action-row]');
    expect(allRows.length).toBe(FIXTURE_ROLE_ACTION_ROWS.length);
  });

  it('permissions card renders no executable buttons or external launch anchors', async () => {
    const { container } = await renderWithClient(fixtureClient());
    const card = container.querySelector('[data-pcc-doc-permissions-card="true"]')!;
    expect(card.querySelectorAll('button').length).toBe(0);
    const anchors = card.querySelectorAll('a[href]');
    for (const a of anchors) {
      const href = a.getAttribute('href') ?? '';
      expect(href).not.toMatch(/^https?:\/\//);
    }
  });

  it('backend-unavailable: card renders without crash; role + availability legends render; hard-no rules render from viewModel', async () => {
    const { container } = await renderWithClient(unavailableClient());
    const card = container.querySelector('[data-pcc-doc-permissions-card="true"]');
    expect(card).not.toBeNull();
    // Static / always-rendered content
    expect(card!.querySelector('[data-pcc-doc-role-legend-code="R04"]')).not.toBeNull();
    expect(card!.querySelector('[data-pcc-doc-role-legend-code="R14"]')).not.toBeNull();
    expect(card!.querySelector('[data-pcc-doc-availability-legend-code="N"]')).not.toBeNull();
    // Hard-no rules ARE published by the fixture under backend-unavailable
    // (see backend mock buildWave7DocumentControlReadModel(false)).
    expect(card!.querySelector('[data-pcc-doc-hard-no-id="HN-01"]')).not.toBeNull();
    expect(card!.querySelector('[data-pcc-doc-hard-no-id="HN-02"]')).not.toBeNull();
    expect(card!.querySelector('[data-pcc-doc-hard-no-id="HN-03"]')).not.toBeNull();
    // Action catalog and availability rows are empty in the unavailable envelope
    expect(card!.querySelector('[data-pcc-doc-action-catalog-empty="true"]')).not.toBeNull();
    expect(
      card!.querySelector('[data-pcc-doc-role-action-availability-empty="true"]'),
    ).not.toBeNull();
  });

  it('no readModelClient (fallback): permissions card renders Wave 7-specific hard-no fallback (HN-01..HN-03 only — no HN-04)', async () => {
    const { container } = await renderWithClient(undefined);
    const card = container.querySelector('[data-pcc-doc-permissions-card="true"]');
    expect(card).not.toBeNull();
    expect(card!.querySelector('[data-pcc-doc-hard-no-id="HN-01"]')).not.toBeNull();
    expect(card!.querySelector('[data-pcc-doc-hard-no-id="HN-02"]')).not.toBeNull();
    expect(card!.querySelector('[data-pcc-doc-hard-no-id="HN-03"]')).not.toBeNull();
    expect(card!.querySelector('[data-pcc-doc-hard-no-id="HN-04"]')).toBeNull();
    // Static role legend + availability legend still render in the fallback path
    expect(card!.querySelector('[data-pcc-doc-role-legend-code="R04"]')).not.toBeNull();
    expect(card!.querySelector('[data-pcc-doc-availability-legend-code="HARD-NO"]')).not.toBeNull();
  });

  it('source-unavailable (unknown project): permissions card renders without crash', async () => {
    const { container } = await renderWithClient(unknownProjectClient());
    const card = container.querySelector('[data-pcc-doc-permissions-card="true"]');
    expect(card).not.toBeNull();
    // Hard-no rules still publish under source-unavailable (per backend mock)
    expect(card!.querySelector('[data-pcc-doc-hard-no-id="HN-01"]')).not.toBeNull();
  });
});

// ─── Wave 7 / Prompt 05 — source-state / degraded-state rendering ───
// User-safe, lane-aware copy for source-health and envelope source-status
// states. Raw enum strings remain available only as `data-*` attributes;
// the lane's visible textContent must never include them. No live source
// repair, retry, folder-creation, or runtime integration is introduced.

const PROJECT_RECORD_LIBRARY_ENTRY: IProjectDocumentSourceRegistryEntry = {
  sourceKey: 'project-record-primary',
  displayName: 'Project Record Library',
  wave7Lane: 'project-record',
  sourceKind: 'sharepoint-library',
  enabled: true,
  binding: {
    kind: 'sharepoint-library',
    siteId: 'site-stadium-enclave',
    webId: 'web-stadium-enclave',
    listId: 'list-project-record',
    driveId: 'drive-project-record',
    rootPath: '/Shared Documents/Project Record',
  },
};

const EXTERNAL_PROCORE_ENTRY: IProjectDocumentSourceRegistryEntry = {
  sourceKey: 'external-procore',
  displayName: 'Procore',
  wave7Lane: 'external-systems',
  sourceKind: 'external-system',
  enabled: true,
  binding: {
    kind: 'external-system',
    systemId: 'procore',
    projectRef: 'PROC-2600000',
  },
};

const EXTERNAL_ADOBE_SIGN_DISABLED_ENTRY: IProjectDocumentSourceRegistryEntry = {
  sourceKey: 'external-adobe-sign',
  displayName: 'Adobe Sign',
  wave7Lane: 'external-systems',
  sourceKind: 'external-system',
  enabled: false,
  binding: {
    kind: 'external-system',
    systemId: 'adobe-sign',
    projectRef: '26-000-00',
  },
};

function envelopeWithHealth(input: {
  readonly sourceStatus: PccReadModelSourceStatus;
  readonly registry: readonly IProjectDocumentSourceRegistryEntry[];
  readonly health: readonly { sourceKey: string; state: string; message: string }[];
}): PccReadModelEnvelope<PccDocumentControlReadModel> {
  return {
    projectId: KNOWN_PROJECT_ID,
    mode: 'fixture',
    sourceStatus: input.sourceStatus,
    readOnly: true,
    warnings: [],
    generatedAtUtc: '2026-04-30T00:00:00.000Z',
    data: {
      sources: [],
      wave7LaneVocabulary: ['project-record', 'my-project-files', 'external-systems'],
      sourceRegistry: input.registry,
      sourceHealth: input.health as PccDocumentControlReadModel['sourceHealth'],
    },
  };
}

// Only kebab-case raw enum tokens are checked for leakage; plain English words
// like "unavailable" / "degraded" appear legitimately in product-safe copy.
const RAW_HEALTH_ENUMS = [
  'missing-binding',
  'access-denied',
  'pending-initialization',
  'folder-creation-failed',
] as const;

const RAW_ENVELOPE_ENUMS: readonly Exclude<PccReadModelSourceStatus, 'available'>[] = [
  'backend-unavailable',
  'source-unavailable',
  'missing-config',
  'stale',
  'unauthorized',
  'forbidden',
];

const RAW_ERROR_LEAK_PATTERNS = [
  /Microsoft\.Graph\./,
  /TypeError/,
  /\bError:\s/,
  /\bat\s+[A-Z][A-Za-z]*\(/,
  /OData/,
];

describe('PccDocumentsSurface — Wave 7 / Prompt 05 source-state rendering', () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('Project Record: access-denied renders user-safe access-required message; raw enum absent from visible text', async () => {
    const client = clientReturning(
      envelopeWithHealth({
        sourceStatus: 'available',
        registry: [PROJECT_RECORD_LIBRARY_ENTRY],
        health: [{ sourceKey: 'project-record-primary', state: 'access-denied', message: 'graph 403' }],
      }),
    );
    const { container } = await renderWithClient(client);
    const lane = container.querySelector('[data-pcc-doc-lane="project-record"]')!;
    const entry = lane.querySelector('[data-pcc-document-source-id="project-record-primary"]')!;
    expect(entry.getAttribute('data-pcc-doc-source-health')).toBe('access-denied');
    const message = entry.querySelector('[data-pcc-doc-source-health-message="access-denied"]');
    expect(message).not.toBeNull();
    expect(message!.textContent).toMatch(/access/i);
    expect(message!.textContent).toMatch(/administrator|request access/i);
    expect(lane.textContent).not.toContain('access-denied');
    expect(lane.textContent).not.toContain('graph 403');
  });

  it('Project Record: throttled renders Microsoft 365 temporarily-limited message; raw enum absent from visible text', async () => {
    const client = clientReturning(
      envelopeWithHealth({
        sourceStatus: 'available',
        registry: [PROJECT_RECORD_LIBRARY_ENTRY],
        health: [{ sourceKey: 'project-record-primary', state: 'throttled', message: 'graph 429' }],
      }),
    );
    const { container } = await renderWithClient(client);
    const lane = container.querySelector('[data-pcc-doc-lane="project-record"]')!;
    const message = lane.querySelector('[data-pcc-doc-source-health-message="throttled"]');
    expect(message).not.toBeNull();
    expect(message!.textContent).toMatch(/temporarily limited|temporarily/i);
    expect(lane.textContent).not.toContain('throttled');
    expect(lane.textContent).not.toContain('graph 429');
  });

  it('Project Record: missing-binding renders not-configured copy; raw enum absent from visible text', async () => {
    const client = clientReturning(
      envelopeWithHealth({
        sourceStatus: 'available',
        registry: [PROJECT_RECORD_LIBRARY_ENTRY],
        health: [{ sourceKey: 'project-record-primary', state: 'missing-binding', message: 'binding null' }],
      }),
    );
    const { container } = await renderWithClient(client);
    const lane = container.querySelector('[data-pcc-doc-lane="project-record"]')!;
    const message = lane.querySelector('[data-pcc-doc-source-health-message="missing-binding"]');
    expect(message).not.toBeNull();
    expect(message!.textContent).toMatch(/not configured|configured for the current project/i);
    expect(lane.textContent).not.toContain('missing-binding');
    expect(lane.textContent).not.toContain('binding null');
  });

  it('My Project Files: pending-initialization renders being-prepared message; raw enum absent from visible text', async () => {
    const client = clientReturning(
      envelopeWithHealth({
        sourceStatus: 'available',
        registry: [legitMpfEntry()],
        health: [
          { sourceKey: 'my-project-files-current-user', state: 'pending-initialization', message: 'graph drive create pending' },
        ],
      }),
    );
    const { container } = await renderWithClient(client);
    const lane = container.querySelector('[data-pcc-doc-lane="my-project-files"]')!;
    const message = lane.querySelector('[data-pcc-doc-source-health-message="pending-initialization"]');
    expect(message).not.toBeNull();
    expect(message!.textContent).toMatch(/being prepared|setting up/i);
    expect(lane.textContent).not.toContain('pending-initialization');
    expect(lane.textContent).not.toContain('graph drive create pending');
  });

  it('My Project Files: folder-creation-failed renders setup-needed message; raw enum absent from visible text', async () => {
    const client = clientReturning(
      envelopeWithHealth({
        sourceStatus: 'available',
        registry: [legitMpfEntry()],
        health: [
          { sourceKey: 'my-project-files-current-user', state: 'folder-creation-failed', message: 'graph 5xx during drive create' },
        ],
      }),
    );
    const { container } = await renderWithClient(client);
    const lane = container.querySelector('[data-pcc-doc-lane="my-project-files"]')!;
    const message = lane.querySelector('[data-pcc-doc-source-health-message="folder-creation-failed"]');
    expect(message).not.toBeNull();
    expect(message!.textContent).toMatch(/could not be created|administrator/i);
    expect(lane.textContent).not.toContain('folder-creation-failed');
    expect(lane.textContent).not.toContain('graph 5xx');
  });

  it('External Systems: disabled entry renders product-safe disabled copy via stable marker', async () => {
    const client = clientReturning(
      envelopeWithHealth({
        sourceStatus: 'available',
        registry: [EXTERNAL_PROCORE_ENTRY, EXTERNAL_ADOBE_SIGN_DISABLED_ENTRY],
        health: [],
      }),
    );
    const { container } = await renderWithClient(client);
    const lane = container.querySelector('[data-pcc-doc-lane="external-systems"]')!;
    const adobe = lane.querySelector('[data-pcc-document-source-id="external-adobe-sign"]')!;
    const disabledMarker = adobe.querySelector('[data-pcc-doc-source-disabled="true"]');
    expect(disabledMarker).not.toBeNull();
    expect(disabledMarker!.textContent).toMatch(/not used|disabled/i);
    // No "· disabled" raw label leaks into the entry text
    expect(adobe.textContent).not.toMatch(/·\s*disabled\s*$/);
  });

  it.each(RAW_ENVELOPE_ENUMS)(
    'envelope sourceStatus="%s": each lane renders a degraded cue and the raw enum is absent from visible text',
    async (status) => {
      const client = clientReturning(
        envelopeWithHealth({ sourceStatus: status, registry: [], health: [] }),
      );
      const { container } = await renderWithClient(client);
      for (const laneId of ['project-record', 'my-project-files', 'external-systems'] as const) {
        const lane = container.querySelector(`[data-pcc-doc-lane="${laneId}"]`)!;
        const cue = lane.querySelector(`[data-pcc-doc-lane-degraded="${laneId}"]`);
        expect(cue, `lane ${laneId} should render a degraded cue for ${status}`).not.toBeNull();
        expect(cue!.textContent && cue!.textContent.length).toBeGreaterThan(0);
        expect(lane.textContent).not.toContain(status);
      }
    },
  );

  it('available envelope renders no lane-degraded cues', async () => {
    const client = clientReturning(envelopeWithRegistry([legitMpfEntry()]));
    const { container } = await renderWithClient(client);
    for (const laneId of ['project-record', 'my-project-files', 'external-systems'] as const) {
      const lane = container.querySelector(`[data-pcc-doc-lane="${laneId}"]`)!;
      expect(lane.querySelector(`[data-pcc-doc-lane-degraded="${laneId}"]`)).toBeNull();
    }
  });

  it('all degraded envelopes preserve inert preview-disabled action chips (no executable handlers)', async () => {
    for (const status of RAW_ENVELOPE_ENUMS) {
      cleanup();
      const client = clientReturning(
        envelopeWithHealth({ sourceStatus: status, registry: [], health: [] }),
      );
      const { container } = await renderWithClient(client);
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
      const anchors = container.querySelectorAll('a[href]');
      for (const a of anchors) {
        const href = a.getAttribute('href') ?? '';
        expect(href).not.toMatch(/^https?:\/\//);
      }
    }
  });

  it('no raw error / stack-trace style substrings leak in any rendered lane', async () => {
    for (const status of RAW_ENVELOPE_ENUMS) {
      cleanup();
      const client = clientReturning(
        envelopeWithHealth({
          sourceStatus: status,
          registry: [PROJECT_RECORD_LIBRARY_ENTRY],
          health: [
            {
              sourceKey: 'project-record-primary',
              state: 'unavailable',
              // Intentionally leak-shaped backend message; UI must not surface it.
              message: 'TypeError: Cannot read property of undefined at Microsoft.Graph.Client(',
            },
          ],
        }),
      );
      const { container } = await renderWithClient(client);
      for (const laneId of ['project-record', 'my-project-files', 'external-systems'] as const) {
        const lane = container.querySelector(`[data-pcc-doc-lane="${laneId}"]`)!;
        const text = lane.textContent ?? '';
        for (const re of RAW_ERROR_LEAK_PATTERNS) {
          expect(text, `lane ${laneId} (${status}) leaked: ${re}`).not.toMatch(re);
        }
        for (const e of RAW_HEALTH_ENUMS) {
          expect(text, `lane ${laneId} (${status}) leaked raw health enum: ${e}`).not.toContain(e);
        }
      }
    }
  });

  it('My Project Files lane renders no entries when envelope is non-available (preserves HN-01/HN-02 fail-closed)', async () => {
    for (const status of RAW_ENVELOPE_ENUMS) {
      cleanup();
      // Even with a "well-formed" MPF entry, a non-available envelope must drop it.
      const client = clientReturning(
        envelopeWithHealth({ sourceStatus: status, registry: [legitMpfEntry()], health: [] }),
      );
      const { container } = await renderWithClient(client);
      const lane = container.querySelector('[data-pcc-doc-lane="my-project-files"]')!;
      expect(lane.querySelectorAll('[data-pcc-document-source-id]').length).toBe(0);
      expect(lane.querySelector('[data-pcc-doc-lane-empty="true"]')).not.toBeNull();
      expect(lane.textContent).not.toContain('99-999-99');
    }
  });
});
