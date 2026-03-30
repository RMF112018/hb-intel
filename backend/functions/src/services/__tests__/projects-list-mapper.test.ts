/**
 * Contract tests for the centralized Projects list mapper.
 *
 * These tests prove:
 * - toDomain() correctly deserializes raw SP items to domain objects
 * - toListItem() correctly serializes domain objects to SP payloads
 * - resolveSpField() returns correct SP internal names
 * - safeParseJsonArray() handles edge cases
 * - Normalization rules from Phase-2_Normalization-Rules.md are enforced
 * - No field_N references leak back into the adapter
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import type { IProjectSetupRequest } from '@hbc/models';
import { toDomain, toListItem, resolveSpField, safeParseJsonArray, validateSpItem } from '../projects-list-mapper.js';
import { PROJECTS_LIST_FIELD_MAP, PROJECTS_LIST_SELECT_FIELDS } from '../projects-list-contract.js';
import type { ILogger } from '../../utils/logger.js';

// ─────────────────────────────────────────────────────────────────────────────
// Test fixtures
// ─────────────────────────────────────────────────────────────────────────────

function makeFullSpItem(): Record<string, unknown> {
  return {
    Title: '25-244-01 — Wellington Estate',
    field_1: 'proj-full',
    field_2: '25-244-01',
    field_3: 'Wellington Estate',
    field_4: 'Wellington, FL',
    field_5: 'Residential',
    field_6: 'Preconstruction',
    field_7: 'estimator@hedrickbrothers.com',
    field_8: '2026-03-15T12:00:00.000Z',
    field_9: 'Submitted',
    field_10: '["user1@hb.com","user2@hb.com"]',
    field_11: '["leader1@hb.com"]',
    field_12: 'commercial',
    field_13: 15000000,
    field_14: 'Sample Client',
    field_15: '2026-06-01',
    field_16: 'GMP',
    field_17: 'pm@hb.com',
    field_18: '["viewer1@hb.com"]',
    field_19: '["submittals","closeout"]',
    field_20: 'Budget needs detail',
    field_21: 'admin@hb.com',
    field_22: '2026-03-20T14:00:00.000Z',
    field_23: 'https://hedrickbrotherscom.sharepoint.com/sites/25-244-01',
    field_24: 2,
    Year: 2025,
  };
}

function makeFullDomainRequest(): IProjectSetupRequest {
  return {
    requestId: 'proj-full',
    projectId: 'proj-full',
    projectName: 'Wellington Estate',
    projectLocation: 'Wellington, FL',
    projectType: 'Residential',
    projectStage: 'Preconstruction',
    submittedBy: 'estimator@hedrickbrothers.com',
    submittedAt: '2026-03-15T12:00:00.000Z',
    state: 'Submitted',
    projectNumber: '25-244-01',
    groupMembers: ['user1@hb.com', 'user2@hb.com'],
    groupLeaders: ['leader1@hb.com'],
    department: 'commercial',
    estimatedValue: 15000000,
    clientName: 'Sample Client',
    startDate: '2026-06-01',
    contractType: 'GMP',
    projectLeadId: 'pm@hb.com',
    viewerUPNs: ['viewer1@hb.com'],
    addOns: ['submittals', 'closeout'],
    clarificationNote: 'Budget needs detail',
    completedBy: 'admin@hb.com',
    completedAt: '2026-03-20T14:00:00.000Z',
    siteUrl: 'https://hedrickbrotherscom.sharepoint.com/sites/25-244-01',
    retryCount: 2,
    year: 2025,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// toDomain() — SharePoint → Domain
// ─────────────────────────────────────────────────────────────────────────────

describe('toDomain() — SP item to domain object', () => {
  it('maps all 26 fields from a complete SP item', () => {
    const domain = toDomain(makeFullSpItem());

    expect(domain.requestId).toBe('proj-full');
    expect(domain.projectId).toBe('proj-full');
    expect(domain.projectName).toBe('Wellington Estate');
    expect(domain.projectLocation).toBe('Wellington, FL');
    expect(domain.projectType).toBe('Residential');
    expect(domain.projectStage).toBe('Preconstruction');
    expect(domain.submittedBy).toBe('estimator@hedrickbrothers.com');
    expect(domain.submittedAt).toBe('2026-03-15T12:00:00.000Z');
    expect(domain.state).toBe('Submitted');
    expect(domain.projectNumber).toBe('25-244-01');
    expect(domain.groupMembers).toEqual(['user1@hb.com', 'user2@hb.com']);
    expect(domain.groupLeaders).toEqual(['leader1@hb.com']);
    expect(domain.department).toBe('commercial');
    expect(domain.estimatedValue).toBe(15000000);
    expect(domain.clientName).toBe('Sample Client');
    expect(domain.startDate).toBe('2026-06-01');
    expect(domain.contractType).toBe('GMP');
    expect(domain.projectLeadId).toBe('pm@hb.com');
    expect(domain.viewerUPNs).toEqual(['viewer1@hb.com']);
    expect(domain.addOns).toEqual(['submittals', 'closeout']);
    expect(domain.clarificationNote).toBe('Budget needs detail');
    expect(domain.completedBy).toBe('admin@hb.com');
    expect(domain.completedAt).toBe('2026-03-20T14:00:00.000Z');
    expect(domain.siteUrl).toBe('https://hedrickbrotherscom.sharepoint.com/sites/25-244-01');
    expect(domain.retryCount).toBe(2);
    expect(domain.year).toBe(2025);
  });

  it('applies defaults for missing required fields', () => {
    const domain = toDomain({});

    expect(domain.requestId).toBe('');
    expect(domain.projectName).toBe('');
    expect(domain.projectLocation).toBe('');
    expect(domain.projectType).toBe('');
    expect(domain.projectStage).toBe('Pursuit'); // default
    expect(domain.submittedBy).toBe('');
    expect(domain.state).toBe('Submitted'); // default
    expect(domain.groupMembers).toEqual([]);
    expect(domain.retryCount).toBe(0); // default
  });

  it('returns undefined for missing optional fields', () => {
    const domain = toDomain({ field_1: 'id-1' });

    expect(domain.projectNumber).toBeUndefined();
    expect(domain.department).toBeUndefined();
    expect(domain.estimatedValue).toBeUndefined();
    expect(domain.clientName).toBeUndefined();
    expect(domain.startDate).toBeUndefined();
    expect(domain.contractType).toBeUndefined();
    expect(domain.projectLeadId).toBeUndefined();
    expect(domain.clarificationNote).toBeUndefined();
    expect(domain.completedBy).toBeUndefined();
    expect(domain.completedAt).toBeUndefined();
    expect(domain.siteUrl).toBeUndefined();
    expect(domain.year).toBeUndefined();
  });

  it('normalizes numeric 0 in string-typed Number columns to undefined', () => {
    const item = { ...makeFullSpItem(), field_20: 0, field_21: 0, field_22: 0 };
    const domain = toDomain(item);

    expect(domain.clarificationNote).toBeUndefined();
    expect(domain.completedBy).toBeUndefined();
    expect(domain.completedAt).toBeUndefined();
  });

  it('handles non-numeric estimatedValue gracefully', () => {
    const item = { ...makeFullSpItem(), field_13: 'not-a-number' };
    const domain = toDomain(item);
    expect(domain.estimatedValue).toBeUndefined();
  });

  it('handles non-numeric retryCount gracefully', () => {
    const item = { ...makeFullSpItem(), field_24: 'bad' };
    const domain = toDomain(item);
    expect(domain.retryCount).toBe(0);
  });

  it('handles non-numeric Year gracefully', () => {
    const item = { ...makeFullSpItem(), Year: 'bad' };
    const domain = toDomain(item);
    expect(domain.year).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// toListItem() — Domain → SharePoint
// ─────────────────────────────────────────────────────────────────────────────

describe('toListItem() — domain object to SP payload', () => {
  it('maps all domain properties to SP field_N names', () => {
    const payload = toListItem(makeFullDomainRequest());

    expect(payload.Title).toBe('25-244-01 — Wellington Estate');
    expect(payload.field_1).toBe('proj-full');
    expect(payload.field_2).toBe('25-244-01');
    expect(payload.field_3).toBe('Wellington Estate');
    expect(payload.field_4).toBe('Wellington, FL');
    expect(payload.field_5).toBe('Residential');
    expect(payload.field_6).toBe('Preconstruction');
    expect(payload.field_7).toBe('estimator@hedrickbrothers.com');
    expect(payload.field_8).toBe('2026-03-15T12:00:00.000Z');
    expect(payload.field_9).toBe('Submitted');
    expect(payload.field_12).toBe('commercial');
    expect(payload.field_13).toBe(15000000);
    expect(payload.field_14).toBe('Sample Client');
    expect(payload.field_15).toBe('2026-06-01');
    expect(payload.field_16).toBe('GMP');
    expect(payload.field_17).toBe('pm@hb.com');
    expect(payload.field_20).toBe('Budget needs detail');
    expect(payload.field_21).toBe('admin@hb.com');
    expect(payload.field_22).toBe('2026-03-20T14:00:00.000Z');
    expect(payload.field_23).toBe('https://hedrickbrotherscom.sharepoint.com/sites/25-244-01');
    expect(payload.field_24).toBe(2);
    expect(payload.Year).toBe(2025);
  });

  it('serializes arrays as JSON strings', () => {
    const payload = toListItem(makeFullDomainRequest());

    expect(payload.field_10).toBe('["user1@hb.com","user2@hb.com"]');
    expect(payload.field_11).toBe('["leader1@hb.com"]');
    expect(payload.field_18).toBe('["viewer1@hb.com"]');
    expect(payload.field_19).toBe('["submittals","closeout"]');
  });

  it('computes Title with TBD when projectNumber is missing', () => {
    const request = { ...makeFullDomainRequest(), projectNumber: undefined };
    const payload = toListItem(request);
    expect(payload.Title).toBe('TBD — Wellington Estate');
  });

  it('writes empty string for missing optional string fields', () => {
    const request = {
      ...makeFullDomainRequest(),
      department: undefined,
      clientName: undefined,
      contractType: undefined,
      projectLeadId: undefined,
      clarificationNote: undefined,
      completedBy: undefined,
      completedAt: undefined,
      siteUrl: undefined,
    } as unknown as IProjectSetupRequest;
    const payload = toListItem(request);

    expect(payload.field_12).toBe('');
    expect(payload.field_14).toBe('');
    expect(payload.field_16).toBe('');
    expect(payload.field_17).toBe('');
    expect(payload.field_20).toBe('');
    expect(payload.field_21).toBe('');
    expect(payload.field_22).toBe('');
    expect(payload.field_23).toBe('');
  });

  it('writes null for missing optional number fields', () => {
    const request = { ...makeFullDomainRequest(), estimatedValue: undefined, year: undefined };
    const payload = toListItem(request);
    expect(payload.field_13).toBeNull();
    expect(payload.Year).toBeNull();
  });

  it('writes empty JSON array for missing array fields', () => {
    const request = {
      ...makeFullDomainRequest(),
      groupLeaders: undefined,
      viewerUPNs: undefined,
      addOns: undefined,
    };
    const payload = toListItem(request);
    expect(payload.field_11).toBe('[]');
    expect(payload.field_18).toBe('[]');
    expect(payload.field_19).toBe('[]');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Round-trip — toDomain(toListItem(request)) preserves mapped fields
// ─────────────────────────────────────────────────────────────────────────────

describe('Round-trip: toListItem → toDomain preserves mapped fields', () => {
  it('full request survives round-trip', () => {
    const original = makeFullDomainRequest();
    const roundTripped = toDomain(toListItem(original) as unknown as Record<string, unknown>);

    expect(roundTripped.requestId).toBe(original.requestId);
    expect(roundTripped.projectId).toBe(original.projectId);
    expect(roundTripped.projectName).toBe(original.projectName);
    expect(roundTripped.projectLocation).toBe(original.projectLocation);
    expect(roundTripped.projectType).toBe(original.projectType);
    expect(roundTripped.projectStage).toBe(original.projectStage);
    expect(roundTripped.submittedBy).toBe(original.submittedBy);
    expect(roundTripped.submittedAt).toBe(original.submittedAt);
    expect(roundTripped.state).toBe(original.state);
    expect(roundTripped.projectNumber).toBe(original.projectNumber);
    expect(roundTripped.groupMembers).toEqual(original.groupMembers);
    expect(roundTripped.groupLeaders).toEqual(original.groupLeaders);
    expect(roundTripped.department).toBe(original.department);
    expect(roundTripped.estimatedValue).toBe(original.estimatedValue);
    expect(roundTripped.clientName).toBe(original.clientName);
    expect(roundTripped.startDate).toBe(original.startDate);
    expect(roundTripped.contractType).toBe(original.contractType);
    expect(roundTripped.projectLeadId).toBe(original.projectLeadId);
    expect(roundTripped.viewerUPNs).toEqual(original.viewerUPNs);
    expect(roundTripped.addOns).toEqual(original.addOns);
    expect(roundTripped.clarificationNote).toBe(original.clarificationNote);
    expect(roundTripped.completedBy).toBe(original.completedBy);
    expect(roundTripped.completedAt).toBe(original.completedAt);
    expect(roundTripped.siteUrl).toBe(original.siteUrl);
    expect(roundTripped.retryCount).toBe(original.retryCount);
    expect(roundTripped.year).toBe(original.year);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// resolveSpField()
// ─────────────────────────────────────────────────────────────────────────────

describe('resolveSpField()', () => {
  it('resolves requestId to field_1', () => {
    expect(resolveSpField('requestId')).toBe('field_1');
  });

  it('resolves state to field_9', () => {
    expect(resolveSpField('state')).toBe('field_9');
  });

  it('resolves year to Year (post-import column)', () => {
    expect(resolveSpField('year')).toBe('Year');
  });

  it('resolves every entry in the field map', () => {
    for (const [domainProp, entry] of Object.entries(PROJECTS_LIST_FIELD_MAP)) {
      expect(resolveSpField(domainProp as keyof typeof PROJECTS_LIST_FIELD_MAP)).toBe(entry.spInternalName);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// safeParseJsonArray()
// ─────────────────────────────────────────────────────────────────────────────

describe('safeParseJsonArray()', () => {
  it('parses valid JSON array', () => {
    expect(safeParseJsonArray('["a","b"]')).toEqual(['a', 'b']);
  });

  it('returns empty array for null', () => {
    expect(safeParseJsonArray(null)).toEqual([]);
  });

  it('returns empty array for undefined', () => {
    expect(safeParseJsonArray(undefined)).toEqual([]);
  });

  it('returns empty array for malformed JSON', () => {
    expect(safeParseJsonArray('not json')).toEqual([]);
  });

  it('returns empty array for non-array JSON', () => {
    expect(safeParseJsonArray('{"a":1}')).toEqual([]);
  });

  it('filters non-string elements', () => {
    expect(safeParseJsonArray('["a",123,null,"b"]')).toEqual(['a', 'b']);
  });

  it('returns empty array for empty string', () => {
    expect(safeParseJsonArray('')).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PROJECTS_LIST_SELECT_FIELDS contract
// ─────────────────────────────────────────────────────────────────────────────

describe('PROJECTS_LIST_SELECT_FIELDS', () => {
  it('contains exactly 26 field names (Title + 24 custom + Year)', () => {
    expect(PROJECTS_LIST_SELECT_FIELDS).toHaveLength(26);
  });

  it('includes Title and Year', () => {
    expect(PROJECTS_LIST_SELECT_FIELDS).toContain('Title');
    expect(PROJECTS_LIST_SELECT_FIELDS).toContain('Year');
  });

  it('includes all field_1 through field_24', () => {
    for (let i = 1; i <= 24; i++) {
      expect(PROJECTS_LIST_SELECT_FIELDS).toContain(`field_${i}`);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Regression guard — no field_N in adapter code (only in comments)
// ─────────────────────────────────────────────────────────────────────────────

describe('Regression guard — adapter has no inline field_N references', () => {
  it('project-requests-repository.ts has no field_N in executable code', () => {
    const adapterPath = path.resolve(__dirname, '..', 'project-requests-repository.ts');
    const content = fs.readFileSync(adapterPath, 'utf-8');

    // Strip comments (single-line and block) before checking
    const codeOnly = content
      .replace(/\/\*[\s\S]*?\*\//g, '') // block comments
      .replace(/\/\/.*$/gm, '');         // single-line comments

    expect(codeOnly).not.toMatch(/field_\d+/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// validateSpItem() — runtime diagnostics
// ─────────────────────────────────────────────────────────────────────────────

function createMockLogger(): ILogger & { warnings: string[] } {
  const warnings: string[] = [];
  return {
    warnings,
    info: () => {},
    warn: (msg: string) => { warnings.push(msg); },
    error: () => {},
    trackEvent: () => {},
    trackMetric: () => {},
  };
}

describe('validateSpItem() — schema drift detection', () => {
  it('returns no warnings for a complete item', () => {
    const warnings = validateSpItem(makeFullSpItem());
    expect(warnings).toHaveLength(0);
  });

  it('warns when field_1 (projectId) is missing', () => {
    const item = { ...makeFullSpItem() };
    delete item.field_1;
    const warnings = validateSpItem(item);
    expect(warnings).toContainEqual(expect.stringContaining("field_1"));
    expect(warnings).toContainEqual(expect.stringContaining("missing"));
  });

  it('warns when field_3 (projectName) is empty', () => {
    const warnings = validateSpItem({ ...makeFullSpItem(), field_3: '' });
    expect(warnings).toContainEqual(expect.stringContaining("field_3"));
  });

  it('warns when field_9 (state) is null', () => {
    const warnings = validateSpItem({ ...makeFullSpItem(), field_9: null });
    expect(warnings).toContainEqual(expect.stringContaining("field_9"));
  });

  it('warns on type mismatch for Number fields', () => {
    const warnings = validateSpItem({ ...makeFullSpItem(), field_13: 'not-a-number' });
    expect(warnings).toContainEqual(expect.stringContaining("field_13"));
    expect(warnings).toContainEqual(expect.stringContaining("expected number"));
  });

  it('does not warn when Number fields are null (valid for optional)', () => {
    const warnings = validateSpItem({ ...makeFullSpItem(), field_13: null, Year: null });
    expect(warnings).toHaveLength(0);
  });

  it('sends structured warnings to logger when provided', () => {
    const logger = createMockLogger();
    const item = { ...makeFullSpItem() };
    delete item.field_1;
    validateSpItem(item, logger);
    expect(logger.warnings.length).toBeGreaterThan(0);
    expect(logger.warnings[0]).toContain('field_1');
  });
});

describe('toDomain() with logger — diagnostic integration', () => {
  it('logs warnings for malformed items', () => {
    const logger = createMockLogger();
    toDomain({}, logger);
    // Should have warnings for missing field_1, field_3, field_9
    expect(logger.warnings.length).toBeGreaterThanOrEqual(3);
  });

  it('logs JSON parse failures with field context', () => {
    const logger = createMockLogger();
    toDomain({ ...makeFullSpItem(), field_10: 'not-json' }, logger);
    expect(logger.warnings).toContainEqual(expect.stringContaining('field_10'));
  });

  it('does not log warnings for a valid complete item', () => {
    const logger = createMockLogger();
    toDomain(makeFullSpItem(), logger);
    expect(logger.warnings).toHaveLength(0);
  });
});
