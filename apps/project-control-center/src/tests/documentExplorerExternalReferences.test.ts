import { describe, expect, it } from 'vitest';
import type {
  IPccDocumentControlViewModel,
  DocumentControlWave7LaneId,
} from '../surfaces/documents/documentControlViewModel';
import type {
  IProjectDocumentSourceRegistryEntry,
  PccReadModelSourceStatus,
} from '@hbc/models/pcc';
import {
  EXTERNAL_REFERENCE_LAUNCH_COPY_BY_POSTURE,
  buildExternalReferencesFromViewModel,
} from '../surfaces/documents/documentExplorerExternalReferences';

const FORBIDDEN_DEVELOPER_COPY: readonly string[] = [
  'todo',
  'tbd',
  'mock',
  'fixture',
  'placeholder',
  'not implemented',
  'developer',
  'prompt',
  'repo',
];

type ExternalBindingSystemId =
  | 'document-crunch'
  | 'adobe-sign'
  | 'procore'
  | 'future-approved-system';

function externalEntry(
  sourceKey: string,
  displayName: string,
  systemId: ExternalBindingSystemId,
  enabled = true,
): IProjectDocumentSourceRegistryEntry {
  return {
    sourceKey,
    displayName,
    wave7Lane: 'external-systems',
    sourceKind: 'external-system',
    enabled,
    binding: { kind: 'external-system', systemId, projectRef: 'PROJ-0001' },
  };
}

function viewModelWith(
  entries: readonly IProjectDocumentSourceRegistryEntry[],
  sourceStatus: PccReadModelSourceStatus = 'available',
): IPccDocumentControlViewModel {
  const lane = (
    laneId: DocumentControlWave7LaneId,
    laneEntries: readonly IProjectDocumentSourceRegistryEntry[],
  ) => ({
    laneId,
    title: laneId,
    description: '',
    entries: laneEntries,
    health: [],
  });
  return {
    header: {
      title: 'HB Document Control Center' as const,
      legacyLabel: 'Document Control Center' as const,
      sourceStatus,
      readOnly: true,
    },
    lanes: {
      'project-record': lane('project-record', []),
      'my-project-files': lane('my-project-files', []),
      'external-systems': lane('external-systems', entries),
    },
    legacySources: [],
    hardNoRules: [],
    reviewQueueSample: [],
    reviewTypes: [],
    reviewStates: [],
    warnings: [],
    actionCatalog: [],
    roleActionAvailability: [],
    roleVocabulary: {} as IPccDocumentControlViewModel['roleVocabulary'],
    roleCodes: [],
  };
}

describe('buildExternalReferencesFromViewModel — adapter behavior', () => {
  it('returns [] when no view-model is supplied', () => {
    expect(buildExternalReferencesFromViewModel(undefined)).toEqual([]);
  });

  it('returns Document Crunch + Adobe Sign in locked render order when both are enabled', () => {
    const vm = viewModelWith([
      externalEntry('external-adobe-sign', 'Adobe Sign', 'adobe-sign'),
      externalEntry('external-document-crunch', 'Document Crunch', 'document-crunch'),
    ]);
    const refs = buildExternalReferencesFromViewModel(vm);
    expect(refs.map((r) => r.systemId)).toEqual(['document-crunch', 'adobe-sign']);
    expect(refs.every((r) => r.launchPosture === 'configured-not-launchable')).toBe(true);
    expect(refs[0].displayName).toBe('Document Crunch');
    expect(refs[1].displayName).toBe('Adobe Sign');
  });

  it('maps Adobe Sign with enabled=false to inactive-for-project posture', () => {
    const vm = viewModelWith([
      externalEntry('external-document-crunch', 'Document Crunch', 'document-crunch', true),
      externalEntry('external-adobe-sign', 'Adobe Sign', 'adobe-sign', false),
    ]);
    const refs = buildExternalReferencesFromViewModel(vm);
    expect(refs).toHaveLength(2);
    const adobe = refs.find((r) => r.systemId === 'adobe-sign');
    expect(adobe?.enabled).toBe(false);
    expect(adobe?.launchPosture).toBe('inactive-for-project');
    const dc = refs.find((r) => r.systemId === 'document-crunch');
    expect(dc?.launchPosture).toBe('configured-not-launchable');
  });

  it('returns [] when the external-systems lane carries no recognized entries', () => {
    const vm = viewModelWith([
      externalEntry('external-future-approved', 'Future Approved System', 'future-approved-system'),
    ]);
    expect(buildExternalReferencesFromViewModel(vm)).toEqual([]);
  });

  it('skips a system that is missing from the lane', () => {
    const vm = viewModelWith([
      externalEntry('external-document-crunch', 'Document Crunch', 'document-crunch'),
    ]);
    const refs = buildExternalReferencesFromViewModel(vm);
    expect(refs.map((r) => r.systemId)).toEqual(['document-crunch']);
  });
});

describe('EXTERNAL_REFERENCE_LAUNCH_COPY_BY_POSTURE — launch copy table', () => {
  it('renders the configured-not-launchable copy with system name interpolation', () => {
    const copy =
      EXTERNAL_REFERENCE_LAUNCH_COPY_BY_POSTURE['configured-not-launchable']('Adobe Sign');
    expect(copy.label).toBe('Open Adobe Sign');
    expect(copy.reason).toMatch(/Adobe Sign is registered for this project/);
    expect(copy.reason).toMatch(/Direct launch from this Document Control view is not available/);
    expect(copy.nextStep).toMatch(/configured external source/);
  });

  it('renders the inactive-for-project copy with system name interpolation and no next-step', () => {
    const copy =
      EXTERNAL_REFERENCE_LAUNCH_COPY_BY_POSTURE['inactive-for-project']('Document Crunch');
    expect(copy.label).toBe('Not active');
    expect(copy.reason).toMatch(/Document Crunch is not active for the current project context/);
    expect(copy.nextStep).toBeUndefined();
  });

  it('uses no forbidden developer copy in either posture', () => {
    const samples = [
      EXTERNAL_REFERENCE_LAUNCH_COPY_BY_POSTURE['configured-not-launchable']('Adobe Sign'),
      EXTERNAL_REFERENCE_LAUNCH_COPY_BY_POSTURE['inactive-for-project']('Document Crunch'),
    ];
    for (const copy of samples) {
      const blob = `${copy.label} ${copy.reason} ${copy.nextStep ?? ''}`.toLowerCase();
      for (const term of FORBIDDEN_DEVELOPER_COPY) {
        expect(blob.includes(term), `launch copy leaked '${term}'`).toBe(false);
      }
    }
  });
});
