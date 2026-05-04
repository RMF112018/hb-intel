import { describe, expect, it } from 'vitest';
import {
  DOCUMENT_CONTROL_SOURCES,
  DOCUMENT_CONTROL_SOURCE_IDS,
  SAMPLE_EXTERNAL_SYSTEM_MISSING_CONFIGS,
  SAMPLE_PRIORITY_ACTIONS,
  SAMPLE_PROCORE_PROJECT_MAPPING_READ_MODEL,
  SAMPLE_PROCORE_SYNC_HEALTH_READ_MODEL,
  SAMPLE_PROJECT_PROFILE,
  SAMPLE_SITE_HEALTH_SUMMARY,
  type PccDocumentControlReadModel,
  type PccPriorityActionsReadModel,
  type PccProcoreProjectMappingReadModel,
  type PccProcoreSyncHealthReadModel,
  type PccProjectHomeReadModel,
  type PccProjectId,
  type PccReadModelEnvelope,
  type PccReadModelSourceStatus,
} from '@hbc/models/pcc';
import { createPccFixtureReadModelClient } from '../../api/pccFixtureReadModelClient';
import { buildPccProjectHomeViewModel } from './projectHomeAdapter';

const PROJECT_ID = SAMPLE_PROJECT_PROFILE.projectId;
const ORDERED_DOC_SOURCES = DOCUMENT_CONTROL_SOURCE_IDS.map((id) => DOCUMENT_CONTROL_SOURCES[id]);

