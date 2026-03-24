import { describe, expect, it } from 'vitest';

import {
  RECORDS_SCOPE,
  PERMIT_APPLICATION_STATUSES,
  ISSUED_PERMIT_STATUSES,
  CHECKPOINT_STATUSES,
  INSPECTION_VISIT_RESULTS,
  DEFICIENCY_SEVERITIES,
  DEFICIENCY_RESOLUTION_STATUSES,
  PERMIT_LIFECYCLE_ACTION_TYPES,
  PERMIT_EVIDENCE_TYPES,
  PERMIT_TYPES,
  EXPIRATION_RISK_TIERS,
  PERMIT_HEALTH_TIERS,
  PERMIT_ACCOUNTABLE_ROLES,
  REQUIRED_INSPECTION_RESULTS,
  SUBMISSION_METHODS,
  PARTY_TYPES,
  PERMIT_TYPE_LABELS,
  ISSUED_PERMIT_STATUS_LABELS,
  DEFICIENCY_SEVERITY_LABELS,
} from '../../index.js';

describe('P3-E7-T02 contract stability', () => {
  it('RECORDS_SCOPE is "permits/records"', () => {
    expect(RECORDS_SCOPE).toBe('permits/records');
  });

  it('locks PERMIT_APPLICATION_STATUSES to exactly 7 values', () => {
    expect(PERMIT_APPLICATION_STATUSES).toHaveLength(7);
  });

  it('locks ISSUED_PERMIT_STATUSES to exactly 12 values', () => {
    expect(ISSUED_PERMIT_STATUSES).toHaveLength(12);
  });

  it('locks CHECKPOINT_STATUSES to exactly 8 values', () => {
    expect(CHECKPOINT_STATUSES).toHaveLength(8);
  });

  it('locks INSPECTION_VISIT_RESULTS to exactly 7 values', () => {
    expect(INSPECTION_VISIT_RESULTS).toHaveLength(7);
  });

  it('locks DEFICIENCY_SEVERITIES to exactly 3 values', () => {
    expect(DEFICIENCY_SEVERITIES).toEqual(['HIGH', 'MEDIUM', 'LOW']);
  });

  it('locks DEFICIENCY_RESOLUTION_STATUSES to exactly 7 values', () => {
    expect(DEFICIENCY_RESOLUTION_STATUSES).toHaveLength(7);
  });

  it('locks PERMIT_LIFECYCLE_ACTION_TYPES to exactly 20 values', () => {
    expect(PERMIT_LIFECYCLE_ACTION_TYPES).toHaveLength(20);
  });

  it('locks PERMIT_EVIDENCE_TYPES to exactly 10 values', () => {
    expect(PERMIT_EVIDENCE_TYPES).toHaveLength(10);
  });

  it('locks PERMIT_TYPES to exactly 12 values', () => {
    expect(PERMIT_TYPES).toHaveLength(12);
  });

  it('locks EXPIRATION_RISK_TIERS to exactly 4 values', () => {
    expect(EXPIRATION_RISK_TIERS).toEqual(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']);
  });

  it('locks PERMIT_HEALTH_TIERS to exactly 4 values', () => {
    expect(PERMIT_HEALTH_TIERS).toEqual(['CRITICAL', 'AT_RISK', 'NORMAL', 'CLOSED']);
  });

  it('locks PERMIT_ACCOUNTABLE_ROLES to exactly 5 values', () => {
    expect(PERMIT_ACCOUNTABLE_ROLES).toHaveLength(5);
  });

  it('locks REQUIRED_INSPECTION_RESULTS to exactly 4 values', () => {
    expect(REQUIRED_INSPECTION_RESULTS).toEqual(['PASS', 'FAIL', 'NOT_APPLICABLE', 'PENDING']);
  });

  it('locks SUBMISSION_METHODS to exactly 4 values', () => {
    expect(SUBMISSION_METHODS).toEqual(['ONLINE', 'IN_PERSON', 'MAIL', 'PORTAL']);
  });

  it('locks PARTY_TYPES to exactly 4 values', () => {
    expect(PARTY_TYPES).toEqual(['USER', 'ORGANIZATION', 'SUBCONTRACTOR', 'JURISDICTION']);
  });

  it('PERMIT_TYPE_LABELS has labels for all 12 types', () => {
    for (const t of PERMIT_TYPES) expect(PERMIT_TYPE_LABELS[t]).toBeTruthy();
  });

  it('ISSUED_PERMIT_STATUS_LABELS has labels for all 12 statuses', () => {
    for (const s of ISSUED_PERMIT_STATUSES) expect(ISSUED_PERMIT_STATUS_LABELS[s]).toBeTruthy();
  });

  it('DEFICIENCY_SEVERITY_LABELS has labels for all 3 severities', () => {
    for (const s of DEFICIENCY_SEVERITIES) expect(DEFICIENCY_SEVERITY_LABELS[s]).toBeTruthy();
  });
});
