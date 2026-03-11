/**
 * mockRelationshipDirections — D-SF14-T08, D-06, D-10 (testing sub-path)
 *
 * All 6 canonical relationship directions and their reverse-pair mappings.
 * Useful for parameterized bidirectional registration tests.
 */
import type { RelationshipDirection } from '../src/types/index.js';

export const mockRelationshipDirections = {
  /** All 6 canonical direction strings. */
  forward: [
    'originated',
    'converted-to',
    'has',
    'references',
    'blocks',
    'is-blocked-by',
  ] as RelationshipDirection[],

  /** Bidirectional reverse-pair mapping. */
  reversePairs: {
    originated: 'converted-to',
    'converted-to': 'originated',
    has: 'references',
    references: 'has',
    blocks: 'is-blocked-by',
    'is-blocked-by': 'blocks',
  } as Record<RelationshipDirection, RelationshipDirection>,
} as const;
