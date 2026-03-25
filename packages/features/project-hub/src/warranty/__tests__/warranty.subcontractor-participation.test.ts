import { describe, expect, it } from 'vitest';

import {
  canLayer2CreateParallelSubStore,
  isBackChargeAdvisoryReadOnly,
  isDisputeRationaleRequired,
  isResolutionRecordImmutableT06,
  isSubEntryPmProxyOnly,
  isValidAcknowledgmentTransition,
  isVerificationRequiredForCorrected,
} from '../../index.js';

describe('P3-E14-T10 Stage 6 subcontractor-participation business rules', () => {
  describe('isSubEntryPmProxyOnly', () => {
    it('always returns true', () => { expect(isSubEntryPmProxyOnly()).toBe(true); });
  });

  describe('isValidAcknowledgmentTransition', () => {
    it('null → Pending is valid', () => { expect(isValidAcknowledgmentTransition(null, 'Pending')).toBe(true); });
    it('Pending → Acknowledged is valid', () => { expect(isValidAcknowledgmentTransition('Pending', 'Acknowledged')).toBe(true); });
    it('Acknowledged → ScopeAccepted is valid', () => { expect(isValidAcknowledgmentTransition('Acknowledged', 'ScopeAccepted')).toBe(true); });
    it('Acknowledged → ScopeDisputed is valid', () => { expect(isValidAcknowledgmentTransition('Acknowledged', 'ScopeDisputed')).toBe(true); });
    it('ScopeDisputed → DisputeResolved is valid', () => { expect(isValidAcknowledgmentTransition('ScopeDisputed', 'DisputeResolved')).toBe(true); });
    it('Pending → ScopeAccepted is invalid', () => { expect(isValidAcknowledgmentTransition('Pending', 'ScopeAccepted')).toBe(false); });
    it('ScopeAccepted → Pending is invalid', () => { expect(isValidAcknowledgmentTransition('ScopeAccepted', 'Pending')).toBe(false); });
  });

  describe('isDisputeRationaleRequired', () => {
    it('true for ScopeDisputed', () => { expect(isDisputeRationaleRequired('ScopeDisputed')).toBe(true); });
    it('false for ScopeAccepted', () => { expect(isDisputeRationaleRequired('ScopeAccepted')).toBe(false); });
    it('false for Pending', () => { expect(isDisputeRationaleRequired('Pending')).toBe(false); });
  });

  describe('immutability and boundary guards', () => {
    it('resolution record is immutable', () => { expect(isResolutionRecordImmutableT06()).toBe(true); });
    it('verification required for Corrected', () => { expect(isVerificationRequiredForCorrected()).toBe(true); });
    it('back-charge advisory is read-only', () => { expect(isBackChargeAdvisoryReadOnly()).toBe(true); });
    it('Layer 2 cannot create parallel sub store', () => { expect(canLayer2CreateParallelSubStore()).toBe(false); });
  });
});
