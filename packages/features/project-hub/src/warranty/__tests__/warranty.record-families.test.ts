import { describe, expect, it } from 'vitest';

import {
  canWarrantyExtendSlaDeadline,
  canWarrantyReopenClosedCase,
  canWarrantyRolePerformAction,
  isWarrantyCaseStatusActive,
  isWarrantyCaseStatusTerminal,
  isWarrantyCoverageDecisionSupersede,
  isWarrantyResolutionRecordImmutable,
} from '../../index.js';

describe('P3-E14-T10 Stage 2 Warranty record-families business rules', () => {
  describe('canWarrantyRolePerformAction', () => {
    it('PM can create case', () => { expect(canWarrantyRolePerformAction('PM', 'CREATE_CASE')).toBe(true); });
    it('APM_PA can create case', () => { expect(canWarrantyRolePerformAction('APM_PA', 'CREATE_CASE')).toBe(true); });
    it('PX can create case', () => { expect(canWarrantyRolePerformAction('PX', 'CREATE_CASE')).toBe(true); });
    it('PM can make coverage decision', () => { expect(canWarrantyRolePerformAction('PM', 'MAKE_COVERAGE_DECISION')).toBe(true); });
    it('APM_PA cannot make coverage decision', () => { expect(canWarrantyRolePerformAction('APM_PA', 'MAKE_COVERAGE_DECISION')).toBe(false); });
    it('PER cannot create case', () => { expect(canWarrantyRolePerformAction('PER', 'CREATE_CASE')).toBe(false); });
    it('FINANCIAL_READER cannot create case', () => { expect(canWarrantyRolePerformAction('FINANCIAL_READER', 'CREATE_CASE')).toBe(false); });
    it('only PX can reopen closed case', () => { expect(canWarrantyRolePerformAction('PX', 'REOPEN_CLOSED_CASE')).toBe(true); });
    it('PM cannot reopen closed case', () => { expect(canWarrantyRolePerformAction('PM', 'REOPEN_CLOSED_CASE')).toBe(false); });
    it('only PX can extend SLA deadline', () => { expect(canWarrantyRolePerformAction('PX', 'EXTEND_SLA_DEADLINE')).toBe(true); });
    it('PM cannot extend SLA deadline', () => { expect(canWarrantyRolePerformAction('PM', 'EXTEND_SLA_DEADLINE')).toBe(false); });
  });

  describe('immutability guards', () => {
    it('resolution record is always immutable', () => { expect(isWarrantyResolutionRecordImmutable()).toBe(true); });
    it('coverage decision is always supersede', () => { expect(isWarrantyCoverageDecisionSupersede()).toBe(true); });
  });

  describe('PX-exclusive actions', () => {
    it('PX can reopen closed case', () => { expect(canWarrantyReopenClosedCase('PX')).toBe(true); });
    it('PM cannot reopen closed case', () => { expect(canWarrantyReopenClosedCase('PM')).toBe(false); });
    it('PX can extend SLA', () => { expect(canWarrantyExtendSlaDeadline('PX')).toBe(true); });
    it('PM cannot extend SLA', () => { expect(canWarrantyExtendSlaDeadline('PM')).toBe(false); });
  });

  describe('terminal case statuses', () => {
    it('Closed is terminal', () => { expect(isWarrantyCaseStatusTerminal('Closed')).toBe(true); });
    it('NotCovered is terminal', () => { expect(isWarrantyCaseStatusTerminal('NotCovered')).toBe(true); });
    it('Denied is terminal', () => { expect(isWarrantyCaseStatusTerminal('Denied')).toBe(true); });
    it('Duplicate is terminal', () => { expect(isWarrantyCaseStatusTerminal('Duplicate')).toBe(true); });
    it('Voided is terminal', () => { expect(isWarrantyCaseStatusTerminal('Voided')).toBe(true); });
    it('Open is active', () => { expect(isWarrantyCaseStatusActive('Open')).toBe(true); });
    it('InProgress is active', () => { expect(isWarrantyCaseStatusActive('InProgress')).toBe(true); });
    it('Reopened is active', () => { expect(isWarrantyCaseStatusActive('Reopened')).toBe(true); });
  });
});
