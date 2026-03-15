import { describe, expect, it } from 'vitest';
import {
  PROJECT_SETUP_STATUS_LABELS,
  DEPARTMENT_DISPLAY_LABELS,
  URGENCY_INDICATOR_MAP,
  PROJECT_SETUP_SUMMARY_FIELDS,
  CORE_SUMMARY_FIELD_IDS,
  REQUEST_STATE_KEBAB_MAP,
} from './summary-field-registry.js';

// ─── PROJECT_SETUP_STATUS_LABELS ─────────────────────────────────────────────

describe('PROJECT_SETUP_STATUS_LABELS', () => {
  it('maps all 8 states to human-readable strings', () => {
    const states = [
      'Submitted',
      'UnderReview',
      'NeedsClarification',
      'AwaitingExternalSetup',
      'ReadyToProvision',
      'Provisioning',
      'Completed',
      'Failed',
    ] as const;

    for (const state of states) {
      expect(PROJECT_SETUP_STATUS_LABELS[state]).toBeDefined();
      expect(typeof PROJECT_SETUP_STATUS_LABELS[state]).toBe('string');
      expect(PROJECT_SETUP_STATUS_LABELS[state].length).toBeGreaterThan(0);
    }
  });

  it('has exactly 8 entries', () => {
    expect(Object.keys(PROJECT_SETUP_STATUS_LABELS)).toHaveLength(8);
  });
});

// ─── DEPARTMENT_DISPLAY_LABELS ───────────────────────────────────────────────

describe('DEPARTMENT_DISPLAY_LABELS', () => {
  it('maps both departments', () => {
    expect(DEPARTMENT_DISPLAY_LABELS['commercial']).toBe('Commercial');
    expect(DEPARTMENT_DISPLAY_LABELS['luxury-residential']).toBe('Luxury Residential');
  });

  it('has exactly 2 entries', () => {
    expect(Object.keys(DEPARTMENT_DISPLAY_LABELS)).toHaveLength(2);
  });
});

// ─── URGENCY_INDICATOR_MAP ───────────────────────────────────────────────────

describe('URGENCY_INDICATOR_MAP', () => {
  it('has entries for all 3 urgency tiers', () => {
    expect(URGENCY_INDICATOR_MAP.immediate).toEqual({ label: 'Immediate', color: 'red' });
    expect(URGENCY_INDICATOR_MAP.watch).toEqual({ label: 'Watch', color: 'yellow' });
    expect(URGENCY_INDICATOR_MAP.upcoming).toEqual({ label: 'Upcoming', color: 'green' });
  });

  it('has exactly 3 entries', () => {
    expect(Object.keys(URGENCY_INDICATOR_MAP)).toHaveLength(3);
  });
});

// ─── PROJECT_SETUP_SUMMARY_FIELDS ────────────────────────────────────────────

describe('PROJECT_SETUP_SUMMARY_FIELDS', () => {
  it('contains exactly 19 entries', () => {
    expect(PROJECT_SETUP_SUMMARY_FIELDS).toHaveLength(19);
  });

  it('has 9 core fields (no minTier)', () => {
    const coreFields = PROJECT_SETUP_SUMMARY_FIELDS.filter((f) => !f.minTier);
    expect(coreFields).toHaveLength(9);
  });

  it('has 8 standard-gated fields', () => {
    const standardFields = PROJECT_SETUP_SUMMARY_FIELDS.filter((f) => f.minTier === 'standard');
    expect(standardFields).toHaveLength(8);
  });

  it('has 2 expert-gated fields', () => {
    const expertFields = PROJECT_SETUP_SUMMARY_FIELDS.filter((f) => f.minTier === 'expert');
    expect(expertFields).toHaveLength(2);
  });

  it('every field has a unique fieldId', () => {
    const ids = PROJECT_SETUP_SUMMARY_FIELDS.map((f) => f.fieldId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every field has a non-empty label and sourcePath', () => {
    for (const field of PROJECT_SETUP_SUMMARY_FIELDS) {
      expect(field.label.length).toBeGreaterThan(0);
      expect(field.sourcePath.length).toBeGreaterThan(0);
    }
  });
});

// ─── CORE_SUMMARY_FIELD_IDS ──────────────────────────────────────────────────

describe('CORE_SUMMARY_FIELD_IDS', () => {
  it('contains the 9 ungated field IDs', () => {
    expect(CORE_SUMMARY_FIELD_IDS).toHaveLength(9);
    expect(CORE_SUMMARY_FIELD_IDS).toContain('projectName');
    expect(CORE_SUMMARY_FIELD_IDS).toContain('department');
    expect(CORE_SUMMARY_FIELD_IDS).toContain('statusLabel');
    expect(CORE_SUMMARY_FIELD_IDS).toContain('currentOwner');
    expect(CORE_SUMMARY_FIELD_IDS).toContain('expectedAction');
    expect(CORE_SUMMARY_FIELD_IDS).toContain('submittedAt');
    expect(CORE_SUMMARY_FIELD_IDS).toContain('urgencyTier');
    expect(CORE_SUMMARY_FIELD_IDS).toContain('siteUrl');
    expect(CORE_SUMMARY_FIELD_IDS).toContain('bicBadge');
  });

  it('does not contain gated fields', () => {
    expect(CORE_SUMMARY_FIELD_IDS).not.toContain('bicDetail');
    expect(CORE_SUMMARY_FIELD_IDS).not.toContain('entraGroupIds');
  });
});

// ─── REQUEST_STATE_KEBAB_MAP ────────────────────────────────────────────────

describe('REQUEST_STATE_KEBAB_MAP', () => {
  it('has exactly 8 entries matching all states', () => {
    expect(Object.keys(REQUEST_STATE_KEBAB_MAP)).toHaveLength(8);
  });

  it('maps every state to a non-empty kebab-case string', () => {
    for (const value of Object.values(REQUEST_STATE_KEBAB_MAP)) {
      expect(typeof value).toBe('string');
      expect(value.length).toBeGreaterThan(0);
    }
  });

  it('covers the same keys as PROJECT_SETUP_STATUS_LABELS', () => {
    expect(Object.keys(REQUEST_STATE_KEBAB_MAP).sort()).toEqual(
      Object.keys(PROJECT_SETUP_STATUS_LABELS).sort(),
    );
  });

  it('maps NeedsClarification to clarification-needed (G5 parity)', () => {
    expect(REQUEST_STATE_KEBAB_MAP.NeedsClarification).toBe('clarification-needed');
  });
});
