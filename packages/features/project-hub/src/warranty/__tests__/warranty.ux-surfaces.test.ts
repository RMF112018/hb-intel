import { describe, expect, it } from 'vitest';

import {
  getWarrantyDefaultComplexityTier,
  getWarrantyNextMoveForCase,
  isWarrantyCanvasTileDataFromHealthSpine,
  isWarrantyHbiBehaviorAdvisoryOnly,
  isWarrantySystemViewImmutable,
} from '../../index.js';

describe('P3-E14-T10 Stage 7 ux-surfaces business rules', () => {
  describe('getWarrantyNextMoveForCase', () => {
    it('Open → coverage evaluation', () => { expect(getWarrantyNextMoveForCase('Open')?.action).toContain('coverage'); });
    it('Verified → resolution record', () => { expect(getWarrantyNextMoveForCase('Verified')?.action).toContain('resolution'); });
    it('Closed → undefined (terminal)', () => { expect(getWarrantyNextMoveForCase('Closed')).toBeUndefined(); });
    it('Voided → undefined (terminal)', () => { expect(getWarrantyNextMoveForCase('Voided')).toBeUndefined(); });
    it('Reopened → assess and assign', () => { expect(getWarrantyNextMoveForCase('Reopened')?.action).toContain('repeat repair'); });
  });

  describe('getWarrantyDefaultComplexityTier', () => {
    it('PM defaults to Standard', () => { expect(getWarrantyDefaultComplexityTier('PM')).toBe('Standard'); });
    it('PX defaults to Essential', () => { expect(getWarrantyDefaultComplexityTier('PX')).toBe('Essential'); });
    it('Admin defaults to Expert', () => { expect(getWarrantyDefaultComplexityTier('Admin')).toBe('Expert'); });
    it('Unknown role defaults to Standard', () => { expect(getWarrantyDefaultComplexityTier('UNKNOWN')).toBe('Standard'); });
  });

  describe('invariant guards', () => {
    it('system views are immutable', () => { expect(isWarrantySystemViewImmutable()).toBe(true); });
    it('canvas tile data from Health spine', () => { expect(isWarrantyCanvasTileDataFromHealthSpine()).toBe(true); });
    it('HBI behaviors are advisory only', () => { expect(isWarrantyHbiBehaviorAdvisoryOnly()).toBe(true); });
  });
});
