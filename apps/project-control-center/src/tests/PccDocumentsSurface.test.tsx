/**
 * Phase 08 wave-b13 Prompt 10C — Documents surface ready-path
 * composition tests, retargeted for the Document Control Explorer
 * shell. The legacy lane / permissions / reviews ready-path composition
 * has moved off the ready path; legacy components remain on disk for
 * Prompt 10F reconciliation but no longer mount on the available
 * preview path. Hook-level posture (`useDocumentControlReadModel`) is
 * preserved unchanged; MPF deterministic allow-path enforcement is
 * preserved at the adapter level (`buildPccDocumentControlViewModel`).
 */

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
  buildPccDocumentControlViewModel,
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
    getDocumentControl: (_id, _persona) => {
      const base = createPccFixtureReadModelClient();
      return base.getDocumentControl(UNKNOWN_PROJECT_ID, undefined);
    },
  };
}

/**
 * Branch-aware ready predicate. Any rendered Documents path (available
 * preview / state-cued preview / loading / error / no-client fallback)
 * settles when either the Explorer shell or the state-card marker
 * appears.
 */
async function renderAndSettle(ui: React.ReactElement): Promise<ReturnType<typeof render>> {
  const utils = render(ui);
  await waitFor(() => {
    const explorer = utils.container.querySelector('[data-pcc-doc-explorer="true"]');
    const state = utils.container.querySelector('[data-pcc-doc-state]');
    expect(
      explorer !== null || state !== null,
      'Documents surface must render either the Explorer shell or a state card',
    ).toBe(true);
  });
  return utils;
}

async function renderWithClient(client?: IPccDocumentsReadModelClient) {
  return renderAndSettle(
    <PccBentoGrid forceMode="desktop">
      <PccDocumentsSurface readModelClient={client} />
    </PccBentoGrid>,
  );
}

// ───────────────────────────────────────────────────────────────────────
// Prompt 10C — Documents ready-path Explorer composition

