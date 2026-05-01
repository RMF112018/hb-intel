import { describe, it, expect } from 'vitest';
import {
  DOCUMENT_CONTROL_ACTION_CODES,
  DOCUMENT_CONTROL_ACTION_FAMILIES,
  DOCUMENT_CONTROL_ACTION_IDS,
  DOCUMENT_CONTROL_ACTIONS,
  DOCUMENT_CONTROL_LEGACY_TO_WAVE7_LANE,
  DOCUMENT_CONTROL_LANES,
  DOCUMENT_CONTROL_REVIEW_STATES,
  DOCUMENT_CONTROL_REVIEW_TYPES,
  DOCUMENT_CONTROL_ROLE_CODES,
  DOCUMENT_CONTROL_ROLE_VOCABULARY,
  DOCUMENT_CONTROL_SOURCE_IDS,
  DOCUMENT_CONTROL_SOURCE_HEALTH_STATES,
  DOCUMENT_CONTROL_UNIVERSAL_HARD_NO_RULES,
  DOCUMENT_CONTROL_WAVE7_LANES,
  DOCUMENT_CONTROL_WAVE7_TO_LEGACY_LANE,
  DOCUMENT_CONTROL_SOURCES,
  type DocumentControlLane,
  type IDocumentControlSource,
} from './DocumentControl.js';

const REQUIRED_HUB_SOURCES = ['sharepoint-drive', 'onedrive', 'procore-files'] as const;

const ALLOWED_KEYS: ReadonlyArray<keyof IDocumentControlSource> = [
  'id',
  'displayName',
  'posture',
  'linkBehavior',
  'notes',
  'lane',
  'previewActionIds',
  'capabilityPosture',
  'sourceOfRecordLabel',
  'guardrail',
];

const EXPECTED_LANE: Readonly<Record<(typeof DOCUMENT_CONTROL_SOURCE_IDS)[number], DocumentControlLane>> = {
  'sharepoint-drive': 'microsoft-files',
  'onedrive': 'microsoft-files',
  'procore-files': 'external-document-systems',
  'document-crunch': 'external-document-systems',
  'adobe-sign': 'external-document-systems',
};

describe('Document Control source registry', () => {
  it('continues to expose the original mvp-required hub sources', () => {
    for (const id of REQUIRED_HUB_SOURCES) {
      expect(DOCUMENT_CONTROL_SOURCE_IDS).toContain(id);
      expect(DOCUMENT_CONTROL_SOURCES[id]).toBeDefined();
    }
  });

  it('keys remain a strict subset of the allowed read-model shape', () => {
    for (const id of DOCUMENT_CONTROL_SOURCE_IDS) {
      const entry = DOCUMENT_CONTROL_SOURCES[id];
      for (const key of Object.keys(entry)) {
        expect(ALLOWED_KEYS).toContain(key as keyof IDocumentControlSource);
      }
    }
  });

  it('postures are restricted to the allowed literal set', () => {
    const allowed = ['mvp-required', 'mvp-optional', 'conditional'];
    for (const id of DOCUMENT_CONTROL_SOURCE_IDS) {
      expect(allowed).toContain(DOCUMENT_CONTROL_SOURCES[id].posture);
    }
  });

  it('link behaviors are restricted to the allowed literal set', () => {
    const allowed = ['browse-in-place', 'launch-link'];
    for (const id of DOCUMENT_CONTROL_SOURCE_IDS) {
      expect(allowed).toContain(DOCUMENT_CONTROL_SOURCES[id].linkBehavior);
    }
  });
});

describe('Document Control two-lane model (Wave 2 / Prompt 06)', () => {
  it('exposes both lanes', () => {
    expect(DOCUMENT_CONTROL_LANES).toEqual(['microsoft-files', 'external-document-systems']);
  });

  it('every source carries a lane assignment matching the corrected product model', () => {
    for (const id of DOCUMENT_CONTROL_SOURCE_IDS) {
      expect(DOCUMENT_CONTROL_SOURCES[id].lane).toBe(EXPECTED_LANE[id]);
    }
  });

  it('Microsoft Files lane sources carry every action id; External lane sources carry none', () => {
    for (const id of DOCUMENT_CONTROL_SOURCE_IDS) {
      const source = DOCUMENT_CONTROL_SOURCES[id];
      if (source.lane === 'microsoft-files') {
        expect(source.previewActionIds.slice().sort()).toEqual(
          DOCUMENT_CONTROL_ACTION_IDS.slice().sort(),
        );
        expect(source.capabilityPosture).toBe('future-graph-managed');
      } else {
        expect(source.previewActionIds).toEqual([]);
        expect(source.capabilityPosture).toBe('launch-link-visibility-only');
      }
    }
  });

  it('every previewActionIds entry resolves into DOCUMENT_CONTROL_ACTIONS', () => {
    for (const id of DOCUMENT_CONTROL_SOURCE_IDS) {
      for (const actionId of DOCUMENT_CONTROL_SOURCES[id].previewActionIds) {
        expect(DOCUMENT_CONTROL_ACTIONS[actionId]).toBeDefined();
      }
    }
  });

  it('every action ships as preview-disabled in Wave 2 / Prompt 06', () => {
    for (const actionId of DOCUMENT_CONTROL_ACTION_IDS) {
      expect(DOCUMENT_CONTROL_ACTIONS[actionId].executionState).toBe('preview-disabled');
    }
  });

  it('source ordering integrity: DOCUMENT_CONTROL_SOURCE_IDS spans the full registry', () => {
    expect(DOCUMENT_CONTROL_SOURCE_IDS.slice().sort()).toEqual(
      Object.keys(DOCUMENT_CONTROL_SOURCES).slice().sort(),
    );
  });

  it('every source carries a non-empty sourceOfRecordLabel and guardrail', () => {
    for (const id of DOCUMENT_CONTROL_SOURCE_IDS) {
      const source = DOCUMENT_CONTROL_SOURCES[id];
      expect(source.sourceOfRecordLabel.length).toBeGreaterThan(0);
      expect(source.guardrail.length).toBeGreaterThan(0);
    }
  });
});