function homeEnvelope(
  sourceStatus: PccReadModelSourceStatus,
): PccReadModelEnvelope<PccProjectHomeReadModel> {
  return {
    projectId: PROJECT_ID,
    mode: 'mock',
    sourceStatus,
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

function docEnvelope(
  sourceStatus: PccReadModelSourceStatus,
): PccReadModelEnvelope<PccDocumentControlReadModel> {
  return {
    projectId: PROJECT_ID,
    mode: 'mock',
    sourceStatus,
    readOnly: true,
    warnings: [],
    generatedAtUtc: '2026-04-30T00:00:00.000Z',
    data: { sources: ORDERED_DOC_SOURCES },
  };
}

function priorityEnvelope(
  sourceStatus: PccReadModelSourceStatus,
  actions: PccPriorityActionsReadModel['actions'] = SAMPLE_PRIORITY_ACTIONS,
): PccReadModelEnvelope<PccPriorityActionsReadModel> {
  return {
    projectId: PROJECT_ID,
    mode: 'mock',
    sourceStatus,
    readOnly: true,
    warnings: [],
    generatedAtUtc: '2026-04-30T00:00:00.000Z',
    data: { actions },
  };
}

function procoreMappingEnvelope(): PccReadModelEnvelope<PccProcoreProjectMappingReadModel> {
  return {
    projectId: PROJECT_ID,
    mode: 'mock',
    sourceStatus: 'available',
    readOnly: true,
    warnings: [],
    generatedAtUtc: '2026-04-30T00:00:00.000Z',
    data: SAMPLE_PROCORE_PROJECT_MAPPING_READ_MODEL,
  };
}

function procoreSyncEnvelope(): PccReadModelEnvelope<PccProcoreSyncHealthReadModel> {
  // Tests in this file focus on Project Home slot mapping; the
  // standalone Procore-derived priority-action injection is exercised in
  // dedicated adapter and surface tests. Drop derivedSignals here so
  // SAMPLE_PRIORITY_ACTIONS / ALT_ACTIONS-equality assertions stay
  // direct (no `category:'procore-sync'` candidates appended).
  return {
    projectId: PROJECT_ID,
    mode: 'mock',
    sourceStatus: 'available',
    readOnly: true,
    warnings: [],
    generatedAtUtc: '2026-04-30T00:00:00.000Z',
    data: { ...SAMPLE_PROCORE_SYNC_HEALTH_READ_MODEL, derivedSignals: [] },
  };
}

const SLOT_KEYS = [
  'intelligence',
  'priorityActions',
  'siteHealth',
  'documentControl',
  'missingConfigurations',
] as const;
type SlotKey = (typeof SLOT_KEYS)[number];

const STATUS_TO_CARD_STATE: ReadonlyArray<{
  status: PccReadModelSourceStatus;
  cardState:
    | 'preview'
    | 'error'
    | 'unavailable-fixture'
    | 'missing-config'
    | 'unauthorized-persona';
}> = [
  { status: 'available', cardState: 'preview' },
  { status: 'stale', cardState: 'preview' },
  { status: 'backend-unavailable', cardState: 'error' },
  { status: 'source-unavailable', cardState: 'unavailable-fixture' },
  { status: 'missing-config', cardState: 'missing-config' },
  { status: 'unauthorized', cardState: 'unauthorized-persona' },
  { status: 'forbidden', cardState: 'unauthorized-persona' },
];

describe('buildPccProjectHomeViewModel — uniform source status across both envelopes', () => {
  for (const { status, cardState } of STATUS_TO_CARD_STATE) {
    it(`maps status='${status}' to card state '${cardState}' for every slot`, () => {
      const viewModel = buildPccProjectHomeViewModel({
        projectId: PROJECT_ID,
        home: homeEnvelope(status),
        documentControl: docEnvelope(status),
        procoreProjectMapping: procoreMappingEnvelope(),
        procoreSyncHealth: procoreSyncEnvelope(),
      });
      for (const key of SLOT_KEYS) {
        const slot = viewModel[key as SlotKey];
        expect(slot.state, `${key} state`).toBe(cardState);
        expect(slot.sourceStatus, `${key} sourceStatus`).toBe(status);
      }
    });
  }
});

describe('buildPccProjectHomeViewModel — mixed envelope statuses', () => {
  it('home=available + documentControl=backend-unavailable: only documentControl slot is error', () => {
    const viewModel = buildPccProjectHomeViewModel({
      projectId: PROJECT_ID,
      home: homeEnvelope('available'),
      documentControl: docEnvelope('backend-unavailable'),
      procoreProjectMapping: procoreMappingEnvelope(),
      procoreSyncHealth: procoreSyncEnvelope(),
    });
    expect(viewModel.intelligence.state).toBe('preview');
    expect(viewModel.priorityActions.state).toBe('preview');
    expect(viewModel.siteHealth.state).toBe('preview');
    expect(viewModel.missingConfigurations.state).toBe('preview');
    expect(viewModel.documentControl.state).toBe('error');
    expect(viewModel.documentControl.sourceStatus).toBe('backend-unavailable');
  });

  it('home=unauthorized + documentControl=available: home-derived slots unauthorized-persona, doc slot preview', () => {
    const viewModel = buildPccProjectHomeViewModel({
      projectId: PROJECT_ID,
      home: homeEnvelope('unauthorized'),
      documentControl: docEnvelope('available'),
      procoreProjectMapping: procoreMappingEnvelope(),
      procoreSyncHealth: procoreSyncEnvelope(),
    });
    expect(viewModel.intelligence.state).toBe('unauthorized-persona');
    expect(viewModel.priorityActions.state).toBe('unauthorized-persona');
    expect(viewModel.siteHealth.state).toBe('unauthorized-persona');
    expect(viewModel.missingConfigurations.state).toBe('unauthorized-persona');
    expect(viewModel.documentControl.state).toBe('preview');
  });
});

describe('buildPccProjectHomeViewModel — fixture equivalence', () => {
  it('passes fixture client envelopes through unchanged for available status', async () => {
    const client = createPccFixtureReadModelClient();
    const home = await client.getProjectHome(PROJECT_ID as PccProjectId);
    const docs = await client.getDocumentControl(PROJECT_ID as PccProjectId);
    const procoreProjectMapping = await client.getProcoreProjectMapping(PROJECT_ID as PccProjectId);
    const procoreSyncHealth = await client.getProcoreSyncHealth(PROJECT_ID as PccProjectId);
    const viewModel = buildPccProjectHomeViewModel({
      projectId: PROJECT_ID,
      home,
      documentControl: docs,
      procoreProjectMapping,
      procoreSyncHealth,
    });

    expect(viewModel.intelligence.data?.projectId).toBe(PROJECT_ID);
    expect(viewModel.intelligence.data?.projectName).toBe(SAMPLE_PROJECT_PROFILE.projectName);
    // Wave 13E — fixture path appends Procore-derived priority-action
    // candidates via the existing rail seam (`category:'procore-sync'`).
    // The home/priorityActions envelope contents land first; appended
    // candidates follow. Assert prefix-equality so the standalone-envelope
    // contract stays explicit without depending on the procore signal
    // count.
    expect(viewModel.priorityActions.data.slice(0, SAMPLE_PRIORITY_ACTIONS.length)).toEqual(
      SAMPLE_PRIORITY_ACTIONS,
    );
    for (const appended of viewModel.priorityActions.data.slice(SAMPLE_PRIORITY_ACTIONS.length)) {
      expect(appended.category).toBe('procore-sync');
    }
    expect(viewModel.siteHealth.data).toEqual(SAMPLE_SITE_HEALTH_SUMMARY);
    expect(viewModel.missingConfigurations.data).toEqual(SAMPLE_EXTERNAL_SYSTEM_MISSING_CONFIGS);
    expect(viewModel.documentControl.data).toEqual(ORDERED_DOC_SOURCES);

    for (const key of SLOT_KEYS) {
      expect(viewModel[key as SlotKey].state).toBe('preview');
      expect(viewModel[key as SlotKey].sourceStatus).toBe('available');
    }
  });

  it('passes fixture client envelopes through with backend-unavailable when simulateBackendUnavailable is set', async () => {
    const client = createPccFixtureReadModelClient({ simulateBackendUnavailable: true });
    const home = await client.getProjectHome(PROJECT_ID as PccProjectId);
    const docs = await client.getDocumentControl(PROJECT_ID as PccProjectId);
    const procoreProjectMapping = await client.getProcoreProjectMapping(PROJECT_ID as PccProjectId);
    const procoreSyncHealth = await client.getProcoreSyncHealth(PROJECT_ID as PccProjectId);
    const viewModel = buildPccProjectHomeViewModel({
      projectId: PROJECT_ID,
      home,
      documentControl: docs,
      procoreProjectMapping,
      procoreSyncHealth,
    });

    for (const key of SLOT_KEYS) {
      const slot = viewModel[key as SlotKey];
      expect(slot.state, `${key} state`).toBe('error');
      expect(slot.sourceStatus, `${key} sourceStatus`).toBe('backend-unavailable');
    }
  });
});

describe('buildPccProjectHomeViewModel — standalone priority-actions envelope', () => {
  const ALT_ACTIONS: PccPriorityActionsReadModel['actions'] = [SAMPLE_PRIORITY_ACTIONS[0]!];

  it('uses standalone envelope data + sourceStatus for the priorityActions slot when supplied', () => {
    const viewModel = buildPccProjectHomeViewModel({
      projectId: PROJECT_ID,
      home: homeEnvelope('available'),
      priorityActions: priorityEnvelope('available', ALT_ACTIONS),
      documentControl: docEnvelope('available'),
      procoreProjectMapping: procoreMappingEnvelope(),
      procoreSyncHealth: procoreSyncEnvelope(),
    });
    expect(viewModel.priorityActions.data).toEqual(ALT_ACTIONS);
    expect(viewModel.priorityActions.sourceStatus).toBe('available');
    expect(viewModel.priorityActions.state).toBe('preview');
  });

  it('backend-unavailable standalone priority-actions envelope places only the priorityActions slot in error', () => {
    const viewModel = buildPccProjectHomeViewModel({
      projectId: PROJECT_ID,
      home: homeEnvelope('available'),
      priorityActions: priorityEnvelope('backend-unavailable', []),
      documentControl: docEnvelope('available'),
      procoreProjectMapping: procoreMappingEnvelope(),
      procoreSyncHealth: procoreSyncEnvelope(),
    });
    expect(viewModel.priorityActions.state).toBe('error');
    expect(viewModel.priorityActions.sourceStatus).toBe('backend-unavailable');
    expect(viewModel.priorityActions.data).toEqual([]);
    expect(viewModel.intelligence.state).toBe('preview');
    expect(viewModel.siteHealth.state).toBe('preview');
    expect(viewModel.documentControl.state).toBe('preview');
    expect(viewModel.missingConfigurations.state).toBe('preview');
  });

  it('absent standalone envelope preserves home-derived priorityActions fallback', () => {
    const viewModel = buildPccProjectHomeViewModel({
      projectId: PROJECT_ID,
      home: homeEnvelope('available'),
      documentControl: docEnvelope('available'),
      procoreProjectMapping: procoreMappingEnvelope(),
      procoreSyncHealth: procoreSyncEnvelope(),
    });
    expect(viewModel.priorityActions.data).toEqual(SAMPLE_PRIORITY_ACTIONS);
    expect(viewModel.priorityActions.sourceStatus).toBe('available');
    expect(viewModel.priorityActions.state).toBe('preview');
  });

  it('absent standalone envelope with home=backend-unavailable still maps the priorityActions slot to error via home', () => {
    const viewModel = buildPccProjectHomeViewModel({
      projectId: PROJECT_ID,
      home: homeEnvelope('backend-unavailable'),
      documentControl: docEnvelope('available'),
      procoreProjectMapping: procoreMappingEnvelope(),
      procoreSyncHealth: procoreSyncEnvelope(),
    });
    expect(viewModel.priorityActions.state).toBe('error');
    expect(viewModel.priorityActions.sourceStatus).toBe('backend-unavailable');
  });
});

describe('buildPccProjectHomeViewModel — defaults for missing data', () => {
  it('fills array slots with [] when home data is sparse', () => {
    const sparseHome: PccReadModelEnvelope<PccProjectHomeReadModel> = {
      projectId: PROJECT_ID,
      mode: 'mock',
      sourceStatus: 'available',
      readOnly: true,
      warnings: [],
      data: {
        profile: SAMPLE_PROJECT_PROFILE,
        priorityActions: [],
        missingConfigurations: [],
      },
    };
    const sparseDocs: PccReadModelEnvelope<PccDocumentControlReadModel> = {
      projectId: PROJECT_ID,
      mode: 'mock',
      sourceStatus: 'available',
      readOnly: true,
      warnings: [],
      data: { sources: [] },
    };
    const viewModel = buildPccProjectHomeViewModel({
      projectId: PROJECT_ID,
      home: sparseHome,
      documentControl: sparseDocs,
      procoreProjectMapping: procoreMappingEnvelope(),
      procoreSyncHealth: procoreSyncEnvelope(),
    });
    expect(viewModel.priorityActions.data).toEqual([]);
    expect(viewModel.missingConfigurations.data).toEqual([]);
    expect(viewModel.documentControl.data).toEqual([]);
    expect(viewModel.siteHealth.data).toBeUndefined();
  });
});
