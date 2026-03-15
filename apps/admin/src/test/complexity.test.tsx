/**
 * W0-G4-T08 Phase 4: Admin complexity gate tests (1 test).
 * Verifies @hbc/complexity exports G4-relevant components.
 */
import { describe, expect, it } from 'vitest';
import { HbcComplexityGate, ComplexityProvider, HbcComplexityDial } from '@hbc/complexity';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('Admin — complexity gate tests', () => {
  // G4-T06-008: @hbc/complexity exports G4-relevant components
  it('@hbc/complexity exports HbcComplexityGate, ComplexityProvider, and HbcComplexityDial', () => {
    expect(HbcComplexityGate).toBeDefined();
    expect(ComplexityProvider).toBeDefined();
    expect(HbcComplexityDial).toBeDefined();
  });
});
