/**
 * W0-G4-T08 Phase 4: Admin complexity gate tests (1 test).
 * Verifies roleComplexityMap has G4-relevant entries.
 */
import { describe, expect, it } from 'vitest';
import { ROLE_COMPLEXITY_CONFIG } from '@hbc/complexity/src/config/roleComplexityMap.js';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('Admin — complexity gate tests', () => {
  // G4-T06-008: roleComplexityMap has G4 entries
  it('ROLE_COMPLEXITY_CONFIG has role mappings covering all three tiers', () => {
    expect(ROLE_COMPLEXITY_CONFIG).toBeDefined();
    expect(ROLE_COMPLEXITY_CONFIG.mappings).toBeDefined();
    expect(ROLE_COMPLEXITY_CONFIG.mappings.length).toBeGreaterThan(0);

    // Verify all three tiers are represented
    const tiers = new Set(ROLE_COMPLEXITY_CONFIG.mappings.map((m) => m.initialTier));
    expect(tiers.has('essential')).toBe(true);
    expect(tiers.has('standard')).toBe(true);
    expect(tiers.has('expert')).toBe(true);

    // Verify fallback tier is set
    expect(ROLE_COMPLEXITY_CONFIG.fallbackTier).toBeDefined();
  });
});
