import { describe, expect, it } from 'vitest';

import {
  MIGRATION_SCOPE,
  PERMIT_FIELD_MAPPINGS,
  INSPECTION_VISIT_FIELD_MAPPINGS,
  DEFICIENCY_FIELD_MAPPINGS,
  CHECKPOINT_FIELD_MAPPINGS,
  PERMIT_STATUS_MAPPINGS,
  INSPECTION_VISIT_RESULT_MAPPINGS,
  REQUIRED_INSPECTION_RESULT_MAPPINGS,
  MIGRATION_DEFAULTS,
  MIGRATION_VALIDATION_CHECKLIST,
  IMPORT_IDEMPOTENCY_CHOICES,
  EVIDENCE_UPLOAD_CONFIG,
  VERSIONED_RECORD_FIELDS,
  FUTURE_INTEGRATION_POINTS,
} from '../../index.js';

describe('P3-E7-T07 contract stability', () => {
  it('MIGRATION_SCOPE is "permits/migration"', () => {
    expect(MIGRATION_SCOPE).toBe('permits/migration');
  });

  it('PERMIT_FIELD_MAPPINGS has 23 entries', () => {
    expect(PERMIT_FIELD_MAPPINGS).toHaveLength(23);
  });

  it('INSPECTION_VISIT_FIELD_MAPPINGS has 16 entries', () => {
    expect(INSPECTION_VISIT_FIELD_MAPPINGS).toHaveLength(16);
  });

  it('complianceScore is dropped in migration', () => {
    const scoreMapping = INSPECTION_VISIT_FIELD_MAPPINGS.find((m) => m.sourceField === 'complianceScore');
    expect(scoreMapping?.targetField).toBe('(dropped)');
  });

  it('DEFICIENCY_FIELD_MAPPINGS has 7 entries', () => {
    expect(DEFICIENCY_FIELD_MAPPINGS).toHaveLength(7);
  });

  it('CHECKPOINT_FIELD_MAPPINGS has 10 entries', () => {
    expect(CHECKPOINT_FIELD_MAPPINGS).toHaveLength(10);
  });

  it('PERMIT_STATUS_MAPPINGS has 5 entries', () => {
    expect(PERMIT_STATUS_MAPPINGS).toHaveLength(5);
    expect(PERMIT_STATUS_MAPPINGS.find((m) => m.oldStatus === 'pending')?.newStatus).toBe('ACTIVE');
  });

  it('INSPECTION_VISIT_RESULT_MAPPINGS has 4 entries', () => {
    expect(INSPECTION_VISIT_RESULT_MAPPINGS).toHaveLength(4);
  });

  it('REQUIRED_INSPECTION_RESULT_MAPPINGS has 4 entries', () => {
    expect(REQUIRED_INSPECTION_RESULT_MAPPINGS).toHaveLength(4);
  });

  it('MIGRATION_DEFAULTS has 8 entries', () => {
    expect(MIGRATION_DEFAULTS).toHaveLength(8);
    const threadDefault = MIGRATION_DEFAULTS.find((d) => d.field === 'threadRelationshipType');
    expect(threadDefault?.defaultValue).toBe('STANDALONE');
  });

  it('MIGRATION_VALIDATION_CHECKLIST has 8 items', () => {
    expect(MIGRATION_VALIDATION_CHECKLIST).toHaveLength(8);
  });

  it('MV-06 checks complianceScore absence', () => {
    const mv06 = MIGRATION_VALIDATION_CHECKLIST.find((c) => c.checkId === 'MV-06');
    expect(mv06?.description).toContain('complianceScore');
  });

  it('IMPORT_IDEMPOTENCY_CHOICES has 3 values', () => {
    expect(IMPORT_IDEMPOTENCY_CHOICES).toEqual(['Append', 'Replace', 'Cancel']);
  });

  it('EVIDENCE_UPLOAD_CONFIG max size is 50MB', () => {
    expect(EVIDENCE_UPLOAD_CONFIG.maxFileSizeBytes).toBe(50 * 1024 * 1024);
  });

  it('EVIDENCE_UPLOAD_CONFIG supports PDF', () => {
    expect(EVIDENCE_UPLOAD_CONFIG.supportedMimeTypes).toContain('application/pdf');
  });

  it('VERSIONED_RECORD_FIELDS has 8 entries', () => {
    expect(VERSIONED_RECORD_FIELDS).toHaveLength(8);
  });

  it('expirationDate is tracked for compliance', () => {
    const field = VERSIONED_RECORD_FIELDS.find((f) => f.fieldName === 'expirationDate');
    expect(field?.reason).toContain('compliance');
  });

  it('FUTURE_INTEGRATION_POINTS has 4 entries', () => {
    expect(FUTURE_INTEGRATION_POINTS).toHaveLength(4);
    expect(FUTURE_INTEGRATION_POINTS.every((p) => p.phase === 'Future')).toBe(true);
  });
});