describe('PccDocumentsSurface — Prompt 10C Explorer ready-path composition', () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('does NOT render the HB Document Control Center duplicate title anywhere in the bento (Prompt 4B-09 retirement preserved)', async () => {
    const { container } = await renderWithClient(fixtureClient());
    const grid = container.querySelector('[data-pcc-bento-grid]');
    expect(grid).not.toBeNull();
    expect(grid!.textContent ?? '').not.toContain(HB_DOCUMENT_CONTROL_CENTER_TITLE);
  });

  it('available preview ready path renders exactly one Explorer card', async () => {
    const { container } = await renderWithClient(fixtureClient());
    const explorers = container.querySelectorAll('[data-pcc-doc-explorer="true"]');
    expect(explorers).toHaveLength(1);
    const cards = container.querySelectorAll('[data-pcc-card]');
    expect(cards).toHaveLength(1);
  });

  it('available preview ready path renders zero legacy lane / permissions / reviews markers', async () => {
    const { container } = await renderWithClient(fixtureClient());
    expect(container.querySelectorAll('[data-pcc-doc-lane]')).toHaveLength(0);
    expect(container.querySelectorAll('[data-pcc-doc-permissions-card]')).toHaveLength(0);
    expect(container.querySelectorAll('[data-pcc-doc-reviews-card]')).toHaveLength(0);
  });

  it('Explorer card is a direct child of the bento grid', async () => {
    const { container } = await renderWithClient(fixtureClient());
    const grid = container.querySelector('[data-pcc-bento-grid]');
    expect(grid).not.toBeNull();
    const explorer = container.querySelector('[data-pcc-doc-explorer="true"]');
    expect(explorer).not.toBeNull();
    const card = explorer!.closest('[data-pcc-card]');
    expect(card).not.toBeNull();
    expect(card!.parentElement === grid).toBe(true);
  });

  it('renders no http(s) external anchors on the ready path', async () => {
    const { container } = await renderWithClient(fixtureClient());
    const anchors = container.querySelectorAll('a[href]');
    for (const a of anchors) {
      const href = a.getAttribute('href') ?? '';
      expect(href).not.toMatch(/^https?:\/\//);
    }
  });

  it('zero card-level [data-pcc-active-surface-panel="documents"] markers on the ready path', async () => {
    const { container } = await renderWithClient(fixtureClient());
    const panels = container.querySelectorAll('[data-pcc-active-surface-panel]');
    expect(panels).toHaveLength(0);
  });

  it('does not call fetch (read-only / fixture-only)', async () => {
    await renderWithClient(fixtureClient());
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

// ───────────────────────────────────────────────────────────────────────
// Prompt 10C — branch-specific composition

describe('PccDocumentsSurface — Prompt 10C branch composition', () => {
  afterEach(() => {
    cleanup();
  });

  it('loading branch renders a single state card with aria-busy="true" and zero active-panel markers', () => {
    const pending: IPccDocumentsReadModelClient = {
      getDocumentControl: () => new Promise(() => {}),
    };
    const { container } = render(
      <PccBentoGrid forceMode="desktop">
        <PccDocumentsSurface readModelClient={pending} />
      </PccBentoGrid>,
    );
    const busy = container.querySelector('[aria-busy="true"]');
    expect(busy, 'loading branch must expose aria-busy="true"').not.toBeNull();
    expect(container.querySelectorAll('[data-pcc-doc-explorer="true"]')).toHaveLength(0);
    expect(container.querySelectorAll('[data-pcc-active-surface-panel]')).toHaveLength(0);
  });

  it('error branch renders a single state card with role="alert" and zero active-panel markers', async () => {
    const rejecting: IPccDocumentsReadModelClient = {
      getDocumentControl: () => Promise.reject(new Error('test: forced rejection')),
    };
    const { container } = render(
      <PccBentoGrid forceMode="desktop">
        <PccDocumentsSurface readModelClient={rejecting} />
      </PccBentoGrid>,
    );
    await waitFor(() => {
      expect(container.querySelector('[role="alert"]')).not.toBeNull();
    });
    expect(container.querySelectorAll('[data-pcc-doc-explorer="true"]')).toHaveLength(0);
    expect(container.querySelectorAll('[data-pcc-active-surface-panel]')).toHaveLength(0);
  });

  it('no-client fallback renders the source-unavailable state card + one Explorer card', async () => {
    const { container } = await renderWithClient(undefined);
    const stateCard = container.querySelector(
      '[data-pcc-doc-state][data-pcc-doc-state-kind="sources-unavailable"]',
    );
    expect(
      stateCard,
      'no-client fallback must render the sources-unavailable state card',
    ).not.toBeNull();
    expect(stateCard!.textContent ?? '').toContain(
      'No document control sources are available for this project.',
    );
    expect(container.querySelectorAll('[data-pcc-doc-explorer="true"]')).toHaveLength(1);
    const grid = container.querySelector('[data-pcc-bento-grid]');
    expect(grid!.textContent ?? '').not.toContain(HB_DOCUMENT_CONTROL_CENTER_TITLE);
  });

  it('backend-unavailable preview renders temporarily-unavailable state card + one Explorer card', async () => {
    const { container } = await renderWithClient(unavailableClient());
    const stateCard = container.querySelector(
      '[data-pcc-doc-state][data-pcc-doc-state-kind="temporarily-unavailable"]',
    );
    expect(stateCard).not.toBeNull();
    expect(stateCard!.textContent ?? '').toContain(
      'Document control is temporarily unavailable. Try again later.',
    );
    expect(container.querySelectorAll('[data-pcc-doc-explorer="true"]')).toHaveLength(1);
  });

  it('source-unavailable preview (unknown project) renders Explorer alongside the state cue', async () => {
    const { container } = await renderWithClient(unknownProjectClient());
    expect(container.querySelectorAll('[data-pcc-doc-explorer="true"]')).toHaveLength(1);
  });

  it('available preview = 1 card; state-cued preview = 2 cards; both remain direct bento children', async () => {
    {
      const { container } = await renderWithClient(fixtureClient());
      const grid = container.querySelector('[data-pcc-bento-grid]')!;
      const cards = container.querySelectorAll('[data-pcc-card]');
      expect(cards).toHaveLength(1);
      for (const card of cards) {
        expect(card.parentElement === grid).toBe(true);
      }
    }
    cleanup();
    {
      const { container } = await renderWithClient(unavailableClient());
      const grid = container.querySelector('[data-pcc-bento-grid]')!;
      const cards = container.querySelectorAll('[data-pcc-card]');
      expect(cards).toHaveLength(2);
      for (const card of cards) {
        expect(card.parentElement === grid).toBe(true);
      }
    }
  });
});

// ───────────────────────────────────────────────────────────────────────
// MPF deterministic allow-path enforcement (adapter-level, migrated from
// DOM-mount tests; the lane card no longer renders on the ready path so
// the safety contract is exercised against `buildPccDocumentControlViewModel`
// directly. Same fixture paths and same drop semantics as before.)

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

function tamperedSentinelRootEntry(): IProjectDocumentSourceRegistryEntry {
  return {
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
  };
}

function tamperedCrossProjectEntry(): IProjectDocumentSourceRegistryEntry {
  return {
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
  };
}

function envelopeWithRegistry(
  registry: readonly IProjectDocumentSourceRegistryEntry[],
  sourceStatus: PccReadModelSourceStatus = 'available',
): PccReadModelEnvelope<PccDocumentControlReadModel> {
  return {
    projectId: KNOWN_PROJECT_ID,
    mode: 'fixture',
    sourceStatus,
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

describe('MPF deterministic allow-path enforcement (adapter-level)', () => {
  it('drops sentinel root path tamper', () => {
    const vm = buildPccDocumentControlViewModel(
      envelopeWithRegistry([tamperedSentinelRootEntry()]),
    );
    expect(vm.lanes['my-project-files'].entries).toHaveLength(0);
  });

  it('drops same-projectId wrong-folder tamper when only the tamper is present', () => {
    const vm = buildPccDocumentControlViewModel(
      envelopeWithRegistry([tamperedSameProjectIdEntry()]),
    );
    expect(vm.lanes['my-project-files'].entries).toHaveLength(0);
  });

  it('retains the legitimate entry when both legit and same-projectId tamper are present', () => {
    const vm = buildPccDocumentControlViewModel(
      envelopeWithRegistry([legitMpfEntry(), tamperedSameProjectIdEntry()]),
    );
    expect(vm.lanes['my-project-files'].entries).toHaveLength(1);
    expect(vm.lanes['my-project-files'].entries[0]!.sourceKey).toBe(
      'my-project-files-current-user',
    );
  });

  it('drops cross-project leak when projectId does not match envelope projectId', () => {
    const vm = buildPccDocumentControlViewModel(
      envelopeWithRegistry([tamperedCrossProjectEntry()]),
    );
    expect(vm.lanes['my-project-files'].entries).toHaveLength(0);
  });

  it('non-available envelope drops all MPF entries (fail-closed)', () => {
    for (const status of [
      'backend-unavailable',
      'source-unavailable',
      'missing-config',
      'stale',
      'unauthorized',
      'forbidden',
    ] as const) {
      const vm = buildPccDocumentControlViewModel(envelopeWithRegistry([legitMpfEntry()], status));
      expect(
        vm.lanes['my-project-files'].entries,
        `MPF must fail closed for sourceStatus=${status}`,
      ).toHaveLength(0);
    }
  });
});

// ───────────────────────────────────────────────────────────────────────
// useDocumentControlReadModel — degraded-state posture (preserved)

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

function clientReturning(
  envelope: PccReadModelEnvelope<PccDocumentControlReadModel>,
): IPccDocumentsReadModelClient {
  return {
    async getDocumentControl() {
      return envelope;
    },
  };
}

describe('useDocumentControlReadModel — degraded-state posture', () => {
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
