import { describe, expect, it } from 'vitest';

import {
  PERMITS_MODULE_SCOPE,
  PERMITS_FOUNDATION_SCOPE,
  PERMIT_THREAD_RELATIONSHIPS,
  DERIVED_HEALTH_TIERS,
  PERMIT_AUTHORITY_ROLES,
  PERMIT_RECORD_TYPES,
  PERMIT_AUTHORITY_ACTIONS,
  COMPLIANCE_HEALTH_SIGNAL_TYPES,
  PERMIT_AUTHORITY_MATRIX,
  PERMIT_IMMUTABLE_FIELD_DECLARATIONS,
  PERMIT_SHARED_PACKAGE_REQUIREMENTS,
  PERMIT_CROSS_CONTRACT_REFS,
  COMPLIANCE_HEALTH_SIGNALS,
  PERMIT_MODULE_LOCKED_DECISIONS,
  PERMIT_THREAD_RELATIONSHIP_LABELS,
  DERIVED_HEALTH_TIER_LABELS,
  PERMIT_RECORD_TYPE_LABELS,
} from '../../index.js';

describe('P3-E7-T01 contract stability', () => {
  it('PERMITS_MODULE_SCOPE is "permits"', () => {
    expect(PERMITS_MODULE_SCOPE).toBe('permits');
  });

  it('PERMITS_FOUNDATION_SCOPE is "permits/foundation"', () => {
    expect(PERMITS_FOUNDATION_SCOPE).toBe('permits/foundation');
  });

  it('locks PERMIT_THREAD_RELATIONSHIPS to exactly 7 values', () => {
    expect(PERMIT_THREAD_RELATIONSHIPS).toHaveLength(7);
    expect(PERMIT_THREAD_RELATIONSHIPS).toContain('THREAD_ROOT');
    expect(PERMIT_THREAD_RELATIONSHIPS).toContain('STANDALONE');
  });

  it('locks DERIVED_HEALTH_TIERS to exactly 4 values', () => {
    expect(DERIVED_HEALTH_TIERS).toEqual(['CRITICAL', 'AT_RISK', 'NORMAL', 'CLOSED']);
    expect(DERIVED_HEALTH_TIERS).toHaveLength(4);
  });

  it('locks PERMIT_AUTHORITY_ROLES to exactly 4 values', () => {
    expect(PERMIT_AUTHORITY_ROLES).toHaveLength(4);
  });

  it('locks PERMIT_RECORD_TYPES to exactly 7 values', () => {
    expect(PERMIT_RECORD_TYPES).toHaveLength(7);
  });

  it('locks PERMIT_AUTHORITY_ACTIONS to exactly 5 values', () => {
    expect(PERMIT_AUTHORITY_ACTIONS).toHaveLength(5);
  });

  it('locks COMPLIANCE_HEALTH_SIGNAL_TYPES to exactly 5 values', () => {
    expect(COMPLIANCE_HEALTH_SIGNAL_TYPES).toHaveLength(5);
  });

  it('PERMIT_AUTHORITY_MATRIX has 16 rules', () => {
    expect(PERMIT_AUTHORITY_MATRIX).toHaveLength(16);
  });

  it('Executive role has Annotate on IssuedPermit and InspectionVisit only', () => {
    const execAnnotate = PERMIT_AUTHORITY_MATRIX.filter(
      (r) => r.role === 'Executive' && r.allowedActions.includes('Annotate'),
    );
    expect(execAnnotate).toHaveLength(2);
    const recordTypes = execAnnotate.map((r) => r.recordType);
    expect(recordTypes).toContain('IssuedPermit');
    expect(recordTypes).toContain('InspectionVisit');
  });

  it('PERMIT_IMMUTABLE_FIELD_DECLARATIONS has IssuedPermit with 6 fields', () => {
    const issued = PERMIT_IMMUTABLE_FIELD_DECLARATIONS.find((d) => d.recordType === 'IssuedPermit');
    expect(issued?.fieldNames).toHaveLength(6);
  });

  it('PERMIT_SHARED_PACKAGE_REQUIREMENTS has exactly 6 entries', () => {
    expect(PERMIT_SHARED_PACKAGE_REQUIREMENTS).toHaveLength(6);
  });

  it('PERMIT_CROSS_CONTRACT_REFS has exactly 10 entries', () => {
    expect(PERMIT_CROSS_CONTRACT_REFS).toHaveLength(10);
  });

  it('COMPLIANCE_HEALTH_SIGNALS has exactly 5 entries', () => {
    expect(COMPLIANCE_HEALTH_SIGNALS).toHaveLength(5);
  });

  it('PERMIT_MODULE_LOCKED_DECISIONS has exactly 15 entries', () => {
    expect(PERMIT_MODULE_LOCKED_DECISIONS).toHaveLength(15);
  });

  it('no manual complianceScore in locked decisions (decision 9)', () => {
    const decision9 = PERMIT_MODULE_LOCKED_DECISIONS.find((d) => d.decisionId === 9);
    expect(decision9?.description).toContain('No manual complianceScore');
  });

  it('all label maps are complete', () => {
    for (const t of PERMIT_THREAD_RELATIONSHIPS) expect(PERMIT_THREAD_RELATIONSHIP_LABELS[t]).toBeTruthy();
    for (const h of DERIVED_HEALTH_TIERS) expect(DERIVED_HEALTH_TIER_LABELS[h]).toBeTruthy();
    for (const r of PERMIT_RECORD_TYPES) expect(PERMIT_RECORD_TYPE_LABELS[r]).toBeTruthy();
  });
});
