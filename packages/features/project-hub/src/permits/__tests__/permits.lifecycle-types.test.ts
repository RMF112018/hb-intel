import { describe, expect, it } from 'vitest';

import {
  LIFECYCLE_SCOPE,
  VALID_APPLICATION_TRANSITIONS,
  TERMINAL_APPLICATION_STATUSES,
  LIFECYCLE_ACTION_TRANSITION_TABLE,
  TERMINAL_ISSUED_PERMIT_STATUSES,
  NOTES_REQUIRED_ACTION_TYPES,
  ACK_REQUIRED_ACTION_TYPES,
  SYSTEM_DRIVEN_TRANSITIONS,
  APPLICATION_EDIT_RULES,
  APPLICATION_REQUIRED_FIELDS,
} from '../../index.js';

describe('P3-E7-T03 contract stability', () => {
  it('LIFECYCLE_SCOPE is "permits/lifecycle"', () => {
    expect(LIFECYCLE_SCOPE).toBe('permits/lifecycle');
  });

  it('VALID_APPLICATION_TRANSITIONS has 7 rules', () => {
    expect(VALID_APPLICATION_TRANSITIONS).toHaveLength(7);
  });

  it('TERMINAL_APPLICATION_STATUSES has exactly 3', () => {
    expect(TERMINAL_APPLICATION_STATUSES).toEqual(['APPROVED', 'REJECTED', 'WITHDRAWN']);
  });

  it('LIFECYCLE_ACTION_TRANSITION_TABLE has exactly 20 rules', () => {
    expect(LIFECYCLE_ACTION_TRANSITION_TABLE).toHaveLength(20);
  });

  it('TERMINAL_ISSUED_PERMIT_STATUSES has exactly 3', () => {
    expect(TERMINAL_ISSUED_PERMIT_STATUSES).toEqual(['EXPIRED', 'REVOKED', 'CLOSED']);
  });

  it('NOTES_REQUIRED_ACTION_TYPES includes STOP_WORK_ISSUED', () => {
    expect(NOTES_REQUIRED_ACTION_TYPES).toContain('STOP_WORK_ISSUED');
  });

  it('ACK_REQUIRED_ACTION_TYPES includes STOP_WORK_ISSUED', () => {
    expect(ACK_REQUIRED_ACTION_TYPES).toContain('STOP_WORK_ISSUED');
  });

  it('SYSTEM_DRIVEN_TRANSITIONS has exactly 3', () => {
    expect(SYSTEM_DRIVEN_TRANSITIONS).toHaveLength(3);
  });

  it('APPLICATION_EDIT_RULES has 7 rules (one per status)', () => {
    expect(APPLICATION_EDIT_RULES).toHaveLength(7);
  });

  it('APPLICATION_REQUIRED_FIELDS has entries for SUBMITTED, APPROVED, REJECTED', () => {
    expect(APPLICATION_REQUIRED_FIELDS['SUBMITTED']).toBeTruthy();
    expect(APPLICATION_REQUIRED_FIELDS['APPROVED']).toBeTruthy();
    expect(APPLICATION_REQUIRED_FIELDS['REJECTED']).toBeTruthy();
  });

  it('REJECTED requires rejectionReason', () => {
    expect(APPLICATION_REQUIRED_FIELDS['REJECTED']).toContain('rejectionReason');
  });

  it('CLOSED action requires previousStatus ACTIVE', () => {
    const closedRule = LIFECYCLE_ACTION_TRANSITION_TABLE.find((r) => r.actionType === 'CLOSED');
    expect(closedRule?.previousStatus).toBe('ACTIVE');
  });

  it('RENEWAL_APPROVED requires previousStatus RENEWAL_IN_PROGRESS', () => {
    const rule = LIFECYCLE_ACTION_TRANSITION_TABLE.find((r) => r.actionType === 'RENEWAL_APPROVED');
    expect(rule?.previousStatus).toBe('RENEWAL_IN_PROGRESS');
    expect(rule?.newStatus).toBe('RENEWED');
  });
});
