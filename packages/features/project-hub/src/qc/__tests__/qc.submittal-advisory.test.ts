import { describe, expect, it } from 'vitest';

import {
  canActivateWithoutAcceptableVerdict,
  canExtractionAutoAccept,
  canQcStoreSubmittalFiles,
  canSilentlyMutateApprovedBasis,
  doesLaterConflictCreateRecheckAdvisory,
  doesUnableToVerifyForceManualReview,
  isActivationTwoStage,
  isAdvisoryFormalSubmittalApproval,
  isCurrentnessOfficialSourceOnly,
  isInventoryAuthoritativeBeforeConfirmation,
  isOngoingWatchRequired,
  isPackageLinkRequired,
  isSpecAnchoringRequired,
  isVerdictAcceptableForActivation,
  shouldForceManualReview,
} from '../../index.js';

describe('QC submittal-advisory business rules', () => {
  // -- Boolean policy rules ---------------------------------------------------

  describe('policy rules', () => {
    it('isSpecAnchoringRequired returns true', () => {
      expect(isSpecAnchoringRequired()).toBe(true);
    });

    it('isPackageLinkRequired returns true', () => {
      expect(isPackageLinkRequired()).toBe(true);
    });

    it('isInventoryAuthoritativeBeforeConfirmation returns false', () => {
      expect(isInventoryAuthoritativeBeforeConfirmation()).toBe(false);
    });

    it('isCurrentnessOfficialSourceOnly returns true', () => {
      expect(isCurrentnessOfficialSourceOnly()).toBe(true);
    });

    it('doesUnableToVerifyForceManualReview returns true', () => {
      expect(doesUnableToVerifyForceManualReview()).toBe(true);
    });

    it('canActivateWithoutAcceptableVerdict returns false', () => {
      expect(canActivateWithoutAcceptableVerdict()).toBe(false);
    });

    it('canSilentlyMutateApprovedBasis returns false', () => {
      expect(canSilentlyMutateApprovedBasis()).toBe(false);
    });

    it('doesLaterConflictCreateRecheckAdvisory returns true', () => {
      expect(doesLaterConflictCreateRecheckAdvisory()).toBe(true);
    });

    it('isOngoingWatchRequired returns true', () => {
      expect(isOngoingWatchRequired()).toBe(true);
    });

    it('isAdvisoryFormalSubmittalApproval returns false', () => {
      expect(isAdvisoryFormalSubmittalApproval()).toBe(false);
    });

    it('canQcStoreSubmittalFiles returns false', () => {
      expect(canQcStoreSubmittalFiles()).toBe(false);
    });

    it('isActivationTwoStage returns true', () => {
      expect(isActivationTwoStage()).toBe(true);
    });

    it('canExtractionAutoAccept returns false', () => {
      expect(canExtractionAutoAccept()).toBe(false);
    });
  });

  // -- isVerdictAcceptableForActivation ---------------------------------------

  describe('isVerdictAcceptableForActivation', () => {
    it('COMPLETE + CURRENT + no manual review → true', () => {
      expect(isVerdictAcceptableForActivation('COMPLETE', 'CURRENT', false)).toBe(true);
    });

    it('INCOMPLETE + CURRENT + no manual review → false', () => {
      expect(isVerdictAcceptableForActivation('INCOMPLETE', 'CURRENT', false)).toBe(false);
    });

    it('COMPLETE + OUTDATED + no manual review → false', () => {
      expect(isVerdictAcceptableForActivation('COMPLETE', 'OUTDATED', false)).toBe(false);
    });

    it('COMPLETE + CURRENT + manual review required → false', () => {
      expect(isVerdictAcceptableForActivation('COMPLETE', 'CURRENT', true)).toBe(false);
    });

    it('COMPLETE_WITH_CONDITIONS + CURRENT + no manual review → true', () => {
      expect(isVerdictAcceptableForActivation('COMPLETE_WITH_CONDITIONS', 'CURRENT', false)).toBe(true);
    });

    it('COMPLETE + MIXED + no manual review → true', () => {
      expect(isVerdictAcceptableForActivation('COMPLETE', 'MIXED', false)).toBe(true);
    });

    it('COMPLETE + UNABLE_TO_VERIFY_ROLLUP + no manual review → false', () => {
      expect(isVerdictAcceptableForActivation('COMPLETE', 'UNABLE_TO_VERIFY_ROLLUP', false)).toBe(false);
    });
  });

  // -- shouldForceManualReview ------------------------------------------------

  describe('shouldForceManualReview', () => {
    it('empty reason codes → false', () => {
      expect(shouldForceManualReview([])).toBe(false);
    });

    it('single reason code → true', () => {
      expect(shouldForceManualReview(['NO_OFFICIAL_SOURCE'])).toBe(true);
    });

    it('multiple reason codes → true', () => {
      expect(shouldForceManualReview(['NO_OFFICIAL_SOURCE', 'INSUFFICIENT_METADATA'])).toBe(true);
    });
  });
});
