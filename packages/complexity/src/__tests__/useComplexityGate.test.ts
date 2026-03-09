import { describe, it, expect } from 'vitest';
import { evaluateGate } from '../hooks/useComplexityGate';

describe('evaluateGate (D-04)', () => {
  describe('minTier only', () => {
    it.each([
      ['essential', 'standard', false],
      ['standard', 'standard', true],
      ['expert', 'standard', true],
      ['essential', 'expert', false],
      ['standard', 'expert', false],
      ['expert', 'expert', true],
    ])('tier=%s, minTier=%s → %s', (tier, minTier, expected) => {
      expect(evaluateGate(tier as any, { minTier: minTier as any })).toBe(expected);
    });
  });

  describe('maxTier only', () => {
    it.each([
      ['essential', 'standard', true],
      ['standard', 'standard', true],
      ['expert', 'standard', false],
      ['essential', 'essential', true],
      ['standard', 'essential', false],
    ])('tier=%s, maxTier=%s → %s', (tier, maxTier, expected) => {
      expect(evaluateGate(tier as any, { maxTier: maxTier as any })).toBe(expected);
    });
  });

  describe('minTier + maxTier', () => {
    it.each([
      ['essential', 'standard', 'standard', false],
      ['standard', 'standard', 'standard', true],
      ['expert', 'standard', 'standard', false],
      ['essential', 'essential', 'essential', true],
      ['standard', 'essential', 'essential', false],
    ])('tier=%s, min=%s, max=%s → %s', (tier, min, max, expected) => {
      expect(evaluateGate(tier as any, { minTier: min as any, maxTier: max as any })).toBe(expected);
    });
  });

  describe('no condition', () => {
    it.each(['essential', 'standard', 'expert'] as const)(
      'always true at tier %s', (tier) => {
        expect(evaluateGate(tier, {})).toBe(true);
      }
    );
  });
});
