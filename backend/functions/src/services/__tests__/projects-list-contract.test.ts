/**
 * P6-04: Schema readiness and contract invariant tests.
 *
 * These tests prove:
 * - REQUIRED_PRODUCTION_FIELDS contains the expected minimum set
 * - OPTIONAL_EXTENSION_FIELDS covers P2-07 and P9-G5-05 fields
 * - validateSchemaReadiness() correctly categorizes present/missing/warnings
 * - The select-fields list stays in sync with the field map
 */
import { describe, it, expect } from 'vitest';
import {
  PROJECTS_LIST_FIELD_MAP,
  PROJECTS_LIST_SELECT_FIELDS,
  REQUIRED_PRODUCTION_FIELDS,
  OPTIONAL_EXTENSION_FIELDS,
  validateSchemaReadiness,
} from '../projects-list-contract.js';

// ─────────────────────────────────────────────────────────────────────────────
// REQUIRED_PRODUCTION_FIELDS
// ─────────────────────────────────────────────────────────────────────────────

describe('REQUIRED_PRODUCTION_FIELDS', () => {
  it('contains exactly 8 required fields', () => {
    expect(REQUIRED_PRODUCTION_FIELDS).toHaveLength(8);
  });

  it('includes system key (field_1)', () => {
    expect(REQUIRED_PRODUCTION_FIELDS).toContain('field_1');
  });

  it('includes lifecycle state (field_9)', () => {
    expect(REQUIRED_PRODUCTION_FIELDS).toContain('field_9');
  });

  it('includes project name (field_3)', () => {
    expect(REQUIRED_PRODUCTION_FIELDS).toContain('field_3');
  });

  it('includes group members (field_10) for provisioning', () => {
    expect(REQUIRED_PRODUCTION_FIELDS).toContain('field_10');
  });

  it('every required field exists in PROJECTS_LIST_SELECT_FIELDS', () => {
    for (const field of REQUIRED_PRODUCTION_FIELDS) {
      expect(PROJECTS_LIST_SELECT_FIELDS).toContain(field);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// OPTIONAL_EXTENSION_FIELDS
// ─────────────────────────────────────────────────────────────────────────────

describe('OPTIONAL_EXTENSION_FIELDS', () => {
  it('contains 32 extension fields (16 existing + 14 My Projects role arrays + 2 P9-G5-05)', () => {
    expect(OPTIONAL_EXTENSION_FIELDS).toHaveLength(32);
  });

  it('includes P2-07 structured location fields', () => {
    expect(OPTIONAL_EXTENSION_FIELDS).toContain('projectStreetAddress');
    expect(OPTIONAL_EXTENSION_FIELDS).toContain('projectCity');
    expect(OPTIONAL_EXTENSION_FIELDS).toContain('projectZip');
  });

  it('includes P9-G5-05 OID fields', () => {
    expect(OPTIONAL_EXTENSION_FIELDS).toContain('submittedByOid');
    expect(OPTIONAL_EXTENSION_FIELDS).toContain('completedByOid');
  });

  it('includes all My Projects canonical role-array fields', () => {
    const canonicalRoleFields = [
      'leadEstimatorUpns',
      'estimatorUpns',
      'idsManagerUpns',
      'projectAccountantUpns',
      'projectAdministratorUpns',
      'projectCoordinatorUpns',
      'superintendentUpns',
      'leadSuperintendentUpns',
      'projectManagerUpns',
      'leadProjectManagerUpns',
      'projectExecutiveUpns',
      'safetyCoordinatorUpns',
      'qcManagerUpns',
      'warrantyManagerUpns',
    ] as const;

    for (const field of canonicalRoleFields) {
      expect(OPTIONAL_EXTENSION_FIELDS).toContain(field);
      expect(PROJECTS_LIST_FIELD_MAP[field].spType).toBe('MultiLineText');
      expect(PROJECTS_LIST_FIELD_MAP[field].serialization).toBe('json-array');
    }
  });

  it('every optional field exists in PROJECTS_LIST_SELECT_FIELDS', () => {
    for (const field of OPTIONAL_EXTENSION_FIELDS) {
      expect(PROJECTS_LIST_SELECT_FIELDS).toContain(field);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// validateSchemaReadiness()
// ─────────────────────────────────────────────────────────────────────────────

function makeCompleteItem(): Record<string, unknown> {
  return {
    Title: '25-001-01 — Test',
    field_1: 'uuid-1',
    field_2: '25-001-01',
    field_3: 'Test Project',
    field_4: 'Location',
    field_5: 'Residential',
    field_6: 'Pursuit',
    field_7: 'user@hb.com',
    field_8: '2026-04-01T00:00:00.000Z',
    field_9: 'Submitted',
    field_10: '["member@hb.com"]',
    field_11: '[]',
    field_12: 'commercial',
    field_13: 1000000,
    field_14: 'Client',
    field_15: '2026-06-01',
    field_16: 'GMP',
    viewerUPNs: '[]',
    addOns: '[]',
    field_20: '',
    field_21: '',
    field_22: '',
    field_23: '',
    field_24: 0,
    Year: 2025,
    // P2-07
    projectStreetAddress: '123 Main',
    projectCity: 'Wellington',
    projectCounty: 'Palm Beach',
    projectState: 'FL',
    projectZip: 33401,
    officeDivision: 'South Florida',
    procoreProject: 'No',
    projectExecutiveUpn: 'exec@hb.com',
    projectManagerUpn: 'pm@hb.com',
    leadEstimatorUpn: 'est@hb.com',
    supportingEstimatorUpns: '[]',
    leadEstimatorUpns: '[]',
    estimatorUpns: '[]',
    idsManagerUpns: '[]',
    projectAccountantUpns: '[]',
    projectAdministratorUpns: '[]',
    projectCoordinatorUpns: '[]',
    superintendentUpns: '[]',
    leadSuperintendentUpns: '[]',
    projectManagerUpns: '[]',
    leadProjectManagerUpns: '[]',
    projectExecutiveUpns: '[]',
    safetyCoordinatorUpns: '[]',
    qcManagerUpns: '[]',
    warrantyManagerUpns: '[]',
    timberscanApproverUpn: 'ts@hb.com',
    sageAccessUpns: '[]',
    clarificationRequestedAt: '',
    requesterRetryUsed: 'false',
    clarificationItems: '[]',
    // P9-G5-05
    submittedByOid: 'oid-1',
    completedByOid: '',
  };
}

describe('validateSchemaReadiness()', () => {
  it('reports ready for a complete item with all fields', () => {
    const result = validateSchemaReadiness(makeCompleteItem());

    expect(result.ready).toBe(true);
    expect(result.missing).toHaveLength(0);
    expect(result.present).toHaveLength(8);
    expect(result.warnings).toHaveLength(0);
  });

  it('reports not ready when system key (field_1) is missing', () => {
    const item = makeCompleteItem();
    delete item.field_1;
    const result = validateSchemaReadiness(item);

    expect(result.ready).toBe(false);
    expect(result.missing).toContain('field_1');
  });

  it('reports not ready when state (field_9) is missing', () => {
    const item = makeCompleteItem();
    delete item.field_9;
    const result = validateSchemaReadiness(item);

    expect(result.ready).toBe(false);
    expect(result.missing).toContain('field_9');
  });

  it('treats field with empty string value as present (schema exists)', () => {
    const item = makeCompleteItem();
    item.field_1 = '';
    const result = validateSchemaReadiness(item);

    // Empty string means the column exists in SP but has no value — schema is OK
    expect(result.ready).toBe(true);
    expect(result.present).toContain('field_1');
  });

  it('categorizes missing P2-07 fields as warnings, not missing', () => {
    const item: Record<string, unknown> = {
      field_1: 'id', field_2: '', field_3: 'Name', field_5: 'Type',
      field_7: 'user@hb.com', field_8: '', field_9: 'Submitted', field_10: '[]',
    };
    const result = validateSchemaReadiness(item);

    expect(result.ready).toBe(true);
    expect(result.missing).toHaveLength(0);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings.some((w) => w.includes('projectStreetAddress'))).toBe(true);
    expect(result.warnings.some((w) => w.includes('submittedByOid'))).toBe(true);
  });

  it('reports all 8 missing fields when item is completely empty', () => {
    const result = validateSchemaReadiness({});

    expect(result.ready).toBe(false);
    expect(result.missing).toHaveLength(8);
    expect(result.present).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Contract invariants
// ─────────────────────────────────────────────────────────────────────────────

describe('Contract invariants', () => {
  it('PROJECTS_LIST_SELECT_FIELDS count matches field map entry count', () => {
    const mapEntryCount = Object.keys(PROJECTS_LIST_FIELD_MAP).length;
    expect(PROJECTS_LIST_SELECT_FIELDS).toHaveLength(mapEntryCount);
  });

  it('no required field duplicates exist', () => {
    const unique = new Set(REQUIRED_PRODUCTION_FIELDS);
    expect(unique.size).toBe(REQUIRED_PRODUCTION_FIELDS.length);
  });

  it('no overlap between required and optional extension fields', () => {
    const requiredSet = new Set(REQUIRED_PRODUCTION_FIELDS as readonly string[]);
    for (const field of OPTIONAL_EXTENSION_FIELDS) {
      expect(requiredSet.has(field)).toBe(false);
    }
  });
});
