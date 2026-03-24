import { describe, expect, it } from 'vitest';

import {
  COMMUNICATION_CADENCE_ADVISORIES,
  COMMUNICATION_CADENCE_TIERS,
  COMMUNICATION_DIRECTION_LABELS,
  COMMUNICATION_DIRECTIONS,
  COMMUNICATION_PROMPT_DEFINITIONS,
  COMMUNICATION_PROMPT_TRIGGERS,
  LAYER2_SEAM_CONTRACT_DEFINITIONS,
  LAYER2_SEAM_CONTRACTS_ENUM,
  NO_DUPLICATE_SOT_CONSTRAINTS,
  OWNER_STATUS_MAPPINGS,
  PHASE3_INTERNAL_CAPABILITIES,
} from '../../index.js';

describe('P3-E14-T10 Stage 5 owner-intake contract stability', () => {
  describe('enum arrays', () => {
    it('CommunicationDirection has 2', () => { expect(COMMUNICATION_DIRECTIONS).toHaveLength(2); });
    it('CommunicationPromptTrigger has 7', () => { expect(COMMUNICATION_PROMPT_TRIGGERS).toHaveLength(7); });
    it('Layer2SeamContract has 5', () => { expect(LAYER2_SEAM_CONTRACTS_ENUM).toHaveLength(5); });
    it('CommunicationCadenceTier has 2', () => { expect(COMMUNICATION_CADENCE_TIERS).toHaveLength(2); });
  });

  describe('label maps', () => {
    it('COMMUNICATION_DIRECTION_LABELS covers 2', () => { expect(Object.keys(COMMUNICATION_DIRECTION_LABELS)).toHaveLength(2); });
  });

  describe('definition arrays', () => {
    it('COMMUNICATION_PROMPT_DEFINITIONS has 7', () => { expect(COMMUNICATION_PROMPT_DEFINITIONS).toHaveLength(7); });
    it('OWNER_STATUS_MAPPINGS has 16 (all 16 case statuses)', () => { expect(OWNER_STATUS_MAPPINGS).toHaveLength(16); });
    it('COMMUNICATION_CADENCE_ADVISORIES has 2', () => { expect(COMMUNICATION_CADENCE_ADVISORIES).toHaveLength(2); });
    it('LAYER2_SEAM_CONTRACT_DEFINITIONS has 5', () => { expect(LAYER2_SEAM_CONTRACT_DEFINITIONS).toHaveLength(5); });
    it('PHASE3_INTERNAL_CAPABILITIES has 6', () => { expect(PHASE3_INTERNAL_CAPABILITIES).toHaveLength(6); });
    it('NO_DUPLICATE_SOT_CONSTRAINTS has 4', () => { expect(NO_DUPLICATE_SOT_CONSTRAINTS).toHaveLength(4); });
  });

  describe('cadence advisory values', () => {
    it('Expedited threshold is 3 days', () => {
      expect(COMMUNICATION_CADENCE_ADVISORIES.find((a) => a.tier === 'Expedited')?.thresholdDays).toBe(3);
    });
    it('Standard threshold is 7 days', () => {
      expect(COMMUNICATION_CADENCE_ADVISORIES.find((a) => a.tier === 'Standard')?.thresholdDays).toBe(7);
    });
  });

  describe('owner status mapping correctness', () => {
    it('Open maps to Under review', () => {
      expect(OWNER_STATUS_MAPPINGS.find((m) => m.internalStatus === 'Open')?.ownerFacingText).toBe('Under review');
    });
    it('Closed maps to Resolved and closed', () => {
      expect(OWNER_STATUS_MAPPINGS.find((m) => m.internalStatus === 'Closed')?.ownerFacingText).toBe('Resolved and closed');
    });
    it('AwaitingOwner maps to owner-action text', () => {
      expect(OWNER_STATUS_MAPPINGS.find((m) => m.internalStatus === 'AwaitingOwner')?.ownerFacingText).toContain('input or site access');
    });
  });
});
