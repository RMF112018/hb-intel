import { describe, expect, it } from 'vitest';

import {
  CLASSIFICATION_DIMENSIONS,
  CLASSIFICATION_USAGE_CONTEXTS,
  CONFLICT_RESOLUTION_RULES,
  EXTERNAL_PARTICIPANT_WORKFLOWS,
  INTENT_OPERATION_TYPES,
  INTENT_RECORD_TYPES,
  VISIBILITY_HARD_RULES,
  VISIBILITY_POLICY_DIMENSIONS,
} from '../constants/index.js';

describe('P3-E5-T08 contract stability', () => {
  describe('§14 classification', () => {
    it('has 8 classification dimensions', () => { expect(CLASSIFICATION_DIMENSIONS).toHaveLength(8); });
    it('has 6 usage contexts', () => { expect(CLASSIFICATION_USAGE_CONTEXTS).toHaveLength(6); });
  });

  describe('§15 offline/sync', () => {
    it('has 4 intent operation types', () => { expect(INTENT_OPERATION_TYPES).toHaveLength(4); });
    it('has 7 offline-capable record types', () => { expect(INTENT_RECORD_TYPES).toHaveLength(7); });
    it('has 4 conflict resolution rules', () => { expect(CONFLICT_RESOLUTION_RULES).toHaveLength(4); });
  });

  describe('§16 visibility', () => {
    it('has 6 visibility policy dimensions', () => { expect(VISIBILITY_POLICY_DIMENSIONS).toHaveLength(6); });
    it('has 4 hard visibility rules', () => { expect(VISIBILITY_HARD_RULES).toHaveLength(4); });
    it('has 4 external participant workflows', () => { expect(EXTERNAL_PARTICIPANT_WORKFLOWS).toHaveLength(4); });
  });
});