describe('Document Control Wave 7 additive doctrine contracts', () => {
  it('exposes canonical three-lane wave 7 vocabulary', () => {
    expect(DOCUMENT_CONTROL_WAVE7_LANES).toEqual([
      'project-record',
      'my-project-files',
      'external-systems',
    ]);
  });

  it('preserves backward-compatible mapping between legacy and wave 7 lanes', () => {
    expect(DOCUMENT_CONTROL_LEGACY_TO_WAVE7_LANE['microsoft-files']).toEqual([
      'project-record',
      'my-project-files',
    ]);
    expect(DOCUMENT_CONTROL_LEGACY_TO_WAVE7_LANE['external-document-systems']).toEqual([
      'external-systems',
    ]);

    expect(DOCUMENT_CONTROL_WAVE7_TO_LEGACY_LANE['project-record']).toBe('microsoft-files');
    expect(DOCUMENT_CONTROL_WAVE7_TO_LEGACY_LANE['my-project-files']).toBe('microsoft-files');
    expect(DOCUMENT_CONTROL_WAVE7_TO_LEGACY_LANE['external-systems']).toBe(
      'external-document-systems',
    );
  });

  it('defines role vocabulary exactly R01-R23 and includes Project Coordinator but not Project Engineer', () => {
    expect(DOCUMENT_CONTROL_ROLE_CODES).toHaveLength(23);
    expect(Object.keys(DOCUMENT_CONTROL_ROLE_VOCABULARY).sort()).toEqual(
      DOCUMENT_CONTROL_ROLE_CODES.slice().sort(),
    );

    const labels = DOCUMENT_CONTROL_ROLE_CODES.map((code) => DOCUMENT_CONTROL_ROLE_VOCABULARY[code].label);
    expect(labels).toContain('Project Coordinator');
    expect(labels).not.toContain('Project Engineer');
  });

  it('defines action-family doctrine for PR/MP/SB/EX/WF', () => {
    expect(DOCUMENT_CONTROL_ACTION_FAMILIES).toEqual(['PR', 'MP', 'SB', 'EX', 'WF']);
    const familiesInCodes = new Set(DOCUMENT_CONTROL_ACTION_CODES.map((a) => a.family));
    for (const family of DOCUMENT_CONTROL_ACTION_FAMILIES) {
      expect(familiesInCodes.has(family)).toBe(true);
    }
  });

  it('exports review/source-health doctrine vocabularies', () => {
    expect(DOCUMENT_CONTROL_SOURCE_HEALTH_STATES.length).toBeGreaterThan(0);
    expect(DOCUMENT_CONTROL_REVIEW_STATES.length).toBeGreaterThan(0);
    expect(DOCUMENT_CONTROL_REVIEW_TYPES.length).toBeGreaterThan(0);
  });

  it('universal hard-no rules remain serializable fixture-friendly contract data', () => {
    expect(DOCUMENT_CONTROL_UNIVERSAL_HARD_NO_RULES.length).toBeGreaterThan(0);
    const encoded = JSON.stringify(DOCUMENT_CONTROL_UNIVERSAL_HARD_NO_RULES);
    const decoded = JSON.parse(encoded) as Array<{ id: string; title: string; description: string }>;
    expect(decoded).toEqual(DOCUMENT_CONTROL_UNIVERSAL_HARD_NO_RULES);
    for (const rule of decoded) {
      expect(rule.id.length).toBeGreaterThan(0);
      expect(rule.title.length).toBeGreaterThan(0);
      expect(rule.description.length).toBeGreaterThan(0);
    }
  });
});
